#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import yaml


FIXED_GAP_TYPES = {
    "computational_omission",
    "context_blindness",
    "mcp_opportunity_missed",
    "specificity_gap",
    "structural_omission",
    "regulatory_error",
    "clinical_implausibility",
    "hallucinated_citation",
}
SEVERITY_CONFIDENCE = {
    "high": 0.85,
    "medium": 0.70,
    "low": 0.55,
}
DIMENSION_BY_GAP_TYPE = {
    "computational_omission": "actionability",
    "context_blindness": "structural_completeness",
    "mcp_opportunity_missed": "mcp_awareness",
    "specificity_gap": "regulatory_precision",
    "structural_omission": "structural_completeness",
    "regulatory_error": "regulatory_precision",
    "clinical_implausibility": "clinical_realism",
    "hallucinated_citation": "regulatory_precision",
}
GAP_TYPE_ALIASES = {
    "missing_requirement": "structural_omission",
    "missing_section": "structural_omission",
    "missing_sections": "structural_omission",
    "missing_mcp_awareness": "mcp_opportunity_missed",
    "missing_lookup_opportunity": "mcp_opportunity_missed",
    "insufficient_specificity": "specificity_gap",
    "vagueness": "specificity_gap",
    "context_gap": "context_blindness",
    "ignored_seed_fact": "context_blindness",
    "calculation_missing": "computational_omission",
    "score_not_computed": "computational_omission",
    "wrong_regulation": "regulatory_error",
    "incorrect_regulation": "regulatory_error",
    "implausible_output": "clinical_implausibility",
    "fake_citation": "hallucinated_citation",
}
EDIT_TYPES = {"strengthen", "add_conditional", "add_example", "fix_error"}
GAP_ID_RE = re.compile(r"\b[a-z0-9-]+-gap-\d+\b")
TOP_LEVEL_KEY_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_-]*:\s*")
KEY_VALUE_LINE_RE = re.compile(r"^(?P<prefix>\s*(?:-\s+)?)?(?P<key>[A-Za-z_][A-Za-z0-9_-]*):(?P<value>.*)$")
NUMERIC_RE = re.compile(r"^-?(?:\d+(?:\.\d+)?|\.\d+)$")
PROBABLE_YAML_LINE_RE = re.compile(r"^\s*(?:-\s+)?[A-Za-z_][A-Za-z0-9_-]*:\s*.*$")


def load_yaml(path: str) -> Any:
    text = Path(path).read_text(encoding="utf-8")
    last_error: Exception | None = None
    parsed_fallback: Any = None
    candidates = [text]

    extracted = extract_probable_yaml(text)
    if extracted and extracted not in candidates:
        candidates.append(extracted)

    repaired = repair_yaml_text(extracted or text)
    if repaired and repaired not in candidates:
        candidates.append(repaired)

    for candidate in candidates:
        try:
            parsed = yaml.safe_load(candidate)
        except yaml.YAMLError as exc:
            last_error = exc
            continue
        if isinstance(parsed, dict):
            return parsed
        if parsed_fallback is None:
            parsed_fallback = parsed

    if parsed_fallback is not None:
        return parsed_fallback

    if last_error is not None:
        raise SystemExit(f"{path}: could not parse model output as YAML: {last_error}")
    raise SystemExit(f"{path}: could not parse model output as YAML")


def dump_yaml(path: str, data: Any) -> None:
    Path(path).write_text(yaml.safe_dump(data, sort_keys=False), encoding="utf-8")


def extract_probable_yaml(text: str) -> str:
    lines = text.splitlines()
    cleaned = []
    started = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("```"):
            continue
        if not started:
            if stripped in {"---", "..."} or TOP_LEVEL_KEY_RE.match(stripped):
                started = True
                cleaned.append(line)
            else:
                continue
        else:
            cleaned.append(line)

    while cleaned and cleaned[-1].strip() and not is_probable_yaml_line(cleaned[-1]):
        cleaned.pop()

    return "\n".join(cleaned).strip()


def is_probable_yaml_line(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return True
    if stripped in {"---", "..."}:
        return True
    return bool(PROBABLE_YAML_LINE_RE.match(line))


def repair_yaml_text(text: str) -> str:
    repaired_lines = []
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("```"):
            continue
        repaired_lines.append(repair_yaml_line(line))
    return "\n".join(repaired_lines).strip()


def repair_yaml_line(line: str) -> str:
    match = KEY_VALUE_LINE_RE.match(line)
    if not match:
        return line

    prefix = match.group("prefix") or ""
    key = match.group("key")
    value = match.group("value").lstrip()
    if not value:
        return line
    if not needs_quoted_scalar(value):
        return line
    return f"{prefix}{key}: {json.dumps(value)}"


def needs_quoted_scalar(value: str) -> bool:
    if value[0] in "\"'[{|>&*!":
        return False
    lowered = value.lower()
    if lowered in {"true", "false", "null", "~"}:
        return False
    if NUMERIC_RE.match(value):
        return False
    return ": " in value


def as_string(value: Any, default: str = "") -> str:
    if value is None:
        return default
    if isinstance(value, str):
        text = value.strip()
        return text if text else default
    return str(value).strip() or default


def as_float(value: Any, default: float = 0.0) -> float:
    if isinstance(value, bool):
        return default
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value.strip())
        except ValueError:
            return default
    return default


def normalize_severity(value: Any) -> str:
    text = as_string(value, "medium").lower()
    if text in {"critical", "severe"}:
        return "high"
    if text in {"minor"}:
        return "low"
    if text in SEVERITY_CONFIDENCE:
        return text
    return "medium"


def normalize_confidence(value: Any, severity: str) -> float:
    if isinstance(value, bool):
        value = None
    if isinstance(value, (int, float)) and 0 <= float(value) <= 1:
        return round(float(value), 2)
    return SEVERITY_CONFIDENCE[severity]


def normalize_gap_type(raw_type: Any, evidence_text: str) -> str:
    text = as_string(raw_type).lower().replace(" ", "_").replace("-", "_")
    if text in FIXED_GAP_TYPES:
        return text
    if text in GAP_TYPE_ALIASES:
        mapped = GAP_TYPE_ALIASES[text]
        if mapped == "structural_omission":
            joined = evidence_text.lower()
            if any(token in joined for token in ("calculate", "computed", "compute", "score", "risk score", "lACE".lower(), "exact result")):
                return "computational_omission"
        return mapped

    joined = evidence_text.lower()
    if any(token in joined for token in ("calculate", "computed", "compute", "exact result", "risk score", "score")):
        return "computational_omission"
    if any(token in joined for token in ("lookup", "registry", "npi", "coverage", "tool", "verify")):
        return "mcp_opportunity_missed"
    if any(token in joined for token in ("citation", "cfr", "cms", "oig", "regulation", "guideline", "code")):
        return "regulatory_error"
    if any(token in joined for token in ("missing section", "omits", "missing required", "required element")):
        return "structural_omission"
    if any(token in joined for token in ("plausible", "realistic", "practitioner")):
        return "clinical_implausibility"
    if any(token in joined for token in ("unknown", "intentionally unknown", "seed", "ignored", "missing fact")):
        return "context_blindness"
    return "specificity_gap"


def normalize_dimension(raw_dimension: Any, gap_type: str) -> str:
    text = as_string(raw_dimension)
    return text or DIMENSION_BY_GAP_TYPE.get(gap_type, "actionability")


def normalize_checklist_item(item: Any, index: int) -> dict[str, Any]:
    if not isinstance(item, dict):
        return {
            "expectation": f"expectation_{index + 1}",
            "met": False,
            "notes": as_string(item, "No supporting notes provided."),
        }

    expectation = (
        as_string(item.get("expectation"))
        or as_string(item.get("checklist_item"))
        or as_string(item.get("item"))
        or f"expectation_{index + 1}"
    )
    met = item.get("met")
    if met not in {True, False, "partial"}:
        status = as_string(item.get("status")).lower()
        if status in {"met", "pass", "passed", "complete", "completed", "true", "yes"}:
            met = True
        elif status in {"partial", "partially_met", "mixed"}:
            met = "partial"
        else:
            met = False
    notes = (
        as_string(item.get("notes"))
        or as_string(item.get("evidence"))
        or as_string(item.get("rationale"))
        or "No supporting notes provided."
    )
    return {"expectation": expectation, "met": met, "notes": notes}


def normalized_weighted_total(scores: dict[str, Any]) -> float:
    values = []
    for key in ("structural_completeness", "regulatory_precision", "clinical_realism", "actionability", "mcp_awareness"):
        value = scores.get(key)
        if isinstance(value, (int, float)):
            values.append(float(value))
    if not values:
        return 0.0
    return round(sum(values) / len(values), 2)


def normalize_gap_report(raw: Any, seed: dict[str, Any], lint: dict[str, Any], generated_by: str, judged_by: str) -> dict[str, Any]:
    if not isinstance(raw, dict):
        raw = {}

    raw_scores = raw.get("scores")
    if not isinstance(raw_scores, dict):
        raw_scores = {}
    if not raw_scores and isinstance(raw.get("dimension_scores"), dict):
        for key, value in raw["dimension_scores"].items():
            if isinstance(value, dict):
                raw_scores[key] = value.get("score")
            else:
                raw_scores[key] = value

    mcp_value = raw_scores.get("mcp_awareness")
    if isinstance(mcp_value, dict):
        mcp_value = mcp_value.get("score")
    if not seed.get("mcp_uncertainty_points"):
        normalized_mcp = None
    else:
        normalized_mcp = as_float(mcp_value, 0.0)

    scores = {
        "structural_completeness": as_float(raw_scores.get("structural_completeness"), 0.0),
        "regulatory_precision": as_float(raw_scores.get("regulatory_precision"), 0.0),
        "clinical_realism": as_float(raw_scores.get("clinical_realism"), 0.0),
        "actionability": as_float(raw_scores.get("actionability"), 0.0),
        "mcp_awareness": normalized_mcp,
        "weighted_total": as_float(raw_scores.get("weighted_total", raw.get("weighted_total")), -1.0),
    }
    if scores["weighted_total"] < 0:
        scores["weighted_total"] = normalized_weighted_total(scores)
    else:
        scores["weighted_total"] = round(scores["weighted_total"], 2)

    checklist_raw = raw.get("expectation_checklist")
    if not isinstance(checklist_raw, list):
        checklist_raw = raw.get("checklist_results", [])
    expectation_checklist = [normalize_checklist_item(item, index) for index, item in enumerate(checklist_raw or [])]

    gaps = []
    for index, item in enumerate(raw.get("gaps", []) if isinstance(raw.get("gaps"), list) else []):
        if not isinstance(item, dict):
            item = {"evidence": as_string(item)}
        evidence = (
            as_string(item.get("evidence"))
            or as_string(item.get("rationale"))
            or as_string(item.get("summary"))
            or "No evidence provided."
        )
        likely_prompt_fix = (
            as_string(item.get("likely_prompt_fix"))
            or as_string(item.get("prompt_fix"))
            or as_string(item.get("recommended_fix"))
            or "Clarify this requirement directly in the prompt."
        )
        gap_type = normalize_gap_type(item.get("gap_type"), f"{evidence}\n{likely_prompt_fix}")
        severity = normalize_severity(item.get("severity"))
        gap_id = as_string(item.get("gap_id")) or f"{seed['seed_id']}-gap-{index + 1:02d}"
        gaps.append(
            {
                "gap_id": gap_id,
                "gap_type": gap_type,
                "severity": severity,
                "dimension": normalize_dimension(item.get("dimension"), gap_type),
                "evidence": evidence,
                "likely_prompt_fix": likely_prompt_fix,
                "confidence": normalize_confidence(item.get("confidence"), severity),
            }
        )

    return {
        "seed_id": seed["seed_id"],
        "agent_slug": seed["agent_slug"],
        "deliverable_id": seed["deliverable_id"],
        "generated_by": generated_by,
        "judged_by": judged_by,
        "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
        "scores": scores,
        "expectation_checklist": expectation_checklist,
        "lint": lint,
        "gaps": gaps,
    }


def infer_edit_type(text: str) -> str:
    lowered = text.lower()
    if any(token in lowered for token in ("if ", "conditional", "when ", "unless ")):
        return "add_conditional"
    if "example" in lowered or "worked " in lowered:
        return "add_example"
    if any(token in lowered for token in ("fix ", "correct", "remove wrong", "repair")):
        return "fix_error"
    return "strengthen"


def extract_gap_ids(value: Any) -> list[str]:
    if isinstance(value, list):
        items = [as_string(item) for item in value if as_string(item)]
        return items
    if isinstance(value, str):
        found = GAP_ID_RE.findall(value)
        return found
    return []


def normalize_summary(raw: Any, agent_slug: str, run_id: str) -> dict[str, Any]:
    if not isinstance(raw, dict):
        raw = {}

    strengths_raw = raw.get("systematic_strengths")
    if not isinstance(strengths_raw, list):
        strengths_raw = raw.get("strengths", [])
    strengths = []
    for item in strengths_raw:
        if not isinstance(item, dict):
            item = {"evidence": as_string(item)}
        strengths.append(
            {
                "dimension": as_string(item.get("dimension"), "overall"),
                "evidence": as_string(item.get("evidence") or item.get("summary"), "No evidence provided."),
                "mean_score": as_float(item.get("mean_score") or item.get("score"), 0.0),
            }
        )

    gaps_raw = raw.get("systematic_gaps")
    if not isinstance(gaps_raw, list):
        gaps_raw = raw.get("gaps", [])
    systematic_gaps = []
    for item in gaps_raw:
        if not isinstance(item, dict):
            item = {"evidence_summary": as_string(item)}
        evidence_summary = (
            as_string(item.get("evidence_summary"))
            or as_string(item.get("evidence"))
            or as_string(item.get("summary"))
            or "No evidence summary provided."
        )
        likely_prompt_fix = (
            as_string(item.get("likely_prompt_fix"))
            or as_string(item.get("prompt_fix"))
            or as_string(item.get("recommended_fix"))
            or "Clarify the missing pattern in the prompt."
        )
        gap_type = normalize_gap_type(item.get("gap_type"), f"{evidence_summary}\n{likely_prompt_fix}")
        severity = normalize_severity(item.get("severity"))
        confidence = normalize_confidence(item.get("confidence"), severity)
        recurrence_count = item.get("recurrence_count")
        if not isinstance(recurrence_count, int) or recurrence_count < 1:
            recurrence_count = max(len(extract_gap_ids(item.get("source_gap_ids"))), 1)
        promotion_eligible = item.get("promotion_eligible")
        if not isinstance(promotion_eligible, bool):
            promotion_eligible = confidence >= 0.7 and (severity == "high" or recurrence_count >= 2)
        systematic_gaps.append(
            {
                "gap_type": gap_type,
                "recurrence_count": recurrence_count,
                "severity": severity,
                "evidence_summary": evidence_summary,
                "likely_prompt_fix": likely_prompt_fix,
                "confidence": confidence,
                "promotion_eligible": promotion_eligible,
            }
        )

    edits_raw = raw.get("recommended_edits")
    if not isinstance(edits_raw, list):
        edits_raw = raw.get("edits", [])
    recommended_edits = []
    for item in edits_raw:
        if not isinstance(item, dict):
            item = {"description": as_string(item)}
        description = (
            as_string(item.get("description"))
            or as_string(item.get("edit"))
            or as_string(item.get("likely_prompt_fix"))
            or "No edit description provided."
        )
        source_gap_ids = extract_gap_ids(item.get("source_gap_ids"))
        if not source_gap_ids:
            source_gap_ids = extract_gap_ids(item.get("gap_ids"))
        if not source_gap_ids:
            source_gap_ids = extract_gap_ids(description)
        if not source_gap_ids and systematic_gaps:
            source_gap_ids = [f"{agent_slug}-summary-gap-01"]
        recommended_edits.append(
            {
                "target_section": as_string(item.get("target_section") or item.get("section") or item.get("prompt_section"), "## 📋 Your Technical Deliverables"),
                "edit_type": item.get("edit_type") if item.get("edit_type") in EDIT_TYPES else infer_edit_type(description),
                "description": description,
                "source_gap_ids": source_gap_ids or [f"{agent_slug}-summary-gap-01"],
            }
        )

    return {
        "agent_slug": agent_slug,
        "calibration_run_id": run_id,
        "date": datetime.now(UTC).strftime("%Y-%m-%d"),
        "systematic_strengths": strengths,
        "systematic_gaps": systematic_gaps,
        "recommended_edits": recommended_edits,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="kind", required=True)

    gap_parser = subparsers.add_parser("gap-report")
    gap_parser.add_argument("--input", required=True)
    gap_parser.add_argument("--output", required=True)
    gap_parser.add_argument("--seed-json", required=True)
    gap_parser.add_argument("--lint-file", required=True)
    gap_parser.add_argument("--generated-by", required=True)
    gap_parser.add_argument("--judged-by", required=True)

    summary_parser = subparsers.add_parser("synthesis-summary")
    summary_parser.add_argument("--input", required=True)
    summary_parser.add_argument("--output", required=True)
    summary_parser.add_argument("--agent-slug", required=True)
    summary_parser.add_argument("--run-id", required=True)

    args = parser.parse_args()

    raw = load_yaml(args.input)

    if args.kind == "gap-report":
        seed = json.loads(Path(args.seed_json).read_text(encoding="utf-8"))
        lint = load_yaml(args.lint_file)
        dump_yaml(args.output, normalize_gap_report(raw, seed, lint, args.generated_by, args.judged_by))
        return 0

    dump_yaml(args.output, normalize_summary(raw, args.agent_slug, args.run_id))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
