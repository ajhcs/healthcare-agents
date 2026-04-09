---
scenario_id: full-s06
title: Population Readmission Hotspot
pilot: false
agents_involved:
  - pophealth-population-health-manager
  - clinical-care-management-specialist
  - quality-process-improvement-analyst
  - strategy-operations-consultant
---

# Population Readmission Hotspot

## User Request

"Our ACO readmission rate worsened in one region. We need to identify the hotspot, understand the care-management failure modes, redesign the workflow, and estimate the operational changes needed to recover performance."

## Orchestrator DAG

```yaml
workflow:
  title: Population Readmission Hotspot
  steps:
    - step_id: 1
      agent_slug: pophealth-population-health-manager
      agent_name: Population Health Manager
      deliverable_id: pph-d01
      deliverable_title: Population Health Dashboard Report
      why: The hotspot, segment, and care-gap pattern should be quantified before redesign work begins.
      required_inputs:
        - source: user
          data: "Regional readmission trends, payer mix, attribution logic, and existing care-gap data"
      outputs_passed_forward:
        - field: regional_hotspot_profile
          consumers: [2, 3, 4]
      depends_on: []
      independent_review: false
      tool_recommendation: null
      conflict_protocol: null
    - step_id: 2
      agent_slug: clinical-care-management-specialist
      agent_name: Care Management Specialist
      deliverable_id: ccm-d02
      deliverable_title: Readmission Risk Assessment
      why: The patient-level care-management and transition failures need to be identified before workflow redesign.
      required_inputs:
        - source: step_1
          data: regional_hotspot_profile
        - source: user
          data: "Sample discharge summaries, outreach logs, PCP access data, and SDOH screening results for the hotspot cohort"
      outputs_passed_forward:
        - field: transition_failure_patterns
          consumers: [3, 4]
      depends_on: [1]
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check current HRRP and transition-of-care guidance before finalizing the hotspot review.
        materiality: Keeps the cohort review aligned with current readmission policy.
      conflict_protocol: null
    - step_id: 3
      agent_slug: quality-process-improvement-analyst
      agent_name: Process Improvement Analyst
      deliverable_id: qpi-d01
      deliverable_title: A3 Problem-Solving Report
      why: Workflow redesign should be built from quantified failure modes rather than generic improvement ideas.
      required_inputs:
        - source: step_1
          data: regional_hotspot_profile
        - source: step_2
          data: transition_failure_patterns
      outputs_passed_forward:
        - field: redesigned_transition_workflow
          consumers: [4]
      depends_on: [1, 2]
      independent_review: false
      tool_recommendation: null
      conflict_protocol: null
    - step_id: 4
      agent_slug: strategy-operations-consultant
      agent_name: Healthcare Operations Consultant
      deliverable_id: soc-d01
      deliverable_title: Operational Performance Assessment
      why: Leadership needs an operational implementation path, not just a root-cause narrative.
      required_inputs:
        - source: step_1
          data: regional_hotspot_profile
        - source: step_2
          data: transition_failure_patterns
        - source: step_3
          data: redesigned_transition_workflow
      outputs_passed_forward: []
      depends_on: [1, 2, 3]
      independent_review: false
      tool_recommendation: null
      conflict_protocol: null
  blockers:
    - type: missing_input
      condition: Cohort definitions or discharge/outreach data for the hotspot region are incomplete.
      affects: [1, 2]
      escalate_to: user
      workflow_status: blocked
      resolution: Ask the user for the hotspot cohort definition and the supporting discharge and outreach records before continuing.
```

