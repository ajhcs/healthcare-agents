---
holdout_id: pms-d01-holdout-01-seabrook-heparin-overdose
agent_slug: pharmacy-medication-safety-specialist
agents_relevant:
- pharmacy-medication-safety-specialist
deliverable_id: pms-d01
deliverable_title: Medication Error Root Cause Analysis Report
seed_ref: pharmacy-medication-safety-specialist/pms-d01-seed-01-seabrook-heparin-overdose.yaml
scenario_summary: A cardiology admission received an excessive heparin infusion
  after a rate selection error and a delayed pharmacy verification.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 'ISMP High-Alert Medications: https://www.ismp.org/recommendations/high-alert-medications-acute-list'
- 'The Joint Commission NPSG.03.05.01: https://www.jointcommission.org/standards/national-patient-safety-goals/'
- 'FDA MedWatch: https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program'
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when medication safety regulations, pump library design, or
  high-alert workflow standards materially change
expectations:
- The report should include a factual event narrative, timeline, contributing factors,
  root causes, corrective actions, and a system barriers analysis.
- The analysis should identify at least one CPOE or pump-library root cause and at least
  one workflow or downtime-process root cause.
- Corrective actions should be system-level and paired with measurable follow-up metrics.
---

# Medication Error Root Cause Analysis

**Event Date**: February 11, 2026  
**Report Date**: February 20, 2026  
**NCC MERP Category**: E  
**Medication(s) Involved**: Heparin infusion, 25,000 units in 500 mL  
**Patient Outcome**: Temporary harm; anti-Xa levels required repeat monitoring

## Event Description
- Seabrook Medical Center admitted a 64-year-old patient with unstable angina.
- The heparin order sentence defaulted to mL/hr after a pharmacist modified the bag concentration.
- The administering nurse used a verbal read-back instead of waiting for the electronic verification queue.
- Pharmacy identified the mismatch after the first anti-Xa level returned supratherapeutic.

## Contributing Factors
| Factor Category | Finding | Root Cause? |
|----------------|---------|-------------|
| Communication | Handoff did not include the intended rate in units/kg/hr. | N |
| CPOE/Technology | The order composer exposed both dose and volume fields. | Y |
| Labeling/Packaging | The printed bag label did not highlight the weight-based dose. | N |
| Staffing/Workload | Verification backlog delayed pharmacist review by 18 minutes. | N |
| Training/Competency | The unit had not been re-trained on heparin transition workflow. | Y |
| Environment/Distraction | A second admission created interruption during infusion start. | N |
| Policy/Procedure | High-alert infusion start allowed before independent double-check. | Y |
| Patient factors | Weight-based dosing created higher sensitivity to a unit mismatch. | N |

## Root Cause(s) Identified
1. The order composer permitted an unsafe dose-format selection during a high-alert infusion start.
2. The workflow allowed infusion initiation before the independent double-check was complete.

## Corrective Actions
| Action | Owner | Deadline | Status | Effectiveness Measure |
|--------|-------|----------|--------|-----------------------|
| Remove volume-based defaults from heparin adult order sentences | Pharmacy informatics | 2026-02-28 | Planned | No mL/hr starts on heparin audit |
| Require two-person verification before heparin activation in the ED | Nursing leadership | 2026-02-18 | Implemented | 95% compliance within 30 days |
| Reduce verification backlog by prioritizing high-alert drips | Pharmacy operations | 2026-03-05 | Planned | Median verification time under 10 minutes |
| Review all supratherapeutic anti-Xa events monthly | Medication safety committee | 2026-05-01 | Planned | Zero repeat event |

## System Barriers Analysis
| Barrier | Present? | Functioned? | Improvement Needed |
|---------|----------|-------------|-------------------|
| CPOE dose check | Y | N | Unique dose pathway only |
| Pharmacist verification | Y | N | Priority queue for heparin starts |
| BCMA scanning | Y | N | No bypass for high-alert drips |
| Smart pump library | Y | N | Hard max and standardized concentration |
| Independent double check | N | N | Make mandatory and auditable |
| Allergy checking | Y | Y | No change needed |

