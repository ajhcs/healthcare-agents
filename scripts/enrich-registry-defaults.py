#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
from pathlib import Path
from typing import Any

import yaml


SPECIALTIES_RE = re.compile(r"specializing in (.+?)(?:\.\s|$)", re.IGNORECASE)
TRIGGER_SPLIT_RE = re.compile(r",| and ")


def parse_frontmatter(path: Path) -> dict[str, Any]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {}
    parts = text.split("\n---\n", 1)
    if len(parts) != 2:
        return {}
    return yaml.safe_load(parts[0].split("\n", 1)[1]) or {}


def file_line_count(path: Path) -> int:
    return len(path.read_text(encoding="utf-8").splitlines())


def infer_domain(slug: str) -> str:
    if slug.startswith("clinical-"):
        return "clinical-operations"
    if slug.startswith("healthit-"):
        return "health-it"
    if slug.startswith("operations-") or slug == "emergency-preparedness-coordinator":
        return "operations"
    if slug.startswith("payer-"):
        return "payer"
    if slug.startswith("pharmacy-"):
        return "pharmacy"
    if slug.startswith("pophealth-"):
        return "population-health"
    if slug.startswith("quality-"):
        return "quality"
    if slug.startswith("revenue-"):
        return "revenue-cycle"
    if slug.startswith("strategy-"):
        return "strategy"
    return "general"


def infer_refresh(domain: str) -> str:
    return "annually" if domain == "strategy" else "quarterly"


def normalize_trigger(text: str) -> str:
    cleaned = text.strip().strip(".")
    cleaned = cleaned.replace("  ", " ")
    if cleaned.startswith("(") and cleaned.endswith(")"):
        cleaned = cleaned[1:-1].strip()
    return cleaned


def infer_triggers(slug: str, frontmatter: dict[str, Any], deliverables: list[dict[str, Any]]) -> list[str]:
    description = str(frontmatter.get("description", "")).strip()
    candidates: list[str] = []
    match = SPECIALTIES_RE.search(description)
    if match:
        raw = match.group(1)
        for part in TRIGGER_SPLIT_RE.split(raw):
            trigger = normalize_trigger(part)
            if trigger and len(trigger) <= 60:
                candidates.append(trigger)

    if not candidates:
        candidates.append(slug.replace("-", " "))

    for deliverable in deliverables:
        title = str(deliverable.get("title", "")).strip()
        if title:
            candidates.append(title)

    deduped: list[str] = []
    seen: set[str] = set()
    for item in candidates:
        item = item.strip(" -")
        lower = item.lower()
        if not item or lower in seen:
            continue
        seen.add(lower)
        deduped.append(item)
        if len(deduped) >= 7:
            break
    return deduped


def capability(trigger: str, capability_class: str, materiality: str) -> dict[str, str]:
    return {
        "trigger": trigger,
        "capability_class": capability_class,
        "query_template": trigger,
        "materiality": materiality,
    }


def infer_tool_opportunities(slug: str, domain: str) -> list[dict[str, str]]:
    opportunities: list[dict[str, str]] = []
    lowered = slug.lower()

    if any(token in lowered for token in ("coding", "chargemaster", "cdi")):
        opportunities.append(capability("Verify code-pair logic, modifier rules, or edit-policy constraints before finalizing the work product", "coding_edit_policy", "Prevents avoidable denials and stale coding guidance."))
        opportunities.append(capability("Check current Medicare coverage policy when procedure eligibility or billability is uncertain", "coverage_determination", "Avoids recommending non-covered coding or billing pathways."))
    elif any(token in lowered for token in ("research", "trial")):
        opportunities.append(capability("Search active clinical trials when eligibility, phase, or site availability could change the recommendation", "trial_registry", "Adds live trial availability to research coordination work."))
        opportunities.append(capability("Search biomedical literature when evidence strength or recent studies materially affect the recommendation", "literature_search", "Keeps research and evidence summaries current."))
    elif any(token in lowered for token in ("pharmacy", "340b", "medication")):
        opportunities.append(capability("Check current drug coverage or exclusion logic when benefit design or Part B eligibility is uncertain", "drug_coverage_exclusion", "Prevents stale drug coverage advice."))
        opportunities.append(capability("Check current Medicare or payer coverage policy when medication benefit eligibility is uncertain", "coverage_determination", "Improves benefit and medication-access recommendations."))
    elif any(token in lowered for token in ("prior-authorization", "utilization")):
        opportunities.append(capability("Check current coverage policy when medical necessity or authorization criteria are uncertain", "coverage_determination", "Keeps utilization and authorization recommendations aligned to live policy."))
    elif any(token in lowered for token in ("care-management", "case-manager", "referral", "credentialing")):
        opportunities.append(capability("Verify provider identity, NPI, taxonomy, or practice address before routing a referral or handoff", "provider_directory", "Reduces failed transitions caused by identity or directory mismatches."))
        opportunities.append(capability("Confirm payer or program enrollment before referral, credentialing, or network-routing decisions", "provider_enrollment_status", "Prevents handoffs to non-enrolled providers or facilities."))
    elif any(token in lowered for token in ("interoperability", "telehealth")):
        opportunities.append(capability("Verify organization identity and location details before onboarding a partner or telehealth endpoint", "provider_directory", "Reduces endpoint, organization, and directory mismatches."))

    if not any(item["capability_class"] == "current_regulatory_policy" for item in opportunities):
        opportunities.append(capability("Check current CMS, Federal Register, or comparable policy updates when requirements may have changed", "current_regulatory_policy", "Keeps the prompt aligned to current regulatory expectations."))

    if domain in {"quality", "operations", "strategy"} and not any(item["capability_class"] == "provider_directory" for item in opportunities):
        opportunities.insert(0, capability("Verify provider or facility identity details before finalizing external-facing recommendations", "provider_directory", "Reduces identity and entity-matching errors in operational recommendations."))

    deduped: list[dict[str, str]] = []
    seen: set[str] = set()
    for item in opportunities:
        cls = item["capability_class"]
        if cls in seen:
            continue
        seen.add(cls)
        deduped.append(item)
        if len(deduped) >= 3:
            break
    return deduped


def enrich_registry(registry: dict[str, Any], repo_root: Path) -> dict[str, Any]:
    for agent in registry.get("agents", []):
        slug = agent["slug"]
        agent_path = repo_root / "agents" / f"{slug}.md"
        frontmatter = parse_frontmatter(agent_path)
        line_count = file_line_count(agent_path)
        domain = agent.get("domain") or infer_domain(slug)
        agent["domain"] = domain
        if not agent.get("routing_triggers"):
            agent["routing_triggers"] = infer_triggers(slug, frontmatter, agent.get("deliverables", []))
        if not agent.get("tool_opportunities"):
            agent["tool_opportunities"] = infer_tool_opportunities(slug, domain)
        if not agent.get("line_budget"):
            agent["line_budget"] = line_count + 150
        if not agent.get("regulatory_refresh"):
            agent["regulatory_refresh"] = infer_refresh(domain)
        if not agent.get("refresh_owner"):
            agent["refresh_owner"] = "maintainer"
    return registry


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("registry", nargs="?", default="registry.yaml")
    args = parser.parse_args()

    registry_path = Path(args.registry).resolve()
    repo_root = registry_path.parent
    data = yaml.safe_load(registry_path.read_text(encoding="utf-8")) or {}
    enriched = enrich_registry(data, repo_root)
    registry_path.write_text(yaml.safe_dump(enriched, sort_keys=False), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
