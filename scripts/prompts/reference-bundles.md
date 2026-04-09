You are generating draft synthetic reference artifacts for a healthcare specialist prompt.

Return YAML only. Do not wrap the response in code fences. Do not add commentary.

Today: {{today}}
Generator model label: {{model_label}}

Target agent entry from registry:
{{agent_yaml}}

Target agent prompt:
{{agent_markdown}}

Reference style guide:
{{style_guide}}

You must generate exactly {{count}} `example_scenarios` and exactly {{count}} `holdout_scenarios`.

Deliverable distribution for this batch:
{{deliverable_distribution}}

Requirements:
- Use the exact `deliverable_id` and `deliverable_title` values from the registry.
- Keep all names, MRNs, NPIs, organizations, and dates clearly synthetic.
- Do not use square-bracket placeholders, raw checklist tokens like `[ ]` or `[x]`, or template language.
- Do not use the literal words `TBD`, `N/A`, `unknown`, `varies`, `typical`, `average`, `insert`, or `estimate later` in example or holdout bodies.
- Every `source_basis` list must contain only real, public, non-empty source strings. Never emit blank bullets, whitespace-only strings, `null`, or empty quotes. If you have fewer valid sources, return fewer items rather than placeholders.
- Return one YAML mapping only. Do not prepend commentary. Do not emit YAML document markers like `---` or `...` inside the response body.
- Make the example and holdout scenarios distinct from each other.
- Use a mix of `routine`, `moderate`, and `high` complexity across the batch.
- Follow the deliverable structure implied by the target agent prompt instead of inventing a generic format.
- Keep each body concise but realistic: roughly 40-110 lines.
- Use only public, verifiable source references.
- For examples, include capability classes only from the agent's `tool_opportunities`.
- For holdouts, include concrete expectations and structured seed inputs that would let a generator attempt the deliverable without seeing the holdout.

YAML contract:

example_scenarios:
  - scenario_key: short-kebab-key
    deliverable_id: exact-deliverable-id
    deliverable_title: exact deliverable title
    complexity: routine|moderate|high
    scenario_summary: one sentence
    source_basis:
      - public source reference
      - second public source reference
    mcp_servers_relevant:
      - capability_class
    body_markdown: |
      # Completed deliverable body only

holdout_scenarios:
  - scenario_key: short-kebab-key
    deliverable_id: exact-deliverable-id
    deliverable_title: exact deliverable title
    complexity: routine|moderate|high
    scenario_summary: one sentence
    source_basis:
      - public source reference
      - second public source reference
    expectations:
      - concrete evaluator expectation
    required_facts:
      field_name: concrete fact
    intentionally_unknown:
      - fact intentionally withheld from the generator
    red_flags:
      concern_name: concrete issue the generator should address
    mcp_uncertainty_points:
      - fact: live fact that could be checked
        capability_class: allowed capability class
        action: concrete recommended lookup
    body_markdown: |
      # Completed deliverable body only

Quality bar:
- Each holdout should read like senior-practitioner work product, not a template.
- Each example should be polished enough to ship as a draft exemplar after human review.
- Ensure the scenario variety reflects the agent's routing triggers and core mission.
