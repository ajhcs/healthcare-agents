---
holdout_id: pmo-d01-holdout-01-disability-to-65-transition-holdout
agent_slug: payer-medicare-outreach-coordinator
agents_relevant:
- payer-medicare-outreach-coordinator
deliverable_id: pmo-d01
deliverable_title: Medicare Plan Comparison Worksheet
seed_ref: payer-medicare-outreach-coordinator/pmo-d01-seed-01-disability-to-65-transition-holdout.yaml
scenario_summary: A beneficiary already on Medicare due to SSDI turns 65 and must
  reassess MA coverage, Medigap timing, and specialist access.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- Medicare.gov, Medicare and You 2026
- Social Security Administration, Medicare Part D Extra Help
- 42 CFR 422.2274
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Worksheet should capture the new age-65 Medigap decision point and explain why timing
  matters.
- Comparison should reflect specialist-heavy care, provider continuity, and a neutral
  side-by-side between MA and Original Medicare plus Medigap and Part D.
- Cost-saving screening should be present even if eligibility is not obvious.
---

# Medicare Plan Comparison Worksheet

**Beneficiary Name**: Selena Wren
**Medicare Number**: 4LM2-QP7-RD85
**Date of Birth**: 1961-12-02
**Part A Effective Date**: 2020-12-01
**Part B Effective Date**: 2020-12-01
**Current Coverage**: Bright Canal Choice HMO
**Counseling Date**: 2026-10-29
**Counselor**: Noah Finch, SHIP Counselor ID SYN-6712

## Current Situation Assessment
- Monthly prescriptions (with dosages):
  1. Fingolimod 0.5 mg, 30 capsules
  2. Baclofen 10 mg, 90 tablets
  3. Dalfampridine 10 mg, 60 tablets
  4. Vitamin D3 2000 IU, 30 softgels
- Current providers (with NPI if available):
  - PCP: Liora Dane, MD, NPI 1768442081
  - Specialists: Arin Vale, MD Neurology, NPI 1205334410; Pella Hart, MD Rehabilitation, NPI 1992667784
  - Hospital preference: Juniper Sound Rehabilitation Hospital
- Anticipated medical needs (next 12 months):
  - Quarterly neurology visits
  - Ongoing rehabilitation coordination
  - One six-week out-of-state family visit
- Monthly income (for LIS/MSP screening): $2,930
- Financial priorities: Keep current specialists and avoid surprise bills

## Option Comparison
| Factor | Original Medicare + Medigap + Part D | Medicare Advantage (MA-PD) |
|--------|--------------------------------------|---------------------------|
| Monthly premium (total) | Part B: $185 + Medigap G quote pending + Part D premium pending = **higher monthly fixed cost than current HMO** | Part B: $185 + HMO: $0 = **$185 before copays** |
| Annual deductible(s) | Part A: $1,676 + Part B: $257 + Part D deductible depends on selected plan | Medical and drug deductibles set by plan design |
| Max out-of-pocket | **No Medicare cap; Medigap may absorb most Part A and Part B cost sharing after Part B deductible** | **Plan-set in-network maximum applies** |
| Doctor/hospital choice | **Any Medicare-participating provider nationwide** | **Network-based access with referral and authorization rules** |
| Referral needed | **No** | **Yes under current HMO structure** |
| Prescription coverage | **Separate Part D plan** | **Included** |
| Extra benefits (dental/vision) | **Not built into Medicare and Medigap** | **Supplemental benefits included by plan** |
| Travel coverage | **Strong domestic flexibility** | **Routine care tied to plan service area and network terms** |
| Estimated annual drug cost | **Needs current Part D pricing run using medication list** | **Needs current HMO formulary and utilization review check** |
| All providers in-network? | **Yes if provider accepts Medicare** | **Must verify each specialist and facility for next contract year** |
| All drugs on formulary? | **Must verify on selected Part D plan** | **Must verify on current MA-PD formulary** |

## Cost-Saving Program Screening
| Program | Eligible? | Action |
|---------|----------|--------|
| LIS/Extra Help | No by initial income screen | No application started today |
| QMB | No by initial income screen | No application started today |
| SLMB | Possible depending on state method and deductions | Referred to state Medicaid screening portal |
| QI | Possible depending on state method and funding availability | Referred to state Medicaid screening portal |
| State Pharmaceutical Assistance | Possible | Asked beneficiary to gather ZIP-specific aging resource list for next session |
| Other: Age-65 Medigap open enrollment review | Yes | Discussed timing importance before 2027-06-30 follow-up target |

## Counselor Notes
Beneficiary has complex specialist care and values continuity over low premium. Central issue is whether turning 65 opens a practical Medigap opportunity now that was not fully usable during disability Medicare years. Neutral counseling should emphasize that remaining in MA may preserve low monthly premium and extra benefits, while Original Medicare plus Medigap may improve provider flexibility and reduce authorization friction if premiums are affordable. No specific plan recommendation should be included.

## Next Steps
- Confirm 2027 network status for neurologist and rehabilitation hospital
- Pull Medigap premium quotes for beneficiary ZIP and smoking status
- Run Part D comparison with current drug list
- Revisit decision before the beneficiary's age-65 Medigap window closes
