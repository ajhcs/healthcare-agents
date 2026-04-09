#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from datetime import date, datetime
from pathlib import Path
from typing import Any

import yaml


GAP_TYPES = {
    "computational_omission",
    "context_blindness",
    "mcp_opportunity_missed",
    "specificity_gap",
    "structural_omission",
    "regulatory_error",
    "clinical_implausibility",
    "hallucinated_citation",
}
SEVERITIES = {"high", "medium", "low"}
EDIT_TYPES = {"strengthen", "add_conditional", "add_example", "fix_error"}
PROMOTION_REASONS = {"high_severity", "recurrence"}


def is_string(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def is_bool(value: Any) -> bool:
    return isinstance(value, bool)


def is_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def is_date(value: Any) -> bool:
    if isinstance(value, datetime):
        return True
    if isinstance(value, date):
        return True
    if not is_string(value):
        return False
    try:
        datetime.strptime(value, "%Y-%m-%d")
        return True
    except ValueError:
        return False


def is_timestamp(value: Any) -> bool:
    if isinstance(value, datetime):
        return True
    if not is_string(value):
        return False
    text = value.replace("Z", "+00:00")
    try:
        datetime.fromisoformat(text)
        return True
    except ValueError:
        return False


def require_keys(data: dict[str, Any], keys: list[str], errors: list[str]) -> None:
    for key in keys:
        if key not in data:
            errors.append(f"missing required key: {key}")


def require_list_of_strings(name: str, value: Any, errors: list[str], allow_empty: bool = True) -> None:
    if not isinstance(value, list):
        errors.append(f"{name} must be a list")
        return
    if not allow_empty and not value:
        errors.append(f"{name} must not be empty")
    for index, item in enumerate(value):
        if not is_string(item):
            errors.append(f"{name}[{index}] must be a non-empty string")


def infer_kind(path: Path, data: Any) -> str:
    if not isinstance(data, dict):
        return "unknown"
    keys = set(data.keys())
    if {"seed_id", "required_facts", "intentionally_unknown", "red_flags", "mcp_uncertainty_points", "holdout_ref"} <= keys:
        return "seed"
    if {"seed_id", "agent_slug", "timestamp", "missing_sections", "unresolved_placeholders", "citation_parse_failures", "static_mcp_claims", "min_length_met", "frontmatter_valid", "overall_pass"} <= keys:
        return "lint_result"
    if {"seed_id", "agent_slug", "deliverable_id", "scores", "expectation_checklist", "lint", "gaps"} <= keys:
        return "gap_report"
    if {"agent_slug", "calibration_run_id", "date", "systematic_strengths", "systematic_gaps", "recommended_edits"} <= keys:
        return "synthesis_summary"
    if {"agent_slug", "calibration_run_id", "calibration_date", "applied_gaps", "rejected_gaps"} <= keys:
        return "applied_trace"
    if {"run_id", "date", "agents_tested", "generator_model", "judge_model", "agent_prompt_versions", "seeds_used", "holdouts_used", "lint_pass_rate", "mean_calibration_score", "estimated_cost_usd", "human_qa_sample", "human_qa_concordance"} <= keys:
        return "run_manifest"
    if "seeds" in path.parts:
        return "seed"
    return "unknown"


def validate_seed(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    require_keys(
        data,
        [
            "seed_id",
            "agent_slug",
            "deliverable_id",
            "deliverable_title",
            "required_facts",
            "intentionally_unknown",
            "red_flags",
            "mcp_uncertainty_points",
            "holdout_ref",
        ],
        errors,
    )
    for key in ["seed_id", "agent_slug", "deliverable_id", "deliverable_title", "holdout_ref"]:
        if key in data and not is_string(data[key]):
            errors.append(f"{key} must be a non-empty string")
    if "required_facts" in data and not isinstance(data["required_facts"], dict):
        errors.append("required_facts must be a mapping")
    if "red_flags" in data and not isinstance(data["red_flags"], dict):
        errors.append("red_flags must be a mapping")
    if "intentionally_unknown" in data:
        require_list_of_strings("intentionally_unknown", data["intentionally_unknown"], errors)
    if "mcp_uncertainty_points" in data:
        if not isinstance(data["mcp_uncertainty_points"], list):
            errors.append("mcp_uncertainty_points must be a list")
        else:
            for index, item in enumerate(data["mcp_uncertainty_points"]):
                if not isinstance(item, dict):
                    errors.append(f"mcp_uncertainty_points[{index}] must be a mapping")
                    continue
                for field in ["fact", "capability_class", "action"]:
                    if not is_string(item.get(field)):
                        errors.append(f"mcp_uncertainty_points[{index}].{field} must be a non-empty string")
    return errors


def validate_lint_result(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    require_keys(
        data,
        [
            "seed_id",
            "agent_slug",
            "timestamp",
            "missing_sections",
            "unresolved_placeholders",
            "citation_parse_failures",
            "static_mcp_claims",
            "min_length_met",
            "frontmatter_valid",
            "overall_pass",
        ],
        errors,
    )
    for key in ["seed_id", "agent_slug"]:
        if key in data and not is_string(data[key]):
            errors.append(f"{key} must be a non-empty string")
    if "timestamp" in data and not is_timestamp(data["timestamp"]):
        errors.append("timestamp must be ISO 8601")
    for key in ["missing_sections", "unresolved_placeholders", "static_mcp_claims"]:
        if key in data:
            require_list_of_strings(key, data[key], errors)
    if "citation_parse_failures" in data:
        if not isinstance(data["citation_parse_failures"], list):
            errors.append("citation_parse_failures must be a list")
        else:
            for index, item in enumerate(data["citation_parse_failures"]):
                if not isinstance(item, dict):
                    errors.append(f"citation_parse_failures[{index}] must be a mapping")
                    continue
                if not is_string(item.get("raw_text")):
                    errors.append(f"citation_parse_failures[{index}].raw_text must be a non-empty string")
                if not is_string(item.get("expected_pattern")):
                    errors.append(f"citation_parse_failures[{index}].expected_pattern must be a non-empty string")
    for key in ["min_length_met", "frontmatter_valid", "overall_pass"]:
        if key in data and not is_bool(data[key]):
            errors.append(f"{key} must be a boolean")
    return errors


def validate_gap_report(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    require_keys(
        data,
        [
            "seed_id",
            "agent_slug",
            "deliverable_id",
            "generated_by",
            "judged_by",
            "timestamp",
            "scores",
            "expectation_checklist",
            "lint",
            "gaps",
        ],
        errors,
    )
    for key in ["seed_id", "agent_slug", "deliverable_id", "generated_by", "judged_by"]:
        if key in data and not is_string(data[key]):
            errors.append(f"{key} must be a non-empty string")
    if "timestamp" in data and not is_timestamp(data["timestamp"]):
        errors.append("timestamp must be ISO 8601")
    scores = data.get("scores")
    if not isinstance(scores, dict):
        errors.append("scores must be a mapping")
    else:
        for key in ["structural_completeness", "regulatory_precision", "clinical_realism", "actionability"]:
            if key not in scores or not is_number(scores[key]) or not 0 <= float(scores[key]) <= 4:
                errors.append(f"scores.{key} must be a number between 0 and 4")
        if "mcp_awareness" not in scores or not (
            scores["mcp_awareness"] is None or (is_number(scores["mcp_awareness"]) and 0 <= float(scores["mcp_awareness"]) <= 4)
        ):
            errors.append("scores.mcp_awareness must be null or a number between 0 and 4")
        if "weighted_total" not in scores or not is_number(scores["weighted_total"]):
            errors.append("scores.weighted_total must be numeric")
    if "expectation_checklist" in data:
        if not isinstance(data["expectation_checklist"], list):
            errors.append("expectation_checklist must be a list")
        else:
            for index, item in enumerate(data["expectation_checklist"]):
                if not isinstance(item, dict):
                    errors.append(f"expectation_checklist[{index}] must be a mapping")
                    continue
                if not is_string(item.get("expectation")):
                    errors.append(f"expectation_checklist[{index}].expectation must be a non-empty string")
                if item.get("met") not in {True, False, "partial"}:
                    errors.append(f"expectation_checklist[{index}].met must be true, false, or 'partial'")
                if not is_string(item.get("notes")):
                    errors.append(f"expectation_checklist[{index}].notes must be a non-empty string")
    if "lint" in data and isinstance(data["lint"], dict):
        errors.extend([f"lint.{msg}" for msg in validate_lint_result(data["lint"])])
    else:
        errors.append("lint must be an embedded lint result mapping")
    if "gaps" in data:
        if not isinstance(data["gaps"], list):
            errors.append("gaps must be a list")
        else:
            for index, item in enumerate(data["gaps"]):
                if not isinstance(item, dict):
                    errors.append(f"gaps[{index}] must be a mapping")
                    continue
                if not is_string(item.get("gap_id")):
                    errors.append(f"gaps[{index}].gap_id must be a non-empty string")
                if item.get("gap_type") not in GAP_TYPES:
                    errors.append(f"gaps[{index}].gap_type must be one of the fixed enum values")
                if item.get("severity") not in SEVERITIES:
                    errors.append(f"gaps[{index}].severity must be high, medium, or low")
                if not is_string(item.get("dimension")):
                    errors.append(f"gaps[{index}].dimension must be a non-empty string")
                if not is_string(item.get("evidence")):
                    errors.append(f"gaps[{index}].evidence must be a non-empty string")
                if not is_string(item.get("likely_prompt_fix")):
                    errors.append(f"gaps[{index}].likely_prompt_fix must be a non-empty string")
                if not is_number(item.get("confidence")) or not 0 <= float(item["confidence"]) <= 1:
                    errors.append(f"gaps[{index}].confidence must be between 0 and 1")
    return errors


def validate_synthesis_summary(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    require_keys(
        data,
        [
            "agent_slug",
            "calibration_run_id",
            "date",
            "systematic_strengths",
            "systematic_gaps",
            "recommended_edits",
        ],
        errors,
    )
    for key in ["agent_slug", "calibration_run_id"]:
        if key in data and not is_string(data[key]):
            errors.append(f"{key} must be a non-empty string")
    if "date" in data and not is_date(data["date"]):
        errors.append("date must be YYYY-MM-DD")
    strengths = data.get("systematic_strengths")
    if not isinstance(strengths, list):
        errors.append("systematic_strengths must be a list")
    else:
        for index, item in enumerate(strengths):
            if not isinstance(item, dict):
                errors.append(f"systematic_strengths[{index}] must be a mapping")
                continue
            if not is_string(item.get("dimension")):
                errors.append(f"systematic_strengths[{index}].dimension must be a non-empty string")
            if not is_string(item.get("evidence")):
                errors.append(f"systematic_strengths[{index}].evidence must be a non-empty string")
            if not is_number(item.get("mean_score")):
                errors.append(f"systematic_strengths[{index}].mean_score must be numeric")
    gaps = data.get("systematic_gaps")
    if not isinstance(gaps, list):
        errors.append("systematic_gaps must be a list")
    else:
        for index, item in enumerate(gaps):
            if not isinstance(item, dict):
                errors.append(f"systematic_gaps[{index}] must be a mapping")
                continue
            if item.get("gap_type") not in GAP_TYPES:
                errors.append(f"systematic_gaps[{index}].gap_type must be one of the fixed enum values")
            if not isinstance(item.get("recurrence_count"), int) or item["recurrence_count"] < 1:
                errors.append(f"systematic_gaps[{index}].recurrence_count must be a positive integer")
            if item.get("severity") not in SEVERITIES:
                errors.append(f"systematic_gaps[{index}].severity must be high, medium, or low")
            if not is_string(item.get("evidence_summary")):
                errors.append(f"systematic_gaps[{index}].evidence_summary must be a non-empty string")
            if not is_string(item.get("likely_prompt_fix")):
                errors.append(f"systematic_gaps[{index}].likely_prompt_fix must be a non-empty string")
            if not is_number(item.get("confidence")) or not 0 <= float(item["confidence"]) <= 1:
                errors.append(f"systematic_gaps[{index}].confidence must be between 0 and 1")
            if not is_bool(item.get("promotion_eligible")):
                errors.append(f"systematic_gaps[{index}].promotion_eligible must be boolean")
    edits = data.get("recommended_edits")
    if not isinstance(edits, list):
        errors.append("recommended_edits must be a list")
    else:
        for index, item in enumerate(edits):
            if not isinstance(item, dict):
                errors.append(f"recommended_edits[{index}] must be a mapping")
                continue
            if not is_string(item.get("target_section")):
                errors.append(f"recommended_edits[{index}].target_section must be a non-empty string")
            if item.get("edit_type") not in EDIT_TYPES:
                errors.append(f"recommended_edits[{index}].edit_type must be a valid edit type")
            if not is_string(item.get("description")):
                errors.append(f"recommended_edits[{index}].description must be a non-empty string")
            require_list_of_strings(f"recommended_edits[{index}].source_gap_ids", item.get("source_gap_ids"), errors, allow_empty=False)
    return errors


def validate_applied_trace(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    require_keys(
        data,
        [
            "agent_slug",
            "calibration_run_id",
            "calibration_date",
            "applied_gaps",
            "rejected_gaps",
        ],
        errors,
    )
    for key in ["agent_slug", "calibration_run_id"]:
        if key in data and not is_string(data[key]):
            errors.append(f"{key} must be a non-empty string")
    if "calibration_date" in data and not is_date(data["calibration_date"]):
        errors.append("calibration_date must be YYYY-MM-DD")
    applied = data.get("applied_gaps")
    if not isinstance(applied, list):
        errors.append("applied_gaps must be a list")
    else:
        for index, item in enumerate(applied):
            if not isinstance(item, dict):
                errors.append(f"applied_gaps[{index}] must be a mapping")
                continue
            if not is_string(item.get("gap_id")):
                errors.append(f"applied_gaps[{index}].gap_id must be a non-empty string")
            if item.get("gap_type") not in GAP_TYPES:
                errors.append(f"applied_gaps[{index}].gap_type must be one of the fixed enum values")
            if not is_string(item.get("prompt_section")):
                errors.append(f"applied_gaps[{index}].prompt_section must be a non-empty string")
            if not is_string(item.get("edit_summary")):
                errors.append(f"applied_gaps[{index}].edit_summary must be a non-empty string")
            if not is_string(item.get("commit")):
                errors.append(f"applied_gaps[{index}].commit must be a non-empty string")
            if item.get("promotion_reason") not in PROMOTION_REASONS:
                errors.append(f"applied_gaps[{index}].promotion_reason must be high_severity or recurrence")
            recurrence = item.get("recurrence_count")
            if recurrence is not None and (not isinstance(recurrence, int) or recurrence < 1):
                errors.append(f"applied_gaps[{index}].recurrence_count must be null or a positive integer")
    rejected = data.get("rejected_gaps")
    if not isinstance(rejected, list):
        errors.append("rejected_gaps must be a list")
    else:
        for index, item in enumerate(rejected):
            if not isinstance(item, dict):
                errors.append(f"rejected_gaps[{index}] must be a mapping")
                continue
            if not is_string(item.get("gap_id")):
                errors.append(f"rejected_gaps[{index}].gap_id must be a non-empty string")
            if not is_string(item.get("reason")):
                errors.append(f"rejected_gaps[{index}].reason must be a non-empty string")
    return errors


def validate_run_manifest(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    require_keys(
        data,
        [
            "run_id",
            "date",
            "agents_tested",
            "generator_model",
            "judge_model",
            "agent_prompt_versions",
            "seeds_used",
            "holdouts_used",
            "lint_pass_rate",
            "mean_calibration_score",
            "estimated_cost_usd",
            "human_qa_sample",
            "human_qa_concordance",
        ],
        errors,
    )
    for key in ["run_id", "generator_model", "judge_model"]:
        if key in data and not is_string(data[key]):
            errors.append(f"{key} must be a non-empty string")
    if "date" in data and not is_date(data["date"]):
        errors.append("date must be YYYY-MM-DD")
    if "agents_tested" in data:
        require_list_of_strings("agents_tested", data["agents_tested"], errors, allow_empty=False)
    if "agent_prompt_versions" in data:
        if not isinstance(data["agent_prompt_versions"], dict) or not data["agent_prompt_versions"]:
            errors.append("agent_prompt_versions must be a non-empty mapping")
        else:
            for key, value in data["agent_prompt_versions"].items():
                if not is_string(key) or not is_string(value):
                    errors.append("agent_prompt_versions keys and values must be non-empty strings")
    for key in ["seeds_used", "holdouts_used", "human_qa_sample"]:
        if key in data and (not isinstance(data[key], int) or data[key] < 0):
            errors.append(f"{key} must be a non-negative integer")
    for key in ["lint_pass_rate", "mean_calibration_score", "estimated_cost_usd"]:
        if key in data and not is_number(data[key]):
            errors.append(f"{key} must be numeric")
    concordance = data.get("human_qa_concordance")
    if concordance is not None and not is_number(concordance):
        errors.append("human_qa_concordance must be numeric or null")
    return errors


VALIDATORS = {
    "seed": validate_seed,
    "lint_result": validate_lint_result,
    "gap_report": validate_gap_report,
    "synthesis_summary": validate_synthesis_summary,
    "applied_trace": validate_applied_trace,
    "run_manifest": validate_run_manifest,
}


def load_yaml(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def iter_paths(paths: list[str]) -> list[Path]:
    resolved: list[Path] = []
    for raw in paths:
        path = Path(raw)
        if path.is_dir():
            for child in sorted(path.rglob("*")):
                if child.is_file() and child.suffix in {".yaml", ".yml", ".json"}:
                    resolved.append(child)
        else:
            resolved.append(path)
    return resolved


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate calibration artifact schemas.")
    parser.add_argument("paths", nargs="+")
    parser.add_argument("--kind", choices=sorted(VALIDATORS.keys()))
    parser.add_argument("--quiet", action="store_true")
    args = parser.parse_args()

    failures = 0
    for path in iter_paths(args.paths):
        try:
            data = load_yaml(path)
        except Exception as exc:
            failures += 1
            print(f"{path}: failed to parse YAML ({exc})", file=sys.stderr)
            continue
        kind = args.kind or infer_kind(path, data)
        validator = VALIDATORS.get(kind)
        if validator is None:
            failures += 1
            print(f"{path}: could not infer artifact kind", file=sys.stderr)
            continue
        if not isinstance(data, dict):
            failures += 1
            print(f"{path}: top-level YAML document must be a mapping", file=sys.stderr)
            continue
        errors = validator(data)
        if errors:
            failures += 1
            print(f"{path}: invalid {kind}", file=sys.stderr)
            for error in errors:
                print(f"  - {error}", file=sys.stderr)
        elif not args.quiet:
            print(f"{path}: ok ({kind})")

    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
