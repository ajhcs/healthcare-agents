#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

import yaml


REPO_ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = REPO_ROOT / "registry.yaml"
AGENTS_DIR = REPO_ROOT / "agents"

DOMAIN_MAP = {
    "clinical": "clinical-operations",
    "healthit": "health-it",
    "operations": "operations",
    "payer": "payer",
    "pharmacy": "pharmacy",
    "pophealth": "population-health",
    "quality": "quality",
    "revenue": "revenue-cycle",
    "strategy": "strategy",
}
REFRESH_MAP = {
    "strategy": "annually",
    "payer": "quarterly",
    "pharmacy": "quarterly",
    "revenue": "quarterly",
    "quality": "quarterly",
    "clinical": "quarterly",
    "healthit": "quarterly",
    "operations": "quarterly",
    "pophealth": "quarterly",
}


def derive_domain(slug: str) -> str:
    if slug == "healthit-interoperability-engineer":
        return "interoperability"
    prefix = slug.split("-", 1)[0]
    return DOMAIN_MAP.get(prefix, "operations")


def derive_refresh(slug: str) -> str:
    prefix = slug.split("-", 1)[0]
    return REFRESH_MAP.get(prefix, "quarterly")


def derive_line_budget(slug: str) -> int:
    line_count = len((AGENTS_DIR / f"{slug}.md").read_text(encoding="utf-8").splitlines())
    return line_count + 150


def main() -> int:
    registry = yaml.safe_load(REGISTRY_PATH.read_text(encoding="utf-8"))
    for agent in registry.get("agents", []):
        slug = agent.get("slug")
        if not isinstance(slug, str):
            continue
        agent.setdefault("domain", derive_domain(slug))
        agent.setdefault("line_budget", derive_line_budget(slug))
        agent.setdefault("regulatory_refresh", derive_refresh(slug))
        agent.setdefault("refresh_owner", "maintainer")
        agent.setdefault("routing_triggers", [])
        agent.setdefault("tool_opportunities", [])

    REGISTRY_PATH.write_text(yaml.safe_dump(registry, sort_keys=False), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
