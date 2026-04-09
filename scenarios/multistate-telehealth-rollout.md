---
scenario_id: full-s02
title: Multistate Telehealth Rollout
pilot: false
agents_involved:
  - healthit-telehealth-program-manager
  - payer-credentialing-enrollment-coordinator
  - quality-compliance-officer
  - revenue-cycle-specialist
---

# Multistate Telehealth Rollout

## User Request

"We want to expand our telehealth program across six states, including behavioral health and chronic disease follow-up. We need the state compliance map, provider enrollment readiness, reimbursement risk view, and a final operating model that does not create avoidable denials."

## Orchestrator DAG

```yaml
workflow:
  title: Multistate Telehealth Rollout
  steps:
    - step_id: 1
      agent_slug: healthit-telehealth-program-manager
      agent_name: Telehealth Program Manager
      deliverable_id: htp-d02
      deliverable_title: State Telehealth Compliance Matrix
      why: The rollout starts with state-by-state policy, modality, and supervision constraints.
      required_inputs:
        - source: user
          data: "Target states, service lines, visit modalities, provider types, and intended care settings"
      outputs_passed_forward:
        - field: state_policy_constraints
          consumers: [2, 3, 4]
      depends_on: []
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check current federal and state telehealth coverage, parity, and prescribing updates for the target states.
        materiality: Keeps the rollout matrix aligned with the latest state and federal policy changes.
    - step_id: 2
      agent_slug: payer-credentialing-enrollment-coordinator
      agent_name: Credentialing & Enrollment Coordinator
      deliverable_id: pce-d01
      deliverable_title: Provider Credentialing Status Dashboard
      why: The rollout must account for state licensure, telehealth enrollment, and payer participation by provider.
      required_inputs:
        - source: user
          data: "Provider roster, licensure map, supervising physician model, and payer participation goals"
        - source: step_1
          data: state_policy_constraints
      outputs_passed_forward:
        - field: telehealth_enrollment_readiness
          consumers: [4]
      depends_on: [1]
      independent_review: false
      tool_recommendation:
        capability_class: provider_enrollment_status
        query_template: Confirm payer and program enrollment status for each provider-state combination before scheduling telehealth visits.
        materiality: Prevents the rollout from routing visits to non-enrolled or otherwise non-billable clinicians.
    - step_id: 3
      agent_slug: quality-compliance-officer
      agent_name: Compliance Officer
      deliverable_id: qco-d01
      deliverable_title: Annual Compliance Risk Assessment
      why: A multistate rollout needs an independent review of privacy, supervision, prescribing, and fraud-and-abuse risks.
      required_inputs:
        - source: step_1
          data: state_policy_constraints
        - source: user
          data: "Recording policy, remote prescribing plan, supervision model, vendor footprint, and documentation standards"
      outputs_passed_forward:
        - field: telehealth_compliance_constraints
          consumers: [4]
      depends_on: [1]
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check recent OCR, DEA, CMS, and state telehealth policy changes affecting privacy, prescribing, and supervision.
        materiality: Keeps the compliance review aligned with active telehealth enforcement and waiver status.
    - step_id: 4
      agent_slug: revenue-cycle-specialist
      agent_name: Revenue Cycle Specialist
      deliverable_id: rcs-d02
      deliverable_title: Denial Root Cause Analysis
      why: The rollout needs a denial-prevention design before claims begin flowing across multiple states and payers.
      required_inputs:
        - source: step_1
          data: state_policy_constraints
        - source: step_2
          data: telehealth_enrollment_readiness
        - source: step_3
          data: telehealth_compliance_constraints
      outputs_passed_forward: []
      depends_on: [1, 2, 3]
      independent_review: false
      tool_recommendation:
        capability_class: coverage_determination
        query_template: Verify current telehealth coverage rules for the highest-volume payer and service combinations in each state.
        materiality: Prevents the rollout from re-creating the same denial pattern across six markets.
  blockers:
    - type: missing_input
      condition: Provider licensure coverage or target state list is incomplete.
      affects: [1, 2]
      escalate_to: user
      workflow_status: blocked
      resolution: Confirm the target states and provider roster before the matrix and enrollment work begins.
    - type: compliance_escalation
      condition: The compliance review finds a prescribing, supervision, or privacy model that cannot be operationalized as proposed.
      affects: [3, 4]
      escalate_to: user
      workflow_status: blocked
      resolution: Pause rollout configuration until the operating model is redesigned.
```

## Deliverable Summaries

- Step 1 produces the state-by-state telehealth policy matrix.
- Step 2 produces the provider-state enrollment and readiness view.
- Step 3 produces the independent compliance-risk assessment for the rollout.
- Step 4 produces the denial-prevention and reimbursement-risk operating view.

## Handoff Data

- `1 -> 2`: pass `state_policy_constraints` so enrollment work reflects actual modality and supervision limits.
- `1 -> 3`: pass the policy matrix as facts only; the compliance officer still derives the risk judgment independently.
- `2 -> 4` and `3 -> 4`: pass enrollment readiness and compliance constraints so denial prevention reflects both billability and legal constraints.

## Where Tool Lookups Added Value

- `current_regulatory_policy` is the highest-value lookup because telehealth rules change quickly and vary materially by state and program.
- `provider_enrollment_status` prevents otherwise compliant telehealth workflows from failing at the billing stage.
- `coverage_determination` helps translate policy and enrollment readiness into payer-specific denial prevention rules.

## Blockers Requiring User Input

- The workflow pauses if provider licensure or target-state scope is not confirmed.
- A blocked compliance review halts operational rollout, even if state-matrix work is otherwise complete.
