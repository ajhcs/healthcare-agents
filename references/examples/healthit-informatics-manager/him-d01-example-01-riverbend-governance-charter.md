---
exemplar_id: him-d01-example-01-riverbend-governance-charter
agent_slug: healthit-informatics-manager
agents_relevant:
- healthit-informatics-manager
deliverable_id: him-d01
deliverable_title: Informatics Governance Charter
scenario_summary: A multi-hospital community health system formalizes informatics
  governance ahead of a major interoperability and optimization roadmap.
complexity: moderate
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- ONC Health IT Certification Program, healthit.gov
- USCDI v3, healthit.gov/isa/united-states-core-data-interoperability-uscdi
- TEFCA resources, rce.sequoiaproject.org/tefca
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Informatics Governance Charter

**Organization**: Riverbend Valley Health System
**Effective Date**: 2026-05-01
**Approved By**: Mara Ellison, MD, CMIO; Colin Sayer, MBA, CIO
**Review Cycle**: Annual

## Committee Structure
### Health IT Steering Committee
- **Chair**: Mara Ellison, MD, CMIO
- **Executive Sponsor**: Colin Sayer, MBA, CIO
- **Members**: Chief Nursing Informatics Officer, Chief Medical Officer, Chief Financial Officer, Chief Operating Officer, Vice President of Quality, Vice President of Compliance, Revenue Cycle Director, Population Health Director
- **Meeting Cadence**: Monthly, second Tuesday
- **Quorum**: 7 voting members including either the CMIO or CIO
- **Decision Authority**: Strategic IT investments above $300,000, enterprise EHR roadmap, interoperability participation decisions, ONC certification risk posture, annual informatics capital plan

### Informatics Governance Committee
- **Chair**: Soren Vale, MSN, RN-BC, Director of Clinical Informatics
- **Vice Chair**: Priya Nand, PharmD, Pharmacy Informatics Lead
- **Members**: Physician informaticist, nursing informaticist, ambulatory applications manager, inpatient applications manager, data governance manager, quality improvement manager, compliance analyst, HIM director, revenue integrity analyst
- **Meeting Cadence**: Bi-weekly, alternating Thursdays
- **Quorum**: 6 voting members with at least one clinical and one technical representative present
- **Decision Authority**: EHR build changes, CDS review, order set governance, documentation template standards, interface prioritization, USCDI field stewardship, data quality remediation prioritization

### Specialty Advisory Panels
- **Panels Active at Charter Adoption**: Emergency Medicine, Perioperative Services, Oncology, Primary Care, Behavioral Health, Revenue Cycle Documentation
- **Meeting Cadence**: Monthly or at chair request for urgent workflow issues
- **Decision Authority**: Recommend changes, validate specialty workflow impact, identify adoption risks, nominate super-user testers

## Charter Purpose
- Align clinical workflow, data architecture, interoperability, and regulatory obligations under one governed decision path
- Ensure no production EHR change proceeds without documented clinical sponsorship, impact review, and post-go-live monitoring
- Standardize ownership of USCDI data classes, certified API capabilities, and enterprise CDS interventions
- Reduce conflicting local build, duplicate content, and unmanaged reporting definitions across Riverbend hospitals and clinics

## Scope
- Enterprise EHR build and configuration
- CDS interventions including CDS Hooks and native EHR alerts
- Clinical content including order sets, preference lists, documentation tools, and patient education
- Data governance for patient, provider, location, terminology, quality reporting, and interoperability assets
- External exchange strategy including TEFCA participation decisions and API readiness

## Change Control Process
| Priority | Description | Approval Path | Target Turnaround |
|----------|-------------|---------------|-------------------|
| Emergency | Patient safety risk or downtime remediation | CMIO and CIO verbal approval with written record within 24 hours | Same day |
| Urgent | Regulatory deadline, severe workflow disruption, material revenue risk | Informatics Governance Committee email vote with compliance notice | 5 business days |
| Standard | Optimization, content revision, reporting-impacting enhancement | Scheduled Informatics Governance Committee review | 30 calendar days |
| Planned | Upgrade, module activation, major interoperability initiative | Steering Committee approval after business case review | Per approved project plan |

## Required Submission Elements for All Requests
- Named clinical sponsor
- Workflow narrative and affected user roles
- Patient safety, billing, reporting, interface, and training impact assessment
- Data element impact, including USCDI or regulatory relevance when applicable
- Test plan, rollback plan, and success measures

## Data Governance Roles
| Role | Responsible Individual | Domain |
|------|------------------------|--------|
| Executive Data Sponsor | Mara Ellison, MD | Enterprise clinical data governance |
| Clinical Data Steward | Talia Mercer, MD | Problems, medications, allergies, care plans, clinical notes |
| Financial Data Steward | Hugo Penn, MHA | Charges, payer plan mapping, authorizations, encounter billing metadata |
| Technical Data Steward | Neel Armitage | Interfaces, terminology services, extracts, FHIR resources |
| MPI Steward | Jessa Rowan, RHIA | Patient identity integrity and merge governance |
| Terminology Steward | Priya Nand, PharmD | RxNorm, SNOMED CT, LOINC, local code set alignment |

## Decision Principles
- Clinical safety overrides local convenience
- Structured capture is preferred over free text when the data must support CDS, quality, or exchange
- Certified capability assumptions must be validated in Riverbend production configuration
- Interruptive CDS requires a stronger evidence and performance case than passive guidance
- Local department requests do not bypass enterprise data standards

## Escalation and Exceptions
- Emergency changes are reviewed retrospectively at the next governance meeting
- Any request that may limit access, exchange, or use of EHI requires compliance review mapped to 45 CFR Part 171
- Requests affecting API, export, SMART launch, or bulk data access require validation against the current CHPL-listed configuration and vendor release status
- If current federal policy appears to have shifted, Riverbend compliance staff should verify live CMS, ONC, or Federal Register updates before final approval

## Success Metrics
- Change request backlog age: under 75 days for standard priority items
- Unplanned production EHR changes: under 4% of quarterly changes
- Data quality composite score: above 91% across governed domains
- Duplicate patient record rate: under 1.2% of active MPI
- CDS high-severity override rate: under 68%
- Governance attendance: above 85% quorum attainment
- Production change validation completion within 30 days: above 95%
- Information blocking request log completeness: 100%

## Reporting and Review
- Monthly dashboard to Steering Committee covering approvals, denials, backlog, safety events, and data quality trends
- Quarterly review of alert burden, certified capability traceability, and USCDI data completeness
- Annual charter refresh led by the Director of Clinical Informatics with compliance and privacy review
