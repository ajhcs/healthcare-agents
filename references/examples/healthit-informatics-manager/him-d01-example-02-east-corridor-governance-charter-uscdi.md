---
exemplar_id: him-d01-example-02-east-corridor-governance-charter-uscdi
agent_slug: healthit-informatics-manager
agents_relevant:
- healthit-informatics-manager
deliverable_id: him-d01
deliverable_title: Informatics Governance Charter
scenario_summary: A regional ambulatory and post-acute network adopts a governance
  charter focused on USCDI data stewardship, TEFCA readiness, and certified capability
  traceability.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- USCDI v3, healthit.gov/isa/united-states-core-data-interoperability-uscdi
- CHPL, chpl.healthit.gov
- TEFCA Common Agreement resources, rce.sequoiaproject.org/tefca
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Informatics Governance Charter

**Organization**: East Corridor Care Alliance
**Effective Date**: 2026-06-15
**Approved By**: Imani Wren, MD, CMIO; Graham Dace, JD, Chief Compliance Officer
**Review Cycle**: Annual with quarterly operating review

## Committee Structure
### Health IT Steering Committee
- **Chair**: Imani Wren, MD, CMIO
- **Members**: CIO, Chief Compliance Officer, Chief Nursing Officer, Vice President of Ambulatory Operations, Vice President of Post-Acute Services, Revenue Cycle Executive, Privacy Officer, Population Health Executive
- **Meeting Cadence**: Monthly
- **Quorum**: 6 voting members with compliance or privacy representation present for exchange-related items
- **Decision Authority**: Enterprise interoperability investments, API and export strategy, TEFCA participation pathway, budget approval for certified module upgrades, cross-continuum documentation standard decisions

### Informatics Governance Committee
- **Chair**: Noelle Thane, MS, RHIA, FHIMSS
- **Members**: Physician informaticist, CNIO delegate, HIM director, interoperability architect, data governance lead, ambulatory applications manager, home health informatics lead, compliance analyst, analytics manager
- **Meeting Cadence**: Every other Wednesday
- **Decision Authority**: Clinical build governance, data definition approval, stewardship assignments, CDS prioritization, template standardization, FHIR and interface change review

### Specialty and Domain Councils
- **Councils Active at Launch**: Primary Care, Skilled Nursing, Home Health, Behavioral Health, Care Management, Terminology and Master Data
- **Cadence**: Monthly
- **Decision Authority**: Domain recommendations, local validation, data quality escalation, workflow readiness assessments

## Purpose Statement
- Create a single accountable forum for clinical system decisions across ambulatory clinics, skilled nursing sites, and home health operations
- Tie all new documentation and integration requests to structured data capture, exchange readiness, and auditability
- Prevent local build divergence that undermines USCDI completeness, quality reporting, and patient access
- Maintain evidence that live capabilities match certified assumptions relied on for compliance and operational planning

## Governance Scope
- Core EHR and connected specialty systems
- FHIR APIs, SMART launch, document exchange, and bulk export workflows
- Patient identity management and consent-sensitive exchange logic
- Clinical content, orderables, documentation tools, and task routing
- Data quality monitoring and remediation for patient, provider, location, and payer master data

## Change Control Process
| Priority | Description | Approval Path | Target Turnaround |
|----------|-------------|---------------|-------------------|
| Emergency | Safety or legal exposure requiring immediate production action | CMIO and Compliance Officer approval with retrospective review | Same day |
| Urgent | Time-bound external requirement, high-volume workflow breakdown, material exchange defect | Expedited Informatics Governance Committee vote | 7 calendar days |
| Standard | New build, revised template, interoperability enhancement, analytics-impacting change | Scheduled committee review with steward sign-off | 21 calendar days |
| Strategic | Major release, TEFCA onboarding, certified module swap, cross-continuum redesign | Steering Committee decision after readiness assessment | Per approved roadmap |

## Data Governance Roles
| Role | Responsible Individual | Domain |
|------|------------------------|--------|
| Executive Data Sponsor | Imani Wren, MD | Enterprise clinical data and informatics governance |
| Clinical Data Steward | Oren Vale, DO | Problem list, medications, allergies, encounter diagnoses, care plans |
| Post-Acute Data Steward | Mireya Quill, RN | OASIS-linked clinical documentation and transitions data |
| Technical Data Steward | Jalen Crewe | Interfaces, FHIR mapping, terminology services, API payload integrity |
| Privacy and Exchange Steward | Daphne Lorne, JD | Consent-sensitive data exchange, segmentation rules, disclosure controls |
| Master Data Steward | Keon Sable | MPI, provider master, location master, payer mapping |

## Required Reviews for Specific Request Types
- Requests affecting patient demographics, sex-related elements, tribal affiliation, or SDOH fields require USCDI stewardship review
- Requests affecting API or export content require certification traceability review against the live CHPL-supported module set
- Requests affecting external exchange or query response behavior require privacy and TEFCA readiness review
- Requests involving access restrictions require exception mapping to 45 CFR Part 171 before approval

## Standards Commitments
- Maintain a field-to-profile inventory for US Core-aligned data exposed through APIs
- Retain provenance where available for exchanged clinical content
- Review major terminology updates on a standing quarterly cycle
- Require structured documentation options whenever data is needed for quality, exchange, or CDS

## Metrics
- USCDI completeness score for governed ambulatory encounters: above 90%
- CHPL traceability matrix currency: 100% updated within 30 days of vendor upgrade or module change
- MPI duplicate rate: under 0.9%
- Exchange defect closure within SLA: above 92%
- Unauthorized local build outside governance: zero
- Percentage of build requests with documented clinical sponsor: 100%
- Governance-approved changes with 30-day outcome review completed: above 95%

## Audit Trail and Documentation
- Every approved change receives a governance ID, steward assignment, testing packet, and go-live owner
- Every denied request records the rationale, standards conflict, and appeal path
- Every emergency change is reviewed within 5 business days for permanent remediation or rollback
- Quarterly certification and interoperability review includes vendor release notes, CHPL status, and local operational validation

## Education and Accountability
- New informatics members receive orientation on USCDI, information blocking, certified capability assumptions, and change control
- Specialty councils receive quarterly dashboards showing template compliance, structured field utilization, and data quality defects
- Persistent policy noncompliance by application teams escalates to Steering Committee

## Charter Maintenance
- Owned by the Director of Health Informatics
- Annual renewal requires CMIO, Compliance, Privacy, and CIO concurrence
- If federal interoperability requirements appear to have changed, East Corridor should verify current CMS, ONC, or Federal Register updates before revising governance policy
