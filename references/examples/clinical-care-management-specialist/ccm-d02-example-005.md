---
exemplar_id: ccm-example-005
agent_slug: clinical-care-management-specialist
agents_relevant:
  - clinical-care-management-specialist
deliverable_id: ccm-d02
deliverable_title: Readmission Risk Assessment
scenario_summary: 74-year-old man after pneumonia admission with no established PCP
complexity: high
mcp_servers_relevant:
  - provider_directory
  - provider_enrollment_status
  - current_regulatory_policy
regulatory_as_of: 2026-04-09
source_basis:
  - 42 CFR 482.43
  - CMS MLN SE1345
generated_by: sonnet-4.6
reviewed_by: human
review_status: reviewed
review_date: 2026-04-09
---

# Readmission Risk Assessment

Patient: Henry Lawson, MRN 4483057
Admission Date: 2026-04-02
Expected Discharge: 2026-04-10
Primary Diagnosis: Community-acquired pneumonia
HRRP Condition: Yes - PNA

## LACE Index Score
| Factor | Value | Points |
|---|---|---|
| Length of stay | 6 days | /7 |
| Acuity of admission | ED | /3 |
| Comorbidities (Charlson) | 4 | /5 |
| ED visits (prior 6 months) | 1 visit | /4 |
| Total LACE Score |  | 14/19 |

Risk Level: High

## Readmission Risk Factors
- No established PCP
- Needs inhaler education and symptom monitoring
- Lives alone and relies on neighbors
- Limited transportation to follow-up care

## Discharge Intervention Plan
| Intervention | Assigned To | Completed |
|---|---|---|
| PCP establishment | Care coordinator | No |
| Follow-up visit within 7 days | Care coordinator | No |
| Post-discharge call within 48 hours | Care manager | No |
| Medication reconciliation with teach-back | RN CM | No |
| Discharge summary to PCP within 24 hours | Hospitalist | No |

Source note: 42 CFR 482.43 and CMS MLN SE1345 support the transition-of-care workflow.

