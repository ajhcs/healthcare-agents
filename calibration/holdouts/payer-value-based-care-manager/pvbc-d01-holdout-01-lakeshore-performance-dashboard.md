---
holdout_id: pvbc-d01-holdout-01-lakeshore-performance-dashboard
agent_slug: payer-value-based-care-manager
agents_relevant:
- payer-value-based-care-manager
deliverable_id: pvbc-d01
deliverable_title: ACO Performance Dashboard
seed_ref: payer-value-based-care-manager/pvbc-d01-seed-01-lakeshore-performance-dashboard.yaml
scenario_summary: A BASIC Level E ACO is missing savings because outpatient, ED, and
  leakage trends are offsetting acceptable quality performance and a stable attributed
  roster.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- 'CMS Medicare Shared Savings Program Data Portal: https://data.cms.gov/medicare-shared-savings-program'
- 'CMS Quality ID #438: Statin Therapy for the Prevention and Treatment of Cardiovascular
  Disease: https://qpp.cms.gov/docs/QPP_quality_measure_specifications/CQM-Measures/2025_Measure_438_MIPSCQM.pdf'
- 'CMS Quality ID #112 (CBE 2372): Breast Cancer Screening: https://qpp.cms.gov/docs/QPP_quality_measure_specifications/CQM-Measures/2025_Measure_112_MIPSCQM.pdf'
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Must present YTD financials, TCOC by category, utilization, attribution, leakage,
  and action items in the dashboard format.
- Must show at least one negative cost driver and at least one corrective action tied
  directly to that driver.
- Must keep current PY, prior PY, and benchmark clearly separated in each financial
  table.
---

# ACO Performance Dashboard — Performance Year 2026

**ACO Name**: Lakeshore Community ACO  
**CMS ACO ID**: ACO-6182  
**Track/Level**: BASIC Level E  
**Assigned Beneficiaries**: 31,440  
**Participating TINs**: 11  
**Participating Clinicians**: 189

## Financial Performance (YTD)
| Metric | Current PY | Prior PY | Benchmark |
|--------|-----------:|---------:|----------:|
| Total Expenditures | $286.7M | $279.9M | $283.1M |
| Benchmark | $283.1M | $276.8M | — |
| Gross Savings/(Losses) | $(3.6)M | $3.1M | — |
| Savings Rate | -1.27% | 1.12% | MSR: 2.00% |
| Quality Score | 89/100 | 86/100 | Threshold: 75 |
| Estimated Shared Savings | $(1.9)M | $1.4M | — |

## TCOC Decomposition (PMPM)
| Category | Current | Prior | Trend | National |
|----------|---------:|------:|------:|---------:|
| Inpatient Acute | $1,178 | $1,149 | +2.5% | $1,162 |
| Post-Acute (SNF/HHA/IRF) | $812 | $789 | +2.9% | $845 |
| Outpatient Facility | $701 | $672 | +4.3% | $689 |
| Professional | $449 | $440 | +2.0% | $452 |
| Other (DME/Amb/Lab) | $163 | $158 | +3.2% | $169 |
| **Total PMPM** | **$3,303** | **$3,208** | **+3.0%** | **$3,317** |

## Quality Measure Performance
| Measure | Rate | Benchmark | Points | Max |
|---------|------:|----------:|-------:|----:|
| Controlling High Blood Pressure | 83% | 80% | 8/10 | 10 |
| Depression Screening & Follow-Up | 88% | 82% | 9/10 | 10 |
| Colorectal Cancer Screening | 73% | 71% | 8/10 | 10 |
| Breast Cancer Screening | 77% | 75% | 9/10 | 10 |
| Statin Therapy for CVD | 90% | 86% | 10/10 | 10 |
| Screening for Social Drivers of Health | 66% | 63% | 8/10 | 10 |
| **Total Quality Score** | | | **52/60** | **60** |

## Utilization Metrics (per 1,000 beneficiaries)
| Metric | Current | Prior | Target | National |
|--------|---------:|------:|-------:|---------:|
| Acute Admits | 252 | 241 | 230 | 227 |
| Readmissions (30-day) | 11.6 | 11.2 | 11.0 | 11.3 |
| ED Visits | 218 | 207 | 214 | 216 |
| SNF Days | 201 | 194 | 190 | 198 |
| Specialist Referrals | 1,356 | 1,282 | 1,310 | 1,349 |
| AWV Completion Rate | 67% | 64% | 70% | 63% |

## Attribution & Leakage
- Assigned beneficiaries: 31,440
- Voluntarily aligned: 6,120 (19.5%)
- In-network utilization: 78%
- Leakage rate: 22%
- Top leakage destinations: orthopedic surgery, cardiac diagnostics, hospital outpatient imaging

## Action Items
- Expand care management to beneficiaries with CHF and COPD who have two or more ED visits in six months.
- Move orthopedic referrals to preferred groups with closed-loop scheduling and eConsult triage.
- Increase AWV completion from 67% to 72% before the final quality submission window.
- Audit claims lag on SNF episodes to ensure the post-acute trend is not understated.
