---
scenario_id: pilot-s01
title: TCM RAC Audit Review
pilot: true
agents_involved:
  - clinical-care-management-specialist
  - revenue-medical-coding-specialist
  - quality-compliance-officer
---

# TCM RAC Audit Review

## User Request

"We received a RAC audit letter targeting transitional care management claims for recent heart failure and COPD discharges. We need to understand which discharges were highest risk, whether the claims were coded correctly, and whether our TCM documentation process creates compliance exposure."

## Orchestrator DAG

```yaml
workflow:
  title: TCM RAC Audit Review
  steps:
    - step_id: 1
      agent_slug: clinical-care-management-specialist
      agent_name: Care Management Specialist
      deliverable_id: ccm-d02
      deliverable_title: Readmission Risk Assessment
      why: Identify which sampled discharges carried the highest transition risk and where follow-up plans were weakest.
      required_inputs:
        - source: user
          data: "Discharge summaries, outreach logs, PCP status, SDOH notes, and recent inpatient utilization for the sampled TCM claims"
      outputs_passed_forward:
        - field: patient_level_risk_drivers
          consumers: [2]
        - field: missed_transition_controls
          consumers: [3]
      depends_on: []
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check the latest CMS guidance affecting CCM, TCM, and HRRP transition requirements before finalizing the patient-risk review.
        materiality: Keeps the risk analysis aligned with current transition-of-care rules.
    - step_id: 2
      agent_slug: revenue-medical-coding-specialist
      agent_name: Medical Coding Specialist
      deliverable_id: rmc-d01
      deliverable_title: Coding Audit Report
      why: Test whether billed TCM cases are supported by the documentation and coding logic.
      required_inputs:
        - source: user
          data: "Claim sample, billed CPT codes, encounter notes, and discharge dates for the audited TCM population"
        - source: step_1
          data: patient_level_risk_drivers
      outputs_passed_forward:
        - field: coding_and_billing_findings
          consumers: [3]
      depends_on: [1]
      independent_review: false
      tool_recommendation:
        capability_class: coding_edit_policy
        query_template: Verify any NCCI or modifier logic affecting the downstream billing review for transitional care workflows.
        materiality: Prevents the audit from relying on stale coding edit assumptions.
    - step_id: 3
      agent_slug: quality-compliance-officer
      agent_name: Compliance Officer
      deliverable_id: qco-d01
      deliverable_title: Annual Compliance Risk Assessment
      why: Determine whether the RAC issue reflects a broader compliance control failure in the TCM program.
      required_inputs:
        - source: user
          data: "Current TCM policy, internal audit history, escalation procedures, and the RAC letter scope"
      outputs_passed_forward: []
      depends_on: []
      independent_review: true
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check recent CMS, OIG, or MLN updates affecting transitional care management documentation and repayment expectations.
        materiality: Keeps the control assessment aligned with current enforcement posture.
  blockers:
    - type: missing_input
      condition: The RAC sample list or interactive-contact documentation is incomplete.
      affects: [1, 2]
      escalate_to: user
      workflow_status: blocked
      resolution: Ask the user for the sampled claim roster and the supporting contact records before steps 1 and 2 begin.
    - type: compliance_escalation
      condition: The compliance review finds systemic TCM billing unsupported by required interactive-contact controls.
      affects: [3]
      escalate_to: user
      workflow_status: blocked
      resolution: Pause the workflow and require a repayment and remediation decision before continuing.
```

## Deliverable Summaries

- Step 1 produces a patient-level readmission risk view showing where the audited TCM population had missing PCP follow-up, SDOH barriers, or weak discharge controls.
- Step 2 produces the claim-level coding audit tying billed TCM services to documentation support, code selection, and any recurring denial or overpayment pattern.
- Step 3 produces the independent compliance risk view on whether the RAC issue reflects a broader documentation, escalation, or repayment failure.

## Handoff Data

- `1 -> 2`: pass `patient_level_risk_drivers` so the coding audit can stratify findings by transition complexity instead of treating every discharge as equivalent.
- `1 -> 3`: pass `missed_transition_controls` only as factual control gaps; the compliance officer still derives the risk rating independently.
- `2 -> 3`: pass `coding_and_billing_findings` so the compliance review can distinguish isolated documentation failures from program-level control weakness.

## Where Tool Lookups Added Value

- `current_regulatory_policy` keeps the TCM and HRRP assumptions current before the audit conclusions are frozen.
- `coding_edit_policy` is useful only if the RAC scope touches modifier or edit logic beyond the core TCM documentation issue.

## Blockers Requiring User Input

- The workflow cannot start without the RAC sample list and the interactive-contact records tied to the sampled claims.
- A compliance finding of systemic unsupported billing blocks any “close out the audit” recommendation until the user decides the remediation path.

