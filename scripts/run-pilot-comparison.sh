#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/run-pilot-comparison.sh --upgraded-root PATH --baseline-root PATH --output PATH

Waits for existing provider activity to drain, then runs the pilot manifest sequentially:
1. upgraded root
2. baseline root

Writes a comparison report using scripts/compare-calibration-runs.py to the requested output path.
EOF
}

UPGRADED_ROOT=""
BASELINE_ROOT=""
OUTPUT_PATH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --upgraded-root) UPGRADED_ROOT="$2"; shift 2 ;;
    --baseline-root) BASELINE_ROOT="$2"; shift 2 ;;
    --output) OUTPUT_PATH="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 1 ;;
  esac
done

if [[ -z "$UPGRADED_ROOT" || -z "$BASELINE_ROOT" || -z "$OUTPUT_PATH" ]]; then
  usage >&2
  exit 1
fi

wait_for_provider_idle() {
  while true; do
    if ! ps -eo cmd= | rg -q \
      'generate-reference-bundles\.py|bash calibration/run-calibration\.sh|scripts/providers/codex-gpt54-(medium|xhigh)\.sh|codex exec -m gpt-5\.4 -c model_reasoning_effort="(medium|xhigh)"'
    then
      return 0
    fi
    sleep 15
  done
}

wait_for_pid() {
  local pid="$1"
  while kill -0 "$pid" 2>/dev/null; do
    sleep 15
  done
}

require_manifest() {
  local root="$1"
  local run_id="$2"
  local manifest="$root/calibration/run-manifests/${run_id}.yaml"
  if [[ ! -f "$manifest" ]]; then
    echo "missing manifest: $manifest" >&2
    return 1
  fi
}

mkdir -p "$(dirname "$OUTPUT_PATH")"

UPGRADED_RUN_ID="pilot-live-upgraded-final"
BASELINE_RUN_ID="pilot-live-baseline-final"
UPGRADED_LOG="$UPGRADED_ROOT/calibration/results/${UPGRADED_RUN_ID}.log"
BASELINE_LOG="$BASELINE_ROOT/calibration/results/${BASELINE_RUN_ID}.log"

wait_for_provider_idle

upgraded_pid="$(bash "$UPGRADED_ROOT/scripts/run-pilot-calibration-detached.sh" \
  --root "$UPGRADED_ROOT" \
  --run-id "$UPGRADED_RUN_ID" \
  --log-file "$UPGRADED_LOG")"
wait_for_pid "$upgraded_pid"
require_manifest "$UPGRADED_ROOT" "$UPGRADED_RUN_ID"

wait_for_provider_idle

baseline_pid="$(bash "$UPGRADED_ROOT/scripts/run-pilot-calibration-detached.sh" \
  --root "$BASELINE_ROOT" \
  --run-id "$BASELINE_RUN_ID" \
  --log-file "$BASELINE_LOG")"
wait_for_pid "$baseline_pid"
require_manifest "$BASELINE_ROOT" "$BASELINE_RUN_ID"

python3 "$UPGRADED_ROOT/scripts/compare-calibration-runs.py" \
  --baseline-root "$BASELINE_ROOT" \
  --baseline-run "$BASELINE_RUN_ID" \
  --candidate-root "$UPGRADED_ROOT" \
  --candidate-run "$UPGRADED_RUN_ID" \
  > "$OUTPUT_PATH"

cat "$OUTPUT_PATH"
