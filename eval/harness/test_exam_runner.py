"""
Tests for exam_runner.py — written FIRST per TDD.

All API calls are fully mocked — no real API calls are made.

Run from project root:
    python3 -m pytest eval/harness/test_exam_runner.py -v
"""
from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from eval.harness.exam_runner import (
    format_mcq_prompt,
    format_scenario_prompt,
    parse_mcq_response,
    run_exam,
)
from eval.harness.invoker import CostTracker

# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------

FIXTURE_MD = Path(__file__).parent / "test_fixtures" / "sample_agent.md"

_MCQ_WITH_VIGNETTE = {
    "vignette": "A 65-year-old patient is admitted with hypertensive heart disease and heart failure.",
    "lead_in": "What is the correct ICD-10-CM code for hypertensive heart disease with heart failure?",
    "options": [
        {"key": "A", "text": "I11.0 - Hypertensive heart disease with heart failure"},
        {"key": "B", "text": "I10 - Essential (primary) hypertension"},
        {"key": "C", "text": "I50.9 - Heart failure, unspecified"},
        {"key": "D", "text": "I13.0 - Hypertensive heart and chronic kidney disease"},
    ],
    "response_format": {"type": "single_best_answer"},
}

_MCQ_NO_VIGNETTE = {
    "lead_in": "Which code represents essential hypertension?",
    "options": [
        {"key": "A", "text": "I10 - Essential (primary) hypertension"},
        {"key": "B", "text": "I11.0 - Hypertensive heart disease with heart failure"},
    ],
    "response_format": {"type": "single_best_answer"},
}

_MCQ_MULTI_SELECT = {
    "lead_in": "Which of the following are MCC conditions? (Select all that apply)",
    "options": [
        {"key": "A", "text": "Septic shock"},
        {"key": "B", "text": "Hypertension"},
        {"key": "C", "text": "Acute respiratory failure"},
        {"key": "D", "text": "Diabetes mellitus type 2"},
    ],
    "response_format": {"type": "multi_select"},
}

_MCQ_CODE_MATCH = {
    "lead_in": "Which code should be used for hypertensive heart disease with heart failure?",
    "options": [
        {"key": "A", "text": "I10 - Essential hypertension"},
        {"key": "B", "text": "I11.0 - Hypertensive heart disease with heart failure"},
        {"key": "C", "text": "I50.9 - Heart failure, unspecified"},
    ],
    "response_format": {"type": "single_best_answer"},
}


def _make_invoke_response(text: str = "Mock response") -> dict:
    return {
        "text": text,
        "input_tokens": 100,
        "output_tokens": 50,
        "cache_read_tokens": 80,
        "cache_create_tokens": 0,
        "stop_reason": "end_turn",
        "cost": 0.001,
        "error": None,
    }


# ---------------------------------------------------------------------------
# Test 1 — format_mcq_prompt includes vignette, lead_in, and all options
# ---------------------------------------------------------------------------

def test_format_mcq_prompt_with_vignette():
    """Prompt must include vignette, lead_in, all options with letter prefixes."""
    item = {"id": "T001", "tier": "mcq"}
    prompt = format_mcq_prompt(item, _MCQ_WITH_VIGNETTE)

    assert _MCQ_WITH_VIGNETTE["vignette"] in prompt, "vignette must be in prompt"
    assert _MCQ_WITH_VIGNETTE["lead_in"] in prompt, "lead_in must be in prompt"

    for opt in _MCQ_WITH_VIGNETTE["options"]:
        expected_line = f"{opt['key']}. {opt['text']}"
        assert expected_line in prompt, f"option line '{expected_line}' must be in prompt"

    assert "Select the best answer and explain your reasoning." in prompt


# ---------------------------------------------------------------------------
# Test 2 — format_mcq_prompt works without vignette
# ---------------------------------------------------------------------------

def test_format_mcq_prompt_without_vignette():
    """Prompt must work with lead_in only (no vignette key)."""
    item = {"id": "T002", "tier": "mcq"}
    prompt = format_mcq_prompt(item, _MCQ_NO_VIGNETTE)

    assert _MCQ_NO_VIGNETTE["lead_in"] in prompt, "lead_in must be in prompt"

    for opt in _MCQ_NO_VIGNETTE["options"]:
        expected_line = f"{opt['key']}. {opt['text']}"
        assert expected_line in prompt, f"option line '{expected_line}' must be in prompt"

    # Vignette should not inject blank content at the top
    lines = prompt.splitlines()
    assert lines[0].strip() != "", "first non-empty content should be lead_in or option, not blank vignette"


# ---------------------------------------------------------------------------
# Test 3 — format_scenario_prompt returns the prompt text
# ---------------------------------------------------------------------------

def test_format_scenario_prompt_returns_prompt_text():
    """format_scenario_prompt must return the scenario's prompt field verbatim."""
    item = {"id": "T003", "tier": "scenario"}
    scenario = {"prompt": "You are a coder. Assign codes for this encounter: patient admitted with sepsis."}
    result = format_scenario_prompt(item, scenario)
    assert result == scenario["prompt"]


# ---------------------------------------------------------------------------
# Test 4 — parse_mcq_response extracts "The answer is A"
# ---------------------------------------------------------------------------

def test_parse_mcq_response_explicit_answer_pattern():
    """'The answer is A' → selected=['A'], confidence >= 0.9."""
    raw = "The answer is A. I11.0 is the correct code because it represents hypertensive heart disease with heart failure."
    result = parse_mcq_response(_MCQ_WITH_VIGNETTE, raw)

    assert result["selected"] == ["A"], f"expected ['A'], got {result['selected']}"
    assert result["parse_confidence"] >= 0.9, f"expected high confidence, got {result['parse_confidence']}"
    assert result["raw_text"] == raw


# ---------------------------------------------------------------------------
# Test 5 — parse_mcq_response extracts letter at start "A."
# ---------------------------------------------------------------------------

def test_parse_mcq_response_letter_at_start():
    """'A. Because...' at start of response → selected=['A']."""
    raw = "A. The correct code is I11.0 which represents hypertensive heart disease with heart failure."
    result = parse_mcq_response(_MCQ_WITH_VIGNETTE, raw)

    assert result["selected"] == ["A"], f"expected ['A'], got {result['selected']}"
    assert result["parse_confidence"] >= 0.7


# ---------------------------------------------------------------------------
# Test 6 — parse_mcq_response extracts via code match "I11.0"
# ---------------------------------------------------------------------------

def test_parse_mcq_response_code_match():
    """Response containing 'I11.0' should map to the option with that code."""
    # Response doesn't explicitly say "Answer: B" but contains "I11.0"
    raw = "Based on the clinical scenario, I11.0 is the appropriate code for this patient's condition."
    result = parse_mcq_response(_MCQ_CODE_MATCH, raw)

    assert result["selected"] == ["B"], (
        f"expected ['B'] (I11.0 option), got {result['selected']}"
    )
    assert result["parse_confidence"] >= 0.6


# ---------------------------------------------------------------------------
# Test 7 — parse_mcq_response handles multi-select "A, C, D"
# ---------------------------------------------------------------------------

def test_parse_mcq_response_multi_select():
    """Multi-select response 'A, C, and D.' → selected=['A', 'C', 'D']."""
    raw = "The correct answers are A, C, and D. Septic shock and acute respiratory failure are MCCs."
    result = parse_mcq_response(_MCQ_MULTI_SELECT, raw)

    assert sorted(result["selected"]) == ["A", "C", "D"], (
        f"expected ['A', 'C', 'D'] (all mentioned with separators), got {result['selected']}"
    )
    assert result["parse_confidence"] >= 0.5


# ---------------------------------------------------------------------------
# Test 8 — parse_mcq_response returns empty + confidence 0 when unparseable
# ---------------------------------------------------------------------------

def test_parse_mcq_response_unparseable():
    """Completely unparseable response → selected=[], parse_confidence=0.0."""
    raw = "This is a completely ambiguous response with no clear answer selection whatsoever."
    result = parse_mcq_response(_MCQ_WITH_VIGNETTE, raw)

    assert result["selected"] == [], f"expected empty selected, got {result['selected']}"
    assert result["parse_confidence"] == 0.0
    assert result["raw_text"] == raw


# ---------------------------------------------------------------------------
# Test 9 — run_exam calls invoke_agent per item and returns structured results
# ---------------------------------------------------------------------------

def test_run_exam_returns_structured_results():
    """run_exam must call invoke_agent for each item and return structured result dicts."""
    items = [
        {
            "item": {"id": "EXAM001", "tier": "mcq"},
            "mcq": _MCQ_WITH_VIGNETTE,
        },
        {
            "item": {"id": "EXAM002", "tier": "mcq"},
            "mcq": _MCQ_NO_VIGNETTE,
        },
    ]

    tracker = CostTracker()
    mock_response = _make_invoke_response("The answer is A because I11.0 is correct.")

    with patch("eval.harness.exam_runner.invoke_agent", return_value=mock_response) as mock_invoke:
        results = run_exam(
            items=items,
            agent_md_path=FIXTURE_MD,
            model="claude-sonnet-4-5-20250929",
            cost_tracker=tracker,
        )

    assert mock_invoke.call_count == 2, (
        f"invoke_agent must be called once per item, got {mock_invoke.call_count} calls"
    )
    assert len(results) == 2

    required_keys = {"item_id", "tier", "prompt", "raw_response", "parsed_answer", "cost", "error"}
    for r in results:
        assert required_keys == set(r.keys()), f"Missing/extra keys in result: {set(r.keys())}"

    assert results[0]["item_id"] == "EXAM001"
    assert results[1]["item_id"] == "EXAM002"
    assert results[0]["tier"] == "mcq"
    assert results[0]["error"] is None
    assert results[0]["raw_response"] == mock_response["text"]
    assert results[0]["parsed_answer"] is not None, "parsed_answer must be set for mcq items"
    assert isinstance(results[0]["cost"], float)
