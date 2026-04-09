#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMP_LINT="$(mktemp -d)"
TMP_AUDIT="$ROOT/agents/zz-utility-audit.md"
TMP_ORCH="$ROOT/agents/zz-orchestrator-audit.md"
TMP_PIPE="$(mktemp -d)"

cleanup() {
    rm -rf "$TMP_LINT" "$TMP_PIPE"
    rm -f "$TMP_AUDIT" "$TMP_ORCH"
}
trap cleanup EXIT

cat >"$TMP_LINT/utility.md" <<'MD'
---
name: Utility Probe
description: Temporary utility prompt for lint exclusion
utility: true
color: "#111111"
---
# Utility Probe
MD

cat >"$TMP_LINT/specialist.md" <<'MD'
---
name: Specialist Probe
description: Temporary specialist prompt for lint coverage
color: "#111111"
---
## 🧠 Your Identity & Memory
## 🎯 Your Core Mission
## 🚨 Critical Rules You Must Follow
## 📋 Your Technical Deliverables
## 🔄 Your Workflow
## 💬 Your Communication Style
## 🎯 Your Success Metrics
## 🚀 Advanced Capabilities
## 🔄 Learning & Memory
MD

cat >"$TMP_LINT/orchestrator.md" <<'MD'
---
name: Orchestrator Probe
description: Temporary orchestrator prompt for lint exclusion
agent_type: orchestrator
color: "#111111"
---
# Orchestrator Probe
MD

lint_output="$(bash "$ROOT/scripts/lint-agents.sh" "$TMP_LINT")"
grep -q "utility prompt; skipped canonical agent checks" <<<"$lint_output"
grep -q "orchestrator prompt; skipped canonical specialist checks" <<<"$lint_output"
grep -q "specialist.md" <<<"$lint_output"

cat >"$TMP_AUDIT" <<'MD'
---
name: Utility Audit Probe
description: Temporary utility prompt for audit exclusion
utility: true
color: "#111111"
---
# Utility Audit Probe
MD

cat >"$TMP_ORCH" <<'MD'
---
name: Orchestrator Audit Probe
description: Temporary orchestrator prompt for audit exclusion
agent_type: orchestrator
color: "#111111"
---
# Orchestrator Audit Probe
MD

audit_output="$(python3 "$ROOT/scripts/audit-agents.py" --json)"
if grep -q "zz-utility-audit.md" <<<"$audit_output"; then
    echo "utility prompt unexpectedly included in audit output" >&2
    exit 1
fi
if grep -q "eval-exam-architect.md" <<<"$audit_output"; then
    echo "legacy fallback utility prompt unexpectedly included in audit output" >&2
    exit 1
fi
if grep -q "zz-orchestrator-audit.md" <<<"$audit_output"; then
    echo "orchestrator prompt unexpectedly included in audit output" >&2
    exit 1
fi

cat >"$TMP_PIPE/alpha.md" <<'MD'
---
name: Alpha
description: Alpha prompt
color: "#111111"
---
# Alpha
MD

cat >"$TMP_PIPE/utility-marked.md" <<'MD'
---
name: Utility Marked
description: Utility-marked prompt
utility: true
color: "#111111"
---
# Utility Marked
MD

cat >"$TMP_PIPE/eval-exam-architect.md" <<'MD'
---
name: Exam Architect
description: Legacy fallback utility prompt
color: "#111111"
---
# Exam Architect
MD

cat >"$TMP_PIPE/orchestrator.md" <<'MD'
---
name: Orchestrator
description: Orchestrator prompt
agent_type: orchestrator
color: "#111111"
---
# Orchestrator
MD

ROOT="$ROOT" PIPE_TMP="$TMP_PIPE" python3 <<'PY'
import importlib.util
import os
import pathlib
import sys
from unittest.mock import patch

root = pathlib.Path(os.environ["ROOT"]).resolve()
tmp = pathlib.Path(os.environ["PIPE_TMP"]).resolve()

sys.path.insert(0, str(root))
spec = importlib.util.spec_from_file_location(
    "pipeline_under_test", root / "eval/harness/pipeline.py"
)
module = importlib.util.module_from_spec(spec)
assert spec.loader is not None
sys.modules[spec.name] = module
spec.loader.exec_module(module)

calls = []

def fake_run(self, mode="full", max_iterations=40):
    calls.append(self.agent_name)
    return module.PipelineResult(agent_name=self.agent_name)

with patch.object(module, "AGENTS_DIR", tmp), \
     patch.object(module, "ITEMS_DIR", tmp / "items"), \
     patch.object(module.Pipeline, "run", fake_run):
    sys.argv = ["pipeline.py", "--all"]
    module.main()

assert "alpha" in calls, calls
assert "utility-marked" not in calls, calls
assert "eval-exam-architect" not in calls, calls
assert "orchestrator" not in calls, calls
PY

echo "utility exclusion checks passed"
