---
holdout_id: him-d01-holdout-02-hybrid-pediatric-hold-profile
agent_slug: healthit-information-manager
agents_relevant:
- healthit-information-manager
deliverable_id: him-d01
deliverable_title: Record Retention Schedule
seed_ref: healthit-information-manager/him-d01-seed-02-hybrid-pediatric-hold-profile.yaml
scenario_summary: A pediatric hospital with hybrid paper and electronic charts needs
  a retention schedule that prevents premature destruction during conversion and custody
  disputes.
complexity: routine
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 482.24(b)(1), record retention for hospital medical records, LII e-CFR
- NIST SP 800-88 Rev. 2, media sanitization and validated disposal controls, CSRC
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- The schedule must include a pediatric or minor-record retention rule and a separate
  litigation-hold rule.
- The destruction section must distinguish paper shredding from electronic sanitization.
- The schedule must include a rule for scanned backfile records and state that they
  follow the source record category.
- The matrix must show at least one operations record such as ROI logs or disclosure
  accounting.
---

# Record Retention Schedule

**Organization**: Pinecrest Children's Medical Center
**Effective Date**: 2026-04-09
**State(s)**: Virginia and West Virginia
**Approved By**: HIM Director, Privacy Officer, General Counsel
**Review Cycle**: Annual

## Retention Matrix

| Record Category | Record Type | Retention Period | Basis | Destruction Method |
|----------------|-------------|------------------|-------|-------------------|
| Minor chart | Pediatric inpatient and outpatient record | Age 25 or 10 years from last encounter, whichever is later | State minor-retention overlay; facility policy | Paper shredding or validated electronic purge |
| Adult employee health | Exposure and fit-for-duty file | Employment plus 30 years | OSHA 29 CFR 1910.1020 | NIST SP 800-88 Rev. 2 |
| ROI logs | Request log and disclosure packet index | 6 years | HIPAA documentation rule | Secure purge after hold review |
| Accounting of disclosures | Disclosure accounting | 6 years | 45 CFR 164.530(j) | Secure purge |
| Scanned legacy packet | Backfile image tied to a source chart | Same as source record category | Source-record rule | Purge only after image quality and indexing sign-off |
| Hold notice file | Preservation memo and release memo | Until written release from Legal | Litigation hold policy | Not destroyed while active |
| Paper archive box | Legacy file room contents | Same as source record category | Source-record rule | Cross-cut shredding after reconciliation |

## Litigation Hold Protocol
- Destruction pauses immediately when a custody, abuse, or malpractice matter is opened.
- HIM maintains a hold inventory separate from the retention inventory.
- Scanned files do not move into destruction until the source category is eligible.
- Written release from Legal is required before any hold-covered records are destroyed.

## Destruction Log
| Destruction Date | Record Type | Date Range | Method | Performed By | Witnessed By |
|-----------------|-------------|------------|--------|-------------|-------------|
| 2026-11-30 | ROI packets | 2018-01-01 to 2018-12-31 | Cross-cut shredding | Records clerk | HIM supervisor |
| 2026-11-30 | Legacy backup media | 2014-01-01 to 2014-12-31 | Validated electronic purge | IT storage analyst | Compliance officer |

## Operational Notes
- The hybrid archive keeps a source-record crosswalk so scans cannot be destroyed out of sequence.
- Minor charts are keyed to birthdate and discharge date so retention is never calculated from only one field.
- The annual review checks for changes in state law, federal retention guidance, and active legal holds.
- Electronic purge certificates are stored with the destruction log for audit readiness.
