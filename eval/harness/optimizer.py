"""
Optimizer: GEPA / MIPROv2 wrapper for section-aware prompt tuning.

Public API:
  parse_sections(md_content)          -> dict[str, str]
  reassemble_sections(sections)       -> str
  create_dspy_metric(...)             -> callable
  optimize(agent_md_path, ...)        -> OptimizationResult

DSPy (dspy[anthropic]>=3.1.3) must be installed. GEPA is the primary optimizer;
MIPROv2 is the fallback when dspy.GEPA is unavailable.

Design note: dspy is imported lazily (inside functions that need it) so that
the module can be imported and the pure utility functions (parse_sections,
reassemble_sections, OptimizationResult) can be used even when dspy is mocked
or not installed.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any


# ---------------------------------------------------------------------------
# Section parsing / reassembly  (pure functions — no dspy dependency)
# ---------------------------------------------------------------------------

def parse_sections(md_content: str) -> dict[str, str]:
    """Split an agent .md file into named sections keyed by ## header.

    Special keys:
      __frontmatter__  — YAML block between the opening and closing --- markers
      __preamble__     — content before the first ## header (after frontmatter)

    All other keys come from "## Header" lines; the value is every line that
    follows until the next "## " header (or end of file).
    """
    sections: dict[str, str] = {}
    lines = md_content.split("\n")

    # ---- Extract frontmatter ------------------------------------------------
    if lines and lines[0].strip() == "---":
        end_idx: int | None = None
        for i in range(1, len(lines)):
            if lines[i].strip() == "---":
                end_idx = i
                break
        if end_idx is not None:
            sections["__frontmatter__"] = "\n".join(lines[: end_idx + 1])
            lines = lines[end_idx + 1 :]

    # ---- Walk remaining lines -----------------------------------------------
    current_key = "__preamble__"
    current_lines: list[str] = []

    for line in lines:
        if line.startswith("## "):
            # Flush current accumulator
            if current_lines or current_key != "__preamble__":
                sections[current_key] = "\n".join(current_lines)
            current_key = line[3:].strip()
            current_lines = []
        else:
            current_lines.append(line)

    # Flush last section
    if current_lines or current_key != "__preamble__":
        sections[current_key] = "\n".join(current_lines)

    return sections


def reassemble_sections(sections: dict[str, str]) -> str:
    """Rebuild a .md string from a sections dict produced by parse_sections.

    Ordering: frontmatter -> preamble -> named sections (insertion order).
    """
    parts: list[str] = []

    if "__frontmatter__" in sections:
        parts.append(sections["__frontmatter__"])

    if "__preamble__" in sections:
        parts.append(sections["__preamble__"])

    for key, value in sections.items():
        if key.startswith("__"):
            continue
        parts.append(f"\n## {key}")
        parts.append(value)

    return "\n".join(parts)


# ---------------------------------------------------------------------------
# OptimizationResult  (pure dataclass — no dspy dependency)
# ---------------------------------------------------------------------------

@dataclass
class OptimizationResult:
    """Result returned by optimize()."""

    new_md_content: str
    score_before: float
    score_after: float
    per_category_scores: dict
    per_section_scores: dict
    feedback_text: str
    trials_run: int
    cost: float
    optimizer_used: str  # "GEPA" or "MIPROv2"


# ---------------------------------------------------------------------------
# DSPy metric  (lazy import)
# ---------------------------------------------------------------------------

def create_dspy_metric(
    exam_items: list,
    scorer_module: Any,
    config: Any,
) -> Any:
    """Return a DSPy-compatible metric function.

    The returned callable has the signature ``metric(example, pred, trace=None)``
    and returns a ``dspy.Prediction`` with ``score`` (float 0-1) and ``feedback``
    (str) attributes.

    For MCQ items the score is derived from ``score_mcq``.
    For scenario items a placeholder score of 0.5 is used during optimization;
    full multi-judge scoring happens in the verification pass.

    dspy is imported lazily so that this function works correctly when dspy is
    replaced by a mock in the test environment.
    """
    import dspy
    from eval.harness.exam_runner import parse_mcq_response
    from eval.harness.scorer import score_mcq

    def metric(example: dict, pred: dict, trace: Any = None) -> Any:
        item = example.get("item", {})
        mcq = example.get("mcq")
        response_text = pred.get("response", "")

        if mcq:
            parsed = parse_mcq_response(mcq, response_text)
            mcq_score = score_mcq(item, mcq, parsed)
            score = mcq_score.score
            status = "correct" if mcq_score.correct else "incorrect"
            feedback = (
                f"MCQ {item.get('id', item.get('item_code', 'unknown'))}: {status} "
                f"(selected={mcq_score.selected}, expected={mcq_score.expected})"
            )
        else:
            # Scenario: simplified placeholder during optimization.
            score = 0.5
            feedback = "Scenario scoring simplified during optimization"

        return dspy.Prediction(score=score, feedback=feedback)

    return metric


# ---------------------------------------------------------------------------
# Internal helpers (lazy imports)
# ---------------------------------------------------------------------------

def _score_items(
    module: Any,
    exam_items: list[dict],
    config: Any,
) -> tuple[float, dict, dict, float]:
    """Run exam_items through the module. Returns (overall_score, per_cat, per_sec, total_cost).

    Score is 0-100. Only MCQ items are scored precisely; scenario items are
    placeholders (50.0) to avoid expensive multi-judge calls during optimization.
    """
    from eval.harness.exam_runner import parse_mcq_response
    from eval.harness.scorer import score_mcq

    category_buckets: dict[str, list[float]] = {}
    section_buckets: dict[str, list[float]] = {}
    all_scores: list[float] = []
    total_cost = 0.0

    for exam_item in exam_items:
        item = exam_item.get("item", {})
        mcq = exam_item.get("mcq")
        claim_type = item.get("claim_type", "unknown")
        domain = item.get("content_classification", {}).get("domain", "unknown")

        if mcq:
            option_lines = "\n".join(
                f"  {opt['key']}. {opt['text']}"
                for opt in mcq.get("options", [])
            )
            user_message = (
                f"Question:\n{item.get('prompt', '')}\n\nOptions:\n{option_lines}\n\n"
                "Reply with only the letter of the correct answer."
            )
        else:
            scenario = exam_item.get("scenario", {}) or {}
            user_message = scenario.get("prompt", item.get("prompt", ""))

        pred_result = module.forward(user_message)
        response_text = pred_result.response if hasattr(pred_result, "response") else ""
        total_cost += pred_result.cost if hasattr(pred_result, "cost") else 0.0

        if mcq:
            parsed = parse_mcq_response(mcq, response_text)
            mcq_score = score_mcq(item, mcq, parsed)
            score = mcq_score.score * 100.0
        else:
            score = 50.0  # placeholder

        all_scores.append(score)
        category_buckets.setdefault(claim_type, []).append(score)
        section_buckets.setdefault(domain, []).append(score)

    overall = sum(all_scores) / len(all_scores) if all_scores else 0.0
    per_cat = {k: sum(v) / len(v) for k, v in category_buckets.items()}
    per_sec = {k: sum(v) / len(v) for k, v in section_buckets.items()}
    return overall, per_cat, per_sec, total_cost


# ---------------------------------------------------------------------------
# Main optimize() entry point  (lazy dspy import)
# ---------------------------------------------------------------------------

def optimize(
    agent_md_path: Path,
    exam_items: list[dict],
    scorer_module: Any,
    config: Any,
) -> OptimizationResult:
    """Optimize an agent's system prompt using GEPA (or MIPROv2 fallback).

    Steps:
      1. Establish baseline score via _score_items.
      2. Build a DSPy module wrapping the agent.
      3. Build the metric function via create_dspy_metric.
      4. Build trainset dspy.Example objects from exam_items.
      5. Try dspy.GEPA; fall back to dspy.teleprompt.MIPROv2.
      6. Compile (optimize) the module.
      7. Re-score with the optimised module.
      8. Return OptimizationResult with before/after scores and metadata.

    dspy is imported lazily here so that the module import succeeds in
    environments where dspy is mocked rather than fully installed.
    """
    import dspy

    from eval.harness.config import GEPA_AUTO, MODELS
    from eval.harness.invoker import CostTracker, invoke_agent

    model = MODELS.get("agent_under_test", list(MODELS.values())[0])
    auto = getattr(config, "GEPA_AUTO", GEPA_AUTO)

    total_cost = 0.0

    # ---- DSPy module that wraps invoke_agent --------------------------------
    class _AgentModule(dspy.Module):
        def __init__(self) -> None:
            super().__init__()
            self._prompt_text = agent_md_path.read_text(encoding="utf-8")

        def forward(self, user_message: str) -> Any:
            tracker = CostTracker()
            response = invoke_agent(
                agent_md_path,
                user_message,
                model,
                cost_tracker=tracker,
            )
            return dspy.Prediction(
                response=response.get("text", ""),
                cost=tracker.total_cost,
            )

    # ---- 1. Baseline score --------------------------------------------------
    module = _AgentModule()
    score_before, cat_before, sec_before, cost_before = _score_items(
        module, exam_items, config
    )
    total_cost += cost_before

    # ---- 2. Build metric + trainset -----------------------------------------
    metric = create_dspy_metric(exam_items, scorer_module, config)

    trainset = [
        dspy.Example(**item).with_inputs("item", "mcq", "scenario")
        for item in exam_items
    ]

    # ---- 3. Select optimizer (GEPA preferred, MIPROv2 fallback) -------------
    optimizer_used: str
    try:
        optimizer_cls = dspy.GEPA  # type: ignore[attr-defined]
        optimizer_used = "GEPA"
    except AttributeError:
        optimizer_cls = dspy.teleprompt.MIPROv2
        optimizer_used = "MIPROv2"

    optimizer = optimizer_cls(metric=metric, auto=auto)

    # ---- 4. Compile ---------------------------------------------------------
    optimized_module = optimizer.compile(student=module, trainset=trainset)

    # ---- 5. Post-optimization score -----------------------------------------
    score_after, cat_after, sec_after, cost_after = _score_items(
        optimized_module, exam_items, config
    )
    total_cost += cost_after

    # ---- 6. Extract optimised prompt text -----------------------------------
    if hasattr(optimized_module, "_prompt_text") and optimized_module._prompt_text:
        new_md_content = optimized_module._prompt_text
    else:
        new_md_content = agent_md_path.read_text(encoding="utf-8")

    # ---- 7. Build feedback text ---------------------------------------------
    delta = score_after - score_before
    feedback_lines = [
        f"Optimizer: {optimizer_used}",
        f"Score before: {score_before:.1f}%",
        f"Score after:  {score_after:.1f}%",
        f"Delta:        {delta:+.1f}%",
        "",
        "Per-category scores (after):",
    ]
    for cat, s in cat_after.items():
        feedback_lines.append(f"  {cat}: {s:.1f}%")
    feedback_lines.append("")
    feedback_lines.append("Per-section scores (after):")
    for sec, s in sec_after.items():
        feedback_lines.append(f"  {sec}: {s:.1f}%")

    feedback_text = "\n".join(feedback_lines)

    return OptimizationResult(
        new_md_content=new_md_content,
        score_before=score_before,
        score_after=score_after,
        per_category_scores=cat_after,
        per_section_scores=sec_after,
        feedback_text=feedback_text,
        trials_run=len(trainset),
        cost=total_cost,
        optimizer_used=optimizer_used,
    )
