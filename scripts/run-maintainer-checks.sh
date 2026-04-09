#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

run() {
  echo "==> $*"
  "$@"
}

REFERENCE_FIXTURES=(
  scripts/test-fixtures/references/clinical-care-management-specialist-example.md
  scripts/test-fixtures/references/clinical-care-management-specialist-holdout.md
)

PILOT_DAG_FIXTURE=scripts/test-fixtures/dag/valid-pilot-workflow.yaml

run bash scripts/lint-agents.sh agents
run bash scripts/lint-references.sh "${REFERENCE_FIXTURES[@]}"
run bash scripts/validate-dag.sh "$PILOT_DAG_FIXTURE"

for test_script in \
  scripts/tests/test-generate-roster.sh \
  scripts/tests/test-generate-registry.sh \
  scripts/tests/test-add-deliverable-markers.sh \
  scripts/tests/test-enrich-registry-from-prompts.sh \
  scripts/tests/test-merge-registry.sh \
  scripts/tests/test-sync-tool-sections.sh \
  scripts/tests/test-sync-attack-surfaces.sh \
  scripts/tests/test-lint-agents-budgets.sh \
  scripts/tests/test-utility-exclusion.sh \
  scripts/tests/test-validate-calibration-artifacts.sh \
  scripts/tests/test-normalize-calibration-output.sh \
  scripts/tests/test-lint-attempt.sh \
  scripts/tests/test-codex-provider-wrappers.sh \
  scripts/tests/test-run-calibration-provider-cmd.sh \
  scripts/tests/test-run-calibration-locking.sh \
  scripts/tests/test-lint-references.sh \
  scripts/tests/test-validate-dag.sh \
  scripts/tests/test-pilot-scenarios.sh \
  scripts/tests/test-scenarios-registry-alignment.sh \
  scripts/tests/test-pilot-agent-upgrades.sh \
  scripts/tests/test-pilot-applied-traces.sh \
  scripts/tests/test-capability-mapping.sh \
  scripts/tests/test-release-gate.sh
do
  if [[ -f "$test_script" ]]; then
    run bash "$test_script"
  fi
done

echo "maintainer checks complete"
