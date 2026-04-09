#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

for scenario in scenarios/*.md; do
  [[ -f "$scenario" ]] || continue
  bash scripts/validate-dag.sh "$scenario" >/dev/null
done

python3 - <<'PY'
from pathlib import Path
import sys
import yaml

registry = yaml.safe_load(Path("registry.yaml").read_text(encoding="utf-8"))
agents = {entry["slug"]: entry for entry in registry["agents"]}

for scenario_path in sorted(Path("scenarios").glob("*.md")):
    text = scenario_path.read_text(encoding="utf-8")
    frontmatter_raw, rest = text.split("\n---\n", 1)
    frontmatter = yaml.safe_load(frontmatter_raw.split("\n", 1)[1])
    if not isinstance(frontmatter, dict):
        raise SystemExit(f"{scenario_path}: invalid frontmatter")
    for slug in frontmatter.get("agents_involved", []):
        if slug not in agents:
            raise SystemExit(f"{scenario_path}: frontmatter agent not in registry: {slug}")
    if "```yaml" not in rest:
        raise SystemExit(f"{scenario_path}: missing DAG block")
    dag_text = rest.split("```yaml\n", 1)[1].split("\n```", 1)[0]
    dag = yaml.safe_load(dag_text)
    for step in dag.get("workflow", {}).get("steps", []):
        slug = step["agent_slug"]
        deliverable_id = step["deliverable_id"]
        if slug not in agents:
            raise SystemExit(f"{scenario_path}: step agent not in registry: {slug}")
        deliverables = {d["id"] for d in agents[slug].get("deliverables", [])}
        if deliverable_id not in deliverables:
            raise SystemExit(f"{scenario_path}: unknown deliverable {deliverable_id} for {slug}")

print("test-scenarios-registry-alignment.sh: ok")
PY
