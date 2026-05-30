# Prior Authorization Appeal Workup

Organize a non-clinical prior authorization denial or delayed authorization into appeal evidence, missing documentation, and escalation steps.

Primary specialist: `clinical-prior-authorization-specialist`
Supporting handoffs: `clinical-care-management-specialist`, `quality-compliance-officer`, `clinical-utilization-management-specialist`
Output artifact: appeal workup and documentation checklist

## Example Input

> Prepare a prior authorization appeal workup after a payer denied the requested service for medical necessity.

## Required Context

- payer
- service or item
- denial reason
- policy citation
- documentation available

## Red Flags

- urgent care delay
- appeal deadline
- medical necessity dispute needing licensed review
- potential adverse patient impact

## Example Output

```markdown
# Prior Authorization Appeal Workup

Problem: Prepare a prior authorization appeal workup after a payer denied the requested service for medical necessity.
Confidence: 0.77
Rationale: matched triggers: prior authorization; primary specialist: clinical-prior-authorization-specialist; artifact: appeal workup and documentation checklist; next closest workflow: denial-spike-workup; routing score: 156

## Roles
- Primary: clinical-prior-authorization-specialist
- Handoffs: clinical-care-management-specialist, quality-compliance-officer, clinical-utilization-management-specialist

## Missing Questions
- What is the denial reason?
- What is the policy citation?
- What is the documentation available?

## Evidence To Collect
- payer
- service or item
- denial reason
- policy citation
- documentation available
- deadline
- peer-to-peer status
- coverage policy
- prior similar approvals

## appeal workup and documentation checklist
### Case restatement
Add case restatement details using approved local evidence, assumptions, owner, and review status.

### Payer criteria map
Add payer criteria map details using approved local evidence, assumptions, owner, and review status.

### Missing documentation
Add missing documentation details using approved local evidence, assumptions, owner, and review status.

### Non-clinical appeal structure
Add non-clinical appeal structure details using approved local evidence, assumptions, owner, and review status.

### Escalation path
Add escalation path details using approved local evidence, assumptions, owner, and review status.

### Review checklist
Add review checklist details using approved local evidence, assumptions, owner, and review status.

## Red Flags
- urgent care delay
- appeal deadline
- medical necessity dispute needing licensed review
- potential adverse patient impact

## Safety
- Healthcare Agents provides healthcare administration decision support only. Do not use it for diagnosis, treatment, emergency guidance, or final clinical decision-making.
- Do not include direct patient identifiers or PHI unless you are working in a locally approved, governed environment and can apply minimum necessary data handling.
- Validate all outputs against local policy, payer contracts, applicable laws, and the accountable human owner before action.
- Escalate final clinical, legal, coding, billing, audit, compliance, contracting, employment, security, and executive decisions to qualified human owners.

## Platform Prompt
Draft a prior authorization appeal workup that asks for payer, service, denial reason, policy citation, and available documentation.

Problem: Prepare a prior authorization appeal workup after a payer denied the requested service for medical necessity.

Return the appeal workup and documentation checklist with required context, missing inputs, handoffs, safety constraints, and a quality checklist.
```

## Platform Prompts

Claude: Use clinical-prior-authorization-specialist and keep the output administrative, with clinician review for medical necessity.

Codex: Draft a prior authorization appeal workup that asks for payer, service, denial reason, policy citation, and available documentation.

GitHub Copilot: Generate a scoped appeal workup prompt with required inputs, acceptance criteria, and licensed-review checkpoints.

Microsoft 365 Copilot: Use approved case materials and keep the artifact as administrative appeal support, not clinical judgment.
