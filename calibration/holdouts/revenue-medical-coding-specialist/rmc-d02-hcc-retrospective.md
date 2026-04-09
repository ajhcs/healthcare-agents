---
holdout_id: rmc-ho-005
agent_slug: revenue-medical-coding-specialist
agents_relevant:
  - revenue-medical-coding-specialist
deliverable_id: rmc-d02
deliverable_title: CDI Query Effectiveness Report
seed_ref: calibration/seeds/revenue-medical-coding-specialist/rmc-d02-hcc-retrospective.yaml
scenario_summary: Medicare Advantage HCC retrospective review for a primary care panel with CHF, CKD, diabetes, and COPD capture gaps
complexity: high
mcp_servers_relevant:
  - provider_directory
  - current_regulatory_policy
regulatory_as_of: 2026-04-01
source_basis:
  - CMS-HCC model documentation
  - 42 CFR 422.311
  - CMS risk adjustment guidance
generated_by: sonnet-4.6
reviewed_by: maintainer
review_status: reviewed
review_date: 2026-04-09
frozen: true
superseded_by: null
retirement_trigger: Retire when CMS-HCC model updates materially change annual capture or RADV support expectations.
expectations:
  - The report quantifies the gap between documented chronic disease burden and coded HCC capture.
  - The recommendations separate provider education from coding cleanup and encounter validation.
  - The report names the RADV exposure created by unsupported chronic diagnoses.
---

# CDI Query Effectiveness Report

**Facility**: Northbridge Primary Care
**Reporting Period**: Calendar year 2025 retrospective review

## Query Volume & Response
| Metric | This Period | Prior Period | Target |
|--------|-------------|--------------|--------|
| Total queries issued | 18 | 14 | 15-25 |
| Query response rate | 83.3% | 71.4% | >85% |
| Agree rate | 72.2% | 64.3% | >70% |
| Mean response time (days) | 2.9 | 4.1 | <3 days |

## Query Impact
| Metric | Result |
|--------|--------|
| DRGs changed by queries | Not applicable in this outpatient-focused review |
| Net CMI impact | Not applicable |
| Estimated revenue impact | $14,800 in RAF-supporting capture |
| CC/MCC captures from queries | Not applicable |
| SOI/ROM changes | Not applicable |

## Query Type Distribution
| Query Type | Volume | Agree Rate | Avg $ Impact |
|------------|--------|------------|-------------|
| Specificity (e.g., CKD stage) | 6 | 83.3% | $820 |
| Clinical significance (e.g., CHF acuity) | 4 | 75.0% | $1,100 |
| Present on Admission | 0 | Not applicable | Not applicable |
| Principal diagnosis clarification | 2 | 50.0% | $0 |
| Procedure clarification | 0 | Not applicable | Not applicable |

## Top Queried Conditions
| Condition | Queries | Agree Rate | HCC/DRG Impact |
|-----------|---------|------------|----------------|
| Chronic heart failure | 5 | 80.0% | HCC capture |
| CKD stage 3b and 4 | 4 | 75.0% | HCC capture |
| Diabetes with chronic complication | 4 | 75.0% | RAF uplift |
| COPD with chronic hypoxemia | 3 | 66.7% | HCC capture |
| Morbid obesity | 2 | 100.0% | HCC capture |

## Narrative Summary
The panel review showed that the practice documented chronic disease burden well, but the problem was inconsistent annual coding capture. Several notes included enough face-to-face support for HCC-relevant diagnoses, yet the final coded set omitted the stage-specific CKD and the CHF acuity language that would have raised RAF support. Queries were most effective when they asked the provider to confirm the exact condition already described in the assessment rather than introducing a new diagnosis label.

## Education Plan
| Topic | Target Audience | Format | Due Date |
|-------|----------------|--------|----------|
| Annual HCC capture discipline | Primary care providers | Panel feedback email | 2026-04-15 |
| Face-to-face support for chronic conditions | Coding and CDI staff | Encounter review checklist | 2026-04-18 |
| RADV documentation readiness | Billing and compliance | 30-minute risk review | 2026-04-23 |

## Regulatory Notes
- The review was aligned to CMS-HCC model documentation and the 42 CFR 422.311 RADV support standard.
- Provider taxonomy and encounter identity were verified before counting a diagnosis as supported for risk adjustment.
- The biggest issue was not clinical disagreement; it was incomplete annual capture of already documented chronic disease burden.
