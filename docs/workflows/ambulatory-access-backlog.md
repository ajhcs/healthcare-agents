# Ambulatory Access Backlog

Plan recovery for specialty access backlog, referral queue growth, template design problems, or no-show pressure.

Primary specialist: `operations-ambulatory-manager`
Supporting handoffs: `healthit-clinical-data-analyst`, `clinical-referral-specialist`, `operations-physician-practice-manager`
Output artifact: access recovery plan

## Example Input

> Dermatology third-next-available is 120 days and referrals are backing up.

## Required Context

- specialty
- backlog size
- template design
- referral sources
- no-show rate

## Red Flags

- clinically urgent referrals waiting
- access equity concern
- provider burnout risk
- payer network adequacy issue

## Example Output

```markdown
# Ambulatory Access Backlog

Problem: Dermatology third-next-available is 120 days and referrals are backing up.
Confidence: 0.66
Rationale: matched triggers: third next available; primary specialist: operations-ambulatory-manager; artifact: access recovery plan; next closest workflow: discharge-barrier-workplan; routing score: 49

## Roles
- Primary: operations-ambulatory-manager
- Handoffs: healthit-clinical-data-analyst, clinical-referral-specialist, operations-physician-practice-manager

## Missing Questions
- What is the specialty?
- What is the backlog size?
- What is the template design?
- What is the no-show rate?

## Evidence To Collect
- specialty
- backlog size
- template design
- referral sources
- no-show rate
- provider FTE
- visit types
- slot utilization
- scheduling rules
- patient outreach channels

## access recovery plan
### Demand and capacity view
Add demand and capacity view details using approved local evidence, assumptions, owner, and review status.

### Backlog segmentation
Add backlog segmentation details using approved local evidence, assumptions, owner, and review status.

### Scheduling rule changes
Add scheduling rule changes details using approved local evidence, assumptions, owner, and review status.

### Referral triage approach
Add referral triage approach details using approved local evidence, assumptions, owner, and review status.

### Monitoring metrics
Add monitoring metrics details using approved local evidence, assumptions, owner, and review status.

## Red Flags
- clinically urgent referrals waiting
- access equity concern
- provider burnout risk
- payer network adequacy issue

## Safety
- Healthcare Agents provides healthcare administration decision support only. Do not use it for diagnosis, treatment, emergency guidance, or final clinical decision-making.
- Do not include direct patient identifiers or PHI unless you are working in a locally approved, governed environment and can apply minimum necessary data handling.
- Validate all outputs against local policy, payer contracts, applicable laws, and the accountable human owner before action.
- Escalate final clinical, legal, coding, billing, audit, compliance, contracting, employment, security, and executive decisions to qualified human owners.

## Platform Prompt
Draft an ambulatory access backlog workup with template, referral, no-show, and monitoring sections.

Problem: Dermatology third-next-available is 120 days and referrals are backing up.

Return the access recovery plan with required context, missing inputs, handoffs, safety constraints, and a quality checklist.
```

## Platform Prompts

Claude: Use operations-ambulatory-manager to produce an access recovery plan with demand/capacity assumptions and referral triage handoffs.

Codex: Draft an ambulatory access backlog workup with template, referral, no-show, and monitoring sections.

GitHub Copilot: Create an access backlog issue with required inputs, constraints, owners, and acceptance criteria.

Microsoft 365 Copilot: Use approved scheduling and referral data, keeping patient-level details out unless governed.
