#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

bash -n install.sh
for script in scripts/*.sh; do
  bash -n "$script"
done

node -c bin/cli.js
for script in scripts/*.js; do
  node -c "$script"
done

if command -v shellcheck >/dev/null 2>&1; then
  shellcheck -S error install.sh scripts/*.sh
else
  echo "warn: shellcheck not installed; running built-in shell safety heuristics"
fi

shell_eval_hits="$(rg -n '\beval[[:space:]]+["$]|(^|[;&|[:space:]])exec[[:space:]]+[^>]' install.sh scripts/*.sh || true)"
shell_eval_hits="$(printf '%s\n' "$shell_eval_hits" | grep -v '^scripts/static-security-checks.sh:' || true)"
if [[ -n "$shell_eval_hits" ]]; then
  printf '%s\n' "$shell_eval_hits"
  echo "error: shell scripts must not use shell eval or process replacement exec in installer release paths" >&2
  exit 1
fi

broad_delete_hits="$(rg -n 'rm -rf "\$dest"|rm -rf "\$CUSTOM_PATH"|rm -rf /' install.sh scripts/*.sh || true)"
broad_delete_hits="$(printf '%s\n' "$broad_delete_hits" | grep -v '^scripts/static-security-checks.sh:' || true)"
if [[ -n "$broad_delete_hits" ]]; then
  printf '%s\n' "$broad_delete_hits"
  echo "error: broad rm -rf pattern found in installer scripts" >&2
  exit 1
fi

if rg -n 'child_process\.exec\(|execSync\(' bin scripts/*.js; then
  echo "error: Node scripts must use spawn/execFile style APIs, not shell exec" >&2
  exit 1
fi

node scripts/test-cli-regression.js >/dev/null
bash scripts/test-installer-e2e.sh >/dev/null

echo "static security checks ok: syntax, optional shellcheck, no shell eval/exec, no broad deletes, path/slug regression tests"
