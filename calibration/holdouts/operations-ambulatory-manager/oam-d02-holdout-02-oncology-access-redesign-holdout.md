---
holdout_id: oam-d02-holdout-02-oncology-access-redesign-holdout
agent_slug: operations-ambulatory-manager
agents_relevant:
- operations-ambulatory-manager
deliverable_id: oam-d02
deliverable_title: Clinic Workflow Redesign Plan
seed_ref: operations-ambulatory-manager/oam-d02-seed-02-oncology-access-redesign-holdout.yaml
scenario_summary: Redesign plan for an outpatient oncology follow-up clinic focused
  on referral conversion, chair-ready coordination, and rapid new-patient intake.
complexity: routine
regulatory_as_of: '2026-04-09'
source_basis:
- 'National Cancer Institute Care Coordination resources: https://www.cancer.gov/'
- 'CMS Quality Payment Program: https://qpp.cms.gov/'
- 'HIPAA Privacy Rule summary from HHS: https://www.hhs.gov/hipaa/for-professionals/privacy/index.html'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Create a concise but complete redesign plan using oncology-relevant bottlenecks
  and measurable pilot criteria.
- Reflect coordination between clinic intake, referral review, and infusion or treatment
  readiness where applicable.
- Keep the plan operational and pragmatic rather than strategy-only.
---

# Clinic Workflow Redesign Plan

**Clinic/Site**: Northlight Oncology Follow-Up Clinic
**Specialty**: Medical Oncology
**Providers**: 5
**Date**: 2026-04-09
**Led by**: Avery Quist, Senior Clinic Operations Manager

## Current State Assessment
| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Average cycle time | 64 min | 50 min | 14 min |
| Check-in to room | 11 min | 6 min | 5 min |
| Room to provider | 12 min | 5 min | 7 min |
| Provider encounter | 26 min | 24 min | 2 min |
| Checkout | 6 min | 3 min | 3 min |
| 3NA (new patient) | 12 days | 7 days | 5 days |
| No-show rate | 6.8% | 5.0% | 1.8 pts |
| Fill rate | 94% | 90% | 4 pts |

## Root Cause Analysis
| Bottleneck | Root Cause | Evidence |
|------------|-----------|----------|
| New-patient delays | Outside records and pathology packets are incomplete at time of scheduling or arrival | Referral log review showed missing records in nearly one-third of new consult packets |
| Afternoon access compression | Urgent symptom visits share routine follow-up lanes and displace planned capacity | Same-day add-ons used routine follow-up slots on 9 of the last 15 clinic days |
| Provider wait after rooming | MA handoff occurs before treatment-readiness review is complete | Observation found repeated delays while imaging or lab context was gathered after rooming |
| Checkout congestion | Imaging, infusion timing, and return scheduling all begin only after provider exit | Checkout queue persisted after clinic close on 6 clinic days last month |

## Proposed Changes
| Change | Owner | Expected Impact | Implementation Timeline |
|--------|-------|-----------------|------------------------|
| Create referral-readiness checklist with records complete before scheduling final confirmation | New Patient Coordinator Rhea Sol | Reduce new-patient delays and improve 3NA by 3 days | Launch in 2 weeks |
| Carve out one urgent symptom lane per afternoon session with timed release rules | Access Supervisor Nolan Firth | Protect urgent access and lower template disruption | Start in week 2 |
| Add MA-provider treatment-readiness huddle before provider alert | Clinic Manager Tessa Mire | Reduce room to provider by 4 minutes | Training in week 1 |
| Move imaging and infusion coordination to in-room close-out supported by designated scheduler | Scheduling Lead Ivo Perrin | Cut checkout by 2 minutes and improve follow-up conversion | Pilot weeks 2-4 |
| Build daily referral aging review with oncology nurse navigator and scheduler | Operations Lead Mira Quen | Shorten referral-to-visit interval and prevent lost consults | Begin immediately |

## Pilot Plan
- **Pilot site/provider**: Northlight Oncology Follow-Up Clinic, GI oncology follow-up service, Dr. Elin Rohe and APP Sera Vale
- **Pilot duration**: 4 weeks
- **Success criteria**: cycle time at or below 54 minutes, room to provider at or below 7 minutes, new-patient 3NA at or below 9 days, urgent symptom lane utilization above 75%, checkout at or below 4 minutes
- **Measurement plan**: weekly timestamp extract, referral-readiness dashboard, daily urgent-slot utilization review, in-room close-out audit, end-of-day unresolved coordination log
- **Go/no-go decision date**: 2026-05-15

## Rollout Plan (Post-Pilot)
| Phase | Sites | Timeline | Milestones |
|-------|-------|----------|------------|
| Phase 1 | Remaining oncology follow-up providers at Northlight | Late May 2026 | Referral checklist and urgent lane rules active |
| Phase 2 | Adjacent hematology clinic | June 2026 | Shared close-out workflow and referral aging review deployed |
| Phase 3 | Regional oncology access center | July 2026 | Unified dashboard, sustainment review, scheduler training complete |
