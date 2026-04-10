"""
Exam item formatting and response parsing for the healthcare agent eval harness.

format_mcq_prompt / format_scenario_prompt — build user messages for the agent.
parse_mcq_response — extract selected option letter(s) from free-text replies.
run_exam — drive invoke_agent over a list of exam items and collect results.
"""
from __future__ import annotations

import re
from pathlib import Path

from eval.harness.invoker import CostTracker, invoke_agent


# ---------------------------------------------------------------------------
# Prompt formatters
# ---------------------------------------------------------------------------

def format_mcq_prompt(item: dict, mcq: dict) -> str:
    """Format an MCQ item into a user message for the target agent."""
    lines: list[str] = []

    if mcq.get("vignette"):
        lines.append(mcq["vignette"])
        lines.append("")

    lines.append(mcq["lead_in"])
    lines.append("")

    for opt in mcq["options"]:
        lines.append(f"{opt['key']}. {opt['text']}")

    lines.append("")
    lines.append("Select the best answer and explain your reasoning.")

    return "\n".join(lines)


def format_scenario_prompt(item: dict, scenario: dict) -> str:
    """Format a scenario item into a user message."""
    return scenario["prompt"]


# ---------------------------------------------------------------------------
# Response parser
# ---------------------------------------------------------------------------

def parse_mcq_response(mcq: dict, raw_text: str) -> dict:
    """Parse the agent's free-text response to extract selected option(s).

    Strategies (in priority order):
    1. Explicit "Answer: X" or "The answer is X" pattern
    2. Option letter at start of response: "A." or "A)"
    3. Code text match — find which option's code/text appears in response
    4. Multi-select: split on commas/newlines for multiple letters

    Returns:
        {"selected": ["A"], "raw_text": "...", "parse_confidence": 0.0-1.0}
    """
    options = mcq["options"]
    response_type = mcq.get("response_format", {}).get("type", "single_best_answer")

    text = raw_text.strip()

    # Strategy 1: "the answer is X" anywhere in text
    explicit = re.search(
        r"(?:the\s+)?answer\s+is\s*:?\s*([A-Z])\b",
        text,
        re.IGNORECASE,
    )
    if explicit:
        letter = explicit.group(1).upper()
        if any(o["key"] == letter for o in options):
            return {"selected": [letter], "raw_text": raw_text, "parse_confidence": 0.95}

    # Strategy 1b: "Answer: A" or "Response: A" at start of a line
    line_answer = re.search(
        r"^(?:Answer|Response)\s*:?\s*([A-Z])\b",
        text,
        re.MULTILINE | re.IGNORECASE,
    )
    if line_answer:
        letter = line_answer.group(1).upper()
        if any(o["key"] == letter for o in options):
            return {"selected": [letter], "raw_text": raw_text, "parse_confidence": 0.95}

    # Strategy 2: letter at start of entire response — "A." or "A)" or "A "
    start_match = re.match(r"^([A-Z])[.\):\s]", text)
    if start_match:
        letter = start_match.group(1).upper()
        if any(o["key"] == letter for o in options):
            return {"selected": [letter], "raw_text": raw_text, "parse_confidence": 0.8}

    # Strategy 3: code/text match — look for ICD-10 style codes from option text
    matches: list[str] = []
    for opt in options:
        code_match = re.search(r"([A-Z]\d{2}\.?\d*)", opt["text"])
        if code_match:
            code = code_match.group(1)
            if code in text:
                matches.append(opt["key"])

    if len(matches) == 1:
        return {"selected": matches, "raw_text": raw_text, "parse_confidence": 0.7}

    # Strategy 4: multi-select — find all mentioned option letters with separators
    if response_type == "multi_select":
        found: list[str] = []
        for opt in options:
            if re.search(r"\b" + re.escape(opt["key"]) + r"[.,)\s:]", text):
                found.append(opt["key"])
        if found:
            return {"selected": sorted(found), "raw_text": raw_text, "parse_confidence": 0.6}

    # Fallback: multiple code matches
    if matches:
        return {"selected": sorted(set(matches)), "raw_text": raw_text, "parse_confidence": 0.5}

    # Could not parse
    return {"selected": [], "raw_text": raw_text, "parse_confidence": 0.0}


# ---------------------------------------------------------------------------
# Exam runner
# ---------------------------------------------------------------------------

def run_exam(
    items: list[dict],
    agent_md_path: Path,
    model: str,
    cost_tracker: CostTracker,
) -> list[dict]:
    """Run the target agent against all exam items.

    Each entry in `items` may be structured as:
        {"item": {...}, "mcq": {...}}          — MCQ tier
        {"item": {...}, "scenario": {...}}     — scenario tier
        {...}                                  — flat dict with item fields at top level

    Returns list of dicts with keys:
        item_id, tier, prompt, raw_response, parsed_answer, cost, error
    """
    results: list[dict] = []

    for entry in items:
        item = entry.get("item", entry)
        mcq = entry.get("mcq")
        scenario = entry.get("scenario")
        tier = item.get("tier", "mcq")
        item_id = item.get("id", item.get("item_code", "unknown"))

        if tier == "mcq" and mcq:
            prompt = format_mcq_prompt(item, mcq)
        elif tier == "scenario" and scenario:
            prompt = format_scenario_prompt(item, scenario)
        else:
            results.append(
                {
                    "item_id": item_id,
                    "tier": tier,
                    "prompt": "",
                    "raw_response": "",
                    "parsed_answer": None,
                    "cost": 0.0,
                    "error": "Missing mcq or scenario extension",
                }
            )
            continue

        response = invoke_agent(agent_md_path, prompt, model, cost_tracker=cost_tracker)

        parsed = None
        if tier == "mcq" and mcq and not response.get("error"):
            parsed = parse_mcq_response(mcq, response["text"])

        results.append(
            {
                "item_id": item_id,
                "tier": tier,
                "prompt": prompt,
                "raw_response": response["text"],
                "parsed_answer": parsed,
                "cost": response["cost"],
                "error": response.get("error"),
            }
        )

    return results
