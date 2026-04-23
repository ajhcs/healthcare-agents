#!/usr/bin/env python3
"""Heuristic quality audit for healthcare agent prompts.

This is intentionally lightweight. It scores each agent against the repo's
contribution standards using four signals:
1. required section coverage
2. target length range
3. domain citation density
4. template/deliverable richness
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import asdict, dataclass
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
AGENTS_DIR = REPO_ROOT / "agents"

REQUIRED_SECTIONS = [
    "## 🧠 Your Identity & Memory",
    "## 🎯 Your Core Mission",
    "## 🚨 Critical Rules You Must Follow",
    "## 📋 Your Technical Deliverables",
    "## 🔄 Your Workflow",
    "## 💬 Your Communication Style",
    "## 🎯 Your Success Metrics",
    "## 🚀 Advanced Capabilities",
    "## 🔄 Learning & Memory",
]

CITATION_RE = re.compile(
    r"("
    r"\b\d{2}\s*CFR\b|"
    r"\b\d{2}\s*U\.?S\.?C\.?\b|"
    r"\bIRC\s+Section\s+\d+[A-Za-z()]*\b|"
    r"\b501\(r\)\b|"
    r"\bSchedule H\b|"
    r"\bACA\b|"
    r"\bCHNA\b|"
    r"\bCHW\b|"
    r"\bCMS-\d{3,5}[A-Z-]*\b|"
    r"\bICD-10(?:-CM|-PCS)?\b|"
    r"\bCPT\b|"
    r"\bHCPCS\b|"
    r"\bMS-DRG\b|"
    r"\bAPR-DRG\b|"
    r"\bHCC\b|"
    r"\bRAF\b|"
    r"\bNCCI\b|"
    r"\bHEDIS\b|"
    r"\bMIPS\b|"
    r"\bNHSN\b|"
    r"\bJoint Commission\b|"
    r"\bNCQA\b|"
    r"\bAHRQ\b|"
    r"\bASHRM\b|"
    r"\bPSO\b|"
    r"\bHCAHPS\b|"
    r"\bCAHPS\b|"
    r"\bPress Ganey\b|"
    r"\bCOSO\b|"
    r"\bISO\s+31000\b|"
    r"\bFMEA\b|"
    r"\bHFMEA\b|"
    r"\bUSP\s*(?:797|800)\b|"
    r"\bOIG Work Plan\b|"
    r"\bPECOS\b|"
    r"\bCAQH\b|"
    r"\bOPPS\b|"
    r"\bPDGM\b|"
    r"\bPDPM\b|"
    r"\bTEFCA\b|"
    r"\bUSCDI\b|"
    r"\bHL7\b|"
    r"\bFHIR\b|"
    r"\bX12\b|"
    r"\bC-?CDA\b|"
    r"\b340B\b|"
    r"\bHRSA\b|"
    r"\bACO REACH\b|"
    r"\bMSSP\b|"
    r"\bOASIS\b|"
    r"\bMDS\b|"
    r"\bFive-Star\b|"
    r"\bSHIP\b|"
    r"\bLIS\b|"
    r"\bQMB\b|"
    r"\bSLMB\b|"
    r"\bQI\b|"
    r"\bMedigap\b|"
    r"\bHart-Scott-Rodino\b|"
    r"\bHSR\b|"
    r"\bFTC\b|"
    r"\bDOJ\b|"
    r"\bStark Law\b|"
    r"\bAnti-Kickback Statute\b"
    r")",
    re.IGNORECASE,
)
PLACEHOLDER_RE = re.compile(r"\[[^\n\]]{2,80}\]")

TEMPLATE_TOKENS = [
    "Template",
    "Checklist",
    "Assessment",
    "Dashboard",
    "Scorecard",
    "Report",
    "Plan",
    "Tracker",
    "Roadmap",
    "Register",
    "Charter",
]


@dataclass
class AuditRow:
    name: str
    total: float
    lines: int
    sections: int
    citations: int
    template_signals: float


def score_length(line_count: int) -> float:
    # Full score near the target range, softer decay at the edges.
    return max(0.0, 1.0 - abs(line_count - 500) / 250.0) * 20.0


def audit_file(path: Path) -> AuditRow:
    text = path.read_text()
    line_count = len(text.splitlines())
    sections = sum(1 for section in REQUIRED_SECTIONS if section in text)
    citations = len(CITATION_RE.findall(text))
    placeholders = len(PLACEHOLDER_RE.findall(text))
    code_blocks = text.count("```") // 2
    deliverable_markers = sum(text.count(token) for token in TEMPLATE_TOKENS)

    structure_score = sections / len(REQUIRED_SECTIONS) * 30.0
    length_score = score_length(line_count)
    citation_score = min(citations, 20) / 20.0 * 30.0
    template_signal = min(placeholders + code_blocks * 2 + deliverable_markers / 4.0, 20.0)
    template_score = template_signal / 20.0 * 20.0

    return AuditRow(
        name=path.name,
        total=round(structure_score + length_score + citation_score + template_score, 1),
        lines=line_count,
        sections=sections,
        citations=citations,
        template_signals=round(template_signal, 1),
    )


def render(rows: list[AuditRow], top: int) -> str:
    header = "score  lines  sect  cites  templ  file"
    rule = "-" * len(header)
    lowest = rows[:top]
    highest = rows[-top:] if top < len(rows) else rows
    parts = ["LOWEST", header, rule]
    parts.extend(
        f"{row.total:>5.1f}  {row.lines:>5}  {row.sections:>4}  {row.citations:>5}  {row.template_signals:>5}  {row.name}"
        for row in lowest
    )
    parts.extend(["", "HIGHEST", header, rule])
    parts.extend(
        f"{row.total:>5.1f}  {row.lines:>5}  {row.sections:>4}  {row.citations:>5}  {row.template_signals:>5}  {row.name}"
        for row in highest
    )
    return "\n".join(parts)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--top", type=int, default=10, help="rows to show from each end")
    parser.add_argument("--json", action="store_true", help="emit machine-readable JSON")
    args = parser.parse_args()

    rows = []
    for path in sorted(AGENTS_DIR.glob("*.md")):
        rows.append(audit_file(path))
    rows.sort(key=lambda row: row.total)

    if args.json:
        print(json.dumps([asdict(row) for row in rows], indent=2))
        return

    print(render(rows, args.top))


if __name__ == "__main__":
    main()
