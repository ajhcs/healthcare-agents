---
scenario_id: phase2-s05
title: Sepsis Surveillance Improvement
pilot: false
agents_involved:
  - pophealth-surveillance-coordinator
  - quality-patient-safety-officer
  - healthit-clinical-data-analyst
  - clinical-infection-prevention-specialist
---

# Sepsis Surveillance Improvement

## User Request

"Our sepsis quality indicators are unstable across facilities. We need to validate the case-identification logic, review recent safety events, determine whether infection-prevention practices are contributing to misses, and redesign the reporting package before the next executive review."

## Orchestrator DAG

```yaml
workflow:
  title: Sepsis Surveillance Improvement
  steps:
    - step_id: 1
      agent_slug: pophealth-surveillance-coordinator
      agent_name: Public Health Surveillance Coordinator
      deliverable_id: psc-d02
      deliverable_title: Reportable Disease Compliance Audit
      why: Start by validating how cases are currently identified and where surveillance logic is failing.
      required_inputs:
        - source: user
          data: "Current sepsis reporting logic, facility breakdown, and recent variance in numerator/denominator counts"
      outputs_passed_forward:
        - field: surveillance_logic_gaps
          consumers: [2, 3, 4]
      depends_on: []
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check current CMS and public-health reporting guidance relevant to sepsis quality measurement before finalizing the surveillance review.
        materiality: Keeps the logic audit aligned with current reporting expectations.
    - step_id: 2
      agent_slug: quality-patient-safety-officer
      agent_name: Patient Safety Officer
      deliverable_id: qps-d01
      deliverable_title: Root Cause Analysis Report
      why: Safety-event review distinguishes analytic noise from real bedside process failures.
      required_inputs:
        - source: step_1
          data: surveillance_logic_gaps
        - source: user
          data: "Recent sepsis-related safety events, mortality reviews, and escalation timelines"
      outputs_passed_forward:
        - field: safety_failure_modes
          consumers: [4]
      depends_on: [1]
      independent_review: false
      tool_recommendation: null
    - step_id: 3
      agent_slug: healthit-clinical-data-analyst
      agent_name: Clinical Data Analyst
      deliverable_id: hcd-d02
      deliverable_title: Registry Submission Validation Report
      why: The executive package needs a validated measurement layer, not raw unstable counts.
      required_inputs:
        - source: step_1
          data: surveillance_logic_gaps
        - source: user
          data: "Source system mapping, report logic, and facility-level data extracts"
      outputs_passed_forward:
        - field: validated_reporting_logic
          consumers: [4]
      depends_on: [1]
      independent_review: false
      tool_recommendation: null
    - step_id: 4
      agent_slug: clinical-infection-prevention-specialist
      agent_name: Infection Prevention Specialist
      deliverable_id: cip-d02
      deliverable_title: Outbreak Investigation Report
      why: Infection-prevention workflow changes need to reflect both the surveillance gaps and the confirmed safety failure modes.
      required_inputs:
        - source: step_1
          data: surveillance_logic_gaps
        - source: step_2
          data: safety_failure_modes
        - source: step_3
          data: validated_reporting_logic
      outputs_passed_forward: []
      depends_on: [1, 2, 3]
      independent_review: false
      tool_recommendation:
        capability_class: literature_search
        query_template: Search current sepsis surveillance and bundle-compliance literature if the redesign depends on updated evidence.
        materiality: Supports evidence-based redesign of the sepsis surveillance workflow.
  blockers:
    - type: missing_input
      condition: Facility-level extracts or event-review files are incomplete.
      affects: [1, 2, 3]
      escalate_to: user
      workflow_status: blocked
      resolution: Ask for the missing facility extracts and event-review artifacts before starting the analysis.
```
