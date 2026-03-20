"""
Scorer: Tier 1 auto-scoring (MCQ) and Tier 2 multi-judge rubric scoring (scenarios).

Public API:
  score_mcq(item, mcq, parsed_response) -> MCQScore
  score_scenario(item, scenario, agent_response, cost_tracker) -> list[ScenarioScore]
  compute_agreement(all_scores) -> float
  aggregate_scores(mcq_scores, scenario_scores, items) -> dict
  generate_feedback(aggregate, items, mcq_scores, scenario_scores) -> str

Internal helpers:
  _build_judge_prompt(scenario, agent_response) -> str
  _weighted_kappa(ratings_1, ratings_2, max_score) -> float
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass
from itertools import combinations
from pathlib import Path
from typing import Any

import numpy as np

from eval.harness.config import (
    JUDGE_AGREEMENT_THRESHOLD,
    JUDGE_COUNT,
    MODELS,
    RUBRICS_DIR,
)
from eval.harness.invoker import CostTracker, invoke_agent


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class MCQScore:
    item_id: str
    correct: bool
    selected: list[str]   # selected option keys
    expected: list[str]   # correct option keys
    score: float          # 0.0–1.0


@dataclass
class ScenarioScore:
    item_id: str
    per_criterion_scores: dict[str, int]  # criterion_name -> 0-4
    weighted_total: float                  # 0.0–1.0 normalised
    feedback_text: str
    judge_model: str


# ---------------------------------------------------------------------------
# Tier 1: MCQ auto-scoring
# ---------------------------------------------------------------------------

def score_mcq(item: dict, mcq: dict, parsed_response: dict) -> MCQScore:
    """Score an MCQ item against the ground-truth options.

    Scoring logic per response_format type:
      single_best_answer  — binary (1.0 / 0.0)
      multi_select        — Jaccard similarity over option-key sets
      ordered_response    — exact sequence match (binary)
    """
    item_id: str = item.get("id", item.get("item_code", "unknown"))
    response_type: str = mcq.get("response_format", {}).get("type", "single_best_answer")

    # Derive expected (correct) keys from options
    expected: list[str] = [
        opt["key"] for opt in mcq["options"] if opt.get("is_correct", False)
    ]
    selected: list[str] = parsed_response.get("selected", [])

    if response_type == "single_best_answer":
        correct_flag = bool(selected and selected[0] == expected[0]) if expected else False
        score = 1.0 if correct_flag else 0.0

    elif response_type == "multi_select":
        sel_set = set(selected)
        exp_set = set(expected)
        union = sel_set | exp_set
        if not union:
            score = 1.0
        else:
            score = len(sel_set & exp_set) / len(union)
        correct_flag = sel_set == exp_set

    elif response_type == "ordered_response":
        correct_order: list[str] = mcq.get("response_format", {}).get(
            "correct_order", expected
        )
        correct_flag = selected == correct_order
        score = 1.0 if correct_flag else 0.0

    else:
        # Fallback: treat as SBA
        correct_flag = bool(selected and expected and selected[0] == expected[0])
        score = 1.0 if correct_flag else 0.0

    return MCQScore(
        item_id=item_id,
        correct=correct_flag,
        selected=selected,
        expected=expected,
        score=score,
    )


# ---------------------------------------------------------------------------
# Tier 2: Scenario judge scoring
# ---------------------------------------------------------------------------

def _load_rubric_template(template_id: str) -> dict:
    """Load a rubric JSON template from RUBRICS_DIR by template_id."""
    path = RUBRICS_DIR / f"{template_id}.json"
    return json.loads(path.read_text(encoding="utf-8"))


def _load_calibration_anchors() -> dict:
    """Load calibration_anchors.json from RUBRICS_DIR."""
    path = RUBRICS_DIR / "calibration_anchors.json"
    return json.loads(path.read_text(encoding="utf-8"))


def _build_judge_prompt(scenario: dict, agent_response: str) -> str:
    """Build the full judge prompt from rubric template + calibration anchors.

    Structure:
      1. judge_instructions from rubric template
      2. ## Calibration Examples (exemplary + borderline anchors)
      3. ## Rubric Criteria (each criterion: name, weight, 0-4 descriptions)
      4. ## Agent Response to Evaluate
      5. ## Your Task (JSON output format)
    """
    template_id: str = scenario["judging_config"]["judge_prompt_template"]
    rubric = _load_rubric_template(template_id)
    anchors = _load_calibration_anchors()

    lines: list[str] = []

    # 1. Judge instructions
    lines.append(rubric["judge_instructions"])
    lines.append("")

    # 2. Calibration examples
    lines.append("## Calibration Examples")
    lines.append("")
    anchor_set = anchors.get(template_id, {})

    if "exemplary" in anchor_set:
        ex = anchor_set["exemplary"]
        lines.append("### Exemplary Example")
        lines.append(f"**Scenario**: {ex.get('prompt_summary', '')}")
        lines.append(f"**Response**: {ex.get('response', '')}")
        lines.append("**Expected scores**:")
        for crit, score in ex.get("expected_scores", {}).items():
            lines.append(f"  - {crit}: {score}")
        lines.append("")

    if "borderline" in anchor_set:
        bl = anchor_set["borderline"]
        lines.append("### Borderline Example")
        lines.append(f"**Scenario**: {bl.get('prompt_summary', '')}")
        lines.append(f"**Response**: {bl.get('response', '')}")
        lines.append("**Expected scores**:")
        for crit, score in bl.get("expected_scores", {}).items():
            lines.append(f"  - {crit}: {score}")
        lines.append("")

    # 3. Rubric criteria
    lines.append("## Rubric Criteria")
    lines.append("")
    scoring_scale = rubric.get("scoring_scale", {})
    scale_levels = {lvl["score"]: lvl["label"] for lvl in scoring_scale.get("levels", [])}

    # Use scenario-specific criteria if provided, else default from rubric
    criteria = scenario.get("criteria") or rubric.get("default_criteria", [])
    for crit in criteria:
        crit_name = crit.get("criterion", crit.get("name", ""))
        weight = crit.get("weight", 0.0)
        description = crit.get("description", "")
        lines.append(f"### {crit_name} (weight: {weight:.0%})")
        if description:
            lines.append(description)
        lines.append("Scoring levels:")
        for score_val in sorted(scale_levels.keys(), reverse=True):
            lines.append(f"  {score_val} — {scale_levels[score_val]}")
        lines.append("")

    # 4. Agent response
    lines.append("## Agent Response to Evaluate")
    lines.append("")
    lines.append(agent_response)
    lines.append("")

    # 5. Your task — JSON output
    criterion_names = [
        crit.get("criterion", crit.get("name", "")) for crit in criteria
    ]
    json_keys = ", ".join(f'"{n}": <int 0-4>' for n in criterion_names)
    lines.append("## Your Task")
    lines.append("")
    lines.append(
        "Score each criterion 0-4 using the rubric above. "
        "Return your evaluation as JSON with keys matching the criterion names "
        "and integer scores 0-4, plus a 'feedback' key with a textual explanation."
    )
    lines.append("")
    lines.append(f"Required JSON format: {{{json_keys}, \"feedback\": \"<explanation>\"}}")

    return "\n".join(lines)


def _extract_json_from_text(text: str) -> dict:
    """Extract the first JSON object from a potentially prose-wrapped response."""
    # Try direct parse first
    stripped = text.strip()
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        pass

    # Find first {...} block
    match = re.search(r"\{[^{}]*\}", stripped, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    # Broader: find outermost braces
    start = stripped.find("{")
    end = stripped.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(stripped[start : end + 1])
        except json.JSONDecodeError:
            pass

    return {}


def _compute_weighted_total(criterion_scores: dict[str, int], criteria: list[dict]) -> float:
    """Compute normalised weighted total from per-criterion scores.

    Normalises by the maximum possible score (4 per criterion, weighted).
    Returns a value in [0.0, 1.0].
    """
    total_weight = sum(c.get("weight", 0.0) for c in criteria)
    if total_weight == 0:
        return 0.0

    weighted_sum = 0.0
    for crit in criteria:
        name = crit.get("criterion", crit.get("name", ""))
        weight = crit.get("weight", 0.0)
        raw = criterion_scores.get(name, 0)
        # normalise raw score (0-4) to 0-1 then weight
        weighted_sum += (raw / 4.0) * weight

    return weighted_sum / total_weight


def score_scenario(
    item: dict,
    scenario: dict,
    agent_response: str,
    cost_tracker: CostTracker,
) -> list[ScenarioScore]:
    """Invoke JUDGE_COUNT judges and return one ScenarioScore per judge.

    The judge agent path is a synthetic path; invoke_agent reads it as the
    system prompt. We pass the judge_instructions embedded in the prompt
    itself, so we use a temp file strategy — but since invoke_agent requires
    a real Path, we write a minimal system prompt file on-the-fly in /tmp,
    or we use the rubric template's judge_instructions directly.

    Implementation note: The judge is invoked with the rubric as the system
    prompt (judge_instructions) and the full judge prompt as the user turn.
    We embed everything into the user message and use a minimal system prompt.
    """
    from eval.harness.config import PROJECT_ROOT

    item_id: str = item.get("id", item.get("item_code", "unknown"))
    judge_model: str = MODELS["judge"]

    # Build the user-side prompt (includes instructions, anchors, criteria, response)
    judge_prompt = _build_judge_prompt(scenario, agent_response)

    # Minimal judge system prompt — we embed the real instructions in the user turn
    judge_system_path = _get_judge_system_path()

    criteria = scenario.get("criteria") or _load_rubric_template(
        scenario["judging_config"]["judge_prompt_template"]
    ).get("default_criteria", [])

    scores: list[ScenarioScore] = []
    for _ in range(JUDGE_COUNT):
        response = invoke_agent(
            judge_system_path,
            judge_prompt,
            judge_model,
            max_tokens=1024,
            cost_tracker=cost_tracker,
        )

        raw_text = response.get("text", "")
        parsed = _extract_json_from_text(raw_text)

        # Extract criterion scores (int, clamped to 0-4)
        per_criterion: dict[str, int] = {}
        for crit in criteria:
            name = crit.get("criterion", crit.get("name", ""))
            raw_val = parsed.get(name, 0)
            try:
                per_criterion[name] = max(0, min(4, int(raw_val)))
            except (TypeError, ValueError):
                per_criterion[name] = 0

        feedback_text: str = parsed.get("feedback", raw_text[:500] if raw_text else "")
        weighted_total = _compute_weighted_total(per_criterion, criteria)

        scores.append(
            ScenarioScore(
                item_id=item_id,
                per_criterion_scores=per_criterion,
                weighted_total=weighted_total,
                feedback_text=feedback_text,
                judge_model=judge_model,
            )
        )

    return scores


def _get_judge_system_path() -> Path:
    """Return (and create if needed) a minimal judge system prompt file."""
    from eval.harness.config import PROJECT_ROOT

    judge_md = PROJECT_ROOT / "eval" / "harness" / "_judge_system.md"
    if not judge_md.exists():
        judge_md.write_text(
            "You are a senior healthcare subject-matter expert acting as an evaluator. "
            "Follow the evaluation instructions and rubric provided in the user message exactly. "
            "Return only valid JSON as instructed.",
            encoding="utf-8",
        )
    return judge_md


# ---------------------------------------------------------------------------
# Agreement: weighted Cohen's kappa
# ---------------------------------------------------------------------------

def _weighted_kappa(
    ratings_1: list[int],
    ratings_2: list[int],
    max_score: int = 4,
) -> float:
    """Cohen's weighted kappa with quadratic weights (standard for ordinal data)."""
    n = len(ratings_1)
    if n == 0:
        return 1.0

    # Build confusion matrix
    matrix = np.zeros((max_score + 1, max_score + 1))
    for r1, r2 in zip(ratings_1, ratings_2):
        matrix[r1][r2] += 1

    # Quadratic weight matrix
    weights = np.zeros((max_score + 1, max_score + 1))
    for i in range(max_score + 1):
        for j in range(max_score + 1):
            weights[i][j] = (i - j) ** 2 / max_score ** 2

    # Expected by chance
    row_sums = matrix.sum(axis=1) / n
    col_sums = matrix.sum(axis=0) / n
    expected = np.outer(row_sums, col_sums)

    observed_disagreement = np.sum(weights * matrix / n)
    expected_disagreement = np.sum(weights * expected)

    if expected_disagreement == 0:
        return 1.0

    return float(1.0 - observed_disagreement / expected_disagreement)


def compute_agreement(all_scores: list[list[ScenarioScore]]) -> float:
    """Compute mean weighted kappa across all judge pairs.

    Args:
        all_scores: outer list = items, inner list = judges
    Returns:
        Mean weighted kappa in [-inf, 1.0]. 1.0 for single judge or empty input.
    """
    if not all_scores or len(all_scores[0]) < 2:
        return 1.0

    n_judges = len(all_scores[0])
    kappas: list[float] = []

    for j1, j2 in combinations(range(n_judges), 2):
        ratings_1: list[int] = []
        ratings_2: list[int] = []

        for item_scores in all_scores:
            for criterion, score in item_scores[j1].per_criterion_scores.items():
                ratings_1.append(score)
                if criterion in item_scores[j2].per_criterion_scores:
                    ratings_2.append(item_scores[j2].per_criterion_scores[criterion])

        if ratings_1 and ratings_2:
            kappas.append(_weighted_kappa(ratings_1, ratings_2))

    return float(np.mean(kappas)) if kappas else 1.0


# ---------------------------------------------------------------------------
# Aggregation
# ---------------------------------------------------------------------------

def aggregate_scores(
    mcq_scores: list[MCQScore],
    scenario_scores: list[list[ScenarioScore]],
    items: list[dict],
) -> dict:
    """Aggregate MCQ + scenario scores into overall, per-category, per-section breakdowns.

    Returns:
        {
          "overall_score": float (0-100),
          "tier1_score":   float (0-100),
          "tier2_score":   float (0-100),
          "per_category":  dict[claim_type -> float 0-100],
          "per_section":   dict[domain -> float 0-100],
        }
    """
    # ---- Tier 1: MCQ ----
    if mcq_scores:
        tier1_score = (sum(s.score for s in mcq_scores) / len(mcq_scores)) * 100.0
    else:
        tier1_score = 0.0

    # ---- Tier 2: Scenario ----
    if scenario_scores:
        tier2_values: list[float] = []
        for judge_list in scenario_scores:
            if not judge_list:
                continue
            # Compute agreement to decide aggregation strategy
            agreement = compute_agreement([judge_list])
            if agreement >= JUDGE_AGREEMENT_THRESHOLD or len(judge_list) == 1:
                # Use first judge's score
                tier2_values.append(judge_list[0].weighted_total)
            else:
                # Majority vote: use mean of all judges
                tier2_values.append(
                    sum(s.weighted_total for s in judge_list) / len(judge_list)
                )
        tier2_score = (sum(tier2_values) / len(tier2_values)) * 100.0 if tier2_values else 0.0
    else:
        tier2_score = 0.0

    # ---- Overall ----
    overall_score = 0.5 * tier1_score + 0.5 * tier2_score

    # ---- Build lookup maps ----
    # item_id -> item dict
    item_by_id: dict[str, dict] = {
        item.get("id", item.get("item_code", "")): item for item in items
    }
    # item_id -> MCQScore
    mcq_by_id: dict[str, MCQScore] = {s.item_id: s for s in mcq_scores}
    # item_id -> aggregated tier2 score (0-1)
    scn_by_id: dict[str, float] = {}
    for judge_list in scenario_scores:
        if not judge_list:
            continue
        iid = judge_list[0].item_id
        agreement = compute_agreement([judge_list])
        if agreement >= JUDGE_AGREEMENT_THRESHOLD or len(judge_list) == 1:
            scn_by_id[iid] = judge_list[0].weighted_total
        else:
            scn_by_id[iid] = sum(s.weighted_total for s in judge_list) / len(judge_list)

    # ---- Per-category breakdown ----
    cat_buckets: dict[str, list[float]] = {}
    for item in items:
        iid = item.get("id", item.get("item_code", ""))
        claim_type = item.get("claim_type", "unknown")
        score_val: float | None = None

        if iid in mcq_by_id:
            score_val = mcq_by_id[iid].score * 100.0
        elif iid in scn_by_id:
            score_val = scn_by_id[iid] * 100.0

        if score_val is not None:
            cat_buckets.setdefault(claim_type, []).append(score_val)

    per_category: dict[str, float] = {
        cat: sum(vals) / len(vals) for cat, vals in cat_buckets.items()
    }

    # ---- Per-section breakdown ----
    sec_buckets: dict[str, list[float]] = {}
    for item in items:
        iid = item.get("id", item.get("item_code", ""))
        domain = item.get("content_classification", {}).get("domain", "unknown")
        score_val = None

        if iid in mcq_by_id:
            score_val = mcq_by_id[iid].score * 100.0
        elif iid in scn_by_id:
            score_val = scn_by_id[iid] * 100.0

        if score_val is not None:
            sec_buckets.setdefault(domain, []).append(score_val)

    per_section: dict[str, float] = {
        sec: sum(vals) / len(vals) for sec, vals in sec_buckets.items()
    }

    return {
        "overall_score": overall_score,
        "tier1_score": tier1_score,
        "tier2_score": tier2_score,
        "per_category": per_category,
        "per_section": per_section,
    }


# ---------------------------------------------------------------------------
# Feedback generation for GEPA optimizer
# ---------------------------------------------------------------------------

def generate_feedback(
    aggregate: dict,
    items: list[dict],
    mcq_scores: list[MCQScore],
    scenario_scores: list[list[ScenarioScore]],
) -> str:
    """Generate actionable textual feedback for the GEPA optimizer.

    Highlights:
      - Categories scoring below 70%
      - Specific item IDs that failed (score == 0 or weighted_total < 0.70)
      - Judge feedback text for failed scenario items
    """
    THRESHOLD = 70.0
    lines: list[str] = []

    # Overall summary
    lines.append(
        f"Overall score: {aggregate['overall_score']:.1f}% "
        f"(Tier 1: {aggregate['tier1_score']:.1f}%, Tier 2: {aggregate['tier2_score']:.1f}%)"
    )
    lines.append("")

    # Failing categories
    failing_cats = [
        cat for cat, score in aggregate["per_category"].items() if score < THRESHOLD
    ]
    if failing_cats:
        lines.append("## Failing Categories (below 70%)")
        for cat in failing_cats:
            lines.append(
                f"  - {cat}: {aggregate['per_category'][cat]:.1f}%"
            )
        lines.append("")

    # Failing sections
    failing_secs = [
        sec for sec, score in aggregate["per_section"].items() if score < THRESHOLD
    ]
    if failing_secs:
        lines.append("## Failing Sections (below 70%)")
        for sec in failing_secs:
            lines.append(
                f"  - {sec}: {aggregate['per_section'][sec]:.1f}%"
            )
        lines.append("")

    # Failed MCQ items
    failed_mcq = [s for s in mcq_scores if not s.correct]
    if failed_mcq:
        lines.append("## Failed MCQ Items")
        for s in failed_mcq:
            lines.append(
                f"  - {s.item_id}: selected {s.selected}, expected {s.expected}"
            )
        lines.append("")

    # Failed scenario items with judge feedback
    failed_scenarios: list[tuple[str, str]] = []
    for judge_list in scenario_scores:
        if not judge_list:
            continue
        # Use first judge's score as reference
        first = judge_list[0]
        if first.weighted_total * 100.0 < THRESHOLD:
            failed_scenarios.append((first.item_id, first.feedback_text))

    if failed_scenarios:
        lines.append("## Failed Scenario Items")
        for iid, feedback in failed_scenarios:
            lines.append(f"  - {iid}: {feedback}")
        lines.append("")

    # Actionable summary
    if failing_cats or failed_mcq or failed_scenarios:
        lines.append("## Recommended Improvements")
        if failing_cats:
            lines.append(
                f"Agent missed logic in: {', '.join(failing_cats)}. "
                "Focus prompt improvements on these claim_types."
            )
        if failed_mcq:
            ids = ", ".join(s.item_id for s in failed_mcq)
            lines.append(f"Review failed items: {ids}.")
        if failed_scenarios:
            ids = ", ".join(iid for iid, _ in failed_scenarios)
            lines.append(f"Scenario items needing improvement: {ids}.")
    else:
        lines.append("All categories and sections scored >= 70%. No critical failures detected.")

    return "\n".join(lines)
