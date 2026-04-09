---
exemplar_id: rmc-ex-004
agent_slug: revenue-medical-coding-specialist
agents_relevant:
  - revenue-medical-coding-specialist
deliverable_id: rmc-d02
deliverable_title: CDI Query Effectiveness Report
scenario_summary: Orthopedic CDI query review focused on postoperative acute blood loss anemia and documentation specificity
complexity: moderate
mcp_servers_relevant:
  - current_regulatory_policy
  - coding_edit_policy
regulatory_as_of: 2026-04-01
source_basis:
  - CMS ICD-10-CM Official Guidelines for Coding and Reporting FY 2026
  - CMS MS-DRG Definitions Manual v43.0
  - AHA Coding Clinic guidance on anemia specificity
generated_by: sonnet-4.6
reviewed_by: maintainer
review_status: reviewed
review_date: 2026-04-09
---

# CDI Query Effectiveness Report

**Facility**: Brookline Orthopedic Hospital
**Reporting Period**: January 2026 - March 2026

## Query Volume & Response
| Metric | This Period | Prior Period | Target |
|--------|-------------|--------------|--------|
| Total queries issued | 19 | 16 | 15-25 |
| Query response rate | 89.5% | 81.3% | >85% |
| Agree rate | 73.7% | 68.8% | >70% |
| Mean response time (days) | 2.1 | 3.0 | <3 days |

## Query Impact
| Metric | Result |
|--------|--------|
| DRGs changed by queries | 5 (26.3% of queried records) |
| Net CMI impact | +0.11 |
| Estimated revenue impact | $12,900 |
| CC/MCC captures from queries | 6 |
| SOI/ROM changes | 4 |

## Query Type Distribution
| Query Type | Volume | Agree Rate | Avg $ Impact |
|------------|--------|------------|-------------|
| Specificity (e.g., acute blood loss anemia) | 8 | 87.5% | $1,420 |
| Clinical significance (e.g., add CC/MCC) | 5 | 60.0% | $1,090 |
| Present on Admission | 1 | 100.0% | Not applicable |
| Principal diagnosis clarification | 3 | 66.7% | $1,760 |
| Procedure clarification | 2 | 50.0% | $840 |

## Top Queried Conditions
| Condition | Queries | Agree Rate | HCC/DRG Impact |
|-----------|---------|------------|----------------|
| Acute blood loss anemia | 7 | 85.7% | CC capture |
| Postoperative anemia | 4 | 75.0% | DRG specificity |
| Iron deficiency anemia | 3 | 66.7% | Clinical significance |
| Hemoglobin drop after surgery | 3 | 66.7% | Query trigger |
| Orthopedic blood loss | 2 | 50.0% | Documentation clarity |

## Narrative Summary
The query program worked best when the note contained a clear hemoglobin trend and a documented management response such as transfusion, iron replacement, or serial monitoring. Query agreement improved when the question asked the surgeon to clarify the diagnosis already implied by the chart instead of asking for a new label. The strongest DRG impact came from records where acute blood loss anemia was confirmed after joint replacement and then coded as a significant secondary diagnosis under CMS MS-DRG v43.0.

## Education Plan
| Topic | Target Audience | Format | Due Date |
|-------|----------------|--------|----------|
| Anemia specificity language | Surgeons and CDI | Short case review | 2026-04-15 |
| Hemoglobin trend documentation | Ortho nursing and CDI | Joint huddle | 2026-04-17 |
| Query wording for postoperative anemia | CDI specialists | Query template refresh | 2026-04-21 |

## Regulatory Notes
- The review used ICD-10-CM FY 2026 and CMS MS-DRG v43.0 to test whether postoperative anemia was documented with enough specificity to affect severity assignment.
- AHA Coding Clinic guidance supported asking for clarification when the record showed treatment but not the final diagnosis wording.
- The report focused on provider confirmation, not coder inference, which kept the queries compliant and actionable.
