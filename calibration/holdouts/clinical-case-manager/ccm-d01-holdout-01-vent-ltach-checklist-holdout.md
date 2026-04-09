---
holdout_id: ccm-d01-holdout-01-vent-ltach-checklist-holdout
agent_slug: clinical-case-manager
agents_relevant:
- clinical-case-manager
deliverable_id: ccm-d01
deliverable_title: Discharge Planning Checklist
seed_ref: clinical-case-manager/ccm-d01-seed-01-vent-ltach-checklist-holdout.yaml
scenario_summary: Ventilator-dependent ICU patient needs LTACH transfer with payer
  review, receiving-facility coordination, and detailed transition safeguards.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 482.43 Hospital discharge planning requirements
- CMS LTCH Prospective Payment System and site-neutral payment guidance
- EMTALA transfer requirements under 42 USC 1395dd(c)
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Show a completed checklist with LTACH-specific barriers, not a generic transfer
  note.
- Reflect active concurrent management of payer authorization, prolonged ventilation
  criteria, and transport readiness.
- Document patient-choice compliance while still conveying a high-acuity, tightly
  coordinated discharge.
- Include a concrete avoidable day table with at least one avoidable day and an intervention
  response.
---

# Discharge Planning Checklist

**Patient**: Iris Halden / MRN VX-772901
**Admission Date**: 2026-03-30
**Expected LOS**: 18 days (GMLOS for DRG: 16.8)
**Expected Discharge Date**: 2026-04-17
**Discharge Disposition**: LTACH

## Day 1 Assessment
- Initial CM assessment completed within 24 hours of ICU admission
- Discharge risk screen identified prolonged ventilation risk, likely post-acute complex placement need, spouse as primary surrogate, and home environment unable to support ventilator care
- Anticipated disposition identified as LTACH if prolonged weaning course continued
- Payer notification initiated early because post-acute transfer was foreseeable
- 3-midnight qualifying stay tracking documented even though SNF was not the primary plan, to preserve alternate pathway awareness if clinical trajectory changed

## Concurrent Management
- Participating in daily IDR with intensivist, respiratory therapy, bedside RN, pharmacy, PT/OT, speech, and social work
- Discharge barriers identified and documented:
  - Barrier 1: LTACH authorization pending medical director review — Owner: Case Manager — Target resolution: 2026-04-16
  - Barrier 2: Final ventilator weaning plan and IV antibiotic stop date need inclusion in transition packet — Owner: ICU attending and pharmacy — Target resolution: 2026-04-16
- Post-acute referral submitted: LTACH referral sent after tracheostomy placement and prolonged ventilation course confirmed
- Authorization requested: Mesa Summit Medicare Choice, reference MSC-LTACH-90418, clinicals faxed with ICU and respiratory notes
- Family meeting completed with spouse Rowan Halden to review qualified provider options, current quality information, and transfer expectations
- Multidisciplinary meeting held to confirm LTACH remains the least restrictive safe setting versus continued acute hospitalization or lower post-acute level of care
- Escalation path identified if payer denies: physician advisor review, peer-to-peer request, and concurrent alternate placement planning

## Pre-Discharge
- Post-acute placement confirmed: North Quill Long-Term Acute Hospital
- Authorization obtained: MSC-LTACH-90418 with final service dates pending payer letter
- Transport arranged: Critical care ambulance with ventilator support, respiratory handoff, and medication transport checklist
- Medication reconciliation completed with antimicrobial plan, sedation taper, anticoagulation, and secretion management orders
- DME ordered and delivery confirmed through receiving facility resources; home DME not applicable
- Patient and spouse education completed regarding tracheostomy precautions, transfer rationale, and receiving-team contact process
- Follow-up appointments scheduled through receiving team handoff: pulmonology on arrival and infectious disease review in 7 days if IV antibiotics continue
- Discharge summary to receiving provider: Sent with ventilator settings, most recent ABG trend, imaging summary, microbiology, wound status, and central-line details
- CMS post-acute provider choice list provided to patient: Yes, discussed with spouse and documented in case management note

## Avoidable Day Tracking
| Date | Avoidable: Y/N | Reason | Action Taken |
|------|---------------|--------|-------------|
| 2026-04-13 | N | Patient still required ICU-level monitoring during ventilator instability | Continued acute management |
| 2026-04-14 | N | LTACH referral under active review while patient remained clinically complex | Clinical packet updated |
| 2026-04-15 | Y | Payer requested added respiratory documentation after initial submission | Same-day escalation to physician advisor and resend of ventilator documentation |
| 2026-04-16 | N | Awaiting final transport and receiving-bed release after approval | Confirmed acceptance and transfer readiness |

## Case Management Note Summary
- LTACH recommendation is based on prolonged mechanical ventilation and complex ongoing medical management needs that exceed lower-level post-acute capability.
- Receiving-facility acceptance, payer approval, and transport safety must all align before departure.
- The final transfer packet should clearly support safe handoff and avoid a referral failure caused by missing facility, payer, or policy verification.
