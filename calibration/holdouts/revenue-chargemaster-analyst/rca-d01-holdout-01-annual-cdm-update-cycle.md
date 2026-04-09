---
holdout_id: rca-d01-holdout-01-annual-cdm-update-cycle
agent_slug: revenue-chargemaster-analyst
agents_relevant:
- revenue-chargemaster-analyst
deliverable_id: rca-d01
deliverable_title: CDM Annual Maintenance Report
seed_ref: revenue-chargemaster-analyst/rca-d01-seed-01-annual-cdm-update-cycle.yaml
scenario_summary: The annual chargemaster refresh needs updated CPT and HCPCS mappings,
  OPPS status checks, and price transparency alignment.
complexity: high
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

**Organization**: Stonegate Regional Medical Center
**CDM Effective Date**: January 1, 2026
**Total Active CDM Lines**: 8,420
**Prepared By**: Nadia Ford, CCS-P

## CPT/HCPCS Code Update Summary
| Change Type | Count | Revenue Impact | Action Required |
|---|---|---|---|
| New CPT codes (added) | 46 | $128,000 est. | New CDM lines created |
| Deleted CPT codes | 12 | ($24,000) est. | CDM lines inactivated |
| Revised CPT codes (descriptor change) | 38 | Descriptor and mapping updated | Descriptions and mappings updated |
| New HCPCS Level II codes | 24 | $91,000 est. | New CDM lines created |
| Deleted HCPCS codes | 9 | ($17,000) est. | CDM lines inactivated |
| Total changes | 129 | $178,000 est. | Annual update package finalized |

## Revenue Code Audit Results
| Finding | Count | Impact | Corrective Action |
|---|---|---|---|
| Incorrect revenue code for HCPCS | 14 | Claim denials | Corrected to the current revenue code |
| Missing revenue code | 9 | Unbillable charges | Revenue code assigned |
| Deprecated revenue code | 6 | Future denials | Updated to current code set |
| Revenue code / HCPCS mismatch | 11 | APC misassignment | Remapped and revalidated |

## OPPS Status Indicator Alignment
| Finding | Count | Impact | Action |
|---|---|---|---|
| SI=C (IP only) on OP CDM line | 7 | OP claim denials | Removed from the outpatient CDM |
| SI=N (packaged) with separate charge expected | 10 | Overstated revenue | Charge expectation corrected |
| New comprehensive APC assignments | 5 | Packaging changes | Updated billing rules |

## Charge Analysis
| Metric | Current | Prior Year | Change |
|---|---|---|---|
| Average markup ratio (charge/cost) | 3.4x | 3.3x | +0.1x |
| Median CCR (all departments) | 0.38 | 0.37 | +0.01 |
| CCR range (min-max) | 0.18-0.81 | 0.19-0.79 | wider by 0.02 |
| Departments with CCR >20% above median | 3 | 2 | +1 |
| Departments with CCR >20% below median | 2 | 3 | -1 |
| Charge compression items (charge < cost) | 4 | 6 | -2 |

## Price Transparency Compliance Status
| Requirement | Status | Last Updated | Next Review |
|---|---|---|---|
| Machine-readable file published | 🟢 | 2026-04-01 | 2026-07-01 |
| MRF includes all payer-specific rates | 🟢 | 2026-04-01 | 2026-07-01 |
| MRF in CMS-required format (.json/.csv) | 🟢 | 2026-04-01 | 2026-07-01 |
| MRF accessible without barriers | 🟢 | 2026-04-01 | 2026-07-01 |
| Shoppable services (300) published | 🟡 | 2026-04-01 | 2026-07-01 |
| Shoppable services include ancillaries | 🟡 | 2026-04-01 | 2026-07-01 |
| Consumer-friendly display searchable | 🟢 | 2026-04-01 | 2026-07-01 |

## Recommendations
- Activate the annual CDM on January 1 with the updated code set and price file.
- Fix the revenue-code mismatches before the first quarterly claims edit report.
- Complete a targeted audit on the four charge-compression items before the next rate review.
