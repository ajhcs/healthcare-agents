---
holdout_id: him-d02-holdout-04-part2-segmented-lhr-profile
agent_slug: healthit-information-manager
agents_relevant:
- healthit-information-manager
deliverable_id: him-d02
deliverable_title: Legal Health Record Definition Matrix
seed_ref: healthit-information-manager/him-d02-seed-04-part2-segmented-lhr-profile.yaml
scenario_summary: A multi-state system with behavioral health and substance use programs
  needs a segmented legal health record matrix that protects special records while
  supporting lawful disclosure.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR Part 2 Final Rule Fact Sheet, HHS.gov, updated January 30, 2026
- 45 CFR 164.501, designated record set definition, LII e-CFR
- AHIMA, Fundamentals of the Legal Health Record and Designated Record Set, journal.ahima.org
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- The matrix must separate general clinical content from behavioral health and substance
  use program content.
- The excluded section must include audit trails, access logs, and draft or duplicate
  content.
- The production format section must state how the organization handles PDF, C-CDA,
  and native export requests.
- The governance notes must say that the legal health record is not identical to the
  designated record set.
---

# Legal Health Record Definition

**Organization**: Meadowgate Health Alliance
**Effective Date**: 2026-04-09
**Approved By**: HIM Director, Behavioral Health Chief, Privacy Officer, General Counsel
**Review Cycle**: Annual

## Included in the Legal Health Record

| Document/Data Element | Source System | Format | Authentication Required |
|----------------------|--------------|--------|-------------------------|
| General medical record | Enterprise EHR | Electronic | Provider authentication |
| Discharge summary | Enterprise EHR | Electronic | Attending signature |
| Lab results | LIS | Electronic | Performing lab verification |
| Radiology report | RIS and PACS | Electronic | Radiologist signature |
| Scanned outside consult | Scanning workflow | Image | HIM indexing verification |
| Portal message filed into chart | Patient portal and EHR | Electronic | Provider authentication |
| Behavioral health progress note | Behavioral health EHR | Electronic | Clinician signature |
| Part 2 program documentation | Behavioral health program system | Electronic | Program-level authentication |

## Excluded from the Legal Health Record

| Data Element | Reason for Exclusion | Discoverable Separately? |
|-------------|---------------------|-------------------------|
| Audit trail exports | Security and compliance artifact | Yes, by legal process |
| Access logs | Technical record | Yes, by legal process |
| Draft notes | Not authenticated | No |
| Duplicate imports | Redundant copy | No |
| CDS alerts not accepted into chart | System-generated advisory | Sometimes |
| Billing claims | Financial record set | Yes, through finance record set |

## Production Format
- Default output is a paginated PDF from the enterprise release queue.
- C-CDA may be used when the requestor wants an electronic copy and the record is readily producible.
- Native exports require Legal and Privacy review before disclosure.
- Special record segments are validated before release so the packet matches the lawful scope.

## Governance Notes
- The legal health record is the organization’s evidentiary record, not the entire data universe.
- The designated record set may include broader decision-support, billing, and enrollment data.
- Psychotherapy notes remain separately handled and are never blended into the general chart export.
- Addenda preserve the original entry, the date of the later entry, and the reason for the change.
- HIM, Compliance, and Behavioral Health jointly maintain the segmentation map and review it annually.
