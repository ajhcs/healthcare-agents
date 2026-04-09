#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

SPACE_DIR="$(mktemp -d "/tmp/calibration provider cmd.XXXXXX")"
RUN_ID="abs-path-provider-cmd-test-001"
RUN_DIR="$ROOT/calibration/results/$RUN_ID"
MANIFEST_FILE="$ROOT/calibration/run-manifests/${RUN_ID}.yaml"
trap 'rm -rf "$SPACE_DIR" "$RUN_DIR" "$MANIFEST_FILE"' EXIT

GENERATOR="$SPACE_DIR/generator.sh"
JUDGE="$SPACE_DIR/judge.sh"
SUMMARY="$SPACE_DIR/summary.sh"

cat > "$GENERATOR" <<EOF
#!/usr/bin/env bash
set -euo pipefail
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

CALIBRATION_GENERATOR_CMD="$GENERATOR" \
CALIBRATION_JUDGE_CMD="$JUDGE" \
CALIBRATION_SYNTHESIZER_CMD="$SUMMARY" \
CALIBRATION_GENERATOR_MODEL="fixture-generator" \
CALIBRATION_JUDGE_MODEL="fixture-judge" \
CALIBRATION_SYNTHESIZER_MODEL="fixture-synth" \
bash calibration/run-calibration.sh \
  --seed-file calibration/seeds/clinical-care-management-specialist/ccm-seed-001.yaml \
  --run-id "$RUN_ID" >/dev/null

test -f "$RUN_DIR/ccm-seed-001.attempt.md"
test -f "$RUN_DIR/ccm-seed-001.gap.yaml"
test -f "$RUN_DIR/clinical-care-management-specialist.summary.yaml"
test -f "$MANIFEST_FILE"

echo "test-run-calibration-provider-cmd.sh: ok"
