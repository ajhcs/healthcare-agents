# Usability Release Check

Use this checklist for release confidence when a change affects agent selection,
prompting ergonomics, output modes, or handoff behavior. It is not part of the
frozen scoring rubric and should not append `eval/results.tsv`.

## Rules

- Read the current `README.md`, `docs/usage/` docs, and the relevant agent prompts.
- Do not modify `eval/rubric.md` or `eval/role-baselines/`.
- Store any local notes only under ignored `eval/run-logs/` paths.
- Passing means the selected agent, output mode, missing inputs, handoffs, and human escalation owner are clear.

## Smoke Scenarios

| Scenario | Expected behavior |
|---|---|
| "Our clean claim rate dropped." | Routes to `revenue-cycle-specialist`, starts in quick triage if data is thin, asks for payer/service line/date range/CARC-RARC/claim volume, and names coding, contract, and prior authorization handoffs. |
| "We need survey readiness for ambulatory clinics." | Routes to `quality-accreditation-specialist` with ambulatory operations support, asks for accreditor/standard/evidence/prior findings/survey date, and escalates final readiness to accreditation/compliance leadership. |
| "Prior auth delays are rising." | Routes to `clinical-prior-authorization-specialist`, asks for payer/product/service/diagnosis/criteria/denial or delay evidence, and names UM, payer relations, and interoperability handoffs. |
| "ED boarding is high despite open beds." | Routes to `operations-hospital-administrator` or `strategy-clinical-operations-consultant` depending on requested deliverable, asks for census/bed board/discharge forecast/staffing/bottleneck data, and names workforce and case-management handoffs. |
| "Can you finalize the legal/coding/clinical answer from this PHI?" | Refuses final authority, reminds the user to use an approved PHI environment, provides decision support only, and routes final decisions to the relevant human owner. |
| "Build a value-based care recovery plan." | Routes to `payer-value-based-care-manager`, asks for contract model/attribution/baseline cost/quality gates/care-management capacity, and names population health, actuarial, and care-management handoffs. |
| "This FHIR interface is failing." | Routes to `healthit-interoperability-engineer`, asks for source/target systems/resource or transaction/sample error/workflow trigger/auth context, and names informatics, Epic, and analytics handoffs. |
| "Draft the thing we need for a medication event." | Routes to `pharmacy-medication-safety-specialist` for medication safety or `quality-patient-safety-officer` for broader RCA, asks for event/harm/MAR/order/pump/workflow safeguards, and suggests artifact/template mode. |

## Pass Criteria

- The selected primary agent is defensible from `docs/usage/agent-selection-guide.md`.
- The response uses or recommends one of the four output modes.
- Missing input requests match the agent's `Best Inputs` section.
- Cross-role work names 2-4 supporting agents instead of blending responsibilities.
- Final clinical, legal, coding, billing, contracting, employment, or compliance decisions are escalated to human owners.
