#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path

import yaml


CAPABILITY_MATERIALITY = {
    "provider_directory": "Prevents work from being routed to the wrong clinician, organization, or facility",
    "provider_enrollment_status": "Avoids downstream work on providers or entities that are not enrolled with the target payer or program",
    "coverage_determination": "Prevents recommendations that rely on non-covered services or procedures",
    "coding_edit_policy": "Catches coding logic conflicts before they become denials or rework",
    "trial_registry": "Surfaces live trial opportunities that materially change research coordination work",
    "literature_search": "Adds current evidence when the deliverable depends on research or guideline support",
    "current_regulatory_policy": "Keeps the deliverable aligned with current CMS, OIG, ONC, OCR, or similar policy updates",
    "drug_coverage_exclusion": "Avoids using drug coverage assumptions that are excluded or handled under different benefit rules",
}

GENERIC_QUERY = {
    "provider_directory": "Verify the provider or organization identity, taxonomy, and practice address before finalizing the deliverable",
    "provider_enrollment_status": "Confirm whether the provider or organization is enrolled with the relevant payer or program before finalizing the recommendation",
    "coverage_determination": "Check whether the target service, procedure, or item is covered before finalizing the recommendation",
    "coding_edit_policy": "Verify coding edit logic, modifier policy, and related billing rules before finalizing the deliverable",
    "trial_registry": "Search for active trials that materially affect the recommendation or research workflow",
    "literature_search": "Search current literature or guideline evidence relevant to the decision point",
    "current_regulatory_policy": "Check the latest regulatory or payment-policy updates relevant to this workflow before finalizing the deliverable",
    "drug_coverage_exclusion": "Check drug coverage and exclusion logic before finalizing the medication or reimbursement recommendation",
}

DESCRIPTION_RE = re.compile(r"specializing in (.+?)(?:\.|$)", re.IGNORECASE)
TOKEN_SPLIT_RE = re.compile(r",|/| and ")
TRIM_CHARS = " ."


def read_frontmatter(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {}
    parts = text.split("\n---\n", 1)
    if len(parts) != 2:
        return {}
    frontmatter = yaml.safe_load(parts[0].split("\n", 1)[1])
    return frontmatter if isinstance(frontmatter, dict) else {}


def normalize_phrase(text: str) -> str:
    return text.strip(TRIM_CHARS).strip().lower()


def bootstrap_triggers(frontmatter: dict, deliverables: list[dict]) -> list[str]:
    candidates: list[str] = []
    description = str(frontmatter.get("description", ""))
    match = DESCRIPTION_RE.search(description)
    if match:
        for part in TOKEN_SPLIT_RE.split(match.group(1)):
            normalized = normalize_phrase(part)
            if normalized and len(normalized) <= 40:
                candidates.append(normalized)
    for deliverable in deliverables:
        title = normalize_phrase(str(deliverable.get("title", "")))
        for suffix in (" report", " plan", " checklist", " dashboard", " scorecard", " assessment", " analysis", " tracker", " worksheet", " roadmap", " summary", " charter"):
            if title.endswith(suffix):
                title = title[: -len(suffix)]
                break
        if title:
            candidates.append(title)
    deduped: list[str] = []
    seen: set[str] = set()
    for candidate in candidates:
        if candidate and candidate not in seen:
            deduped.append(candidate)
            seen.add(candidate)
        if len(deduped) >= 7:
            break
    return deduped


def infer_capabilities(frontmatter: dict, slug: str) -> list[str]:
    text = " ".join(
        [
            slug,
            str(frontmatter.get("description", "")),
            " ".join(str(service.get("name", "")) for service in frontmatter.get("services", []) if isinstance(service, dict)),
        ]
    ).lower()
    capabilities: list[str] = []

    def add(capability: str) -> None:
        if capability not in capabilities:
            capabilities.append(capability)

    if any(token in text for token in ("provider", "credential", "referral", "npi", "taxonomy", "practice address")):
        add("provider_directory")
    if any(token in text for token in ("enrollment", "pecos", "caqh", "payer")):
        add("provider_enrollment_status")
    if any(token in text for token in ("coverage", "prior authorization", "medical necessity", "medicare", "procedure", "service line")):
        add("coverage_determination")
    if any(token in text for token in ("coding", "cpt", "icd", "modifier", "ncci", "chargemaster", "drg")):
        add("coding_edit_policy")
    if any(token in text for token in ("trial", "research coordinator", "eligibility", "clinical research")):
        add("trial_registry")
    if any(token in text for token in ("evidence", "guideline", "literature", "infection prevention", "patient safety", "clinical intervention")):
        add("literature_search")
    if any(token in text for token in ("pharmacy", "drug", "part b", "formulary", "benefit")):
        add("drug_coverage_exclusion")
    add("current_regulatory_policy")
    return capabilities[:3]


def capability_trigger(capability: str, frontmatter: dict) -> str:
    name = str(frontmatter.get("name", "this workflow"))
    if capability == "provider_directory":
        return f"provider or organization identity is uncertain during {name.lower()} work"
    if capability == "provider_enrollment_status":
        return f"payer or program enrollment status is uncertain during {name.lower()} work"
    if capability == "coverage_determination":
        return f"coverage status is uncertain for a service, procedure, or item in {name.lower()} work"
    if capability == "coding_edit_policy":
        return f"coding or modifier rules are uncertain during {name.lower()} work"
    if capability == "trial_registry":
        return f"active trial availability could materially change the {name.lower()} recommendation"
    if capability == "literature_search":
        return f"current evidence could materially change the {name.lower()} recommendation"
    if capability == "drug_coverage_exclusion":
        return f"drug coverage or exclusion logic is uncertain during {name.lower()} work"
    return f"recent policy changes may affect {name.lower()} recommendations"


def bootstrap_tool_opportunities(frontmatter: dict, slug: str) -> list[dict]:
    opportunities = []
    for capability in infer_capabilities(frontmatter, slug):
        opportunities.append(
            {
                "trigger": capability_trigger(capability, frontmatter),
                "capability_class": capability,
                "query_template": GENERIC_QUERY[capability],
                "materiality": CAPABILITY_MATERIALITY[capability],
            }
        )
    return opportunities


def main() -> int:
    repo_root = Path(__file__).resolve().parent.parent
    registry_path = repo_root / "registry.yaml"
    registry = yaml.safe_load(registry_path.read_text(encoding="utf-8")) or {}

    for agent in registry.get("agents", []):
        slug = agent["slug"]
        agent_file = repo_root / "agents" / f"{slug}.md"
        frontmatter = read_frontmatter(agent_file)
        if not agent.get("routing_triggers"):
            agent["routing_triggers"] = bootstrap_triggers(frontmatter, agent.get("deliverables", []))
        if not agent.get("tool_opportunities"):
            agent["tool_opportunities"] = bootstrap_tool_opportunities(frontmatter, slug)

    registry_path.write_text(yaml.safe_dump(registry, sort_keys=False), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
