# Discharge Barrier Workplan

Convert discharge delays, avoidable days, placement barriers, DME delays, or family decision delays into a daily action plan.

Primary specialist: `clinical-case-manager`
Supporting handoffs: `clinical-utilization-management-specialist`, `clinical-care-management-specialist`, `revenue-finance-manager`
Output artifact: discharge barrier action plan

## Example Input

> Our discharge delays are mostly awaiting SNF placement and family decisions.

## Required Context

- barrier categories
- service line
- payer mix
- avoidable days
- escalation rules

## Red Flags

- unsafe discharge risk
- patient rights concern
- avoidable day escalation
- payer denial risk

## Example Output

```markdown
# Discharge Barrier Workplan

Problem: Our discharge delays are mostly awaiting SNF placement and family decisions.
Confidence: 0.83
Rationale: matched triggers: discharge delay, SNF placement, family decision; primary specialist: clinical-case-manager; artifact: discharge barrier action plan; next closest workflow: clinical-dashboard-specification; routing score: 117

## Roles
- Primary: clinical-case-manager
- Handoffs: clinical-utilization-management-specialist, clinical-care-management-specialist, revenue-finance-manager

## Missing Questions
- What is the barrier categories?
- What is the service line?
- What is the payer mix?
- What is the avoidable days?
- What is the escalation rules?

## Evidence To Collect
- barrier categories
- service line
- payer mix
- avoidable days
- escalation rules
- post-acute network constraints
- patient choice process
- DME vendor list
- daily huddle cadence

## discharge barrier action plan
### Barrier taxonomy
Add barrier taxonomy details using approved local evidence, assumptions, owner, and review status.

### Immediate next actions
Add immediate next actions details using approved local evidence, assumptions, owner, and review status.

### Owner list
Add owner list details using approved local evidence, assumptions, owner, and review status.

### Daily huddle script
Add daily huddle script details using approved local evidence, assumptions, owner, and review status.

### Escalation triggers
Add escalation triggers details using approved local evidence, assumptions, owner, and review status.

### KPI plan
Add kpi plan details using approved local evidence, assumptions, owner, and review status.

## Red Flags
- unsafe discharge risk
- patient rights concern
- avoidable day escalation
- payer denial risk

## Safety
- Healthcare Agents provides healthcare administration decision support only. Do not use it for diagnosis, treatment, emergency guidance, or final clinical decision-making.
- Do not include direct patient identifiers or PHI unless you are working in a locally approved, governed environment and can apply minimum necessary data handling.
- Validate all outputs against local policy, payer contracts, applicable laws, and the accountable human owner before action.
- Escalate final clinical, legal, coding, billing, audit, compliance, contracting, employment, security, and executive decisions to qualified human owners.

## Platform Prompt
Produce a barrier taxonomy, owner matrix, huddle script, and KPI plan for discharge delay work.

Problem: Our discharge delays are mostly awaiting SNF placement and family decisions.

Return the discharge barrier action plan with required context, missing inputs, handoffs, safety constraints, and a quality checklist.
```

## Platform Prompts

Claude: Use clinical-case-manager to build a discharge barrier action plan and require clinical ownership for discharge decisions.

Codex: Produce a barrier taxonomy, owner matrix, huddle script, and KPI plan for discharge delay work.

GitHub Copilot: Draft a discharge barrier workplan issue with barrier categories, owners, acceptance criteria, and patient-rights safety notes.

Microsoft 365 Copilot: Use de-identified operational data where possible and produce a Teams-ready discharge barrier briefing.
