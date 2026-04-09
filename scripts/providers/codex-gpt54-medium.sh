#!/usr/bin/env bash
set -euo pipefail

MODEL="${CODEX_PROVIDER_MODEL:-gpt-5.4}"
OUT_FILE="$(mktemp)"
ERR_FILE="$(mktemp)"

cleanup() {
  rm -f "$OUT_FILE" "$ERR_FILE"
}
trap cleanup EXIT

if ! codex exec \
  -m "$MODEL" \
  -c 'model_reasoning_effort="medium"' \
  --ephemeral \
  --skip-git-repo-check \
  -s read-only \
  --color never \
  -o "$OUT_FILE" \
  - > /dev/null 2>"$ERR_FILE"
then
  cat "$ERR_FILE" >&2
  exit 1
fi

if ! grep -q '[^[:space:]]' "$OUT_FILE"; then
  echo "codex provider returned empty output" >&2
  exit 1
fi

cat "$OUT_FILE"
