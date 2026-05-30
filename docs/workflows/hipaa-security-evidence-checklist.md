# HIPAA Security Evidence Checklist

Prepare an evidence checklist and gap register for a HIPAA audit, vendor security review, policy refresh, or questionnaire.

Primary specialist: `quality-compliance-officer`
Supporting handoffs: `healthit-information-manager`, `quality-risk-manager`, `payer-relations-specialist`
Output artifact: evidence checklist and gap register

## Example Input

> Prepare a HIPAA evidence checklist for a vendor security review.

## Required Context

- entity type
- system scope
- vendor involvement
- current controls
- requested framework

## Red Flags

- possible breach
- missing BAA
- unapproved PHI sharing
- critical control gap
- regulator deadline

## Example Output

```markdown
# HIPAA Security Evidence Checklist

Problem: Prepare a HIPAA evidence checklist for a vendor security review.
Confidence: 0.73
Rationale: matched triggers: HIPAA; primary specialist: quality-compliance-officer; artifact: evidence checklist and gap register; next closest workflow: prior-authorization-appeal-workup; routing score: 75

## Roles
- Primary: quality-compliance-officer
- Handoffs: healthit-information-manager, quality-risk-manager, payer-relations-specialist

## Missing Questions
- What is the entity type?
- What is the system scope?
- What is the current controls?
- What is the requested framework?

## Evidence To Collect
- entity type
- system scope
- vendor involvement
- current controls
- requested framework
- prior risk analysis
- policies
- access review
- incident history
- BAA status

## evidence checklist and gap register
### Scope
Add scope details using approved local evidence, assumptions, owner, and review status.

### Evidence map
Add evidence map details using approved local evidence, assumptions, owner, and review status.

### Gap register
Add gap register details using approved local evidence, assumptions, owner, and review status.

### Responsible owners
Add responsible owners details using approved local evidence, assumptions, owner, and review status.

### Collection timeline
Add collection timeline details using approved local evidence, assumptions, owner, and review status.

### Review sign-off
Add review sign-off details using approved local evidence, assumptions, owner, and review status.

## Red Flags
- possible breach
- missing BAA
- unapproved PHI sharing
- critical control gap
- regulator deadline

## Safety
- Healthcare Agents provides healthcare administration decision support only. Do not use it for diagnosis, treatment, emergency guidance, or final clinical decision-making.
- Do not include direct patient identifiers or PHI unless you are working in a locally approved, governed environment and can apply minimum necessary data handling.
- Validate all outputs against local policy, payer contracts, applicable laws, and the accountable human owner before action.
- Escalate final clinical, legal, coding, billing, audit, compliance, contracting, employment, security, and executive decisions to qualified human owners.

## Platform Prompt
Produce a HIPAA evidence checklist with scope, evidence map, gaps, owners, and collection timeline.

Problem: Prepare a HIPAA evidence checklist for a vendor security review.

Return the evidence checklist and gap register with required context, missing inputs, handoffs, safety constraints, and a quality checklist.
```

## Platform Prompts

Claude: Use quality-compliance-officer for a HIPAA evidence checklist and name privacy, legal, and IT security handoffs.

Codex: Produce a HIPAA evidence checklist with scope, evidence map, gaps, owners, and collection timeline.

GitHub Copilot: Generate a compliance evidence checklist prompt with PHI cautions, controls, owners, and acceptance criteria.

Microsoft 365 Copilot: Use governed policy and control documents; do not store hidden instructions in SharePoint knowledge files.
