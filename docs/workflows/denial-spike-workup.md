# Revenue Cycle Denial Spike Workup

Triage a denial-rate increase, payer policy shift, AR aging issue, or write-off spike into an evidence-backed recovery plan.

Primary specialist: `revenue-cycle-specialist`
Supporting handoffs: `revenue-contract-analyst`, `healthit-clinical-data-analyst`, `quality-compliance-officer`
Output artifact: denial spike triage brief

## Example Input

> Commercial payer denial rate jumped 18 percent after a policy change and our AR days are climbing.

## Required Context

- payer or product
- denial codes or reason categories
- timeframe and baseline
- service lines affected
- estimated dollar exposure
- current appeal status

## Red Flags

- possible coding compliance risk
- payer policy retroactivity
- large dollar exposure
- patient access impact
- appeal deadline risk

## Example Output

```markdown
# Revenue Cycle Denial Spike Workup

Problem: Commercial payer denial rate jumped 18 percent after a policy change and our AR days are climbing.
Confidence: 0.72
Rationale: matched triggers: denial rate, AR days; primary specialist: revenue-cycle-specialist; artifact: denial spike triage brief; next closest workflow: prior-authorization-appeal-workup; routing score: 106

## Roles
- Primary: revenue-cycle-specialist
- Handoffs: revenue-contract-analyst, healthit-clinical-data-analyst, quality-compliance-officer

## Missing Questions
- What is the timeframe and baseline?
- What is the service lines affected?
- What is the estimated dollar exposure?
- What is the current appeal status?

## Evidence To Collect
- payer or product
- denial codes or reason categories
- timeframe and baseline
- service lines affected
- estimated dollar exposure
- current appeal status
- sample remits
- policy citation
- clearinghouse edits
- coding audit notes
- contract language

## denial spike triage brief
### Executive summary
Add executive summary details using approved local evidence, assumptions, owner, and review status.

### Trend and exposure
Add trend and exposure details using approved local evidence, assumptions, owner, and review status.

### Root-cause hypotheses
Add root-cause hypotheses details using approved local evidence, assumptions, owner, and review status.

### Evidence pull list
Add evidence pull list details using approved local evidence, assumptions, owner, and review status.

### Appeal and escalation strategy
Add appeal and escalation strategy details using approved local evidence, assumptions, owner, and review status.

### Owner matrix
Add owner matrix details using approved local evidence, assumptions, owner, and review status.

### Monitoring plan
Add monitoring plan details using approved local evidence, assumptions, owner, and review status.

## Red Flags
- possible coding compliance risk
- payer policy retroactivity
- large dollar exposure
- patient access impact
- appeal deadline risk

## Safety
- Healthcare Agents provides healthcare administration decision support only. Do not use it for diagnosis, treatment, emergency guidance, or final clinical decision-making.
- Do not include direct patient identifiers or PHI unless you are working in a locally approved, governed environment and can apply minimum necessary data handling.
- Validate all outputs against local policy, payer contracts, applicable laws, and the accountable human owner before action.
- Escalate final clinical, legal, coding, billing, audit, compliance, contracting, employment, security, and executive decisions to qualified human owners.

## Platform Prompt
Read the revenue-cycle-specialist prompt first, then produce a structured denial spike triage brief with missing inputs, evidence pulls, handoffs, and safety constraints.

Problem: Commercial payer denial rate jumped 18 percent after a policy change and our AR days are climbing.

Return the denial spike triage brief with required context, missing inputs, handoffs, safety constraints, and a quality checklist.
```

## Platform Prompts

Claude: Use the revenue-cycle-specialist as primary for a denial spike workup. Ask for payer, denial codes, timeframe, service lines, exposure, and appeal status before drafting the triage brief.

Codex: Read the revenue-cycle-specialist prompt first, then produce a structured denial spike triage brief with missing inputs, evidence pulls, handoffs, and safety constraints.

GitHub Copilot: Create a scoped denial spike workup issue or prompt packet with acceptance criteria, evidence requests, and revenue-cycle/compliance handoffs.

Microsoft 365 Copilot: Use governed tenant data only. Produce an executive denial spike triage brief and clearly separate instructions, knowledge sources, and action placeholders.
