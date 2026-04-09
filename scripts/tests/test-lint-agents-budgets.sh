#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMP_DIR="$(mktemp -d)"
TMP_REGISTRY="$(mktemp)"

cleanup() {
    rm -rf "$TMP_DIR"
    rm -f "$TMP_REGISTRY"
}
trap cleanup EXIT

cat >"$TMP_DIR/utility.md" <<'MD'
---
name: Utility Probe
description: Temporary utility prompt for lint exclusion
utility: true
color: "#111111"
---
# Utility Probe
MD

cat >"$TMP_DIR/eval-exam-architect.md" <<'MD'
---
name: Legacy Utility Probe
description: Temporary legacy fallback utility prompt
color: "#111111"
---
# Legacy Utility Probe
MD

cat >"$TMP_DIR/specialist.md" <<'MD'
---
name: Specialist Probe
description: Temporary specialist prompt for lint warnings
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

cat >"$TMP_REGISTRY" <<'YAML'
agents:
  - slug: specialist
    line_budget: 5
utility_agents:
  - eval-exam-architect
YAML

output="$(bash "$ROOT/scripts/lint-agents.sh" --registry "$TMP_REGISTRY" "$TMP_DIR" || true)"
grep -q "utility prompt; skipped canonical agent checks" <<<"$output"
grep -q "eval-exam-architect.md (special-purpose utility prompt; skipped canonical agent checks)" <<<"$output"
grep -q "specialist.md" <<<"$output"
grep -Eq "Body under 100 lines|Body under 350 lines" <<<"$output"
grep -q "Exceeds line_budget" <<<"$output"

echo "lint budget smoke test passed"
