# HEDIS or Stars Gap Closure Sprint

Plan a focused quality gap closure sprint for HEDIS, Stars, payer quality programs, denominator/numerator gaps, and outreach.

Primary specialist: `quality-improvement-specialist`
Supporting handoffs: `pophealth-population-health-manager`, `healthit-clinical-data-analyst`, `quality-compliance-officer`
Output artifact: gap closure sprint plan

## Example Input

> We need a HEDIS gap closure sprint for diabetic eye exams.

## Required Context

- measure
- denominator
- numerator gap
- patient segment
- outreach channels

## Red Flags

- measure documentation uncertainty
- patient consent or communication limits
- clinical prioritization needed
- data lag

## Example Output

```markdown
# HEDIS or Stars Gap Closure Sprint

Problem: We need a HEDIS gap closure sprint for diabetic eye exams.
Confidence: 0.84
Rationale: matched triggers: HEDIS, gap closure, diabetic eye exam; primary specialist: quality-improvement-specialist; artifact: gap closure sprint plan; next closest workflow: survey-readiness-gap-review; routing score: 127

## Roles
- Primary: quality-improvement-specialist
- Handoffs: pophealth-population-health-manager, healthit-clinical-data-analyst, quality-compliance-officer

## Missing Questions
- What is the measure?
- What is the denominator?
- What is the patient segment?
- What is the outreach channels?

## Evidence To Collect
- measure
- denominator
- numerator gap
- patient segment
- outreach channels
- payer program
- measure year
- documentation source
- provider owner
- vendor outreach capacity

## gap closure sprint plan
### Gap stratification
Add gap stratification details using approved local evidence, assumptions, owner, and review status.

### Outreach plan
Add outreach plan details using approved local evidence, assumptions, owner, and review status.

### Documentation checklist
Add documentation checklist details using approved local evidence, assumptions, owner, and review status.

### Weekly operating rhythm
Add weekly operating rhythm details using approved local evidence, assumptions, owner, and review status.

### Measure validation
Add measure validation details using approved local evidence, assumptions, owner, and review status.

## Red Flags
- measure documentation uncertainty
- patient consent or communication limits
- clinical prioritization needed
- data lag

## Safety
- Healthcare Agents provides healthcare administration decision support only. Do not use it for diagnosis, treatment, emergency guidance, or final clinical decision-making.
- Do not include direct patient identifiers or PHI unless you are working in a locally approved, governed environment and can apply minimum necessary data handling.
- Validate all outputs against local policy, payer contracts, applicable laws, and the accountable human owner before action.
- Escalate final clinical, legal, coding, billing, audit, compliance, contracting, employment, security, and executive decisions to qualified human owners.

## Platform Prompt
Draft a gap closure sprint plan with measure, denominator, numerator gap, outreach channels, and weekly rhythm.

Problem: We need a HEDIS gap closure sprint for diabetic eye exams.

Return the gap closure sprint plan with required context, missing inputs, handoffs, safety constraints, and a quality checklist.
```

## Platform Prompts

Claude: Use quality-improvement-specialist to produce a HEDIS or Stars gap closure sprint with measure documentation safeguards.

Codex: Draft a gap closure sprint plan with measure, denominator, numerator gap, outreach channels, and weekly rhythm.

GitHub Copilot: Create a quality gap closure prompt with measure inputs, outreach tasks, and acceptance criteria.

Microsoft 365 Copilot: Use governed quality data and produce a sprint plan that separates outreach operations from clinical judgment.
