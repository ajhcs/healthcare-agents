#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/run-reference-batch-detached.sh --root PATH --log-file PATH [slug ...]

Launches scripts/generate-reference-bundles.py in a detached nohup shell for the given slugs.
If no slugs are provided, the generator runs with --missing-only across the whole registry.
EOF
}

ROOT=""
LOG_FILE=""
SLUGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --root) ROOT="$2"; shift 2 ;;
    --log-file) LOG_FILE="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) SLUGS+=("$1"); shift ;;
  esac
done

if [[ -z "$ROOT" || -z "$LOG_FILE" ]]; then
  usage >&2
  exit 1
fi

mkdir -p "$(dirname "$LOG_FILE")"

if [[ ${#SLUGS[@]} -eq 0 ]]; then
  CMD="python3 scripts/generate-reference-bundles.py --count 3 --missing-only"
else
  printf -v SLUGS_Q '%q ' "${SLUGS[@]}"
  CMD="python3 scripts/generate-reference-bundles.py --count 3 ${SLUGS_Q}"
fi

nohup bash -lc "
  cd $(printf %q "$ROOT") &&
  ${CMD}
" >"$LOG_FILE" 2>&1 &

echo $!
