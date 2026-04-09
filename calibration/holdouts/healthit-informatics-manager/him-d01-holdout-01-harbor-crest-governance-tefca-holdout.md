---
holdout_id: him-d01-holdout-01-harbor-crest-governance-tefca-holdout
agent_slug: healthit-informatics-manager
agents_relevant:
- healthit-informatics-manager
deliverable_id: him-d01
deliverable_title: Informatics Governance Charter
seed_ref: healthit-informatics-manager/him-d01-seed-01-harbor-crest-governance-tefca-holdout.yaml
scenario_summary: A suburban health system needs a governance charter that unifies
  EHR change control, TEFCA exchange oversight, and certified capability validation.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- TEFCA resources, rce.sequoiaproject.org/tefca
- ONC Health IT Certification Program, healthit.gov
- CHPL, chpl.healthit.gov
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Deliver a fully written charter in the prompt's charter structure with executive
  and operational governance layers.
- Make TEFCA oversight, information blocking review, and certification traceability
  explicit governance responsibilities.
- Include realistic named stewards, quorum rules, and measurable success metrics without
  placeholder language.
---

# Informatics Governance Charter

**Organization**: Harbor Crest Health
**Effective Date**: 2026-07-01
**Approved By**: Rowan Pike, MD, CMIO; Elise Marr, CIO
**Review Cycle**: Annual with quarterly KPI review

## Committee Structure
### Health IT Steering Committee
- **Chair**: Rowan Pike, MD, CMIO
- **Members**: CIO, Chief Nursing Officer, Chief Compliance Officer, Chief Financial Officer, Chief Operating Officer, Vice President of Ambulatory Services, Vice President of Revenue Cycle, Privacy Officer
- **Meeting Cadence**: Monthly
- **Quorum**: 6 voting members including the CMIO or CIO
- **Decision Authority**: Strategic technology decisions above $275,000, enterprise interoperability strategy, TEFCA participation pathway, major EHR module changes, regulatory risk acceptance

### Informatics Governance Committee
- **Chair**: Avery Sloane, MSN, RN-BC
- **Members**: Physician informaticist, ambulatory applications manager, inpatient applications manager, HIM director, interoperability architect, data governance manager, quality leader, compliance analyst
- **Meeting Cadence**: Bi-weekly
- **Decision Authority**: EHR build approvals, CDS review, template standards, interface prioritization, structured data stewardship assignments, post-go-live outcome review

## Change Control Process
| Priority | Description | Approval Path | Target Turnaround |
|----------|-------------|---------------|-------------------|
| Emergency | Safety, legal, or downtime event requiring immediate action | CMIO and CIO approval with retrospective review | Same day |
| Urgent | Regulatory requirement, exchange outage, severe workflow defect | Informatics Governance Committee expedited review | 5 business days |
| Standard | Optimization, content, reporting, or documentation change | Scheduled Informatics Governance Committee review | 28 calendar days |
| Planned | Upgrade, new interface, major interoperability project | Steering Committee approval | Per approved project plan |

## Data Governance Roles
| Role | Responsible Individual | Domain |
|------|------------------------|--------|
| Executive Data Sponsor | Rowan Pike, MD | Enterprise clinical data governance |
| Clinical Data Steward | Mira Fen, MD | Problems, medications, allergies, care plans |
| Technical Data Steward | Dorian Voss | Interfaces, FHIR mapping, certified API payloads |
| HIM Steward | Selah Morrow, RHIA | Documentation standards, release-of-information workflow |
| MPI Steward | Tamsin Reed | Patient identity integrity and merge governance |

## Success Metrics
- Production changes with documented clinical validation: 100%
- Unauthorized build changes: zero
- Structured export completeness for governed USCDI elements: above 92%
- Certification traceability review completed within 30 days of upgrade or module swap: 100%
- Governance attendance quorum: above 85%

## Operating Commitments
- TEFCA, exchange, and patient access decisions route through governance with compliance participation
- No production build change proceeds without named sponsor, testing evidence, and rollback plan
- Certified capabilities relied on for compliance are validated in live configuration against CHPL-listed modules
- Access restrictions are documented against a specific 45 CFR Part 171 exception
