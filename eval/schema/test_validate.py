"""
Tests for eval/schema/validate.py — written BEFORE implementation (TDD).

All 18 required test cases are covered, corresponding to structural
validation rules 1-10 for exam items.
"""
import pytest


# ---------------------------------------------------------------------------
# Helpers — minimal valid payloads (raw dicts, not Pydantic objects)
# ---------------------------------------------------------------------------

def _base_item(**overrides) -> dict:
    """Return a minimal valid ExamItem dict."""
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


def _base_reasoning_item(**overrides) -> dict:
    """Return a minimal valid reasoning ExamItem dict."""
    data = _base_item(
        item_code="MC-R7-001",
        claim_type="reasoning",
        cognitive_level="apply",
    )
    data.update(overrides)
    return data


def _base_mcq(**overrides) -> dict:
    """Return a minimal valid MCQExtension dict."""
    data = {
        "vignette": "A 65-year-old patient requires an MRI of the lumbar spine.",
        "lead_in": "Which action should the agent take first?",
        "response_format": {"type": "single_best_answer"},
        "options": [
            {"key": "A", "text": "Submit the prior auth request immediately", "is_correct": True, "rationale": "Correct approach"},
            {"key": "B", "text": "Wait for physician approval before proceeding", "is_correct": False, "rationale": "Too slow"},
            {"key": "C", "text": "Contact insurance to verify coverage details", "is_correct": False, "rationale": "Not first step"},
            {"key": "D", "text": "Review the clinical guidelines for lumbar MRI", "is_correct": False, "rationale": "Should be done earlier"},
        ],
    }
    data.update(overrides)
    return data


def _base_scenario(**overrides) -> dict:
    """Return a minimal valid ScenarioExtension dict with a 60-word prompt."""
    # 60 words exactly (to pass rule 6)
    sixty_word_prompt = (
        "A sixty-five-year-old Medicare patient presents with chronic lower back pain "
        "radiating into the left leg. The treating physician has ordered an MRI of the "
        "lumbar spine without contrast. The patient has had conservative treatment for "
        "six weeks including physical therapy. Draft a prior authorization justification "
        "letter addressing medical necessity for this imaging study based on clinical findings."
    )
    data = {
        "prompt": sixty_word_prompt,
        "rubric": [
            {"criterion": "Medical necessity", "weight": 0.4},
            {"criterion": "Clinical detail", "weight": 0.3},
            {"criterion": "Formatting", "weight": 0.3},
        ],
    }
    data.update(overrides)
    return data


# ---------------------------------------------------------------------------
# Lazy import so test collection works before validate.py exists
# ---------------------------------------------------------------------------

def _import():
    from eval.schema.validate import validate_structural, validate_against_bank
    return validate_structural, validate_against_bank


# ===========================================================================
# Test 1: Valid MCQ item with all rules passing returns empty list
# ===========================================================================

def test_valid_mcq_returns_no_violations():
    validate_structural, _ = _import()
    item = _base_item()
    mcq = _base_mcq()
    violations = validate_structural(item, mcq=mcq)
    assert violations == [], f"Expected no violations, got: {violations}"


# ===========================================================================
# Test 2: Rule 1 — cognitive_level="remember" returns violation
# ===========================================================================

def test_rule1_remember_returns_violation():
    validate_structural, _ = _import()
    item = _base_item(cognitive_level="remember")
    mcq = _base_mcq()
    violations = validate_structural(item, mcq=mcq)
    assert any("remember" in v.lower() or "rule 1" in v.lower() for v in violations), \
        f"Expected rule 1 violation, got: {violations}"


# ===========================================================================
# Test 3: Rule 2 — reasoning claim with cognitive_level="understand" returns violation
# ===========================================================================

def test_rule2_reasoning_understand_returns_violation():
    validate_structural, _ = _import()
    item = _base_item(claim_type="reasoning", cognitive_level="understand")
    mcq = _base_mcq()
    violations = validate_structural(item, mcq=mcq)
    assert any("apply" in v.lower() or "rule 2" in v.lower() for v in violations), \
        f"Expected rule 2 violation, got: {violations}"


# ===========================================================================
# Test 4: Rule 3 — MCQ with 3 options returns violation
# ===========================================================================

def test_rule3_three_options_returns_violation():
    validate_structural, _ = _import()
    item = _base_item()
    mcq = _base_mcq()
    mcq["options"] = mcq["options"][:3]  # only 3 options
    violations = validate_structural(item, mcq=mcq)
    assert any("4" in v or "four" in v.lower() or "rule 3" in v.lower() for v in violations), \
        f"Expected rule 3 violation, got: {violations}"


# ===========================================================================
# Test 5: Rule 4 — longest option 3x shortest returns violation
# ===========================================================================

def test_rule4_large_length_variance_returns_violation():
    validate_structural, _ = _import()
    item = _base_item()
    mcq = _base_mcq()
    mcq["options"] = [
        {"key": "A", "text": "Submit", "is_correct": True, "rationale": "Correct"},
        {"key": "B", "text": "Wait for the physician to complete a full clinical assessment and provide explicit written approval before any administrative actions are taken", "is_correct": False, "rationale": "Too verbose"},
        {"key": "C", "text": "Contact insurance company representatives to verify current coverage details and eligibility requirements for the procedure", "is_correct": False, "rationale": "Not first"},
        {"key": "D", "text": "Review clinical guidelines and medical necessity criteria for lumbar MRI authorization procedures", "is_correct": False, "rationale": "Earlier"},
    ]
    # "Submit" (6 chars) vs B option (much longer) — ratio >> 2.0
    violations = validate_structural(item, mcq=mcq)
    assert any("length" in v.lower() or "variance" in v.lower() or "rule 4" in v.lower() for v in violations), \
        f"Expected rule 4 violation, got: {violations}"


# ===========================================================================
# Test 6: Rule 4 — similar length options passes rule 4
# ===========================================================================

def test_rule4_similar_length_passes():
    validate_structural, _ = _import()
    item = _base_item()
    mcq = _base_mcq()
    # All options roughly same length — no rule 4 violation
    mcq["options"] = [
        {"key": "A", "text": "Submit the prior auth request to the payer portal", "is_correct": True, "rationale": "Correct"},
        {"key": "B", "text": "Wait for the physician to provide written approval", "is_correct": False, "rationale": "Wrong"},
        {"key": "C", "text": "Contact the insurance company to verify eligibility", "is_correct": False, "rationale": "Wrong"},
        {"key": "D", "text": "Review the clinical guidelines for lumbar spine MRI", "is_correct": False, "rationale": "Wrong"},
    ]
    violations = validate_structural(item, mcq=mcq)
    rule4_violations = [v for v in violations if "length" in v.lower() or "variance" in v.lower() or "rule 4" in v.lower()]
    assert rule4_violations == [], f"Expected no rule 4 violation, got: {rule4_violations}"


# ===========================================================================
# Test 7: Rule 5 — empty source_citation returns violation
# ===========================================================================

def test_rule5_empty_source_citation_returns_violation():
    validate_structural, _ = _import()
    item = _base_item(source_citation="")
    mcq = _base_mcq()
    violations = validate_structural(item, mcq=mcq)
    assert any("citation" in v.lower() or "source" in v.lower() or "rule 5" in v.lower() for v in violations), \
        f"Expected rule 5 violation, got: {violations}"


# ===========================================================================
# Test 8: Rule 6 — scenario with 30-word prompt returns violation
# ===========================================================================

def test_rule6_short_scenario_prompt_returns_violation():
    validate_structural, _ = _import()
    item = _base_item(tier="scenario", item_code="SC-X5-001", claim_type="reasoning", cognitive_level="apply")
    short_prompt = "Draft a prior authorization justification for lumbar MRI for an elderly patient with back pain."
    # count words to verify it's < 50
    word_count = len(short_prompt.split())
    assert word_count < 50, f"Test setup error: prompt has {word_count} words, expected < 50"
    scenario = _base_scenario(prompt=short_prompt)
    violations = validate_structural(item, scenario=scenario)
    assert any("50" in v or "word" in v.lower() or "rule 6" in v.lower() for v in violations), \
        f"Expected rule 6 violation, got: {violations}"


# ===========================================================================
# Test 9: Rule 6 — scenario with 60-word prompt passes rule 6
# ===========================================================================

def test_rule6_long_scenario_prompt_passes():
    validate_structural, _ = _import()
    item = _base_item(tier="scenario", item_code="SC-X5-001", claim_type="reasoning", cognitive_level="apply")
    scenario = _base_scenario()  # uses 60-word prompt by default
    word_count = len(scenario["prompt"].split())
    assert word_count >= 50, f"Test setup error: prompt has {word_count} words, expected >= 50"
    violations = validate_structural(item, scenario=scenario)
    rule6_violations = [v for v in violations if "50" in v or "word" in v.lower() or "rule 6" in v.lower()]
    assert rule6_violations == [], f"Expected no rule 6 violation, got: {rule6_violations}"


# ===========================================================================
# Test 10: Rule 8 — option "All of the above" returns violation
# ===========================================================================

def test_rule8_all_of_the_above_returns_violation():
    validate_structural, _ = _import()
    item = _base_item()
    mcq = _base_mcq()
    mcq["options"][3]["text"] = "All of the above"
    violations = validate_structural(item, mcq=mcq)
    assert any("all of the above" in v.lower() or "rule 8" in v.lower() for v in violations), \
        f"Expected rule 8 violation, got: {violations}"


# ===========================================================================
# Test 11: Rule 8 — option "none of the above" (lowercase) returns violation
# ===========================================================================

def test_rule8_none_of_the_above_lowercase_returns_violation():
    validate_structural, _ = _import()
    item = _base_item()
    mcq = _base_mcq()
    mcq["options"][3]["text"] = "none of the above"
    violations = validate_structural(item, mcq=mcq)
    assert any("none of the above" in v.lower() or "rule 8" in v.lower() for v in violations), \
        f"Expected rule 8 violation, got: {violations}"


# ===========================================================================
# Test 12: Rule 8 — lead_in "Which of the following is true?" returns violation
# ===========================================================================

def test_rule8_lead_in_which_following_true_returns_violation():
    validate_structural, _ = _import()
    item = _base_item()
    mcq = _base_mcq(lead_in="Which of the following is true?")
    violations = validate_structural(item, mcq=mcq)
    assert any("which of the following is true" in v.lower() or "rule 8" in v.lower() for v in violations), \
        f"Expected rule 8 violation, got: {violations}"


# ===========================================================================
# Test 13: Rule 9 — lead_in with uppercase NOT passes rule 9
# ===========================================================================

def test_rule9_uppercase_not_passes():
    validate_structural, _ = _import()
    item = _base_item()
    mcq = _base_mcq(lead_in="Which diagnosis is NOT correct?")
    violations = validate_structural(item, mcq=mcq)
    rule9_violations = [v for v in violations if "negat" in v.lower() or "rule 9" in v.lower()]
    assert rule9_violations == [], f"Expected no rule 9 violation for uppercase NOT, got: {rule9_violations}"


# ===========================================================================
# Test 14: Rule 9 — lead_in with lowercase "not" returns violation
# ===========================================================================

def test_rule9_lowercase_not_returns_violation():
    validate_structural, _ = _import()
    item = _base_item()
    mcq = _base_mcq(lead_in="Which diagnosis is not correct?")
    violations = validate_structural(item, mcq=mcq)
    assert any("negat" in v.lower() or "rule 9" in v.lower() for v in violations), \
        f"Expected rule 9 violation for unemphasized 'not', got: {violations}"


# ===========================================================================
# Test 15: Rule 10 — distractor containing "always" returns violation
# ===========================================================================

def test_rule10_always_in_distractor_returns_violation():
    validate_structural, _ = _import()
    item = _base_item()
    mcq = _base_mcq()
    # Modify a distractor (non-correct option) to contain "always"
    mcq["options"][1]["text"] = "always submit the request without review"
    violations = validate_structural(item, mcq=mcq)
    assert any("always" in v.lower() or "rule 10" in v.lower() for v in violations), \
        f"Expected rule 10 violation, got: {violations}"


# ===========================================================================
# Test 16: Rule 10 — "This is always done" returns violation (word boundary)
# ===========================================================================

def test_rule10_always_word_boundary_returns_violation():
    validate_structural, _ = _import()
    item = _base_item()
    mcq = _base_mcq()
    mcq["options"][2]["text"] = "This is always done before submitting the request"
    violations = validate_structural(item, mcq=mcq)
    assert any("always" in v.lower() or "rule 10" in v.lower() for v in violations), \
        f"Expected rule 10 violation (word boundary), got: {violations}"


# ===========================================================================
# Test 17: Rule 7 — item with Jaccard > 0.8 similarity returns violation
# ===========================================================================

def test_rule7_high_jaccard_similarity_returns_violation():
    _, validate_against_bank = _import()
    item = _base_item()
    # Nearly identical MCQ text as the bank item
    mcq = _base_mcq(
        vignette="A 65-year-old patient requires an MRI of the lumbar spine.",
        lead_in="Which action should the agent take first?",
    )
    # Bank item with very similar text
    bank_item = _base_item(item_code="MC-K17-002")
    bank_mcq = _base_mcq(
        vignette="A 65-year-old patient requires an MRI of the lumbar spine.",
        lead_in="Which action should the agent take first?",
    )
    bank_items = [{"item": bank_item, "mcq": bank_mcq}]
    violations = validate_against_bank(item, mcq, bank_items)
    assert any("jaccard" in v.lower() or "similar" in v.lower() or "rule 7" in v.lower() for v in violations), \
        f"Expected rule 7 violation, got: {violations}"


# ===========================================================================
# Test 18: Rule 7 — item with Jaccard < 0.5 similarity passes
# ===========================================================================

def test_rule7_low_jaccard_similarity_passes():
    _, validate_against_bank = _import()
    item = _base_item()
    mcq = _base_mcq(
        vignette="A 65-year-old patient requires an MRI of the lumbar spine.",
        lead_in="Which action should the agent take first?",
    )
    # Bank item with very different text
    bank_item = _base_item(item_code="MC-K17-002")
    bank_mcq = _base_mcq(
        vignette="A pediatric patient presents with acute appendicitis and requires immediate surgical evaluation.",
        lead_in="What documentation must be completed prior to emergency surgery?",
    )
    bank_items = [{"item": bank_item, "mcq": bank_mcq}]
    violations = validate_against_bank(item, mcq, bank_items)
    rule7_violations = [v for v in violations if "jaccard" in v.lower() or "similar" in v.lower() or "rule 7" in v.lower()]
    assert rule7_violations == [], f"Expected no rule 7 violation, got: {rule7_violations}"
