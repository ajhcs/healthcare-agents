"""
Tests for scorer.py — written FIRST per TDD.

Covers:
  - MCQ scoring: single_best_answer, multi_select, ordered_response
  - Scenario scoring: _build_judge_prompt, score_scenario (mocked)
  - Agreement: perfect, random, single-judge
  - Aggregation: overall 50/50, per-category, per-section
  - Feedback generation: failing categories, specific claim_ids

Run from project root:
    python3 -m pytest eval/harness/test_scorer.py -v
"""
from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import numpy as np
import pytest

from eval.harness.scorer import (
    MCQScore,
    ScenarioScore,
    _build_judge_prompt,
    _weighted_kappa,
    aggregate_scores,
    compute_agreement,
    generate_feedback,
    score_mcq,
    score_scenario,
)
from eval.harness.invoker import CostTracker
from eval.harness.config import JUDGE_COUNT, RUBRICS_DIR


# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------

_ITEM_SBA = {
    "id": "MCQ001",
    "tier": "mcq",
    "claim_type": "icd10_selection",
    "content_classification": {"domain": "DRG Logic"},
}

_MCQ_SBA = {
    "options": [
        {"key": "A", "text": "I11.0", "is_correct": True},
        {"key": "B", "text": "I10", "is_correct": False},
        {"key": "C", "text": "I50.9", "is_correct": False},
    ],
    "response_format": {"type": "single_best_answer"},
}

_MCQ_MULTI = {
    "options": [
        {"key": "A", "text": "Septic shock", "is_correct": True},
        {"key": "B", "text": "Hypertension", "is_correct": False},
        {"key": "C", "text": "Acute respiratory failure", "is_correct": True},
        {"key": "D", "text": "Pulmonary embolism", "is_correct": True},
    ],
    "response_format": {"type": "multi_select"},
}

_MCQ_ORDERED = {
    "options": [
        {"key": "A", "text": "I13.10", "is_correct": True},
        {"key": "B", "text": "N18.4", "is_correct": True},
        {"key": "C", "text": "I50.22", "is_correct": True},
        {"key": "D", "text": "Z87.39", "is_correct": False},
    ],
    "response_format": {"type": "ordered_response", "correct_order": ["A", "B", "C"]},
}

_ITEM_SCENARIO = {
    "id": "SCN001",
    "tier": "scenario",
    "claim_type": "coding_scenario",
    "content_classification": {"domain": "DRG Logic"},
}

_SCENARIO = {
    "prompt": "Assign ICD-10-CM codes for: HTN + CHF + CKD stage 4.",
    "judging_config": {
        "judge_prompt_template": "coding_scenario_v1",
    },
    "criteria": [
        {"criterion": "code_selection_accuracy", "weight": 0.30},
        {"criterion": "sequencing_compliance", "weight": 0.20},
        {"criterion": "guideline_citation", "weight": 0.15},
        {"criterion": "completeness", "weight": 0.20},
        {"criterion": "financial_impact_awareness", "weight": 0.15},
    ],
}

_JUDGE_JSON_RESPONSE = json.dumps({
    "code_selection_accuracy": 4,
    "sequencing_compliance": 3,
    "guideline_citation": 4,
    "completeness": 4,
    "financial_impact_awareness": 3,
    "feedback": "Excellent code selection. Sequencing could note combination code rules more explicitly.",
})

_AGENT_RESPONSE = (
    "I13.10 is the correct combination code per Section I.C.9.a.3. "
    "Sequence: I13.10, N18.4, I50.22. DRG impact: MS-DRG 291."
)


def _make_invoke_response(text: str = _JUDGE_JSON_RESPONSE) -> dict:
    return {
        "text": text,
        "input_tokens": 500,
        "output_tokens": 100,
        "cache_read_tokens": 400,
        "cache_create_tokens": 0,
        "stop_reason": "end_turn",
        "cost": 0.02,
        "error": None,
    }


def _make_scenario_score(
    item_id: str = "SCN001",
    scores: dict | None = None,
    weighted_total: float = 0.80,
    feedback: str = "Good response.",
    judge_model: str = "claude-opus-4-6",
) -> ScenarioScore:
    if scores is None:
        scores = {
            "code_selection_accuracy": 4,
            "sequencing_compliance": 3,
            "guideline_citation": 4,
            "completeness": 4,
            "financial_impact_awareness": 3,
        }
    return ScenarioScore(
        item_id=item_id,
        per_criterion_scores=scores,
        weighted_total=weighted_total,
        feedback_text=feedback,
        judge_model=judge_model,
    )


# ---------------------------------------------------------------------------
# MCQ Scoring Tests
# ---------------------------------------------------------------------------

# Test 1: Single-best-answer correct → score 1.0
def test_score_mcq_sba_correct():
    """SBA: selected correct option → MCQScore.score == 1.0, correct == True."""
    parsed = {"selected": ["A"], "parse_confidence": 0.95}
    result = score_mcq(_ITEM_SBA, _MCQ_SBA, parsed)

    assert isinstance(result, MCQScore)
    assert result.item_id == "MCQ001"
    assert result.correct is True
    assert result.score == 1.0
    assert result.selected == ["A"]
    assert result.expected == ["A"]


# Test 2: Single-best-answer incorrect → score 0.0
def test_score_mcq_sba_incorrect():
    """SBA: selected wrong option → MCQScore.score == 0.0, correct == False."""
    parsed = {"selected": ["B"], "parse_confidence": 0.95}
    result = score_mcq(_ITEM_SBA, _MCQ_SBA, parsed)

    assert result.correct is False
    assert result.score == 0.0
    assert result.selected == ["B"]
    assert result.expected == ["A"]


# Test 3: Multi-select perfect match → score 1.0
def test_score_mcq_multi_perfect():
    """Multi-select: selected == correct set → Jaccard == 1.0."""
    parsed = {"selected": ["A", "C", "D"], "parse_confidence": 0.85}
    result = score_mcq(_ITEM_SBA, _MCQ_MULTI, parsed)

    assert result.correct is True
    assert result.score == pytest.approx(1.0)
    assert sorted(result.expected) == ["A", "C", "D"]


# Test 4: Multi-select partial match (2 of 3 correct, 1 extra) → Jaccard
def test_score_mcq_multi_partial():
    """Multi-select: 2 of 3 correct + 1 extra wrong → Jaccard = 2 / (3 correct + 1 extra - 2 overlap + 2 overlap) = 2/4 = 0.5."""
    # selected: A, B (wrong), C  — correct: A, C, D
    # intersection: {A, C} = 2; union: {A, B, C, D} = 4  → 2/4 = 0.5
    parsed = {"selected": ["A", "B", "C"], "parse_confidence": 0.70}
    result = score_mcq(_ITEM_SBA, _MCQ_MULTI, parsed)

    assert result.correct is False
    assert result.score == pytest.approx(0.5)


# Test 5: Multi-select no overlap → score 0.0
def test_score_mcq_multi_no_overlap():
    """Multi-select: selected has zero overlap with correct → Jaccard == 0.0."""
    parsed = {"selected": ["B"], "parse_confidence": 0.60}
    result = score_mcq(_ITEM_SBA, _MCQ_MULTI, parsed)

    assert result.correct is False
    assert result.score == pytest.approx(0.0)


# Test 5b: Ordered response correct sequence → score 1.0
def test_score_mcq_ordered_correct():
    """Ordered response: exact sequence match → score 1.0."""
    parsed = {"selected": ["A", "B", "C"], "parse_confidence": 0.90}
    result = score_mcq(_ITEM_SBA, _MCQ_ORDERED, parsed)

    assert result.correct is True
    assert result.score == pytest.approx(1.0)


# Test 5c: Ordered response wrong sequence → score 0.0
def test_score_mcq_ordered_wrong_sequence():
    """Ordered response: wrong sequence → score 0.0."""
    parsed = {"selected": ["B", "A", "C"], "parse_confidence": 0.90}
    result = score_mcq(_ITEM_SBA, _MCQ_ORDERED, parsed)

    assert result.correct is False
    assert result.score == pytest.approx(0.0)


# ---------------------------------------------------------------------------
# Scenario Scoring Tests
# ---------------------------------------------------------------------------

# Test 6: _build_judge_prompt includes rubric criteria, calibration anchors, agent response
def test_build_judge_prompt_contains_required_sections():
    """_build_judge_prompt must include judge_instructions, criteria, calibration anchors, and agent response."""
    prompt = _build_judge_prompt(_SCENARIO, _AGENT_RESPONSE)

    # Judge instructions from the rubric template
    assert "senior certified medical coder" in prompt, "judge_instructions must be included"

    # Calibration anchors section
    assert "Calibration" in prompt, "calibration section header must be present"
    assert "exemplary" in prompt.lower(), "exemplary anchor must appear"
    assert "borderline" in prompt.lower(), "borderline anchor must appear"

    # Rubric criteria
    assert "code_selection_accuracy" in prompt, "criterion names must be listed"
    assert "sequencing_compliance" in prompt, "criterion names must be listed"
    assert "guideline_citation" in prompt, "criterion names must be listed"

    # Agent response
    assert _AGENT_RESPONSE in prompt, "agent response must be embedded verbatim"

    # JSON output instructions
    assert "JSON" in prompt, "prompt must instruct the judge to return JSON"


# Test 7: score_scenario invokes JUDGE_COUNT judges and returns that many ScenarioScore objects
def test_score_scenario_invokes_judge_count_judges():
    """score_scenario must call invoke_agent exactly JUDGE_COUNT times and return JUDGE_COUNT scores."""
    tracker = CostTracker()
    mock_response = _make_invoke_response()

    with patch("eval.harness.scorer.invoke_agent", return_value=mock_response) as mock_invoke:
        scores = score_scenario(_ITEM_SCENARIO, _SCENARIO, _AGENT_RESPONSE, tracker)

    assert mock_invoke.call_count == JUDGE_COUNT, (
        f"expected {JUDGE_COUNT} invoke_agent calls, got {mock_invoke.call_count}"
    )
    assert len(scores) == JUDGE_COUNT, (
        f"expected {JUDGE_COUNT} ScenarioScore objects, got {len(scores)}"
    )
    assert all(isinstance(s, ScenarioScore) for s in scores)


# Test 8: score_scenario parses judge JSON response correctly
def test_score_scenario_parses_judge_json_correctly():
    """score_scenario must parse criterion scores and feedback from judge JSON."""
    tracker = CostTracker()
    mock_response = _make_invoke_response(_JUDGE_JSON_RESPONSE)

    with patch("eval.harness.scorer.invoke_agent", return_value=mock_response):
        scores = score_scenario(_ITEM_SCENARIO, _SCENARIO, _AGENT_RESPONSE, tracker)

    first = scores[0]
    assert first.item_id == "SCN001"
    assert first.per_criterion_scores["code_selection_accuracy"] == 4
    assert first.per_criterion_scores["sequencing_compliance"] == 3
    assert first.per_criterion_scores["guideline_citation"] == 4
    assert first.per_criterion_scores["completeness"] == 4
    assert first.per_criterion_scores["financial_impact_awareness"] == 3
    assert "Sequencing" in first.feedback_text or len(first.feedback_text) > 0
    assert isinstance(first.weighted_total, float)
    assert 0.0 <= first.weighted_total <= 1.0


# Test 8b: score_scenario handles judge response with surrounding text (non-pure JSON)
def test_score_scenario_handles_json_in_text():
    """score_scenario must extract JSON even when judge wraps it in prose."""
    text_with_json = (
        "Here is my evaluation:\n\n"
        + _JUDGE_JSON_RESPONSE
        + "\n\nThank you."
    )
    tracker = CostTracker()
    mock_response = _make_invoke_response(text_with_json)

    with patch("eval.harness.scorer.invoke_agent", return_value=mock_response):
        scores = score_scenario(_ITEM_SCENARIO, _SCENARIO, _AGENT_RESPONSE, tracker)

    assert scores[0].per_criterion_scores["code_selection_accuracy"] == 4


# ---------------------------------------------------------------------------
# Agreement Tests
# ---------------------------------------------------------------------------

# Test 9: Perfect agreement → kappa ≈ 1.0
def test_compute_agreement_perfect():
    """All judges give identical scores → agreement == 1.0."""
    scores = {
        "code_selection_accuracy": 4,
        "sequencing_compliance": 3,
        "guideline_citation": 4,
        "completeness": 4,
        "financial_impact_awareness": 3,
    }
    # 2 items, 3 judges, all identical
    all_scores = [
        [_make_scenario_score("SCN001", scores) for _ in range(3)],
        [_make_scenario_score("SCN002", scores) for _ in range(3)],
    ]

    kappa = compute_agreement(all_scores)
    assert kappa == pytest.approx(1.0), f"perfect agreement should give kappa=1.0, got {kappa}"


# Test 10: Random disagreement → kappa < 0.5
def test_compute_agreement_random_disagreement():
    """Judges giving maximally different scores should yield kappa well below 0.5."""
    scores_j1 = {"code_selection_accuracy": 4, "sequencing_compliance": 4, "guideline_citation": 4, "completeness": 4, "financial_impact_awareness": 4}
    scores_j2 = {"code_selection_accuracy": 0, "sequencing_compliance": 0, "guideline_citation": 0, "completeness": 0, "financial_impact_awareness": 0}
    scores_j3 = {"code_selection_accuracy": 2, "sequencing_compliance": 2, "guideline_citation": 2, "completeness": 2, "financial_impact_awareness": 2}

    all_scores = [
        [
            _make_scenario_score("SCN001", scores_j1),
            _make_scenario_score("SCN001", scores_j2),
            _make_scenario_score("SCN001", scores_j3),
        ],
        [
            _make_scenario_score("SCN002", scores_j1),
            _make_scenario_score("SCN002", scores_j2),
            _make_scenario_score("SCN002", scores_j3),
        ],
    ]

    kappa = compute_agreement(all_scores)
    assert kappa < 0.5, f"high disagreement should give kappa < 0.5, got {kappa}"


# Test 11: Single judge → returns 1.0
def test_compute_agreement_single_judge():
    """Single judge per item → compute_agreement returns 1.0 (no pairs to compare)."""
    all_scores = [
        [_make_scenario_score("SCN001")],
        [_make_scenario_score("SCN002")],
    ]
    kappa = compute_agreement(all_scores)
    assert kappa == pytest.approx(1.0), f"single judge should return 1.0, got {kappa}"


# Test 11b: Empty input → returns 1.0
def test_compute_agreement_empty():
    """Empty all_scores → returns 1.0."""
    assert compute_agreement([]) == pytest.approx(1.0)


# ---------------------------------------------------------------------------
# Aggregation Tests
# ---------------------------------------------------------------------------

def _build_aggregation_fixtures():
    """Build items, mcq_scores, and scenario_scores for aggregation tests."""
    items = [
        {
            "id": "MCQ001",
            "tier": "mcq",
            "claim_type": "icd10_selection",
            "content_classification": {"domain": "DRG Logic"},
        },
        {
            "id": "MCQ002",
            "tier": "mcq",
            "claim_type": "icd10_selection",
            "content_classification": {"domain": "Outpatient Coding"},
        },
        {
            "id": "MCQ003",
            "tier": "mcq",
            "claim_type": "drg_assignment",
            "content_classification": {"domain": "DRG Logic"},
        },
        {
            "id": "SCN001",
            "tier": "scenario",
            "claim_type": "coding_scenario",
            "content_classification": {"domain": "DRG Logic"},
        },
        {
            "id": "SCN002",
            "tier": "scenario",
            "claim_type": "coding_scenario",
            "content_classification": {"domain": "Outpatient Coding"},
        },
    ]

    # MCQ: 2 correct, 1 wrong → tier1 = 66.7%
    mcq_scores = [
        MCQScore("MCQ001", True, ["A"], ["A"], 1.0),
        MCQScore("MCQ002", True, ["B"], ["B"], 1.0),
        MCQScore("MCQ003", False, ["A"], ["C"], 0.0),
    ]

    # Scenario: SCN001 = 0.80, SCN002 = 0.60 → tier2 mean = 70%
    scn1_judge_scores = [
        _make_scenario_score("SCN001", weighted_total=0.80),
        _make_scenario_score("SCN001", weighted_total=0.80),
        _make_scenario_score("SCN001", weighted_total=0.80),
    ]
    scn2_judge_scores = [
        _make_scenario_score("SCN002", weighted_total=0.60),
        _make_scenario_score("SCN002", weighted_total=0.60),
        _make_scenario_score("SCN002", weighted_total=0.60),
    ]
    scenario_scores = [scn1_judge_scores, scn2_judge_scores]

    return items, mcq_scores, scenario_scores


# Test 12: aggregate_scores computes correct overall (50/50 weighted)
def test_aggregate_scores_overall():
    """overall_score = 0.5 * tier1 + 0.5 * tier2 (both on 0-100 scale)."""
    items, mcq_scores, scenario_scores = _build_aggregation_fixtures()
    result = aggregate_scores(mcq_scores, scenario_scores, items)

    assert "overall_score" in result
    assert "tier1_score" in result
    assert "tier2_score" in result
    assert "per_category" in result
    assert "per_section" in result

    # tier1: 2/3 correct = 66.67
    assert result["tier1_score"] == pytest.approx(200.0 / 3.0, rel=0.01)
    # tier2: mean(0.80, 0.60) = 0.70 → 70.0
    assert result["tier2_score"] == pytest.approx(70.0, rel=0.01)
    # overall: 0.5 * 66.67 + 0.5 * 70.0 = 68.33
    expected_overall = 0.5 * (200.0 / 3.0) + 0.5 * 70.0
    assert result["overall_score"] == pytest.approx(expected_overall, rel=0.01)


# Test 13: Per-category breakdown groups items correctly
def test_aggregate_scores_per_category():
    """per_category must group items by claim_type and compute separate scores."""
    items, mcq_scores, scenario_scores = _build_aggregation_fixtures()
    result = aggregate_scores(mcq_scores, scenario_scores, items)

    per_cat = result["per_category"]
    assert "icd10_selection" in per_cat, "icd10_selection category must appear"
    assert "drg_assignment" in per_cat, "drg_assignment category must appear"
    assert "coding_scenario" in per_cat, "coding_scenario category must appear"

    # icd10_selection: MCQ001 (1.0) + MCQ002 (1.0) → 100%
    assert per_cat["icd10_selection"] == pytest.approx(100.0, rel=0.01)
    # drg_assignment: MCQ003 (0.0) → 0%
    assert per_cat["drg_assignment"] == pytest.approx(0.0, rel=0.01)


# Test 13b: Per-section breakdown groups items by domain
def test_aggregate_scores_per_section():
    """per_section must group items by content_classification.domain."""
    items, mcq_scores, scenario_scores = _build_aggregation_fixtures()
    result = aggregate_scores(mcq_scores, scenario_scores, items)

    per_sec = result["per_section"]
    assert "DRG Logic" in per_sec, "DRG Logic section must appear"
    assert "Outpatient Coding" in per_sec, "Outpatient Coding section must appear"


# ---------------------------------------------------------------------------
# Feedback Tests
# ---------------------------------------------------------------------------

# Test 14: generate_feedback mentions failing categories
def test_generate_feedback_mentions_failing_categories():
    """Feedback must explicitly name categories scoring below 70%."""
    items, mcq_scores, scenario_scores = _build_aggregation_fixtures()
    aggregate = aggregate_scores(mcq_scores, scenario_scores, items)

    feedback = generate_feedback(aggregate, items, mcq_scores, scenario_scores)

    assert isinstance(feedback, str)
    assert len(feedback) > 0
    # drg_assignment scored 0% — must appear in feedback
    assert "drg_assignment" in feedback, "failing category must be named in feedback"


# Test 15: generate_feedback includes specific claim_ids
def test_generate_feedback_includes_claim_ids():
    """Feedback must list specific item IDs that failed."""
    items, mcq_scores, scenario_scores = _build_aggregation_fixtures()
    aggregate = aggregate_scores(mcq_scores, scenario_scores, items)

    feedback = generate_feedback(aggregate, items, mcq_scores, scenario_scores)

    # MCQ003 failed
    assert "MCQ003" in feedback, "failed MCQ item ID must appear in feedback"


# Test 15b: generate_feedback includes judge feedback for failed scenarios
def test_generate_feedback_includes_judge_feedback_for_scenarios():
    """Feedback must include the judge's feedback_text for low-scoring scenario items."""
    items = [
        {
            "id": "SCN001",
            "tier": "scenario",
            "claim_type": "coding_scenario",
            "content_classification": {"domain": "DRG Logic"},
        },
    ]
    low_score = ScenarioScore(
        item_id="SCN001",
        per_criterion_scores={"code_selection_accuracy": 1},
        weighted_total=0.25,
        feedback_text="missing citation of Appendix C Part 1",
        judge_model="claude-opus-4-6",
    )
    scenario_scores = [[low_score, low_score, low_score]]
    mcq_scores: list[MCQScore] = []
    aggregate = aggregate_scores(mcq_scores, scenario_scores, items)

    feedback = generate_feedback(aggregate, items, mcq_scores, scenario_scores)

    assert "missing citation of Appendix C Part 1" in feedback, (
        "judge feedback_text must appear for failed scenarios"
    )


# ---------------------------------------------------------------------------
# Weighted kappa unit tests
# ---------------------------------------------------------------------------

def test_weighted_kappa_perfect_agreement():
    """Identical rating vectors → kappa == 1.0."""
    ratings = [0, 1, 2, 3, 4, 2, 3, 1]
    assert _weighted_kappa(ratings, ratings) == pytest.approx(1.0)


def test_weighted_kappa_empty():
    """Empty rating vectors → kappa == 1.0."""
    assert _weighted_kappa([], []) == pytest.approx(1.0)
