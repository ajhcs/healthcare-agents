---
exemplar_id: qpi-d01-example-01-discharge-flow-a3
agent_slug: quality-process-improvement-analyst
agents_relevant:
- quality-process-improvement-analyst
deliverable_id: qpi-d01
deliverable_title: A3 Problem-Solving Report
scenario_summary: Heart failure discharges are generating readmissions because medication
  reconciliation and follow-up scheduling finish too late in the discharge process.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
- provider_directory
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 482.21
- AHRQ Common Formats
- CMS quality reporting resources
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---
# A3 Problem-Solving Report

**Title**: Readmission Reduction for Heart Failure Discharges
**Owner**: Elena Marquez, RN, CPHQ
**Date**: 2026-04-09 | **Version**: 1.0
**Coach**: Priya Shah, MD

## Background
Thirty-day CHF readmissions increased after weekend discharge patterns shifted and the discharge checklist was split across nursing, case management, and pharmacy.

## Current Condition
The current discharge flow depends on separate completion of medication reconciliation, follow-up scheduling, and patient teaching. Weekend coverage gaps and late pharmacy sign-off leave some patients without a closed loop before leaving the hospital.

**Key metrics**:
| Metric | Current | Target | Gap |
|---|---|---|---|
| 30-day readmission rate | 18.4% | 12.0% | 6.4 pts |
| Medication reconciliation completed within 48 hours | 64% | 95% | 31 pts |
| PCP follow-up scheduled within 7 days | 52% | 85% | 33 pts |
| Discharge summary signed before patient departure | 58% | 90% | 32 pts |

## Root Cause Analysis
A structured 5 Whys review found that the problem is not patient noncompliance alone; it is a workflow defect across discharge ownership, coverage, and scheduling.
- Why 1: Pharmacist review stops at 3 p.m., so late discharges do not receive the final medication review.
- Why 2: Weekend case management coverage is too thin to book follow-up appointments before discharge.
- Why 3: Discharge summaries and medication reconciliation are completed in different systems with no hard stop.
- Why 4: Transportation barriers are identified late, after the care team has already tried to close the discharge.
- Why 5 (root cause): Primary care panels are full, so staff default to follow up with PCP without a booked slot.

## Countermeasures
| # | Countermeasure | Root Cause Addressed | Owner | Due Date | Status |
|---|---|---|---|---|---|
| 1 | Auto-page a pharmacist for every CHF discharge after 2 p.m. | Late medication review | Pharmacy lead | 2026-05-01 | Planned |
| 2 | Use one discharge checklist that includes med rec, transport, and follow-up booking. | Split ownership of the discharge process | Unit nurse manager | 2026-05-08 | Planned |
| 3 | Add weekend transitional care coverage with a standing appointment block. | No weekend scheduling capacity | Care management director | 2026-05-15 | Planned |
| 4 | Offer meds-to-beds and low-barrier transportation options for high-risk patients. | Late identification of access barriers | Social work manager | 2026-05-15 | Planned |

## Implementation Plan
| Milestone | Date | Owner | Resources Needed |
|---|---|---|---|
| Baseline process map and defect review | 2026-04-15 | Quality analyst | EHR extracts and discharge logs |
| Pilot on 2 medicine units | 2026-05-01 | Unit managers | Pharmacy and care management coverage |
| Full rollout after pilot stabilizes | 2026-06-01 | Patient flow director | Updated discharge checklist |
| 90-day sustainment audit | 2026-07-15 | Quality improvement lead | Run chart and readmission report |

## Follow-Up / Results
| Metric | Baseline | 30-Day | 60-Day | 90-Day | Target |
|---|---|---|---|---|---|
| 30-day readmission rate | 18.4% | 16.9% | 14.2% | 12.8% | 12.0% |
| Medication reconciliation within 48 hours | 64% | 79% | 88% | 94% | 95% |
| PCP follow-up within 7 days | 52% | 66% | 74% | 83% | 85% |
| Discharge summary signed before departure | 58% | 74% | 86% | 91% | 90% |

## Notes
- Organization: Riverbend Community Hospital
- Improvement theme: close the discharge loop before the patient leaves
- Data source cadence: weekly unit review and monthly leadership review
- Metrics are synthetic but internally consistent with the problem statement
