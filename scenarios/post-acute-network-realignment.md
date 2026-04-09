---
scenario_id: phase2-s04
title: Post-Acute Network Realignment
pilot: false
agents_involved:
  - clinical-case-manager
  - payer-credentialing-enrollment-coordinator
  - payer-managed-care-analyst
  - strategy-operations-consultant
---

# Post-Acute Network Realignment

## User Request

"Our preferred SNF and home health network is underperforming on length of stay and denial rates. We need to reassess referral pathways, confirm network enrollment and participation, model the payer implications, and redesign the throughput operating model."

## Orchestrator DAG

```yaml
workflow:
  title: Post-Acute Network Realignment
  steps:
    - step_id: 1
      agent_slug: clinical-case-manager
      agent_name: Case Manager
      deliverable_id: ccm-d01
      deliverable_title: Discharge Planning Checklist
      why: Realignment should start with where the current discharge workflow is breaking at the bedside.
      required_inputs:
        - source: user
          data: "Current preferred network list, discharge delays, avoidable days, and referral-acceptance failures"
      outputs_passed_forward:
        - field: discharge_failure_patterns
          consumers: [2, 3, 4]
      depends_on: []
      independent_review: false
      tool_recommendation:
        capability_class: provider_directory
        query_template: Verify the post-acute organizations in scope before finalizing the network review.
        materiality: Prevents the network analysis from conflating similarly named organizations.
    - step_id: 2
      agent_slug: payer-credentialing-enrollment-coordinator
      agent_name: Credentialing & Enrollment Coordinator
      deliverable_id: pce-d01
      deliverable_title: Provider Credentialing & Enrollment Status Dashboard
      why: The realignment cannot succeed if the target network entities are not enrolled where the payer mix requires them.
      required_inputs:
        - source: step_1
          data: discharge_failure_patterns
        - source: user
          data: "Target SNF and home health roster, payer mix, and existing participation files"
      outputs_passed_forward:
        - field: network_enrollment_gaps
          consumers: [3, 4]
      depends_on: [1]
      independent_review: false
      tool_recommendation:
        capability_class: provider_enrollment_status
        query_template: Confirm enrollment status for each candidate SNF and home health entity with the dominant payer set before redesigning referral pathways.
        materiality: Prevents the redesign from favoring entities that cannot actually accept the payer mix.
    - step_id: 3
      agent_slug: payer-managed-care-analyst
      agent_name: Managed Care Analyst
      deliverable_id: pmc-d02
      deliverable_title: Network Adequacy Assessment Report
      why: Network decisions need quantified payer impact rather than anecdotal placement preferences.
      required_inputs:
        - source: step_1
          data: discharge_failure_patterns
        - source: step_2
          data: network_enrollment_gaps
        - source: user
          data: "Length-of-stay metrics, authorization delays, denial rates, and post-acute utilization by payer"
      outputs_passed_forward:
        - field: payer_network_tradeoffs
          consumers: [4]
      depends_on: [1, 2]
      independent_review: false
      tool_recommendation: null
    - step_id: 4
      agent_slug: strategy-operations-consultant
      agent_name: Healthcare Operations Consultant
      deliverable_id: soc-d03
      deliverable_title: Throughput Command Center Playbook
      why: The organization needs an operating model that uses the network findings to prevent avoidable days and failed placements.
      required_inputs:
        - source: step_1
          data: discharge_failure_patterns
        - source: step_2
          data: network_enrollment_gaps
        - source: step_3
          data: payer_network_tradeoffs
      outputs_passed_forward: []
      depends_on: [1, 2, 3]
      independent_review: false
      tool_recommendation: null
  blockers:
    - type: missing_input
      condition: The organization cannot provide the current preferred-network list or payer performance data.
      affects: [1, 3]
      escalate_to: user
      workflow_status: blocked
      resolution: Ask for the current network inventory and payer performance baseline before starting the realignment.
```
