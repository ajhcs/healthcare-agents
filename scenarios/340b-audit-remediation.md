---
scenario_id: full-s08
title: 340B Audit Remediation
pilot: false
agents_involved:
  - revenue-340b-program-manager
  - pharmacy-medication-safety-specialist
  - quality-compliance-officer
  - revenue-finance-manager
---

# 340B Audit Remediation

## User Request

"We found duplicate discount risk and contract-pharmacy inventory problems in our internal 340B review. We need a compliance remediation plan, a medication-safety view of the operational failures, and a financial estimate of the impact."

## Orchestrator DAG

```yaml
workflow:
  title: 340B Audit Remediation
  steps:
    - step_id: 1
      agent_slug: revenue-340b-program-manager
      agent_name: 340B Program Manager
      deliverable_id: r3p-d01
      deliverable_title: 340B Program Compliance Assessment
      why: The operational and compliance facts must be established before safety or finance work starts.
      required_inputs:
        - source: user
          data: "Internal audit findings, contract-pharmacy records, split-billing outputs, and affected medication classes"
      outputs_passed_forward:
        - field: 340b_control_failures
          consumers: [2, 3, 4]
      depends_on: []
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check current HRSA and 340B program guidance affecting duplicate-discount prevention and contract-pharmacy controls.
        materiality: Keeps the remediation plan aligned with current 340B expectations.
      conflict_protocol: null
    - step_id: 2
      agent_slug: pharmacy-medication-safety-specialist
      agent_name: Medication Safety Specialist
      deliverable_id: pms-d01
      deliverable_title: Medication Error Root Cause Analysis Report
      why: Medication-handling and inventory-control failures need a separate safety view before redesigning pharmacy workflows.
      required_inputs:
        - source: step_1
          data: 340b_control_failures
      outputs_passed_forward:
        - field: medication_safety_failure_modes
          consumers: [3, 4]
      depends_on: [1]
      independent_review: false
      tool_recommendation:
        capability_class: literature_search
        query_template: Review current medication-safety evidence or guidance relevant to the identified pharmacy-control failures.
        materiality: Grounds the pharmacy remediation in current safety practice.
      conflict_protocol: null
    - step_id: 3
      agent_slug: quality-compliance-officer
      agent_name: Compliance Officer
      deliverable_id: qco-d01
      deliverable_title: Annual Compliance Risk Assessment
      why: The organization needs an independent compliance view on repayment, disclosure, and remediation obligations.
      required_inputs:
        - source: step_1
          data: 340b_control_failures
        - source: step_2
          data: medication_safety_failure_modes
      outputs_passed_forward:
        - field: compliance_remediation_requirements
          consumers: [4]
      depends_on: [1, 2]
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check current HRSA, OIG, or CMS guidance affecting self-disclosure, repayment, or remediation expectations for 340B control failures.
        materiality: Keeps the remediation posture aligned with current enforcement expectations.
      conflict_protocol: null
    - step_id: 4
      agent_slug: revenue-finance-manager
      agent_name: Revenue Finance Manager
      deliverable_id: rfm-d01
      deliverable_title: Monthly Financial Performance Report
      why: Leadership needs the financial exposure tied to the validated control, safety, and compliance findings.
      required_inputs:
        - source: step_1
          data: 340b_control_failures
        - source: step_2
          data: medication_safety_failure_modes
        - source: step_3
          data: compliance_remediation_requirements
      outputs_passed_forward: []
      depends_on: [1, 2, 3]
      independent_review: false
      tool_recommendation: null
      conflict_protocol: null
  blockers:
    - type: missing_input
      condition: Contract-pharmacy records, split-billing outputs, or affected medication lists are incomplete.
      affects: [1, 2, 4]
      escalate_to: user
      workflow_status: blocked
      resolution: Ask the user for the contract-pharmacy data, split-billing results, and affected drug list before the remediation workflow proceeds.
```
