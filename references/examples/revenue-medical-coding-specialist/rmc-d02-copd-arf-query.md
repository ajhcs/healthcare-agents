---
exemplar_id: rmc-ex-005
agent_slug: revenue-medical-coding-specialist
agents_relevant:
  - revenue-medical-coding-specialist
deliverable_id: rmc-d02
deliverable_title: CDI Query Effectiveness Report
scenario_summary: Pulmonary CDI query review focused on COPD with acute respiratory failure and home oxygen specificity
complexity: high
mcp_servers_relevant:
  - current_regulatory_policy
  - provider_directory
regulatory_as_of: 2026-04-01
source_basis:
  - CMS ICD-10-CM Official Guidelines for Coding and Reporting FY 2026
  - CMS MS-DRG Definitions Manual v43.0
  - CMS-HCC model documentation
generated_by: sonnet-4.6
reviewed_by: maintainer
review_status: reviewed
review_date: 2026-04-09
---

# CDI Query Effectiveness Report

**Facility**: Pinecrest Pulmonary Associates
**Reporting Period**: February 2026 - March 2026

## Query Volume & Response
| Metric | This Period | Prior Period | Target |
|--------|-------------|--------------|--------|
| Total queries issued | 21 | 17 | 15-25 |
| Query response rate | 90.5% | 82.4% | >85% |
| Agree rate | 76.2% | 70.6% | >70% |
| Mean response time (days) | 2.2 | 3.4 | <3 days |

## Query Impact
| Metric | Result |
|--------|--------|
| DRGs changed by queries | 6 (28.6% of queried records) |
| Net CMI impact | +0.16 |
| Estimated revenue impact | $17,600 |
| CC/MCC captures from queries | 8 |
| SOI/ROM changes | 5 |

## Query Type Distribution
| Query Type | Volume | Agree Rate | Avg $ Impact |
|------------|--------|------------|-------------|
| Specificity (e.g., acute on chronic respiratory failure) | 9 | 88.9% | $1,780 |
| Clinical significance (e.g., add CC/MCC) | 6 | 66.7% | $1,360 |
| Present on Admission | 2 | 100.0% | Not applicable |
| Principal diagnosis clarification | 2 | 50.0% | $1,940 |
| Procedure clarification | 2 | 50.0% | $900 |

## Top Queried Conditions
| Condition | Queries | Agree Rate | HCC/DRG Impact |
|-----------|---------|------------|----------------|
| COPD exacerbation with acute respiratory failure | 8 | 87.5% | MCC capture |
| Chronic hypoxemic respiratory failure | 4 | 75.0% | HCC capture |
| Home oxygen dependence | 3 | 100.0% | HCC capture |
| Tobacco-related pulmonary disease | 3 | 66.7% | HCC support |
| Hypercapnia | 3 | 66.7% | DRG specificity |

## Narrative Summary
The pulmonary query process performed well when the physician documentation explicitly connected the oxygen requirement, the ABG results, and the treatment response. Queries that asked only for "respiratory failure yes or no" were less effective than queries that restated the charted clinical facts and asked the physician to choose the exact diagnosis. The best-performing queries produced downstream severity improvement under the CMS MS-DRG v43.0 logic and improved the reliability of HCC capture for chronic hypoxemic conditions.

## Education Plan
| Topic | Target Audience | Format | Due Date |
|-------|----------------|--------|----------|
| Respiratory failure specificity | Pulmonology providers | Scenario-based teaching file | 2026-04-14 |
| Home oxygen documentation | Clinic staff | Rooming checklist update | 2026-04-16 |
| HCC capture for chronic hypoxemia | CDI specialists | Query template revision | 2026-04-19 |

## Regulatory Notes
- The review followed ICD-10-CM FY 2026 and CMS MS-DRG v43.0 to test whether the respiratory condition was documented with enough specificity to change severity assignment.
- Provider directory checks were used only when the report needed to verify the specialist responsible for the face-to-face encounter.
- CMS-HCC documentation rules mattered because the chronic respiratory diagnosis also affected annual risk adjustment capture.
