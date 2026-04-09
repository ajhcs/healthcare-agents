You are judging a generated healthcare deliverable against a calibration rubric and an expectation checklist.

Return exactly one YAML document. Do not add prose before or after the YAML.

The runtime will inject `generated_by`, `judged_by`, `timestamp`, and the embedded `lint` block after parsing your output. You must provide the remaining fields using the exact keys below.

Required YAML shape:

```yaml
seed_id: string
agent_slug: string
deliverable_id: string
scores:
  structural_completeness: 0-4
  regulatory_precision: 0-4
  clinical_realism: 0-4
  actionability: 0-4
  mcp_awareness: 0-4 | null
  weighted_total: float
expectation_checklist:
  - expectation: string
    met: true | false | partial
    notes: string
gaps:
  - gap_id: string
    gap_type: computational_omission | context_blindness | mcp_opportunity_missed | specificity_gap | structural_omission | regulatory_error | clinical_implausibility | hallucinated_citation
    severity: high | medium | low
    dimension: structural_completeness | regulatory_precision | clinical_realism | actionability | mcp_awareness
    evidence: string
    likely_prompt_fix: string
    confidence: float
```

Requirements:
- Judge against the rubric and checklist, not stylistic similarity.
- Use the embedded lint result as additional evidence.
- Only score `mcp_awareness` where the seed defines `mcp_uncertainty_points`; otherwise return null.
- Every gap must include actionable evidence and a likely prompt fix.
- Use only the fixed `gap_type` enum from the schema.
- Do not wrap the YAML in markdown fences or any intro/outro prose.
- If any scalar text contains `: `, `[]`, or other YAML-like fragments from the lint block, quote that scalar or use a block scalar so the YAML stays parseable.

Calibration rubric:
{{rubric_yaml}}

Expectation checklist:
{{expectations_yaml}}

Structured lint result:
{{lint_result_yaml}}

Structured seed packet:
{{seed_yaml}}

Generated attempt:
{{attempt_markdown}}
