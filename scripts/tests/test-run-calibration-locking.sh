#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

SPACE_DIR="$(mktemp -d "/tmp/calibration locking.XXXXXX")"
RUN_ID="lock-test-$$"
RUN_DIR="$ROOT/calibration/results/$RUN_ID"
LOCK_DIR="${RUN_DIR}.lock"
MANIFEST_FILE="$ROOT/calibration/run-manifests/${RUN_ID}.yaml"
LOG1="$SPACE_DIR/first.log"
LOG2="$SPACE_DIR/second.log"
trap 'rm -rf "$SPACE_DIR" "$RUN_DIR" "$LOCK_DIR" "$MANIFEST_FILE"' EXIT

GENERATOR="$SPACE_DIR/generator.sh"
JUDGE="$SPACE_DIR/judge.sh"
SUMMARY="$SPACE_DIR/summary.sh"

cat > "$GENERATOR" <<EOF
#!/usr/bin/env bash
set -euo pipefail
sleep 5
cat "$ROOT/calibration/results/live-repro-001/ccm-seed-001.attempt.md"
EOF

cat > "$JUDGE" <<EOF
#!/usr/bin/env bash
set -euo pipefail
cat "$ROOT/calibration/results/live-repro-001/ccm-seed-001.gap.yaml"
EOF

cat > "$SUMMARY" <<EOF
#!/usr/bin/env bash
set -euo pipefail
cat "$ROOT/calibration/results/live-repro-001/clinical-care-management-specialist.summary.yaml"
EOF

chmod +x "$GENERATOR" "$JUDGE" "$SUMMARY"

CAL_ENV=(
  CALIBRATION_GENERATOR_CMD="$GENERATOR"
  CALIBRATION_JUDGE_CMD="$JUDGE"
  CALIBRATION_SYNTHESIZER_CMD="$SUMMARY"
  CALIBRATION_GENERATOR_MODEL="fixture-generator"
  CALIBRATION_JUDGE_MODEL="fixture-judge"
  CALIBRATION_SYNTHESIZER_MODEL="fixture-synth"
)

env "${CAL_ENV[@]}" \
  bash calibration/run-calibration.sh \
  --seed-file calibration/seeds/clinical-care-management-specialist/ccm-seed-001.yaml \
  --run-id "$RUN_ID" >"$LOG1" 2>&1 &
FIRST_PID=$!

for _ in $(seq 1 50); do
  if [[ -d "$LOCK_DIR" ]]; then
    break
  fi
  sleep 0.1
done

if [[ ! -d "$LOCK_DIR" ]]; then
  echo "expected lock directory to exist while first run is active" >&2
  cat "$LOG1" >&2 || true
  exit 1
fi

if env "${CAL_ENV[@]}" \
  bash calibration/run-calibration.sh \
  --seed-file calibration/seeds/clinical-care-management-specialist/ccm-seed-001.yaml \
  --run-id "$RUN_ID" \
  --resume >"$LOG2" 2>&1
then
  echo "expected concurrent resume to fail while lock is held" >&2
  exit 1
fi

grep -q "Run is locked by active process" "$LOG2"

wait "$FIRST_PID"

if [[ -d "$LOCK_DIR" ]]; then
  echo "expected lock directory to be removed after run completion" >&2
  exit 1
fi

env "${CAL_ENV[@]}" \
  bash calibration/run-calibration.sh \
  --seed-file calibration/seeds/clinical-care-management-specialist/ccm-seed-001.yaml \
  --run-id "$RUN_ID" \
  --resume >/dev/null

test -f "$RUN_DIR/ccm-seed-001.attempt.md"
test -f "$RUN_DIR/ccm-seed-001.gap.yaml"
test -f "$RUN_DIR/clinical-care-management-specialist.summary.yaml"
test -f "$MANIFEST_FILE"

echo "test-run-calibration-locking.sh: ok"
