---
holdout_id: ccm-holdout-004
agent_slug: clinical-care-management-specialist
agents_relevant:
  - clinical-care-management-specialist
deliverable_id: ccm-d02
deliverable_title: Readmission Risk Assessment
seed_ref: ccm-seed-004
scenario_summary: 76-year-old woman with community-acquired pneumonia and repeated missed follow-up visits
complexity: high
regulatory_as_of: 2026-04-09
source_basis:
  - 42 CFR 482.43
  - CMS MLN SE1345
generated_by: sonnet-4.6
reviewed_by: human
review_status: reviewed
review_date: 2026-04-09
frozen: true
superseded_by: null
retirement_trigger: CMS updates discharge planning or readmission reduction guidance
expectations:
  - calculate the LACE score for the patient
  - identify prior utilization and medication-related risk factors
  - schedule follow-up appointments and a 48-hour call
---

# Readmission Risk Assessment

Patient: Mildred Price, MRN 4482991
Admission Date: 2026-04-01
Expected Discharge: 2026-04-10
Primary Diagnosis: Community-acquired pneumonia
HRRP Condition: Yes - PNA

## LACE Index Score
| Factor | Value | Points |
|---|---|---|
| Length of stay | 6 days | /7 |
| Acuity of admission | ED | /3 |
| Comorbidities (Charlson) | 4 | /5 |
| ED visits (prior 6 months) | 2 visits | /4 |
| Total LACE Score |  | 14/19 |

Risk Level: High

## Readmission Risk Factors
- Prior admission within 30 days
- Five active medications
- Lives alone with limited support
- Transportation barrier to follow-up care
- No established home monitoring plan

## Discharge Intervention Plan
| Intervention | Assigned To | Completed |
|---|---|---|
| Medication reconciliation with teach-back | RN CM | No |
| Follow-up appointment within 7 days | Care coordinator | No |
| Post-discharge call within 48 hours | Care manager | No |
| Home health referral | Social work | No |
| Community resource referral | Social work | No |
| Discharge summary to PCP within 24 hours | Hospitalist | No |

Source note: 42 CFR 482.43 and CMS MLN SE1345 support the discharge planning and follow-up workflow.

