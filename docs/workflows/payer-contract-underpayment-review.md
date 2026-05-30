# Payer Contract Underpayment Review

Prepare an underpayment evidence packet for suspected payment variance, fee schedule mismatch, contract renewal, or payer dispute.

Primary specialist: `revenue-contract-analyst`
Supporting handoffs: `revenue-cycle-specialist`, `revenue-finance-manager`, `payer-relations-specialist`
Output artifact: underpayment evidence packet

## Example Input

> Claims are being underpaid against the payer contract and allowed amounts do not match the fee schedule.

## Required Context

- contract terms
- allowed amounts
- billed charges
- payment history
- carve-outs or exclusions

## Red Flags

- legal dispute posture
- large recurring variance
- contract ambiguity
- timely filing or dispute deadline

## Example Output

```markdown
# Payer Contract Underpayment Review

Problem: Claims are being underpaid against the payer contract and allowed amounts do not match the fee schedule.
Confidence: 0.75
Rationale: matched triggers: fee schedule, allowed amount; primary specialist: revenue-contract-analyst; artifact: underpayment evidence packet; next closest workflow: pharmacy-contract-scorecard; routing score: 102

## Roles
- Primary: revenue-contract-analyst
- Handoffs: revenue-cycle-specialist, revenue-finance-manager, payer-relations-specialist

## Missing Questions
- What is the billed charges?
- What is the payment history?
- What is the carve-outs or exclusions?

## Evidence To Collect
- contract terms
- allowed amounts
- billed charges
- payment history
- carve-outs or exclusions
- 835 sample
- contract amendment
- fee schedule
- payer correspondence

## underpayment evidence packet
### Variance logic
Add variance logic details using approved local evidence, assumptions, owner, and review status.

### Evidence table
Add evidence table details using approved local evidence, assumptions, owner, and review status.

### Contract citation map
Add contract citation map details using approved local evidence, assumptions, owner, and review status.

### Payer dispute letter scaffold
Add payer dispute letter scaffold details using approved local evidence, assumptions, owner, and review status.

### Negotiation talking points
Add negotiation talking points details using approved local evidence, assumptions, owner, and review status.

## Red Flags
- legal dispute posture
- large recurring variance
- contract ambiguity
- timely filing or dispute deadline

## Safety
- Healthcare Agents provides healthcare administration decision support only. Do not use it for diagnosis, treatment, emergency guidance, or final clinical decision-making.
- Do not include direct patient identifiers or PHI unless you are working in a locally approved, governed environment and can apply minimum necessary data handling.
- Validate all outputs against local policy, payer contracts, applicable laws, and the accountable human owner before action.
- Escalate final clinical, legal, coding, billing, audit, compliance, contracting, employment, security, and executive decisions to qualified human owners.

## Platform Prompt
Produce a defensible underpayment review with data assumptions, evidence table, and payer escalation handoffs.

Problem: Claims are being underpaid against the payer contract and allowed amounts do not match the fee schedule.

Return the underpayment evidence packet with required context, missing inputs, handoffs, safety constraints, and a quality checklist.
```

## Platform Prompts

Claude: Use revenue-contract-analyst as primary and build an underpayment evidence packet from contract terms, payments, and variance rules.

Codex: Produce a defensible underpayment review with data assumptions, evidence table, and payer escalation handoffs.

GitHub Copilot: Create a payer underpayment analysis prompt file or issue with contract inputs, expected calculations, and acceptance criteria.

Microsoft 365 Copilot: Use approved finance and contract sources only and produce an admin-reviewed underpayment memo.
