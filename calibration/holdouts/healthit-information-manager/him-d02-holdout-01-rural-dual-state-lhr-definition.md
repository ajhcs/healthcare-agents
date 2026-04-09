---
holdout_id: him-d02-holdout-01-rural-dual-state-lhr-definition
agent_slug: healthit-information-manager
agents_relevant:
- healthit-information-manager
deliverable_id: him-d02
deliverable_title: Legal Health Record Definition Matrix
seed_ref: healthit-information-manager/him-d02-seed-01-rural-dual-state-lhr-definition.yaml
scenario_summary: Draft a legal health record definition for a rural health system
  with one critical access hospital, three clinics, and a partially retired imaging
  archive.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- 45 CFR 164.501 HIPAA definitions including designated record set and psychotherapy
  notes
- 45 CFR 164.524 Individual right of access
- 'AHIMA Practice Brief: Fundamentals of the Legal Health Record and Designated Record
  Set'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Define included and excluded elements in a matrix aligned to the legal health record
  template.
- Distinguish legal health record from designated record set and from technical system
  logs.
- Address hybrid image storage and scanned legacy records without treating all backend
  metadata as part of the legal health record.
- Include a production format section that reflects ordinary ROI workflows.
---

# Legal Health Record Definition

**Organization**: Pine Arc Regional Health
**Effective Date**: 2026-04-01
**Approved By**: Rowan Pike, RHIA; Elise Fen, MD, CMO; M. Corbett, JD; Niko Vale, CIO
**Review Cycle**: Annual

## Included in the Legal Health Record
| Document/Data Element | Source System | Format | Authentication Required |
|----------------------|--------------|--------|----------------------|
| History & Physical | AsterEHR | Electronic | Attending or privileged provider signature |
| Clinic Notes | AsterEHR | Electronic | Author signature |
| Emergency Department Record | TrailChart archived to AsterEHR | Electronic PDF | Treating clinician signature |
| Discharge Instructions | AsterEHR | Electronic | Attending or discharging provider authentication |
| Medication Administration Record | AsterEHR | Electronic | Administering nurse authentication |
| Laboratory Final Reports | AsterEHR and laboratory interface repository | Electronic | Performing laboratory final verification |
| Radiology Final Reports | AsterEHR and PeakPACS | Electronic | Radiologist signature |
| Diagnostic Images requested for production | PeakPACS and retired optical archive | DICOM or image export | Final report linkage and study integrity verification |
| Scanned Outside Records incorporated into treatment workflow | ScanVault | Electronic image | Source attribution and indexing verification |
| Consent Forms | AsterEHR and ScanVault | Electronic image | Patient or representative and witness where required |

## Excluded from the Legal Health Record
| Data Element | Reason for Exclusion | Discoverable Separately? |
|-------------|---------------------|------------------------|
| Access logs | Security and compliance monitoring data | Yes, through legal or compliance request |
| Interface queue history | Technical transport record, not clinical documentation | Potentially |
| Unsigned drafts | Not finalized or authenticated | No |
| Coding worksheets | Revenue cycle work product | Yes, separate business request |
| Claim edits and billing scrubber output | Administrative billing support data | Yes, separate request |
| Psychotherapy notes maintained separately | Special category excluded under HIPAA definition | Yes, with separate handling |
| Device telemetry not incorporated into signed documentation | Raw technical feed not adopted into the patient record | Potentially |

## Production Format
- Default output: paginated PDF packet from approved release print groups.
- Images: DICOM export or secure viewer production when specifically requested.
- Legacy ED records: PDF export from archived TrailChart content preserved in the ROI packet.
- Delivery method: secure portal or encrypted media with disclosure logging.

## Scope Clarification
- This matrix defines the legal health record used for formal production and evidentiary response.
- The designated record set used for patient access may extend beyond this matrix to include other records used to make decisions about the individual.
- Technical provenance and system logs remain outside the legal health record unless separately requested through legal process.
