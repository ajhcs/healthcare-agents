# ED Boarding and Capacity Workup

Triage ED boarding, throughput issues, inpatient bed constraints, staffing limits, or ambulance diversion risk into a command-center brief.

Primary specialist: `operations-hospital-administrator`
Supporting handoffs: `clinical-case-manager`, `revenue-finance-manager`, `healthit-clinical-data-analyst`
Output artifact: capacity command-center brief

## Example Input

> ED boarding hours are rising because inpatient bed capacity and discharge timing are constrained.

## Required Context

- boarding hours
- arrival and admission rates
- discharge timing
- bed types
- staffing constraints

## Red Flags

- ambulance diversion risk
- unsafe staffing concern
- regulatory reporting issue
- high occupancy escalation

## Example Output

```markdown
# ED Boarding and Capacity Workup

Problem: ED boarding hours are rising because inpatient bed capacity and discharge timing are constrained.
Confidence: 0.86
Rationale: matched triggers: ED boarding, bed capacity, boarding hours; primary specialist: operations-hospital-administrator; artifact: capacity command-center brief; next closest workflow: discharge-barrier-workplan; routing score: 142

## Roles
- Primary: operations-hospital-administrator
- Handoffs: clinical-case-manager, revenue-finance-manager, healthit-clinical-data-analyst

## Missing Questions
- What is the arrival and admission rates?
- What is the staffing constraints?

## Evidence To Collect
- boarding hours
- arrival and admission rates
- discharge timing
- bed types
- staffing constraints
- transfer data
- diversion policy
- surge plan
- command center cadence

## capacity command-center brief
### Bottleneck map
Add bottleneck map details using approved local evidence, assumptions, owner, and review status.

### Immediate operational moves
Add immediate operational moves details using approved local evidence, assumptions, owner, and review status.

### Escalation triggers
Add escalation triggers details using approved local evidence, assumptions, owner, and review status.

### Metric dashboard spec
Add metric dashboard spec details using approved local evidence, assumptions, owner, and review status.

### Leadership update
Add leadership update details using approved local evidence, assumptions, owner, and review status.

## Red Flags
- ambulance diversion risk
- unsafe staffing concern
- regulatory reporting issue
- high occupancy escalation

## Safety
- Healthcare Agents provides healthcare administration decision support only. Do not use it for diagnosis, treatment, emergency guidance, or final clinical decision-making.
- Do not include direct patient identifiers or PHI unless you are working in a locally approved, governed environment and can apply minimum necessary data handling.
- Validate all outputs against local policy, payer contracts, applicable laws, and the accountable human owner before action.
- Escalate final clinical, legal, coding, billing, audit, compliance, contracting, employment, security, and executive decisions to qualified human owners.
- Do not use this workflow for emergency medical guidance. Follow local emergency, clinical, compliance, and incident-command procedures.

## Platform Prompt
Produce a capacity workup with bottlenecks, immediate moves, metrics, and command-center update format.

Problem: ED boarding hours are rising because inpatient bed capacity and discharge timing are constrained.

Return the capacity command-center brief with required context, missing inputs, handoffs, safety constraints, and a quality checklist.
```

## Platform Prompts

Claude: Use operations-hospital-administrator to build an ED boarding capacity brief with operational owners and safety escalation triggers.

Codex: Produce a capacity workup with bottlenecks, immediate moves, metrics, and command-center update format.

GitHub Copilot: Create an ED capacity workup prompt with data inputs, owners, and acceptance criteria.

Microsoft 365 Copilot: Use governed operations reports and produce a Teams-ready command-center brief.
