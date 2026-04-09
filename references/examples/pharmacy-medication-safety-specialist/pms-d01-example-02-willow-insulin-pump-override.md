---
exemplar_id: pms-d01-example-02-willow-insulin-pump-override
agent_slug: pharmacy-medication-safety-specialist
agents_relevant:
- pharmacy-medication-safety-specialist
deliverable_id: pms-d01
deliverable_title: Medication Error Root Cause Analysis Report
scenario_summary: A diabetic patient developed hypoglycemia after an insulin infusion
  was programmed from a soft-limit override and the bedside scan was not performed.
complexity: moderate
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 'ISMP High-Alert Medications: https://www.ismp.org/recommendations/high-alert-medications-acute-list'
- 'The Joint Commission NPSG.03.06.01: https://www.jointcommission.org/standards/national-patient-safety-goals/'
- 'Poon et al., NEJM 2010 barcode medication administration study: https://www.nejm.org/doi/full/10.1056/NEJMsa0907115'
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Medication Error Root Cause Analysis

**Event Date**: January 29, 2026  
**Report Date**: February 3, 2026  
**NCC MERP Category**: F  
**Medication(s) Involved**: Insulin regular infusion, 100 units in 100 mL  
**Patient Outcome**: Temporary harm requiring dextrose rescue and extended monitoring

## Event Description
- Willow Creek Medical Center admitted a patient with DKA and transitioned from an IV insulin protocol to a lower-dose maintenance infusion.
- The nurse accepted a soft-limit override because the pump display still reflected the ICU template after the patient moved to step-down.
- The bedside barcode scan was deferred during an urgent transport, and the insulin bag was started based on verbal confirmation alone.
- The patient became hypoglycemic within 40 minutes, prompting dextrose administration and protocol revision.

## Contributing Factors
| Factor Category | Finding | Root Cause? |
|----------------|---------|-------------|
| Communication | The transfer handoff did not specify the active insulin template. | Y |
| CPOE/Technology | The step-down order set inherited the ICU concentration by default. | Y |
| Labeling/Packaging | The insulin bag label looked identical to the ICU preparation. | N |
| Staffing/Workload | The receiving nurse was simultaneously managing a transport and a new admission. | N |
| Training/Competency | The unit had not rehearsed insulin transition downtime. | Y |
| Environment/Distraction | The move occurred during shift change with two competing alarms. | N |
| Policy/Procedure | The protocol allowed soft-limit override without pharmacist recheck. | Y |
| Patient factors | The patient had rapidly changing glucose needs after DKA treatment. | N |

## Root Cause(s) Identified
1. The insulin transition order set defaulted to the wrong concentration when the patient left ICU.
2. The unit allowed a soft-limit override and infusion start without a barcode confirmation or pharmacist recheck.

## Corrective Actions
| Action | Owner | Deadline | Status | Effectiveness Measure |
|--------|-------|----------|--------|-----------------------|
| Separate ICU and step-down insulin templates with unique concentration defaults | Clinical informatics pharmacist | 2026-02-20 | Implemented | No concentration carryover in monthly audit |
| Require barcode verification before any insulin infusion start outside ICU | Nursing director | 2026-02-15 | Implemented | 98% scan compliance on insulin starts |
| Move insulin soft-limit overrides into pharmacist review queue | Pharmacy operations manager | 2026-03-01 | Planned | Zero unreviewed insulin override starts |
| Review hypoglycemia events weekly for three months | Diabetes safety team | 2026-05-01 | Planned | No repeat event on step-down transfer |

## System Barriers Analysis
| Barrier | Present? | Functioned? | Improvement Needed |
|---------|----------|-------------|-------------------|
| CPOE dose check | Y | N | Unique transfer order set |
| Pharmacist verification | Y | N | Mandatory recheck before start |
| BCMA scanning | Y | N | No start without scan completion |
| Smart pump library | Y | N | Distinct ICU and step-down profiles |
| Independent double check | N | N | Add for all insulin infusion transitions |
| Allergy checking | Y | Y | No change needed |

