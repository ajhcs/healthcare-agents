# Exam Architect & Eval Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a system that auto-generates psychometrically valid exam items for any healthcare agent, scores the agent against them, and optimizes the agent's system prompt via DSPy GEPA until scores improve.

**Architecture:** Three components — Exam Architect agent (.md), Question Schema + validation (JSON Schema + Python), and DSPy Eval Harness (10-stage pipeline). The exam architect generates items, the harness runs/scores/optimizes, and git commits track improvement.

**Tech Stack:** Python 3.10+, DSPy 3.1.3+ (GEPA optimizer), Anthropic SDK (Messages API with prompt caching), girth + catsim (IRT), Pydantic (schema validation)

**Spec:** `docs/superpowers/specs/2026-03-20-exam-architect-eval-loop-design.md`

**Implementation notes:**
- Model IDs should be verified against the current Anthropic API at implementation time. Use config.py constants, not hardcoded strings.
- GEPA ships with DSPy 3.1.3 as a core dependency (`dspy.GEPA`). MIPROv2 is the fallback.
- IRT: Use 2PL (girth `twopl_mml`) at N >= 30. Upgrade to 3PL only at N >= 500 (custom MMLE implementation required — no working Python library exists for 3PL).
- Prompt caching (`cache_control: {"type": "ephemeral"}`) is critical — same system prompt across 130 items. Cached reads are 90% cheaper and don't count against ITPM rate limits.

---

## File Map

| File | Responsibility | Task |
|------|---------------|------|
| `eval/harness/config.py` | All constants, paths, model IDs, pricing, thresholds | 1 |
| `eval/conftest.py` | Pytest configuration, marker registration | 1 |
| `eval/requirements.txt` | Python dependencies | 1 |
| `scripts/run-eval.sh` | CLI entry point | 1 |
| `eval/schema/models.py` | Pydantic models for exam items (both tiers) | 2 |
| `eval/schema/item_schema.json` | JSON Schema generated from Pydantic models | 2 |
| `eval/schema/validate.py` | Structural validation rules 1-10 | 3 |
| `eval/harness/claim_extractor.py` | Parse agent .md → testable claims list | 4 |
| `eval/harness/invoker.py` | Anthropic API wrapper with prompt caching + cost tracking | 5 |
| `eval/harness/exam_runner.py` | Format items into prompts, parse agent responses | 5 |
| `eval/rubrics/coding_scenario_v1.json` | Rubric template for medical coding scenarios | 6 |
| `eval/rubrics/general_scenario_v1.json` | Rubric template for non-coding agents | 6 |
| `eval/rubrics/calibration_anchors.json` | Pre-scored anchor responses for judge calibration | 6 |
| `agents/eval-exam-architect.md` | Exam generation LLM agent system prompt | 7 |
| `eval/harness/scorer.py` | Tier 1 auto-score + Tier 2 multi-judge rubric | 8 |
| `eval/harness/analyzer.py` | CTT stats, 2PL/3PL IRT calibration, item fit | 9 |
| `eval/harness/optimizer.py` | GEPA/MIPROv2 wrapper, section-aware optimization | 10 |
| `eval/harness/pipeline.py` | 10-stage orchestrator, CLI, results output | 11 |
| `eval/harness/test_integration.py` | End-to-end integration test | 12 |

---

## Task 1: Project Scaffolding

**Files:**
- Create: `eval/__init__.py`, `eval/schema/__init__.py`, `eval/harness/__init__.py`
- Create: `eval/harness/config.py`
- Create: `eval/requirements.txt`
- Create: `eval/conftest.py`
- Create: `scripts/run-eval.sh`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p eval/schema eval/harness eval/items eval/results eval/rubrics eval/sources
touch eval/__init__.py eval/schema/__init__.py eval/harness/__init__.py
```

- [ ] **Step 2: Write requirements.txt**

Create `eval/requirements.txt`:
```
dspy[anthropic]>=3.1.3
pydantic>=2.0
girth>=0.8.0
catsim>=0.20.0
scipy>=1.10.0
numpy>=1.26.0
pytest>=8.0.0
```

- [ ] **Step 3: Write config.py**

Create `eval/harness/config.py`:

```python
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
AGENTS_DIR = PROJECT_ROOT / "agents"
EVAL_DIR = PROJECT_ROOT / "eval"
ITEMS_DIR = EVAL_DIR / "items"
RESULTS_DIR = EVAL_DIR / "results"
RUBRICS_DIR = EVAL_DIR / "rubrics"
SOURCES_DIR = EVAL_DIR / "sources"

# Verify model IDs against Anthropic API at implementation time
MODELS = {
    "generation": "claude-sonnet-4-5-20250929",
    "agent_under_test": "claude-sonnet-4-5-20250929",
    "judge": "claude-opus-4-6",
}

# Per million tokens. cache_read = 90% discount on input. cache_create = 25% surcharge.
PRICING = {
    "claude-sonnet-4-5-20250929": {"input": 3.00, "output": 15.00, "cache_read": 0.30, "cache_create": 3.75},
    "claude-opus-4-6": {"input": 15.00, "output": 75.00, "cache_read": 1.50, "cache_create": 18.75},
}

ANTHROPIC_MAX_RETRIES = 5
ANTHROPIC_TIMEOUT = 600.0
IMPROVEMENT_THRESHOLD = 0.5
CATEGORY_REGRESSION_MAX = 2.0
SECTION_REGRESSION_MAX = 5.0
FIELD_TEST_MIN_N = 30
IRT_3PL_MIN_N = 500
JUDGE_COUNT = 3
JUDGE_AGREEMENT_THRESHOLD = 0.70
GEPA_AUTO = "medium"
GENERATE_MAX_RETRIES = 3
GENERATE_REJECTION_THRESHOLD = 0.50
AGENT_TIMEOUT = 60
```

- [ ] **Step 4: Write conftest.py**

Create `eval/conftest.py`:
```python
import pytest

def pytest_configure(config):
    config.addinivalue_line("markers", "integration: requires API key and makes real API calls")
```

- [ ] **Step 5: Write run-eval.sh**

Create `scripts/run-eval.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"
python -m eval.harness.pipeline "$@"
```

Then: `chmod +x scripts/run-eval.sh`

- [ ] **Step 6: Install dependencies and verify**

Run: `pip install -r eval/requirements.txt`
Run: `python -c "import dspy; print(dspy.__version__)"` — expect >= 3.1.3
Run: `python -c "import anthropic; print(anthropic.__version__)"`
Run: `python -c "from girth import twopl_mml; print('girth ok')"`
Run: `python -c "from catsim.irt import inf; print('catsim ok')"`

- [ ] **Step 7: Commit**

```bash
git add eval/ scripts/run-eval.sh
git commit -m "feat: scaffold eval system with dependencies and config"
```

---

## Task 2: Question Schema (Pydantic Models)

**Files:**
- Create: `eval/schema/models.py`
- Create: `eval/schema/item_schema.json`
- Test: `eval/schema/test_models.py`

- [ ] **Step 1: Write tests for schema models**

Create `eval/schema/test_models.py` with tests for:
- Valid Tier 1 MCQ item passes validation
- Valid Tier 2 scenario item passes validation
- `cognitive_level="remember"` raises ValidationError
- Fewer than 4 options raises ValidationError
- No `is_correct=True` option raises ValidationError
- Single-best-answer with multiple `is_correct=True` raises ValidationError
- Multi-select items allow multiple `is_correct=True`
- Invalid `item_code` format raises ValidationError
- Reasoning claim with `cognitive_level="understand"` raises ValidationError (must be >= apply)
- Scenario rubric with 2 criteria raises ValidationError (min 3)
- Scenario rubric with 8 criteria raises ValidationError (max 7)

- [ ] **Step 2: Run tests to verify they fail**

Run: `python -m pytest eval/schema/test_models.py -v`
Expected: FAIL — module does not exist

- [ ] **Step 3: Implement Pydantic models**

Create `eval/schema/models.py` with all models and validators per spec. Key validators:
- `cognitive_level` not "remember" for any claim type
- `cognitive_level` >= "apply" for reasoning/cross_domain/edge_case claims
- `item_code` matches `^(MC|MS|OR|SC)-[A-Z]\d+-\d{3}$`
- MCQ options >= 4, at least one `is_correct=True`
- Single-best-answer: exactly one correct
- Scenario rubric: 3-7 criteria
- Auto-generate UUID, default status "draft"

- [ ] **Step 4: Run tests to verify they pass**

Run: `python -m pytest eval/schema/test_models.py -v`
Expected: All PASS

- [ ] **Step 5: Generate JSON Schema from Pydantic models**

Add to end of `models.py`:
```python
if __name__ == "__main__":
    import json
    from pathlib import Path
    schema = ExamItem.model_json_schema()
    Path(__file__).parent.joinpath("item_schema.json").write_text(
        json.dumps(schema, indent=2)
    )
```

Run: `python -m eval.schema.models`
Verify: `eval/schema/item_schema.json` exists and contains valid JSON Schema

- [ ] **Step 6: Commit**

```bash
git add eval/schema/models.py eval/schema/test_models.py eval/schema/item_schema.json
git commit -m "feat: add Pydantic models for exam item schema with validation"
```

---

## Task 3: Structural Validation Script

**Files:**
- Create: `eval/schema/validate.py`
- Test: `eval/schema/test_validate.py`

- [ ] **Step 1: Write tests for structural validation (rules 1-10)**

Tests for:
- Valid item passes all structural rules
- >2x length variance in options rejected (rule 4)
- Missing source citation rejected (rule 5)
- Scenario vignette < 50 words rejected (rule 6)
- "all of the above" rejected (rule 8)
- "Which of the following is true?" lead-in rejected (rule 8)
- Negative stem without emphasis rejected (rule 9)
- "always"/"never" in distractors rejected (rule 10)
- Duplicate item (Jaccard > 0.8) rejected against fixture bank (rule 7)

- [ ] **Step 2: Run tests to verify they fail**

Run: `python -m pytest eval/schema/test_validate.py -v`
Expected: FAIL

- [ ] **Step 3: Implement validate.py**

Create `eval/schema/validate.py` with:
- `validate_structural(item, mcq, scenario) -> list[str]` — rules 1-10, returns violation list
- `validate_against_bank(item, bank_path: Path) -> list[str]` — Jaccard similarity check (rule 7)
- `validate_bank_level(bank_path: Path) -> list[str]` — answer position distribution (rule 16)
- Each rule as a private function

- [ ] **Step 4: Run tests to verify they pass**

Run: `python -m pytest eval/schema/test_validate.py -v`
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add eval/schema/validate.py eval/schema/test_validate.py
git commit -m "feat: add structural validation rules 1-10 for exam items"
```

---

## Task 4: Claim Extractor

**Files:**
- Create: `eval/harness/claim_extractor.py`
- Test: `eval/harness/test_claim_extractor.py`

- [ ] **Step 1: Write tests**

Tests using a small fixture `.md` file (not the full 451-line agent):
- Reads `.md` and returns list of `Claim` objects
- Extracts knowledge claims from guideline citations
- Extracts reasoning claims from capability assertions
- Extracts edge case claims from exception language
- Assigns sequential IDs (K01, K02... R01... X01... E01...)
- Caches to `claims.json`, reuses if hash unchanged
- Regenerates when content hash changes

- [ ] **Step 2: Run tests to verify they fail**

Run: `python -m pytest eval/harness/test_claim_extractor.py -v`
Expected: FAIL

- [ ] **Step 3: Implement claim_extractor.py**

Deterministic regex-based extraction (no LLM call, free):
- `Claim` dataclass: claim_id, claim_text, claim_type, source_section, line_number, context
- `extract_claims(agent_md_path: Path) -> list[Claim]` — main entry
- `_parse_frontmatter(content) -> dict`
- `_find_knowledge_claims(lines) -> list[Claim]` — guideline citations, code references, thresholds
- `_find_reasoning_claims(lines) -> list[Claim]` — capability language
- `_find_cross_domain_claims(lines) -> list[Claim]` — cross-domain references
- `_find_edge_case_claims(lines) -> list[Claim]` — exception language
- `_cache_claims / _load_cached_claims` — to `items/{agent}/claims.json`

- [ ] **Step 4: Run tests to verify they pass**

Run: `python -m pytest eval/harness/test_claim_extractor.py -v`
Expected: All PASS

- [ ] **Step 5: Smoke test against real agent**

Run: `python -c "from eval.harness.claim_extractor import extract_claims; from pathlib import Path; claims = extract_claims(Path('agents/revenue-medical-coding-specialist.md')); print(f'{len(claims)} claims'); [print(f'  {c.claim_id}: {c.claim_text[:80]}') for c in claims[:10]]"`
Expected: 80+ claims extracted

- [ ] **Step 6: Commit**

```bash
git add eval/harness/claim_extractor.py eval/harness/test_claim_extractor.py
git commit -m "feat: add claim extractor to parse agent .md into testable claims"
```

---

## Task 5: Agent Invoker + Exam Runner

**Files:**
- Create: `eval/harness/invoker.py`
- Create: `eval/harness/exam_runner.py`
- Test: `eval/harness/test_invoker.py`
- Test: `eval/harness/test_exam_runner.py`

- [ ] **Step 1: Write invoker tests**

Tests (mocked API, no real calls):
- Calls Messages API with system prompt from `.md`, returns response dict
- Uses prompt caching (`cache_control: ephemeral`) on system prompt
- Returns `{text, input_tokens, output_tokens, cache_read_tokens, cache_create_tokens, stop_reason, cost, error}`
- Cost calculation accounts for cache pricing (cache_read at 90% discount, cache_create at 25% surcharge)
- Handles errors gracefully (returns error dict, not exception)
- `CostTracker` accumulates costs across calls

- [ ] **Step 2: Write exam runner tests**

Tests:
- `format_mcq_prompt(item) -> str`: formats vignette + lead-in + options into a user message
- `format_scenario_prompt(item) -> str`: formats scenario prompt
- `parse_mcq_response(item, raw_text) -> dict`: extracts selected option letter(s) from free text
- `parse_mcq_response` handles: "The answer is A", "A.", "Option A", "I11.0" (code match), multi-select "A, C, D"
- Returns `{"selected": ["A"], "raw_text": "...", "parse_confidence": 0.9}`

- [ ] **Step 3: Run tests to verify they fail**

Run: `python -m pytest eval/harness/test_invoker.py eval/harness/test_exam_runner.py -v`
Expected: FAIL

- [ ] **Step 4: Implement invoker.py**

```python
from pathlib import Path
from anthropic import Anthropic, RateLimitError, APIConnectionError, BadRequestError, APIStatusError
from eval.harness.config import PRICING, ANTHROPIC_MAX_RETRIES, ANTHROPIC_TIMEOUT

client = Anthropic(max_retries=ANTHROPIC_MAX_RETRIES, timeout=ANTHROPIC_TIMEOUT)

class CostTracker:
    def __init__(self):
        self.total_input = 0
        self.total_output = 0
        self.total_cache_read = 0
        self.total_cache_create = 0
        self.total_cost = 0.0
        self.call_count = 0

    def record(self, model, input_tokens, output_tokens, cache_read=0, cache_create=0):
        self.total_input += input_tokens
        self.total_output += output_tokens
        self.total_cache_read += cache_read
        self.total_cache_create += cache_create
        self.call_count += 1
        prices = PRICING.get(model, list(PRICING.values())[0])
        uncached_input = input_tokens - cache_read - cache_create
        cost = (max(0, uncached_input) / 1e6) * prices["input"] \
             + (cache_read / 1e6) * prices["cache_read"] \
             + (cache_create / 1e6) * prices["cache_create"] \
             + (output_tokens / 1e6) * prices["output"]
        self.total_cost += cost
        return cost

def invoke_agent(agent_md_path: Path, user_message: str, model: str,
                 max_tokens: int = 4096, cost_tracker: CostTracker | None = None) -> dict:
    system_prompt = agent_md_path.read_text(encoding="utf-8")
    try:
        message = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=[{"type": "text", "text": system_prompt, "cache_control": {"type": "ephemeral"}}],
            messages=[{"role": "user", "content": user_message}],
        )
        cache_read = getattr(message.usage, "cache_read_input_tokens", 0) or 0
        cache_create = getattr(message.usage, "cache_creation_input_tokens", 0) or 0
        cost = 0.0
        if cost_tracker:
            cost = cost_tracker.record(model, message.usage.input_tokens,
                                       message.usage.output_tokens, cache_read, cache_create)
        return {
            "text": message.content[0].text,
            "input_tokens": message.usage.input_tokens,
            "output_tokens": message.usage.output_tokens,
            "cache_read_tokens": cache_read,
            "cache_create_tokens": cache_create,
            "stop_reason": message.stop_reason,
            "cost": cost,
            "error": None,
        }
    except (RateLimitError, APIConnectionError, BadRequestError, APIStatusError) as e:
        return {"text": "", "input_tokens": 0, "output_tokens": 0, "cache_read_tokens": 0,
                "cache_create_tokens": 0, "stop_reason": "error", "cost": 0.0, "error": str(e)}
```

- [ ] **Step 5: Implement exam_runner.py**

Create `eval/harness/exam_runner.py` with:
- `format_mcq_prompt(item: dict) -> str` — build user message from vignette + lead-in + lettered options
- `format_scenario_prompt(item: dict) -> str` — build user message from scenario prompt text
- `parse_mcq_response(item: dict, raw_text: str) -> dict` — extract selected option(s) via: (1) look for "Answer: X" pattern, (2) look for option letter at start of line, (3) look for exact code text match, (4) multi-select: split on commas/newlines
- `run_exam(items: list[dict], agent_md_path: Path, model: str, cost_tracker: CostTracker) -> list[dict]` — format each item, invoke agent, parse response, return list of `{item_id, prompt, raw_response, parsed_answer, cost}`

- [ ] **Step 6: Run tests to verify they pass**

Run: `python -m pytest eval/harness/test_invoker.py eval/harness/test_exam_runner.py -v`
Expected: All PASS

- [ ] **Step 7: Commit**

```bash
git add eval/harness/invoker.py eval/harness/exam_runner.py eval/harness/test_invoker.py eval/harness/test_exam_runner.py
git commit -m "feat: add agent invoker with prompt caching and exam runner with response parsing"
```

---

## Task 6: Rubric Templates + Calibration Anchors

**Files:**
- Create: `eval/rubrics/coding_scenario_v1.json`
- Create: `eval/rubrics/general_scenario_v1.json`
- Create: `eval/rubrics/calibration_anchors.json`

Note: Moved before Task 7 (Scorer) because the scorer's `_build_judge_prompt` depends on rubric template structure.

- [ ] **Step 1: Create coding scenario rubric template**

Create `eval/rubrics/coding_scenario_v1.json` with scoring scale (0-4), default criteria (code_selection_accuracy, sequencing_compliance, guideline_citation, completeness, financial_impact_awareness), and judge instructions.

- [ ] **Step 2: Create general scenario rubric template**

Create `eval/rubrics/general_scenario_v1.json` with domain-agnostic criteria (accuracy, completeness, regulatory_citation, practical_applicability, risk_awareness).

- [ ] **Step 3: Create calibration anchors skeleton**

Create `eval/rubrics/calibration_anchors.json`:
```json
{
  "coding_scenario_v1": {
    "exemplary": {
      "prompt_summary": "Assign codes for HTN + CHF + CKD patient",
      "response": "Based on ICD-10-CM Official Guidelines Section I.C.9.a.3, when hypertension, heart disease, and chronic kidney disease are all documented, the assumed causal relationship requires combination code I13.10 (Hypertensive heart and chronic kidney disease without heart failure, with stage 1 through stage 4 CKD). Additional codes: N18.4 (CKD stage 4), I50.22 (Chronic systolic heart failure). Sequencing: I13.10 first per combination code guidelines, followed by N18.4 to specify CKD stage, then I50.22. The N18.4 is a CC and I50.22 is a CC, which together with I13.10 as PDx should group to MS-DRG 291 (Heart Failure and Shock with MCC).",
      "expected_scores": {"code_selection_accuracy": 4, "sequencing_compliance": 4, "guideline_citation": 4, "completeness": 4, "financial_impact_awareness": 4}
    },
    "borderline": {
      "prompt_summary": "Assign codes for HTN + CHF + CKD patient",
      "response": "Codes: I13.10 for the combination of hypertension and CKD with heart disease. N18.4 for stage 4 CKD. I50.9 for heart failure.",
      "expected_scores": {"code_selection_accuracy": 2, "sequencing_compliance": 3, "guideline_citation": 1, "completeness": 2, "financial_impact_awareness": 0}
    }
  }
}
```

Note: These anchors are populated with initial examples now and refined during integration testing (Task 12) when real agent responses are available.

- [ ] **Step 4: Commit**

```bash
git add eval/rubrics/
git commit -m "feat: add rubric templates and calibration anchors for judge alignment"
```

---

## Task 7: Exam Architect Agent

**Files:**
- Create: `agents/eval-exam-architect.md`

- [ ] **Step 1: Write frontmatter and identity section**

Create `agents/eval-exam-architect.md` with frontmatter (name, description, color, emoji, vibe) and identity section defining the agent as a senior psychometrician and healthcare certification exam developer.

- [ ] **Step 2: Write input/output format specification**

Add sections defining:
- Input: target agent `.md` content + claims list JSON + output schema reference
- Output: JSON array of exam items conforming to the Pydantic schema
- Strict JSON output — no markdown wrapping, no commentary outside the JSON

- [ ] **Step 3: Write NBME item-writing rules section**

Encode NBME 6th edition principles: vignette-first structure, focused closed lead-in, homogeneous distractors, parallel construction, and all 10 prohibited patterns.

- [ ] **Step 4: Write Bloom's distribution and distractor taxonomy section**

Add Bloom's distribution targets table (from spec) and distractor error type taxonomy (`similar_code | sequencing_error | guideline_misapplication | scope_error | obsolete_code`).

- [ ] **Step 5: Write rubric generation and self-check sections**

Instructions for populating rubric templates with item-specific content, and a quality self-check gate to verify each item against structural rules before outputting.

- [ ] **Step 6: Test the agent manually**

Invoke the exam architect with the medical coding agent's `.md` as input. Ask for 5 items covering claim K17. Verify valid JSON conforming to the schema.

- [ ] **Step 7: Commit**

```bash
git add agents/eval-exam-architect.md
git commit -m "feat: add exam architect agent for psychometric item generation"
```

---

## Task 8: Scorer (Tier 1 Auto + Tier 2 Judge)

**Files:**
- Create: `eval/harness/scorer.py`
- Test: `eval/harness/test_scorer.py`

Depends on: Task 5 (exam_runner for parsed responses), Task 6 (rubric templates for judge prompts)

- [ ] **Step 1: Write MCQ scoring tests**

Tests for:
- `score_mcq(item, parsed_response) -> MCQScore`: single-best-answer binary scoring
- Multi-select partial credit (Jaccard similarity of selected vs correct set)
- `MCQScore` has: item_id, correct (bool), selected, expected, score (float 0-1)

- [ ] **Step 2: Run MCQ tests to verify they fail**

Run: `python -m pytest eval/harness/test_scorer.py -k mcq -v`
Expected: FAIL

- [ ] **Step 3: Implement MCQ scoring**

`score_mcq(item: dict, parsed_response: dict) -> MCQScore`:
- Single-best-answer: binary match on selected option key
- Multi-select: `score = len(selected & correct) / len(selected | correct)` (Jaccard)

- [ ] **Step 4: Run MCQ tests to verify they pass**

Run: `python -m pytest eval/harness/test_scorer.py -k mcq -v`
Expected: PASS

- [ ] **Step 5: Write scenario scoring + agreement tests**

Tests for:
- `score_scenario(item, agent_response, cost_tracker) -> list[ScenarioScore]`: returns N judge scores
- `_build_judge_prompt(item, response) -> str`: includes rubric criteria, scoring levels, calibration anchors, judge instructions from template
- `compute_agreement(judge_scores) -> float`: weighted kappa across pairs
- `aggregate_scores(mcq_scores, scenario_scores) -> dict`: overall, per-category, per-section
- `generate_feedback(aggregate) -> str`: textual feedback for GEPA

- [ ] **Step 6: Run scenario tests to verify they fail**

Run: `python -m pytest eval/harness/test_scorer.py -k scenario -v`
Expected: FAIL

- [ ] **Step 7: Implement scenario scoring, agreement, and aggregation**

- `_build_judge_prompt`: loads rubric template from `eval/rubrics/`, includes calibration anchors, formats agent response
- `score_scenario`: invokes N judges via `invoker.invoke_agent`, parses JSON scores
- `compute_agreement`: Cohen's weighted kappa across all judge pairs, averaged
- `aggregate_scores`: weighted average (0.5 Tier1 + 0.5 Tier2), per-category and per-section breakdowns
- `generate_feedback`: which categories failed, which sections, specific item examples

- [ ] **Step 8: Run all scorer tests to verify they pass**

Run: `python -m pytest eval/harness/test_scorer.py -v`
Expected: All PASS

- [ ] **Step 9: Commit**

```bash
git add eval/harness/scorer.py eval/harness/test_scorer.py
git commit -m "feat: add scorer with Tier 1 auto-scoring and Tier 2 multi-judge rubric"
```

---

## Task 9: Analyzer (CTT + IRT)

**Files:**
- Create: `eval/harness/analyzer.py`
- Test: `eval/harness/test_analyzer.py`

- [ ] **Step 1: Write tests**

Tests:
- `compute_ctt_stats(responses) -> dict`: p-values and point-biserials
- `calibrate_2pl(responses) -> dict`: discrimination (a) and difficulty (b) via girth
- `compute_item_fit(responses, abilities, a, b, c) -> list[dict]`: infit/outfit
- `identify_problem_items(stats) -> list[tuple]`: flags rules 11-14 violations
- `promote_items(bank_path, stats)`: transitions field_test → operational
- No-op when N < FIELD_TEST_MIN_N

- [ ] **Step 2: Run tests to verify they fail**

Run: `python -m pytest eval/harness/test_analyzer.py -v`
Expected: FAIL

- [ ] **Step 3: Implement analyzer.py**

- `compute_ctt_stats`: p-value (proportion correct), point-biserial per item, distractor proportions
- `calibrate_2pl`: wraps `girth.twopl_mml()`. At N < 30: no-op returns None
- `calibrate_3pl`: custom MMLE. At N < 500: falls back to 2PL + fixed c=0.25
- `compute_item_fit`: infit/outfit mean-square from residuals
- `compute_test_info`: catsim Fisher Information Function
- `identify_problem_items`: checks rules 11-14 against computed stats
- `promote_items`: update JSONL bank status field

- [ ] **Step 4: Run tests to verify they pass**

Run: `python -m pytest eval/harness/test_analyzer.py -v`
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add eval/harness/analyzer.py eval/harness/test_analyzer.py
git commit -m "feat: add IRT analyzer with 2PL/3PL calibration and item fit"
```

---

## Task 10: Optimizer (GEPA/MIPROv2 Wrapper)

**Files:**
- Create: `eval/harness/optimizer.py`
- Test: `eval/harness/test_optimizer.py`

- [ ] **Step 1: Write tests**

Tests:
- `parse_sections(md) -> dict[str, str]`: splits by `## ` headers, preserves frontmatter
- `reassemble_sections(sections) -> str`: round-trips through parse/reassemble
- `create_metric(items, scorer) -> callable`: returns DSPy-compatible metric
- `optimize(agent_path, items, scorer, config) -> OptimizationResult`
- Falls back to MIPROv2 when `dspy.GEPA` import fails (mock import error)

- [ ] **Step 2: Run tests to verify they fail**

Run: `python -m pytest eval/harness/test_optimizer.py -v`
Expected: FAIL

- [ ] **Step 3: Implement optimizer.py**

- `parse_sections` / `reassemble_sections`: markdown header splitting
- `create_metric`: returns function `(example, pred, trace) -> dspy.Prediction(score, feedback)`
- `optimize`:
  1. Try `dspy.GEPA(metric=metric, auto=config.GEPA_AUTO)`
  2. If ImportError: `MIPROv2(metric=metric, auto=config.GEPA_AUTO)`
  3. Wrap agent `.md` as `dspy.Module` calling `invoke_agent()` internally
  4. Run optimization, return `OptimizationResult`
- `OptimizationResult`: new_md_content, score_before, score_after, per_category_scores, per_section_scores, feedback_text, trials_run, cost

- [ ] **Step 4: Run tests to verify they pass**

Run: `python -m pytest eval/harness/test_optimizer.py -v`
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add eval/harness/optimizer.py eval/harness/test_optimizer.py
git commit -m "feat: add GEPA/MIPROv2 optimizer with section-aware prompt tuning"
```

---

## Task 11: Pipeline Orchestrator + Item Banking

**Files:**
- Create: `eval/harness/pipeline.py`
- Test: `eval/harness/test_pipeline.py`

- [ ] **Step 1: Write tests**

Tests:
- `Pipeline(agent_name)` initializes paths, loads config
- `pipeline.run(mode="generate-only")` runs stages 1-3 only
- `pipeline.run(mode="score-only")` runs stages 1-5 without optimization
- `pipeline.run(mode="dry-run")` logs stages without API calls
- `check_improvement(before, after) -> bool`:
  - Overall improves 0.4pp (below threshold) → False
  - Overall improves 1.0pp but one category regresses 3pp → False
  - Overall improves 1.0pp, no regressions → True
  - Overall improves 0.5pp exactly (boundary) → True
- Pipeline halts when >50% of generated items fail validation (circuit breaker)
- `--all` mode discovers agent `.md` files and iterates (mocked pipeline runs)
- Results written to `results/{agent}/opt_{NNN}/summary.json`
- Items persisted to `items/{agent}/bank.jsonl`

- [ ] **Step 2: Run tests to verify they fail**

Run: `python -m pytest eval/harness/test_pipeline.py -v`
Expected: FAIL

- [ ] **Step 3: Implement pipeline.py**

`Pipeline` class with all 10 stages plus:
- `_persist_items(items: list[dict]) -> None` — append validated items to `items/{agent}/bank.jsonl`
- `_load_bank() -> list[dict]` — read existing bank for validation and calibration
- `_save_results(run_id, ...) -> Path` — write all 8 result files to `results/{agent}/opt_{NNN}/`:

```
summary.json          — overall scores, per-category, improvement delta, cost
responses/            — raw agent responses per item
scores/               — per-item scores
judge_agreement.json  — inter-rater stats
item_statistics.json  — CTT p-values, point-biserials
gepa_feedback.json    — GEPA textual feedback
agent_diff.patch      — diff of .md changes
timing.json           — wall-clock, token counts, API costs
config_snapshot.json  — frozen config values
```

- `__main__` block with CLI arg parsing: agent_name, `--generate-only`, `--score-only`, `--dry-run`, `--max-iterations N`, `--all`
- `--all` iterates `AGENTS_DIR.glob("*.md")`, excludes `eval-exam-architect.md`

- [ ] **Step 4: Run tests to verify they pass**

Run: `python -m pytest eval/harness/test_pipeline.py -v`
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add eval/harness/pipeline.py eval/harness/test_pipeline.py
git commit -m "feat: add pipeline orchestrator with item banking and results output"
```

---

## Task 12: Integration Test (End-to-End)

**Files:**
- Create: `eval/harness/test_integration.py`

- [ ] **Step 1: Write integration test**

Create `eval/harness/test_integration.py` with `@pytest.mark.integration`:

```python
import pytest
from eval.harness.pipeline import Pipeline

@pytest.mark.integration
def test_pipeline_score_only():
    pipeline = Pipeline("revenue-medical-coding-specialist")
    result = pipeline.run(mode="score-only")
    assert result.claims_extracted > 0
    assert result.items_generated > 0
    assert result.items_validated > 0
    assert 0 <= result.overall_score <= 100
    assert result.results_dir.exists()
    summary = result.results_dir / "summary.json"
    assert summary.exists()
    # Verify summary has expected fields
    import json
    data = json.loads(summary.read_text())
    assert "overall_score" in data
    assert "tier1_score" in data
    assert "tier2_score" in data
    assert "per_category" in data
    assert "cost" in data

@pytest.mark.integration
def test_items_persisted_to_bank():
    pipeline = Pipeline("revenue-medical-coding-specialist")
    pipeline.run(mode="generate-only")
    bank_path = pipeline.items_dir / "bank.jsonl"
    assert bank_path.exists()
    lines = bank_path.read_text().strip().split("\n")
    assert len(lines) > 0
```

- [ ] **Step 2: Run integration test**

Run: `python -m pytest eval/harness/test_integration.py -v -m integration`
Expected: PASS

- [ ] **Step 3: Review baseline results**

Inspect `eval/results/revenue-medical-coding-specialist/opt_000/summary.json`:
- Claims extracted count
- Items generated and validated
- Baseline Tier 1 and Tier 2 scores
- Lowest-scoring categories (first optimization targets)

- [ ] **Step 4: Commit**

```bash
git add eval/harness/test_integration.py
git commit -m "feat: add integration test for end-to-end pipeline validation"
```

---

## Task 13: First Optimization Run

- [ ] **Step 1: Run the full optimization loop (5 trials)**

```bash
./scripts/run-eval.sh revenue-medical-coding-specialist --max-iterations 5
```

Watch: items generated, baseline score, per-trial changes, commit gate results.

- [ ] **Step 2: Review optimization results**

Check `eval/results/revenue-medical-coding-specialist/opt_001/`:
- `summary.json` — score improvement?
- `agent_diff.patch` — what changed?
- `gepa_feedback.json` — what weaknesses identified?
- `timing.json` — duration and cost?

- [ ] **Step 3: Verify git history**

```bash
git log --oneline -5
```

If optimization succeeded: commit like `opt_001: medical-coding XX.X->YY.Y% (+Z.Z, ...)`

- [ ] **Step 4: Run on a second agent to validate genericity**

```bash
./scripts/run-eval.sh quality-compliance-officer --generate-only
```

Verify exam architect extracts claims from a different domain and generates valid items.

- [ ] **Step 5: Commit config tweaks**

```bash
git add eval/results/ eval/items/
git commit -m "feat: complete first optimization run with baseline scores"
```
