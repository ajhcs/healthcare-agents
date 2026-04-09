---
exemplar_id: him-d02-example-01-academic-medical-center-lhr-matrix
agent_slug: healthit-information-manager
agents_relevant:
- healthit-information-manager
deliverable_id: him-d02
deliverable_title: Legal Health Record Definition Matrix
scenario_summary: Legal health record definition for a multi-hospital academic medical
  center using a hybrid EHR ecosystem.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 45 CFR 164.501 HIPAA definitions including designated record set and psychotherapy
  notes
- 45 CFR 164.524 Individual right of access
- 45 CFR 164.526 Requests for amendment of protected health information
- 'AHIMA Practice Brief: Fundamentals of the Legal Health Record and Designated Record
  Set'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Legal Health Record Definition

**Organization**: Meridian Vale University Health System
**Effective Date**: 2026-02-01
**Approved By**: Serena Holt, RHIA, HIM Vice President; Daniel Corven, MD, CMIO; Lena Wirth, JD, Chief Legal Officer; Rami Dace, CIO
**Review Cycle**: Annual

## Included in the Legal Health Record
| Document/Data Element | Source System | Format | Authentication Required |
|----------------------|--------------|--------|----------------------|
| History & Physical | HelixEHR | Electronic | Attending or privileged provider signature |
| Progress Notes | HelixEHR | Electronic | Author signature |
| Consultation Reports | HelixEHR | Electronic | Consulting provider signature |
| Operative Reports | HelixEHR | Electronic | Surgeon signature |
| Procedure Notes | HelixEHR | Electronic | Performing provider signature |
| Discharge Summary | HelixEHR | Electronic | Attending physician signature |
| Nursing Assessments and Care Plans | HelixEHR | Electronic | RN signature |
| Provider Orders | HelixEHR | Electronic | Ordering provider authentication |
| Medication Administration Record | HelixEHR | Electronic | Administering clinician authentication |
| Laboratory Results | NovaLIS interfaced to HelixEHR | Electronic | Performing laboratory final verification |
| Pathology Reports | NovaLIS | Electronic | Pathologist signature |
| Radiology Reports | SummitRIS interfaced to HelixEHR | Electronic | Radiologist signature |
| Diagnostic Images | SummitPACS | DICOM image set | Finalized study linked to signed interpretation |
| Consent Forms | DocImage archive and HelixEHR | Electronic image | Patient or representative and witness where required |
| Advance Directives | HelixEHR and scanned legacy archive | Electronic or image | Patient or representative attestation |
| Emergency Department Record | HelixEHR | Electronic | Treating clinician signature |
| Imported Outside Records Incorporated Into Care | HelixEHR media tab | Electronic image or PDF | Source attribution and clinician acceptance when incorporated |
| Patient-Generated Health Data Referenced in Care Plan | MyMeridian portal | Electronic | Patient attestation plus clinician incorporation into record |

## Excluded from the Legal Health Record
| Data Element | Reason for Exclusion | Discoverable Separately? |
|-------------|---------------------|------------------------|
| Audit trail and access logs | Compliance and security monitoring data, not part of the clinical business record | Yes, through compliance or legal process |
| System metadata and routing history | Technical provenance data supporting system operations | Yes, through legal or forensic request |
| Unsigned drafts | Not finalized or authenticated as part of care documentation | No, unless preserved by separate legal hold |
| Clinical decision support alerts not acted upon | System-generated prompts without adopted clinical action | Potentially |
| Coding worksheets and DRG working papers | Revenue cycle work product, not the clinical business record | Yes, separate business record request |
| Billing claims, remittance advice, and eligibility responses | Financial and administrative record set separate from the legal health record | Yes, separate request |
| Psychotherapy notes maintained separately by behavioral health professionals | Excluded under 45 CFR 164.501 and released only under stricter rules | Yes, with separate authorization if maintained |
| Duplicate image copies used for local teaching files | Non-record copy retained outside production workflow | No |

## Production Format
- Default output: PDF packet generated from approved EHR print groups with encounter headers, source identifiers, and page numbering.
- Image studies: DICOM export or secure viewer access when image production is specifically requested.
- Continuity document: C-CDA available for treatment and patient-access workflows when requested and technically feasible.
- Delivery methods: encrypted portal download first; encrypted email or tracked media only when requested and approved.

## Record Integrity Rules
- Late entries and addenda remain linked to the original note and display both event date and entry date.
- Amendments requested under 45 CFR 164.526 are appended without overwriting original content.
- Copy-forward use is permitted only under organizational documentation integrity policy and remains attributable to the signing author.
- Versioned output for legal production is generated from the release date snapshot and logged in the disclosure record.

## Scope Clarifications
- The designated record set for HIPAA access includes medical and billing records used to make decisions about the individual; this matrix defines the legal health record subset used for evidentiary and formal production purposes.
- Research source documents are included only when they are part of the patient care record maintained by the health system.
- Secure chat messages are excluded unless copied or referenced into a signed clinical document that becomes part of the finalized record.
