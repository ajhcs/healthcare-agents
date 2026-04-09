#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
from pathlib import Path
from typing import Any

import yaml


CAPABILITY_TEMPLATES = {
    "provider_directory": {
        "trigger": "provider or organization identity is uncertain",
        "query_template": "Verify the provider or organization NPI, taxonomy, and practice address before finalizing the workflow",
        "materiality": "Prevents decisions based on stale provider identity data",
    },
    "provider_enrollment_status": {
        "trigger": "payer or program enrollment status is uncertain",
        "query_template": "Confirm whether the provider or organization is enrolled with the target payer or program before handoff",
        "materiality": "Avoids downstream failures caused by non-enrolled entities",
    },
    "coverage_determination": {
        "trigger": "coverage rules are uncertain for a service, item, or workflow",
        "query_template": "Check the current Medicare or payer coverage rule before finalizing the recommendation",
        "materiality": "Prevents workflows from relying on non-covered services",
    },
    "coding_edit_policy": {
        "trigger": "coding edit or modifier logic is uncertain",
        "query_template": "Verify current coding edit, modifier, and payment policy before finalizing the deliverable",
        "materiality": "Reduces avoidable denials caused by stale coding policy",
    },
    "trial_registry": {
        "trigger": "active clinical trial availability may change the next step",
        "query_template": "Search for active clinical trials relevant to the patient population, intervention, or therapeutic area",
        "materiality": "Identifies trial options that could materially change the plan",
    },
    "literature_search": {
        "trigger": "published evidence would materially strengthen the recommendation",
        "query_template": "Search the current literature for the intervention, safety issue, or practice standard at issue",
        "materiality": "Supports evidence-based recommendations with current literature",
    },
    "current_regulatory_policy": {
        "trigger": "regulatory or program rules may have changed since the workflow was last updated",
        "query_template": "Check the latest CMS, OIG, ONC, OCR, Federal Register, or comparable policy update before finalizing the workflow",
        "materiality": "Keeps guidance aligned to current regulatory requirements",
    },
    "drug_coverage_exclusion": {
        "trigger": "Part B drug coverage or exclusion status is uncertain",
        "query_template": "Check whether the drug or drug class is subject to current Part B coverage or exclusion rules",
        "materiality": "Avoids recommendations that rely on excluded or misclassified drugs",
    },
}

CAPABILITY_PATTERNS = [
    ("provider_directory", ("npi", "nppes", "provider directory", "credential")),
    ("provider_enrollment_status", ("enrollment", "pecos", "caqh", "credentialing")),
    ("coverage_determination", ("coverage", "lcd", "ncd", "medicare claims processing manual", "part b", "opps", "ipps", "medical necessity")),
    ("coding_edit_policy", ("ncci", "mue", "modifier", "carc", "rarc", "coding", "cpt", "hcpcs", "drg")),
    ("trial_registry", ("clinicaltrials", "trial", "nct")),
    ("literature_search", ("pubmed", "ahrq", "evidence", "guideline", "research")),
    ("current_regulatory_policy", ("cms", "oig", "joint commission", "federal register", "state operations manual", "onc", "ocr", "final rule", "mln", "survey")),
    ("drug_coverage_exclusion", ("sad exclusion", "asp", "drug", "part b drug")),
]

DOMAIN_OVERRIDES = {
    "healthit": "health-it",
    "operations": "operations",
    "payer": "payer",
    "pharmacy": "pharmacy",
    "pophealth": "population-health",
    "quality": "quality",
    "revenue": "revenue-cycle",
    "strategy": "strategy",
    "clinical": "clinical-operations",
}


def load_frontmatter(path: Path) -> dict[str, Any]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {}
    _, rest = text.split("---\n", 1)
    frontmatter_text, _ = rest.split("\n---\n", 1)
    data = yaml.safe_load(frontmatter_text)
    return data if isinstance(data, dict) else {}


def derive_domain(slug: str) -> str:
    prefix = slug.split("-", 1)[0]
    return DOMAIN_OVERRIDES.get(prefix, prefix)


def derive_triggers(description: str) -> list[str]:
    lowered = description.lower()
    source = description
    for marker in ("specializing in", "specialising in", "focused on", "focusing on", "covering"):
        if marker in lowered:
            start = lowered.index(marker) + len(marker)
            source = description[start:]
            break
    source = re.sub(r"\([^)]*\)", "", source)
    source = source.replace(" and ", ", ")
    source = source.replace(" -- ", ", ")
    phrases = []
    for part in re.split(r"[,;]", source):
        cleaned = re.sub(r"\s+", " ", part.strip(" .;:"))
        cleaned = re.sub(r"^(expert|end-to-end|enterprise|clinical|healthcare)\s+", "", cleaned, flags=re.I)
        cleaned = re.sub(r"\s+for health systems.*$", "", cleaned, flags=re.I)
        if cleaned and "professional standards" not in cleaned.lower():
            phrases.append(cleaned)
    deduped: list[str] = []
    seen: set[str] = set()
    for phrase in phrases:
        normalized = phrase.lower()
        if normalized in seen:
            continue
        seen.add(normalized)
        deduped.append(phrase)
    return deduped[:7]


def derive_capabilities(frontmatter: dict[str, Any], slug: str) -> list[str]:
    corpus = " ".join(
        [str(frontmatter.get("description", ""))]
        + [str(item.get("name", "")) for item in frontmatter.get("services", []) if isinstance(item, dict)]
    ).lower()
    capabilities: list[str] = []
    for capability, patterns in CAPABILITY_PATTERNS:
        if any(pattern in corpus for pattern in patterns):
            capabilities.append(capability)
    if "provider_directory" not in capabilities and slug.startswith(("payer-", "clinical-", "strategy-")):
        capabilities.append("provider_directory")
    if "current_regulatory_policy" not in capabilities:
        capabilities.append("current_regulatory_policy")
    return capabilities[:3]


def enrich_registry(registry_path: Path, repo_root: Path) -> dict[str, Any]:
    registry = yaml.safe_load(registry_path.read_text(encoding="utf-8"))
    agents = registry.get("agents", [])
    for agent in agents:
        slug = agent["slug"]
        frontmatter = load_frontmatter(repo_root / "agents" / f"{slug}.md")
        if "domain" not in agent:
            agent["domain"] = derive_domain(slug)
        if "line_budget" not in agent:
            line_count = len((repo_root / "agents" / f"{slug}.md").read_text(encoding="utf-8").splitlines())
            agent["line_budget"] = line_count + 150
        if "regulatory_refresh" not in agent:
            agent["regulatory_refresh"] = "quarterly" if not slug.startswith("strategy-") else "annually"
        if "refresh_owner" not in agent:
            agent["refresh_owner"] = "maintainer"
        if not agent.get("routing_triggers"):
            triggers = derive_triggers(str(frontmatter.get("description", "")))
            if triggers:
                agent["routing_triggers"] = triggers
        if not agent.get("tool_opportunities"):
            capabilities = derive_capabilities(frontmatter, slug)
            if capabilities:
                agent["tool_opportunities"] = [CAPABILITY_TEMPLATES[capability] | {"capability_class": capability} for capability in capabilities]
    return registry


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--registry", default="registry.yaml")
    parser.add_argument("--root", default=".")
    parser.add_argument("--output")
    args = parser.parse_args()

    repo_root = Path(args.root).resolve()
    registry_path = (repo_root / args.registry).resolve()
    enriched = enrich_registry(registry_path, repo_root)
    output_path = Path(args.output).resolve() if args.output else registry_path
    output_path.write_text(yaml.safe_dump(enriched, sort_keys=False), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
