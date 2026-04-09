---
holdout_id: him-d02-holdout-03-ambulatory-discovery-request-matrix
agent_slug: healthit-information-manager
agents_relevant:
- healthit-information-manager
deliverable_id: him-d02
deliverable_title: Legal Health Record Definition Matrix
seed_ref: healthit-information-manager/him-d02-seed-03-ambulatory-discovery-request-matrix.yaml
scenario_summary: An ambulatory orthopedic network needs a legal health record matrix
  that cleanly separates clinical content from scheduling, billing, and system metadata.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- 45 CFR 164.501, designated record set definition, LII e-CFR
- 45 CFR 164.524, right of access and electronic form-and-format rules, HHS.gov OCR
  guidance
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- The matrix must clearly distinguish legal health record content from billing, scheduling,
  and technical metadata.
- The production format section must specify the default disclosure format and when
  native exports require Legal review.
- The excluded list must include audit trails, access logs, and draft or duplicate
  artifacts.
- The note section must state that the designated record set can be broader than the
  legal health record.
---

# Legal Health Record Definition

**Organization**: Harborview Ortho and Spine Network
**Effective Date**: 2026-04-09
**Approved By**: HIM Director, Privacy Officer, Orthopedics Medical Director, General Counsel
**Review Cycle**: Annual

## Included in the Legal Health Record

| Document/Data Element | Source System | Format | Authentication Required |
|----------------------|--------------|--------|-------------------------|
| Pre-op evaluation | EHR | Electronic | Surgeon or APP authentication |
| Signed surgical consent | EHR and scanned documents | Image or electronic | Patient and witness as required |
| Operative report | EHR | Electronic | Surgeon signature |
| Anesthesia record | Anesthesia platform | Electronic | Anesthesia provider authentication |
| PACS radiology report | PACS | Electronic | Radiologist signature |
| Discharge instructions | EHR | Electronic | Responsible clinician authentication |
| Portal-uploaded outside records accepted into care | Patient portal and EHR | Image or electronic | HIM indexing verification |
| Medication administration record | EHR | Electronic | Nurse authentication |

## Excluded from the Legal Health Record

| Data Element | Reason for Exclusion | Discoverable Separately? |
|-------------|---------------------|-------------------------|
| Scheduling notes | Administrative record | Yes, if requested through operations or legal process |
| Billing claim edits | Revenue-cycle artifact | Yes, through finance record set |
| Audit trail exports | Technical security record | Yes, by legal process |
| Access logs | System metadata | Yes, by legal process |
| Draft notes not signed | Not final or authenticated | No |
| Duplicate portal uploads | Redundant copy | No |

## Production Format
- Default disclosure format is a paginated PDF exported from the EHR.
- Electronic copies are provided in the form and format that is readily producible.
- Native source-system exports require Legal review before release.
- The disclosure packet is matched to the request date range before transmission.

## Governance Notes
- The legal health record is the authoritative business record used for disclosures and litigation response.
- The designated record set may include additional decision-support and billing data.
- HIM uses this matrix to keep billing, scheduling, and technical metadata out of routine release packets.
- Any disagreement about scope is escalated to Legal before fulfillment.
