---
exemplar_id: qis-d02-example-01-mips-cardiology-action-plan
agent_slug: quality-improvement-specialist
agents_relevant:
- quality-improvement-specialist
deliverable_id: qis-d02
deliverable_title: Quality Improvement Action Plan
scenario_summary: A specialty group action plan addresses a weak MIPS blood pressure
  control measure with workflow, data capture, and physician accountability interventions.
complexity: routine
mcp_servers_relevant:
- current_regulatory_policy
- provider_directory
regulatory_as_of: '2026-04-09'
source_basis:
- 'CMS Quality Payment Program overview: https://qpp.cms.gov/'
- 'CMS quality measure resources: https://www.cms.gov/medicare/quality'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Quality Improvement Action Plan

**Measure**: MIPS Quality Measure 236 / Controlling High Blood Pressure
**Current Rate**: 61.4% | **Target Rate**: 74.0% | **Gap**: 12.6 percentage points
**Product Line**: Medicare
**Plan Owner**: Rowan Mire, Director of Ambulatory Quality
**Effective Date**: 2026-04-09

## Root Cause Analysis
| Contributing Factor | Evidence | Impact Level |
|--------------------|----------|-------------|
| Repeat blood pressure not documented after elevated intake reading | 38% of failed numerator cases had an initial elevated reading with no second documented value | High |
| Structured vital sign capture inconsistent across three clinic pods | EHR audit found 14% of encounters with blood pressure entered into comment fields rather than discrete vitals | High |
| Denominator leakage from inactive attributed clinicians | Registry included 112 encounters tied to two departed clinicians and one retired satellite office | Medium |
| Follow-up scheduling not aligned to uncontrolled hypertension workflow | 27% of members with uncontrolled blood pressure lacked a visit or remote check within 30 days | High |
| Physician variation across sites | Top-performing cardiologist panel was 78.9%; lowest was 49.7% using the same patient mix band | Medium |

## Intervention Plan
| Intervention | Target Population | Responsible Party | Start Date | Expected Impact | Measure of Success |
|-------------|------------------|------------------|-----------|----------------|-------------------|
| Standardize rooming protocol with automatic repeat reading for elevated blood pressure | All adult Medicare encounters in cardiology clinics | Clinic Operations Manager | 2026-04-15 | +4.0 pts | Repeat reading documented in 90% of eligible elevated visits |
| Lock blood pressure numerator logic to discrete EHR fields and remove comment-field workaround | All clinicians and rooming staff | EHR Optimization Lead | 2026-04-22 | +2.5 pts | Discrete capture reaches 98% of audited encounters |
| Clean attributed clinician roster and validate active rendering NPIs before monthly reports | Registry denominator and provider attribution file | Quality Analytics Supervisor | 2026-04-18 | +1.2 pts | Zero inactive clinicians on monthly output |
| Launch nurse-led hypertension follow-up clinic for uncontrolled members within 30 days | Members with last documented BP above target | Nurse Manager, CV Service Line | 2026-05-01 | +3.1 pts | 70% of flagged members receive a follow-up touch within 30 days |
| Publish provider scorecards with peer ranking and case review for bottom quartile performers | Cardiologists and advanced practice clinicians | Chief Medical Officer | 2026-05-06 | +1.8 pts | Provider spread narrows to less than 15 pts by quarter end |

## Monitoring Plan
| Metric | Frequency | Data Source | Responsible Party | Escalation Threshold |
|--------|-----------|------------|------------------|---------------------|
| Measure 236 numerator rate | Weekly | MIPS registry extract | Quality Analytics Supervisor | Rate falls below 63% for two consecutive weeks |
| Repeat blood pressure documentation rate | Weekly | EHR vitals audit | Clinic Operations Manager | Below 85% |
| Discrete vital sign capture compliance | Biweekly | EHR structured data audit | EHR Optimization Lead | Below 95% |
| 30-day follow-up completion for uncontrolled members | Weekly | Scheduling and care management work queue | Nurse Manager, CV Service Line | Below 60% |
| Provider outlier performance review completion | Monthly | Provider scorecard file | Chief Medical Officer | Any provider remains below 55% for two reporting cycles |

## Timeline & Milestones
| Milestone | Target Date | Status | Notes |
|-----------|------------|--------|-------|
| Validate current denominator and remove inactive clinicians | 2026-04-18 | In progress | Provider roster crosswalk sent to credentialing and analytics |
| Deploy revised rooming protocol to all clinics | 2026-04-25 | Planned | Staff education packet approved |
| Complete EHR documentation build and audit script | 2026-04-29 | Planned | Joint build with informatics and reporting |
| Open nurse-led hypertension follow-up sessions | 2026-05-01 | Planned | Two half-day templates reserved each week |
| Issue first physician scorecard and peer comparison review | 2026-05-10 | Planned | Uses rolling 90-day denominator |
| Present 45-day progress check to ambulatory quality council | 2026-05-29 | Planned | Will include numerator lift and workflow adherence |
| Reforecast end-of-year MIPS quality score | 2026-06-12 | Planned | Uses current decile trend and updated completeness file |

## Source Notes
- Measure selection and scoring assumptions align to the CMS Quality Payment Program public program guidance.
- If the current measure specification year or active clinician roster is in question, verify the latest CMS guidance and rendering NPI file before issuing an external-facing recommendation.
