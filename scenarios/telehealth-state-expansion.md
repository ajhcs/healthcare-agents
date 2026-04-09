---
scenario_id: full-s07
title: Telehealth State Expansion
pilot: false
agents_involved:
  - healthit-telehealth-program-manager
  - operations-ambulatory-manager
  - payer-managed-care-analyst
  - quality-compliance-officer
---

# Telehealth State Expansion

## User Request

"We want to expand our virtual specialty clinics into three new states. We need to understand reimbursement and compliance by state, redesign ambulatory operations for virtual throughput, and confirm the payer strategy."

## Orchestrator DAG

```yaml
workflow:
  title: Telehealth State Expansion
  steps:
    - step_id: 1
      agent_slug: healthit-telehealth-program-manager
      agent_name: Telehealth Program Manager
      deliverable_id: htp-d02
      deliverable_title: State Telehealth Compliance Matrix
      why: State-by-state compliance and reimbursement differences define what is operationally feasible.
      required_inputs:
        - source: user
          data: "Target states, targeted specialties, expected encounter mix, and current telehealth platform constraints"
      outputs_passed_forward:
        - field: state_rules_and_constraints
          consumers: [2, 3, 4]
      depends_on: []
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check current state telehealth, RPM, and remote-supervision rules for the target states.
        materiality: Keeps the expansion plan aligned with current cross-state policy.
      conflict_protocol: null
    - step_id: 2
      agent_slug: operations-ambulatory-manager
      agent_name: Ambulatory Manager
      deliverable_id: oam-d02
      deliverable_title: Clinic Workflow Redesign Plan
      why: Clinic operations need to be redesigned to support the virtual-state expansion once the state rules are known.
      required_inputs:
        - source: step_1
          data: state_rules_and_constraints
      outputs_passed_forward:
        - field: virtual_clinic_workflow
          consumers: [3]
      depends_on: [1]
      independent_review: false
      tool_recommendation: null
      conflict_protocol: null
    - step_id: 3
      agent_slug: payer-managed-care-analyst
      agent_name: Managed Care Analyst
      deliverable_id: pmc-d02
      deliverable_title: Network Adequacy Assessment Report
      why: The payer strategy needs to reflect both virtual operations and state-specific access requirements.
      required_inputs:
        - source: step_1
          data: state_rules_and_constraints
        - source: step_2
          data: virtual_clinic_workflow
      outputs_passed_forward:
        - field: payer_access_and_network_strategy
          consumers: [4]
      depends_on: [1, 2]
      independent_review: false
      tool_recommendation:
        capability_class: coverage_determination
        query_template: Check payer telehealth coverage assumptions that could change network or reimbursement strategy in the target states.
        materiality: Prevents network design from assuming unsupported telehealth reimbursement.
      conflict_protocol: null
    - step_id: 4
      agent_slug: quality-compliance-officer
      agent_name: Compliance Officer
      deliverable_id: qco-d01
      deliverable_title: Annual Compliance Risk Assessment
      why: The final go/no-go decision needs an independent legal and compliance view across the expansion model.
      required_inputs:
        - source: step_1
          data: state_rules_and_constraints
        - source: step_3
          data: payer_access_and_network_strategy
      outputs_passed_forward: []
      depends_on: [1, 3]
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check current telehealth compliance guidance affecting licensure, prescribing, RPM, and supervision in the target states.
        materiality: Keeps the final go/no-go decision tied to current multi-state compliance rules.
      conflict_protocol: If compliance finds a state-specific blocker, surface it to the user and remove that state from the expansion workflow until resolved.
  blockers:
    - type: missing_input
      condition: The target-state list, specialty mix, or telehealth encounter assumptions are incomplete.
      affects: [1, 2, 3]
      escalate_to: user
      workflow_status: blocked
      resolution: Ask the user for the target states, specialty lines, and expected encounter mix before continuing.
```
