"""
Structural validation rules 1-10 for healthcare exam items.

These rules operate on raw dicts (not Pydantic objects) so they can serve
as a second-pass gate before items enter the eval loop — and can validate
items received from external sources that haven't been parsed by Pydantic yet.

Rules 1-3 intentionally overlap with Pydantic validators in models.py.
"""
from __future__ import annotations

import re


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

COGNITIVE_LEVELS = ["remember", "understand", "apply", "analyze", "evaluate", "create"]

# claim types that require cognitive_level >= "apply"
_HIGH_FLOOR_CLAIM_TYPES = {"reasoning", "cross_domain", "edge_case"}

# Rule 8: forbidden option text patterns
_FORBIDDEN_OPTION_PHRASES = ["all of the above", "none of the above"]

# Rule 8: forbidden lead_in phrase
_FORBIDDEN_LEAD_IN_PHRASE = "which of the following is true"

# Rule 9: negation words that must be emphasized if present
_NEGATION_WORDS = {"not", "never", "except", "least"}

# Rule 10: absolute terms in distractors (whole word, case-insensitive)
_ABSOLUTE_TERMS_RE = re.compile(r"\b(always|never)\b", re.IGNORECASE)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _jaccard_similarity(text_a: str, text_b: str) -> float:
    """Compute Jaccard word-set similarity between two strings."""
    words_a = set(text_a.lower().split())
    words_b = set(text_b.lower().split())
    if not words_a or not words_b:
        return 0.0
    return len(words_a & words_b) / len(words_a | words_b)


def _item_text(item: dict, mcq: dict | None, scenario: dict | None) -> str:
    """Concatenate the primary text fields for Jaccard comparison (rule 7)."""
    parts: list[str] = []
    if mcq:
        parts.append(mcq.get("vignette", ""))
        parts.append(mcq.get("lead_in", ""))
    if scenario:
        parts.append(scenario.get("prompt", ""))
    return " ".join(parts)


def _negation_is_emphasized(word: str, lead_in: str) -> bool:
    """Return True if the negation word appears in ALL-CAPS or inside **bold** markers."""
    # Check for ALL-CAPS occurrence (e.g., NOT, NEVER, EXCEPT, LEAST)
    upper_word = word.upper()
    # We need the token to appear as the all-caps form as a whole word
    pattern = re.compile(r"\b" + re.escape(upper_word) + r"\b")
    if pattern.search(lead_in):
        return True
    # Check for **WORD** bold emphasis (any casing inside ** **)
    # Match **<word>** where inner text equals the negation word (case-insensitive)
    bold_pattern = re.compile(
        r"\*\*" + re.escape(word) + r"\*\*",
        re.IGNORECASE,
    )
    if bold_pattern.search(lead_in):
        return True
    return False


def _distractor_options(options: list[dict]) -> list[dict]:
    """Return only the distractor (non-correct) options."""
    return [o for o in options if not o.get("is_correct", False)]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def validate_structural(
    item: dict,
    mcq: dict | None = None,
    scenario: dict | None = None,
) -> list[str]:
    """Validate an exam item against structural rules 1-10.

    Parameters
    ----------
    item:
        Raw dict corresponding to ExamItem fields.
    mcq:
        Raw dict corresponding to MCQExtension fields (required when
        item["tier"] == "mcq").
    scenario:
        Raw dict corresponding to ScenarioExtension fields (required when
        item["tier"] == "scenario").

    Returns
    -------
    list[str]
        Violation descriptions. Empty list means the item is structurally valid.
    """
    violations: list[str] = []

    cognitive_level: str = item.get("cognitive_level", "")
    claim_type: str = item.get("claim_type", "")

    # ------------------------------------------------------------------
    # Rule 1: Reject if Bloom's level is "remember" for any claim type
    # ------------------------------------------------------------------
    if cognitive_level == "remember":
        violations.append(
            "[Rule 1] cognitive_level 'remember' is not allowed — "
            "all items must test understanding or above"
        )

    # ------------------------------------------------------------------
    # Rule 2: Reject if Bloom's level below "apply" for high-floor claim types
    # ------------------------------------------------------------------
    if claim_type in _HIGH_FLOOR_CLAIM_TYPES and cognitive_level in COGNITIVE_LEVELS:
        level_idx = COGNITIVE_LEVELS.index(cognitive_level)
        apply_idx = COGNITIVE_LEVELS.index("apply")
        if level_idx < apply_idx:
            violations.append(
                f"[Rule 2] claim_type '{claim_type}' requires cognitive_level >= 'apply', "
                f"got '{cognitive_level}'"
            )

    # ------------------------------------------------------------------
    # Rule 3: Reject MCQ with fewer than 4 options
    # ------------------------------------------------------------------
    if mcq is not None:
        options: list[dict] = mcq.get("options", [])
        if len(options) < 4:
            violations.append(
                f"[Rule 3] MCQ must have at least 4 options, got {len(options)}"
            )

        # ----------------------------------------------------------------
        # Rule 4: Reject if MCQ options have >2x length variance
        # ----------------------------------------------------------------
        if options:
            option_texts = [str(o.get("text", "")) for o in options]
            lengths = [len(t) for t in option_texts]
            max_len = max(lengths)
            min_len = min(lengths)
            if min_len > 0 and max_len / min_len > 2.0:
                violations.append(
                    f"[Rule 4] MCQ option length variance too high: "
                    f"longest ({max_len} chars) / shortest ({min_len} chars) = "
                    f"{max_len / min_len:.2f} > 2.0"
                )
            elif min_len == 0 and max_len > 0:
                violations.append(
                    "[Rule 4] MCQ option length variance too high: "
                    "at least one option has empty text (length 0)"
                )

        # ----------------------------------------------------------------
        # Rule 8 (options): Reject if any option text contains forbidden phrases
        # ----------------------------------------------------------------
        for opt in options:
            text_lower = str(opt.get("text", "")).lower()
            for phrase in _FORBIDDEN_OPTION_PHRASES:
                if phrase in text_lower:
                    violations.append(
                        f"[Rule 8] Option text contains forbidden phrase: '{phrase}' "
                        f"(found in option {opt.get('key', '?')})"
                    )

        # ----------------------------------------------------------------
        # Rule 10: Reject if distractor text contains absolute terms
        # ----------------------------------------------------------------
        for opt in _distractor_options(options):
            text = str(opt.get("text", ""))
            match = _ABSOLUTE_TERMS_RE.search(text)
            if match:
                violations.append(
                    f"[Rule 10] Distractor option {opt.get('key', '?')} contains "
                    f"absolute term '{match.group()}': '{text}'"
                )

        # ----------------------------------------------------------------
        # Rule 8 (lead_in): Reject if lead_in contains forbidden phrase
        # ----------------------------------------------------------------
        lead_in: str = mcq.get("lead_in", "")
        if _FORBIDDEN_LEAD_IN_PHRASE in lead_in.lower():
            violations.append(
                f"[Rule 8] lead_in contains forbidden phrase: "
                f"'{_FORBIDDEN_LEAD_IN_PHRASE}'"
            )

        # ----------------------------------------------------------------
        # Rule 9: Reject negation words in lead_in unless emphasized
        # ----------------------------------------------------------------
        lead_in_lower = lead_in.lower()
        for neg_word in _NEGATION_WORDS:
            # Check if the word appears in lead_in (whole word, lowercase)
            word_pattern = re.compile(r"\b" + re.escape(neg_word) + r"\b")
            if word_pattern.search(lead_in_lower):
                if not _negation_is_emphasized(neg_word, lead_in):
                    violations.append(
                        f"[Rule 9] lead_in contains negation word '{neg_word}' "
                        f"without emphasis (use ALL CAPS or **{neg_word.upper()}**): "
                        f"'{lead_in}'"
                    )

    # ------------------------------------------------------------------
    # Rule 5: Reject if source_citation is empty/None
    # ------------------------------------------------------------------
    source_citation = item.get("source_citation")
    if not source_citation or not str(source_citation).strip():
        violations.append(
            "[Rule 5] source_citation is required and must not be empty"
        )

    # ------------------------------------------------------------------
    # Rule 6: Reject scenario items if prompt has fewer than 50 words
    # ------------------------------------------------------------------
    if scenario is not None:
        prompt: str = scenario.get("prompt", "")
        word_count = len(prompt.split())
        if word_count < 50:
            violations.append(
                f"[Rule 6] Scenario prompt must be at least 50 words, "
                f"got {word_count} word{'s' if word_count != 1 else ''}"
            )

    return violations


def validate_against_bank(
    item: dict,
    mcq: dict | None,
    bank_items: list[dict],
) -> list[str]:
    """Check Jaccard similarity against existing bank items (rule 7).

    Parameters
    ----------
    item:
        Raw ExamItem dict being validated.
    mcq:
        Raw MCQExtension dict for the item being validated (or None).
    bank_items:
        List of dicts with keys ``"item"`` and optionally ``"mcq"`` /
        ``"scenario"``, representing items already in the bank.

    Returns
    -------
    list[str]
        Violation descriptions. Empty list means no near-duplicate found.
    """
    violations: list[str] = []

    candidate_text = _item_text(item, mcq, None)

    for bank_entry in bank_items:
        bank_item = bank_entry.get("item", {})
        bank_mcq = bank_entry.get("mcq", None)
        bank_scenario = bank_entry.get("scenario", None)

        bank_text = _item_text(bank_item, bank_mcq, bank_scenario)

        score = _jaccard_similarity(candidate_text, bank_text)
        if score > 0.8:
            bank_id = bank_item.get("item_code") or bank_item.get("id", "unknown")
            violations.append(
                f"[Rule 7] Jaccard similarity {score:.3f} > 0.8 against "
                f"existing bank item '{bank_id}' — likely duplicate"
            )

    return violations


def validate_bank_level(bank_items: list[dict]) -> list[str]:
    """Check bank-level properties (placeholder for rule 16 and beyond).

    Parameters
    ----------
    bank_items:
        List of dicts with keys ``"item"``, ``"mcq"``, ``"scenario"``.

    Returns
    -------
    list[str]
        Violation descriptions.
    """
    violations: list[str] = []
    # Future: answer position distribution (rule 16), domain coverage, etc.
    return violations
