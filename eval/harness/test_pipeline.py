"""
Tests for pipeline.py — written FIRST per TDD.

Covers:
  1.  Pipeline("revenue-medical-coding-specialist") initializes correctly
  2.  Pipeline("nonexistent-agent") raises FileNotFoundError
  3.  pipeline.run(mode="dry-run") returns PipelineResult with claims_extracted > 0,
      no API calls
  4.  pipeline.run(mode="generate-only") calls extract + generate + validate,
      persists to bank.jsonl
  5.  check_improvement returns True when overall improves 1.0pp with no regressions
  6.  check_improvement returns False when overall improves only 0.4pp (below 0.5 threshold)
  7.  check_improvement returns False when overall improves 1.0pp but one category
      regresses 3pp (above 2.0 max)
  8.  check_improvement returns True at exact boundary (0.5pp improvement)
  9.  Pipeline halts when >50% of items rejected (circuit breaker)
 10.  _persist_items appends to bank.jsonl
 11.  _load_bank reads existing bank.jsonl
 12.  _next_run_id returns opt_000 for first run, opt_001 for second
 13.  _save_results writes summary.json with expected fields
 14.  --all mode discovers agents and iterates (mock Pipeline.run)
 15.  CLI parses --generate-only, --score-only, --dry-run, --max-iterations correctly

Run from project root:
    python3 -m pytest eval/harness/test_pipeline.py -v
"""
from __future__ import annotations

import json
import sys
from dataclasses import fields
from pathlib import Path
from unittest.mock import MagicMock, patch, call

import pytest

from eval.harness.config import (
    AGENTS_DIR,
    IMPROVEMENT_THRESHOLD,
    CATEGORY_REGRESSION_MAX,
    SECTION_REGRESSION_MAX,
    GENERATE_REJECTION_THRESHOLD,
)
from eval.harness.pipeline import Pipeline, PipelineResult


# ---------------------------------------------------------------------------
# Shared fixtures / helpers
# ---------------------------------------------------------------------------

_REAL_AGENT = "revenue-medical-coding-specialist"

_FAKE_CLAIM = MagicMock()
_FAKE_CLAIM.claim_id = "C001"
_FAKE_CLAIM.claim_text = "Assigns ICD-10 codes"
_FAKE_CLAIM.claim_type = "knowledge"
_FAKE_CLAIM.source_section = "Core Mission"
_FAKE_CLAIM.line_number = 5
_FAKE_CLAIM.context = "context text"

_FAKE_ITEM = {
    "item": {
        "item_code": "ITEM001",
        "tier": "mcq",
        "claim_type": "knowledge",
        "content_classification": {"domain": "ICD-10"},
        "prompt": "What is the ICD-10 code for hypertension?",
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

_FAKE_SCORES = {
    "overall_score": 75.0,
    "tier1_score": 80.0,
    "tier2_score": 70.0,
    "per_category": {"knowledge": 75.0},
    "per_section": {"ICD-10": 75.0},
}


# ---------------------------------------------------------------------------
# Test 1: Pipeline initializes correctly for a real agent
# ---------------------------------------------------------------------------

def test_pipeline_init_real_agent():
    """Pipeline(real_agent) sets paths and creates items_dir without error."""
    pipeline = Pipeline(_REAL_AGENT)

    assert pipeline.agent_name == _REAL_AGENT
    assert pipeline.agent_md_path == AGENTS_DIR / f"{_REAL_AGENT}.md"
    assert pipeline.agent_md_path.exists()
    assert pipeline.items_dir.exists()
    assert pipeline.bank_path == pipeline.items_dir / "bank.jsonl"


# ---------------------------------------------------------------------------
# Test 2: Pipeline raises FileNotFoundError for unknown agent
# ---------------------------------------------------------------------------

def test_pipeline_init_nonexistent_agent():
    """Pipeline(nonexistent) raises FileNotFoundError immediately."""
    with pytest.raises(FileNotFoundError, match="Agent not found"):
        Pipeline("nonexistent-agent-xyz-99999")


# ---------------------------------------------------------------------------
# Test 3: dry-run mode returns claims_extracted > 0 without any API calls
# ---------------------------------------------------------------------------

def test_pipeline_dry_run_no_api_calls(tmp_path):
    """dry-run: extract claims then return early — no generate/validate/execute calls."""
    pipeline = Pipeline(_REAL_AGENT)

    with patch("eval.harness.pipeline.Pipeline._extract") as mock_extract, \
         patch("eval.harness.pipeline.Pipeline._generate") as mock_generate, \
         patch("eval.harness.pipeline.Pipeline._validate") as mock_validate, \
         patch("eval.harness.pipeline.Pipeline._execute") as mock_execute:

        mock_extract.return_value = [_FAKE_CLAIM, _FAKE_CLAIM]

        result = pipeline.run(mode="dry-run")

    assert isinstance(result, PipelineResult)
    assert result.claims_extracted == 2
    # dry-run must not touch generate, validate, or execute
    mock_generate.assert_not_called()
    mock_validate.assert_not_called()
    mock_execute.assert_not_called()
    assert result.error is None


# ---------------------------------------------------------------------------
# Test 4: generate-only mode: extract + generate + validate + persist, no execute
# ---------------------------------------------------------------------------

def test_pipeline_generate_only_persists_to_bank(tmp_path):
    """generate-only: runs extract/generate/validate and writes bank.jsonl."""
    pipeline = Pipeline(_REAL_AGENT)
    # Override items_dir so we don't pollute real bank
    pipeline.items_dir = tmp_path / "items"
    pipeline.items_dir.mkdir(parents=True)
    pipeline.bank_path = pipeline.items_dir / "bank.jsonl"

    with patch("eval.harness.pipeline.Pipeline._extract") as mock_extract, \
         patch("eval.harness.pipeline.Pipeline._generate") as mock_generate, \
         patch("eval.harness.pipeline.Pipeline._validate") as mock_validate, \
         patch("eval.harness.pipeline.Pipeline._execute") as mock_execute, \
         patch("eval.harness.pipeline.Pipeline._score") as mock_score:

        mock_extract.return_value = [_FAKE_CLAIM]
        mock_generate.return_value = [_FAKE_ITEM]
        mock_validate.return_value = [_FAKE_ITEM]

        result = pipeline.run(mode="generate-only")

    assert result.items_generated == 1
    assert result.items_validated == 1
    assert result.items_rejected == 0
    mock_execute.assert_not_called()
    mock_score.assert_not_called()

    # bank.jsonl must have been written
    assert pipeline.bank_path.exists()
    lines = pipeline.bank_path.read_text().strip().splitlines()
    assert len(lines) == 1
    parsed = json.loads(lines[0])
    assert parsed["item"]["item_code"] == "ITEM001"


# ---------------------------------------------------------------------------
# Test 5: check_improvement True when overall improves 1.0pp, no regressions
# ---------------------------------------------------------------------------

def test_check_improvement_true_with_clean_improvement():
    """1.0pp overall gain and no regressions -> True."""
    pipeline = Pipeline(_REAL_AGENT)

    before = {
        "overall_score": 70.0,
        "per_category": {"knowledge": 70.0, "reasoning": 65.0},
        "per_section": {"ICD-10": 68.0},
    }
    after = {
        "overall_score": 71.0,
        "per_category": {"knowledge": 71.0, "reasoning": 65.5},
        "per_section": {"ICD-10": 69.0},
    }

    assert pipeline.check_improvement(before, after) is True


# ---------------------------------------------------------------------------
# Test 6: check_improvement False when overall improves only 0.4pp
# ---------------------------------------------------------------------------

def test_check_improvement_false_insufficient_overall():
    """0.4pp gain is below the 0.5pp IMPROVEMENT_THRESHOLD -> False."""
    pipeline = Pipeline(_REAL_AGENT)

    before = {"overall_score": 70.0, "per_category": {}, "per_section": {}}
    after = {"overall_score": 70.4, "per_category": {}, "per_section": {}}

    assert pipeline.check_improvement(before, after) is False


# ---------------------------------------------------------------------------
# Test 7: check_improvement False when category regresses 3pp (above 2.0 max)
# ---------------------------------------------------------------------------

def test_check_improvement_false_category_regression():
    """3.0pp category regression exceeds CATEGORY_REGRESSION_MAX -> False."""
    pipeline = Pipeline(_REAL_AGENT)

    before = {
        "overall_score": 70.0,
        "per_category": {"knowledge": 80.0},
        "per_section": {},
    }
    after = {
        "overall_score": 71.0,   # overall improves enough
        "per_category": {"knowledge": 77.0},  # 3pp regression
        "per_section": {},
    }

    assert pipeline.check_improvement(before, after) is False


# ---------------------------------------------------------------------------
# Test 8: check_improvement True at exact 0.5pp boundary
# ---------------------------------------------------------------------------

def test_check_improvement_true_at_exact_boundary():
    """Exactly 0.5pp gain at the threshold boundary -> True."""
    pipeline = Pipeline(_REAL_AGENT)

    before = {"overall_score": 70.0, "per_category": {}, "per_section": {}}
    after = {"overall_score": 70.5, "per_category": {}, "per_section": {}}

    assert pipeline.check_improvement(before, after) is True


# ---------------------------------------------------------------------------
# Test 9: Circuit breaker halts when >50% items rejected
# ---------------------------------------------------------------------------

def test_pipeline_circuit_breaker_on_high_rejection(tmp_path):
    """When >50% items are rejected, run() sets result.error and returns early."""
    pipeline = Pipeline(_REAL_AGENT)
    pipeline.items_dir = tmp_path / "items"
    pipeline.items_dir.mkdir(parents=True)
    pipeline.bank_path = pipeline.items_dir / "bank.jsonl"

    with patch("eval.harness.pipeline.Pipeline._extract") as mock_extract, \
         patch("eval.harness.pipeline.Pipeline._generate") as mock_generate, \
         patch("eval.harness.pipeline.Pipeline._validate") as mock_validate, \
         patch("eval.harness.pipeline.Pipeline._execute") as mock_execute:

        mock_extract.return_value = [_FAKE_CLAIM]
        # Generate 4 items, validate only 1 -> 75% rejection rate (>50%)
        mock_generate.return_value = [_FAKE_ITEM] * 4
        mock_validate.return_value = [_FAKE_ITEM]  # only 1 passes

        result = pipeline.run(mode="generate-only")

    assert result.error is not None
    assert "rejected" in result.error.lower() or "Generation quality" in result.error
    mock_execute.assert_not_called()


# ---------------------------------------------------------------------------
# Test 10: _persist_items appends to bank.jsonl
# ---------------------------------------------------------------------------

def test_persist_items_appends_to_bank(tmp_path):
    """_persist_items writes each item as a JSON line; second call appends."""
    pipeline = Pipeline(_REAL_AGENT)
    pipeline.items_dir = tmp_path / "items"
    pipeline.items_dir.mkdir(parents=True)
    pipeline.bank_path = pipeline.items_dir / "bank.jsonl"

    item_a = {"item": {"item_code": "A001"}, "mcq": None, "scenario": None}
    item_b = {"item": {"item_code": "B001"}, "mcq": None, "scenario": None}

    pipeline._persist_items([item_a])
    pipeline._persist_items([item_b])

    lines = pipeline.bank_path.read_text().strip().splitlines()
    assert len(lines) == 2
    assert json.loads(lines[0])["item"]["item_code"] == "A001"
    assert json.loads(lines[1])["item"]["item_code"] == "B001"


# ---------------------------------------------------------------------------
# Test 11: _load_bank reads existing bank.jsonl
# ---------------------------------------------------------------------------

def test_load_bank_reads_existing_file(tmp_path):
    """_load_bank returns a list of dicts parsed from bank.jsonl."""
    pipeline = Pipeline(_REAL_AGENT)
    pipeline.items_dir = tmp_path / "items"
    pipeline.items_dir.mkdir(parents=True)
    pipeline.bank_path = pipeline.items_dir / "bank.jsonl"

    item_a = {"item": {"item_code": "A001"}, "mcq": None, "scenario": None}
    item_b = {"item": {"item_code": "B001"}, "mcq": None, "scenario": None}
    pipeline.bank_path.write_text(
        json.dumps(item_a) + "\n" + json.dumps(item_b) + "\n"
    )

    loaded = pipeline._load_bank()
    assert len(loaded) == 2
    assert loaded[0]["item"]["item_code"] == "A001"
    assert loaded[1]["item"]["item_code"] == "B001"


def test_load_bank_returns_empty_when_missing(tmp_path):
    """_load_bank returns [] when bank.jsonl does not exist."""
    pipeline = Pipeline(_REAL_AGENT)
    pipeline.items_dir = tmp_path / "items"
    pipeline.items_dir.mkdir(parents=True)
    pipeline.bank_path = pipeline.items_dir / "bank.jsonl"

    # bank_path does not exist
    assert pipeline._load_bank() == []


# ---------------------------------------------------------------------------
# Test 12: _next_run_id returns opt_000 first, opt_001 second
# ---------------------------------------------------------------------------

def test_next_run_id_sequence(tmp_path):
    """_next_run_id returns opt_000 when no dirs exist, opt_001 after one exists."""
    from eval.harness.config import RESULTS_DIR

    pipeline = Pipeline(_REAL_AGENT)

    # Patch RESULTS_DIR inside pipeline module to use tmp_path
    fake_results = tmp_path / "results"
    fake_results.mkdir()

    with patch("eval.harness.pipeline.RESULTS_DIR", fake_results):
        run_id_1 = pipeline._next_run_id()
        assert run_id_1 == "opt_000"

        # Simulate the first run dir existing
        first_dir = fake_results / pipeline.agent_name / "opt_000"
        first_dir.mkdir(parents=True)

        run_id_2 = pipeline._next_run_id()
        assert run_id_2 == "opt_001"


# ---------------------------------------------------------------------------
# Test 13: _save_results writes summary.json with expected fields
# ---------------------------------------------------------------------------

def test_save_results_writes_summary_json(tmp_path):
    """_save_results creates run_dir/summary.json with all required keys."""
    pipeline = Pipeline(_REAL_AGENT)
    fake_results = tmp_path / "results"

    result = PipelineResult(
        agent_name=_REAL_AGENT,
        claims_extracted=10,
        items_generated=5,
        items_validated=4,
        items_rejected=1,
        tier1_score=80.0,
        tier2_score=70.0,
        overall_score=75.0,
        per_category={"knowledge": 75.0},
        per_section={"ICD-10": 75.0},
        total_cost=0.05,
    )

    scores = _FAKE_SCORES.copy()

    with patch("eval.harness.pipeline.RESULTS_DIR", fake_results):
        run_dir = pipeline._save_results("opt_000", result, scores)

    summary_path = run_dir / "summary.json"
    assert summary_path.exists()

    summary = json.loads(summary_path.read_text())

    required_keys = {
        "run_id", "agent_name", "timestamp", "claims_extracted",
        "items_generated", "items_validated", "items_rejected",
        "overall_score", "tier1_score", "tier2_score",
        "per_category", "per_section", "cost", "error",
    }
    assert required_keys <= set(summary.keys()), (
        f"Missing keys: {required_keys - set(summary.keys())}"
    )
    assert summary["run_id"] == "opt_000"
    assert summary["agent_name"] == _REAL_AGENT
    assert summary["overall_score"] == 75.0
    assert summary["items_validated"] == 4
    assert summary["items_rejected"] == 1


# ---------------------------------------------------------------------------
# Test 14: --all flag discovers agents and iterates
# ---------------------------------------------------------------------------

def test_cli_all_flag_discovers_agents(tmp_path, monkeypatch):
    """--all discovers all .md files under AGENTS_DIR (excluding eval-exam-architect)
    and calls Pipeline.run() for each."""
    # Create a fake AGENTS_DIR with 3 agent files
    fake_agents_dir = tmp_path / "agents"
    fake_agents_dir.mkdir()
    (fake_agents_dir / "agent-alpha.md").write_text("# Agent Alpha\n")
    (fake_agents_dir / "agent-beta.md").write_text("# Agent Beta\n")
    (fake_agents_dir / "eval-exam-architect.md").write_text("# Architect\n")

    run_calls = []

    def fake_pipeline_run(self, mode="full", max_iterations=40):
        run_calls.append((self.agent_name, mode))
        return PipelineResult(agent_name=self.agent_name)

    with patch("eval.harness.pipeline.AGENTS_DIR", fake_agents_dir), \
         patch.object(Pipeline, "__init__", lambda self, name: (
             setattr(self, "agent_name", name) or
             setattr(self, "agent_md_path", fake_agents_dir / f"{name}.md") or
             setattr(self, "items_dir", tmp_path / "items" / name) or
             setattr(self, "bank_path", tmp_path / "items" / name / "bank.jsonl") or
             None
         )), \
         patch.object(Pipeline, "run", fake_pipeline_run):

        # Import main here so patches are active
        from eval.harness.pipeline import main
        monkeypatch.setattr(
            sys, "argv", ["pipeline.py", "--all"]
        )
        # main() will call sys.exit(0) or just return; capture any SystemExit
        try:
            main()
        except SystemExit:
            pass

    agent_names = [name for name, _ in run_calls]
    assert "agent-alpha" in agent_names
    assert "agent-beta" in agent_names
    # eval-exam-architect must be excluded
    assert "eval-exam-architect" not in agent_names


# ---------------------------------------------------------------------------
# Test 15: CLI flag parsing
# ---------------------------------------------------------------------------

def test_cli_flag_generate_only(tmp_path, monkeypatch, capsys):
    """--generate-only sets mode='generate-only'."""
    run_modes = []

    def fake_pipeline_run(self, mode="full", max_iterations=40):
        run_modes.append(mode)
        return PipelineResult(agent_name=self.agent_name)

    with patch.object(Pipeline, "run", fake_pipeline_run):
        from eval.harness.pipeline import main
        monkeypatch.setattr(sys, "argv", ["pipeline.py", _REAL_AGENT, "--generate-only"])
        try:
            main()
        except SystemExit:
            pass

    assert run_modes == ["generate-only"]


def test_cli_flag_score_only(monkeypatch):
    """--score-only sets mode='score-only'."""
    run_modes = []

    def fake_pipeline_run(self, mode="full", max_iterations=40):
        run_modes.append(mode)
        return PipelineResult(agent_name=self.agent_name)

    with patch.object(Pipeline, "run", fake_pipeline_run):
        from eval.harness.pipeline import main
        monkeypatch.setattr(sys, "argv", ["pipeline.py", _REAL_AGENT, "--score-only"])
        try:
            main()
        except SystemExit:
            pass

    assert run_modes == ["score-only"]


def test_cli_flag_dry_run(monkeypatch):
    """--dry-run sets mode='dry-run'."""
    run_modes = []

    def fake_pipeline_run(self, mode="full", max_iterations=40):
        run_modes.append(mode)
        return PipelineResult(agent_name=self.agent_name)

    with patch.object(Pipeline, "run", fake_pipeline_run):
        from eval.harness.pipeline import main
        monkeypatch.setattr(sys, "argv", ["pipeline.py", _REAL_AGENT, "--dry-run"])
        try:
            main()
        except SystemExit:
            pass

    assert run_modes == ["dry-run"]


def test_cli_flag_max_iterations(monkeypatch):
    """--max-iterations N is parsed and forwarded to pipeline.run()."""
    run_kwargs = []

    def fake_pipeline_run(self, mode="full", max_iterations=40):
        run_kwargs.append({"mode": mode, "max_iterations": max_iterations})
        return PipelineResult(agent_name=self.agent_name)

    with patch.object(Pipeline, "run", fake_pipeline_run):
        from eval.harness.pipeline import main
        monkeypatch.setattr(
            sys, "argv",
            ["pipeline.py", _REAL_AGENT, "--max-iterations", "99"]
        )
        try:
            main()
        except SystemExit:
            pass

    assert run_kwargs[0]["max_iterations"] == 99


def test_cli_no_agent_or_all_flag_exits(monkeypatch):
    """Calling CLI with no agent and no --all flag exits with non-zero code."""
    from eval.harness.pipeline import main
    monkeypatch.setattr(sys, "argv", ["pipeline.py"])
    with pytest.raises(SystemExit) as exc_info:
        main()
    assert exc_info.value.code != 0
