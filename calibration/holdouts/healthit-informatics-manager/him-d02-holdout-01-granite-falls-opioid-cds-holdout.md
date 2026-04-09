---
holdout_id: him-d02-holdout-01-granite-falls-opioid-cds-holdout
agent_slug: healthit-informatics-manager
agents_relevant:
- healthit-informatics-manager
deliverable_id: him-d02
deliverable_title: CDS Intervention Design Document
seed_ref: healthit-informatics-manager/him-d02-seed-01-granite-falls-opioid-cds-holdout.yaml
scenario_summary: An emergency department seeks a CDS intervention for opioid prescribing
  that reduces unsafe prescribing without overwhelming clinicians.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- CDC Clinical Practice Guideline for Prescribing Opioids for Pain
- CDS Hooks Specification, cds-hooks.hl7.org
- ONC HTI-1 Final Rule, Federal Register 89 FR 1192
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Write the deliverable in the exact CDS design structure from the prompt, not as
  a policy memo.
- Use a realistic soft-stop or mixed intervention design with explicit alert-fatigue
  controls.
- Include monitoring metrics tied to prescribing behavior and clinician response.
---

# CDS Intervention Design

**Intervention Name**: ED Opioid Safety Review Prompt
**Clinical Objective**: Reduce high-risk opioid discharge prescribing by surfacing recent opioid exposure, naloxone opportunity, and duplicate therapy risk before order signing
**Requesting Department**: Emergency Department
**Clinical Sponsor**: Cassian Lark, MD
**Design Date**: 2026-05-12

## CDS Five Rights Assessment
| Right | Design Decision | Rationale |
|-------|----------------|-----------|
| Information | Recent opioid exposure, overlapping active opioid therapy, opioid allergy conflict, naloxone co-prescribing opportunity | Targets preventable prescribing risk without attempting to replace clinician judgment |
| Person | ED attending physicians and advanced practice clinicians | These users sign discharge opioid prescriptions |
| Format | Suggestion card plus hard stop only for allergy conflict or duplicate active opioid order | Preserves workflow except in narrow high-risk conditions |
| Channel | EHR prescribing workflow | Decision occurs during discharge ordering |
| Time | `order-sign` for adult ED discharge opioid prescriptions | Intervention is most actionable at signing |

## Technical Specification
- **CDS Hook**: `order-sign`
- **Trigger Logic**: Fire for opioid analgesic discharge orders in adult ED encounters
- **Patient Population**: Adults discharged from the ED with a new opioid prescription
- **Prefetch Resources**: MedicationRequest, AllergyIntolerance, Encounter, Condition
- **Response Cards**: Safety summary card, naloxone suggestion, structured dismissal reason capture

## Alert Fatigue Risk Assessment
- Estimated daily fire volume: 18 to 25
- Expected override rate: 40 to 60 percent
- Hard stop vs. soft stop: Mixed design with hard stop only for allergy conflict or duplicate active opioid therapy
- Suppression logic: One fire per encounter, suppress repeat card after documented dismissal unless order details materially change

## HTI-1 DSI Compliance
- Source transparency should identify developer, governance owner, evidence basis, funding source, and revision date
- Predictive model disclosures are not required if the final build remains rules-based

## Monitoring Plan
| Metric | Baseline | Target | Review Frequency |
|--------|----------|--------|-----------------|
| Fire rate | Establish during pilot | Stable and clinically acceptable | Weekly for 4 weeks, then monthly |
| Override rate | Establish during pilot | Under 65% | Weekly for 4 weeks, then monthly |
| Naloxone co-prescribing rate for eligible discharges | Current local baseline | 20% relative improvement | Monthly |
| Duplicate opioid discharge orders prevented | Current local baseline | Sustained reduction | Monthly |
| Clinician feedback score | Collect after go-live | 4.0 out of 5.0 | 30, 60, and 90 days |

## Approval
- Clinical sponsor sign-off required before build
- Informatics governance approval required before go-live
- Pharmacy review required for medication-related content
- Compliance review required if policy references are included in user-facing text
