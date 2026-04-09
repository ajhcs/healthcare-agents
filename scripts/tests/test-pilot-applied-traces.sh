#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

python3 - "$ROOT/registry.yaml" "$ROOT/calibration/applied" <<'PY'
from __future__ import annotations

import sys
from pathlib import Path

import yaml

registry = yaml.safe_load(Path(sys.argv[1]).read_text(encoding="utf-8")) or {}
applied_dir = Path(sys.argv[2])

missing: list[str] = []
for agent in registry.get("agents", []):
    slug = agent["slug"]
    path = applied_dir / f"{slug}.yaml"
    if not path.exists():
        missing.append(str(path))

if missing:
    raise SystemExit("missing pilot applied trace(s):\n" + "\n".join(missing))

print("test-pilot-applied-traces.sh: ok")
PY

python3 "$ROOT/scripts/validate-calibration-artifacts.py" "$ROOT/calibration/applied"/*.yaml >/dev/null
