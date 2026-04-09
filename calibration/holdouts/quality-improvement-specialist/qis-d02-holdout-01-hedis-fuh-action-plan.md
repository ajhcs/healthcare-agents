---
holdout_id: qis-d02-holdout-01-hedis-fuh-action-plan
agent_slug: quality-improvement-specialist
agents_relevant:
- quality-improvement-specialist
deliverable_id: qis-d02
deliverable_title: Quality Improvement Action Plan
seed_ref: quality-improvement-specialist/qis-d02-seed-01-hedis-fuh-action-plan.yaml
scenario_summary: A focused HEDIS action plan addresses poor behavioral health follow-up
  after psychiatric discharge in a Medicaid population.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- 'NCQA HEDIS overview and measure-year resources: https://www.ncqa.org/hedis/'
- 'CMS behavioral health and quality resources: https://www.cms.gov/medicare/quality'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Identify the measure precisely and translate the gap into operational actions tied
  to scheduling, notification, and network access.
- Include a root cause table, intervention table, monitoring plan, and timeline using
  completed synthetic content.
- Reflect HEDIS discipline such as denominator awareness, follow-up window sensitivity,
  and data source limitations.
- Keep the actions realistic for a health plan and behavioral health network.
---

# Quality Improvement Action Plan

**Measure**: FUH 7-Day / Follow-Up After Hospitalization for Mental Illness
**Current Rate**: 49.8% | **Target Rate**: 63.0% | **Gap**: 13.2 percentage points
**Product Line**: Medicaid
**Plan Owner**: Sela Venn, Behavioral Health Quality Manager
**Effective Date**: 2026-04-09

## Root Cause Analysis
| Contributing Factor | Evidence | Impact Level |
|--------------------|----------|-------------|
| Delayed discharge notification from main psychiatric facility | 41% of missed cases first appeared in the plan file after the first post-discharge business day | High |
| Weekend discharge workflow weak | Saturday and Sunday discharges close follow-up at a materially lower rate than weekday discharges | High |
| Limited outpatient psychiatry access in rural counties | Appointment lead times exceed the seven-day window in two service areas | High |
| Closed-loop scheduling not performed before discharge | Too many members leave inpatient care without a booked behavioral health visit | Medium |
| Claims-only completion view understates timely follow-up | Encounter files from one delegated group load on a delayed cycle | Medium |

## Intervention Plan
| Intervention | Target Population | Responsible Party | Start Date | Expected Impact | Measure of Success |
|-------------|------------------|------------------|-----------|----------------|-------------------|
| Receive daily discharge census by 8 a.m. from all contracted psychiatric facilities | All Medicaid behavioral health discharges | Network Operations Lead | 2026-04-15 | +3.0 pts | 95% of discharges loaded within one calendar day |
| Require booked follow-up before discharge for high-volume inpatient partners | Members discharged from top three psychiatric facilities | Behavioral Health Medical Director | 2026-04-22 | +4.2 pts | 70% of discharges leave with an appointment in hand |
| Stand up weekend tele-behavioral bridge slots | Weekend discharges in all counties | Access Program Manager | 2026-05-01 | +2.6 pts | Weekend completion gap falls by at least 5 pts |
| Build county-level rapid referral panel and escalation list | Members in the two lowest-access rural counties | Provider Relations Manager | 2026-05-03 | +1.8 pts | Seven-day access secured for 80% of flagged rural members |
| Run three-times-weekly missed-opportunity file with care manager outreach | Members at day 3 to day 5 post-discharge without a closed visit | Care Management Supervisor | 2026-04-18 | +1.6 pts | 60% of flagged members receive outreach within 24 hours |

## Monitoring Plan
| Metric | Frequency | Data Source | Responsible Party | Escalation Threshold |
|--------|-----------|------------|------------------|---------------------|
| FUH 7-Day rolling rate | Weekly | HEDIS operational mart | Behavioral Health Quality Analyst | Below 51% for two weekly runs |
| Discharge feed timeliness | Daily | Facility census interface log | Network Operations Lead | Any major facility misses one day of transmission |
| Scheduled-before-discharge completion | Weekly | Inpatient partner roster | Behavioral Health Medical Director | Below 60% |
| Weekend bridge visit utilization | Weekly | Tele-behavioral scheduling file | Access Program Manager | Below 20 booked visits per week after launch |
| Rural county unresolved access cases | Twice weekly | Care management queue | Provider Relations Manager | More than 15 open cases older than 48 hours |

## Timeline & Milestones
| Milestone | Target Date | Status | Notes |
|-----------|------------|--------|-------|
| Finalize discharge roster protocol with top inpatient partners | 2026-04-15 | Planned | Includes secure file timing and contact tree |
| Launch missed-opportunity work queue | 2026-04-18 | Planned | Uses day 3 and day 5 trigger logic |
| Begin booked-before-discharge expectation at top three facilities | 2026-04-22 | Planned | Facility leadership signoff required |
| Activate weekend tele-behavioral bridge scheduling | 2026-05-01 | Planned | Staffing model pending final approval |
| Publish first county-level access scorecard | 2026-05-08 | Planned | Includes rural escalation summary |
| Report 30-day impact to quality committee | 2026-05-15 | Planned | Focus on discharge timeliness and weekend performance |
