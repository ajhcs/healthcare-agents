---
exemplar_id: oam-d02-example-01-hospital-based-specialty-redesign
agent_slug: operations-ambulatory-manager
agents_relevant:
- operations-ambulatory-manager
deliverable_id: oam-d02
deliverable_title: Clinic Workflow Redesign Plan
scenario_summary: Workflow redesign plan for a hospital-based cardiology clinic with
  long room-to-provider delays and unstable same-day access.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
- provider_directory
regulatory_as_of: '2026-04-09'
source_basis:
- 'CMS Quality Payment Program: https://qpp.cms.gov/'
- 'AHRQ CAHPS Clinician & Group Survey: https://www.ahrq.gov/cahps/surveys-guidance/cg/index.html'
- 'CLIA overview from CMS: https://www.cms.gov/regulations-and-guidance/legislation/clia'
- 'HIPAA Privacy Rule summary from HHS: https://www.hhs.gov/hipaa/for-professionals/privacy/index.html'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Clinic Workflow Redesign Plan

**Clinic/Site**: Harbor Point Heart Center
**Specialty**: Cardiology
**Providers**: 8
**Date**: 2026-04-09
**Led by**: Selah Quill, Regional Ambulatory Operations Director

## Current State Assessment
| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Average cycle time | 82 min | 60 min | 22 min |
| Check-in to room | 14 min | 7 min | 7 min |
| Room to provider | 18 min | 5 min | 13 min |
| Provider encounter | 31 min | 24 min | 7 min |
| Checkout | 9 min | 4 min | 5 min |
| 3NA (new patient) | 19 days | 10 days | 9 days |
| No-show rate | 10.8% | 8.0% | 2.8 pts |
| Fill rate | 97% | 92% | 5 pts |

## Root Cause Analysis
| Bottleneck | Root Cause | Evidence |
|------------|-----------|----------|
| Lobby queue from 0730-0830 | All new patients arrive at top of hour; insurance scan and ECG consent handled at arrival | Three-week timestamp review showed 41% of AM arrivals within a 20-minute window |
| Room to provider delay | Providers waiting for MA handoff, ECG upload, and overdue medication reconciliation | Time-motion study on 54 visits found incomplete rooming in 37% of established visits |
| Visit duration variation | New consults mixed with routine follow-ups inside the same template lane | Template audit showed 30-minute new consult slots scheduled into 20-minute established slots 11 times in one month |
| Checkout backlog | Follow-up scheduling, external test coordination, and prior authorization handoff all occur at one desk | Checkout queue exceeded 4 patients on 18 of 22 clinic days |
| Access bottleneck | New patient supply protected only two mornings per week and gets released 10 days out | 3NA increased after referral volume rose 14% in the last quarter |

## Proposed Changes
| Change | Owner | Expected Impact | Implementation Timeline |
|--------|-------|-----------------|------------------------|
| Create split-flow intake with pre-visit insurance verification and ECG consent completed before arrival | Access Manager Nira Vale | Reduce check-in to room by 5 minutes | Build in 2 weeks, launch week 3 |
| Standardize cardiology MA rooming bundle: vitals, med rec, outside test reconciliation, EKG ready flag before provider alert | Clinic Manager Tamsin Reeve | Reduce room to provider by 8 minutes and increase chart quality | Training week 1, audit weeks 2-6 |
| Rebuild provider templates into four lane types: new consult, device follow-up, imaging review, urgent add-on | Cadence Template Analyst Ivo Deren | Lower visit-duration mismatch and improve 3NA by 5 days | Draft in 10 days, go-live after pilot |
| Reserve two same-day urgent slots per full session and release at 1100/1500 if unused | Medical Director Rowan Pike | Improve urgent access without sustained overbooking | Start with pilot provider week 4 |
| Move follow-up scheduling for routine returns into exam room close-out using MA warm handoff | Front Desk Supervisor Kira Moss | Reduce checkout time by 3 minutes and improve follow-up conversion | Pilot in two pods for 4 weeks |
| Add 1400 referral work queue review with scheduler and nurse lead | Referral Coordinator Jules Fen | Shorten referral-to-visit interval and prevent unused new-patient capacity | Begin immediately |

## Pilot Plan
- **Pilot site/provider**: Harbor Point Heart Center, Pod B, providers Dr. Lyra Fen and Dr. Orin Vale
- **Pilot duration**: 6 weeks
- **Success criteria**: cycle time at or below 65 minutes, room-to-provider at or below 7 minutes, 3NA down to 12 days or fewer, no-show rate at or below 9.0%, follow-up scheduling at checkout or in-room above 80%
- **Measurement plan**: weekly EHR timestamp extract, twice-weekly rooming audit, referral queue aging report, CG-CAHPS office-staff pulse survey, daily huddle issue log
- **Go/no-go decision date**: 2026-05-29

## Rollout Plan (Post-Pilot)
| Phase | Sites | Timeline | Milestones |
|-------|-------|----------|------------|
| Phase 1 | Harbor Point remaining 2 pods | June 2026 | Template conversion complete, MA competency sign-off complete, checkout warm handoff active |
| Phase 2 | Bayline Cardiology North and South | July-August 2026 | Standard lane templates, same-day carve-out, referral queue review replicated |
| Phase 3 | Hospital-based subspecialty clinics with similar access profile | September 2026 | Executive review of control charts, site scorecards, sustainment audits |
