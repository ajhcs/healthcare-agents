#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
FIXTURES="$REPO_ROOT/scripts/test-fixtures/registry"
MERGER="$REPO_ROOT/scripts/merge-registry.py"

tmp_output="$(mktemp)"
trap 'rm -f "$tmp_output"' EXIT

python3 "$MERGER" \
  "$FIXTURES/generated-registry.expected.yaml" \
  "$FIXTURES/existing-registry.yaml" \
  >"$tmp_output"

diff -u "$FIXTURES/merged-registry.expected.yaml" "$tmp_output"
echo "test-merge-registry.sh: ok"
