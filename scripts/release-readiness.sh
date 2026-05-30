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

section "strict eval coverage"
REQUIRE_FULL_EVAL_COVERAGE=1 node scripts/validate-eval-coverage.js

section "registry, source freshness, safety, and release manifest"
node scripts/validate-registry-consistency.js
node scripts/validate-source-freshness.js
node scripts/validate-safety-boundaries.js
node scripts/validate-release-manifest.js

section "CLI, installer, routing, package, and tarball"
node scripts/test-cli-regression.js
bash scripts/test-installer-e2e.sh
node scripts/run-routing-benchmark.js >/tmp/healthcare-agents-routing-benchmark.json
node scripts/validate-packlist.js
node scripts/test-tarball-smoke.js

section "local public-release metadata"
node scripts/verify-public-release.js

printf "\nRelease readiness complete. Routing metrics written to /tmp/healthcare-agents-routing-benchmark.json\n"
