---
exemplar_id: pmm-d01-example-01-sunrise-fqhc-enrollment-snapshot
agent_slug: payer-medicare-medicaid-specialist
agents_relevant:
- payer-medicare-medicaid-specialist
deliverable_id: pmm-d01
deliverable_title: Medicare Enrollment Status Report
scenario_summary: Draft enrollment status report for a fictional FQHC network preparing
  for upcoming PECOS revalidation deadlines.
complexity: routine
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR Part 424, Subpart P
- CMS Medicare Provider Enrollment resources
- PECOS program guidance from CMS
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Medicare Enrollment Status Report

**Organization**: Sunrise Harbor Community Health Network
**Report Date**: 2026-04-09
**Total Enrolled Providers**: 28
**Total TINs**: 2

## Enrollment Summary by Form Type
| Form | Active | Pending | Deactivated | Revoked |
|------|--------|---------|-------------|---------|
| CMS-855A (Institutional) | 1 | 0 | 0 | 0 |
| CMS-855B (Group) | 2 | 0 | 0 | 0 |
| CMS-855I (Individual) | 24 | 1 | 0 | 0 |
| CMS-855O (Ordering/Referring) | 3 | 0 | 0 | 0 |

## Revalidation Status
| Provider/Group | PECOS ID | Due Date | Status | Days Remaining |
|---------------|----------|----------|--------|----------------|
| Sunrise Harbor FQHC Main Site | PEC-41022173 | 2026-07-15 | In Progress | 97 |
| Sunrise Harbor Medical Group | PEC-41022518 | 2026-08-02 | Not Started | 115 |
| Rowan E. Vance, MD | PEC-41033804 | 2026-06-01 | In Progress | 53 |
| Imani D. Kerr, NP | PEC-41033819 | 2026-05-28 | Not Started | 49 |
| Elias P. North, PA-C | PEC-41033841 | 2026-09-10 | Complete | 154 |

## Action Items
| Priority | Issue | Provider | Action Required | Deadline |
|----------|-------|----------|----------------|----------|
| URGENT | CMS-855I revalidation packet not yet submitted | Imani D. Kerr, NP | Submit PECOS revalidation and confirm practice location roster | 2026-04-23 |
| HIGH | Secondary practice location missing from reassignment review | Rowan E. Vance, MD | Validate all reassigned group relationships under Type 2 NPI 1887004401 | 2026-04-18 |
| HIGH | Ordering/referring profile not linked to current clinic address | Noor H. Ellison, DPM | Update PECOS correspondence and rendering location data | 2026-04-25 |
| MEDIUM | Legacy taxonomy crosswalk needs cleanup | Sunrise Harbor Medical Group | Reconcile internal provider master file to PECOS taxonomy selection | 2026-05-03 |
| MEDIUM | Application fee planning for next cycle | Sunrise Harbor FQHC Main Site | Reserve institutional application fee funds and verify payment workflow | 2026-05-15 |

## Enrollment Change Log (Last 90 Days)
| Date | Provider | Change Type | Status |
|------|----------|-------------|--------|
| 2026-04-04 | Talia J. Mercer, LCSW | New enrollment | Submitted in PECOS |
| 2026-03-29 | Sunrise Harbor Medical Group | Location add | Approved |
| 2026-03-12 | Rowan E. Vance, MD | Reassignment | Approved |
| 2026-02-27 | Noor H. Ellison, DPM | Location add | In MAC review |
| 2026-02-11 | Helena Brook Pediatrics Division | Voluntary termination | Closed in PECOS |
| 2026-01-30 | Elias P. North, PA-C | Reassignment | Approved |

**Regulatory notes**
- Enrollment changes affecting practice locations and adverse legal actions should be reported within the timelines set out at 42 CFR 424.516.
- Billing should remain blocked for any individual or group until PECOS reflects active enrollment or approved reassignment consistent with 42 CFR 424.505 and 42 CFR 424.510.
- Revalidation failure can lead to deactivation of billing privileges under 42 CFR 424.540; this report prioritizes due dates with less than 60 days remaining.

**Operational interpretation**
- Current exposure is concentrated in individual practitioner revalidations rather than institutional enrollment.
- No active deactivations are on file as of the report date, but two practitioner records require immediate follow-up to avoid claim interruption.
- If current CMS enrollment screening or fee requirements have changed since the last quarterly refresh, verify the latest CMS enrollment guidance before final submission.
