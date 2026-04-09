#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

SEED="$TMPDIR/seed.yaml"
ATTEMPT="$TMPDIR/attempt.md"
OUTPUT="$TMPDIR/lint.yaml"

cat >"$SEED" <<'EOF'
seed_id: ccm-lint-test
agent_slug: clinical-care-management-specialist
deliverable_id: ccm-d01
deliverable_title: Comprehensive Care Management Plan
holdout_ref: clinical-care-management-specialist/ccm-d01-holdout-001.md
EOF

cat >"$ATTEMPT" <<'EOF'
# Comprehensive Care Management Plan

**Patient**: Jordan Vale (MRN: 4410021)
**PCP**: No established PCP
**Care Manager**: Alicia Gomez, RN
**Risk Stratification Score**: LACE 12/19
**Plan Effective Date**: 2026-04-09 | **Next Review**: 2026-04-16

## Active Conditions
| Condition | ICD-10 | Status | Specialist | Last Visit |
|-----------|--------|--------|------------|------------|
| Heart failure with preserved ejection fraction | I50.33 | Exacerbation | Cardiology | 2026-04-07 |

## Medications
| Medication | Dose/Frequency | Prescriber | Adherence Issues |
|-----------|---------------|-----------|-----------------|
| Furosemide | 40 mg BID | Hospitalist | Missed fills due to transport |

## Goals & Interventions
| Goal | Intervention | Responsible | Target Date | Status |
|------|-------------|------------|------------|--------|
| Follow-up within 7 days | Book PCP bridge visit | Care manager | 2026-04-12 | In progress |

## SDOH Assessment
- Food insecurity: positive, pantry referral placed
- Housing instability: temporary motel stay after discharge
- Follow-up policy reviewed under 45 CFR Part 171 and ICD-10-CM FY 2026 guidance before release.

## Follow-Up Schedule
| Activity | Frequency | Next Due | Completed |
|----------|-----------|----------|-----------|
| Transitional care call | within 48 hours | 2026-04-11 | no |
EOF

bash "$ROOT/calibration/lint-attempt.sh" \
  --agent-file "$ROOT/agents/clinical-care-management-specialist.md" \
  --seed-file "$SEED" \
  --attempt-file "$ATTEMPT" \
  --output "$OUTPUT"

python3 - "$OUTPUT" <<'PY'
from pathlib import Path
import sys
import yaml

data = yaml.safe_load(Path(sys.argv[1]).read_text(encoding="utf-8"))
assert data["citation_parse_failures"] == [], data["citation_parse_failures"]
assert data["overall_pass"] is True, data
print("test-lint-attempt.sh: ok")
PY
