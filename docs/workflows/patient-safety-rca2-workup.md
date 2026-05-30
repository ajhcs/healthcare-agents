# Patient Safety RCA2 Workup

Organize serious safety event, near miss, or sentinel-event-style review preparation into an RCA2-style planning packet.

Primary specialist: `quality-patient-safety-officer`
Supporting handoffs: `quality-risk-manager`, `quality-improvement-specialist`, `operations-hospital-administrator`
Output artifact: RCA2-style planning packet

## Example Input

> Create an RCA2 workup plan for a serious safety event with a partial timeline and immediate containment.

## Required Context

- event summary
- timeline
- harm level
- involved processes
- immediate containment

## Red Flags

- ongoing safety risk
- mandatory reporting question
- legal privilege concern
- media or regulator sensitivity

## Example Output

```markdown
# Patient Safety RCA2 Workup

Problem: Create an RCA2 workup plan for a serious safety event with a partial timeline and immediate containment.
Confidence: 0.79
Rationale: matched triggers: RCA2, serious safety event; primary specialist: quality-patient-safety-officer; artifact: RCA2-style planning packet; next closest workflow: hl7-fhir-interface-incident; routing score: 120

## Roles
- Primary: quality-patient-safety-officer
- Handoffs: quality-risk-manager, quality-improvement-specialist, operations-hospital-administrator

## Missing Questions
- What is the harm level?
- What is the involved processes?

## Evidence To Collect
- event summary
- timeline
- harm level
- involved processes
- immediate containment
- interview list
- policy references
- equipment or staffing context
- prior similar events

## RCA2-style planning packet
### Fact-gathering plan
Add fact-gathering plan details using approved local evidence, assumptions, owner, and review status.

### Timeline gaps
Add timeline gaps details using approved local evidence, assumptions, owner, and review status.

### Causal factor categories
Add causal factor categories details using approved local evidence, assumptions, owner, and review status.

### Interview guide
Add interview guide details using approved local evidence, assumptions, owner, and review status.

### Action strength checklist
Add action strength checklist details using approved local evidence, assumptions, owner, and review status.

### Escalation notes
Add escalation notes details using approved local evidence, assumptions, owner, and review status.

## Red Flags
- ongoing safety risk
- mandatory reporting question
- legal privilege concern
- media or regulator sensitivity

## Safety
- Healthcare Agents provides healthcare administration decision support only. Do not use it for diagnosis, treatment, emergency guidance, or final clinical decision-making.
- Do not include direct patient identifiers or PHI unless you are working in a locally approved, governed environment and can apply minimum necessary data handling.
- Validate all outputs against local policy, payer contracts, applicable laws, and the accountable human owner before action.
- Escalate final clinical, legal, coding, billing, audit, compliance, contracting, employment, security, and executive decisions to qualified human owners.

## Platform Prompt
Produce an RCA2 planning packet with event facts, timeline gaps, interview guide, and action-strength checklist.

Problem: Create an RCA2 workup plan for a serious safety event with a partial timeline and immediate containment.

Return the RCA2-style planning packet with required context, missing inputs, handoffs, safety constraints, and a quality checklist.
```

## Platform Prompts

Claude: Use quality-patient-safety-officer and keep RCA2 output fact-focused, blame-free, and reviewed by safety/risk leadership.

Codex: Produce an RCA2 planning packet with event facts, timeline gaps, interview guide, and action-strength checklist.

GitHub Copilot: Draft a patient safety RCA2 workup prompt with non-PHI facts, owners, acceptance criteria, and escalation notes.

Microsoft 365 Copilot: Use approved safety event materials only and maintain privilege/governance cautions.
