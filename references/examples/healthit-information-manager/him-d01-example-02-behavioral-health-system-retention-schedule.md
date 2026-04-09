---
exemplar_id: him-d01-example-02-behavioral-health-system-retention-schedule
agent_slug: healthit-information-manager
agents_relevant:
- healthit-information-manager
deliverable_id: him-d01
deliverable_title: Record Retention Schedule
scenario_summary: Retention schedule for a behavioral health system with Part 2 content,
  inpatient psychiatry, and outpatient substance use disorder services.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- '42 CFR 482.24(b)(1) Conditions of Participation for Hospitals: Medical record services'
- 42 CFR Part 2 Confidentiality of substance use disorder patient records
- 45 CFR 164.530(j) HIPAA documentation retention
- 29 CFR 1910.1020(d)(1) OSHA employee medical and exposure records
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Record Retention Schedule

**Organization**: Cedar Hollow Behavioral Health Network
**Effective Date**: 2026-03-01
**State(s)**: Michigan and Indiana
**Approved By**: Anika Rowe, RHIA, CHPS, HIM Director; Felix March, JD, Privacy Counsel; Corin Hale, Compliance Officer
**Review Cycle**: Annual

| Record Category | Record Type | Retention Period | Basis | Destruction Method |
|----------------|-------------|-----------------|-------|-------------------|
| Behavioral Health Records — Adult | Inpatient psychiatric and outpatient behavioral health legal health record | 10 years from last encounter | Multi-state policy applying longest operational standard across system entities; federal hospital floor at 42 CFR 482.24(b)(1) | Cross-cut shredding for paper; NIST SP 800-88 purge or destroy for electronic media |
| Behavioral Health Records — Minor | Psychiatric and counseling legal health record | Until patient reaches age 21, then 10 years | Multi-state pediatric behavioral health retention standard using longest system rule | Cross-cut shredding for paper; NIST SP 800-88 purge or destroy for electronic media |
| Part 2 Program Records | SUD treatment records from federally assisted Part 2 programs | 10 years from last encounter | Organizational risk standard with controlled segregation under 42 CFR Part 2 | Cross-cut shredding for paper; NIST SP 800-88 purge or destroy for electronic media |
| Medicare/Medicaid Records | Claim support, utilization review, and documentation abstracts | 5 years from date of service | Federal payment support minimum and hospital CoP floor | Cross-cut shredding for paper; NIST SP 800-88 purge or destroy for electronic media |
| HIPAA and Part 2 Documentation | Privacy notices, consent forms, revocations, disclosure accountings, policy files | 6 years from creation or last effective date | 45 CFR 164.530(j); operational alignment for Part 2 consent administration | Cross-cut shredding for paper; NIST SP 800-88 purge or destroy for electronic media |
| Seclusion and Restraint Logs | Behavioral event logs and debrief documentation | 10 years | Psychiatric survey and risk management retention standard | Cross-cut shredding for paper; NIST SP 800-88 purge or destroy for electronic media |
| Emergency Detention and Commitment Documents | Court papers, petitions, physician certificates | 10 years after discharge or legal release | State behavioral health legal process retention standard | Cross-cut shredding for paper; NIST SP 800-88 purge or destroy for electronic media |
| Employee Health Records | Post-exposure and occupational health files | Duration of employment plus 30 years | 29 CFR 1910.1020(d)(1) | Cross-cut shredding for paper; NIST SP 800-88 destroy for electronic media |
| Incident Reports | Privacy and patient safety investigation files | 10 years | Enterprise risk retention schedule | Cross-cut shredding for paper; NIST SP 800-88 purge or destroy for electronic media |
| Video Monitoring Exports Held for Investigation | Behavioral unit security exports associated with confirmed events | 3 years from case closure or longer if litigation hold applies | Security investigation retention standard | NIST SP 800-88 destroy for electronic media |

## Litigation Hold Protocol
- Legal, Compliance, or the Privacy Office may issue a hold covering behavioral health, Part 2, employment, or security records.
- HIM and Health Information Governance jointly suspend destruction within one business day of notice.
- Segregated Part 2 archives are screened separately before destruction because consent and disclosure restrictions continue during retention.
- Written legal release is required before any paused destruction cycle resumes.

## Destruction Log
| Destruction Date | Record Type | Date Range | Method | Performed By | Witnessed By |
|-----------------|-------------|------------|--------|-------------|-------------|
| 2026-03-18 | Adult outpatient counseling record | 2015-01-01 to 2015-03-31 | Cross-cut shredding by bonded vendor | L. Verran, Records Supervisor | K. Dorsey, Privacy Analyst |
| 2026-03-18 | Legacy Part 2 paper group therapy files | 2014-07-01 to 2014-12-31 | Locked bin destruction with chain-of-custody certificate | L. Verran, Records Supervisor | A. Rowe, RHIA |
| 2026-03-25 | Retired encrypted backup tapes with expired retention | 2012-01-01 to 2012-12-31 | Physical media destruction and serial-number certification | J. Mire, IT Security Manager | F. March, JD |

## Operational Notes
- Part 2 source content must remain tagged through retention and destruction so it is not processed through standard ROI or destruction queues without segregation review.
- Pending grievances, OCR matters, payer audits, and civil commitment appeals remove records from destruction eligibility.
- If Michigan and Indiana rules diverge for a record class, the longer period remains in force until the schedule is revised and reapproved.
- Vendor destruction certificates are retained as compliance records under the HIPAA documentation retention rule.
