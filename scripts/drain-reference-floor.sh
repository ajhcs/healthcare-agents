#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/drain-reference-floor.sh --root PATH --max-passes N

Runs generate-reference-bundles.py --missing-only in the foreground until the
3/3/3 coverage floor is reached or no further progress is made.
Intended to be launched under nohup.
EOF
}

ROOT=""
MAX_PASSES=50

while [[ $# -gt 0 ]]; do
  case "$1" in
    --root) ROOT="$2"; shift 2 ;;
    --max-passes) MAX_PASSES="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 1 ;;
  esac
done

if [[ -z "$ROOT" ]]; then
  usage >&2
  exit 1
fi

under_floor() {
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

cd "$ROOT"

prev=9999
pass=1
while [[ "$pass" -le "$MAX_PASSES" ]]; do
  current="$(under_floor)"
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] pass=$pass under_floor=$current"
  if [[ "$current" -eq 0 ]]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] reference floor complete"
    exit 0
  fi
  if [[ "$current" -ge "$prev" && "$pass" -gt 1 ]]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] no further progress; stopping"
    exit 1
  fi
  python3 scripts/generate-reference-bundles.py --count 3 --missing-only
  prev="$current"
  pass=$((pass + 1))
done

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] max passes reached"
exit 1
