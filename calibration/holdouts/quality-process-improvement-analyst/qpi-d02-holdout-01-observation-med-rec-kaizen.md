---
holdout_id: qpi-d02-holdout-01-observation-med-rec-kaizen
agent_slug: quality-process-improvement-analyst
agents_relevant:
- quality-process-improvement-analyst
deliverable_id: qpi-d02
deliverable_title: Kaizen Event Charter
seed_ref: quality-process-improvement-analyst/qpi-d02-seed-01-observation-med-rec-kaizen.yaml
scenario_summary: An observation-unit discharge workflow needs a short Kaizen event
  to reduce late medication reconciliation and delayed teaching.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 482.21
- AHRQ TeamSTEPPS and process-improvement resources
- CMS patient safety resources
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Use the exact Kaizen Event Charter structure from the prompt template with filled
  synthetic values.
- Keep the event charter concrete enough for a real improvement team to execute.
- Include measurable goals, team roles, and sustainability actions.
---
# Kaizen Event Charter

**Event Title**: Observation Discharge Medication Reconciliation Kaizen
**Process**: Observation-unit discharge to home workflow
**Event Dates**: 2026-05-12 to 2026-05-14
**Facilitator**: Nina Rossi, PMP
**Executive Sponsor**: Erin Blake, DO, Medical Director

## Problem Statement
Twenty-eight percent of observation discharges leave the unit before the final medication list is reconciled and the discharge teaching is documented.

## Scope
- **In scope**: medication reconciliation, discharge teaching, follow-up appointment booking, nurse and pharmacist handoff
- **Out of scope**: inpatient admission criteria, pharmacy formulary changes, payer contract work
- **Start point**: observation discharge decision
- **End point**: patient leaves the unit with completed discharge instructions

## Goals
| Metric | Baseline | Target | Measurement Method |
|---|---|---|---|
| Late med rec rate | 28% | 8% | EHR discharge audit |
| Average final signature time | 6.2 hours | 2.0 hours | timestamp review |
| Callback completion within 72 hours | 72% | 95% | post-discharge outreach log |

## Team Members
| Name | Role/Department | Availability |
|---|---|---|
| Mina Solis | Observation nursing | Full-time |
| Jordan Bell | Pharmacy | Full-time |
| Tara Iqbal | Case management | Partial |
| Luis Navarro | Hospitalist | Partial |
| Grace Chen | EHR analyst | Partial |

## Pre-Work Required
- Status: Complete — Baseline data collected for the last 60 observation discharges
- Status: Complete — Current-state walk-through completed on both day and evening shifts
- Status: Complete — Team members notified and coverage arranged
- Status: Complete — Room, whiteboard, and EHR report access reserved
- Status: Complete — Leadership report-out scheduled for the last day of the event

## Sustainability Plan
| Action | Owner | Frequency | Audit Date |
|---|---|---|---|
| Daily discharge audit for the first two weeks | Observation charge nurse | Daily | 2026-05-28 |
| Weekly defect review | Pharmacy supervisor | Weekly | 2026-06-12 |
| Monthly sustainment review | Quality improvement director | Monthly | 2026-07-14 |

## Notes
- Organization: Northlake Medical Network
- Event focus: remove late handoff steps and build a single discharge closeout point
- The charter is designed for a 3-day improvement event with a 30/60/90-day sustain check
