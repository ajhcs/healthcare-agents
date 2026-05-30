# Clinical Dashboard Specification

Turn a disputed or requested clinical/operational dashboard into metric definitions, grain, filters, validation plan, and ownership.

Primary specialist: `healthit-clinical-data-analyst`
Supporting handoffs: `operations-hospital-administrator`, `quality-improvement-specialist`, `revenue-finance-manager`
Output artifact: dashboard requirements spec

## Example Input

> Leadership wants a clinical dashboard but KPI definitions conflict and users distrust the current report.

## Required Context

- decision owner
- decisions supported
- metrics
- data sources
- cadence

## Red Flags

- metric definition conflict
- unvalidated source
- patient-level PHI exposure
- executive decision risk

## Example Output

```markdown
# Clinical Dashboard Specification

Problem: Leadership wants a clinical dashboard but KPI definitions conflict and users distrust the current report.
Confidence: 0.82
Rationale: matched triggers: dashboard, KPI definitions, leadership wants; primary specialist: healthit-clinical-data-analyst; artifact: dashboard requirements spec; next closest workflow: clean-claim-rate-decline; routing score: 133

## Roles
- Primary: healthit-clinical-data-analyst
- Handoffs: operations-hospital-administrator, quality-improvement-specialist, revenue-finance-manager

## Missing Questions
- What is the decision owner?
- What is the decisions supported?
- What is the metrics?
- What is the data sources?
- What is the cadence?

## Evidence To Collect
- decision owner
- decisions supported
- metrics
- data sources
- cadence
- filters
- grain
- refresh latency
- known disputes
- source-of-truth owner

## dashboard requirements spec
### Decision context
Add decision context details using approved local evidence, assumptions, owner, and review status.

### Metric definitions
Add metric definitions details using approved local evidence, assumptions, owner, and review status.

### Data grain and filters
Add data grain and filters details using approved local evidence, assumptions, owner, and review status.

### Mock table
Add mock table details using approved local evidence, assumptions, owner, and review status.

### Validation plan
Add validation plan details using approved local evidence, assumptions, owner, and review status.

### Owner sign-off
Add owner sign-off details using approved local evidence, assumptions, owner, and review status.

## Red Flags
- metric definition conflict
- unvalidated source
- patient-level PHI exposure
- executive decision risk

## Safety
- Healthcare Agents provides healthcare administration decision support only. Do not use it for diagnosis, treatment, emergency guidance, or final clinical decision-making.
- Do not include direct patient identifiers or PHI unless you are working in a locally approved, governed environment and can apply minimum necessary data handling.
- Validate all outputs against local policy, payer contracts, applicable laws, and the accountable human owner before action.
- Escalate final clinical, legal, coding, billing, audit, compliance, contracting, employment, security, and executive decisions to qualified human owners.

## Platform Prompt
Draft a dashboard requirements spec with decisions supported, metrics, data sources, cadence, and validation plan.

Problem: Leadership wants a clinical dashboard but KPI definitions conflict and users distrust the current report.

Return the dashboard requirements spec with required context, missing inputs, handoffs, safety constraints, and a quality checklist.
```

## Platform Prompts

Claude: Use healthit-clinical-data-analyst to specify a dashboard with metric definitions, grain, filters, validation, and owner sign-off.

Codex: Draft a dashboard requirements spec with decisions supported, metrics, data sources, cadence, and validation plan.

GitHub Copilot: Create a dashboard spec prompt or issue with metric definitions, acceptance criteria, and data validation tasks.

Microsoft 365 Copilot: Use governed data catalog references and produce a dashboard spec for review, not patient-level disclosure.
