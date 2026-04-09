#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FIXTURES="$ROOT/scripts/test-fixtures/dag"

bash "$ROOT/scripts/validate-dag.sh" "$FIXTURES/valid-pilot-workflow.yaml" >/dev/null

DOC="$(mktemp --suffix=.md)"
trap 'rm -f "$DOC"' EXIT

cat >"$DOC" <<'EOF'
# Scenario Fixture

```yaml
workflow:
  title: Markdown DAG
  steps:
    - step_id: 1
      agent_slug: clinical-care-management-specialist
      agent_name: Care Management Specialist
      deliverable_id: ccm-d02
      deliverable_title: Readmission Risk Assessment
      why: Markdown fixture step
      required_inputs:
        - source: user
          data: "Discharge summary"
      outputs_passed_forward: []
      depends_on: []
      independent_review: false
      tool_recommendation: null
  blockers:
    - type: missing_input
      condition: User omitted the discharge summary.
      affects: [1]
      escalate_to: user
      workflow_status: blocked
      resolution: Ask the user for the missing summary.
```
EOF

bash "$ROOT/scripts/validate-dag.sh" "$DOC" >/dev/null

for invalid in \
  "$FIXTURES/invalid-derived-fields.yaml" \
  "$FIXTURES/invalid-cycle.yaml" \
  "$FIXTURES/invalid-independent-review.yaml"
do
  if bash "$ROOT/scripts/validate-dag.sh" "$invalid" >/dev/null 2>&1; then
    echo "expected $invalid to fail DAG validation" >&2
    exit 1
  fi
done

echo "test-validate-dag.sh: ok"
