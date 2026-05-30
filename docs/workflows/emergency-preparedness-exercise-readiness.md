# Emergency Preparedness Exercise Readiness

Prepare exercise objectives, injects, evaluation checklists, and after-action templates for CMS emergency preparedness or internal exercises.

Primary specialist: `emergency-preparedness-coordinator`
Supporting handoffs: `operations-hospital-administrator`, `quality-compliance-officer`, `operations-supply-chain-manager`
Output artifact: exercise readiness packet

## Example Input

> We need emergency preparedness exercise readiness for a severe weather scenario and prior after-action gaps.

## Required Context

- hazard scenario
- sites
- participants
- current plan
- prior after-action findings

## Red Flags

- active emergency
- incident command activation
- regulatory deadline
- critical infrastructure dependency

## Example Output

```markdown
# Emergency Preparedness Exercise Readiness

Problem: We need emergency preparedness exercise readiness for a severe weather scenario and prior after-action gaps.
Confidence: 0.87
Rationale: matched triggers: emergency preparedness, exercise, after-action; primary specialist: emergency-preparedness-coordinator; artifact: exercise readiness packet; next closest workflow: survey-readiness-gap-review; routing score: 207

## Roles
- Primary: emergency-preparedness-coordinator
- Handoffs: operations-hospital-administrator, quality-compliance-officer, operations-supply-chain-manager

## Missing Questions
- What is the sites?
- What is the participants?
- What is the current plan?

## Evidence To Collect
- hazard scenario
- sites
- participants
- current plan
- prior after-action findings
- HVA
- communications plan
- exercise type
- evaluation roles
- supply constraints

## exercise readiness packet
### Exercise objectives
Add exercise objectives details using approved local evidence, assumptions, owner, and review status.

### Scenario assumptions
Add scenario assumptions details using approved local evidence, assumptions, owner, and review status.

### Inject list
Add inject list details using approved local evidence, assumptions, owner, and review status.

### Evaluation checklist
Add evaluation checklist details using approved local evidence, assumptions, owner, and review status.

### After-action template
Add after-action template details using approved local evidence, assumptions, owner, and review status.

### Owner timeline
Add owner timeline details using approved local evidence, assumptions, owner, and review status.

## Red Flags
- active emergency
- incident command activation
- regulatory deadline
- critical infrastructure dependency

## Safety
- Healthcare Agents provides healthcare administration decision support only. Do not use it for diagnosis, treatment, emergency guidance, or final clinical decision-making.
- Do not include direct patient identifiers or PHI unless you are working in a locally approved, governed environment and can apply minimum necessary data handling.
- Validate all outputs against local policy, payer contracts, applicable laws, and the accountable human owner before action.
- Escalate final clinical, legal, coding, billing, audit, compliance, contracting, employment, security, and executive decisions to qualified human owners.
- Do not use this workflow for emergency medical guidance. Follow local emergency, clinical, compliance, and incident-command procedures.

## Platform Prompt
Draft exercise objectives, injects, evaluation checklist, and after-action template from the hazard scenario and current plan.

Problem: We need emergency preparedness exercise readiness for a severe weather scenario and prior after-action gaps.

Return the exercise readiness packet with required context, missing inputs, handoffs, safety constraints, and a quality checklist.
```

## Platform Prompts

Claude: Use emergency-preparedness-coordinator to create an exercise readiness packet and defer live emergency decisions to incident command.

Codex: Draft exercise objectives, injects, evaluation checklist, and after-action template from the hazard scenario and current plan.

GitHub Copilot: Create an emergency preparedness exercise issue with scenario, participants, inputs, safety notes, and acceptance criteria.

Microsoft 365 Copilot: Use approved preparedness documents and produce a Teams/SharePoint-ready exercise packet.
