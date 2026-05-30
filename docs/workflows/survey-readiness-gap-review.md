# Survey Readiness Gap Review

Plan accreditation or CMS survey readiness work with tracer preparation, policy evidence, corrective actions, and leadership briefing.

Primary specialist: `quality-accreditation-specialist`
Supporting handoffs: `quality-improvement-specialist`, `quality-compliance-officer`, `clinical-infection-prevention-specialist`
Output artifact: survey readiness gap plan

## Example Input

> We need a CMS survey readiness gap review for open corrective actions and tracer prep.

## Required Context

- standard set
- site
- last survey findings
- open corrective actions

## Red Flags

- immediate jeopardy concern
- open corrective action deadline
- repeat deficiency
- patient safety risk

## Example Output

```markdown
# Survey Readiness Gap Review

Problem: We need a CMS survey readiness gap review for open corrective actions and tracer prep.
Confidence: 0.89
Rationale: matched triggers: survey readiness, CMS survey, tracer, corrective action; primary specialist: quality-accreditation-specialist; artifact: survey readiness gap plan; next closest workflow: emergency-preparedness-exercise-readiness; routing score: 247

## Roles
- Primary: quality-accreditation-specialist
- Handoffs: quality-improvement-specialist, quality-compliance-officer, clinical-infection-prevention-specialist

## Missing Questions
- What is the standard set?
- What is the site?

## Evidence To Collect
- standard set
- site
- last survey findings
- open corrective actions
- policy inventory
- tracer schedule
- department owners
- mock survey findings

## survey readiness gap plan
### Standards map
Add standards map details using approved local evidence, assumptions, owner, and review status.

### Tracer plan
Add tracer plan details using approved local evidence, assumptions, owner, and review status.

### Policy evidence list
Add policy evidence list details using approved local evidence, assumptions, owner, and review status.

### Owner matrix
Add owner matrix details using approved local evidence, assumptions, owner, and review status.

### Leadership briefing
Add leadership briefing details using approved local evidence, assumptions, owner, and review status.

### Readiness cadence
Add readiness cadence details using approved local evidence, assumptions, owner, and review status.

## Red Flags
- immediate jeopardy concern
- open corrective action deadline
- repeat deficiency
- patient safety risk

## Safety
- Healthcare Agents provides healthcare administration decision support only. Do not use it for diagnosis, treatment, emergency guidance, or final clinical decision-making.
- Do not include direct patient identifiers or PHI unless you are working in a locally approved, governed environment and can apply minimum necessary data handling.
- Validate all outputs against local policy, payer contracts, applicable laws, and the accountable human owner before action.
- Escalate final clinical, legal, coding, billing, audit, compliance, contracting, employment, security, and executive decisions to qualified human owners.

## Platform Prompt
Draft a survey readiness workup with standard set, site, prior findings, open actions, and leadership briefing.

Problem: We need a CMS survey readiness gap review for open corrective actions and tracer prep.

Return the survey readiness gap plan with required context, missing inputs, handoffs, safety constraints, and a quality checklist.
```

## Platform Prompts

Claude: Use quality-accreditation-specialist to produce a survey readiness gap plan with standards, evidence, tracers, and owners.

Codex: Draft a survey readiness workup with standard set, site, prior findings, open actions, and leadership briefing.

GitHub Copilot: Create a survey readiness prompt or issue template with evidence tasks and acceptance criteria.

Microsoft 365 Copilot: Use approved survey documents and produce a governed survey readiness briefing.
