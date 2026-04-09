---
exemplar_id: him-d01-example-04-behavioral-health-and-oncology-retention
agent_slug: healthit-information-manager
agents_relevant:
- healthit-information-manager
deliverable_id: him-d01
deliverable_title: Record Retention Schedule
scenario_summary: A regional system with behavioral health, oncology, and employee
  health programs needs a layered retention schedule that accounts for special handling,
  holds, and destruction controls.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 482.24(b)(1), hospital medical record retention, LII e-CFR
- 42 CFR Part 2 Final Rule Fact Sheet, HHS.gov, updated January 30, 2026
- 29 CFR 1910.1020, employee medical records retention, OSHA
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Record Retention Schedule

**Organization**: Eastgate Prairie Health System
**Effective Date**: 2026-04-09
**State(s)**: Illinois, Iowa, Missouri
**Approved By**: HIM Director, Privacy Officer, General Counsel
**Review Cycle**: Annual, with interim review after regulatory change

## Retention Matrix

| Record Category | Record Type | Retention Period | Basis | Destruction Method |
|----------------|-------------|------------------|-------|-------------------|
| Adult acute-care chart | Inpatient and outpatient medical record | 10 years from last encounter | 42 CFR 482.24(b)(1); internal multi-state policy | Cross-cut shred for paper; validated electronic purge |
| Minor chart | Pediatric chart, including ambulatory visits | Age 21 or 10 years from last encounter, whichever is later | State minor-retention overlay | Shred or purge after counsel sign-off |
| Behavioral health general record | Psych progress notes, treatment plans, medication notes | 10 years from last service date | State law overlay and organizational policy | Purge only after privacy review |
| Part 2 source record | Substance use disorder program records | Separate from general record; retained per program policy and governing law | 42 CFR Part 2 final rule and program-specific retention policy | Controlled purge with source-system certification |
| Oncology registry support | Abstracted registry packet, staging support, tumor board notes | 10 years from abstract date | Registry governance policy | Secure purge after reconciliation |
| Oncology imaging support | PET, CT, MRI reports used for staging | Same as underlying medical record | Medical record retention rule | Purge with source record |
| ROI authorizations | Patient and representative authorizations | 6 years from creation or last effective date | 45 CFR 164.530(j) | Shred or purge after hold release |
| Disclosure accounting | Access log and disclosure log | 6 years | 45 CFR 164.530(j); 45 CFR 164.528 | Secure purge after audit window |
| Employee health | Occupational injury, exposure, and fit-for-duty files | Employment plus 30 years | 29 CFR 1910.1020(d)(1) | NIST SP 800-88 Rev. 2 |
| Research consent | Human subject consent and withdrawal records | 7 years after study close | Federal research governance and IRB policy | Secure purge after sponsor closeout |

## Litigation Hold Protocol
- Legal hold overrides every fixed retention period.
- HIM issues a preservation notice to records, IT, revenue cycle, and the business unit.
- Part 2 files under hold remain isolated from routine destruction queues.
- Hold release requires written clearance from Legal with the matter closed date.

## Destruction Log
| Destruction Date | Record Type | Date Range | Method | Performed By | Witnessed By |
|-----------------|-------------|------------|--------|-------------|-------------|
| 2026-09-30 | Adult outpatient charts | 2015-01-01 to 2015-12-31 | Electronic purge with certificate | HIM systems analyst | Privacy officer |
| 2026-09-30 | Paper ROI packets | 2018-01-01 to 2018-06-30 | Cross-cut shredding | Vendor destruction team | HIM supervisor |

## Operational Notes
- Behavioral health and Part 2 records are indexed with source-system tags so they cannot be swept into a general release.
- Oncology packets retain registry-support material until the registry submission cycle is complete.
- Employee health files are excluded from general medical-chart destruction queues.
- Annual inventory review includes a check for state-law changes and active audit or investigation holds.
