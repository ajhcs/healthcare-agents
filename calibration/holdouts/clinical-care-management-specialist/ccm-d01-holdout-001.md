---
holdout_id: ccm-holdout-001
agent_slug: clinical-care-management-specialist
agents_relevant:
  - clinical-care-management-specialist
deliverable_id: ccm-d01
deliverable_title: Comprehensive Care Management Plan
seed_ref: ccm-seed-001
scenario_summary: 72-year-old man with CHF exacerbation, diabetes, food insecurity, and no established PCP
complexity: high
regulatory_as_of: 2026-04-09
source_basis:
  - 42 CFR 424.22
  - CMS MLN SE1345
generated_by: sonnet-4.6
reviewed_by: human
review_status: reviewed
review_date: 2026-04-09
frozen: true
superseded_by: null
retirement_trigger: CMS updates transitional care or chronic care billing guidance
expectations:
  - compute the patient-specific risk score and document the result
  - assign medication, follow-up, and social work tasks with owners and dates
  - include a concrete plan for food insecurity and post-discharge outreach
---

# Comprehensive Care Management Plan

Patient: Robert Chen, MRN 4482910
PCP: None established
Care Manager: Angela Torres, RN, CCM
Risk Stratification Score: LACE 14/19 (High Risk)
Plan Effective Date: 2026-04-09
Next Review: 2026-04-16

## Active Conditions
| Condition | ICD-10 | Status | Specialist | Last Visit |
|---|---|---|---|---|
| Acute on chronic CHF with reduced EF | I50.23 | Exacerbation | Cardiology | 2026-04-01 |
| Type 2 diabetes with hyperglycemia | E11.65 | Active | Endocrinology | 2026-03-18 |
| Food insecurity | Z59.41 | Active | Social work | 2026-04-09 |

## Medications
| Medication | Dose/Frequency | Prescriber | Adherence Issues |
|---|---|---|---|
| Furosemide | 40 mg daily | Hospitalist | Missed doses when food is scarce |
| Lisinopril | 10 mg daily | PCP bridge | Needs reconciled at discharge |
| Metformin | 500 mg twice daily | Endocrinology | Holds doses when appetite is poor |

## Goals & Interventions
| Goal | Intervention | Responsible | Target Date | Status |
|---|---|---|---|---|
| Reduce 30-day readmission risk | Teach-back discharge call and symptom checklist | RN CM | 2026-04-11 | Open |
| Stabilize medication access | Pharmacy refill sync and 30-day supply at discharge | PharmD | 2026-04-10 | Open |
| Close food access gap | Pantry referral and meal delivery intake | Social worker | 2026-04-10 | Open |
| Establish PCP follow-up | Schedule visit within 7 days | Care coordinator | 2026-04-12 | Open |

## SDOH Assessment
- Food insecurity: positive, referral placed
- Housing instability: negative
- Transportation barriers: positive, arranged ride support
- Utility needs: negative
- Interpersonal safety: negative

## Follow-Up Schedule
| Activity | Frequency | Next Due | Completed |
|---|---|---|---|
| Telephonic outreach | Weekly x 4, then monthly | 2026-04-16 | No |
| PCP visit | Within 7 days | 2026-04-16 | No |
| Cardiology visit | Within 14 days | 2026-04-23 | No |
| Medication reconciliation | At discharge and 48 hours post-discharge | 2026-04-10 | No |

Source note: 42 CFR 424.22 and CMS MLN SE1345 support the discharge coordination and documented follow-up workflow.

