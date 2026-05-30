# PBM or Pharmacy Contract Scorecard

Frame pharmacy spend, PBM terms, rebate questions, formulary performance, specialty spend, and negotiation evidence into a scorecard.

Primary specialist: `pharmacy-benefits-specialist`
Supporting handoffs: `revenue-finance-manager`, `revenue-contract-analyst`, `healthit-clinical-data-analyst`
Output artifact: pharmacy contract scorecard

## Example Input

> PBM rebate and specialty pharmacy spend need a contract performance scorecard.

## Required Context

- contract terms
- utilization
- rebate terms
- specialty spend
- claims sample

## Red Flags

- legal contract dispute
- clinical formulary governance needed
- large unvalidated savings claim
- PHI in claims sample

## Example Output

```markdown
# PBM or Pharmacy Contract Scorecard

Problem: PBM rebate and specialty pharmacy spend need a contract performance scorecard.
Confidence: 0.85
Rationale: matched triggers: PBM, rebate, pharmacy spend; primary specialist: pharmacy-benefits-specialist; artifact: pharmacy contract scorecard; next closest workflow: payer-contract-underpayment-review; routing score: 153

## Roles
- Primary: pharmacy-benefits-specialist
- Handoffs: revenue-finance-manager, revenue-contract-analyst, healthit-clinical-data-analyst

## Missing Questions
- What is the utilization?
- What is the claims sample?

## Evidence To Collect
- contract terms
- utilization
- rebate terms
- specialty spend
- claims sample
- formulary tier data
- guarantees
- audit rights
- spread pricing terms

## pharmacy contract scorecard
### Scorecard structure
Add scorecard structure details using approved local evidence, assumptions, owner, and review status.

### Data request list
Add data request list details using approved local evidence, assumptions, owner, and review status.

### Variance hypotheses
Add variance hypotheses details using approved local evidence, assumptions, owner, and review status.

### Rebate and specialty spend review
Add rebate and specialty spend review details using approved local evidence, assumptions, owner, and review status.

### Negotiation points
Add negotiation points details using approved local evidence, assumptions, owner, and review status.

## Red Flags
- legal contract dispute
- clinical formulary governance needed
- large unvalidated savings claim
- PHI in claims sample

## Safety
- Healthcare Agents provides healthcare administration decision support only. Do not use it for diagnosis, treatment, emergency guidance, or final clinical decision-making.
- Do not include direct patient identifiers or PHI unless you are working in a locally approved, governed environment and can apply minimum necessary data handling.
- Validate all outputs against local policy, payer contracts, applicable laws, and the accountable human owner before action.
- Escalate final clinical, legal, coding, billing, audit, compliance, contracting, employment, security, and executive decisions to qualified human owners.

## Platform Prompt
Produce a pharmacy contract scorecard with terms, utilization, rebates, specialty spend, and data requests.

Problem: PBM rebate and specialty pharmacy spend need a contract performance scorecard.

Return the pharmacy contract scorecard with required context, missing inputs, handoffs, safety constraints, and a quality checklist.
```

## Platform Prompts

Claude: Use pharmacy-benefits-specialist for a PBM/pharmacy contract scorecard and hand off legal/finance decisions.

Codex: Produce a pharmacy contract scorecard with terms, utilization, rebates, specialty spend, and data requests.

GitHub Copilot: Create a PBM scorecard prompt with contract inputs, data pulls, acceptance criteria, and governance notes.

Microsoft 365 Copilot: Use approved pharmacy and contract sources and keep patient claims de-identified unless governed.
