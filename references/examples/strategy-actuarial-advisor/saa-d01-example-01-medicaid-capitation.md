---
exemplar_id: saa-d01-example-01-medicaid-capitation
agent_slug: strategy-actuarial-advisor
agents_relevant:
- strategy-actuarial-advisor
deliverable_id: saa-d01
deliverable_title: Capitation Rate Analysis
scenario_summary: Medicaid managed care capitation review with a proposed rate that
  trails the required trend, risk score, and high-cost claim exposure.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
- provider_directory
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR Part 438
- CMS Medicaid managed care rate certification guidance
- CMS encounter data guidance
- CMS rate certification templates
generated_by: sonnet-4.6
reviewed_by: maintainer
review_status: reviewed
review_date: '2026-04-09'
---

# Capitation Rate Analysis

The proposed capitation rate is below the actuarially required level once utilization trend, member acuity, and behavioral health mix are all reflected. The CMS and 42 CFR Part 438 frame suggests the filing needs more work before acceptance.

## Rate Development Summary
| Component | PMPM | Basis | Note |
|---|---|---|---|
| Base medical trend | $388.20 | 6.2 percent | Updated utilization trend |
| Risk adjustment | $21.40 | 1.08 factor | Higher morbidity than market average |
| Admin load | $32.70 | 8.9 percent | Operating expense and margin |
| Required PMPM | $442.30 | Fully loaded | Actuarially indicated |

## Proposed vs. Required Rate
| Line Item | Required | Proposed | Gap |
|---|---|---|---|
| Required PMPM | $442.30 | $430.10 | $12.20 gap |
| Margin target | $11.00 | $8.70 | $2.30 gap |
| Total gap | $453.30 | $438.80 | $14.50 gap |

## Sensitivity Analysis
| Scenario | PMPM | Change vs Base | Implication |
|---|---|---|---|
| Utilization up 1 percent | $445.90 | +$3.60 | Rate deficiency widens |
| Risk score down 0.02 | $440.10 | -$2.20 | Still below requirement |
| Pharmacy trend up 0.5 point | $446.40 | +$4.10 | Drug trend is a material driver |

## Risk Corridor / Stop-Loss Analysis
| Provision | Current Term | Exposure | Assessment |
|---|---|---|---|
| Downside corridor | 2.0 percent | $6.8 million | Too thin for current volatility |
| Stop-loss trigger | $150,000 per member | $2.4 million | Catastrophic exposure is manageable |
| Shared savings | 50 percent | $1.2 million | Acceptable if rate is corrected |

## Recommendation
- Reject the current proposal and require a revised filing with the full encounter-weighted trend and risk score support.
- Recheck behavioral health and pharmacy trend separately so the total rate gap is not diluted by a blended assumption.
- Confirm the provider roster and attribution logic before the final negotiating round so the model is not built on stale network data.

The rate view is anchored in 42 CFR Part 438 or 42 CFR Part 422, the CMS rate-setting cycle, and the underlying encounter-trend pattern. The proposed rate should not be accepted until trend, risk score, and high-cost claim exposure are all reconciled to the current dataset.
