---
scenario_id: full-s04
title: Cardiology Service Line Launch
pilot: false
agents_involved:
  - strategy-healthcare-consultant
  - payer-credentialing-enrollment-coordinator
  - revenue-contract-analyst
  - revenue-medical-coding-specialist
  - quality-compliance-officer
  - revenue-cycle-specialist
---

# Cardiology Service Line Launch

## User Request

"We are launching a new outpatient cardiology service line. We need to validate the market opportunity, credential the initial cardiologists, model reimbursement, set up charge capture, confirm the compensation structure is compliant, and stand up the revenue-cycle workflow."

## Orchestrator DAG

```yaml
workflow:
  title: Cardiology Service Line Launch
  steps:
    - step_id: 1
      agent_slug: strategy-healthcare-consultant
      agent_name: Healthcare Strategy Consultant
      deliverable_id: shc-d01
      deliverable_title: Service Line Strategic Assessment
      why: Confirm demand, competitive position, and viability before downstream build work starts.
      required_inputs:
        - source: user
          data: "Target geography, expected physician roster, strategic goals, and any board timing constraints"
      outputs_passed_forward:
        - field: target_market_and_volume_assumptions
          consumers: [3, 6]
        - field: target_payer_mix
          consumers: [2, 3]
      depends_on: []
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check recent CMS, FTC, DOJ, or state CON updates that could affect the proposed cardiology launch.
        materiality: Keeps the strategic recommendation aligned with current market-entry constraints.
      conflict_protocol: null
    - step_id: 2
      agent_slug: payer-credentialing-enrollment-coordinator
      agent_name: Credentialing & Enrollment Coordinator
      deliverable_id: pce-d01
      deliverable_title: Provider Credentialing Status Dashboard
      why: Contracting and billing cannot start until physician enrollment status is clear.
      required_inputs:
        - source: user
          data: "Initial cardiologist roster, NPIs, state licenses, and facility affiliations"
        - source: step_1
          data: target_payer_mix
      outputs_passed_forward:
        - field: provider_enrollment_status_by_payer
          consumers: [3, 6]
      depends_on: [1]
      independent_review: false
      tool_recommendation:
        capability_class: provider_enrollment_status
        query_template: Verify payer and program enrollment status for each cardiologist before building the contracting tracker.
        materiality: Prevents the launch plan from assuming inactive or incomplete enrollment.
      conflict_protocol: null
    - step_id: 3
      agent_slug: revenue-contract-analyst
      agent_name: Healthcare Contract Analyst
      deliverable_id: rca-d02
      deliverable_title: Reimbursement Modeling Worksheet
      why: Fee schedules and reimbursement assumptions should reflect both market volume and actual enrollment status.
      required_inputs:
        - source: step_1
          data: target_market_and_volume_assumptions
        - source: step_2
          data: provider_enrollment_status_by_payer
      outputs_passed_forward:
        - field: projected_reimbursement_model
          consumers: [4, 6]
      depends_on: [1, 2]
      independent_review: false
      tool_recommendation:
        capability_class: coverage_determination
        query_template: Check active cardiology coverage and reimbursement policy assumptions for the target procedure mix.
        materiality: Prevents the launch model from relying on non-covered or mis-scoped reimbursement assumptions.
      conflict_protocol: null
    - step_id: 4
      agent_slug: revenue-medical-coding-specialist
      agent_name: Medical Coding Specialist
      deliverable_id: rmc-d01
      deliverable_title: Coding Audit Report
      why: Charge capture and coding guidance must reflect the intended service mix before the clinic opens.
      required_inputs:
        - source: step_3
          data: projected_reimbursement_model
      outputs_passed_forward:
        - field: charge_capture_and_coding_controls
          consumers: [6]
      depends_on: [3]
      independent_review: false
      tool_recommendation:
        capability_class: coding_edit_policy
        query_template: Verify NCCI edits, modifier logic, and cardiology-specific coding constraints for the planned procedure mix.
        materiality: Prevents avoidable denials from reaching the launch workflow.
      conflict_protocol: null
    - step_id: 5
      agent_slug: quality-compliance-officer
      agent_name: Compliance Officer
      deliverable_id: qco-d01
      deliverable_title: Annual Compliance Risk Assessment
      why: Compensation and referral structures require an independent Stark and AKS review.
      required_inputs:
        - source: user
          data: "Proposed physician compensation structure, referral expectations, and any joint-venture arrangements"
      outputs_passed_forward:
        - field: compliance_launch_constraints
          consumers: [6]
      depends_on: []
      independent_review: true
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check recent Stark, Anti-Kickback, and physician-arrangement guidance affecting the proposed service line structure.
        materiality: Keeps the independent compliance review aligned with current enforcement posture.
      conflict_protocol: Surface any compliance disagreement to the user and pause the launch workflow until the compensation or referral structure is revised.
    - step_id: 6
      agent_slug: revenue-cycle-specialist
      agent_name: Revenue Cycle Specialist
      deliverable_id: rcs-d01
      deliverable_title: Revenue Cycle Performance Dashboard
      why: The launch needs an operational revenue-cycle design tied to the modeled reimbursement and coding controls.
      required_inputs:
        - source: step_1
          data: target_market_and_volume_assumptions
        - source: step_2
          data: provider_enrollment_status_by_payer
        - source: step_3
          data: projected_reimbursement_model
        - source: step_4
          data: charge_capture_and_coding_controls
      outputs_passed_forward: []
      depends_on: [1, 2, 3, 4]
      independent_review: false
      tool_recommendation: null
      conflict_protocol: If reimbursement assumptions or coding controls conflict with the revenue-cycle design, surface both views to the user and pause implementation until resolved.
  blockers:
    - type: missing_input
      condition: The physician roster or payer targets are incomplete.
      affects: [1, 2, 3]
      escalate_to: user
      workflow_status: blocked
      resolution: Ask the user for the initial cardiologist roster, NPIs, and target payer list before launch planning continues.
    - type: compliance_escalation
      condition: The independent compliance review identifies a Stark or Anti-Kickback problem in the proposed compensation or referral structure.
      affects: [5, 6]
      escalate_to: user
      workflow_status: blocked
      resolution: Halt downstream operational build steps until the compensation or referral structure is revised.
```

