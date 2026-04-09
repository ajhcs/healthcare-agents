---
holdout_id: rmc-ho-004
agent_slug: revenue-medical-coding-specialist
agents_relevant:
  - revenue-medical-coding-specialist
deliverable_id: rmc-d02
deliverable_title: CDI Query Effectiveness Report
seed_ref: calibration/seeds/revenue-medical-coding-specialist/rmc-d02-malnutrition-query.yaml
scenario_summary: Oncology inpatient CDI query review focused on malnutrition severity, weight loss, and physician response quality
complexity: high
mcp_servers_relevant:
  - current_regulatory_policy
  - coding_edit_policy
regulatory_as_of: 2026-04-01
source_basis:
  - CMS ICD-10-CM Official Guidelines for Coding and Reporting FY 2026
  - AHA Coding Clinic guidance on malnutrition coding
  - CMS MS-DRG Definitions Manual v43.0
generated_by: sonnet-4.6
reviewed_by: maintainer
review_status: reviewed
review_date: 2026-04-09
frozen: true
superseded_by: null
retirement_trigger: Retire when CMS or Coding Clinic changes the malnutrition specificity guidance used in the review.
expectations:
  - The report measures query response rate, agree rate, and downstream DRG impact.
  - The top queried conditions include malnutrition, weight loss, and cachexia specificity.
  - The recommendations improve query wording and provider response quality rather than only increasing query volume.
---

# CDI Query Effectiveness Report

**Facility**: Valley Cancer Institute
**Reporting Period**: January 2026 - March 2026

## Query Volume & Response
| Metric | This Period | Prior Period | Target |
|--------|-------------|--------------|--------|
| Total queries issued | 24 | 19 | 20-30 |
| Query response rate | 87.5% | 78.9% | >85% |
| Agree rate | 70.8% | 63.2% | >70% |
| Mean response time (days) | 2.4 | 3.6 | <3 days |

## Query Impact
| Metric | Result |
|--------|--------|
| DRGs changed by queries | 7 (29.2% of queried records) |
| Net CMI impact | +0.18 |
| Estimated revenue impact | $19,400 |
| CC/MCC captures from queries | 9 |
| SOI/ROM changes | 6 |

## Query Type Distribution
| Query Type | Volume | Agree Rate | Avg $ Impact |
|------------|--------|------------|-------------|
| Specificity (e.g., severe vs. moderate malnutrition) | 10 | 80.0% | $1,860 |
| Clinical significance (e.g., add CC/MCC) | 6 | 66.7% | $1,550 |
| Present on Admission | 3 | 100.0% | Not applicable |
| Principal diagnosis clarification | 3 | 66.7% | $2,200 |
| Procedure clarification | 2 | 50.0% | $1,100 |

## Top Queried Conditions
| Condition | Queries | Agree Rate | HCC/DRG Impact |
|-----------|---------|------------|----------------|
| Severe protein-calorie malnutrition | 9 | 77.8% | MCC capture |
| Cachexia versus malnutrition | 5 | 60.0% | DRG specificity |
| Weight loss | 4 | 75.0% | Documentation clarity |
| Dehydration | 3 | 66.7% | Secondary diagnosis |
| Anorexia / poor intake | 3 | 66.7% | Clinical significance |

## Narrative Summary
The query program improved clarity when the note contained dietitian language, but physician responses still used nonspecific phrases such as "poor nutrition" and "failing to thrive" without tying the response to the documented diagnosis. The most successful queries named the abnormal intake pattern, the weight-loss trend, and the clinical consequence before asking for specificity. The strongest financial lift came from records where severe malnutrition was confirmed and then supported an MCC-level secondary diagnosis under CMS MS-DRG v43.0.

## Education Plan
| Topic | Target Audience | Format | Due Date |
|-------|----------------|--------|----------|
| Malnutrition specificity language | CDI specialists and providers | Query wording workshop | 2026-04-16 |
| Response quality expectations | Attending physicians | One-page attestation guide | 2026-04-18 |
| Weight-loss documentation chain | Dietitians and CDI | Joint rounding huddle | 2026-04-22 |

## Regulatory Notes
- The report followed ICD-10-CM FY 2026 guidance for reportable diagnoses and used AHA Coding Clinic clarification when the malnutrition language was ambiguous.
- The highest-yield queries asked for provider-level diagnosis specificity, not just confirmation of dietitian observations.
- CMS MS-DRG v43.0 confirmed that the operational value came from documenting the diagnosis that actually drove severity assignment.
