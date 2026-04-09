#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/run-overnight-phase2.sh --root PATH --baseline-root PATH --log-file PATH

Automates the remaining Phase 2 queue:
1. Wait for active provider work to drain.
2. Re-run missing reference generation until coverage reaches the 3/3/3 floor or stops improving.
3. Run the upgraded vs baseline pilot comparison sequentially.
4. If reference coverage is complete, launch a full-catalog upgraded calibration run.
EOF
}

ROOT=""
BASELINE_ROOT=""
LOG_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --root) ROOT="$2"; shift 2 ;;
    --baseline-root) BASELINE_ROOT="$2"; shift 2 ;;
    --log-file) LOG_FILE="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 1 ;;
  esac
done

if [[ -z "$ROOT" || -z "$BASELINE_ROOT" || -z "$LOG_FILE" ]]; then
  usage >&2
  exit 1
fi

mkdir -p "$(dirname "$LOG_FILE")"
exec > >(tee -a "$LOG_FILE") 2>&1

provider_busy() {
  ps -eo cmd= | rg -q \
    'generate-reference-bundles\.py|bash calibration/run-calibration\.sh|scripts/providers/codex-gpt54-(medium|xhigh)\.sh|codex exec -m gpt-5\.4 -c model_reasoning_effort="(medium|xhigh)"'
}

wait_for_provider_idle() {
  while provider_busy; do
    date -u +"[%Y-%m-%dT%H:%M:%SZ] waiting for provider lane to drain"
    sleep 30
  done
}

under_floor_count() {
  python3 - "$ROOT" <<'PY'
from pathlib import Path
import sys
import yaml

root = Path(sys.argv[1])
reg = yaml.safe_load((root / "registry.yaml").read_text())
count = 0
for agent in reg["agents"]:
    slug = agent["slug"]
    e = len(list((root / "references/examples" / slug).glob("*.md")))
    h = len(list((root / "calibration/holdouts" / slug).glob("*.md")))
    s = len(list((root / "calibration/seeds" / slug).glob("*.yaml")))
    if min(e, h, s) < 3:
        count += 1
print(count)
PY
}

maybe_fill_reference_gaps() {
  local previous current pass pid log
  previous=9999
  pass=1
  while true; do
    current="$(under_floor_count)"
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] reference under-floor agents: $current"
    if [[ "$current" -eq 0 ]]; then
      return 0
    fi
    if [[ "$current" -ge "$previous" && "$pass" -gt 1 ]]; then
      echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] reference coverage stalled at $current"
      return 1
    fi
    wait_for_provider_idle
    log="$ROOT/calibration/results/reference-missing-pass-$(printf '%02d' "$pass").log"
    pid="$(bash "$ROOT/scripts/run-reference-batch-detached.sh" --root "$ROOT" --log-file "$log")"
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] launched reference pass $pass pid=$pid log=$log"
    while kill -0 "$pid" 2>/dev/null; do
      sleep 30
    done
    previous="$current"
    pass=$((pass + 1))
  done
}

run_pilot_comparison() {
  wait_for_provider_idle
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] launching pilot comparison"
  bash "$ROOT/scripts/run-pilot-comparison.sh" \
    --upgraded-root "$ROOT" \
    --baseline-root "$BASELINE_ROOT" \
    --output "$ROOT/calibration/results/pilot-live-comparison-final.txt"
}

launch_full_catalog_run() {
  wait_for_provider_idle
  local log pid
  log="$ROOT/calibration/results/full-catalog-001.log"
  pid="$(bash "$ROOT/scripts/run-pilot-calibration-detached.sh" \
    --root "$ROOT" \
    --manifest "$ROOT/calibration/run-manifests/full-catalog-001.yaml" \
    --run-id "full-catalog-live-001" \
    --log-file "$log")"
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] launched full catalog calibration pid=$pid log=$log"
  while kill -0 "$pid" 2>/dev/null; do
    sleep 60
  done
  if [[ ! -f "$ROOT/calibration/run-manifests/full-catalog-live-001.yaml" ]]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] full catalog calibration failed"
    return 1
  fi
  return 0
}

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] overnight phase 2 controller starting"
maybe_fill_reference_gaps || true
run_pilot_comparison
if [[ "$(under_floor_count)" -eq 0 ]]; then
  launch_full_catalog_run || true
else
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] skipping full catalog calibration because reference coverage is still incomplete"
fi
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] overnight phase 2 controller finished"
