#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

cd "$ROOT"

cat > "$TMPDIR/registry.yaml" <<'EOF'
agents:
  - slug: 'clinical-case-manager'
    name: 'Case Manager'
    deliverables:
      - id: 'ccm-d01'
        title: 'Discharge Planning Checklist'
        prompt_section: '📋 Your Technical Deliverables'
      - id: 'ccm-d02'
        title: 'Avoidable Day Report'
        prompt_section: '📋 Your Technical Deliverables'
utility_agents: []
EOF

mkdir -p "$TMPDIR/agents"
cp agents/clinical-case-manager.md "$TMPDIR/agents/clinical-case-manager.md"

python3 scripts/enrich-registry-defaults.py "$TMPDIR/registry.yaml"

python3 - "$TMPDIR/registry.yaml" <<'PY'
from pathlib import Path
import sys
import yaml

data = yaml.safe_load(Path(sys.argv[1]).read_text(encoding="utf-8"))
agent = data["agents"][0]
assert agent["domain"] == "clinical-operations"
assert agent["refresh_owner"] == "maintainer"
assert agent["regulatory_refresh"] == "quarterly"
assert len(agent["routing_triggers"]) >= 5
assert len(agent["tool_opportunities"]) >= 2
assert agent["line_budget"] > 400
print("test-enrich-registry-from-prompts.sh: ok")
PY
