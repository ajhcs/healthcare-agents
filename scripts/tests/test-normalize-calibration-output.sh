#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

cd "$ROOT"

GAP_OUTPUT="$TMPDIR/gap.yaml"
python3 scripts/normalize-calibration-output.py gap-report \
  --input scripts/test-fixtures/calibration/gap-report-near-miss.yaml \
  --output "$GAP_OUTPUT" \
  --seed-json <(python3 - <<'PY'
from pathlib import Path
import json
import yaml
data = yaml.safe_load(Path("scripts/test-fixtures/calibration/seed-valid.yaml").read_text(encoding="utf-8"))
print(json.dumps(data))
PY
) \
  --lint-file scripts/test-fixtures/calibration/lint-result-valid.yaml \
  --generated-by gpt-5.4-medium \
  --judged-by gpt-5.4-xhigh

python3 scripts/validate-calibration-artifacts.py --kind gap_report "$GAP_OUTPUT" >/dev/null

python3 - "$GAP_OUTPUT" <<'PY'
from pathlib import Path
import sys
import yaml
data = yaml.safe_load(Path(sys.argv[1]).read_text(encoding="utf-8"))
assert data["generated_by"] == "gpt-5.4-medium"
assert data["judged_by"] == "gpt-5.4-xhigh"
assert data["gaps"][0]["gap_type"] == "computational_omission"
assert data["gaps"][0]["confidence"] == 0.85
assert data["expectation_checklist"][0]["met"] is False
PY

SUMMARY_OUTPUT="$TMPDIR/summary.yaml"
python3 scripts/normalize-calibration-output.py synthesis-summary \
  --input scripts/test-fixtures/calibration/synthesis-near-miss.yaml \
  --output "$SUMMARY_OUTPUT" \
  --agent-slug clinical-care-management-specialist \
  --run-id pilot-live-upgraded-001

python3 scripts/validate-calibration-artifacts.py --kind synthesis_summary "$SUMMARY_OUTPUT" >/dev/null

python3 - "$SUMMARY_OUTPUT" <<'PY'
from pathlib import Path
import sys
import yaml
data = yaml.safe_load(Path(sys.argv[1]).read_text(encoding="utf-8"))
assert data["agent_slug"] == "clinical-care-management-specialist"
assert data["calibration_run_id"] == "pilot-live-upgraded-001"
assert data["recommended_edits"][0]["source_gap_ids"] == ["cm-seed-001-gap-02"]
PY

GAP_PROSE_OUTPUT="$TMPDIR/gap-prose.yaml"
python3 scripts/normalize-calibration-output.py gap-report \
  --input scripts/test-fixtures/calibration/gap-report-prose-wrap.yaml \
  --output "$GAP_PROSE_OUTPUT" \
  --seed-json <(python3 - <<'PY'
from pathlib import Path
import json
import yaml
data = yaml.safe_load(Path("scripts/test-fixtures/calibration/seed-valid.yaml").read_text(encoding="utf-8"))
data["seed_id"] = "rmc-seed-003"
data["agent_slug"] = "revenue-medical-coding-specialist"
data["deliverable_id"] = "rmc-d01"
print(json.dumps(data))
PY
) \
  --lint-file scripts/test-fixtures/calibration/lint-result-valid.yaml \
  --generated-by gpt-5.4-medium \
  --judged-by gpt-5.4-xhigh

python3 scripts/validate-calibration-artifacts.py --kind gap_report "$GAP_PROSE_OUTPUT" >/dev/null

python3 - "$GAP_PROSE_OUTPUT" <<'PY'
from pathlib import Path
import sys
import yaml
data = yaml.safe_load(Path(sys.argv[1]).read_text(encoding="utf-8"))
assert "missing_sections: []" in data["expectation_checklist"][0]["notes"]
assert data["gaps"][0]["gap_id"] == "G1"
assert data["gaps"][0]["gap_type"] == "structural_omission"
PY

SUMMARY_PROSE_OUTPUT="$TMPDIR/summary-prose.yaml"
python3 scripts/normalize-calibration-output.py synthesis-summary \
  --input scripts/test-fixtures/calibration/synthesis-prose-wrap.yaml \
  --output "$SUMMARY_PROSE_OUTPUT" \
  --agent-slug clinical-care-management-specialist \
  --run-id pilot-live-upgraded-001

python3 scripts/validate-calibration-artifacts.py --kind synthesis_summary "$SUMMARY_PROSE_OUTPUT" >/dev/null

python3 - "$SUMMARY_PROSE_OUTPUT" <<'PY'
from pathlib import Path
import sys
import yaml
data = yaml.safe_load(Path(sys.argv[1]).read_text(encoding="utf-8"))
assert "missing_sections: []" in data["systematic_strengths"][0]["evidence"]
assert data["recommended_edits"][0]["description"].startswith("Add audit-ready billing detail:")
print("test-normalize-calibration-output.sh: ok")
PY
