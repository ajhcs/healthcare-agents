"""
Pydantic v2 models for healthcare agent exam items.

Two tiers:
  - Tier 1 MCQ  : Multiple-choice questions (single_best_answer, multi_select, ordered_response)
  - Tier 2 Scenario: Open-ended scenarios scored by LLM judges against rubrics
"""
from __future__ import annotations

import re
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, Field, field_validator, model_validator


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

COGNITIVE_LEVELS = ["remember", "understand", "apply", "analyze", "evaluate", "create"]
CLAIM_TYPES = ["knowledge", "reasoning", "cross_domain", "edge_case"]

# claim types that require cognitive_level >= "apply"
_HIGH_FLOOR_CLAIM_TYPES = {"reasoning", "cross_domain", "edge_case"}

_ITEM_CODE_RE = re.compile(r"^(MC|MS|OR|SC)-[A-Z]\d+-\d{3}$")


# ---------------------------------------------------------------------------
# Supporting models — ContentClassification
# ---------------------------------------------------------------------------

class ContentClassification(BaseModel):
    domain: str
    subdomain: str
    competency_standard: str | None = None
    content_tag_primary: str
    content_tags_secondary: list[str] = []


# ---------------------------------------------------------------------------
# Psychometric targets
# ---------------------------------------------------------------------------

class CTTTargets(BaseModel):
    p_value: tuple[float, float] = (0.30, 0.85)
    point_biserial_min: float = 0.20
    distractor_selection_min: float = 0.05


class IRTTargets(BaseModel):
    b_difficulty: tuple[float, float] = (-2.0, 2.0)
    a_discrimination_min: float = 0.5
    a_discrimination_ideal: tuple[float, float] = (0.8, 2.5)
    c_guessing: float = 0.25


# ---------------------------------------------------------------------------
# Item metadata & lineage
# ---------------------------------------------------------------------------

class ItemMetadata(BaseModel):
    created_at: str | None = None
    last_calibrated_at: str | None = None
    content_hash: str | None = None
    parent_item_id: str | None = None
    enemy_item_ids: list[str] = []
    retirement_reason: str | None = None


class OptimizationLineage(BaseModel):
    generation_method: Literal["auto_generated", "human_authored", "hybrid"] = "auto_generated"
    generator_model: str | None = None
    generator_prompt_version: str | None = None
    optimization_run_id: str | None = None
    iteration: int = 0
    change_type: str = "new"
    change_justification: str | None = None


# ---------------------------------------------------------------------------
# Core ExamItem
# ---------------------------------------------------------------------------

class ExamItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    item_code: str
    version: int = 1
    status: Literal["draft", "field_test", "operational", "retired", "flagged"] = "draft"
    target_agent: str
    claim_id: str
    claim_text: str
    claim_type: Literal["knowledge", "reasoning", "cross_domain", "edge_case"]
    cognitive_level: Literal["remember", "understand", "apply", "analyze", "evaluate", "create"]
    depth_of_knowledge: int = Field(ge=1, le=4)
    tier: Literal["mcq", "scenario"]
    source_citation: str
    source_url: str | None = None
    content_classification: ContentClassification | None = None
    ctt_targets: CTTTargets = Field(default_factory=CTTTargets)
    irt_targets: IRTTargets = Field(default_factory=IRTTargets)
    item_metadata: ItemMetadata = Field(default_factory=ItemMetadata)
    optimization_lineage: OptimizationLineage = Field(default_factory=OptimizationLineage)
    calibration_history: list[dict] = []
    version_history: list[dict] = []

    @field_validator("item_code")
    @classmethod
    def validate_item_code(cls, v: str) -> str:
        if not _ITEM_CODE_RE.match(v):
            raise ValueError(
                f"item_code must match pattern (MC|MS|OR|SC)-<LETTER><digits>-<3digits>, got: {v!r}"
            )
        return v

    @field_validator("cognitive_level")
    @classmethod
    def reject_remember(cls, v: str) -> str:
        if v == "remember":
            raise ValueError(
                "cognitive_level 'remember' is not allowed — all items must test understanding or above"
            )
        return v

    @model_validator(mode="after")
    def check_cognitive_floor_for_claim_type(self) -> "ExamItem":
        if self.claim_type in _HIGH_FLOOR_CLAIM_TYPES:
            level_idx = COGNITIVE_LEVELS.index(self.cognitive_level)
            apply_idx = COGNITIVE_LEVELS.index("apply")
            if level_idx < apply_idx:
                raise ValueError(
                    f"claim_type '{self.claim_type}' requires cognitive_level >= 'apply', "
                    f"got '{self.cognitive_level}'"
                )
        return self


# ---------------------------------------------------------------------------
# Tier 1 — MCQ extension
# ---------------------------------------------------------------------------

class Option(BaseModel):
    key: str  # A, B, C, D …
    text: str
    is_correct: bool
    rationale: str
    distractor_error_type: Literal[
        "similar_code",
        "sequencing_error",
        "guideline_misapplication",
        "scope_error",
        "obsolete_code",
    ] | None = None


class ResponseFormat(BaseModel):
    type: Literal["single_best_answer", "multi_select", "ordered_response"]
    option_count: int = 4
    select_count: int | None = None
    select_count_revealed: bool = False


class MCQExtension(BaseModel):
    vignette: str
    lead_in: str
    response_format: ResponseFormat
    options: list[Option]

    @model_validator(mode="after")
    def validate_options(self) -> "MCQExtension":
        if len(self.options) < 4:
            raise ValueError(
                f"MCQ must have at least 4 options, got {len(self.options)}"
            )
        correct_count = sum(1 for o in self.options if o.is_correct)
        if correct_count == 0:
            raise ValueError("MCQ must have at least one correct answer")
        if self.response_format.type == "single_best_answer" and correct_count > 1:
            raise ValueError("single_best_answer MCQ must have exactly one correct answer")
        return self


# ---------------------------------------------------------------------------
# Tier 2 — Scenario extension
# ---------------------------------------------------------------------------

class ScoringLevel(BaseModel):
    score: int
    label: str
    description: str


class RubricCriterion(BaseModel):
    criterion: str
    weight: float
    max_points: int = 4
    scoring_levels: list[ScoringLevel] = []
    anchor_response_exemplary: str | None = None
    anchor_response_borderline: str | None = None
    common_errors: list[str] = []


class JudgingConfig(BaseModel):
    judge_model: str = "claude-opus-4-6"
    judge_prompt_template: str = "coding_scenario_v1"
    num_judges: int = 3
    agreement_threshold: float = 0.70
    agreement_metric: str = "weighted_kappa"
    adjudication: Literal["majority_vote", "average", "highest_qualified"] = "majority_vote"
    calibration_responses: list[dict] = []


class ScoringRule(BaseModel):
    type: Literal["modified_conjunctive", "compensatory"] = "modified_conjunctive"
    minimum_per_criterion: int = 2
    weighted_total_minimum: float = 0.70
    critical_criteria: list[str] = []
    critical_criterion_minimum: int = 3


class ScenarioExtension(BaseModel):
    prompt: str
    rubric: list[RubricCriterion]
    judging_config: JudgingConfig = Field(default_factory=JudgingConfig)
    scoring_rule: ScoringRule = Field(default_factory=ScoringRule)

    @field_validator("rubric")
    @classmethod
    def validate_rubric_count(cls, v: list[RubricCriterion]) -> list[RubricCriterion]:
        if len(v) < 3:
            raise ValueError(
                f"Scenario rubric must have at least 3 criteria, got {len(v)}"
            )
        if len(v) > 7:
            raise ValueError(
                f"Scenario rubric must have at most 7 criteria, got {len(v)}"
            )
        return v


# ---------------------------------------------------------------------------
# JSON Schema generation
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import json
    from pathlib import Path

    schema = ExamItem.model_json_schema()
    out = Path(__file__).parent / "item_schema.json"
    out.write_text(json.dumps(schema, indent=2))
    print(f"Schema written to {out}")
