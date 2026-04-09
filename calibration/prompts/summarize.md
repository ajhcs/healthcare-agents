You are synthesizing calibration gap reports for a single healthcare agent.

Return exactly one YAML document. Do not add prose before or after the YAML.

Use the exact keys below:

```yaml
agent_slug: string
calibration_run_id: string
date: string
systematic_strengths:
  - dimension: string
    evidence: string
    mean_score: float
systematic_gaps:
  - gap_type: computational_omission | context_blindness | mcp_opportunity_missed | specificity_gap | structural_omission | regulatory_error | clinical_implausibility | hallucinated_citation
    recurrence_count: int
    severity: high | medium | low
    evidence_summary: string
    likely_prompt_fix: string
    confidence: float
    promotion_eligible: bool
recommended_edits:
  - target_section: string
    edit_type: strengthen | add_conditional | add_example | fix_error
    description: string
    source_gap_ids:
      - string
```

Requirements:
- Aggregate only recurring patterns that appear in the supplied gap reports.
- Preserve traceability back to source gap IDs.
- Mark `promotion_eligible` according to the plan rules:
  - high severity with confidence >= 0.7 from one holdout, or
  - same gap_type plus matching evidence pattern across 2+ holdouts
- Keep the output operational, not narrative.
- Do not wrap the YAML in markdown fences or any intro/outro prose.
- If any scalar text contains `: `, `[]`, or copied lint fragments, quote that scalar or use a block scalar so the YAML remains parseable.

Agent slug: {{agent_slug}}
Calibration run ID: {{run_id}}

Gap reports:
{{gap_reports_yaml}}
