# Value-Based Care Downside Risk Readiness

Assess readiness for a new or troubled downside-risk contract across quality, cost, attribution, care management, and governance.

Primary specialist: `payer-value-based-care-manager`
Supporting handoffs: `pophealth-population-health-manager`, `revenue-finance-manager`, `healthit-clinical-data-analyst`
Output artifact: downside-risk readiness memo

## Example Input

> We are entering downside risk and need readiness across quality measures, cost benchmark, and care management.

## Required Context

- contract model
- attributed lives
- quality measures
- cost benchmark
- care management model

## Red Flags

- unbounded downside exposure
- data lag
- unclear attribution
- quality penalty risk

## Example Output

```markdown
# Value-Based Care Downside Risk Readiness

Problem: We are entering downside risk and need readiness across quality measures, cost benchmark, and care management.
Confidence: 0.77
Rationale: matched triggers: downside risk, quality measures, cost benchmark; primary specialist: payer-value-based-care-manager; artifact: downside-risk readiness memo; next closest workflow: hedis-stars-gap-closure-sprint; routing score: 161

## Roles
- Primary: payer-value-based-care-manager
- Handoffs: pophealth-population-health-manager, revenue-finance-manager, healthit-clinical-data-analyst

## Missing Questions
- What is the contract model?
- What is the attributed lives?

## Evidence To Collect
- contract model
- attributed lives
- quality measures
- cost benchmark
- care management model
- stop-loss terms
- high-risk cohort
- network leakage
- payer reporting cadence

## downside-risk readiness memo
### Risk register
Add risk register details using approved local evidence, assumptions, owner, and review status.

### Intervention map
Add intervention map details using approved local evidence, assumptions, owner, and review status.

### Data gaps
Add data gaps details using approved local evidence, assumptions, owner, and review status.

### Governance cadence
Add governance cadence details using approved local evidence, assumptions, owner, and review status.

### Decision points
Add decision points details using approved local evidence, assumptions, owner, and review status.

## Red Flags
- unbounded downside exposure
- data lag
- unclear attribution
- quality penalty risk

## Safety
- Healthcare Agents provides healthcare administration decision support only. Do not use it for diagnosis, treatment, emergency guidance, or final clinical decision-making.
- Do not include direct patient identifiers or PHI unless you are working in a locally approved, governed environment and can apply minimum necessary data handling.
- Validate all outputs against local policy, payer contracts, applicable laws, and the accountable human owner before action.
- Escalate final clinical, legal, coding, billing, audit, compliance, contracting, employment, security, and executive decisions to qualified human owners.

## Platform Prompt
Draft a VBC risk readiness memo with contract model, lives, quality, cost, data gaps, and governance cadence.

Problem: We are entering downside risk and need readiness across quality measures, cost benchmark, and care management.

Return the downside-risk readiness memo with required context, missing inputs, handoffs, safety constraints, and a quality checklist.
```

## Platform Prompts

Claude: Use payer-value-based-care-manager to produce a downside-risk readiness memo with finance, population health, and analytics handoffs.

Codex: Draft a VBC risk readiness memo with contract model, lives, quality, cost, data gaps, and governance cadence.

GitHub Copilot: Create a value-based care readiness prompt with required inputs and acceptance criteria.

Microsoft 365 Copilot: Use governed payer and population health reports to produce an executive readiness memo.
