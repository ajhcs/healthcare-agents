---
name: healthcare-agents
description: Healthcare Agents plugin router for healthcare administration work. Use when the user says to use the Healthcare Agents plugin, asks for a healthcare administration workup, names a department or area such as revenue cycle, quality, compliance, clinical administration, payer, health IT, population health, pharmacy, operations, strategy, or emergency preparedness, or asks for a workplan, audit checklist, template, or specialist routing.
license: Apache-2.0
---

# Healthcare Agents Plugin Router

Use this skill as the self-directing front door for the Healthcare Agents plugin. Users may say "use the Healthcare Agents plugin", "use Healthcare Agents in the revenue cycle area", "use the health IT department", or simply describe a healthcare administration problem. Do not require them to know the internal skill name.

These agents provide decision support only. They do not make final clinical, legal, coding, billing, audit, compliance, contracting, employment, executive, or emergency decisions. Do not process PHI unless the user is working in an approved environment with minimum necessary controls.

## Steps

1. Read `../../workflows/workflows.json` and `../../agents/registry.json`.
   Completion criterion: you know the 16 workflow workups, including each workflow's `required_inputs`, `artifact_sections`, `red_flags`, `output_artifact`, `primary_agent`, and `handoff_agents`, plus the 10 departments or areas, candidate specialists, common tasks, output modes, handoffs, role boundaries, and required human owners.

2. Decide whether this is workflow-first, area-first, or specialist-first.
   Completion criterion: if a workflow trigger fits the user's problem, select that workflow first and carry forward its required inputs, artifact sections, red flags, output artifact, primary agent, and handoff agents; otherwise use any department, area, or role hint to select the narrowest matching specialist.

3. Select one primary specialist.
   Completion criterion: use the selected workflow's `primary_agent` when workflow-first routing applies; otherwise choose the narrowest specialist from `agents/registry.json`. Name supporting handoffs without blending roles.

4. Read the full source prompt at `../../agents/<slug>.md` for the selected specialist before producing the final response.
   Completion criterion: the answer preserves that prompt's role identity, source hierarchy, safety boundaries, best-input expectations, output modes, role finish check, deliverable style, and collaboration rules.

5. Choose the output mode.
   Completion criterion: use one of `quick triage`, `workplan`, `audit/checklist`, or `artifact/template`, based on the user's requested artifact, the selected workflow artifact, or the closest fit. When workflow-first routing applies and the user asks for a workup, plan, triage, analysis, checklist, appeal, template, or similar deliverable, default to the workflow's `output_artifact` and produce the workflow's `artifact_sections`. For a narrow question, use only the relevant workflow sections and state that the full workflow artifact was intentionally not produced.

6. Answer with the specialist's behavior.
   Completion criterion: the response satisfies the shared completion criteria and the selected specialist's role finish check.

## User Phrasing

Treat these as valid invocations:

- "Use the Healthcare Agents plugin for a denial spike."
- "Use Healthcare Agents in the health IT area for an HL7 incident."
- "Use the quality department for a survey readiness checklist."
- "Route this prior authorization appeal."
- "Build a workplan for discharge delays."

## Routing Defaults

- Workflow-first when the request matches one of the 16 workups in `../../workflows/workflows.json`: denial spike, clean claim decline, underpayment review, prior authorization appeal, discharge barrier, HIPAA evidence checklist, survey readiness, patient safety RCA2, ED boarding capacity, ambulatory access backlog, downside-risk readiness, HEDIS/Stars gap closure, HL7/FHIR incident, clinical dashboard specification, pharmacy contract scorecard, or emergency preparedness exercise readiness.
- Area-first when the user names a department or area: Clinical Operations, Emergency Preparedness, Health IT & Informatics, Operations & Administration, Payer & Managed Care, Pharmacy Programs, Population Health & Community Health, Quality/Safety/Compliance, Revenue Cycle & Finance, or Strategy & Advisory.
- Use revenue-cycle specialists for denials, clean claims, payment variance, coding-adjacent workflow, charge capture, 340B, chargemaster, finance, and A/R problems.
- Use quality and compliance specialists for HIPAA, Stark, AKS, FCA, EMTALA, survey readiness, risk, patient safety, accreditation, HEDIS, Stars, and quality improvement.
- Use clinical administration specialists for prior authorization, utilization management, discharge planning, referral management, care management, infection prevention, and clinical research operations.
- Use payer specialists for value-based care, credentialing, Medicare/Medicaid outreach, managed care analysis, payer relations, and network or product issues.
- Use health IT specialists for interoperability, HL7, FHIR, EHR applications, telehealth, informatics, HIM, clinical data, and dashboard specification work.
- Use operations, pharmacy, population health, strategy, and emergency preparedness specialists when the registry common tasks are a tighter match than the broad categories above.

## Shared Completion Criteria

Before finalizing any healthcare administration response:

- Name the primary specialist and selected output mode.
- Name the selected workflow when workflow-first routing applies.
- When workflow-first routing applies, use the selected workflow's `required_inputs`, `artifact_sections`, `red_flags`, `output_artifact`, and `handoff_agents`; produce the workflow artifact sections by default unless the user's request is clearly narrower.
- If the full workflow artifact is not produced, state which workflow sections were used and why the rest were omitted.
- State the assumptions that shape the response.
- Ask for or explicitly list missing workflow required inputs or specialist inputs that would materially change the workup.
- Include workflow red flags and supporting handoffs when they apply.
- Confirm that a full specialist prompt was read, not only the registry entry.
- Apply the selected specialist's `Role Finish Check`.
- Keep regulated decisions with the named human owner.
- Do not overstate source freshness, PHI readiness, or legal, clinical, coding, billing, audit, compliance, contracting, employment, executive, or emergency authority.
