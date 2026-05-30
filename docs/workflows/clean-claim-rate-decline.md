# Clean Claim Rate Decline

Diagnose a clean-claim-rate drop from edits, clearinghouse rejections, registration defects, coding quality, or system changes.

Primary specialist: `revenue-cycle-specialist`
Supporting handoffs: `operations-physician-practice-manager`, `revenue-medical-coding-specialist`, `healthit-clinical-data-analyst`
Output artifact: clean claim recovery plan

## Example Input

> Clean claim rate dropped from 92 to 81 after a registration workflow change.

## Required Context

- baseline clean claim rate
- current clean claim rate
- edit categories
- affected clinics or service lines
- recent system or workflow changes

## Red Flags

- patient access impact
- cash acceleration pressure
- repeatable registration defect
- coding compliance concern

## Example Output

```markdown
# Clean Claim Rate Decline

Problem: Clean claim rate dropped from 92 to 81 after a registration workflow change.
Confidence: 0.73
Rationale: matched triggers: clean claim rate; primary specialist: revenue-cycle-specialist; artifact: clean claim recovery plan; next closest workflow: denial-spike-workup; routing score: 72

## Roles
- Primary: revenue-cycle-specialist
- Handoffs: operations-physician-practice-manager, revenue-medical-coding-specialist, healthit-clinical-data-analyst

## Missing Questions
- What is the edit categories?
- What is the affected clinics or service lines?

## Evidence To Collect
- baseline clean claim rate
- current clean claim rate
- edit categories
- affected clinics or service lines
- recent system or workflow changes
- clearinghouse report
- registration audit
- coding quality sample
- claim scrubber rules

## clean claim recovery plan
### Issue segmentation
Add issue segmentation details using approved local evidence, assumptions, owner, and review status.

### Likely process defects
Add likely process defects details using approved local evidence, assumptions, owner, and review status.

### Owner matrix
Add owner matrix details using approved local evidence, assumptions, owner, and review status.

### Fix plan
Add fix plan details using approved local evidence, assumptions, owner, and review status.

### Dashboard specification
Add dashboard specification details using approved local evidence, assumptions, owner, and review status.

### Validation cadence
Add validation cadence details using approved local evidence, assumptions, owner, and review status.

## Red Flags
- patient access impact
- cash acceleration pressure
- repeatable registration defect
- coding compliance concern

## Safety
- Healthcare Agents provides healthcare administration decision support only. Do not use it for diagnosis, treatment, emergency guidance, or final clinical decision-making.
- Do not include direct patient identifiers or PHI unless you are working in a locally approved, governed environment and can apply minimum necessary data handling.
- Validate all outputs against local policy, payer contracts, applicable laws, and the accountable human owner before action.
- Escalate final clinical, legal, coding, billing, audit, compliance, contracting, employment, security, and executive decisions to qualified human owners.

## Platform Prompt
Produce a clean claim recovery plan with segmentation, workflow fixes, owner matrix, and monitoring spec.

Problem: Clean claim rate dropped from 92 to 81 after a registration workflow change.

Return the clean claim recovery plan with required context, missing inputs, handoffs, safety constraints, and a quality checklist.
```

## Platform Prompts

Claude: Use the revenue-cycle-specialist for clean claim recovery and ask for baseline/current rates, edit categories, affected clinics, and recent system changes.

Codex: Produce a clean claim recovery plan with segmentation, workflow fixes, owner matrix, and monitoring spec.

GitHub Copilot: Draft a clean claim rate issue with required data pulls, process owners, acceptance criteria, and safety notes.

Microsoft 365 Copilot: Build a governed clean claim recovery memo from approved reports and keep claim examples de-identified unless approved.
