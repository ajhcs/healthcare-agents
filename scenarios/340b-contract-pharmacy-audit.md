---
scenario_id: full-s03
title: 340B Contract Pharmacy Audit
pilot: false
agents_involved:
  - revenue-340b-program-manager
  - revenue-finance-manager
  - quality-compliance-officer
---

# 340B Contract Pharmacy Audit

## User Request

"Our board wants an urgent review of the 340B contract pharmacy program after two duplicate-discount findings and a sharp drop in savings. We need a compliance assessment, quantified financial impact, and an independent risk view before the next audit committee meeting."

## Orchestrator DAG

```yaml
workflow:
  title: 340B Contract Pharmacy Audit
  steps:
    - step_id: 1
      agent_slug: revenue-340b-program-manager
      agent_name: 340B Program Manager
      deliverable_id: r3p-d01
      deliverable_title: 340B Program Compliance Assessment
      why: The operational and diversion/duplicate-discount facts must be established before finance or compliance conclusions are made.
      required_inputs:
        - source: user
          data: "Split-billing reports, contract pharmacy inventory logic, manufacturer restriction impacts, self-audit history, and recent duplicate-discount findings"
      outputs_passed_forward:
        - field: contract_pharmacy_control_findings
          consumers: [2, 3]
      depends_on: []
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check current HRSA and CMS updates affecting duplicate discounts, diversion controls, and contract pharmacy expectations.
        materiality: Keeps the operational assessment aligned with current 340B enforcement posture.
    - step_id: 2
      agent_slug: revenue-finance-manager
      agent_name: Healthcare Finance Manager
      deliverable_id: rfm-d02
      deliverable_title: Service Line Profitability Analysis
      why: The board needs quantified savings leakage and margin impact, not just a compliance narrative.
      required_inputs:
        - source: step_1
          data: contract_pharmacy_control_findings
        - source: user
          data: "Savings reports, replenishment trends, covered-entity service-line margins, and contract-pharmacy fee structure"
      outputs_passed_forward:
        - field: quantified_financial_impact
          consumers: [3]
      depends_on: [1]
      independent_review: false
      tool_recommendation: null
    - step_id: 3
      agent_slug: quality-compliance-officer
      agent_name: Compliance Officer
      deliverable_id: qco-d01
      deliverable_title: Annual Compliance Risk Assessment
      why: The audit committee needs an independent risk rating on whether the 340B issues are isolated or systemic.
      required_inputs:
        - source: user
          data: "Compliance committee history, self-disclosure considerations, board reporting expectations, and external counsel posture"
        - source: step_1
          data: contract_pharmacy_control_findings
        - source: step_2
          data: quantified_financial_impact
      outputs_passed_forward: []
      depends_on: [1, 2]
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check recent HRSA, OIG, and manufacturer-policy updates affecting 340B contract pharmacy risk.
        materiality: Keeps the compliance risk rating current before the audit committee review.
  blockers:
    - type: missing_input
      condition: The split-billing data, audit logs, or savings reports are incomplete.
      affects: [1, 2]
      escalate_to: user
      workflow_status: blocked
      resolution: Ask the user for complete operational and finance data before the audit proceeds.
    - type: compliance_escalation
      condition: The risk assessment indicates likely systemic diversion or duplicate-discount exposure that may require disclosure or repayment.
      affects: [3]
      escalate_to: user
      workflow_status: blocked
      resolution: Pause closeout and escalate the issue to compliance leadership and counsel.
```

## Deliverable Summaries

- Step 1 produces the operational 340B control assessment.
- Step 2 quantifies the savings leakage and downstream margin impact.
- Step 3 produces the independent compliance-risk view for the board and audit committee.

## Handoff Data

- `1 -> 2`: pass `contract_pharmacy_control_findings` so finance quantifies the impact of specific operational failures instead of doing a generic margin review.
- `1 -> 3` and `2 -> 3`: pass the control and financial findings as source evidence; the compliance officer still derives the final risk rating independently.

## Where Tool Lookups Added Value

- `current_regulatory_policy` matters here because 340B contract-pharmacy expectations and manufacturer-policy pressure remain highly dynamic.

## Blockers Requiring User Input

- The workflow cannot proceed without complete split-billing and savings data.
- A systemic-risk finding blocks any “board-ready closeout” recommendation until the organization decides its remediation and disclosure path.
