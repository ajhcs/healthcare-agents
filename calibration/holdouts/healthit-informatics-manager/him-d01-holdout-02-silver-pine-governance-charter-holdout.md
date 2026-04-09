---
holdout_id: him-d01-holdout-02-silver-pine-governance-charter-holdout
agent_slug: healthit-informatics-manager
agents_relevant:
- healthit-informatics-manager
deliverable_id: him-d01
deliverable_title: Informatics Governance Charter
seed_ref: healthit-informatics-manager/him-d01-seed-02-silver-pine-governance-charter-holdout.yaml
scenario_summary: A specialty ambulatory network wants a lean informatics charter
  to govern EHR optimization, data standards, and clinical content changes.
complexity: routine
regulatory_as_of: '2026-04-09'
source_basis:
- ONC Health IT Certification Program, healthit.gov
- USCDI v3, healthit.gov/isa/united-states-core-data-interoperability-uscdi
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Produce a concise but complete charter using the prompt's exact deliverable sections.
- Reflect an ambulatory governance model with clear authority for optimization, CDS
  review, and data stewardship.
- Include realistic metric thresholds and a workable change-control table.
---

# Informatics Governance Charter

**Organization**: Silver Pine Specialty Network
**Effective Date**: 2026-08-01
**Approved By**: Nila Crest, MD, CMIO; Owen Trask, MBA, CIO
**Review Cycle**: Annual

## Committee Structure
### Health IT Steering Committee
- **Chair**: Nila Crest, MD, CMIO
- **Members**: CIO, compliance officer, ambulatory operations leader, revenue cycle leader, nursing leader
- **Meeting Cadence**: Monthly
- **Quorum**: To be set by executive approval
- **Decision Authority**: Strategic projects above $150,000, enterprise EHR roadmap, major interoperability and optimization priorities

### Informatics Governance Committee
- **Chair**: Elian Voss, MSN, RN
- **Members**: Physician informaticist, ambulatory applications manager, HIM representative, analytics lead, quality representative
- **Meeting Cadence**: Bi-weekly
- **Decision Authority**: EHR build changes, CDS design review, documentation standards, data quality remediation priorities

## Change Control Process
| Priority | Description | Approval Path | Target Turnaround |
|----------|-------------|---------------|-------------------|
| Emergency | Safety or legal issue | CMIO and CIO approval | Same day |
| Urgent | Severe workflow disruption or time-bound compliance issue | Expedited governance review | 5 business days |
| Standard | Optimization or specialty enhancement | Scheduled governance review | 30 days |
| Planned | Upgrade or new module | Steering Committee | Per project plan |

## Data Governance Roles
| Role | Responsible Individual | Domain |
|------|------------------------|--------|
| Executive Data Sponsor | Nila Crest, MD | Enterprise ambulatory clinical data |
| Clinical Data Steward | Rowan Hale, MD | Specialty documentation and referral data |
| Technical Data Steward | Tessa Wren | Build, interfaces, and FHIR mappings |
| Quality Data Steward | Milo Fen | Reporting definitions and performance data |

## Success Metrics
- Shared documentation standard adoption across clinics
- Decline in reporting defects tied to social history and referral fields
- Governance review completion for production changes
- Improved consistency of structured data available for FHIR export

## Operating Commitments
- Specialty requests use one enterprise intake pathway
- Local preference needs are allowed only when shared reporting and exchange standards remain intact
- Structured capture is required for data elements needed in reporting, CDS, or interoperability workflows
- If current federal requirements appear to have shifted, leadership should verify the latest policy before locking the charter text
