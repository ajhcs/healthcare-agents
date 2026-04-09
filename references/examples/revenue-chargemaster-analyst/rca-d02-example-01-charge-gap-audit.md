---
exemplar_id: rca-d02-example-01-charge-gap-audit
agent_slug: revenue-chargemaster-analyst
agents_relevant:
- revenue-chargemaster-analyst
deliverable_id: rca-d02
deliverable_title: Charge Capture Gap Analysis
scenario_summary: The hospital needs a revenue-integrity audit that quantifies missed
  charges in OR, radiology, ED, observation, and pharmacy.
complexity: high
mcp_servers_relevant:
- coverage_determination
- coding_edit_policy
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- CMS OPPS and revenue-code guidance
- NCCI Policy Manual
- CMS Hospital Price Transparency requirements (45 CFR Part 180)
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---
# Charge Capture Gap Analysis

**Organization**: Northlake Medical Center
**Analysis Period**: March 2026
**Prepared By**: Lina Patel, CCS
**Departments Reviewed**: OR, Radiology, Pharmacy, Emergency Department, Observation, Laboratory

## Executive Summary
- Total charges reviewed: 24,860
- Missed charges identified: 312 (1.26%)
- Estimated annual revenue at risk: $415,000

## Gap Analysis by Department
| Department | Expected Charges | Actual Charges | Variance | Miss Rate | Est. Annual Revenue Impact |
|---|---|---|---|---|---|
| OR / Surgery | 7,820 | 7,693 | 127 | 1.62% | $168,000 |
| Radiology | 4,430 | 4,397 | 33 | 0.75% | $54,000 |
| Pharmacy (high-cost drugs) | 1,240 | 1,212 | 28 | 2.26% | $62,000 |
| Emergency Department | 5,610 | 5,542 | 68 | 1.21% | $44,000 |
| Observation | 2,110 | 2,067 | 43 | 2.04% | $37,000 |
| Laboratory | 3,650 | 3,636 | 14 | 0.38% | $10,000 |
| Cardiology | 0 | 0 | 0 | 0.00% | $0 |
| Total | 24,860 | 24,547 | 312 | 1.26% | $415,000 |

## Root Cause Analysis
| Root Cause | % of Missed Charges | Departments Affected | Fix |
|---|---|---|---|
| Interface error (EHR → billing) | 32% | OR and radiology | Fix the interface mapping and re-run the export |
| Missing CDM line item | 27% | Pharmacy and observation | Add the missing charge line and backfill |
| Workflow gap (no charge trigger) | 21% | ED and observation | Add a charge checkpoint before discharge |
| Clinician did not document | 12% | OR and cardiology | Education and smart-text prompts |
| Charge code inactive or incorrect | 8% | Radiology and lab | Update the CDM and test again |

## Recommendations
| Priority | Action | Department | Owner | Timeline | Expected Recovery |
|---|---|---|---|---|---|
| 1 | Fix the OR and pharmacy gaps first | OR / Pharmacy | Revenue integrity manager | 14 days | $230,000 |
| 2 | Add a discharge charge checkpoint in observation | Observation | Observation nurse manager | 21 days | $37,000 |
| 3 | Refresh the radiology and lab code crosswalks | Radiology / Lab | CDM analyst | 30 days | $64,000 |

## Notes
- Recovery estimates assume timely filing windows remain open
- The most important operational fix is to close the source-system-to-CDM gap before the next quarterly update
