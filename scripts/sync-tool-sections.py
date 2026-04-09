#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

import yaml


TOOL_SECTION_HEADING = "## External Data & Tool Use"
DELIVERABLES_HEADING = "## 📋 Your Technical Deliverables"


def load_registry(path: Path) -> dict[str, Any]:
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {}


def should_skip(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return False
    parts = text.split("\n---\n", 1)
    if len(parts) != 2:
        return False
    frontmatter = yaml.safe_load(parts[0].split("\n", 1)[1]) or {}
    return bool(frontmatter.get("utility")) or str(frontmatter.get("agent_type", "")).strip() == "orchestrator"


def build_section(agent_name: str, tool_opportunities: list[dict[str, Any]]) -> str:
    lines = [
        TOOL_SECTION_HEADING,
        "",
        f"This section describes external capabilities that improve {agent_name.lower()} work when they are available. Your core sections are complete and self-sufficient without tools.",
        "",
        "### Detecting Capability Availability",
        "",
        "Before recommending a tool-based action, determine whether the capability is accessible in your current environment. If unclear, ask. Do not assume availability. Do not fabricate tool outputs.",
        "",
        "### When To Recommend A Lookup",
        "",
        "| Situation | Capability needed | Why |",
        "|-----------|------------------|-----|",
    ]
    for item in tool_opportunities:
        trigger = str(item.get("trigger", "")).strip()
        capability_class = str(item.get("capability_class", "")).strip()
        materiality = str(item.get("materiality", "")).strip()
        if trigger and capability_class and materiality:
            lines.append(f"| {trigger} | `{capability_class}` | {materiality} |")
    lines.extend(
        [
            "",
            "### Conditional Workflow Pattern",
            "",
            "Act on what you know, and flag where a lookup would add value:",
            "",
            '> "Based on the documentation, [analysis]. If you have access to [capability], I\'d recommend verifying [specific fact] because [specific reason for this task]."',
            "",
            "### Locality Rule",
            "",
            "If review or calibration finds a missed lookup opportunity inside a specific workflow step, add the conditional hook there as well. Keep the generic guidance above and the workflow-level hook close together.",
            "",
        ]
    )
    return "\n".join(lines)


def sync_file(path: Path, agent_entry: dict[str, Any]) -> bool:
    if should_skip(path):
        return False

    text = path.read_text(encoding="utf-8")
    if TOOL_SECTION_HEADING in text:
        return False
    if DELIVERABLES_HEADING not in text:
        raise SystemExit(f"{path}: missing {DELIVERABLES_HEADING!r}")

    tool_opportunities = agent_entry.get("tool_opportunities") or []
    if not isinstance(tool_opportunities, list) or not tool_opportunities:
        return False

    section = build_section(str(agent_entry.get("name", path.stem.replace("-", " "))), tool_opportunities)
    updated = text.replace(DELIVERABLES_HEADING, section + "\n" + DELIVERABLES_HEADING, 1)
    path.write_text(updated, encoding="utf-8")
    return True


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--registry", default="registry.yaml")
    parser.add_argument("paths", nargs="+")
    args = parser.parse_args()

    registry = load_registry(Path(args.registry))
    agent_by_slug = {agent["slug"]: agent for agent in registry.get("agents", [])}
    changed = 0
    for raw in args.paths:
        path = Path(raw)
        slug = path.stem if path.suffix == ".md" else raw
        file_path = path if path.suffix == ".md" else Path("agents") / f"{slug}.md"
        if should_skip(file_path):
            print(f"{file_path}: ok")
            continue
        if slug not in agent_by_slug:
            raise SystemExit(f"registry entry not found for {slug}")
        if sync_file(file_path, agent_by_slug[slug]):
            changed += 1
            print(f"{file_path}: inserted tool section")
        else:
            print(f"{file_path}: ok")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
