---
exemplar_id: him-d01-example-03-community-hospital-retention-baseline
agent_slug: healthit-information-manager
agents_relevant:
- healthit-information-manager
deliverable_id: him-d01
deliverable_title: Record Retention Schedule
scenario_summary: A single-state community hospital needs a clean retention schedule
  for clinical, ROI, and operations records with a straightforward destruction protocol.
complexity: routine
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 482.24(b)(1) and 42 CFR 482.24(c)(2), medical record retention and authentication,
  LII e-CFR
- 45 CFR 164.530(j), HIPAA documentation retention for six years, LII e-CFR
- NIST SP 800-88 Rev. 2, Guidelines for Media Sanitization, CSRC
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Record Retention Schedule

**Organization**: Northgate Community Hospital
**Effective Date**: 2026-04-09
**State(s)**: Ohio
**Approved By**: HIM Director, Compliance Officer, General Counsel
**Review Cycle**: Annual

## Retention Matrix

| Record Category | Record Type | Retention Period | Basis | Destruction Method |
|----------------|-------------|------------------|-------|-------------------|
| Medical Records — Adult | Complete inpatient and outpatient chart | 10 years from last encounter | 42 CFR 482.24(b)(1); Ohio state-law overlay in legal inventory | Cross-cut shredding for paper; NIST SP 800-88 Rev. 2 for electronic media |
| Medical Records — Minor | Complete chart | Until age 21 or 10 years from last encounter, whichever is later | State minor-retention overlay; medical record services policy | Same as above |
| Release of Information | Valid authorizations, request logs, correspondence | 6 years from creation or last effective date | 45 CFR 164.530(j) | Secure destruction after legal hold release |
| Accounting of Disclosures | Disclosure log and supporting documentation | 6 years | 45 CFR 164.530(j); 45 CFR 164.528 recordkeeping practice | Secure destruction after reconciliation |
| Claims Support | Coding queries, chart excerpts, payer packets | 10 years from final account closure | Medicare audit readiness; internal revenue-cycle policy | Shred or purge after hold review |
| EMTALA Files | Medical screening and stabilization records | 5 years | CMS hospital conditions of participation and EMTALA recordkeeping practice | Cross-cut shred; purge scanned copies |
| Employee Health | Occupational health records | Employment plus 30 years | 29 CFR 1910.1020(d)(1) | NIST SP 800-88 Rev. 2 |
| Litigation Hold Files | Hold notices, scope memos, release letters | Until written release from Legal | Spoliation prevention policy | Not destroyed while hold is active |
| Backfile Scans | Imaging-quality verified scanned legacy pages | Same as source record category | Source-record retention rule | Purge only after quality assurance and indexing sign-off |

## Litigation Hold Protocol
- All scheduled destruction stops immediately when Legal issues a hold notice.
- HIM records the affected record series, date received, custodian, and matter name.
- Destruction resumes only after written release from Legal and Compliance.
- Any record touched by a hold stays in the destruction exception list until reconciliation is complete.

## Destruction Log
| Destruction Date | Record Type | Date Range | Method | Performed By | Witnessed By |
|-----------------|-------------|------------|--------|-------------|-------------|
| 2026-06-30 | ROI logs | 2019-01-01 to 2020-12-31 | Secure digital purge | Records Systems Analyst | HIM Supervisor |
| 2026-06-30 | Paper discharge packets | 2015-01-01 to 2016-12-31 | Cross-cut shredding | Vendor certified destruction team | Compliance Officer |

## Operational Notes
- Adult records remain eligible only after all payer, audit, and legal exceptions clear.
- Minor charts are indexed by discharge date and birthday to prevent premature destruction.
- Electronic destruction uses validated sanitization controls and certificate retention.
- Annual review includes state-law changes, CMS updates, and discovery-risk review.
