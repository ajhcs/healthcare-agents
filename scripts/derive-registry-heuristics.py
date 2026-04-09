#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path

import yaml


REPO_ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = REPO_ROOT / "registry.yaml"
AGENTS_DIR = REPO_ROOT / "agents"

DESCRIPTION_SPLIT_RE = re.compile(r",| and ")
CAPABILITY_PATTERNS = [
    (
        "provider_directory",
        re.compile(r"\b(npi|nppes|provider|taxonomy|caqh)\b", re.IGNORECASE),
        "Verify provider identity, taxonomy, and practice address before downstream handoffs",
        "Avoids working from stale or mismatched provider identity data",
    ),
    (
        "provider_enrollment_status",
        re.compile(r"\b(pecos|enrollment|credential|participation)\b", re.IGNORECASE),
        "Confirm payer or program enrollment status before finalizing enrollment-dependent work",
        "Prevents downstream work from assuming inactive or missing enrollment",
    ),
    (
        "coverage_determination",
        re.compile(r"\b(coverage|lcd|ncd|medicare claims processing manual|medical necessity)\b", re.IGNORECASE),
        "Check current coverage policy when reimbursement or medical-necessity rules could change the recommendation",
        "Keeps reimbursement and utilization guidance aligned with active policy",
    ),
    (
        "coding_edit_policy",
        re.compile(r"\b(ncci|carc|rarc|hcpcs|cpt|drg|coding)\b", re.IGNORECASE),
        "Verify current coding-edit, modifier, or payment-edit logic before finalizing the deliverable",
        "Avoids stale code-edit assumptions and preventable denials",
    ),
    (
        "literature_search",
        re.compile(r"\b(pubmed|ahrq|psnet|ecri|evidence)\b", re.IGNORECASE),
        "Review current evidence when the recommendation depends on recent literature or safety findings",
        "Keeps evidence-backed guidance current",
    ),
    (
        "trial_registry",
        re.compile(r"\b(clinicaltrials|trial)\b", re.IGNORECASE),
        "Check trial availability or trial metadata before routing research work",
        "Prevents missed research or trial-enrollment opportunities",
    ),
    (
        "current_regulatory_policy",
        re.compile(r"\b(cms|oig|joint commission|federal register|onc|hrsa|final rule|manual)\b", re.IGNORECASE),
        "Check the latest regulatory or payer guidance before finalizing time-sensitive compliance advice",
        "Prevents stale policy assumptions from entering the deliverable",
    ),
]
STOP_PHRASES = {
    "expert",
    "specializing in",
    "covering",
    "end-to-end",
    "for hospitals and physician practices",
    "for health systems",
}


def parse_frontmatter(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {}
    parts = text.split("\n---\n", 1)
    if len(parts) != 2:
        return {}
    return yaml.safe_load(parts[0].split("\n", 1)[1]) or {}


def normalize_phrase(phrase: str) -> str:
    text = phrase.strip(" .")
    for stop in STOP_PHRASES:
        text = re.sub(re.escape(stop), "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s+", " ", text).strip(" ,.-")
    return text.lower()


def derive_triggers(description: str, deliverables: list[dict]) -> list[str]:
    seed = description
    for marker in ("specializing in", "covering"):
        if marker in description.lower():
            start = description.lower().index(marker) + len(marker)
            seed = description[start:]
            break

    phrases = [normalize_phrase(part) for part in DESCRIPTION_SPLIT_RE.split(seed)]
    cleaned = []
    for phrase in phrases:
        if not phrase or len(phrase) < 4:
            continue
        if phrase.startswith("the person who"):
            continue
        cleaned.append(phrase)

    if len(cleaned) < 5:
        for deliverable in deliverables:
            title = str(deliverable.get("title", "")).replace("Checklist", "").replace("Report", "").replace("Assessment", "")
            phrase = normalize_phrase(title)
            if phrase and phrase not in cleaned:
                cleaned.append(phrase)

    deduped = []
    for phrase in cleaned:
        if phrase not in deduped:
            deduped.append(phrase)
    return deduped[:7]


def derive_tool_opportunities(frontmatter: dict) -> list[dict]:
    services = frontmatter.get("services") or []
    opportunities = []
    seen = set()
    haystacks = []
    for service in services:
        if isinstance(service, dict):
            haystacks.append(f"{service.get('name', '')} {service.get('url', '')}")
    haystacks.append(frontmatter.get("description", ""))

    for capability_class, pattern, query_template, materiality in CAPABILITY_PATTERNS:
        for haystack in haystacks:
            if pattern.search(str(haystack)):
                if capability_class in seen:
                    break
                opportunities.append(
                    {
                        "trigger": str(haystack).split(" - ", 1)[0].strip()[:120] or capability_class,
                        "capability_class": capability_class,
                        "query_template": query_template,
                        "materiality": materiality,
                    }
                )
                seen.add(capability_class)
                break
        if len(opportunities) >= 3:
            break

    if not opportunities:
        opportunities.append(
            {
                "trigger": "current policy or program guidance may have changed",
                "capability_class": "current_regulatory_policy",
                "query_template": "Check the latest CMS, OIG, or payer guidance relevant to this workflow before finalizing the recommendation",
                "materiality": "Prevents stale regulatory assumptions from entering the deliverable",
            }
        )
    return opportunities


def main() -> int:
    registry = yaml.safe_load(REGISTRY_PATH.read_text(encoding="utf-8"))
    for agent in registry.get("agents", []):
        slug = agent.get("slug")
        if not isinstance(slug, str):
            continue
        frontmatter = parse_frontmatter(AGENTS_DIR / f"{slug}.md")
        description = str(frontmatter.get("description", "")).strip()
        if not agent.get("routing_triggers"):
            agent["routing_triggers"] = derive_triggers(description, agent.get("deliverables", []))
        if not agent.get("tool_opportunities"):
            agent["tool_opportunities"] = derive_tool_opportunities(frontmatter)

    REGISTRY_PATH.write_text(yaml.safe_dump(registry, sort_keys=False), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
