#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FIXTURE="$ROOT/scripts/test-fixtures/registry/existing-registry.yaml"

OUTPUT="$(bash "$ROOT/scripts/generate-roster.sh" --registry "$FIXTURE")"

grep -F "| healthit-epic-applications-analyst | Epic Applications Analyst | Epic build, EHR upgrade | hea-d01: Legacy Interface Specification<br>hea-d02: Legacy FHIR Checklist |" <<<"$OUTPUT" >/dev/null
grep -F "| operations-physician-practice-manager | Physician Practice Manager | practice operations, physician office management | oppm-d01: Practice Performance Dashboard |" <<<"$OUTPUT" >/dev/null

DOC="$(mktemp)"
trap 'rm -f "$DOC"' EXIT

cat >"$DOC" <<'EOF'
# Pilot Orchestrator

<!-- roster:start -->
placeholder
<!-- roster:end -->
EOF

bash "$ROOT/scripts/generate-roster.sh" --registry "$FIXTURE" --inject "$DOC" >/dev/null

grep -F "hea-d01: Legacy Interface Specification<br>hea-d02: Legacy FHIR Checklist" "$DOC" >/dev/null
grep -F "<!-- roster:start -->" "$DOC" >/dev/null
grep -F "<!-- roster:end -->" "$DOC" >/dev/null

echo "test-generate-roster.sh: ok"
