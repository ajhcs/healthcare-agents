---
scenario_id: phase2-s03
title: Annual Compliance Audit Program Refresh
pilot: false
agents_involved:
  - quality-compliance-officer
  - quality-accreditation-specialist
  - healthit-information-manager
  - quality-risk-manager
---

# Annual Compliance Audit Program Refresh

## User Request

"We need to refresh our annual compliance work plan after a merger. We want to identify the highest-risk audit domains, align the survey-readiness work, confirm which health-information controls are outdated, and give the board a consolidated risk view."

## Orchestrator DAG

```yaml
workflow:
  title: Annual Compliance Audit Program Refresh
  steps:
    - step_id: 1
      agent_slug: quality-compliance-officer
      agent_name: Compliance Officer
      deliverable_id: qco-d01
      deliverable_title: Annual Compliance Risk Assessment
      why: The program risk view defines where the merged organization needs deeper audit work first.
      required_inputs:
        - source: user
          data: "Current policies, prior audit findings, hotline trends, and merger integration scope"
      outputs_passed_forward:
        - field: prioritized_compliance_risks
          consumers: [2, 3, 4]
      depends_on: []
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check current CMS, OIG, OCR, and DOJ updates affecting the highest-risk compliance domains before finalizing the work plan.
        materiality: Keeps the annual work plan aligned with current enforcement risk.
    - step_id: 2
      agent_slug: quality-accreditation-specialist
      agent_name: Accreditation Specialist
      deliverable_id: qas-d01
      deliverable_title: Survey Readiness Assessment
      why: Accreditation findings need to line up with the compliance risk list instead of living in a separate silo.
      required_inputs:
        - source: step_1
          data: prioritized_compliance_risks
        - source: user
          data: "Recent survey tracers, mock survey outputs, and open corrective actions"
      outputs_passed_forward:
        - field: survey_readiness_gaps
          consumers: [4]
      depends_on: [1]
      independent_review: false
      tool_recommendation: null
    - step_id: 3
      agent_slug: healthit-information-manager
      agent_name: Health Information Manager
      deliverable_id: him-d02
      deliverable_title: Legal Health Record Definition Policy
      why: The merged organization cannot run a coherent compliance audit if retention, legal-record, and release-of-information controls are stale or inconsistent.
      required_inputs:
        - source: step_1
          data: prioritized_compliance_risks
        - source: user
          data: "Record-retention policies, release-of-information procedures, and current legal health record definitions"
      outputs_passed_forward:
        - field: him_control_gaps
          consumers: [4]
      depends_on: [1]
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check current OCR, CMS, and record-retention guidance before finalizing the HIM control review.
        materiality: Prevents the merged policy set from relying on stale privacy or retention assumptions.
    - step_id: 4
      agent_slug: quality-risk-manager
      agent_name: Risk Manager
      deliverable_id: qrm-d03
      deliverable_title: Board Risk Report
      why: The board needs one consolidated view that reflects compliance, accreditation, and HIM control exposure.
      required_inputs:
        - source: step_1
          data: prioritized_compliance_risks
        - source: step_2
          data: survey_readiness_gaps
        - source: step_3
          data: him_control_gaps
      outputs_passed_forward: []
      depends_on: [1, 2, 3]
      independent_review: false
      tool_recommendation: null
  blockers:
    - type: missing_input
      condition: Post-merger policies or prior audit files are incomplete.
      affects: [1, 3]
      escalate_to: user
      workflow_status: blocked
      resolution: Ask the user for the missing policy set and prior audit record set before starting the refresh.
```

