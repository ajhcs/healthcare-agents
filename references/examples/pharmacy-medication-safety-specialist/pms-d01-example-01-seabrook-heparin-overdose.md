---
exemplar_id: pms-d01-example-01-seabrook-heparin-overdose
agent_slug: pharmacy-medication-safety-specialist
agents_relevant:
- pharmacy-medication-safety-specialist
deliverable_id: pms-d01
deliverable_title: Medication Error Root Cause Analysis Report
scenario_summary: A telemetry patient received an excessive heparin infusion after an
  order-entry unit mismatch and a barcode workaround in the emergency department.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 'ISMP High-Alert Medications: https://www.ismp.org/recommendations/high-alert-medications-acute-list'
- 'The Joint Commission NPSG.03.05.01: https://www.jointcommission.org/standards/national-patient-safety-goals/'
- 'FDA MedWatch: https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program'
- 'PSO Privacy Protection Center: https://www.pso.ahrq.gov/'
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Medication Error Root Cause Analysis

**Event Date**: February 18, 2026  
**Report Date**: February 24, 2026  
**NCC MERP Category**: E  
**Medication(s) Involved**: Heparin infusion, 25,000 units in 500 mL  
**Patient Outcome**: Temporary harm; infusion held and anti-Xa monitoring intensified

## Event Description
- Seabrook Regional Medical Center admitted a 78 kg patient with NSTEMI and atrial fibrillation.
- The ED order sentence displayed both units/kg/hr and mL/hr, and the nurse selected the default volume rate from the order composer.
- A barcode read failure in the ED delayed administration, and the medication was started after a manual workaround without an independent double-check.
- Pharmacy detected the discrepancy after the first anti-Xa level returned above target; no bleeding occurred.

## Contributing Factors
| Factor Category | Finding | Root Cause? |
|----------------|---------|-------------|
| Communication | Hand-off note did not state the intended weight-based infusion rate. | N |
| CPOE/Technology | Order composer allowed volume-based and weight-based fields to coexist. | Y |
| Labeling/Packaging | The bag label emphasized concentration but not the ordered dose. | N |
| Staffing/Workload | ED nurse was covering a second bay during scanner downtime. | N |
| Training/Competency | Barcode downtime workflow had not been drilled on the unit. | Y |
| Environment/Distraction | High boarding volume and a trauma arrival increased interruption risk. | N |
| Policy/Procedure | The downtime verification policy did not require a second verifier. | Y |
| Patient factors | Weight-based dosing increased the risk of a unit mismatch. | N |

## Root Cause(s) Identified
1. The heparin order sentence allowed a dose selection error by combining rate formats in one composer.
2. The ED downtime process did not force a second-person verification before starting a high-alert infusion.

## Corrective Actions
| Action | Owner | Deadline | Status | Effectiveness Measure |
|--------|-------|----------|--------|-----------------------|
| Separate heparin order sentences into one weight-based default and one pharmacy-controlled maintenance option | Pharmacy informatics lead | 2026-03-15 | Planned | 100% of adult heparin starts use the standardized sentence |
| Add hard maximum and route-specific limits to the smart pump library | Medication safety pharmacist | 2026-03-22 | Planned | Zero bypass starts on heparin high-alert infusions |
| Require independent ED downtime verification for any high-alert drip start | ED nurse manager | 2026-03-01 | Implemented | 95% compliance on monthly audit |
| Review hard-stop and override data at 30, 60, and 90 days | Medication safety committee | 2026-05-18 | Planned | No repeat overdose event |

## System Barriers Analysis
| Barrier | Present? | Functioned? | Improvement Needed |
|---------|----------|-------------|-------------------|
| CPOE dose check | Y | N | Split rate and dose fields; force one safe pathway |
| Pharmacist verification | Y | Y | Earlier verification for ED starts |
| BCMA scanning | Y | N | Downtime drill and scanner fallback supply |
| Smart pump library | Y | N | Hard limits for high-alert heparin starts |
| Independent double check | N | N | Make mandatory for all new heparin infusions |
| Allergy checking | Y | Y | No change needed |

