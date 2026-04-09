#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time
from dataclasses import dataclass
from datetime import UTC, date, datetime
from pathlib import Path
from typing import Any

import yaml


ALLOWED_CAPABILITIES = {
    "provider_directory",
    "provider_enrollment_status",
    "coverage_determination",
    "coding_edit_policy",
    "trial_registry",
    "literature_search",
    "current_regulatory_policy",
    "drug_coverage_exclusion",
}
ALLOWED_COMPLEXITY = {"routine", "moderate", "high"}
DEFAULT_PROVIDER = "./scripts/providers/codex-gpt54-medium.sh"
DEFAULT_MODEL_LABEL = "gpt-5.4-medium"
DEFAULT_PROVIDER_TIMEOUT_SECS = 900
DEFAULT_PROVIDER_ATTEMPTS = 3
DEFAULT_PROVIDER_RETRY_SLEEP_SECS = 2.0
TODAY = date.today().isoformat()


@dataclass
class ScenarioBundle:
    scenario_key: str
    deliverable_id: str
    deliverable_title: str
    complexity: str
    scenario_summary: str
    source_basis: list[str]
    body_markdown: str
    mcp_servers_relevant: list[str] | None = None
    expectations: list[str] | None = None
    required_facts: dict[str, Any] | None = None
    intentionally_unknown: list[str] | None = None
    red_flags: dict[str, Any] | None = None
    mcp_uncertainty_points: list[dict[str, str]] | None = None


def fail(message: str) -> None:
    raise SystemExit(f"error: {message}")


def load_yaml(path: Path) -> Any:
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def load_registry(path: Path) -> dict[str, Any]:
    data = load_yaml(path)
    if not isinstance(data, dict):
        fail(f"{path}: registry must be a mapping")
    return data


def read_prompt(template_path: Path, replacements: dict[str, str]) -> str:
    prompt = template_path.read_text(encoding="utf-8")
    for key, value in replacements.items():
        prompt = prompt.replace(key, value)
    return prompt


def strip_code_fence(text: str) -> str:
    stripped = text.strip()
    if not stripped.startswith("```"):
        return stripped
    lines = stripped.splitlines()
    if len(lines) >= 3 and lines[-1].strip() == "```":
        return "\n".join(lines[1:-1]).strip()
    return stripped


def trim_to_bundle_mapping(text: str) -> str:
    lines = text.splitlines()
    start_index: int | None = None
    for idx, line in enumerate(lines):
        if line.startswith("example_scenarios:") or line.startswith("holdout_scenarios:"):
            start_index = idx
            break
    if start_index is None:
        return text.strip()
    return "\n".join(lines[start_index:]).strip()


def remove_standalone_yaml_markers(text: str) -> str:
    cleaned_lines: list[str] = []
    for idx, line in enumerate(text.splitlines()):
        stripped = line.strip()
        if stripped == "...":
            continue
        if stripped == "---" and idx != 0:
            continue
        cleaned_lines.append(line)
    return "\n".join(cleaned_lines).strip()


def model_yaml_candidates(text: str) -> list[str]:
    stripped = strip_code_fence(text)
    candidates: list[str] = []
    seen: set[str] = set()

    def add(candidate: str) -> None:
        normalized = candidate.strip()
        if normalized and normalized not in seen:
            candidates.append(normalized)
            seen.add(normalized)

    trimmed = trim_to_bundle_mapping(stripped)
    add(stripped)
    add(trimmed)
    add(remove_standalone_yaml_markers(stripped))
    add(remove_standalone_yaml_markers(trimmed))
    return candidates


def parse_model_yaml(text: str) -> dict[str, Any]:
    errors: list[str] = []
    for candidate in model_yaml_candidates(text):
        try:
            data = yaml.safe_load(candidate)
        except yaml.YAMLError as exc:
            errors.append(str(exc))
            continue
        if isinstance(data, dict):
            return data
        errors.append("provider output was not a YAML mapping")
    detail = errors[-1] if errors else "no parse candidates generated"
    fail(f"provider output was not valid recoverable YAML: {detail}")


def run_provider(
    provider_cmd: str,
    prompt: str,
    *,
    timeout_secs: int,
    attempts: int = DEFAULT_PROVIDER_ATTEMPTS,
) -> str:
    errors: list[str] = []
    retry_sleep_secs = DEFAULT_PROVIDER_RETRY_SLEEP_SECS
    for attempt in range(1, attempts + 1):
        try:
            result = subprocess.run(
                ["bash", "-lc", provider_cmd],
                input=prompt,
                text=True,
                capture_output=True,
                check=False,
                timeout=timeout_secs,
            )
        except subprocess.TimeoutExpired:
            errors.append(f"attempt {attempt}/{attempts}: provider command timed out after {timeout_secs}s")
            if attempt < attempts:
                time.sleep(retry_sleep_secs)
            continue
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout
        if result.returncode != 0:
            detail = result.stderr.strip() or "provider command failed"
        else:
            detail = "provider returned empty output"
        errors.append(f"attempt {attempt}/{attempts}: {detail}")
        if attempt < attempts:
            time.sleep(retry_sleep_secs)
    fail("; ".join(errors))


def slugify(text: str) -> str:
    normalized = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    normalized = re.sub(r"-{2,}", "-", normalized)
    return normalized or "scenario"


def sanitize_body(body: str) -> str:
    cleaned = body.strip()
    cleaned = cleaned.replace("\r\n", "\n")
    return cleaned + "\n"


def ensure_string(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        fail(f"missing or empty {field}")
    return value.strip()


def ensure_list_of_strings(value: Any, field: str, *, allow_empty: bool = False) -> list[str]:
    if not isinstance(value, list):
        fail(f"{field} must be a list")
    cleaned: list[str] = []
    for item in value:
        if not isinstance(item, str) or not item.strip():
            fail(f"{field} must contain only non-empty strings")
        cleaned.append(item.strip())
    if not allow_empty and not cleaned:
        fail(f"{field} must not be empty")
    return cleaned


def normalize_source_basis(value: Any, field: str) -> list[str]:
    if not isinstance(value, list):
        fail(f"{field} must be a list")
    cleaned: list[str] = []
    seen: set[str] = set()
    for item in value:
        if item is None:
            continue
        if isinstance(item, (int, float, bool)):
            normalized_item = str(item)
        elif isinstance(item, str):
            normalized_item = item
        else:
            fail(f"{field} must contain only strings")
        normalized = re.sub(r"\s+", " ", normalized_item).strip()
        if not normalized:
            continue
        if normalized not in seen:
            cleaned.append(normalized)
            seen.add(normalized)
    if not cleaned:
        fail(f"{field} must contain at least one non-empty string")
    return cleaned


def ensure_mapping(value: Any, field: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        fail(f"{field} must be a mapping")
    return value


def normalize_mapping(value: Any, field: str) -> dict[str, Any]:
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        normalized = re.sub(r"\s+", " ", value).strip()
        if normalized:
            return {"noted_item_01": normalized}
        fail(f"{field} must be a mapping")
    if isinstance(value, list):
        out: dict[str, Any] = {}
        for index, item in enumerate(value, start=1):
            if item is None:
                continue
            if isinstance(item, dict):
                for key, item_value in item.items():
                    key_text = re.sub(r"\s+", " ", str(key)).strip()
                    if key_text:
                        out[key_text] = item_value
                continue
            normalized = re.sub(r"\s+", " ", str(item)).strip()
            if normalized:
                out[f"noted_item_{index:02d}"] = normalized
        if out:
            return out
    fail(f"{field} must be a mapping")


def normalize_capabilities(value: Any, fallback: list[str]) -> list[str]:
    if not isinstance(value, list) or not value:
        return fallback[:3]
    out: list[str] = []
    for item in value:
        if isinstance(item, str) and item.strip() in ALLOWED_CAPABILITIES and item.strip() not in out:
            out.append(item.strip())
    return out or fallback[:3]


def normalize_uncertainty_points(value: Any, fallback: list[str]) -> list[dict[str, str]]:
    if not isinstance(value, list) or not value:
        points: list[dict[str, str]] = []
        for capability in fallback[:2]:
            points.append(
                {
                    "fact": f"live fact for {capability.replace('_', ' ')}",
                    "capability_class": capability,
                    "action": f"verify the live fact with {capability} before final handoff",
                }
            )
        return points
    normalized: list[dict[str, str]] = []
    for item in value:
        if not isinstance(item, dict):
            continue
        fact = str(item.get("fact", "")).strip()
        capability = str(item.get("capability_class", "")).strip()
        action = str(item.get("action", "")).strip()
        if fact and capability in ALLOWED_CAPABILITIES and action:
            normalized.append({"fact": fact, "capability_class": capability, "action": action})
    if normalized:
        return normalized
    return normalize_uncertainty_points([], fallback)


def parse_bundle(item: dict[str, Any], *, fallback_capabilities: list[str], kind: str) -> ScenarioBundle:
    scenario_key = slugify(ensure_string(item.get("scenario_key"), f"{kind}.scenario_key"))
    deliverable_id = ensure_string(item.get("deliverable_id"), f"{kind}.deliverable_id")
    deliverable_title = ensure_string(item.get("deliverable_title"), f"{kind}.deliverable_title")
    complexity = ensure_string(item.get("complexity"), f"{kind}.complexity")
    if complexity not in ALLOWED_COMPLEXITY:
        fail(f"{kind}.complexity must be one of {sorted(ALLOWED_COMPLEXITY)}")
    scenario_summary = ensure_string(item.get("scenario_summary"), f"{kind}.scenario_summary")
    source_basis = normalize_source_basis(item.get("source_basis"), f"{kind}.source_basis")
    body_markdown = sanitize_body(ensure_string(item.get("body_markdown"), f"{kind}.body_markdown"))

    bundle = ScenarioBundle(
        scenario_key=scenario_key,
        deliverable_id=deliverable_id,
        deliverable_title=deliverable_title,
        complexity=complexity,
        scenario_summary=scenario_summary,
        source_basis=source_basis,
        body_markdown=body_markdown,
    )
    if kind == "example":
        bundle.mcp_servers_relevant = normalize_capabilities(item.get("mcp_servers_relevant"), fallback_capabilities)
    else:
        bundle.expectations = ensure_list_of_strings(item.get("expectations"), f"{kind}.expectations")
        bundle.required_facts = normalize_mapping(item.get("required_facts"), f"{kind}.required_facts")
        bundle.intentionally_unknown = ensure_list_of_strings(
            item.get("intentionally_unknown"),
            f"{kind}.intentionally_unknown",
            allow_empty=True,
        )
        bundle.red_flags = normalize_mapping(item.get("red_flags"), f"{kind}.red_flags")
        bundle.mcp_uncertainty_points = normalize_uncertainty_points(
            item.get("mcp_uncertainty_points"),
            fallback_capabilities,
        )
    return bundle


def sequence_map(bundles: list[ScenarioBundle]) -> dict[tuple[str, str], int]:
    counts: dict[tuple[str, str], int] = {}
    for bundle in bundles:
        counts[(bundle.deliverable_id, bundle.scenario_key)] = counts.get((bundle.deliverable_id, bundle.scenario_key), 0) + 1
    seq: dict[str, int] = {}
    out: dict[tuple[str, str], int] = {}
    for bundle in bundles:
        key = bundle.deliverable_id
        seq[key] = seq.get(key, 0) + 1
        out[(bundle.deliverable_id, bundle.scenario_key)] = seq[key]
    return out


def existing_sequence_counts(root: Path, slug: str, kind: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    base = root / slug
    if not base.exists():
        return counts
    marker = f"-{kind}-"
    for path in base.glob("*.md"):
        name = path.stem
        if marker not in name:
            continue
        deliverable_id = name.split(marker, 1)[0]
        counts[deliverable_id] = counts.get(deliverable_id, 0) + 1
    return counts


def render_seed(
    slug: str,
    seed_stem: str,
    holdout_filename: str,
    bundle: ScenarioBundle,
) -> str:
    payload = {
        "seed_id": seed_stem,
        "agent_slug": slug,
        "deliverable_id": bundle.deliverable_id,
        "deliverable_title": bundle.deliverable_title,
        "complexity": bundle.complexity,
        "required_facts": bundle.required_facts or {},
        "intentionally_unknown": bundle.intentionally_unknown or [],
        "red_flags": bundle.red_flags or {},
        "mcp_uncertainty_points": bundle.mcp_uncertainty_points or [],
        "holdout_ref": f"{slug}/{holdout_filename}",
    }
    return yaml.safe_dump(payload, sort_keys=False, allow_unicode=False)


def render_example(slug: str, exemplar_stem: str, bundle: ScenarioBundle, generated_by: str) -> str:
    frontmatter = {
        "exemplar_id": exemplar_stem,
        "agent_slug": slug,
        "agents_relevant": [slug],
        "deliverable_id": bundle.deliverable_id,
        "deliverable_title": bundle.deliverable_title,
        "scenario_summary": bundle.scenario_summary,
        "complexity": bundle.complexity,
        "mcp_servers_relevant": bundle.mcp_servers_relevant or [],
        "regulatory_as_of": TODAY,
        "source_basis": bundle.source_basis,
        "generated_by": generated_by,
        "reviewed_by": "draft-pending-review",
        "review_status": "draft",
        "review_date": TODAY,
    }
    return f"---\n{yaml.safe_dump(frontmatter, sort_keys=False, allow_unicode=False).strip()}\n---\n\n{bundle.body_markdown}"


def render_holdout(
    slug: str,
    holdout_stem: str,
    seed_filename: str,
    bundle: ScenarioBundle,
    generated_by: str,
) -> str:
    frontmatter = {
        "holdout_id": holdout_stem,
        "agent_slug": slug,
        "agents_relevant": [slug],
        "deliverable_id": bundle.deliverable_id,
        "deliverable_title": bundle.deliverable_title,
        "seed_ref": f"{slug}/{seed_filename}",
        "scenario_summary": bundle.scenario_summary,
        "complexity": bundle.complexity,
        "regulatory_as_of": TODAY,
        "source_basis": bundle.source_basis,
        "generated_by": generated_by,
        "reviewed_by": "draft-pending-review",
        "review_status": "draft",
        "review_date": TODAY,
        "frozen": False,
        "retirement_trigger": "Supersede when the underlying regulation, coding guidance, or workflow standard materially changes",
        "expectations": bundle.expectations or [],
    }
    return f"---\n{yaml.safe_dump(frontmatter, sort_keys=False, allow_unicode=False).strip()}\n---\n\n{bundle.body_markdown}"


def write_text(path: Path, content: str, overwrite: bool) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and not overwrite:
        return
    path.write_text(content, encoding="utf-8")


def prompt_distribution(deliverables: list[dict[str, Any]], count: int) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for index in range(count):
        out.append(deliverables[index % len(deliverables)])
    return out


def build_prompt(
    template_path: Path,
    *,
    agent_entry: dict[str, Any],
    agent_markdown: str,
    style_guide: str,
    count: int,
    model_label: str,
) -> str:
    replacements = {
        "{{today}}": TODAY,
        "{{agent_yaml}}": yaml.safe_dump(agent_entry, sort_keys=False, allow_unicode=False),
        "{{agent_markdown}}": agent_markdown,
        "{{style_guide}}": style_guide,
        "{{count}}": str(count),
        "{{deliverable_distribution}}": yaml.safe_dump(
            prompt_distribution(agent_entry["deliverables"], count),
            sort_keys=False,
            allow_unicode=False,
        ),
        "{{model_label}}": model_label,
    }
    return read_prompt(template_path, replacements)


def generate_for_agent(
    *,
    slug: str,
    registry: dict[str, Any],
    template_path: Path,
    style_guide_path: Path,
    provider_cmd: str,
    model_label: str,
    provider_timeout_secs: int,
    provider_attempts: int,
    count: int,
    overwrite: bool,
) -> None:
    agent_entry = next((agent for agent in registry.get("agents", []) if agent.get("slug") == slug), None)
    if agent_entry is None:
        fail(f"registry entry not found for {slug}")
    agent_path = Path("agents") / f"{slug}.md"
    if not agent_path.exists():
        fail(f"agent file not found for {slug}")

    fallback_capabilities = []
    for item in agent_entry.get("tool_opportunities") or []:
        capability = str(item.get("capability_class", "")).strip()
        if capability in ALLOWED_CAPABILITIES and capability not in fallback_capabilities:
            fallback_capabilities.append(capability)
    if not fallback_capabilities:
        fallback_capabilities = ["current_regulatory_policy"]

    prompt = build_prompt(
        template_path,
        agent_entry=agent_entry,
        agent_markdown=agent_path.read_text(encoding="utf-8"),
        style_guide=style_guide_path.read_text(encoding="utf-8"),
        count=count,
        model_label=model_label,
    )
    parse_errors: list[str] = []
    parsed: dict[str, Any] | None = None
    example_items: list[Any] | None = None
    holdout_items: list[Any] | None = None
    for attempt in range(1, provider_attempts + 1):
        raw_output = run_provider(provider_cmd, prompt, timeout_secs=provider_timeout_secs, attempts=provider_attempts)
        try:
            parsed_candidate = parse_model_yaml(raw_output)
        except SystemExit as exc:
            parse_errors.append(f"attempt {attempt}/{provider_attempts}: {exc}")
            if attempt < provider_attempts:
                time.sleep(DEFAULT_PROVIDER_RETRY_SLEEP_SECS)
                continue
            raise
        example_candidate = parsed_candidate.get("example_scenarios")
        holdout_candidate = parsed_candidate.get("holdout_scenarios")
        if not isinstance(example_candidate, list) or len(example_candidate) < count:
            parse_errors.append(
                f"attempt {attempt}/{provider_attempts}: provider must return at least {count} example_scenarios"
            )
            if attempt < provider_attempts:
                time.sleep(DEFAULT_PROVIDER_RETRY_SLEEP_SECS)
                continue
            fail(f"{slug}: {'; '.join(parse_errors)}")
        if not isinstance(holdout_candidate, list) or len(holdout_candidate) < count:
            parse_errors.append(
                f"attempt {attempt}/{provider_attempts}: provider must return at least {count} holdout_scenarios"
            )
            if attempt < provider_attempts:
                time.sleep(DEFAULT_PROVIDER_RETRY_SLEEP_SECS)
                continue
            fail(f"{slug}: {'; '.join(parse_errors)}")
        parsed = parsed_candidate
        example_items = example_candidate[:count]
        holdout_items = holdout_candidate[:count]
        break
    if parsed is None or example_items is None or holdout_items is None:
        fail(f"{slug}: provider output could not be recovered after {provider_attempts} attempts")

    examples = [parse_bundle(item, fallback_capabilities=fallback_capabilities, kind="example") for item in example_items]
    holdouts = [parse_bundle(item, fallback_capabilities=fallback_capabilities, kind="holdout") for item in holdout_items]

    example_seq = sequence_map(examples)
    holdout_seq = sequence_map(holdouts)
    existing_example_counts = existing_sequence_counts(Path("references/examples"), slug, "example")
    existing_holdout_counts = existing_sequence_counts(Path("calibration/holdouts"), slug, "holdout")
    next_example_counts = dict(existing_example_counts)
    next_holdout_counts = dict(existing_holdout_counts)

    for bundle in examples:
        _ = example_seq[(bundle.deliverable_id, bundle.scenario_key)]
        seq = next_example_counts.get(bundle.deliverable_id, 0) + 1
        next_example_counts[bundle.deliverable_id] = seq
        stem = f"{bundle.deliverable_id}-example-{seq:02d}-{bundle.scenario_key}"
        content = render_example(slug, stem, bundle, model_label)
        write_text(Path("references/examples") / slug / f"{stem}.md", content, overwrite)

    for bundle in holdouts:
        _ = holdout_seq[(bundle.deliverable_id, bundle.scenario_key)]
        seq = next_holdout_counts.get(bundle.deliverable_id, 0) + 1
        next_holdout_counts[bundle.deliverable_id] = seq
        holdout_stem = f"{bundle.deliverable_id}-holdout-{seq:02d}-{bundle.scenario_key}"
        seed_stem = f"{bundle.deliverable_id}-seed-{seq:02d}-{bundle.scenario_key}"
        holdout_filename = f"{holdout_stem}.md"
        seed_filename = f"{seed_stem}.yaml"
        seed_content = render_seed(slug, seed_stem, holdout_filename, bundle)
        holdout_content = render_holdout(slug, holdout_stem, seed_filename, bundle, model_label)
        write_text(Path("calibration/seeds") / slug / seed_filename, seed_content, overwrite)
        write_text(Path("calibration/holdouts") / slug / holdout_filename, holdout_content, overwrite)

    print(f"{slug}: generated {count} examples, {count} holdouts, and {count} seeds")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--registry", default="registry.yaml")
    parser.add_argument("--template", default="scripts/prompts/reference-bundles.md")
    parser.add_argument("--style-guide", default="references/style-guide.md")
    parser.add_argument("--provider-cmd", default=DEFAULT_PROVIDER)
    parser.add_argument("--model-label", default=DEFAULT_MODEL_LABEL)
    parser.add_argument(
        "--provider-timeout-secs",
        type=int,
        default=int(os.environ.get("REFERENCE_BUNDLES_PROVIDER_TIMEOUT_SECS", DEFAULT_PROVIDER_TIMEOUT_SECS)),
    )
    parser.add_argument(
        "--provider-attempts",
        type=int,
        default=int(os.environ.get("REFERENCE_BUNDLES_PROVIDER_ATTEMPTS", DEFAULT_PROVIDER_ATTEMPTS)),
    )
    parser.add_argument("--count", type=int, default=3)
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--missing-only", action="store_true")
    parser.add_argument("slugs", nargs="*")
    args = parser.parse_args()

    registry = load_registry(Path(args.registry))
    slugs = args.slugs or [agent["slug"] for agent in registry.get("agents", [])]
    failures: list[str] = []
    for slug in slugs:
        if args.missing_only:
            example_count = len(list((Path("references/examples") / slug).glob("*.md")))
            holdout_count = len(list((Path("calibration/holdouts") / slug).glob("*.md")))
            seed_count = len(list((Path("calibration/seeds") / slug).glob("*.yaml")))
            if min(example_count, holdout_count, seed_count) >= args.count:
                print(f"{slug}: ok")
                continue
        try:
            generate_for_agent(
                slug=slug,
                registry=registry,
                template_path=Path(args.template),
                style_guide_path=Path(args.style_guide),
                provider_cmd=args.provider_cmd,
                model_label=args.model_label,
                provider_timeout_secs=args.provider_timeout_secs,
                provider_attempts=args.provider_attempts,
                count=args.count,
                overwrite=args.overwrite,
            )
        except SystemExit as exc:
            message = str(exc).strip() or "unknown generation failure"
            failures.append(f"{slug}: {message}")
            print(f"{slug}: {message}", file=sys.stderr)
    if failures:
        print("reference bundle generation completed with failures:", file=sys.stderr)
        for failure in failures:
            print(f"  - {failure}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
