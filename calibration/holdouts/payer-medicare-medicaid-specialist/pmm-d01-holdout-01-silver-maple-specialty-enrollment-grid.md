---
holdout_id: pmm-d01-holdout-01-silver-maple-specialty-enrollment-grid
agent_slug: payer-medicare-medicaid-specialist
agents_relevant:
- payer-medicare-medicaid-specialist
deliverable_id: pmm-d01
deliverable_title: Medicare Enrollment Status Report
seed_ref: payer-medicare-medicaid-specialist/pmm-d01-seed-01-silver-maple-specialty-enrollment-grid.yaml
scenario_summary: Draft enrollment report for a fictional specialty enterprise with
  pending reassignment cleanup, multi-location updates, and one recent deactivation
  risk event.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 424.505
- 42 CFR 424.516
- 42 CFR 424.540
- CMS Medicare enrollment and PECOS guidance
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Follow the exact report structure from the prompt, including all four sections.
- Show at least one urgent item tied to deactivation or incomplete reassignment exposure.
- Include a realistic blend of group and individual enrollment records across multiple
  form types.
- Use the change log to make the action items feel operationally grounded.
---

# Medicare Enrollment Status Report

**Organization**: Silver Maple Specialty Care Holdings
**Report Date**: 2026-04-09
**Total Enrolled Providers**: 71
**Total TINs**: 5

## Enrollment Summary by Form Type
| Form | Active | Pending | Deactivated | Revoked |
|------|--------|---------|-------------|---------|
| CMS-855A (Institutional) | 0 | 0 | 0 | 0 |
| CMS-855B (Group) | 5 | 0 | 0 | 0 |
| CMS-855I (Individual) | 63 | 3 | 1 | 0 |
| CMS-855O (Ordering/Referring) | 6 | 0 | 0 | 0 |

## Revalidation Status
| Provider/Group | PECOS ID | Due Date | Status | Days Remaining |
|---------------|----------|----------|--------|----------------|
| Silver Maple Cardiology Group | PEC-61842010 | 2026-05-22 | In Progress | 43 |
| Silver Maple Neurology Group | PEC-61842024 | 2026-06-18 | Not Started | 70 |
| Silver Maple Pulmonary Group | PEC-61842037 | 2026-11-02 | Complete | 207 |
| Lena P. Corwin, MD | PEC-61855118 | 2026-04-30 | In Progress | 21 |
| Ezra D. Morrow, DO | PEC-61855135 | 2026-07-09 | Not Started | 91 |
| Iris K. Sloane, NP | PEC-61855144 | 2026-09-01 | Complete | 145 |

## Action Items
| Priority | Issue | Provider | Action Required | Deadline |
|----------|-------|----------|----------------|----------|
| URGENT | Reassignment not yet posted for current billing entity | Lena P. Corwin, MD | Confirm PECOS reassignment approval before releasing professional claims under neurology group NPI | 2026-04-11 |
| URGENT | Recent location update may be incomplete at suite level | Silver Maple Neurology Group | Reconcile both campus addresses and correspondence records against PECOS submission | 2026-04-15 |
| HIGH | Group revalidation approaching deadline | Silver Maple Cardiology Group | Finalize ownership disclosure and practice location verification | 2026-04-19 |
| HIGH | Second group revalidation not started | Silver Maple Neurology Group | Launch revalidation packet and assign delegated official review | 2026-04-22 |
| MEDIUM | Prior deactivation review needed | Ezra D. Morrow, DO | Confirm no claims were released during the brief inactive interval | 2026-04-25 |

## Enrollment Change Log (Last 90 Days)
| Date | Provider | Change Type | Status |
|------|----------|-------------|--------|
| 2026-04-05 | Silver Maple Neurology Group | Location add | Submitted in PECOS |
| 2026-03-30 | Lena P. Corwin, MD | Reassignment | In MAC review |
| 2026-03-17 | Ezra D. Morrow, DO | Voluntary termination | Closed |
| 2026-03-09 | Silver Maple Cardiology Group | Location add | Approved |
| 2026-02-26 | Iris K. Sloane, NP | New enrollment | Approved |
| 2026-01-28 | Silver Maple Imaging Group | Reassignment | Approved |
