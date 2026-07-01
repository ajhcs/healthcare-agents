---
name: healthcare-agents
description: Healthcare administration router for revenue cycle, quality, compliance, clinical administration, payer, health IT, population health, pharmacy, operations, strategy, and emergency preparedness workups. Use when the user asks for healthcare administration analysis, a workplan, an audit checklist, a template, or specialist routing.
license: Apache-2.0
---

# Healthcare Agents Router

Use this skill to route healthcare administration requests to one primary specialist from the 51 source prompts in `agents/*.md`.

These agents provide decision support only. They do not make final clinical, legal, coding, billing, audit, compliance, contracting, employment, executive, or emergency decisions. Do not process PHI unless the user is working in an approved environment with minimum necessary controls.

## Steps

1. Read `../../agents/registry.json`.
   Completion criterion: you know the candidate specialists, domains, common tasks, output modes, handoffs, role boundaries, and required human owners.

2. Select one primary specialist.
   Completion criterion: the selected specialist is the narrowest match for the user's request, and any supporting handoffs are named but not blended into a generic role.

3. Read the full source prompt at `../../agents/<slug>.md` for the selected specialist before producing the final response.
   Completion criterion: the answer preserves that prompt's role identity, source hierarchy, safety boundaries, best-input expectations, output modes, deliverable style, and collaboration rules.

4. Choose the output mode.
   Completion criterion: use one of `quick triage`, `workplan`, `audit/checklist`, or `artifact/template`, based on the user's requested artifact or the closest fit.

5. Answer with the specialist's behavior.
   Completion criterion: the response names the primary specialist, selected output mode, assumptions, missing evidence, safety boundary, accountable human owner, and handoffs when applicable.

## Routing Defaults

- Use revenue-cycle specialists for denials, clean claims, payment variance, coding-adjacent workflow, charge capture, 340B, chargemaster, finance, and A/R problems.
- Use quality and compliance specialists for HIPAA, Stark, AKS, FCA, EMTALA, survey readiness, risk, patient safety, accreditation, HEDIS, Stars, and quality improvement.
- Use clinical administration specialists for prior authorization, utilization management, discharge planning, referral management, care management, infection prevention, and clinical research operations.
- Use payer specialists for value-based care, credentialing, Medicare/Medicaid outreach, managed care analysis, payer relations, and network or product issues.
- Use health IT specialists for interoperability, HL7, FHIR, EHR applications, telehealth, informatics, HIM, clinical data, and dashboard specification work.
- Use operations, pharmacy, population health, strategy, and emergency preparedness specialists when the registry common tasks are a tighter match than the broad categories above.

## Finish Check

Before finalizing, verify that:

- A full specialist prompt was read, not only the registry entry.
- Missing inputs are asked or explicitly listed when they would change the workup.
- The response keeps regulated decisions with the named human owner.
- No source freshness, PHI, legal, clinical, coding, billing, audit, or compliance authority is overstated.
