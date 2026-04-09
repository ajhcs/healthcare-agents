#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

bash "$ROOT/scripts/validate-dag.sh" "$ROOT/scenarios" >/dev/null

python3 - "$ROOT/registry.yaml" "$ROOT/scenarios" <<'PY'
from __future__ import annotations

import re
import sys
from pathlib import Path

import yaml


registry_path = Path(sys.argv[1])
scenarios_dir = Path(sys.argv[2])

registry = yaml.safe_load(registry_path.read_text(encoding="utf-8"))
allowed = {agent["slug"] for agent in registry.get("agents", [])}
scenario_files = sorted(scenarios_dir.glob("*.md"))
if len(scenario_files) < 3:
    raise SystemExit("expected at least 3 pilot scenario files")

for path in scenario_files:
    text = path.read_text(encoding="utf-8")
    matches = re.findall(r"```ya?ml\s*\n(.*?)```", text, flags=re.DOTALL)
    workflow = None
    for block in matches:
        data = yaml.safe_load(block)
        if isinstance(data, dict) and "workflow" in data:
            workflow = data["workflow"]
            break
    if workflow is None:
        raise SystemExit(f"{path}: no workflow YAML block found")
    for step in workflow.get("steps", []):
        slug = step["agent_slug"]
        if slug not in allowed:
            raise SystemExit(f"{path}: non-pilot or unknown agent slug {slug}")

print("test-pilot-scenarios.sh: ok")
PY
