---
holdout_id: sco-d01-example-03-icu-flex-plan
agent_slug: strategy-clinical-operations-consultant
agents_relevant:
- strategy-clinical-operations-consultant
deliverable_id: sco-d01
deliverable_title: Nurse Staffing Model
seed_ref: calibration/seeds/strategy-clinical-operations-consultant/sco-d01-seed-03-icu-flex-plan.yaml
scenario_summary: ICU and step-down staffing plan with acuity spikes, float coverage
  needs, and a narrow margin for overtime.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 482.23
- BLS OEWS 2025
- AHRQ patient safety guidance
- CMS quality reporting guidance
generated_by: sonnet-4.6
reviewed_by: human
review_status: reviewed
review_date: '2026-04-09'
frozen: true
superseded_by: null
retirement_trigger: Retire when ICU acuity standards or staffing expectations materially
  change the coverage pattern.
expectations:
- Show the ICU and step-down gap separately.
- Build a flex plan that responds to acuity, not just census.
- Keep the safety discussion grounded in compliance and patient care.
---

# Nurse Staffing Model

The ICU and step-down units need a sharper staffing model because acuity spikes are exhausting the schedule and pulling overtime higher. The answer should show how much flex coverage is needed and where it should sit.

## Current State
| Unit / Shift | Census or Volume | Current Staffing | Observed Gap |
|---|---|---|---|
| ICU day shift | 14.2 average census | 6 RN / 1 support | Acuity spike risk |
| ICU night shift | 13.1 average census | 5 RN / 1 support | Weekend overtime |
| Step-down day shift | 21.4 average census | 8 RN / 2 support | No backup pool |
| Step-down night shift | 19.8 average census | 7 RN / 2 support | Float pool exhausted |

## Recommended Staffing Grid
| Unit / Shift | Recommended RN | Recommended Support | Coverage Rule |
|---|---|---|---|
| ICU day | 7 RN | 1 support | Add a charge-capable flex RN |
| ICU night | 6 RN | 1 support | Use acuity-triggered relief coverage |
| Step-down day | 9 RN | 2 support | Maintain one internal per-diem on call |
| Step-down night | 8 RN | 2 support | Hold a late-shift relief nurse |

## FTE Budget
| Role | Current FTE | Recommended FTE | Delta | Annual Cost Impact |
|---|---|---|---|---|
| RN | 26.6 | 28.2 | +1.6 | $182,000 |
| Support staff | 6.0 | 6.4 | +0.4 | $28,000 |
| Charge / flex | 1.8 | 2.4 | +0.6 | $51,000 |

## Flex Plan
| Trigger | Action | Owner |
|---|---|---|
| Acuity score rises two points | Activate relief RN and reduce charge nurse admin time | Clinical leader |
| Two or more discharges delayed | Pull support staff into transport and discharge assist | House supervisor |
| Weekend volume spike | Use internal per-diem before agency | Nurse manager |

## Safety & Quality Impact Assessment
- The ICU and step-down plan lowers overtime risk while protecting patient safety on the highest-acuity shifts.
- The flex layer should absorb spikes from admissions and transfers instead of turning every spike into a permanent agency expense.
- The staffing proposal stays inside 42 CFR 482.23 while matching the unit mix more closely to the actual census pattern.

The staffing model is grounded in 42 CFR 482.23, current nurse labor market data, and unit-level acuity rather than a blanket ratio. The recommended grid protects patient safety while creating a flex layer that absorbs census spikes without turning the schedule into permanent agency dependence.
