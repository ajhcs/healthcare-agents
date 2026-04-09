#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FIXTURES="$ROOT/scripts/test-fixtures/references"

bash "$ROOT/scripts/lint-references.sh" \
  "$FIXTURES/clinical-care-management-specialist-example.md" \
  "$FIXTURES/clinical-care-management-specialist-holdout.md" \
  >/dev/null

if bash "$ROOT/scripts/lint-references.sh" "$FIXTURES/clinical-care-management-specialist-stale-holdout.md" >/dev/null 2>&1; then
  echo "expected stale holdout to fail the release gate" >&2
  exit 1
fi

echo "test-release-gate.sh: ok"
