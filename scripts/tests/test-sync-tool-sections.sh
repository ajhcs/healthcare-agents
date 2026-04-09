#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

cd "$ROOT"

cp agents/clinical-case-manager.md "$TMPDIR/clinical-case-manager.md"
cp agents/eval-exam-architect.md "$TMPDIR/eval-exam-architect.md"

python3 scripts/sync-tool-sections.py --registry registry.yaml "$TMPDIR/clinical-case-manager.md" "$TMPDIR/eval-exam-architect.md" >/dev/null

python3 - "$TMPDIR/clinical-case-manager.md" "$TMPDIR/eval-exam-architect.md" <<'PY'
from pathlib import Path
import sys

case_manager = Path(sys.argv[1]).read_text(encoding="utf-8")
utility = Path(sys.argv[2]).read_text(encoding="utf-8")

assert "## External Data & Tool Use" in case_manager
assert case_manager.index("## External Data & Tool Use") < case_manager.index("## 📋 Your Technical Deliverables")
assert "`provider_directory`" in case_manager
assert "## External Data & Tool Use" not in utility
print("test-sync-tool-sections.sh: ok")
PY
