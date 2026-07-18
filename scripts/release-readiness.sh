#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

section() {
  printf "\n==> %s\n" "$1"
}

section "syntax and static security"
bash scripts/static-security-checks.sh

section "agent lint and heuristic audit"
bash scripts/lint-agents.sh
python3 scripts/audit-agents.py --top 10

section "scorecard generation and README claim gate"
node scripts/generate-scorecard.js
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git diff --exit-code -- docs/eval/scorecard.md docs/eval/scorecard.json
fi
node scripts/validate-scorecard-claims.js
REQUIRE_FULL_EVAL_COVERAGE=1 node scripts/validate-eval-coverage.js

section "registry, source freshness, safety, and release manifest"
node scripts/validate-registry-consistency.js
node scripts/validate-router-indexes.js
node scripts/validate-source-freshness.js
node scripts/validate-safety-boundaries.js
node scripts/validate-release-manifest.js
node scripts/validate-health-admin-reliability-canaries.js
node scripts/validate-workflows.js
node scripts/validate-workup-canaries.js
node scripts/validate-platform-exports.js
node scripts/validate-workflow-docs.js
node scripts/validate-evidence-packs.js
node scripts/validate-review-protocols.js
node scripts/validate-operator-os-coverage.js

section "CLI, installer, routing, package, and tarball"
node scripts/test-cli-regression.js
node scripts/test-evidence-pack-regression.js
node scripts/test-strategic-review-contract.js
node scripts/test-scale-roster-bed-review.js
node scripts/test-scale-input-fitness-review.js
node scripts/test-case-data-provider.js
node scripts/test-denial-spike-golden-artifact.js
node scripts/test-operator-os-coverage-regression.js
bash scripts/test-installer-e2e.sh
node scripts/run-routing-benchmark.js >/tmp/healthcare-agents-routing-benchmark.json
node scripts/test-platform-render-snapshots.js
node scripts/validate-packlist.js
node scripts/test-tarball-smoke.js

section "local public-release metadata"
node scripts/verify-public-release.js
node scripts/validate-public-version-sync.js
node scripts/validate-npm-publish-workflow.js

printf "\nRelease readiness complete. Routing metrics written to /tmp/healthcare-agents-routing-benchmark.json\n"
