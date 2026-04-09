#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

import yaml


DOMAIN_BY_PREFIX = {
    "clinical": "clinical-operations",
    "healthit": "health-it",
    "operations": "operations",
    "emergency": "operations",
    "payer": "payer",
    "pharmacy": "pharmacy",
    "pophealth": "population-health",
    "quality": "quality",
    "revenue": "revenue-cycle",
    "strategy": "strategy",
}
ANNUAL_PREFIXES = {"strategy"}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("registry", nargs="?", default="registry.yaml")
    args = parser.parse_args()

    registry_path = Path(args.registry)
    data = yaml.safe_load(registry_path.read_text(encoding="utf-8")) or {}
    agents = data.get("agents", [])

    for agent in agents:
        slug = agent["slug"]
        prefix = slug.split("-", 1)[0]
        if "domain" not in agent:
            agent["domain"] = DOMAIN_BY_PREFIX.get(prefix, "operations")
        if "routing_triggers" not in agent:
            agent["routing_triggers"] = []
        if "tool_opportunities" not in agent:
            agent["tool_opportunities"] = []
        if "line_budget" not in agent:
            agent_file = Path("agents") / f"{slug}.md"
            line_count = len(agent_file.read_text(encoding="utf-8").splitlines())
            agent["line_budget"] = line_count + 150
        if "regulatory_refresh" not in agent:
            agent["regulatory_refresh"] = "annually" if prefix in ANNUAL_PREFIXES else "quarterly"
        if "refresh_owner" not in agent:
            agent["refresh_owner"] = "maintainer"

    registry_path.write_text(yaml.safe_dump(data, sort_keys=False), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
