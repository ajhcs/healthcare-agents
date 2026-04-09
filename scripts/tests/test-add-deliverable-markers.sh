#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

cd "$ROOT"

cp scripts/test-fixtures/registry/missing-markers.md "$TMPDIR/missing-markers.md"
cp scripts/test-fixtures/registry/eval-exam-architect.md "$TMPDIR/eval-exam-architect.md"

cat > "$TMPDIR/fenced.md" <<'EOF'
---
name: Fenced Marker Agent
description: Fixture for fence-aware marker insertion.
---

# Fenced Marker Agent

## 📋 Your Technical Deliverables

### Outbreak Response Plan

```markdown
### Person
- This heading is inside a fenced template and must not get a marker.
```

### Syndromic Surveillance Dashboard
EOF

! python3 scripts/add-deliverable-markers.py --check "$TMPDIR/missing-markers.md" >/dev/null 2>&1

python3 scripts/add-deliverable-markers.py "$TMPDIR/missing-markers.md" "$TMPDIR/eval-exam-architect.md" "$TMPDIR/fenced.md" >/dev/null

python3 - "$TMPDIR/missing-markers.md" "$TMPDIR/eval-exam-architect.md" "$TMPDIR/fenced.md" <<'PY'
from pathlib import Path
import sys

missing = Path(sys.argv[1]).read_text(encoding="utf-8")
utility = Path(sys.argv[2]).read_text(encoding="utf-8")
fenced = Path(sys.argv[3]).read_text(encoding="utf-8")

assert "<!-- deliverable: Lone Heading -->" in missing
assert utility.count("<!-- deliverable: Exam Item Bank -->") == 1
assert fenced.count("<!-- deliverable: Outbreak Response Plan -->") == 1
assert fenced.count("<!-- deliverable: Syndromic Surveillance Dashboard -->") == 1
assert "<!-- deliverable: Person -->" not in fenced
print("test-add-deliverable-markers.sh: ok")
PY
