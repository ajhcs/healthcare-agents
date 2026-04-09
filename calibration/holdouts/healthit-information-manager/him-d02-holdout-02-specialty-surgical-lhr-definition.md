---
holdout_id: him-d02-holdout-02-specialty-surgical-lhr-definition
agent_slug: healthit-information-manager
agents_relevant:
- healthit-information-manager
deliverable_id: him-d02
deliverable_title: Legal Health Record Definition Matrix
seed_ref: healthit-information-manager/him-d02-seed-02-specialty-surgical-lhr-definition.yaml
scenario_summary: Define the legal health record for a specialty surgical hospital
  focused on orthopedic and spine procedures.
complexity: routine
regulatory_as_of: '2026-04-09'
source_basis:
- 45 CFR 164.501 HIPAA definitions including psychotherapy notes
- 45 CFR 164.524 Individual right of access
- 45 CFR 164.526 Requests for amendment of protected health information
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
- Include perioperative and anesthesia content clearly in scope.
- Exclude audit trails, administrative billing tools, and unsigned drafts.
- Reflect that imaging may be part of the production set when clinically relied upon.
- Use the exact legal health record matrix style rather than a narrative memo.
---

# Legal Health Record Definition

**Organization**: Summit Quay Surgical Institute
**Effective Date**: 2026-03-20
**Approved By**: Dana Pryor, RHIA; Oren Slate, MD, CMO; Mira Corven, JD; Ash Vale, CIO
**Review Cycle**: Annual

## Included in the Legal Health Record
| Document/Data Element | Source System | Format | Authentication Required |
|----------------------|--------------|--------|----------------------|
| Pre-Operative History & Physical | AxisEHR | Electronic | Surgeon or privileged provider signature |
| Operative Report | AxisEHR | Electronic | Surgeon signature |
| Implant Log linked to operative case | AxisEHR and perioperative module | Electronic | Perioperative nursing verification and surgeon association |
| Anesthesia Record | FlowAnesthesia | Electronic | Anesthesiologist or CRNA authentication per medical staff rules |
| PACU Notes | AxisEHR | Electronic | RN authentication |
| Discharge Instructions | AxisEHR | Electronic | Discharging provider authentication |
| Radiology Final Reports | AxisEHR and OrthoPACS | Electronic | Radiologist signature |
| Consent Forms | AxisEHR and ScanCore | Electronic image | Patient or representative and witness where required |

## Excluded from the Legal Health Record
| Data Element | Reason for Exclusion | Discoverable Separately? |
|-------------|---------------------|------------------------|
| Access logs | Security monitoring data | Yes, through legal or compliance request |
| OR schedule drafts | Operational planning material, not final clinical documentation | No |
| Charge router edits | Revenue cycle support data | Yes, separate business request |
| Unsigned preference-card notes | Non-final operational notes | No |
| Quality peer review memos | Protected quality review material, not part of patient legal record | Potentially under separate legal standard |

## Production Format
- Default output: paginated PDF packet from approved surgical encounter print groups.
- Imaging: DICOM image export or secure viewer production when a request specifically includes images.
- Delivery method: secure electronic delivery with disclosure logging and chain-of-custody documentation for media exports.

## Scope Clarification
- The legal health record includes finalized perioperative and anesthesia documentation used to evidence care delivered.
- Administrative planning tools, charge edits, and peer review files remain outside the legal health record.
- Amendments and addenda remain part of the produced record when appended through the controlled EHR workflow.
