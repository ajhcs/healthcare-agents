#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-references}"
shift || true

python3 - "$ROOT_DIR" "$@" <<'PY'
from __future__ import annotations

import re
import sys
from datetime import date, datetime
from pathlib import Path

import yaml


ALLOWED_COMPLEXITY = {"routine", "moderate", "high"}
ALLOWED_REVIEW_STATUS = {"draft", "reviewed", "stale", "retired"}
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
PLACEHOLDER_RE = re.compile(
    r"(\[[^\]\n]{1,80}\]|\bTBD\b|\bN/A\b|\bunknown\b|\bvaries\b|\btypical\b|\binsert\b|\bestimate later\b)",
    re.IGNORECASE,
)
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
DELIVERABLE_RE = re.compile(r"^[a-z][a-z0-9-]*-d\d{2}$")
SOURCE_RE = re.compile(r"\b(42\s*CFR\b|45\s*CFR\b|CMS\b|OIG\b|Joint Commission\b|ICD-10\b|CPT\b|HCPCS\b|NCCI\b|HEDIS\b|MIPS\b)")


def fail(message: str) -> None:
    raise SystemExit(message)


def load_frontmatter(path: Path) -> tuple[dict[str, object], str]:
    text = path.read_text(encoding="utf-8")
    if not text.lstrip().startswith("---\n"):
        fail(f"{path}: missing YAML frontmatter")
    parts = text.split("\n---\n", 1)
    if len(parts) != 2:
        fail(f"{path}: missing closing frontmatter delimiter")
    _, body = parts
    fm_text = parts[0].split("\n", 1)[1]
    frontmatter = yaml.safe_load(fm_text)
    if not isinstance(frontmatter, dict):
        fail(f"{path}: frontmatter must be a mapping")
    return frontmatter, body


def require_string(data: dict[str, object], key: str, path: Path, errors: list[str]) -> None:
    value = data.get(key)
    if not isinstance(value, str) or not value.strip():
        errors.append(f"{path}: missing or empty {key}")


def require_list_of_strings(data: dict[str, object], key: str, path: Path, errors: list[str], *, non_empty: bool = True) -> None:
    value = data.get(key)
    if not isinstance(value, list):
        errors.append(f"{path}: {key} must be a list")
        return
    if non_empty and not value:
        errors.append(f"{path}: {key} must not be empty")
    for idx, item in enumerate(value):
        if not isinstance(item, str) or not item.strip():
            errors.append(f"{path}: {key}[{idx}] must be a non-empty string")


def parse_date(value: object, key: str, path: Path, errors: list[str]) -> None:
    if isinstance(value, datetime):
        value = value.date()
    if isinstance(value, date):
        value = value.isoformat()
    if not isinstance(value, str) or not DATE_RE.match(value):
        errors.append(f"{path}: {key} must be YYYY-MM-DD")
        return
    try:
        datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        errors.append(f"{path}: {key} is not a valid date")


def validate_example(frontmatter: dict[str, object], body: str, path: Path) -> list[str]:
    errors: list[str] = []
    for key in [
        "exemplar_id",
        "agent_slug",
        "deliverable_id",
        "deliverable_title",
        "scenario_summary",
        "generated_by",
        "reviewed_by",
        "review_status",
    ]:
        require_string(frontmatter, key, path, errors)
    require_list_of_strings(frontmatter, "agents_relevant", path, errors)
    require_list_of_strings(frontmatter, "source_basis", path, errors)
    require_list_of_strings(frontmatter, "mcp_servers_relevant", path, errors)
    for idx, capability in enumerate(frontmatter.get("mcp_servers_relevant", [])):
        if capability not in ALLOWED_CAPABILITIES:
            errors.append(f"{path}: mcp_servers_relevant[{idx}] is not a recognized capability class")
    if frontmatter.get("complexity") not in ALLOWED_COMPLEXITY:
        errors.append(f"{path}: complexity must be one of {sorted(ALLOWED_COMPLEXITY)}")
    if frontmatter.get("review_status") not in ALLOWED_REVIEW_STATUS:
        errors.append(f"{path}: review_status must be one of {sorted(ALLOWED_REVIEW_STATUS)}")
    if isinstance(frontmatter.get("deliverable_id"), str) and not DELIVERABLE_RE.match(frontmatter["deliverable_id"]):
        errors.append(f"{path}: deliverable_id has an invalid format")
    parse_date(frontmatter.get("review_date"), "review_date", path, errors)
    parse_date(frontmatter.get("regulatory_as_of"), "regulatory_as_of", path, errors)
    if frontmatter.get("review_status") == "stale":
        errors.append(f"{path}: stale exemplars are not allowed in the shipped example set")
    if PLACEHOLDER_RE.search(body):
        errors.append(f"{path}: body contains placeholders or template tokens")
    if not SOURCE_RE.search(body) and not frontmatter.get("source_basis"):
        errors.append(f"{path}: missing visible citation signal")
    return errors


def validate_holdout(frontmatter: dict[str, object], body: str, path: Path) -> list[str]:
    errors: list[str] = []
    for key in [
        "holdout_id",
        "agent_slug",
        "deliverable_id",
        "deliverable_title",
        "seed_ref",
        "scenario_summary",
        "generated_by",
        "reviewed_by",
        "review_status",
        "retirement_trigger",
    ]:
        require_string(frontmatter, key, path, errors)
    require_list_of_strings(frontmatter, "agents_relevant", path, errors)
    require_list_of_strings(frontmatter, "source_basis", path, errors)
    require_list_of_strings(frontmatter, "expectations", path, errors)
    if frontmatter.get("complexity") not in ALLOWED_COMPLEXITY:
        errors.append(f"{path}: complexity must be one of {sorted(ALLOWED_COMPLEXITY)}")
    if frontmatter.get("review_status") not in ALLOWED_REVIEW_STATUS:
        errors.append(f"{path}: review_status must be one of {sorted(ALLOWED_REVIEW_STATUS)}")
    if isinstance(frontmatter.get("deliverable_id"), str) and not DELIVERABLE_RE.match(frontmatter["deliverable_id"]):
        errors.append(f"{path}: deliverable_id has an invalid format")
    if not isinstance(frontmatter.get("frozen"), bool):
        errors.append(f"{path}: frozen must be boolean")
    parse_date(frontmatter.get("review_date"), "review_date", path, errors)
    parse_date(frontmatter.get("regulatory_as_of"), "regulatory_as_of", path, errors)
    if frontmatter.get("review_status") == "stale":
        errors.append(f"{path}: stale holdouts are not allowed in the release gate")
    if PLACEHOLDER_RE.search(body):
        errors.append(f"{path}: body contains placeholders or template tokens")
    if not SOURCE_RE.search(body) and not frontmatter.get("source_basis"):
        errors.append(f"{path}: missing visible citation signal")
    return errors


def validate_file(path: Path) -> list[str]:
    frontmatter, body = load_frontmatter(path)
    if "holdout_id" in frontmatter:
        return validate_holdout(frontmatter, body, path)
    return validate_example(frontmatter, body, path)


def gather_paths(root: Path) -> list[Path]:
    if root.is_file():
        return [root]
    if not root.exists():
        fail(f"{root}: path does not exist")
    return sorted(p for p in root.rglob("*.md") if p.is_file())


root = Path(sys.argv[1]).resolve()
raw_inputs = [Path(arg).resolve() for arg in sys.argv[2:]] or [root]
paths: list[Path] = []
for candidate in raw_inputs:
    paths.extend(gather_paths(candidate))

deduped_paths: list[Path] = []
seen: set[Path] = set()
for path in paths:
    if path not in seen:
        deduped_paths.append(path)
        seen.add(path)

errors: list[str] = []
for path in deduped_paths:
    errors.extend(validate_file(path))

if errors:
    for error in errors:
        print(error, file=sys.stderr)
    raise SystemExit(1)
for path in deduped_paths:
    print(f"{path}: ok")
PY
