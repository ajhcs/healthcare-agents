---
holdout_id: rca-d01-holdout-01-infusion-price-transparency-cycle
agent_slug: revenue-chargemaster-analyst
agents_relevant:
- revenue-chargemaster-analyst
deliverable_id: rca-d01
deliverable_title: CDM Annual Maintenance Report
seed_ref: revenue-chargemaster-analyst/rca-d01-seed-01-infusion-price-transparency-cycle.yaml
scenario_summary: A hospital infusion service needs a second annual maintenance report
  emphasizing OPPS alignment and price transparency refreshes.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- CMS OPPS final rule and addenda
- CMS Hospital Price Transparency requirements (45 CFR Part 180)
- NCCI Policy Manual
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Use the exact CDM Annual Maintenance Report structure from the prompt template with
  filled synthetic values.
- Make the annual code and status updates explicit.
- Include a price transparency status table that matches the CDM state.
---
# CDM Annual Maintenance Report

**Organization**: Willow Bend Critical Access Hospital
**CDM Effective Date**: January 1, 2026
**Total Active CDM Lines**: 4,210
**Prepared By**: Victor Alvarez, CCS

## CPT/HCPCS Code Update Summary
| Change Type | Count | Revenue Impact | Action Required |
|---|---|---|---|
| New CPT codes (added) | 18 | $41,000 est. | New CDM lines created |
| Deleted CPT codes | 5 | ($9,000) est. | CDM lines inactivated |
| Revised CPT codes (descriptor change) | 21 | Descriptor and mapping updated | Descriptions and mappings updated |
| New HCPCS Level II codes | 11 | $38,000 est. | New CDM lines created |
| Deleted HCPCS codes | 4 | ($6,000) est. | CDM lines inactivated |
| Total changes | 59 | $64,000 est. | Annual update package finalized |

## Revenue Code Audit Results
| Finding | Count | Impact | Corrective Action |
|---|---|---|---|
| Incorrect revenue code for HCPCS | 6 | Claim denials | Corrected to the current revenue code |
| Missing revenue code | 4 | Unbillable charges | Revenue code assigned |
| Deprecated revenue code | 3 | Future denials | Updated to current code set |
| Revenue code / HCPCS mismatch | 5 | APC misassignment | Remapped and revalidated |

## OPPS Status Indicator Alignment
| Finding | Count | Impact | Action |
|---|---|---|---|
| SI=C (IP only) on OP CDM line | 2 | OP claim denials | Removed from the outpatient CDM |
| SI=N (packaged) with separate charge expected | 8 | Overstated revenue | Charge expectation corrected |
| New comprehensive APC assignments | 3 | Packaging changes | Updated billing rules |

## Charge Analysis
| Metric | Current | Prior Year | Change |
|---|---|---|---|
| Average markup ratio (charge/cost) | 3.1x | 3.0x | +0.1x |
| Median CCR (all departments) | 0.41 | 0.40 | +0.01 |
| CCR range (min-max) | 0.22-0.74 | 0.23-0.73 | stable |
| Departments with CCR >20% above median | 2 | 2 | unchanged |
| Departments with CCR >20% below median | 1 | 2 | -1 |
| Charge compression items (charge < cost) | 2 | 3 | -1 |

## Price Transparency Compliance Status
| Requirement | Status | Last Updated | Next Review |
|---|---|---|---|
| Machine-readable file published | 🟢 | 2026-04-01 | 2026-07-01 |
| MRF includes all payer-specific rates | 🟢 | 2026-04-01 | 2026-07-01 |
| MRF in CMS-required format (.json/.csv) | 🟢 | 2026-04-01 | 2026-07-01 |
| MRF accessible without barriers | 🟢 | 2026-04-01 | 2026-07-01 |
| Shoppable services (300) published | 🟢 | 2026-04-01 | 2026-07-01 |
| Shoppable services include ancillaries | 🟡 | 2026-04-01 | 2026-07-01 |
| Consumer-friendly display searchable | 🟢 | 2026-04-01 | 2026-07-01 |

## Recommendations
- Update the infusion-related CDM lines first because they affect both reimbursement and public price files.
- Correct the remaining ancillary-service shoppable display gap before the next quarterly transparency review.
- Keep the code-to-revenue crosswalk under monthly review until the next OPPS cycle stabilizes.
