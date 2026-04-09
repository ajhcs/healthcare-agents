#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

python3 - "$ROOT/registry.yaml" "$ROOT/agents" <<'PY'
from __future__ import annotations

import re
import sys
from pathlib import Path

import yaml


registry_path = Path(sys.argv[1])
agents_dir = Path(sys.argv[2])
registry = yaml.safe_load(registry_path.read_text(encoding="utf-8")) or {}

errors: list[str] = []

for agent in registry.get("agents", []):
    curated = (
        bool(agent.get("tool_opportunities"))
        and "line_budget" in agent
        and "regulatory_refresh" in agent
        and "refresh_owner" in agent
    )
    if not curated:
        continue

    slug = agent["slug"]
    path = agents_dir / f"{slug}.md"
    if not path.exists():
        errors.append(f"{path}: missing agent file")
        continue

    text = path.read_text(encoding="utf-8")
    if "## External Data & Tool Use" not in text:
        errors.append(f"{path}: missing External Data & Tool Use section")
    if "## What Auditors Actually Challenge" not in text:
        errors.append(f"{path}: missing What Auditors Actually Challenge section")

    attack_markers = re.findall(r"<!-- attack-surface: [^>]+ -->", text)
    if not 4 <= len(attack_markers) <= 6:
        errors.append(f"{path}: expected 4-6 attack-surface markers, found {len(attack_markers)}")

    for marker in attack_markers:
        block_start = text.find(marker)
        next_marker = text.find("<!-- attack-surface:", block_start + len(marker))
        next_section = text.find("\n## ", block_start + len(marker))
        candidates = [value for value in [next_marker, next_section] if value != -1]
        block_end = min(candidates) if candidates else len(text)
        block = text[block_start:block_end]
        for token in ["- **Source**:", "- **Evidence type**:", "- **Source confidence**:", "- **As of**:"]:
            if token not in block:
                errors.append(f"{path}: {marker} missing provenance field {token}")

    capabilities = [entry.get("capability_class") for entry in agent.get("tool_opportunities", [])]
    if capabilities and not any(capability in text for capability in capabilities if isinstance(capability, str)):
        errors.append(f"{path}: none of the registry capability classes appear in the prompt")

if errors:
    raise SystemExit("\n".join(errors))

print("test-pilot-agent-upgrades.sh: ok")
PY
