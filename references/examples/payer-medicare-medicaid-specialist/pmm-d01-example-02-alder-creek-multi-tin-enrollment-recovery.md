---
exemplar_id: pmm-d01-example-02-alder-creek-multi-tin-enrollment-recovery
agent_slug: payer-medicare-medicaid-specialist
agents_relevant:
- payer-medicare-medicaid-specialist
deliverable_id: pmm-d01
deliverable_title: Medicare Enrollment Status Report
scenario_summary: Enrollment recovery report for a fictional multi-site physician
  enterprise after one clinic experienced a brief PECOS deactivation.
complexity: moderate
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 424.516
- 42 CFR 424.535
- 42 CFR 424.540
- CMS MLN Medicare Provider Enrollment education materials
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Medicare Enrollment Status Report

**Organization**: Alder Creek Specialty Physicians Alliance
**Report Date**: 2026-04-09
**Total Enrolled Providers**: 63
**Total TINs**: 4

## Enrollment Summary by Form Type
| Form | Active | Pending | Deactivated | Revoked |
|------|--------|---------|-------------|---------|
| CMS-855A (Institutional) | 0 | 0 | 0 | 0 |
| CMS-855B (Group) | 4 | 0 | 1 | 0 |
| CMS-855I (Individual) | 56 | 2 | 1 | 0 |
| CMS-855O (Ordering/Referring) | 7 | 0 | 0 | 0 |

## Revalidation Status
| Provider/Group | PECOS ID | Due Date | Status | Days Remaining |
|---------------|----------|----------|--------|----------------|
| Alder Creek Cardiology Group | PEC-52281001 | 2026-04-28 | In Progress | 19 |
| Alder Creek Pulmonary Group | PEC-52281014 | 2026-10-05 | Complete | 179 |
| Alder Creek Endocrine Group | PEC-52281026 | 2026-09-14 | Not Started | 158 |
| Maris L. Fen, MD | PEC-52293110 | 2026-05-17 | Not Started | 38 |
| Soren T. Vale, NP | PEC-52293128 | 2026-06-30 | In Progress | 82 |
| Alder Creek Cardiology East Clinic | PEC-52284577 | 2026-03-21 | Complete | 0 |

## Action Items
| Priority | Issue | Provider | Action Required | Deadline |
|----------|-------|----------|----------------|----------|
| URGENT | Prior deactivation requires claims impact reconciliation | Alder Creek Cardiology East Clinic | Reconcile all dates of service from 2026-03-22 through 2026-03-31 against claim holds and resubmission log | 2026-04-14 |
| URGENT | Individual reassignment absent in group roster | Maris L. Fen, MD | Finalize PECOS reassignment to Type 2 NPI 1668002146 before next billing cycle | 2026-04-12 |
| HIGH | Group revalidation nearing deadline | Alder Creek Cardiology Group | Submit remaining ownership attestation and practice location confirmation | 2026-04-16 |
| HIGH | Site address mismatch between billing system and PECOS | Alder Creek Endocrine Group | Update suite number and correspondence address across enrollment and payer master files | 2026-04-19 |
| MEDIUM | Ordering/referring roster review pending | Enterprise provider data team | Validate all CMS-855O-only practitioners against active ordering privileges | 2026-04-30 |

## Enrollment Change Log (Last 90 Days)
| Date | Provider | Change Type | Status |
|------|----------|-------------|--------|
| 2026-04-02 | Alder Creek Cardiology East Clinic | Location add | Approved |
| 2026-03-31 | Alder Creek Cardiology East Clinic | Voluntary termination | Closed |
| 2026-03-26 | Soren T. Vale, NP | Reassignment | Approved |
| 2026-03-18 | Maris L. Fen, MD | New enrollment | Submitted in PECOS |
| 2026-02-21 | Alder Creek Endocrine Group | Location add | Approved |
| 2026-01-24 | Theo J. Mire, DO | Voluntary termination | Closed |

**Regulatory notes**
- Failure to report practice location and other material enrollment changes within the required timeframe creates revocation and overpayment exposure under 42 CFR 424.516 and 42 CFR 424.535.
- Deactivation interrupts billing privileges under 42 CFR 424.540 and should trigger immediate claims hold and retrospective reconciliation.
- Group-to-individual reassignment alignment should remain current before services are billed under the group NPI.

**Operational interpretation**
- Enterprise risk is elevated because one clinic experienced a short deactivation window and one physician reassignment remains incomplete.
- No revocations are on file, and the main corrective priority is preventing claim submission tied to incomplete reassignment or stale location data.
- If CMS has issued updated PECOS revalidation or screening instructions this quarter, confirm them before resubmission of the final cardology group packet.
