---
holdout_id: pmm-d01-holdout-02-pine-terrace-fqhc-revalidation-watch
agent_slug: payer-medicare-medicaid-specialist
agents_relevant:
- payer-medicare-medicaid-specialist
deliverable_id: pmm-d01
deliverable_title: Medicare Enrollment Status Report
seed_ref: payer-medicare-medicaid-specialist/pmm-d01-seed-02-pine-terrace-fqhc-revalidation-watch.yaml
scenario_summary: Draft enrollment watchlist for a fictional FQHC operator focused
  on straightforward revalidation and ordering/referring maintenance.
complexity: routine
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 424.516
- 42 CFR 424.540
- CMS MLN provider enrollment education
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Keep the body concise and operational, not legalistic.
- Show a lower-complexity environment with mostly active records and a few near-term
  deadlines.
- Use realistic PECOS tracking and priority actions without introducing invented report
  sections.
---

# Medicare Enrollment Status Report

**Organization**: Pine Terrace Family Health Cooperative
**Report Date**: 2026-04-09
**Total Enrolled Providers**: 19
**Total TINs**: 1

## Enrollment Summary by Form Type
| Form | Active | Pending | Deactivated | Revoked |
|------|--------|---------|-------------|---------|
| CMS-855A (Institutional) | 1 | 0 | 0 | 0 |
| CMS-855B (Group) | 1 | 0 | 0 | 0 |
| CMS-855I (Individual) | 16 | 1 | 0 | 0 |
| CMS-855O (Ordering/Referring) | 2 | 0 | 0 | 0 |

## Revalidation Status
| Provider/Group | PECOS ID | Due Date | Status | Days Remaining |
|---------------|----------|----------|--------|----------------|
| Pine Terrace FQHC | PEC-73421002 | 2026-08-14 | Complete | 127 |
| Pine Terrace Medical Group | PEC-73421016 | 2026-07-02 | Not Started | 84 |
| Mira J. Hollis, MD | PEC-73433201 | 2026-05-12 | In Progress | 33 |
| Owen R. Field, NP | PEC-73433217 | 2026-05-21 | Not Started | 42 |
| Callen D. Pryor, DO | PEC-73433229 | 2026-10-06 | Complete | 180 |

## Action Items
| Priority | Issue | Provider | Action Required | Deadline |
|----------|-------|----------|----------------|----------|
| HIGH | Individual revalidation nearing due date | Mira J. Hollis, MD | Submit final PECOS attestations and verify clinic address | 2026-04-17 |
| HIGH | Individual revalidation not yet started | Owen R. Field, NP | Launch revalidation workflow and assign delegated official review | 2026-04-18 |
| MEDIUM | Outdated correspondence address | Jonah E. Trask, DPM | Update CMS-855O contact information in PECOS | 2026-04-24 |
| MEDIUM | Group revalidation planning | Pine Terrace Medical Group | Begin ownership and location verification package | 2026-05-01 |

## Enrollment Change Log (Last 90 Days)
| Date | Provider | Change Type | Status |
|------|----------|-------------|--------|
| 2026-03-25 | Owen R. Field, NP | Reassignment | Approved |
| 2026-03-08 | Jonah E. Trask, DPM | Location add | Approved |
| 2026-02-14 | Pine Terrace Medical Group | Reassignment | Approved |
| 2026-01-29 | Mira J. Hollis, MD | Location add | Approved |
