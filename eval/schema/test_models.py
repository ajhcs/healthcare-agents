"""
Tests for eval/schema/models.py — written BEFORE implementation (TDD).

All 13 required test cases are covered.
"""
import pytest
from pydantic import ValidationError


# ---------------------------------------------------------------------------
# Helpers — minimal valid payloads
# ---------------------------------------------------------------------------

def _base_mcq(**overrides) -> dict:
    """Return a minimal valid MCQ ExamItem payload."""
    data = {
        "item_code": "MC-K17-001",
        "target_agent": "prior-auth-agent",
        "claim_id": "claim-001",
        "claim_text": "Agent correctly identifies when prior auth is required.",
        "claim_type": "knowledge",
        "cognitive_level": "understand",
        "depth_of_knowledge": 2,
        "tier": "mcq",
        "source_citation": "CMS Medicare Benefit Policy Manual, Ch. 6",
    }
    data.update(overrides)
    return data


def _base_scenario(**overrides) -> dict:
    """Return a minimal valid Scenario ExamItem payload."""
    data = {
        "item_code": "SC-X5-001",
        "target_agent": "prior-auth-agent",
        "claim_id": "claim-002",
        "claim_text": "Agent produces a complete prior-auth justification letter.",
        "claim_type": "reasoning",
        "cognitive_level": "apply",
        "depth_of_knowledge": 3,
        "tier": "scenario",
        "source_citation": "CMS Medicare Benefit Policy Manual, Ch. 6",
    }
    data.update(overrides)
    return data


def _four_options(*, correct_indices=(0,)) -> list[dict]:
    """Return four MCQ options with the specified indices marked correct."""
    keys = ["A", "B", "C", "D"]
    return [
        {
            "key": k,
            "text": f"Option {k}",
            "is_correct": i in correct_indices,
            "rationale": f"Rationale for {k}",
        }
        for i, k in enumerate(keys)
    ]


def _valid_mcq_extension(*, response_type="single_best_answer", correct_indices=(0,)) -> dict:
    return {
        "vignette": "A 65-year-old patient requires an MRI.",
        "lead_in": "Which action should the agent take first?",
        "response_format": {"type": response_type},
        "options": _four_options(correct_indices=correct_indices),
    }


def _valid_rubric(n=3) -> list[dict]:
    return [
        {
            "criterion": f"Criterion {i+1}",
            "weight": round(1.0 / n, 4),
        }
        for i in range(n)
    ]


def _valid_scenario_extension(*, rubric_count=3) -> dict:
    return {
        "prompt": "Draft a prior-auth justification for lumbar MRI.",
        "rubric": _valid_rubric(rubric_count),
    }


# ---------------------------------------------------------------------------
# Lazy import so test collection still works before models.py exists
# ---------------------------------------------------------------------------

def _import():
    from eval.schema.models import ExamItem, MCQExtension, ScenarioExtension
    return ExamItem, MCQExtension, ScenarioExtension


# ===========================================================================
# Test 1: Valid MCQ item passes validation; status defaults; id is UUID
# ===========================================================================

def test_valid_mcq_passes():
    ExamItem, MCQExtension, _ = _import()
    item = ExamItem(**_base_mcq())
    assert item.status == "draft"
    # id must look like a UUID (8-4-4-4-12 hex)
    import re
    uuid_re = re.compile(
        r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
    )
    assert uuid_re.match(item.id), f"id is not a UUID: {item.id}"


# ===========================================================================
# Test 2: Valid scenario item passes validation
# ===========================================================================

def test_valid_scenario_passes():
    ExamItem, _, ScenarioExtension = _import()
    item = ExamItem(**_base_scenario())
    assert item.tier == "scenario"
    ext = ScenarioExtension(**_valid_scenario_extension())
    assert len(ext.rubric) == 3


# ===========================================================================
# Test 3: cognitive_level="remember" raises ValidationError for ANY claim type
# ===========================================================================

@pytest.mark.parametrize("claim_type", ["knowledge", "reasoning", "cross_domain", "edge_case"])
def test_remember_always_rejected(claim_type):
    ExamItem, _, __ = _import()
    with pytest.raises(ValidationError):
        ExamItem(**_base_mcq(claim_type=claim_type, cognitive_level="remember"))


# ===========================================================================
# Test 4: Reasoning claim with cognitive_level="understand" raises ValidationError
# ===========================================================================

def test_reasoning_understand_rejected():
    ExamItem, _, __ = _import()
    with pytest.raises(ValidationError):
        ExamItem(**_base_mcq(claim_type="reasoning", cognitive_level="understand"))


# ===========================================================================
# Test 5: Knowledge claim with cognitive_level="understand" PASSES
# ===========================================================================

def test_knowledge_understand_passes():
    ExamItem, _, __ = _import()
    item = ExamItem(**_base_mcq(claim_type="knowledge", cognitive_level="understand"))
    assert item.cognitive_level == "understand"
    assert item.claim_type == "knowledge"


# ===========================================================================
# Test 6: Fewer than 4 MCQ options raises ValidationError
# ===========================================================================

def test_fewer_than_4_options_rejected():
    _, MCQExtension, __ = _import()
    ext_data = _valid_mcq_extension()
    ext_data["options"] = ext_data["options"][:3]  # only 3
    with pytest.raises(ValidationError):
        MCQExtension(**ext_data)


# ===========================================================================
# Test 7: No is_correct=True option raises ValidationError
# ===========================================================================

def test_no_correct_option_rejected():
    _, MCQExtension, __ = _import()
    options = _four_options(correct_indices=())  # none correct
    ext_data = {**_valid_mcq_extension(), "options": options}
    with pytest.raises(ValidationError):
        MCQExtension(**ext_data)


# ===========================================================================
# Test 8: single_best_answer with multiple is_correct=True raises ValidationError
# ===========================================================================

def test_single_best_answer_multiple_correct_rejected():
    _, MCQExtension, __ = _import()
    options = _four_options(correct_indices=(0, 1))
    ext_data = _valid_mcq_extension(response_type="single_best_answer", correct_indices=(0, 1))
    ext_data["options"] = options
    with pytest.raises(ValidationError):
        MCQExtension(**ext_data)


# ===========================================================================
# Test 9: multi_select with multiple is_correct=True PASSES
# ===========================================================================

def test_multi_select_multiple_correct_passes():
    _, MCQExtension, __ = _import()
    options = _four_options(correct_indices=(0, 1))
    ext_data = _valid_mcq_extension(response_type="multi_select", correct_indices=(0, 1))
    ext_data["options"] = options
    ext = MCQExtension(**ext_data)
    assert sum(o.is_correct for o in ext.options) == 2


# ===========================================================================
# Test 10: Invalid item_code format raises ValidationError
# ===========================================================================

@pytest.mark.parametrize("bad_code", [
    "XX-K17-001",       # bad prefix
    "MC-17-001",        # missing letter before digits
    "MC-K17-01",        # only 2 trailing digits
    "MC-k17-001",       # lowercase letter
    "MC-K17-0010",      # 4 trailing digits
    "mc-K17-001",       # lowercase prefix
    "MC_K17_001",       # underscores instead of dashes
    "",
    "MC-K17",
])
def test_invalid_item_code_rejected(bad_code):
    ExamItem, _, __ = _import()
    with pytest.raises(ValidationError):
        ExamItem(**_base_mcq(item_code=bad_code))


# ===========================================================================
# Test 11: Valid item codes pass
# ===========================================================================

@pytest.mark.parametrize("good_code", [
    "MC-K17-001",
    "MS-R07-003",
    "SC-X5-001",
])
def test_valid_item_codes_pass(good_code):
    ExamItem, _, __ = _import()
    item = ExamItem(**_base_mcq(item_code=good_code))
    assert item.item_code == good_code


# ===========================================================================
# Test 12: Scenario rubric with 2 criteria raises ValidationError (min 3)
# ===========================================================================

def test_rubric_too_few_criteria_rejected():
    _, __, ScenarioExtension = _import()
    with pytest.raises(ValidationError):
        ScenarioExtension(**_valid_scenario_extension(rubric_count=2))


# ===========================================================================
# Test 13: Scenario rubric with 8 criteria raises ValidationError (max 7)
# ===========================================================================

def test_rubric_too_many_criteria_rejected():
    _, __, ScenarioExtension = _import()
    with pytest.raises(ValidationError):
        ScenarioExtension(**_valid_scenario_extension(rubric_count=8))
