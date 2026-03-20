"""
Tests for optimizer.py — written FIRST per TDD.

Covers:
  1.  parse_sections splits frontmatter from body
  2.  parse_sections creates __preamble__ for content before first ## header
  3.  parse_sections creates named sections from ## headers
  4.  parse_sections handles agent with no frontmatter
  5.  parse_sections handles agent with no preamble body (## right after frontmatter)
  6.  reassemble_sections round-trips: reassemble(parse(md)) preserves all content
  7.  reassemble_sections handles missing __frontmatter__ and __preamble__
  8.  create_dspy_metric returns a callable
  9.  create_dspy_metric returns Prediction with score=1.0 and feedback for correct MCQ
 10.  create_dspy_metric returns Prediction with score=0.0 for incorrect MCQ
 11.  optimize() uses GEPA when dspy.GEPA is available (mocked)
 12.  optimize() falls back to MIPROv2 when dspy.GEPA is absent (mocked)
 13.  OptimizationResult has all required fields with correct types
 14.  optimize() returns a complete OptimizationResult (fully mocked, no real API)

Design note: dspy is not installed in the CI environment. The module uses lazy
imports, so we pre-install a lightweight dspy mock into sys.modules BEFORE the
optimizer module is imported. All tests share the same import to avoid
triggering the numpy "cannot load module more than once" bug that occurs when
a module is force-popped and reimported mid-process.

Run from project root:
    python3 -m pytest eval/harness/test_optimizer.py -v
"""
from __future__ import annotations

import sys
import types
from dataclasses import fields
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest


# ---------------------------------------------------------------------------
# Build the dspy mock and install it BEFORE any optimizer import
# ---------------------------------------------------------------------------

def _build_dspy_mock() -> types.ModuleType:
    """Construct a minimal dspy mock sufficient for optimizer.py."""
    dspy_mock = types.ModuleType("dspy")

    # dspy.Prediction — attribute-accessible dict
    class MockPrediction(dict):
        def __init__(self, **kwargs: object) -> None:
            super().__init__(**kwargs)
            for k, v in kwargs.items():
                object.__setattr__(self, k, v)

        def __getattr__(self, name: str) -> object:
            try:
                return self[name]
            except KeyError:
                raise AttributeError(name)

    dspy_mock.Prediction = MockPrediction

    # dspy.Example — dict subclass with .with_inputs() stub
    class MockExample(dict):
        def __init__(self, **kwargs: object) -> None:
            super().__init__(**kwargs)

        def with_inputs(self, *args: str) -> "MockExample":
            return self

    dspy_mock.Example = MockExample

    # dspy.Module base class
    class MockModule:
        def forward(self, **kwargs: object) -> MockPrediction:
            return MockPrediction(response="mock response", cost=0.0)

    dspy_mock.Module = MockModule

    # dspy.GEPA
    class MockGEPA:
        def __init__(self, metric: object, auto: str = "medium", **kwargs: object) -> None:
            self.metric = metric
            self.auto = auto

        def compile(self, student: object, trainset: list) -> object:
            return student

    dspy_mock.GEPA = MockGEPA

    # dspy.teleprompt sub-module
    teleprompt_mock = types.ModuleType("dspy.teleprompt")

    class MockMIPROv2:
        def __init__(self, metric: object, auto: str = "medium", **kwargs: object) -> None:
            self.metric = metric
            self.auto = auto

        def compile(self, student: object, trainset: list) -> object:
            return student

    teleprompt_mock.MIPROv2 = MockMIPROv2
    dspy_mock.teleprompt = teleprompt_mock

    return dspy_mock


# Install the mock now, before optimizer (or anything that imports it) loads.
_DSPY_MOCK = _build_dspy_mock()
sys.modules.setdefault("dspy", _DSPY_MOCK)
sys.modules.setdefault("dspy.teleprompt", _DSPY_MOCK.teleprompt)

# Now it is safe to import the optimizer module (dspy lazy-imports will find
# the mock rather than the missing real package).
from eval.harness.optimizer import (  # noqa: E402
    OptimizationResult,
    create_dspy_metric,
    optimize,
    parse_sections,
    reassemble_sections,
)


# ---------------------------------------------------------------------------
# Shared test fixtures / sample content
# ---------------------------------------------------------------------------

_AGENT_MD_FULL = """\
---
name: Test Agent
description: A test healthcare agent
color: "#123456"
---

# Test Agent

You are TestAgent, an expert system.

## Core Mission

Help users with healthcare administration.
Track ICD-10 codes and billing workflows.

## Response Format

Always respond with structured JSON.
Include confidence scores.
"""

_AGENT_MD_NO_FM = """\
# Minimal Agent

You are Minimal.

## Instructions

Do stuff.
"""

_AGENT_MD_NO_PREAMBLE = """\
---
name: No Preamble Agent
---

## Section One

Content of section one.

## Section Two

Content of section two.
"""

_MCQ_ITEM = {
    "item": {
        "id": "MCQ001",
        "claim_type": "icd10_selection",
        "content_classification": {"domain": "DRG Logic"},
        "prompt": "Select the correct ICD-10 code for hypertension.",
    },
    "mcq": {
        "options": [
            {"key": "A", "text": "I10", "is_correct": True},
            {"key": "B", "text": "I11.0", "is_correct": False},
        ],
        "response_format": {"type": "single_best_answer"},
    },
    "scenario": None,
}

_INVOKE_SUCCESS = {
    "text": "A",
    "input_tokens": 100,
    "output_tokens": 10,
    "cache_read_tokens": 0,
    "cache_create_tokens": 0,
    "stop_reason": "end_turn",
    "cost": 0.001,
    "error": None,
}


# ---------------------------------------------------------------------------
# Test 1: parse_sections splits frontmatter correctly
# ---------------------------------------------------------------------------

def test_parse_sections_extracts_frontmatter():
    """Frontmatter between --- delimiters becomes the __frontmatter__ key."""
    result = parse_sections(_AGENT_MD_FULL)

    assert "__frontmatter__" in result
    fm = result["__frontmatter__"]
    assert fm.startswith("---")
    assert fm.endswith("---")
    assert "name: Test Agent" in fm
    assert "description: A test healthcare agent" in fm


# ---------------------------------------------------------------------------
# Test 2: parse_sections creates __preamble__ for content before first ## header
# ---------------------------------------------------------------------------

def test_parse_sections_creates_preamble():
    """Content after frontmatter but before the first ## header is __preamble__."""
    result = parse_sections(_AGENT_MD_FULL)

    assert "__preamble__" in result
    preamble = result["__preamble__"]
    assert "# Test Agent" in preamble
    assert "You are TestAgent" in preamble


# ---------------------------------------------------------------------------
# Test 3: parse_sections creates named sections from ## headers
# ---------------------------------------------------------------------------

def test_parse_sections_creates_named_sections():
    """Each ## Header becomes a key; its value is content until the next ## header."""
    result = parse_sections(_AGENT_MD_FULL)

    assert "Core Mission" in result
    assert "Response Format" in result

    mission = result["Core Mission"]
    assert "Help users with healthcare administration" in mission
    assert "ICD-10 codes" in mission
    # The next section header must NOT appear inside this section's value
    assert "## Response Format" not in mission

    response_fmt = result["Response Format"]
    assert "structured JSON" in response_fmt
    assert "confidence scores" in response_fmt


# ---------------------------------------------------------------------------
# Test 4: parse_sections handles agent with no frontmatter
# ---------------------------------------------------------------------------

def test_parse_sections_no_frontmatter():
    """When no --- block is present, __frontmatter__ key is absent."""
    result = parse_sections(_AGENT_MD_NO_FM)

    assert "__frontmatter__" not in result
    assert "__preamble__" in result
    preamble = result["__preamble__"]
    assert "# Minimal Agent" in preamble
    assert "You are Minimal" in preamble

    assert "Instructions" in result
    assert "Do stuff" in result["Instructions"]


# ---------------------------------------------------------------------------
# Test 5: parse_sections handles no preamble body
# ---------------------------------------------------------------------------

def test_parse_sections_no_preamble_body():
    """When the first ## header follows the frontmatter directly, no section
    content leaks into __preamble__."""
    result = parse_sections(_AGENT_MD_NO_PREAMBLE)

    assert "__frontmatter__" in result
    assert "Section One" in result
    assert "Content of section one" in result["Section One"]
    assert "Section Two" in result
    assert "Content of section two" in result["Section Two"]

    preamble = result.get("__preamble__", "")
    assert "Content of section one" not in preamble
    assert "Content of section two" not in preamble


# ---------------------------------------------------------------------------
# Test 6: reassemble_sections round-trips all content
# ---------------------------------------------------------------------------

def test_reassemble_sections_round_trip():
    """reassemble(parse(md)) must contain all meaningful content from the original."""
    sections = parse_sections(_AGENT_MD_FULL)
    rebuilt = reassemble_sections(sections)

    assert "name: Test Agent" in rebuilt
    assert "You are TestAgent" in rebuilt
    assert "Core Mission" in rebuilt
    assert "Help users with healthcare administration" in rebuilt
    assert "Response Format" in rebuilt
    assert "structured JSON" in rebuilt


# ---------------------------------------------------------------------------
# Test 7: reassemble_sections handles missing special keys
# ---------------------------------------------------------------------------

def test_reassemble_sections_without_special_keys():
    """reassemble_sections must work when __frontmatter__ and __preamble__ are absent."""
    sections = {
        "Section A": "Content A",
        "Section B": "Content B",
    }
    rebuilt = reassemble_sections(sections)

    assert "## Section A" in rebuilt
    assert "Content A" in rebuilt
    assert "## Section B" in rebuilt
    assert "Content B" in rebuilt


# ---------------------------------------------------------------------------
# Test 8: create_dspy_metric returns a callable
# ---------------------------------------------------------------------------

def test_create_dspy_metric_returns_callable():
    """create_dspy_metric must return a callable."""
    metric = create_dspy_metric(
        exam_items=[],
        scorer_module=MagicMock(),
        config=MagicMock(GEPA_AUTO="medium"),
    )
    assert callable(metric)


# ---------------------------------------------------------------------------
# Test 9: create_dspy_metric — correct MCQ gives score=1.0
# ---------------------------------------------------------------------------

def test_create_dspy_metric_correct_mcq():
    """Metric returns score=1.0 and non-empty feedback when MCQ answer is correct."""
    from eval.harness.scorer import MCQScore

    # parse_mcq_response and score_mcq are imported lazily inside create_dspy_metric
    # from their source modules, so we patch them at source.
    with patch("eval.harness.exam_runner.parse_mcq_response") as mock_parse, \
         patch("eval.harness.scorer.score_mcq") as mock_score:

        mock_parse.return_value = {"selected": ["A"]}
        mock_score.return_value = MCQScore(
            item_id="MCQ001",
            correct=True,
            selected=["A"],
            expected=["A"],
            score=1.0,
        )

        metric = create_dspy_metric(
            exam_items=[],
            scorer_module=MagicMock(),
            config=MagicMock(GEPA_AUTO="medium"),
        )

        example = {
            "item": {"id": "MCQ001", "claim_type": "icd10_selection"},
            "mcq": {
                "options": [
                    {"key": "A", "text": "I10", "is_correct": True},
                    {"key": "B", "text": "I11", "is_correct": False},
                ],
                "response_format": {"type": "single_best_answer"},
            },
            "scenario": None,
        }
        pred = {"response": "The answer is A."}

        result = metric(example, pred, trace=None)

    score_val = result.score if hasattr(result, "score") else result["score"]
    assert score_val == 1.0

    feedback_val = result.feedback if hasattr(result, "feedback") else result["feedback"]
    assert isinstance(feedback_val, str)
    assert len(feedback_val) > 0


# ---------------------------------------------------------------------------
# Test 10: create_dspy_metric — incorrect MCQ gives score=0.0
# ---------------------------------------------------------------------------

def test_create_dspy_metric_incorrect_mcq():
    """Metric returns score=0.0 when MCQ answer is incorrect."""
    from eval.harness.scorer import MCQScore

    with patch("eval.harness.exam_runner.parse_mcq_response") as mock_parse, \
         patch("eval.harness.scorer.score_mcq") as mock_score:

        mock_parse.return_value = {"selected": ["B"]}
        mock_score.return_value = MCQScore(
            item_id="MCQ001",
            correct=False,
            selected=["B"],
            expected=["A"],
            score=0.0,
        )

        metric = create_dspy_metric(
            exam_items=[],
            scorer_module=MagicMock(),
            config=MagicMock(GEPA_AUTO="medium"),
        )

        example = {
            "item": {"id": "MCQ001", "claim_type": "icd10_selection"},
            "mcq": {
                "options": [
                    {"key": "A", "text": "I10", "is_correct": True},
                    {"key": "B", "text": "I11", "is_correct": False},
                ],
                "response_format": {"type": "single_best_answer"},
            },
            "scenario": None,
        }
        pred = {"response": "The answer is B."}

        result = metric(example, pred, trace=None)

    score_val = result.score if hasattr(result, "score") else result["score"]
    assert score_val == 0.0


# ---------------------------------------------------------------------------
# Test 11: optimize() uses GEPA when dspy.GEPA is available
# ---------------------------------------------------------------------------

def test_optimize_uses_gepa_when_available(tmp_path: Path):
    """When the dspy mock exposes GEPA, optimize() records optimizer_used='GEPA'."""
    agent_md = tmp_path / "test_agent.md"
    agent_md.write_text(_AGENT_MD_FULL, encoding="utf-8")

    from eval.harness.scorer import MCQScore

    # Lazy imports inside optimize() pull from their source modules.
    with patch("eval.harness.exam_runner.parse_mcq_response") as mock_parse, \
         patch("eval.harness.scorer.score_mcq") as mock_score, \
         patch("eval.harness.invoker.invoke_agent") as mock_invoke:

        mock_parse.return_value = {"selected": ["A"]}
        mock_score.return_value = MCQScore(
            item_id="MCQ001", correct=True, selected=["A"], expected=["A"], score=1.0,
        )
        mock_invoke.return_value = _INVOKE_SUCCESS

        result = optimize(
            agent_md_path=agent_md,
            exam_items=[_MCQ_ITEM],
            scorer_module=MagicMock(),
            config=MagicMock(GEPA_AUTO="medium"),
        )

    assert result.optimizer_used == "GEPA"


# ---------------------------------------------------------------------------
# Test 12: optimize() falls back to MIPROv2 when dspy.GEPA is absent
# ---------------------------------------------------------------------------

def test_optimize_falls_back_to_miproV2_when_gepa_missing(tmp_path: Path):
    """When dspy.GEPA does not exist, optimize() falls back and records 'MIPROv2'."""
    agent_md = tmp_path / "test_agent.md"
    agent_md.write_text(_AGENT_MD_FULL, encoding="utf-8")

    from eval.harness.scorer import MCQScore

    # Build a dspy mock that has NO GEPA attribute
    dspy_no_gepa = _build_dspy_mock()
    del dspy_no_gepa.GEPA

    with patch.dict(sys.modules, {"dspy": dspy_no_gepa, "dspy.teleprompt": dspy_no_gepa.teleprompt}), \
         patch("eval.harness.exam_runner.parse_mcq_response") as mock_parse, \
         patch("eval.harness.scorer.score_mcq") as mock_score, \
         patch("eval.harness.invoker.invoke_agent") as mock_invoke:

        mock_parse.return_value = {"selected": ["A"]}
        mock_score.return_value = MCQScore(
            item_id="MCQ001", correct=True, selected=["A"], expected=["A"], score=1.0,
        )
        mock_invoke.return_value = _INVOKE_SUCCESS

        result = optimize(
            agent_md_path=agent_md,
            exam_items=[_MCQ_ITEM],
            scorer_module=MagicMock(),
            config=MagicMock(GEPA_AUTO="medium"),
        )

    assert result.optimizer_used == "MIPROv2"


# ---------------------------------------------------------------------------
# Test 13: OptimizationResult has all required fields
# ---------------------------------------------------------------------------

def test_optimization_result_has_all_fields():
    """OptimizationResult dataclass must expose all required fields with correct types."""
    required = {
        "new_md_content",
        "score_before",
        "score_after",
        "per_category_scores",
        "per_section_scores",
        "feedback_text",
        "trials_run",
        "cost",
        "optimizer_used",
    }
    field_names = {f.name for f in fields(OptimizationResult)}
    assert required <= field_names, f"Missing fields: {required - field_names}"

    result = OptimizationResult(
        new_md_content="# Agent",
        score_before=0.5,
        score_after=0.75,
        per_category_scores={"icd10": 80.0},
        per_section_scores={"DRG Logic": 75.0},
        feedback_text="Improved in ICD-10 selection.",
        trials_run=10,
        cost=0.25,
        optimizer_used="GEPA",
    )

    assert isinstance(result.new_md_content, str)
    assert isinstance(result.score_before, float)
    assert isinstance(result.score_after, float)
    assert isinstance(result.per_category_scores, dict)
    assert isinstance(result.per_section_scores, dict)
    assert isinstance(result.feedback_text, str)
    assert isinstance(result.trials_run, int)
    assert isinstance(result.cost, float)
    assert isinstance(result.optimizer_used, str)
    assert result.optimizer_used in ("GEPA", "MIPROv2")


# ---------------------------------------------------------------------------
# Test 14: optimize() returns a complete OptimizationResult
# ---------------------------------------------------------------------------

def test_optimize_returns_optimization_result(tmp_path: Path):
    """optimize() must return an OptimizationResult with all fields sane."""
    agent_md = tmp_path / "test_agent.md"
    agent_md.write_text(_AGENT_MD_FULL, encoding="utf-8")

    from eval.harness.scorer import MCQScore

    with patch("eval.harness.exam_runner.parse_mcq_response") as mock_parse, \
         patch("eval.harness.scorer.score_mcq") as mock_score, \
         patch("eval.harness.invoker.invoke_agent") as mock_invoke:

        mock_parse.return_value = {"selected": ["A"]}
        mock_score.return_value = MCQScore(
            item_id="MCQ001", correct=True, selected=["A"], expected=["A"], score=1.0,
        )
        mock_invoke.return_value = _INVOKE_SUCCESS

        result = optimize(
            agent_md_path=agent_md,
            exam_items=[_MCQ_ITEM],
            scorer_module=MagicMock(),
            config=MagicMock(GEPA_AUTO="medium"),
        )

    assert isinstance(result, OptimizationResult)
    assert isinstance(result.new_md_content, str)
    assert len(result.new_md_content) > 0
    assert 0.0 <= result.score_before <= 100.0
    assert 0.0 <= result.score_after <= 100.0
    assert isinstance(result.per_category_scores, dict)
    assert isinstance(result.per_section_scores, dict)
    assert isinstance(result.feedback_text, str)
    assert result.trials_run >= 0
    assert result.cost >= 0.0
    assert result.optimizer_used in ("GEPA", "MIPROv2")
