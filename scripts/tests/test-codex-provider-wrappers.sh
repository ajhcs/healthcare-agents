#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
USAGE_LIMITED=0

run_and_check() {
  local wrapper="$1"
  local expected="$2"
  local out
  local err
  err="$(mktemp)"
  if ! out="$(printf 'Reply with exactly: %s\n' "$expected" | "$wrapper" 2>"$err")"; then
    if grep -q "You've hit your usage limit" "$err"; then
      USAGE_LIMITED=1
      rm -f "$err"
      return 0
    fi
    cat "$err" >&2
    rm -f "$err"
    exit 1
  fi
  rm -f "$err"
  if [[ "$out" != "$expected" ]]; then
    echo "unexpected wrapper output from $wrapper: $out" >&2
    exit 1
  fi
}

run_and_check "$ROOT/scripts/providers/codex-gpt54-medium.sh" "medium-ok"
if [[ "$USAGE_LIMITED" -eq 1 ]]; then
  echo "test-codex-provider-wrappers.sh: skipped (Codex usage limit)"
  exit 0
fi
run_and_check "$ROOT/scripts/providers/codex-gpt54-xhigh.sh" "xhigh-ok"
if [[ "$USAGE_LIMITED" -eq 1 ]]; then
  echo "test-codex-provider-wrappers.sh: skipped (Codex usage limit)"
  exit 0
fi

echo "test-codex-provider-wrappers.sh: ok"
