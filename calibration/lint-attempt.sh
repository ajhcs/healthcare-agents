#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: calibration/lint-attempt.sh --agent-file PATH --seed-file PATH --attempt-file PATH [--output PATH]

Runs the deterministic Stage 2 lint for a generated deliverable and emits a YAML
lint-result artifact matching the calibration schema.
EOF
}

AGENT_FILE=""
SEED_FILE=""
ATTEMPT_FILE=""
OUTPUT_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --agent-file) AGENT_FILE="$2"; shift 2 ;;
    --seed-file) SEED_FILE="$2"; shift 2 ;;
    --attempt-file) ATTEMPT_FILE="$2"; shift 2 ;;
    --output) OUTPUT_FILE="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 1 ;;
  esac
done

if [[ -z "$AGENT_FILE" || -z "$SEED_FILE" || -z "$ATTEMPT_FILE" ]]; then
  usage >&2
  exit 1
fi

RESULT="$(
python3 - "$AGENT_FILE" "$SEED_FILE" "$ATTEMPT_FILE" <<'PY'
from __future__ import annotations

import re
import sys
from datetime import datetime, UTC
from pathlib import Path

import yaml


agent_file = Path(sys.argv[1])
seed_file = Path(sys.argv[2])
attempt_file = Path(sys.argv[3])

seed = yaml.safe_load(seed_file.read_text(encoding="utf-8"))
attempt_text = attempt_file.read_text(encoding="utf-8")
agent_text = agent_file.read_text(encoding="utf-8")

deliverable_title = seed["deliverable_title"]

marker = f"<!-- deliverable: {deliverable_title} -->"
start = agent_text.find(marker)
if start == -1:
    raise SystemExit(f"missing deliverable marker for {deliverable_title!r} in {agent_file}")
end = len(agent_text)
next_marker = agent_text.find("<!-- deliverable:", start + len(marker))
next_section = agent_text.find("\n## ", start + len(marker))
candidates = [value for value in [next_marker, next_section] if value != -1]
if candidates:
    end = min(candidates)
block = agent_text[start:end]

fence_match = re.search(r"```markdown\n(.*?)```", block, re.S)
template_text = fence_match.group(1) if fence_match else block
expected_sections = re.findall(r"^##\s+(.+)$", template_text, re.M)
present_sections = set(re.findall(r"^##\s+(.+)$", attempt_text, re.M))
missing_sections = [section for section in expected_sections if section not in present_sections]

placeholder_re = re.compile(r"\[[^\]\n]{1,80}\]|TBD\b|__{2,}")
unresolved_placeholders = sorted({match.group(0) for match in placeholder_re.finditer(attempt_text)})

patterns = {
    "ICD-10": re.compile(r"\b[A-TV-Z][0-9][0-9A-Z](?:\.[0-9A-Z]{1,4})?\b"),
    "CPT": re.compile(r"\b\d{5}\b"),
    "CFR": re.compile(r"\b\d+\s*CFR\s*(?:(?:Part|Parts)\s+[\d\.\sand-]+|(?:§\s*)?[\d\.]+(?:\([a-z0-9]+\))*)\b", re.I),
}

citation_parse_failures = []
lines = attempt_text.splitlines()
table_separator_re = re.compile(r"^\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?$")


def is_markdown_table_header(index: int) -> bool:
    line = lines[index].strip()
    if not (line.startswith("|") and line.endswith("|")):
        return False
    if index + 1 >= len(lines):
        return False
    return bool(table_separator_re.match(lines[index + 1].strip()))


for index, line in enumerate(lines):
    if is_markdown_table_header(index) or table_separator_re.match(line.strip()):
        continue
    stripped = line.strip()
    if (
        re.search(r"\bICD-10(?:-CM|-PCS)?(?:\s+code|\s+codes)?\s*[:=]", line, re.I)
        and not patterns["ICD-10"].search(line)
    ):
        citation_parse_failures.append({"raw_text": line.strip(), "expected_pattern": "ICD-10"})
    if (
        re.search(r"\bCPT(?:\s+code|\s+codes)?\s*[:=]", line, re.I)
        and not patterns["CPT"].search(line)
    ):
        citation_parse_failures.append({"raw_text": line.strip(), "expected_pattern": "CPT"})
    if re.search(r"\bCFR\b", line) and not patterns["CFR"].search(line):
        citation_parse_failures.append({"raw_text": stripped, "expected_pattern": "CFR"})

static_claim_re = re.compile(
    r"\b(verified|confirmed|looked up|queried)\b.*\b(NPI Registry|NPPES|PubMed|CMS Coverage|ClinicalTrials\.gov|PECOS|Federal Register)\b",
    re.I,
)
static_mcp_claims = sorted({match.group(0) for match in static_claim_re.finditer(attempt_text)})

line_count = len([line for line in attempt_text.splitlines() if line.strip()])
min_length_met = line_count >= 10

frontmatter_valid = True
if attempt_text.startswith("---\n"):
    parts = attempt_text.split("\n---\n", 1)
    if len(parts) != 2:
        frontmatter_valid = False
    else:
        try:
            parsed = yaml.safe_load(parts[0][4:])
            frontmatter_valid = isinstance(parsed, dict)
        except Exception:
            frontmatter_valid = False

overall_pass = (
    not missing_sections
    and not unresolved_placeholders
    and not citation_parse_failures
    and not static_mcp_claims
    and min_length_met
    and frontmatter_valid
)

result = {
    "seed_id": seed["seed_id"],
    "agent_slug": seed["agent_slug"],
    "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
    "missing_sections": missing_sections,
    "unresolved_placeholders": unresolved_placeholders,
    "citation_parse_failures": citation_parse_failures,
    "static_mcp_claims": static_mcp_claims,
    "min_length_met": min_length_met,
    "frontmatter_valid": frontmatter_valid,
    "overall_pass": overall_pass,
}

print(yaml.safe_dump(result, sort_keys=False))
PY
)"

if [[ -n "$OUTPUT_FILE" ]]; then
  printf '%s' "$RESULT" > "$OUTPUT_FILE"
else
  printf '%s' "$RESULT"
fi
