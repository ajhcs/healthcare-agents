You are writing only the healthcare prompt section titled `## What Auditors Actually Challenge`.

Return Markdown only. Do not include commentary before or after the section.

Requirements:
- Start with the exact heading `## What Auditors Actually Challenge`
- Produce 4 to 6 attack surfaces
- Each attack surface must start with a marker like `<!-- attack-surface: short-slug -->`
- Each attack surface must include:
  - `### <number>. <finding name>`
  - `- **What goes wrong**: ...`
  - `- **Why it's caught**: ...`
  - `- **How to prevent it**: ...`
  - `- **Source**: ...`
  - `- **Evidence type**: ...`
  - `- **Source confidence**: high | medium | low`
  - `- **As of**: {{today}}`
- Focus on findings that auditors, surveyors, payers, RAC/MAC reviewers, or compliance teams actually challenge in this role
- Use only public, recognizable source labels or standards. Do not fabricate document numbers, work-plan items, or transmittals.
- Prefer concrete operational failure modes over abstract compliance advice
- Keep the section dense and action-oriented

Reference style:

```markdown
## What Auditors Actually Challenge

<!-- attack-surface: sample-slug -->
### 1. Sample Finding
- **What goes wrong**: Concrete failure pattern.
- **Why it's caught**: Named reviewer or survey mechanism plus the control that flags it.
- **How to prevent it**: Specific operational fix.
- **Source**: Named public source or standard family.
- **Evidence type**: CFR
- **Source confidence**: high
- **As of**: {{today}}
```

Registry entry:
{{registry_yaml}}

Agent prompt:
{{agent_markdown}}
