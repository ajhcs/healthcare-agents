---
scenario_id: pilot-s03
title: Interoperability Failure In Post-Acute Discharge Handoffs
pilot: true
agents_involved:
  - healthit-interoperability-engineer
  - clinical-care-management-specialist
  - strategy-healthcare-consultant
  - quality-compliance-officer
---

# Interoperability Failure In Post-Acute Discharge Handoffs

## User Request

"Our post-acute partners say discharge packets are arriving late, incomplete, or unreadable. We need to redesign the handoff spec, understand which patients are most exposed when the feed fails, and give executives a prioritization plan for remediation. Also flag any compliance risk if the current process creates information-blocking or patient-safety exposure."

## Orchestrator DAG

```yaml
workflow:
  title: Post-Acute Discharge Handoff Remediation
  steps:
    - step_id: 1
      agent_slug: healthit-interoperability-engineer
      agent_name: Healthcare Interoperability Engineer
      deliverable_id: hie-d01
      deliverable_title: Interface Specification Document
      why: The technical failure pattern has to be mapped before operational and strategic remediation can be prioritized.
      required_inputs:
        - source: user
          data: "Current discharge interface maps, sample failed messages, interface logs, destination roster, and known vendor constraints"
      outputs_passed_forward:
        - field: failure_modes_and_target_state
          consumers: [2, 3]
      depends_on: []
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check current CMS, ONC, and Federal Register guidance affecting discharge exchange, patient access, and information-blocking expectations.
        materiality: Keeps the target-state design aligned with current interoperability obligations.
    - step_id: 2
      agent_slug: clinical-care-management-specialist
      agent_name: Care Management Specialist
      deliverable_id: ccm-d02
      deliverable_title: Readmission Risk Assessment
      why: Quantify which patient populations are most exposed when the handoff fails so remediation priority is risk-based.
      required_inputs:
        - source: step_1
          data: failure_modes_and_target_state
        - source: user
          data: "Recent discharge cohort, post-acute destinations, PCP status, and 30-day readmission patterns"
      outputs_passed_forward:
        - field: patient_risk_prioritization
          consumers: [3]
      depends_on: [1]
      independent_review: false
      tool_recommendation:
        capability_class: provider_directory
        query_template: Verify the receiving facility and clinician directory entries for the highest-risk post-acute destinations.
        materiality: Distinguishes true interface failures from bad destination identity data.
    - step_id: 3
      agent_slug: strategy-healthcare-consultant
      agent_name: Healthcare Strategy Consultant
      deliverable_id: shc-d01
      deliverable_title: Service Line Strategic Assessment
      why: Convert the technical and patient-risk findings into an executive investment and sequencing recommendation.
      required_inputs:
        - source: step_1
          data: failure_modes_and_target_state
        - source: step_2
          data: patient_risk_prioritization
        - source: user
          data: "Capital constraints, post-acute network priorities, and executive decision horizon"
      outputs_passed_forward: []
      depends_on: [1, 2]
      independent_review: false
      tool_recommendation: null
    - step_id: 4
      agent_slug: quality-compliance-officer
      agent_name: Compliance Officer
      deliverable_id: qco-d01
      deliverable_title: Annual Compliance Risk Assessment
      why: Independently determine whether the current discharge process creates privacy, patient-safety, or information-blocking exposure.
      required_inputs:
        - source: user
          data: "Current incident history, privacy concerns, complaints, and escalation procedures tied to discharge handoffs"
      outputs_passed_forward: []
      depends_on: []
      independent_review: true
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check the latest CMS, ONC, OCR, and OIG guidance affecting discharge exchange, patient access, and privacy controls.
        materiality: Keeps the compliance view aligned with current enforcement and policy expectations.
  blockers:
    - type: missing_input
      condition: Interface logs or failed-message examples are unavailable for the affected discharge pathways.
      affects: [1]
      escalate_to: user
      workflow_status: blocked
      resolution: Ask the user for representative failure evidence before the interface redesign begins.
    - type: domain_conflict
      condition: The strategic prioritization recommends delaying a remediation that the compliance review treats as an immediate risk.
      affects: [3, 4]
      escalate_to: user
      workflow_status: paused
      resolution: Surface both rationales to the user and require an executive risk decision before sequencing the work.
```

## Deliverable Summaries

- Step 1 produces the current-state and target-state interface design with concrete failure modes.
- Step 2 produces the patient-risk ranking so remediation can focus on the discharge populations most likely to be harmed by the failures.
- Step 3 produces the executive prioritization and investment frame for the remediation program.
- Step 4 produces the independent compliance view on whether the current process is creating immediate regulatory or safety exposure.

## Handoff Data

- `1 -> 2`: pass `failure_modes_and_target_state` so care management can translate the technical failures into patient transition risk.
- `1 -> 3`: pass the same failure-mode inventory so the strategy assessment is grounded in the real remediation work instead of generic interoperability spend.
- `2 -> 3`: pass `patient_risk_prioritization` so executive sequencing reflects who is harmed first if remediation is delayed.
- `does_not_pass to step 4`: the compliance officer does not receive the strategy recommendation or risk ranking as judgment inputs; that review stays independent.

## Where Tool Lookups Added Value

- `current_regulatory_policy` matters for both the technical redesign and the compliance view because information-blocking and discharge-exchange expectations can change.
- `provider_directory` helps distinguish bad destination master data from true handoff transport or mapping failures.

## Blockers Requiring User Input

- The redesign cannot start without actual failure evidence.
- If strategic sequencing conflicts with the compliance severity view, the workflow pauses for a user decision.

