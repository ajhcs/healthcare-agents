---
scenario_id: phase2-s02
title: Denial Management Escalation
pilot: false
agents_involved:
  - revenue-cycle-specialist
  - revenue-medical-coding-specialist
  - payer-relations-specialist
  - quality-compliance-officer
---

# Denial Management Escalation

## User Request

"Our clean claim rate dropped after a payer changed behavior on outpatient infusion claims. We need to isolate the denial root cause, confirm whether coding or payer edits changed, decide whether the payer is underpaying contractually, and determine if the escalation raises compliance risk."

## Orchestrator DAG

```yaml
workflow:
  title: Denial Management Escalation
  steps:
    - step_id: 1
      agent_slug: revenue-cycle-specialist
      agent_name: Revenue Cycle Specialist
      deliverable_id: rcs-d02
      deliverable_title: Denial Root Cause Analysis
      why: The denial trend has to be categorized before downstream specialists can determine the correct escalation path.
      required_inputs:
        - source: user
          data: "835 remit detail, CARC/RARC mix, claim sample, payer name, and go-live date of the denial spike"
      outputs_passed_forward:
        - field: denial_patterns
          consumers: [2, 3, 4]
      depends_on: []
      independent_review: false
      tool_recommendation: null
    - step_id: 2
      agent_slug: revenue-medical-coding-specialist
      agent_name: Medical Coding Specialist
      deliverable_id: rmc-d01
      deliverable_title: Coding Audit Report
      why: Coding logic must be ruled in or out before payer escalation.
      required_inputs:
        - source: step_1
          data: denial_patterns
        - source: user
          data: "Representative claims, procedure mix, diagnosis set, and modifier usage"
      outputs_passed_forward:
        - field: coding_findings
          consumers: [3, 4]
      depends_on: [1]
      independent_review: false
      tool_recommendation:
        capability_class: coding_edit_policy
        query_template: Verify NCCI edit logic and modifier indicators for the denied infusion procedures before finalizing the coding audit.
        materiality: Distinguishes payer behavior changes from valid coding edit failures.
    - step_id: 3
      agent_slug: payer-relations-specialist
      agent_name: Payer Relations Specialist
      deliverable_id: prs-d03
      deliverable_title: Payer Underpayment Recovery Report
      why: If the claims are clean, the payer-facing escalation needs quantified contractual evidence.
      required_inputs:
        - source: step_1
          data: denial_patterns
        - source: step_2
          data: coding_findings
        - source: user
          data: "Contract language, fee schedule, and prior remittance baseline"
      outputs_passed_forward:
        - field: payer_escalation_package
          consumers: [4]
      depends_on: [1, 2]
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check current No Surprises Act, payer dispute, and reimbursement policy updates before finalizing the escalation package.
        materiality: Keeps the payer escalation aligned with current dispute pathways.
    - step_id: 4
      agent_slug: quality-compliance-officer
      agent_name: Compliance Officer
      deliverable_id: qco-d01
      deliverable_title: Annual Compliance Risk Assessment
      why: Repeated denial workarounds or rebilling tactics can create separate compliance exposure.
      required_inputs:
        - source: step_1
          data: denial_patterns
        - source: step_2
          data: coding_findings
        - source: step_3
          data: payer_escalation_package
      outputs_passed_forward: []
      depends_on: [1, 2, 3]
      independent_review: false
      tool_recommendation: null
  blockers:
    - type: missing_input
      condition: The remit sample or contract terms are incomplete.
      affects: [1, 3]
      escalate_to: user
      workflow_status: blocked
      resolution: Ask the user for a complete remit sample and the governing contract language.
    - type: domain_conflict
      condition: The coding audit finds claim errors while the payer report argues contractual underpayment.
      affects: [3, 4]
      escalate_to: user
      workflow_status: paused
      resolution: Surface both findings and require the user to decide whether to rework claims before escalating the payer dispute.
```
