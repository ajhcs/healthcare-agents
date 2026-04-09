---
exemplar_id: ccm-example-004
agent_slug: clinical-care-management-specialist
agents_relevant:
  - clinical-care-management-specialist
deliverable_id: ccm-d02
deliverable_title: Readmission Risk Assessment
scenario_summary: 62-year-old woman with cellulitis, diabetes, and repeated ED visits
complexity: moderate
mcp_servers_relevant:
  - provider_directory
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

Patient: Tasha Bell, MRN 4483044
Admission Date: 2026-04-04
Expected Discharge: 2026-04-09
Primary Diagnosis: Cellulitis
HRRP Condition: No

## LACE Index Score
| Factor | Value | Points |
|---|---|---|
| Length of stay | 4 days | /7 |
| Acuity of admission | ED | /3 |
| Comorbidities (Charlson) | 3 | /5 |
| ED visits (prior 6 months) | 2 visits | /4 |
| Total LACE Score |  | 12/19 |

Risk Level: High

## Readmission Risk Factors
- Diabetes affects wound healing
- Prior ED use suggests unstable outpatient access
- Lives with a limited support network
- Transportation problems can interrupt follow-up

## Discharge Intervention Plan
| Intervention | Assigned To | Completed |
|---|---|---|
| Wound-care teaching | RN CM | No |
| Follow-up visit within 5 days | Care coordinator | No |
| Home health referral | Social work | No |
| Post-discharge call within 48 hours | Care manager | No |
| PCP discharge summary within 24 hours | Hospitalist | No |

Source note: 42 CFR 482.43 and CMS MLN SE1345 support the discharge planning workflow.

