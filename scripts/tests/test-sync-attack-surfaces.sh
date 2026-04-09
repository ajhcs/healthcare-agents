#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

cd "$ROOT"

python3 - "$ROOT/agents/clinical-case-manager.md" "$TMPDIR/clinical-case-manager.md" <<'PY'
from pathlib import Path
import re
import sys

source = Path(sys.argv[1]).read_text(encoding="utf-8")
target = Path(sys.argv[2])
pattern = re.compile(r"\n## What Auditors Actually Challenge\b.*?(?=\n## (?:🔄 Learning & Memory|📋 Your Technical Deliverables)\b)", re.S)
cleaned = pattern.sub("\n", source, count=1)
target.write_text(cleaned, encoding="utf-8")
PY

PROVIDER="$TMPDIR/provider.sh"
cat > "$PROVIDER" <<'EOF'
#!/usr/bin/env bash
cat <<'MARKDOWN'
## What Auditors Actually Challenge

<!-- attack-surface: missing-choice -->
### 1. Missing Patient Choice Documentation
- **What goes wrong**: The record does not show that the patient had meaningful choice among post-acute options.
- **Why it's caught**: Surveyors review discharge files for documented patient choice and provider-list workflows.
- **How to prevent it**: Use a discharge checklist that captures alternatives offered, patient preference, and the final selection rationale.
- **Source**: CMS discharge planning requirements
- **Evidence type**: CFR
- **Source confidence**: high
- **As of**: 2026-04-09

<!-- attack-surface: late-auth -->
### 2. Late Post-Acute Authorization
- **What goes wrong**: Authorization starts after the accepting facility is identified, causing avoidable days.
- **Why it's caught**: Utilization and throughput reviews compare avoidable-day root causes to authorization timing.
- **How to prevent it**: Trigger authorization work as soon as post-acute placement is likely and track it in daily rounds.
- **Source**: Internal utilization review expectations and payer audit patterns
- **Evidence type**: payer_pattern
- **Source confidence**: medium
- **As of**: 2026-04-09

<!-- attack-surface: unresolved-barriers -->
### 3. Discharge Barriers Logged But Not Closed
- **What goes wrong**: The case manager documents barriers but never assigns a single owner and target date.
- **Why it's caught**: Length-of-stay and avoidable-day reviews compare barrier logs to resolution actions.
- **How to prevent it**: Require owner, due date, and status on every barrier tracked in rounds.
- **Source**: Case management throughput review standards
- **Evidence type**: published_audit_report
- **Source confidence**: medium
- **As of**: 2026-04-09

<!-- attack-surface: transfer-packet -->
### 4. Incomplete Post-Acute Transfer Packet
- **What goes wrong**: Medication, DME, or clinical summary details are missing from the packet sent to the receiving setting.
- **Why it's caught**: Post-acute transfer failures and survey reviews trace readmissions back to incomplete handoff documentation.
- **How to prevent it**: Require a transfer-packet checklist and confirmation before transport.
- **Source**: CMS transfer-of-care and discharge planning expectations
- **Evidence type**: CFR
- **Source confidence**: medium
- **As of**: 2026-04-09
MARKDOWN
EOF
chmod +x "$PROVIDER"

python3 scripts/sync-attack-surfaces.py --registry registry.yaml --provider-cmd "$PROVIDER" "$TMPDIR/clinical-case-manager.md" >/dev/null

python3 - "$TMPDIR/clinical-case-manager.md" <<'PY'
from pathlib import Path
import sys

text = Path(sys.argv[1]).read_text(encoding="utf-8")
assert "## What Auditors Actually Challenge" in text
assert text.count("<!-- attack-surface:") == 4
assert text.index("## What Auditors Actually Challenge") < text.index("## 🔄 Learning & Memory")
print("test-sync-attack-surfaces.sh: ok")
PY
