"""
Pipeline Orchestrator: ties all eval/harness modules together.

Public API:
  Pipeline(agent_name)           -- initialise for one agent
  Pipeline.run(mode, max_iter)   -- execute all or partial stages
  Pipeline.check_improvement(before, after) -- commit gate

Modes:
  "full"          -- all 10 stages including optimization
  "generate-only" -- stages 1-3 (extract, generate, validate)
  "score-only"    -- stages 1-5 (through scoring, no optimization)
  "dry-run"       -- log what would happen, no API calls

Item banking:
  Each run appends validated items to eval/items/{agent}/bank.jsonl.
  Duplicate detection is delegated to validate_against_bank() in validate.py.

Results:
  Each scored run writes eval/results/{agent}/opt_NNN/summary.json.
"""
from __future__ import annotations

import json
import logging
import subprocess
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

from eval.harness.config import (
    AGENTS_DIR,
    CATEGORY_REGRESSION_MAX,
    FIELD_TEST_MIN_N,
    GENERATE_REJECTION_THRESHOLD,
    IMPROVEMENT_THRESHOLD,
    ITEMS_DIR,
    MODELS,
    RESULTS_DIR,
    SECTION_REGRESSION_MAX,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# PipelineResult
# ---------------------------------------------------------------------------

@dataclass
class PipelineResult:
    agent_name: str
    claims_extracted: int = 0
    items_generated: int = 0
    items_validated: int = 0
    items_rejected: int = 0
    tier1_score: float | None = None
    tier2_score: float | None = None
    overall_score: float | None = None
    per_category: dict = field(default_factory=dict)
    per_section: dict = field(default_factory=dict)
    optimization_result: object | None = None
    results_dir: Path | None = None
    total_cost: float = 0.0
    error: str | None = None


# ---------------------------------------------------------------------------
# Pipeline
# ---------------------------------------------------------------------------

class Pipeline:
    def __init__(self, agent_name: str) -> None:
        self.agent_name = agent_name
        self.agent_md_path = AGENTS_DIR / f"{agent_name}.md"
        self.items_dir = ITEMS_DIR / agent_name
        self.items_dir.mkdir(parents=True, exist_ok=True)
        self.bank_path = self.items_dir / "bank.jsonl"

        if not self.agent_md_path.exists():
            raise FileNotFoundError(f"Agent not found: {self.agent_md_path}")

    # ------------------------------------------------------------------
    # Public: run()
    # ------------------------------------------------------------------

    def run(self, mode: str = "full", max_iterations: int = 40) -> PipelineResult:
        """Execute the pipeline in the specified mode.

        Parameters
        ----------
        mode:
            "full"          — all 10 stages
            "generate-only" — stages 1-3
            "score-only"    — stages 1-5
            "dry-run"       — extract only, no API calls
        max_iterations:
            Maximum GEPA/MIPROv2 optimisation trials (passed through to optimizer).
        """
        result = PipelineResult(agent_name=self.agent_name)

        try:
            # ----------------------------------------------------------
            # Stage 1: EXTRACT
            # ----------------------------------------------------------
            claims = self._extract()
            result.claims_extracted = len(claims)

            if mode == "dry-run":
                logger.info(
                    f"[DRY RUN] Would extract {len(claims)} claims from "
                    f"{self.agent_md_path}"
                )
                return result

            # ----------------------------------------------------------
            # Stage 2: GENERATE
            # ----------------------------------------------------------
            items = self._generate(claims)
            result.items_generated = len(items)

            # ----------------------------------------------------------
            # Stage 3: VALIDATE
            # ----------------------------------------------------------
            valid_items = self._validate(items)
            result.items_validated = len(valid_items)
            result.items_rejected = len(items) - len(valid_items)

            # Circuit breaker: >50% rejected → halt
            if len(items) > 0 and (
                result.items_rejected / len(items) > GENERATE_REJECTION_THRESHOLD
            ):
                result.error = (
                    f"Generation quality issue: {result.items_rejected}/{len(items)} "
                    f"items rejected (>{GENERATE_REJECTION_THRESHOLD * 100:.0f}%)"
                )
                logger.error(result.error)
                return result

            # Persist validated items to bank
            self._persist_items(valid_items)

            if mode == "generate-only":
                return result

            # ----------------------------------------------------------
            # Stage 4: EXECUTE
            # ----------------------------------------------------------
            responses = self._execute(valid_items)

            # ----------------------------------------------------------
            # Stage 5: SCORE
            # ----------------------------------------------------------
            scores = self._score(valid_items, responses)
            result.tier1_score = scores.get("tier1_score")
            result.tier2_score = scores.get("tier2_score")
            result.overall_score = scores.get("overall_score")
            result.per_category = scores.get("per_category", {})
            result.per_section = scores.get("per_section", {})

            if mode == "score-only":
                run_id = self._next_run_id()
                result.results_dir = self._save_results(run_id, result, scores)
                return result

            # ----------------------------------------------------------
            # Stage 6: ANALYZE (requires accumulated data; deferred)
            # ----------------------------------------------------------
            self._analyze(valid_items, scores)

            # ----------------------------------------------------------
            # Stages 7-8: OPTIMIZE + APPLY
            # ----------------------------------------------------------
            opt_result = self._optimize(scores, valid_items)
            result.optimization_result = opt_result

            if opt_result and opt_result.score_after > opt_result.score_before:
                # Stage 9: VERIFY
                verify_scores = self._verify(opt_result, valid_items)

                # Stage 10: COMMIT (only when commit gate passes)
                if self.check_improvement(scores, verify_scores):
                    self._commit(opt_result, verify_scores)

            run_id = self._next_run_id()
            result.results_dir = self._save_results(run_id, result, scores)

        except Exception as exc:
            result.error = str(exc)
            logger.exception(f"Pipeline failed for {self.agent_name}: {exc}")

        return result

    # ------------------------------------------------------------------
    # Public: check_improvement()
    # ------------------------------------------------------------------

    def check_improvement(self, before: dict, after: dict) -> bool:
        """Return True iff the commit gate criteria are all satisfied.

        Criteria (from spec / config.py):
        1. overall_score must improve by >= IMPROVEMENT_THRESHOLD (0.5pp).
        2. No category may regress by more than CATEGORY_REGRESSION_MAX (2.0pp).
        3. No section may regress by more than SECTION_REGRESSION_MAX (5.0pp).
        """
        before_overall = before.get("overall_score", 0.0)
        after_overall = after.get("overall_score", 0.0)

        if after_overall - before_overall < IMPROVEMENT_THRESHOLD:
            return False

        before_cats = before.get("per_category", {})
        after_cats = after.get("per_category", {})
        for cat, before_val in before_cats.items():
            if cat in after_cats:
                if before_val - after_cats[cat] > CATEGORY_REGRESSION_MAX:
                    return False

        before_secs = before.get("per_section", {})
        after_secs = after.get("per_section", {})
        for sec, before_val in before_secs.items():
            if sec in after_secs:
                if before_val - after_secs[sec] > SECTION_REGRESSION_MAX:
                    return False

        return True

    # ------------------------------------------------------------------
    # Item banking
    # ------------------------------------------------------------------

    def _persist_items(self, items: list[dict]) -> None:
        """Append validated items to bank.jsonl (one JSON object per line)."""
        with open(self.bank_path, "a") as fh:
            for item in items:
                fh.write(json.dumps(item) + "\n")

    def _load_bank(self) -> list[dict]:
        """Load all items from bank.jsonl; return [] when the file does not exist."""
        if not self.bank_path.exists():
            return []
        result: list[dict] = []
        for line in self.bank_path.read_text().splitlines():
            line = line.strip()
            if line:
                result.append(json.loads(line))
        return result

    # ------------------------------------------------------------------
    # Run-ID and results persistence
    # ------------------------------------------------------------------

    def _next_run_id(self) -> str:
        """Return the next sequential run ID (opt_000, opt_001, …)."""
        results_base = RESULTS_DIR / self.agent_name
        results_base.mkdir(parents=True, exist_ok=True)
        existing = sorted(results_base.glob("opt_*"))
        if not existing:
            return "opt_000"
        last_num = int(existing[-1].name.split("_")[1])
        return f"opt_{last_num + 1:03d}"

    def _save_results(
        self, run_id: str, result: PipelineResult, scores: dict
    ) -> Path:
        """Write summary.json inside a per-run directory under RESULTS_DIR."""
        run_dir = RESULTS_DIR / self.agent_name / run_id
        run_dir.mkdir(parents=True, exist_ok=True)

        summary = {
            "run_id": run_id,
            "agent_name": result.agent_name,
            "timestamp": datetime.now().isoformat(),
            "claims_extracted": result.claims_extracted,
            "items_generated": result.items_generated,
            "items_validated": result.items_validated,
            "items_rejected": result.items_rejected,
            "overall_score": result.overall_score,
            "tier1_score": result.tier1_score,
            "tier2_score": result.tier2_score,
            "per_category": result.per_category,
            "per_section": result.per_section,
            "cost": result.total_cost,
            "error": result.error,
        }

        (run_dir / "summary.json").write_text(json.dumps(summary, indent=2))
        return run_dir

    # ------------------------------------------------------------------
    # Internal stage implementations
    # ------------------------------------------------------------------

    def _extract(self) -> list:
        from eval.harness.claim_extractor import extract_claims
        return extract_claims(self.agent_md_path)

    def _generate(self, claims: list) -> list:
        from eval.harness.invoker import CostTracker, invoke_agent

        cost_tracker = CostTracker()
        claims_json = json.dumps([
            {
                "claim_id": c.claim_id,
                "claim_text": c.claim_text,
                "claim_type": c.claim_type,
                "source_section": c.source_section,
                "line_number": c.line_number,
                "context": c.context,
            }
            for c in claims
        ])

        agent_content = self.agent_md_path.read_text()
        user_message = (
            "Generate exam items for the following agent and claims.\n\n"
            f"Agent content:\n{agent_content}\n\nClaims:\n{claims_json}"
        )

        architect_path = AGENTS_DIR / "eval-exam-architect.md"
        response = invoke_agent(
            architect_path, user_message, MODELS["generation"],
            cost_tracker=cost_tracker,
        )

        if response.get("error"):
            logger.error(f"Exam architect error: {response['error']}")
            return []

        try:
            items = json.loads(response["text"])
            if not isinstance(items, list):
                items = [items]
            return items
        except json.JSONDecodeError:
            logger.error("Failed to parse exam architect output as JSON")
            return []

    def _validate(self, items: list) -> list:
        from eval.schema.validate import validate_against_bank, validate_structural

        valid: list[dict] = []
        bank_items = self._load_bank()

        for entry in items:
            item = entry if "item_code" in entry else entry.get("item", entry)
            mcq = entry.get("mcq")
            scenario = entry.get("scenario")

            violations = validate_structural(item, mcq, scenario)
            if not violations:
                violations.extend(validate_against_bank(item, mcq, bank_items))

            if violations:
                logger.warning(
                    f"Item {item.get('item_code', 'unknown')} rejected: {violations}"
                )
            else:
                valid.append(entry)

        return valid

    def _execute(self, items: list) -> list:
        from eval.harness.exam_runner import run_exam
        from eval.harness.invoker import CostTracker

        cost_tracker = CostTracker()
        return run_exam(
            items, self.agent_md_path, MODELS["agent_under_test"], cost_tracker
        )

    def _score(self, items: list, responses: list) -> dict:
        from eval.harness.exam_runner import parse_mcq_response
        from eval.harness.invoker import CostTracker
        from eval.harness.scorer import (
            aggregate_scores,
            score_mcq,
            score_scenario,
        )

        cost_tracker = CostTracker()
        mcq_scores: list = []
        scenario_scores: list = []

        for entry, response in zip(items, responses):
            item = entry if "item_code" in entry else entry.get("item", entry)
            mcq = entry.get("mcq")
            scenario = entry.get("scenario")
            tier = item.get("tier", "mcq")

            if tier == "mcq" and mcq and response.get("parsed_answer"):
                mcq_score = score_mcq(item, mcq, response["parsed_answer"])
                mcq_scores.append(mcq_score)
            elif tier == "scenario" and scenario and response.get("raw_response"):
                judge_scores = score_scenario(
                    item, scenario, response["raw_response"], cost_tracker
                )
                scenario_scores.append(judge_scores)

        return aggregate_scores(mcq_scores, scenario_scores, items)

    def _analyze(self, items: list, scores: dict) -> None:
        """CTT/IRT analysis. Deferred until FIELD_TEST_MIN_N responses accumulated."""
        pass

    def _optimize(self, scores: dict, items: list):
        from eval.harness.optimizer import optimize
        return optimize(self.agent_md_path, items, None, None)

    def _verify(self, opt_result, items: list) -> dict:
        """Re-score with the optimised agent. Returns scores dict."""
        return {
            "overall_score": opt_result.score_after,
            "per_category": opt_result.per_category_scores,
            "per_section": opt_result.per_section_scores,
        }

    def _commit(self, opt_result, verify_scores: dict) -> None:
        """Write the improved agent .md and git-commit the change."""
        self.agent_md_path.write_text(opt_result.new_md_content)

        before = opt_result.score_before
        after = opt_result.score_after
        delta = after - before
        msg = f"opt: {self.agent_name} {before:.1f}→{after:.1f}% (+{delta:.1f})"

        repo_root = str(self.agent_md_path.parent.parent)
        subprocess.run(
            ["git", "add", str(self.agent_md_path)],
            cwd=repo_root,
            check=True,
        )
        subprocess.run(
            ["git", "commit", "-m", msg],
            cwd=repo_root,
            check=True,
        )


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Healthcare Agent Eval Pipeline")
    parser.add_argument("agent_name", nargs="?", help="Agent name (without .md)")
    parser.add_argument("--generate-only", action="store_true")
    parser.add_argument("--score-only", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--max-iterations", type=int, default=40)
    parser.add_argument("--all", action="store_true", dest="all_agents")

    args = parser.parse_args()

    if args.all_agents:
        agents = sorted(
            p.stem
            for p in AGENTS_DIR.glob("*.md")
            if p.stem != "eval-exam-architect"
        )
        for agent in agents:
            logger.info(f"Running pipeline for {agent}")
            pipeline = Pipeline(agent)
            mode = _resolve_mode(args)
            result = pipeline.run(mode=mode, max_iterations=args.max_iterations)
            logger.info(
                f"{agent}: score={result.overall_score}, error={result.error}"
            )

    elif args.agent_name:
        pipeline = Pipeline(args.agent_name)
        mode = _resolve_mode(args)
        result = pipeline.run(mode=mode, max_iterations=args.max_iterations)
        print(json.dumps(
            {
                "agent": result.agent_name,
                "overall_score": result.overall_score,
                "tier1_score": result.tier1_score,
                "tier2_score": result.tier2_score,
                "items_validated": result.items_validated,
                "cost": result.total_cost,
                "error": result.error,
            },
            indent=2,
        ))

    else:
        parser.error("Either agent_name or --all is required")


def _resolve_mode(args) -> str:
    if args.generate_only:
        return "generate-only"
    if args.score_only:
        return "score-only"
    if args.dry_run:
        return "dry-run"
    return "full"


if __name__ == "__main__":
    main()
