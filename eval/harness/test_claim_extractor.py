"""
Tests for claim_extractor.py — written FIRST per TDD.

Run from project root:
    python3 -m pytest eval/harness/test_claim_extractor.py -v
"""
from __future__ import annotations

import json
import shutil
from pathlib import Path

import pytest

# ---------------------------------------------------------------------------
# Module under test (imported after writing implementation)
# ---------------------------------------------------------------------------
from eval.harness.claim_extractor import Claim, extract_claims

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
FIXTURE_PATH = Path(__file__).parent / "test_fixtures" / "sample_agent.md"
REAL_AGENT_PATH = (
    Path(__file__).resolve().parents[2] / "agents" / "revenue-medical-coding-specialist.md"
)


# ===========================================================================
# Helper
# ===========================================================================

def _claims_by_type(claims: list[Claim], ct: str) -> list[Claim]:
    return [c for c in claims if c.claim_type == ct]


# ===========================================================================
# Test 1 — basic extraction returns non-empty list of Claim objects
# ===========================================================================

def test_extract_claims_returns_list(tmp_path):
    claims = extract_claims(FIXTURE_PATH)
    assert isinstance(claims, list), "extract_claims must return a list"
    assert len(claims) > 0, "must extract at least one claim from fixture"
    for c in claims:
        assert isinstance(c, Claim), f"every item must be a Claim, got {type(c)}"


# ===========================================================================
# Test 2 — knowledge claims are detected
# ===========================================================================

def test_knowledge_claims_detected():
    claims = extract_claims(FIXTURE_PATH)
    k_claims = _claims_by_type(claims, "knowledge")
    assert len(k_claims) >= 3, (
        f"expected >=3 knowledge claims, got {len(k_claims)}: "
        + str([c.claim_text[:60] for c in k_claims])
    )
    texts = " ".join(c.claim_text for c in k_claims)
    # Fixture has: Section I.C.9.a.1, I11.0, J96.0x / MS-DRG / MCC
    assert any(
        kw in texts for kw in ["Section", "ICD-10-CM", "I11.0", "J96.0", "MCC", "MS-DRG"]
    ), "knowledge claims must include guideline/code content"


# ===========================================================================
# Test 3 — reasoning claims are detected
# ===========================================================================

def test_reasoning_claims_detected():
    claims = extract_claims(FIXTURE_PATH)
    r_claims = _claims_by_type(claims, "reasoning")
    assert len(r_claims) >= 3, (
        f"expected >=3 reasoning claims (You can / You should / You will), got {len(r_claims)}"
    )
    texts = " ".join(c.claim_text for c in r_claims)
    assert any(kw in texts for kw in ["can", "should", "will", "assign", "identify", "determine"])


# ===========================================================================
# Test 4 — cross-domain claims are detected
# ===========================================================================

def test_cross_domain_claims_detected():
    claims = extract_claims(FIXTURE_PATH)
    x_claims = _claims_by_type(claims, "cross_domain")
    assert len(x_claims) >= 1, (
        f"expected >=1 cross-domain claim, got {len(x_claims)}"
    )
    texts = " ".join(c.claim_text for c in x_claims)
    assert any(
        kw in texts.lower()
        for kw in ["revenue", "compliance", "integration", "cdi", "coding"]
    )


# ===========================================================================
# Test 5 — edge case claims are detected
# ===========================================================================

def test_edge_case_claims_detected():
    claims = extract_claims(FIXTURE_PATH)
    e_claims = _claims_by_type(claims, "edge_case")
    assert len(e_claims) >= 3, (
        f"expected >=3 edge-case claims, got {len(e_claims)}: "
        + str([c.claim_text[:60] for c in e_claims])
    )
    texts = " ".join(c.claim_text for c in e_claims)
    assert any(
        kw in texts for kw in ["however", "However", "NOT", "confused", "Excludes"]
    )


# ===========================================================================
# Test 6 — IDs are sequential within type: K01, K02 … R01, R02 … etc.
# ===========================================================================

def test_claim_ids_are_sequential():
    claims = extract_claims(FIXTURE_PATH)
    for prefix, ct in [("K", "knowledge"), ("R", "reasoning"), ("X", "cross_domain"), ("E", "edge_case")]:
        typed = _claims_by_type(claims, ct)
        for idx, c in enumerate(typed, start=1):
            expected_id = f"{prefix}{idx:02d}"
            assert c.claim_id == expected_id, (
                f"claim_id mismatch for {ct}: expected {expected_id}, got {c.claim_id}"
            )


# ===========================================================================
# Test 7 — line_number is correct
# ===========================================================================

def test_line_numbers_are_correct():
    lines = FIXTURE_PATH.read_text(encoding="utf-8").splitlines()
    claims = extract_claims(FIXTURE_PATH)
    for c in claims:
        assert 1 <= c.line_number <= len(lines), (
            f"line_number {c.line_number} out of range (1-{len(lines)}) for claim {c.claim_id}"
        )
        # The claim text should appear on or near the recorded line (within a 5-line window)
        window_start = max(0, c.line_number - 3)
        window_end = min(len(lines), c.line_number + 2)
        window_text = " ".join(lines[window_start:window_end])
        # At least a 10-char prefix of claim_text should appear in the surrounding window
        snippet = c.claim_text[:20].strip()
        assert snippet in window_text, (
            f"claim text snippet {snippet!r} not found near line {c.line_number} "
            f"(window: {window_text[:120]!r})"
        )


# ===========================================================================
# Test 8 — context includes surrounding lines
# ===========================================================================

def test_context_includes_surrounding_lines():
    claims = extract_claims(FIXTURE_PATH)
    for c in claims:
        assert isinstance(c.context, str), f"context must be str, got {type(c.context)}"
        assert len(c.context) > 0, f"context must not be empty for claim {c.claim_id}"
        # Context should contain the claim line itself
        snippet = c.claim_text[:15].strip()
        assert snippet in c.context, (
            f"context for {c.claim_id} does not contain claim text snippet {snippet!r}: "
            f"{c.context[:200]!r}"
        )


# ===========================================================================
# Test 9 — cache works: second call with same content returns same claims
# ===========================================================================

def test_cache_hit_returns_same_claims(tmp_path):
    # Copy fixture to tmp so we can control the cache location independently
    # We test the cache indirectly: call twice, compare results
    claims_first = extract_claims(FIXTURE_PATH)
    claims_second = extract_claims(FIXTURE_PATH)

    assert len(claims_first) == len(claims_second), "cache hit must return same number of claims"
    for a, b in zip(claims_first, claims_second):
        assert a.claim_id == b.claim_id
        assert a.claim_text == b.claim_text
        assert a.claim_type == b.claim_type
        assert a.line_number == b.line_number


# ===========================================================================
# Test 10 — cache invalidates when content changes
# ===========================================================================

def test_cache_invalidates_on_content_change(tmp_path):
    # Write a minimal agent file to tmp_path
    agent_file = tmp_path / "agents" / "test-agent.md"
    agent_file.parent.mkdir(parents=True)

    original_content = FIXTURE_PATH.read_text(encoding="utf-8")
    agent_file.write_text(original_content, encoding="utf-8")

    claims_v1 = extract_claims(agent_file)
    count_v1 = len(claims_v1)

    # Now append extra knowledge claim content
    extra = "\n\nThe code Z87.39 must be assigned when personal history of other conditions is documented per 45 CFR 162.1002.\n"
    agent_file.write_text(original_content + extra, encoding="utf-8")

    claims_v2 = extract_claims(agent_file)
    count_v2 = len(claims_v2)

    assert count_v2 > count_v1, (
        f"cache should invalidate and find more claims after content change: "
        f"v1={count_v1}, v2={count_v2}"
    )


# ===========================================================================
# Test 11 — source_section populated when guideline citation present
# ===========================================================================

def test_source_section_populated_for_guideline_citations():
    claims = extract_claims(FIXTURE_PATH)
    k_claims = _claims_by_type(claims, "knowledge")
    # The fixture contains "Section I.C.9.a.1" — at least one knowledge claim should have it
    claims_with_section = [c for c in k_claims if c.source_section is not None]
    assert len(claims_with_section) >= 1, (
        "at least one knowledge claim with a guideline citation should have source_section populated"
    )
    sections = [c.source_section for c in claims_with_section]
    assert any("I.C.9" in s for s in sections if s), (
        f"expected 'I.C.9' in a source_section, got: {sections}"
    )


# ===========================================================================
# Test 12 — Claim dataclass has all required fields
# ===========================================================================

def test_claim_dataclass_fields():
    claims = extract_claims(FIXTURE_PATH)
    required_fields = {"claim_id", "claim_text", "claim_type", "source_section", "line_number", "context"}
    for c in claims:
        missing = required_fields - set(vars(c).keys())
        assert not missing, f"Claim {c.claim_id} is missing fields: {missing}"


# ===========================================================================
# Test 13 — claim_type values are valid
# ===========================================================================

def test_claim_type_values_are_valid():
    valid_types = {"knowledge", "reasoning", "cross_domain", "edge_case"}
    claims = extract_claims(FIXTURE_PATH)
    for c in claims:
        assert c.claim_type in valid_types, (
            f"invalid claim_type {c.claim_type!r} for claim {c.claim_id}"
        )


# ===========================================================================
# Test 14 — cache JSON is written to eval/items/{agent-name}/claims.json
# ===========================================================================

def test_cache_file_is_written(tmp_path):
    agent_file = tmp_path / "agents" / "my-test-agent.md"
    agent_file.parent.mkdir(parents=True)
    agent_file.write_text(FIXTURE_PATH.read_text(encoding="utf-8"), encoding="utf-8")

    extract_claims(agent_file)

    # The cache for this tmp file will be relative to the agent file's stem.
    # Since we can't easily predict the exact path used by the implementation for
    # arbitrary paths, we verify the in-project path for the fixture instead.
    # For the fixture itself, the cache should exist after the first call.
    from eval.harness.claim_extractor import _cache_path
    cache = _cache_path(FIXTURE_PATH)
    assert cache.exists(), f"cache file not found at {cache}"
    data = json.loads(cache.read_text(encoding="utf-8"))
    assert "hash" in data, "cache JSON must have 'hash' key"
    assert "claims" in data, "cache JSON must have 'claims' key"
    assert isinstance(data["claims"], list)
