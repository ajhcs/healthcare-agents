---
holdout_id: him-d01-holdout-01-pediatric-network-retention-schedule
agent_slug: healthit-information-manager
agents_relevant:
- healthit-information-manager
deliverable_id: him-d01
deliverable_title: Record Retention Schedule
seed_ref: healthit-information-manager/him-d01-seed-01-pediatric-network-retention-schedule.yaml
scenario_summary: Prepare a retention schedule for a pediatric network with NICU records,
  school-based clinics, and employee health files.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- '42 CFR 482.24(b)(1) Conditions of Participation for Hospitals: Medical record services'
- 45 CFR 164.530(j) HIPAA administrative requirements for documentation retention
- 42 CFR 489.20(r)(3) EMTALA record retention
- 29 CFR 1910.1020(d)(1) OSHA access to employee exposure and medical records
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Use the retention schedule template with concrete periods and destruction methods.
- Show a pediatric-specific retention rule that extends beyond the age of majority.
- Include litigation hold protocol and a destruction log section.
- Separate HIPAA documentation retention from patient record retention.
---

# Record Retention Schedule

**Organization**: Blue Harbor Children's Network
**Effective Date**: 2026-04-15
**State(s)**: Wisconsin and Minnesota
**Approved By**: Keira Sol, RHIA; D. Forrester, JD; Ilan Voss, Compliance Director
**Review Cycle**: Annual

| Record Category | Record Type | Retention Period | Basis | Destruction Method |
|----------------|-------------|-----------------|-------|-------------------|
| Medical Records — Minor | Hospital and clinic legal health record | Until patient reaches age 21, then 10 years | System pediatric retention policy applying longest organizational rule | Cross-cut shredding for paper; NIST SP 800-88 purge or destroy for electronic media |
| Medical Records — Adult | Family medicine and transition clinic record | 10 years from last encounter | Multi-state organizational retention standard | Cross-cut shredding for paper; NIST SP 800-88 purge or destroy for electronic media |
| NICU Follow-Up Records | Developmental and neonatal follow-up documentation | Until patient reaches age 21, then 10 years | Pediatric specialty retention standard | Cross-cut shredding for paper; NIST SP 800-88 purge or destroy for electronic media |
| School-Based Clinic Records | Encounter record and consent documentation | Until patient reaches age 21, then 10 years | Pediatric ambulatory retention standard | Cross-cut shredding for paper; NIST SP 800-88 purge or destroy for electronic media |
| Immunization Records | Vaccine administration and registry reconciliation documents | Permanent electronic registry retention; paper support 10 years | Pediatric continuity-of-care standard | Secure electronic retention; cross-cut shredding for paper support files |
| HIPAA Documentation | Policies, procedures, authorizations, accounting logs | 6 years from creation or last effective date | 45 CFR 164.530(j) | Cross-cut shredding for paper; NIST SP 800-88 purge or destroy for electronic media |
| EMTALA Records | Emergency screening and transfer documentation | 5 years | 42 CFR 489.20(r)(3) | Cross-cut shredding for paper; NIST SP 800-88 purge or destroy for electronic media |
| Employee Health Records | Occupational health and exposure files | Duration of employment plus 30 years | 29 CFR 1910.1020(d)(1) | Cross-cut shredding for paper; NIST SP 800-88 destroy for electronic media |
| Radiology Images | Diagnostic images and associated reports | Until patient reaches age 21, then 10 years | Pediatric imaging retention standard | NIST SP 800-88 purge or destroy for electronic media |
| Destruction Vendor Certificates | Certificates and manifests proving destruction | 10 years from destruction date | Compliance evidence retention standard | Cross-cut shredding for paper; NIST SP 800-88 purge for electronic copies |

## Litigation Hold Protocol
- Legal, Risk Management, or Compliance may issue a hold covering any patient, employment, billing, or operational record class.
- HIM screens all destruction-eligible inventories against the litigation hold register before approval.
- Records on hold remain excluded until written release is issued by Legal.
- Destruction vendors receive manifest-level hold exclusions before pickup.

## Destruction Log
| Destruction Date | Record Type | Date Range | Method | Performed By | Witnessed By |
|-----------------|-------------|------------|--------|-------------|-------------|
| 2026-04-22 | Adult family medicine record | 2015-01-01 to 2015-03-31 | Cross-cut shredding by certified vendor | T. Merrow, Records Supervisor | K. Sol, RHIA |
| 2026-04-22 | HIPAA authorization packets | 2018-01-01 to 2018-06-30 | Locked shred bin destruction | T. Merrow, Records Supervisor | I. Voss, Compliance Director |
| 2026-04-28 | Retired imaging archive media | 2012-01-01 to 2012-12-31 | Media destruction with serial-number certificate | P. Ren, Infrastructure Lead | D. Forrester, JD |

## Operational Notes
- The longest applicable period governs when pediatric specialty, state, and federal retention rules differ.
- Immunization registry retention is treated separately because continuity of care and public health reporting depend on long-term accessibility.
- Destruction certificates are retained as compliance evidence and are not destroyed with the source records they document.
