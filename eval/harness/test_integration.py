import pytest
import json
from pathlib import Path


@pytest.mark.integration
class TestPipelineIntegration:
    """End-to-end pipeline tests. Require ANTHROPIC_API_KEY."""

    def test_pipeline_generate_only(self, tmp_path):
        """Generate exam items for the medical coding agent without scoring."""
        from eval.harness.pipeline import Pipeline

        pipeline = Pipeline("revenue-medical-coding-specialist")
        result = pipeline.run(mode="generate-only")

        assert result.claims_extracted > 0, "Should extract claims"
        assert result.items_generated > 0, "Should generate items"
        assert result.items_validated > 0, "Should have valid items"
        assert result.error is None, f"Pipeline error: {result.error}"

        # Verify items persisted to bank
        bank_path = pipeline.items_dir / "bank.jsonl"
        assert bank_path.exists(), "Bank file should exist"
        lines = bank_path.read_text().strip().split("\n")
        assert len(lines) > 0, "Bank should have items"

        # Verify each item is valid JSON
        for line in lines:
            item = json.loads(line)
            assert "item_code" in item or "mcq" in item or "scenario" in item

    def test_pipeline_score_only(self):
        """Generate and score items for the medical coding agent."""
        from eval.harness.pipeline import Pipeline

        pipeline = Pipeline("revenue-medical-coding-specialist")
        result = pipeline.run(mode="score-only")

        assert result.claims_extracted > 0
        assert result.items_generated > 0
        assert result.items_validated > 0
        assert result.overall_score is not None, "Should have overall score"
        assert 0 <= result.overall_score <= 100, f"Score out of range: {result.overall_score}"
        assert result.tier1_score is not None
        assert result.tier2_score is not None
        assert result.error is None, f"Pipeline error: {result.error}"

        # Verify results saved
        assert result.results_dir is not None
        assert result.results_dir.exists()
        summary_path = result.results_dir / "summary.json"
        assert summary_path.exists()

        summary = json.loads(summary_path.read_text())
        assert "overall_score" in summary
        assert "tier1_score" in summary
        assert "tier2_score" in summary
        assert "per_category" in summary
        assert "cost" in summary

        print(f"\n=== BASELINE RESULTS ===")
        print(f"Claims extracted: {result.claims_extracted}")
        print(f"Items generated: {result.items_generated}")
        print(f"Items validated: {result.items_validated}")
        print(f"Items rejected: {result.items_rejected}")
        print(f"Tier 1 (MCQ): {result.tier1_score:.1f}%")
        print(f"Tier 2 (Scenario): {result.tier2_score:.1f}%")
        print(f"Overall: {result.overall_score:.1f}%")
        print(f"Per category: {json.dumps(result.per_category, indent=2)}")
        print(f"Cost: ${result.total_cost:.4f}")

    def test_items_bank_persisted(self):
        """Verify that generated items are persisted to the bank."""
        from eval.harness.pipeline import Pipeline

        pipeline = Pipeline("revenue-medical-coding-specialist")
        pipeline.run(mode="generate-only")

        bank_path = pipeline.items_dir / "bank.jsonl"
        assert bank_path.exists()

        lines = bank_path.read_text().strip().split("\n")
        assert len(lines) > 0

        # Spot-check an item
        first_item = json.loads(lines[0])
        # Should have either top-level item fields or nested structure
        has_item_fields = "item_code" in first_item or "claim_id" in first_item
        has_nested = "mcq" in first_item or "scenario" in first_item
        assert has_item_fields or has_nested, f"Item missing expected fields: {list(first_item.keys())[:5]}"

    def test_genericity_different_agent(self):
        """Verify the pipeline works on a non-coding agent."""
        from eval.harness.pipeline import Pipeline

        pipeline = Pipeline("quality-compliance-officer")
        result = pipeline.run(mode="generate-only")

        assert result.claims_extracted > 0, "Should extract claims from compliance agent"
        assert result.items_generated > 0, "Should generate items for compliance domain"
        assert result.error is None, f"Pipeline error: {result.error}"
