---
holdout_id: pms-d01-holdout-02-willow-insulin-pump-override
agent_slug: pharmacy-medication-safety-specialist
agents_relevant:
- pharmacy-medication-safety-specialist
deliverable_id: pms-d01
deliverable_title: Medication Error Root Cause Analysis Report
seed_ref: pharmacy-medication-safety-specialist/pms-d01-seed-02-willow-insulin-pump-override.yaml
scenario_summary: A step-down patient became hypoglycemic after an insulin infusion
  was started from the wrong pump profile during a transfer from ICU.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- 'ISMP High-Alert Medications: https://www.ismp.org/recommendations/high-alert-medications-acute-list'
- 'The Joint Commission NPSG.03.06.01: https://www.jointcommission.org/standards/national-patient-safety-goals/'
- 'Poon et al., NEJM 2010 barcode medication administration study: https://www.nejm.org/doi/full/10.1056/NEJMsa0907115'
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when medication administration, transfer, or pump-library
  standards materially change
expectations:
- The report should reconstruct the transfer sequence and identify the failure points
  in the order set, pump selection, and bedside verification workflow.
- The analysis should separate root causes from contributing factors and show evidence
  for each.
- Corrective actions should include a hardening step for the transfer workflow and at
  least one auditable follow-up metric.
---

# Medication Error Root Cause Analysis

**Event Date**: January 22, 2026  
**Report Date**: January 27, 2026  
**NCC MERP Category**: F  
**Medication(s) Involved**: Insulin regular infusion, 100 units in 100 mL  
**Patient Outcome**: Temporary harm requiring rescue dextrose and an extended observation period

## Event Description
- Willow Creek Medical Center transferred a patient from ICU to step-down while an insulin infusion was still active.
- The step-down pump profile defaulted to a concentration that differed from the ICU profile.
- The nurse acknowledged the transfer but deferred barcode scanning until after the patient was moved and reconnected.
- Hypoglycemia developed within an hour, and the pump was stopped while dextrose and glucose monitoring were escalated.

## Contributing Factors
| Factor Category | Finding | Root Cause? |
|----------------|---------|-------------|
| Communication | Transfer handoff did not identify the active insulin concentration. | Y |
| CPOE/Technology | The step-down profile inherited the ICU pump setting. | Y |
| Labeling/Packaging | Both insulin bags used similar manufacturer labeling. | N |
| Staffing/Workload | The receiving nurse was balancing transport, admission tasks, and a bed request call. | N |
| Training/Competency | The unit had not practiced insulin transfer drills. | Y |
| Environment/Distraction | Multiple alarms fired during the transfer window. | N |
| Policy/Procedure | The transfer protocol allowed pump start before scan completion. | Y |
| Patient factors | Rapidly changing glucose needs increased vulnerability to a concentration mismatch. | N |

## Root Cause(s) Identified
1. The ICU-to-step-down transfer workflow did not preserve the insulin concentration safely across pump profiles.
2. The bedside process allowed the insulin infusion to resume before scan and verification were complete.

## Corrective Actions
| Action | Owner | Deadline | Status | Effectiveness Measure |
|--------|-------|----------|--------|-----------------------|
| Create distinct ICU and step-down insulin profiles with unique default concentrations | Clinical informatics pharmacist | 2026-02-10 | Implemented | Zero profile carryover events |
| Require scan completion before reconnecting any insulin infusion after transfer | Nursing director | 2026-02-08 | Implemented | 98% scan compliance on transfer |
| Add a transfer checklist item for current insulin rate and concentration | Unit charge nurses | 2026-02-05 | Implemented | 95% checklist completion |
| Review hypoglycemia events at 30, 60, and 90 days | Diabetes safety committee | 2026-05-01 | Planned | No repeat transfer-related event |

## System Barriers Analysis
| Barrier | Present? | Functioned? | Improvement Needed |
|---------|----------|-------------|-------------------|
| CPOE dose check | Y | N | Distinct transfer logic |
| Pharmacist verification | Y | Y | Faster approval for transfer orders |
| BCMA scanning | Y | N | No reconnection before scan |
| Smart pump library | Y | N | Separate profiles by level of care |
| Independent double check | N | N | Add for every insulin transfer |
| Allergy checking | Y | Y | No change needed |

