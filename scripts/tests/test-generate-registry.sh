#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
FIXTURES="$REPO_ROOT/scripts/test-fixtures/registry"
GENERATOR="$REPO_ROOT/scripts/generate-registry.sh"

tmp_output="$(mktemp)"
tmp_error="$(mktemp)"
tmp_orchestrator="$(mktemp --suffix=.md)"
trap 'rm -f "$tmp_output" "$tmp_error" "$tmp_orchestrator"' EXIT

cat >"$tmp_orchestrator" <<'EOF'
---
name: Test Orchestrator
description: Temporary orchestrator fixture
agent_type: orchestrator
---

# Test Orchestrator
EOF

"$GENERATOR" \
  "$FIXTURES/healthit-epic-applications-analyst.md" \
  "$FIXTURES/pophealth-surveillance-coordinator.md" \
  "$FIXTURES/strategy-structural-improvement-consultant.md" \
  "$FIXTURES/eval-exam-architect.md" \
  "$tmp_orchestrator" \
  >"$tmp_output" 2>"$tmp_error"

diff -u "$FIXTURES/generated-registry.expected.yaml" "$tmp_output"

if "$GENERATOR" "$FIXTURES/missing-markers.md" >"$tmp_output" 2>"$tmp_error"; then
  echo "expected missing-marker generation to fail" >&2
  exit 1
fi

grep -F "no deliverable markers found" "$tmp_error" >/dev/null
echo "test-generate-registry.sh: ok"
