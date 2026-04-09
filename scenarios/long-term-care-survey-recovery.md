---
scenario_id: full-s04
title: Long-Term Care Survey Recovery
pilot: false
agents_involved:
  - operations-long-term-care-administrator
  - quality-accreditation-specialist
  - quality-risk-manager
  - operations-workforce-manager
---

# Long-Term Care Survey Recovery

## User Request

"Our skilled nursing facility received a poor survey outcome with infection-control, staffing, and grievance-management findings. We need the corrective action plan, accreditation-style readiness view, board-level risk summary, and workforce stabilization plan."

## Orchestrator DAG

```yaml
workflow:
  title: Long-Term Care Survey Recovery
  steps:
    - step_id: 1
      agent_slug: operations-long-term-care-administrator
      agent_name: Long-Term Care Administrator
      deliverable_id: oltc-d02
      deliverable_title: Survey Response and Corrective Action Plan
      why: The facility needs an operational remediation plan anchored to the actual survey findings.
      required_inputs:
        - source: user
          data: "Survey statement of deficiencies, plan-of-correction deadlines, current staffing plan, grievance logs, and infection-control audit history"
      outputs_passed_forward:
        - field: corrective_action_workstreams
          consumers: [2, 3, 4]
      depends_on: []
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check current CMS long-term-care survey guidance, infection-control expectations, and staffing policy updates before finalizing the corrective action plan.
        materiality: Keeps the remediation plan aligned with current survey expectations.
    - step_id: 2
      agent_slug: quality-accreditation-specialist
      agent_name: Accreditation Specialist
      deliverable_id: qas-d02
      deliverable_title: Corrective Action Plan (Post-Survey)
      why: A second quality lens is needed to make sure the plan is measurable and survey-ready, not only operationally plausible.
      required_inputs:
        - source: step_1
          data: corrective_action_workstreams
      outputs_passed_forward:
        - field: survey_readiness_controls
          consumers: [3, 4]
      depends_on: [1]
      independent_review: false
      tool_recommendation: null
    - step_id: 3
      agent_slug: quality-risk-manager
      agent_name: Risk Manager
      deliverable_id: qrm-d03
      deliverable_title: Board Risk Report
      why: Leadership needs a board-level view of regulatory, resident-safety, and claims exposure created by the findings.
      required_inputs:
        - source: step_1
          data: corrective_action_workstreams
        - source: step_2
          data: survey_readiness_controls
      outputs_passed_forward:
        - field: board_risk_constraints
          consumers: [4]
      depends_on: [1, 2]
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check current CMS survey and certification updates affecting long-term-care staffing, infection control, and grievance management.
        materiality: Keeps the board risk view aligned with active survey priorities.
    - step_id: 4
      agent_slug: operations-workforce-manager
      agent_name: Healthcare Workforce Manager
      deliverable_id: owm-d02
      deliverable_title: Agency Reduction Business Case
      why: The staffing findings require a workforce plan that closes gaps without locking the facility into unsustainable agency spend.
      required_inputs:
        - source: step_1
          data: corrective_action_workstreams
        - source: step_2
          data: survey_readiness_controls
        - source: step_3
          data: board_risk_constraints
      outputs_passed_forward: []
      depends_on: [1, 2, 3]
      independent_review: false
      tool_recommendation: null
  blockers:
    - type: missing_input
      condition: The statement of deficiencies or staffing baseline data is incomplete.
      affects: [1, 4]
      escalate_to: user
      workflow_status: blocked
      resolution: Require the user to provide the survey findings packet and current staffing baseline before planning starts.
    - type: compliance_escalation
      condition: The board risk report identifies resident-safety exposure that requires immediate escalation or external reporting.
      affects: [3, 4]
      escalate_to: user
      workflow_status: blocked
      resolution: Pause routine remediation sequencing and escalate the resident-safety risk immediately.
```

## Deliverable Summaries

- Step 1 produces the operational corrective action plan.
- Step 2 produces the survey-readiness refinement of that plan.
- Step 3 produces the board-level risk and exposure summary.
- Step 4 produces the staffing stabilization and agency-reduction plan.

## Handoff Data

- `1 -> 2`: pass `corrective_action_workstreams` so the accreditation review evaluates the actual remediation design, not a hypothetical survey response.
- `1 -> 3` and `2 -> 3`: pass operational and readiness facts only; the risk manager derives the board-level risk view independently.
- `3 -> 4`: pass `board_risk_constraints` so the workforce plan respects resident-safety and governance priorities.

## Where Tool Lookups Added Value

- `current_regulatory_policy` helps both the corrective action plan and board risk report stay aligned with current long-term-care survey priorities and staffing policy changes.

## Blockers Requiring User Input

- The workflow pauses if the survey packet or staffing baseline is incomplete.
- Any resident-safety escalation overrides the normal remediation schedule.
