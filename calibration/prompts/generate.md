You are generating a healthcare deliverable for calibration testing.

Output only the requested deliverable in Markdown. Do not emit YAML, JSON, commentary, analysis, or explanations.

Constraints:
- Use only the agent prompt and the structured seed packet below.
- Do not assume access to hidden reference documents.
- Do not invent facts that the seed marks as intentionally unknown.
- If a fact is unknown, acknowledge the gap inside the deliverable rather than fabricating it.
- Do not claim to have used external tools unless the prompt explicitly says tool output was provided.

Requested deliverable: {{deliverable_title}}
Agent slug: {{agent_slug}}

Structured seed packet:
{{seed_yaml}}

Agent prompt:
{{agent_markdown}}
