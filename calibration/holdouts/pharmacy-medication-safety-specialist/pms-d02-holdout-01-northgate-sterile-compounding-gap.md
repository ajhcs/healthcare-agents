---
holdout_id: pms-d02-holdout-01-northgate-sterile-compounding-gap
agent_slug: pharmacy-medication-safety-specialist
agents_relevant:
- pharmacy-medication-safety-specialist
deliverable_id: pms-d02
deliverable_title: USP 797/800 Compliance Gap Analysis
seed_ref: pharmacy-medication-safety-specialist/pms-d02-seed-01-northgate-sterile-compounding-gap.yaml
scenario_summary: A cancer center pharmacy opened a second sterile suite before
  current competency, certification, and hazardous-drug controls were complete.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 'USP Compounding Standards: https://www.usp.org/compounding'
- 'NIOSH List of Hazardous Drugs: https://www.cdc.gov/niosh/topics/hazdrug/'
- 'AHRQ PSO Common Formats: https://www.pso.ahrq.gov/common'
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when USP 797/800 requirements or hazardous drug handling
  standards materially change
expectations:
- The report should identify specific gaps under both USP 797 and USP 800 with evidence
  and severity ranking.
- The report should include engineering-control, personnel, environmental-monitoring,
  and documentation findings.
- The action plan should distinguish critical findings that require immediate containment
  from lower-severity corrective work.
---

# USP 797/800 Compliance Gap Analysis

**Facility**: Northgate Cancer Center Pharmacy  
**Assessment Date**: March 12, 2026  
**Assessor**: Dana Wong, PharmD  
**Compounding Category**: Both

## USP 797 Assessment
### Facility & Engineering Controls
- The ISO Class 5 PEC passed certification, but the buffer area certification was 11 days late.
- Pressure differential logs were complete during weekdays but missing for four weekend shifts.
- The ante-area refrigerator was used to store PPE, which interfered with clean workflow.

### Personnel
- Two technicians had expired media-fill evidence.
- One per diem pharmacist had no documented gloving competency.
- Annual reassessment was current for permanent staff only.

### Environmental Monitoring
- Surface sampling was current, but the last two action-level excursions had no CAPA closure date.
- Viable air sampling was performed, but the trend review was not signed by the compounding supervisor.

### Documentation
- Master formulation records were present for all batch CSPs.
- Compounding records were complete, but one batch had a BUD that exceeded the formula record guidance.

## USP 800 Assessment
### Hazardous Drug List
- The HD list had not been updated to reflect the most recent NIOSH table.
- One oral antineoplastic product was missing from the handling list.

### Engineering Controls
- The C-SEC certificate was current, but negative-pressure alarms were not tested after a maintenance shutdown.
- HD unpacking occurred in the receiving corridor instead of the designated handling area.

### PPE & Safety
- Chemotherapy gloves were stocked, but a gap was identified in spill-kit training for weekend staff.
- Medical surveillance records were present, but two staff members were overdue for annual review.

## Findings Summary
| Finding | USP Chapter | Severity | Corrective Action | Timeline |
|---------|------------|----------|-------------------|----------|
| Weekend pressure logs missing | 797 | Major | Add weekend checkpoint and daily signoff | 14 days |
| Expired technician competency | 797 | Critical | Suspend compounding assignment until validated | Immediate |
| Outdated HD list | 800 | Major | Reconcile list against current NIOSH table | 7 days |
| Negative-pressure alarm not tested | 800 | Critical | Test and document before next HD batch | Immediate |

## Overall Compliance Score: 69/100

