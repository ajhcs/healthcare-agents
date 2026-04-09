---
scenario_id: full-s05
title: Denial And Underpayment Escalation
pilot: false
agents_involved:
  - revenue-cycle-specialist
  - revenue-medical-coding-specialist
  - payer-relations-specialist
  - quality-risk-manager
---

# Denial And Underpayment Escalation

## User Request

"Our initial denial rate spiked for one commercial payer, and we are also seeing underpayments on high-dollar outpatient cases. We need to isolate the root cause, confirm whether coding is part of it, recover money where possible, and understand the enterprise risk if this keeps going."

## Orchestrator DAG

```yaml
workflow:
  title: Denial And Underpayment Escalation
  steps:
    - step_id: 1
      agent_slug: revenue-cycle-specialist
      agent_name: Revenue Cycle Specialist
      deliverable_id: rcs-d02
      deliverable_title: Denial Root Cause Analysis
      why: The denial pattern has to be categorized before escalation paths are chosen.
      required_inputs:
        - source: user
          data: "Denied-claim sample, CARC/RARC data, payer mix, service lines, and monthly trend data"
      outputs_passed_forward:
        - field: denial_root_cause_clusters
          consumers: [2, 3, 4]
      depends_on: []
      independent_review: false
      tool_recommendation:
        capability_class: coding_edit_policy
        query_template: Verify whether any current edit logic or payer-edit updates explain the denial spike.
        materiality: Distinguishes systemic edit failures from operational workflow defects.
      conflict_protocol: null
    - step_id: 2
      agent_slug: revenue-medical-coding-specialist
      agent_name: Medical Coding Specialist
      deliverable_id: rmc-d01
      deliverable_title: Coding Audit Report
      why: Coding support should be tested before treating the issue as purely payer behavior.
      required_inputs:
        - source: step_1
          data: denial_root_cause_clusters
        - source: user
          data: "Representative claim documentation, billed codes, modifiers, and charge detail"
      outputs_passed_forward:
        - field: coding_support_findings
          consumers: [3, 4]
      depends_on: [1]
      independent_review: false
      tool_recommendation:
        capability_class: coding_edit_policy
        query_template: Check NCCI, modifier, and code-edit rules implicated by the denied claims.
        materiality: Prevents appeals from being built on unsupported coding assumptions.
      conflict_protocol: null
    - step_id: 3
      agent_slug: payer-relations-specialist
      agent_name: Payer Relations Specialist
      deliverable_id: prs-d03
      deliverable_title: Payer Underpayment Recovery Report
      why: Contract and underpayment recovery action should begin only after the operational and coding facts are clear.
      required_inputs:
        - source: step_1
          data: denial_root_cause_clusters
        - source: step_2
          data: coding_support_findings
      outputs_passed_forward:
        - field: payer_recovery_strategy
          consumers: [4]
      depends_on: [1, 2]
      independent_review: false
      tool_recommendation:
        capability_class: coverage_determination
        query_template: Confirm whether the disputed services remain covered under current policy before escalation to the payer.
        materiality: Prevents underpayment recovery activity from chasing non-covered services.
      conflict_protocol: If payer contract interpretation conflicts with coding support findings, surface both views to the user before escalation.
    - step_id: 4
      agent_slug: quality-risk-manager
      agent_name: Risk Manager
      deliverable_id: qrm-d02
      deliverable_title: Claims Summary Report
      why: The organization needs an enterprise-risk view if cash leakage or dispute volume continues.
      required_inputs:
        - source: step_1
          data: denial_root_cause_clusters
        - source: step_2
          data: coding_support_findings
        - source: step_3
          data: payer_recovery_strategy
      outputs_passed_forward: []
      depends_on: [1, 2, 3]
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check whether any recent payer, CMS, or No Surprises guidance changes alter the dispute risk profile.
        materiality: Keeps the risk analysis aligned with current external rules.
      conflict_protocol: null
  blockers:
    - type: missing_input
      condition: Denial detail, remittance data, or contract terms are incomplete.
      affects: [1, 2, 3]
      escalate_to: user
      workflow_status: blocked
      resolution: Ask the user for the payer remittance data, contract terms, and representative claim documentation before analysis continues.
```
