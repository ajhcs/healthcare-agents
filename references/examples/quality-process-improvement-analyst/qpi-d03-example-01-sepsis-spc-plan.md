---
exemplar_id: qpi-d03-example-01-sepsis-spc-plan
agent_slug: quality-process-improvement-analyst
agents_relevant:
- quality-process-improvement-analyst
deliverable_id: qpi-d03
deliverable_title: SPC Monitoring Plan
scenario_summary: A sepsis-bundle reliability project needs a control-chart plan that
  tracks weekly completion and escalation triggers.
complexity: routine
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 482.21
- AHRQ Common Formats
- CMS sepsis quality resources
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---
# SPC Monitoring Plan

**Project**: Sepsis Bundle Completion Reliability
**Primary Metric**: 48-hour sepsis bundle completion rate
**Chart Type**: p-chart
**Data Steward**: Marcus Bell, RN, CPHQ

## Operational Definition
- Numerator: sepsis cases with the full bundle completed within 48 hours of recognition
- Denominator: all adult sepsis cases meeting the inclusion criteria for the reporting period
- Inclusion/Exclusion rules: Include adult inpatients and emergency admissions with confirmed sepsis; exclude transfers with completed bundles from the sending facility and cases without a confirmatory chart review
- Source system: EHR sepsis registry and chart abstraction file

## Baseline Signal
| Month | Observed Rate | Centerline | Comment |
|---|---|---|---|
| January | 72% | 75% | below centerline |
| February | 74% | 75% | stable |
| March | 69% | 75% | one special-cause dip |
| April | 77% | 75% | recovery after bundle education |

## Review Cadence
| Review Level | Frequency | Owner | Required Action for Signal |
|---|---|---|---|
| Frontline huddle | Daily | Charge nurse | Confirm missed bundles and recent sepsis activations |
| Manager review | Weekly | Quality analyst | Update the run chart and assign defect owners |
| Executive review | Monthly | Medical director | Escalate sustained deterioration or missing data |

## Special Cause Rules
- One point beyond 3 sigma requires same-day review
- Eight points on one side of the centerline trigger a process review
- Six points trending in the same direction require a leadership huddle

## Escalation Path
| Signal | First Response | Escalation Owner | Due Within |
|---|---|---|---|
| Special cause deterioration | Review the case and validate the chart abstraction | Quality director | 24 hours |
| Missing data / broken measure | Fix the source-file issue and re-run the extract | EHR reporting lead | 48 hours |

## Notes
- Organization: Pine Valley Hospital
- Measurement objective: keep bundle completion visible in real time so the team can react to deterioration before month end
- Data validation: reconcile source and denominator weekly for the first 8 weeks, then monthly after stabilization
