# HL7 or FHIR Interface Incident

Triage interface failures, feed latency, mapping errors, data quality defects, or possible PHI exposure into an incident workup.

Primary specialist: `healthit-interoperability-engineer`
Supporting handoffs: `healthit-clinical-data-analyst`, `healthit-information-manager`, `quality-compliance-officer`
Output artifact: interface incident workup

## Example Input

> HL7 ADT interface is failing ACKs and patient matching errors are affecting downstream workflows.

## Required Context

- system names
- message type or resource
- failure mode
- timeline
- affected workflows

## Red Flags

- possible PHI exposure
- patient safety workflow impact
- downtime procedure needed
- vendor escalation required

## Example Output

```markdown
# HL7 or FHIR Interface Incident

Problem: HL7 ADT interface is failing ACKs and patient matching errors are affecting downstream workflows.
Confidence: 0.8
Rationale: matched triggers: HL7, ADT; primary specialist: healthit-interoperability-engineer; artifact: interface incident workup; next closest workflow: hedis-stars-gap-closure-sprint; routing score: 90

## Roles
- Primary: healthit-interoperability-engineer
- Handoffs: healthit-clinical-data-analyst, healthit-information-manager, quality-compliance-officer

## Missing Questions
- What is the system names?
- What is the message type or resource?
- What is the failure mode?
- What is the timeline?

## Evidence To Collect
- system names
- message type or resource
- failure mode
- timeline
- affected workflows
- sample de-identified message
- interface engine logs
- mapping table
- recent deployment

## interface incident workup
### Incident summary
Add incident summary details using approved local evidence, assumptions, owner, and review status.

### Triage checklist
Add triage checklist details using approved local evidence, assumptions, owner, and review status.

### Evidence to collect
Add evidence to collect details using approved local evidence, assumptions, owner, and review status.

### Communications
Add communications details using approved local evidence, assumptions, owner, and review status.

### Root-cause hypotheses
Add root-cause hypotheses details using approved local evidence, assumptions, owner, and review status.

### Remediation plan
Add remediation plan details using approved local evidence, assumptions, owner, and review status.

## Red Flags
- possible PHI exposure
- patient safety workflow impact
- downtime procedure needed
- vendor escalation required

## Safety
- Healthcare Agents provides healthcare administration decision support only. Do not use it for diagnosis, treatment, emergency guidance, or final clinical decision-making.
- Do not include direct patient identifiers or PHI unless you are working in a locally approved, governed environment and can apply minimum necessary data handling.
- Validate all outputs against local policy, payer contracts, applicable laws, and the accountable human owner before action.
- Escalate final clinical, legal, coding, billing, audit, compliance, contracting, employment, security, and executive decisions to qualified human owners.

## Platform Prompt
Produce an HL7/FHIR incident workup with system names, message type, failure mode, timeline, and remediation plan.

Problem: HL7 ADT interface is failing ACKs and patient matching errors are affecting downstream workflows.

Return the interface incident workup with required context, missing inputs, handoffs, safety constraints, and a quality checklist.
```

## Platform Prompts

Claude: Use healthit-interoperability-engineer for an interface incident workup and escalate PHI/security concerns to compliance.

Codex: Produce an HL7/FHIR incident workup with system names, message type, failure mode, timeline, and remediation plan.

GitHub Copilot: Create an interface incident issue template with logs, mapping evidence, affected workflows, and acceptance criteria.

Microsoft 365 Copilot: Use approved incident records and keep sample messages de-identified unless governed.
