---
holdout_id: qpi-d03-holdout-01-sepsis-spc-plan
agent_slug: quality-process-improvement-analyst
agents_relevant:
- quality-process-improvement-analyst
deliverable_id: qpi-d03
deliverable_title: SPC Monitoring Plan
seed_ref: quality-process-improvement-analyst/qpi-d03-seed-01-sepsis-spc-plan.yaml
scenario_summary: A sepsis-bundle reliability project needs a control-chart plan that
  tracks weekly completion and escalation triggers.
complexity: routine
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 482.21
- AHRQ Common Formats
- CMS sepsis quality resources
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Use the exact SPC Monitoring Plan structure from the prompt template with filled
  synthetic values.
- Keep the plan operational, with a clear operational definition and escalation path.
- Include a baseline signal and special-cause rules that a manager could act on immediately.
---
# SPC Monitoring Plan

**Project**: Sepsis Bundle Completion Reliability
**Primary Metric**: 48-hour sepsis bundle completion rate
**Chart Type**: p-chart
**Data Steward**: Ivy Turner, MPH

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
- Organization: Crescent Memorial Hospital
- Measurement objective: keep bundle completion visible in real time so the team can react to deterioration before month end
- Data validation: reconcile source and denominator weekly for the first 8 weeks, then monthly after stabilization
