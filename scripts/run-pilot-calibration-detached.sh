#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/run-pilot-calibration-detached.sh --root PATH --run-id ID --log-file PATH [--manifest PATH]

Runs a calibration manifest in a detached nohup shell from the given repo root.
The provider commands default to the GPT-5.4 medium/xhigh wrappers used elsewhere in this repo.
EOF
}

ROOT=""
RUN_ID=""
LOG_FILE=""
MANIFEST="calibration/run-manifests/pilot-001.yaml"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --root) ROOT="$2"; shift 2 ;;
    --run-id) RUN_ID="$2"; shift 2 ;;
    --log-file) LOG_FILE="$2"; shift 2 ;;
    --manifest) MANIFEST="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 1 ;;
  esac
done

if [[ -z "$ROOT" || -z "$RUN_ID" || -z "$LOG_FILE" ]]; then
  usage >&2
  exit 1
fi

mkdir -p "$(dirname "$LOG_FILE")"
rm -rf "$ROOT/calibration/results/$RUN_ID"
rm -f "$ROOT/calibration/run-manifests/$RUN_ID.yaml" "$LOG_FILE"

nohup bash -lc "
  cd $(printf %q "$ROOT") &&
  CALIBRATION_GENERATOR_CMD=$(printf %q "./scripts/providers/codex-gpt54-medium.sh") \
  CALIBRATION_JUDGE_CMD=$(printf %q "./scripts/providers/codex-gpt54-xhigh.sh") \
  CALIBRATION_SYNTHESIZER_CMD=$(printf %q "./scripts/providers/codex-gpt54-xhigh.sh") \
  CALIBRATION_GENERATOR_MODEL=$(printf %q "gpt-5.4-medium") \
  CALIBRATION_JUDGE_MODEL=$(printf %q "gpt-5.4-xhigh") \
  CALIBRATION_SYNTHESIZER_MODEL=$(printf %q "gpt-5.4-xhigh") \
  CALIBRATION_GENERATOR_TIMEOUT_SECS=$(printf %q "1200") \
  CALIBRATION_JUDGE_TIMEOUT_SECS=$(printf %q "1800") \
  CALIBRATION_SYNTHESIZER_TIMEOUT_SECS=$(printf %q "1800") \
  CALIBRATION_PROVIDER_MAX_ATTEMPTS=$(printf %q "4") \
  CALIBRATION_PROVIDER_RETRY_SLEEP_SECS=$(printf %q "5") \
  bash calibration/run-calibration.sh --manifest $(printf %q "$MANIFEST") --run-id $(printf %q "$RUN_ID")
" >"$LOG_FILE" 2>&1 &

echo $!
