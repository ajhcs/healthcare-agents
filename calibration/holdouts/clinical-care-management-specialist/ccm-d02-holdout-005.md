---
holdout_id: ccm-holdout-005
agent_slug: clinical-care-management-specialist
agents_relevant:
  - clinical-care-management-specialist
deliverable_id: ccm-d02
deliverable_title: Readmission Risk Assessment
seed_ref: ccm-seed-005
scenario_summary: 64-year-old man after hip fracture repair with atrial fibrillation and inconsistent caregiver support
complexity: moderate
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
retirement_trigger: CMS updates discharge planning or post-acute transfer requirements
expectations:
  - include anticoagulation education and monitoring tasks
  - identify rehab placement criteria and receiving facility needs
  - score readmission risk with patient-specific detail
---

# Readmission Risk Assessment

Patient: David Ellis, MRN 4482997
Admission Date: 2026-04-03
Expected Discharge: 2026-04-11
Primary Diagnosis: Hip fracture repair
HRRP Condition: No

## LACE Index Score
| Factor | Value | Points |
|---|---|---|
| Length of stay | 5 days | /7 |
| Acuity of admission | Urgent | /3 |
| Comorbidities (Charlson) | 3 | /5 |
| ED visits (prior 6 months) | 1 visit | /4 |
| Total LACE Score |  | 11/19 |

Risk Level: Moderate to High

## Readmission Risk Factors
- Anticoagulation requires close follow-up
- Mobility limitation increases fall risk
- Caregiver support is inconsistent
- Rehab placement is still being finalized
- Medication education must be repeated with teach-back

## Discharge Intervention Plan
| Intervention | Assigned To | Completed |
|---|---|---|
| Anticoagulation education | RN CM | No |
| Rehab acceptance confirmation | Case management | No |
| Follow-up orthopedic visit within 10 days | Care coordinator | No |
| Post-discharge call within 48 hours | Care manager | No |
| Home safety review | Occupational therapy | No |

Source note: 42 CFR 482.43 and CMS MLN SE1345 support discharge planning and transition coordination.

