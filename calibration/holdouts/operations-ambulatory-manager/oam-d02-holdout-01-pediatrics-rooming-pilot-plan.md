---
holdout_id: oam-d02-holdout-01-pediatrics-rooming-pilot-plan
agent_slug: operations-ambulatory-manager
agents_relevant:
- operations-ambulatory-manager
deliverable_id: oam-d02
deliverable_title: Clinic Workflow Redesign Plan
seed_ref: operations-ambulatory-manager/oam-d02-seed-01-pediatrics-rooming-pilot-plan.yaml
scenario_summary: Redesign plan for a pediatric clinic with vaccine-room bottlenecks,
  delayed rooming, and poor same-day sick access.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- 'CDC Immunization Schedules: https://www.cdc.gov/vaccines/schedules/'
- 'CLIA overview from CMS: https://www.cms.gov/regulations-and-guidance/legislation/clia'
- 'HIPAA Privacy Rule summary from HHS: https://www.hhs.gov/hipaa/for-professionals/privacy/index.html'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Produce a filled workflow redesign plan with measurable current-state gaps and a
  realistic pediatric pilot.
- Address rooming, immunization prep, and same-day sick access without reducing vaccine
  safety controls.
- Include a pilot structure and rollout sequence tied to concrete success criteria.
---

# Clinic Workflow Redesign Plan

**Clinic/Site**: Willowbrook Pediatrics Center
**Specialty**: Pediatrics
**Providers**: 6
**Date**: 2026-04-09
**Led by**: Nolan Pryce, Ambulatory Operations Manager

## Current State Assessment
| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Average cycle time | 71 min | 52 min | 19 min |
| Check-in to room | 16 min | 8 min | 8 min |
| Room to provider | 9 min | 4 min | 5 min |
| Provider encounter | 24 min | 22 min | 2 min |
| Checkout | 7 min | 4 min | 3 min |
| 3NA (new patient) | 8 days | 3 days | 5 days |
| No-show rate | 9.6% | 7.0% | 2.6 pts |
| Fill rate | 96% | 91% | 5 pts |

## Root Cause Analysis
| Bottleneck | Root Cause | Evidence |
|------------|-----------|----------|
| Vaccine-room queue | Vaccines are prepared only after provider orders are signed, causing batch waits after 1000 | Peak-hour observation found three visits per hour delayed for vaccine prep |
| Rooming delay | Sick and well-child visits arrive in the same early-morning lanes, and intake steps differ sharply by visit type | Timestamp review showed highest lobby backlog between 0815 and 1015 |
| Room turnover friction | Stocking and scale calibration are inconsistent by pod, so MAs lose time resetting rooms | Daily huddle logs showed repeated equipment and supply resets in Pod A and Pod C |
| Follow-up congestion | School forms, return scheduling, and vaccine documentation close-out are all handled at checkout | Checkout queue exceeded four families on 11 clinic days last month |

## Proposed Changes
| Change | Owner | Expected Impact | Implementation Timeline |
|--------|-------|-----------------|------------------------|
| Split AM template into sick-access lanes and well-child lanes with midday release rules | Access Lead Mara Sol | Reduce check-in to room by 4 minutes and improve 3NA by 3 days | Build in 10 days |
| Standardize pediatric MA rooming script including growth metrics, screening prep, and pre-provider vaccine readiness cues | Clinic Manager Inez Fallow | Reduce rooming variation and protect provider time | Training in week 1 |
| Create vaccine prep runner role during 0900-1200 surge using reassigned float support | Nurse Supervisor Tori Vale | Cut post-order vaccine delay by 5 minutes per eligible visit | Pilot weeks 2-5 |
| Reset exam rooms with pod-based 5S supply map and twice-daily scale verification | Operations Coordinator Jalen Rusk | Reduce turnover delays and checkout spillover | Launch week 1 |
| Move routine follow-up scheduling and school form routing into in-room warm handoff for well-child visits | Front Desk Supervisor Elara Finch | Reduce checkout by 2 minutes and raise follow-up completion | Pilot week 2 |

## Pilot Plan
- **Pilot site/provider**: Willowbrook Pediatrics Center Pod A, Dr. Kellan Rohe, Dr. Suri Vale, and NP Mina Hart
- **Pilot duration**: 5 weeks
- **Success criteria**: cycle time at or below 56 minutes, check-in to room at or below 10 minutes, same-day sick slots filled above 85%, vaccine-related delay events reduced by 50%, no-show rate at or below 8.0%
- **Measurement plan**: daily EHR timestamp extract, twice-weekly vaccine workflow observation, room stocking audit, same-day access utilization report, weekly parent text-survey pulse on wait time
- **Go/no-go decision date**: 2026-05-22

## Rollout Plan (Post-Pilot)
| Phase | Sites | Timeline | Milestones |
|-------|-------|----------|------------|
| Phase 1 | Remaining Willowbrook pods | June 2026 | Template conversion, MA competency validation, room setup standard live |
| Phase 2 | Sister pediatric clinic in same market | July 2026 | Same-day lane rules and vaccine prep runner model replicated |
| Phase 3 | Regional pediatric network | August-September 2026 | Shared dashboard, sustainment audits, family-access script standardization |
