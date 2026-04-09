---
exemplar_id: him-d02-example-02-enterprise-lhr-matrix
agent_slug: healthit-information-manager
agents_relevant:
- healthit-information-manager
deliverable_id: him-d02
deliverable_title: Legal Health Record Definition Matrix
scenario_summary: A multi-facility network needs a defined legal health record matrix
  that separates clinical, administrative, and technical artifacts for disclosure
  and litigation response.
complexity: moderate
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 45 CFR 164.501, designated record set definition, LII e-CFR
- 45 CFR 164.524, HIPAA right of access and format requirements, LII e-CFR
- AHIMA, Fundamentals of the Legal Health Record and Designated Record Set, journal.ahima.org
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Legal Health Record Definition

**Organization**: Riverside Meridian Health Network
**Effective Date**: 2026-04-09
**Approved By**: HIM Director, CMO, CIO, General Counsel
**Review Cycle**: Annual

## Included in the Legal Health Record

| Document/Data Element | Source System | Format | Authentication Required |
|----------------------|--------------|--------|-------------------------|
| History and physical | EHR | Electronic | Attending physician signature |
| Progress notes | EHR | Electronic | Author signature |
| Orders and order sets | EHR | Electronic | Ordering practitioner authentication |
| Operative reports | EHR | Electronic | Surgeon signature |
| Discharge summary | EHR | Electronic | Attending signature |
| Nursing assessments | EHR | Electronic | RN authentication |
| Medication administration record | EHR | Electronic | Nurse authentication |
| Laboratory results | LIS | Electronic | Performing lab verification |
| Radiology reports | RIS and PACS | Electronic | Radiologist signature |
| Consent forms | EHR and scanned documents | Image or electronic | Patient signature and witness as required |
| Advance directive | EHR and scanned documents | Image or electronic | Patient signature or representative signature |
| Patient portal messages incorporated into care | Portal and EHR | Electronic | Provider authentication when filed |
| Scanned outside records used for treatment decisions | Scanning system and EHR | Image | HIM indexing verification |

## Excluded from the Legal Health Record

| Data Element | Reason for Exclusion | Discoverable Separately? |
|-------------|---------------------|-------------------------|
| Audit trail entries | Compliance and security artifact, not clinical content | Yes, by legal process |
| Access logs | Technical record, not part of the clinical business record | Yes, by legal process |
| Draft unsigned notes | Not finalized or authenticated | No |
| Billing claims and remittance data | Separate business record set | Yes, through finance or legal process |
| CDS prompts not acted on | System-generated decision support, not clinician-authored documentation | Sometimes |
| Duplicate file copies | Redundant storage, not the authoritative record | No |
| Psychotherapy notes | Separate HIPAA protection category | Separate handling required |

## Production Format
- Default disclosure format is a paginated PDF export from the EHR.
- Electronic disclosure may use C-CDA when the requestor accepts that format.
- Native database exports are not routine disclosure products and require Legal review.
- Every outbound packet is matched to the requested date range and scope before release.

## Governance Notes
- The legal health record is distinct from the designated record set, and the organization documents both.
- Version control rules preserve the original entry and show amendments with date, time, and author.
- The matrix is enforced in ROI, discovery response, and records destruction workflows.
- EHR-integrity exceptions are escalated to HIM and Compliance before release.
