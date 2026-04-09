---
scenario_id: full-s05
title: Payer Underpayment Recovery
pilot: false
agents_involved:
  - revenue-contract-analyst
  - revenue-cycle-specialist
  - payer-relations-specialist
  - revenue-finance-manager
---

# Payer Underpayment Recovery

## User Request

"We think a commercial payer has been underpaying high-volume outpatient claims for months. We need the contract interpretation, the denial and remittance pattern, the recovery strategy, and the quantified financial exposure before we escalate to payer leadership."

## Orchestrator DAG

```yaml
workflow:
  title: Payer Underpayment Recovery
  steps:
    - step_id: 1
      agent_slug: revenue-contract-analyst
      agent_name: Healthcare Contract Analyst
      deliverable_id: rca-d01
      deliverable_title: Contract Performance Scorecard
      why: The recovery case needs a defensible contract interpretation before claims operations starts chasing variances.
      required_inputs:
        - source: user
          data: "Payer contract, amendment history, fee schedules, carve-out language, and identified service lines with suspected variance"
      outputs_passed_forward:
        - field: contract_variance_logic
          consumers: [2, 3, 4]
      depends_on: []
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check current CMS and state payment-policy references that influence the contracted benchmark or fee schedule assumptions.
        materiality: Keeps the contract interpretation anchored to the current benchmark references named in the agreement.
    - step_id: 2
      agent_slug: revenue-cycle-specialist
      agent_name: Revenue Cycle Specialist
      deliverable_id: rcs-d02
      deliverable_title: Denial Root Cause Analysis
      why: The remittance and work-queue pattern must show whether the issue is contractual underpayment, operational leakage, or both.
      required_inputs:
        - source: step_1
          data: contract_variance_logic
        - source: user
          data: "835 remittances, remit variance logs, CARC/RARC trends, and sample claim inventory"
      outputs_passed_forward:
        - field: remittance_and_denial_pattern
          consumers: [3, 4]
      depends_on: [1]
      independent_review: false
      tool_recommendation: null
    - step_id: 3
      agent_slug: payer-relations-specialist
      agent_name: Payer Relations Specialist
      deliverable_id: prs-d03
      deliverable_title: Payer Underpayment Recovery Report
      why: The escalation strategy and recovery posture must reflect both the contract logic and the operational pattern.
      required_inputs:
        - source: step_1
          data: contract_variance_logic
        - source: step_2
          data: remittance_and_denial_pattern
      outputs_passed_forward:
        - field: payer_recovery_strategy
          consumers: [4]
      depends_on: [1, 2]
      independent_review: false
      tool_recommendation: null
    - step_id: 4
      agent_slug: revenue-finance-manager
      agent_name: Healthcare Finance Manager
      deliverable_id: rfm-d01
      deliverable_title: Monthly Financial Performance Report
      why: Leadership needs a quantified view of cash, margin, and reserve impact before escalating.
      required_inputs:
        - source: step_1
          data: contract_variance_logic
        - source: step_2
          data: remittance_and_denial_pattern
        - source: step_3
          data: payer_recovery_strategy
      outputs_passed_forward: []
      depends_on: [1, 2, 3]
      independent_review: false
      tool_recommendation: null
  blockers:
    - type: missing_input
      condition: The contract amendment history or remittance sample is incomplete.
      affects: [1, 2]
      escalate_to: user
      workflow_status: blocked
      resolution: Require the user to provide the governing contract version and remittance evidence before escalation planning begins.
    - type: domain_conflict
      condition: Contract interpretation and remittance evidence point to different root causes for the payment variance.
      affects: [3, 4]
      escalate_to: user
      workflow_status: paused
      resolution: Surface both analyses to the user before the payer recovery strategy is finalized.
```

## Deliverable Summaries

- Step 1 produces the contract interpretation and variance logic.
- Step 2 produces the claim, remittance, and denial pattern analysis.
- Step 3 produces the payer-facing recovery and escalation strategy.
- Step 4 quantifies the financial exposure and reporting impact.

## Handoff Data

- `1 -> 2`: pass `contract_variance_logic` so claims operations tests the right payment terms and carve-outs.
- `1 -> 3` and `2 -> 3`: pass contract and remittance evidence together so payer relations can escalate a fully supported recovery case.
- `3 -> 4`: pass `payer_recovery_strategy` so finance can model likely recovery timing and reserve posture.

## Where Tool Lookups Added Value

- `current_regulatory_policy` is useful only when the payer contract explicitly references external benchmark rules that may have changed.

## Blockers Requiring User Input

- The workflow stops if the governing contract version or remittance evidence is incomplete.
- If the contract view and remittance view conflict, the orchestrator pauses rather than guessing which path is correct.
