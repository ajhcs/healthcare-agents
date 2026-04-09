#!/usr/bin/env bash
set -euo pipefail

REGISTRY_PATH="registry.yaml"
INJECT_PATH=""

usage() {
  cat <<'EOF'
Usage: scripts/generate-roster.sh [--registry PATH] [--inject DOC]

Render the pilot roster table from registry.yaml. If --inject is provided,
replace the content between <!-- roster:start --> and <!-- roster:end -->
markers in the target markdown file.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --registry)
      REGISTRY_PATH="$2"
      shift 2
      ;;
    --inject)
      INJECT_PATH="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

python3 - "$REGISTRY_PATH" "$INJECT_PATH" <<'PY'
from __future__ import annotations

import sys
from pathlib import Path

import yaml


def fail(message: str) -> None:
    raise SystemExit(message)


def render_table(registry_path: Path) -> str:
    data = yaml.safe_load(registry_path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        fail(f"{registry_path}: top-level YAML must be a mapping")

    agents = data.get("agents")
    if not isinstance(agents, list) or not agents:
        fail(f"{registry_path}: expected a non-empty agents list")

    lines = [
        "| slug | name | Route when... | Key deliverables (id: title) |",
        "|------|------|---------------|------------------------------|",
    ]
    for index, agent in enumerate(agents):
        if not isinstance(agent, dict):
            fail(f"{registry_path}: agents[{index}] must be a mapping")
        slug = str(agent.get("slug", "")).strip()
        name = str(agent.get("name", "")).strip()
        triggers = agent.get("routing_triggers") or []
        if not isinstance(triggers, list):
            fail(f"{registry_path}: agents[{index}].routing_triggers must be a list when present")
        trigger_text = ", ".join(str(trigger).strip() for trigger in triggers if str(trigger).strip()) or "—"
        deliverables = agent.get("deliverables") or []
        if not isinstance(deliverables, list) or not deliverables:
            fail(f"{registry_path}: agents[{index}].deliverables must be a non-empty list")

        deliverable_pairs: list[str] = []
        for d_index, deliverable in enumerate(deliverables):
            if not isinstance(deliverable, dict):
                fail(f"{registry_path}: agents[{index}].deliverables[{d_index}] must be a mapping")
            deliverable_id = str(deliverable.get("id", "")).strip()
            title = str(deliverable.get("title", "")).strip()
            if not deliverable_id or not title:
                fail(f"{registry_path}: agents[{index}].deliverables[{d_index}] requires id and title")
            deliverable_pairs.append(f"{deliverable_id}: {title}")

        row = (
            f"| {slug} | {name} | {trigger_text} | "
            f"{'<br>'.join(deliverable_pairs)} |"
        )
        lines.append(row)

    return "\n".join(lines) + "\n"


def inject_table(doc_path: Path, table: str) -> None:
    start_marker = "<!-- roster:start -->"
    end_marker = "<!-- roster:end -->"
    original = doc_path.read_text(encoding="utf-8")
    if start_marker not in original or end_marker not in original:
        fail(f"{doc_path}: missing roster markers")
    before, tail = original.split(start_marker, 1)
    between, after = tail.split(end_marker, 1)
    updated = before + start_marker + "\n" + table + end_marker + after
    doc_path.write_text(updated, encoding="utf-8")


registry_path = Path(sys.argv[1]).resolve()
inject_path = Path(sys.argv[2]).resolve() if sys.argv[2] else None

table = render_table(registry_path)
if inject_path is None:
    sys.stdout.write(table)
else:
    inject_table(inject_path, table)
    sys.stdout.write(f"{inject_path}: roster updated from {registry_path}\n")
PY
