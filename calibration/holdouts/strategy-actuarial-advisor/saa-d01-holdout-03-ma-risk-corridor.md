---
holdout_id: saa-d01-example-03-ma-risk-corridor
agent_slug: strategy-actuarial-advisor
agents_relevant:
- strategy-actuarial-advisor
deliverable_id: saa-d01
deliverable_title: Capitation Rate Analysis
seed_ref: calibration/seeds/strategy-actuarial-advisor/saa-d01-seed-03-ma-risk-corridor.yaml
scenario_summary: Medicare Advantage capitation review with risk-score drift, pharmacy
  trend pressure, and a corridor that is too thin for current volatility.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR Part 422
- CMS Medicare Advantage rate announcement
- CMS risk adjustment methodology
- CMS encounter data guidance
generated_by: sonnet-4.6
reviewed_by: human
review_status: reviewed
review_date: '2026-04-09'
frozen: true
superseded_by: null
retirement_trigger: Retire when Medicare Advantage rate-setting or CMS risk adjustment
  rules materially change the capitation structure.
expectations:
- Make the gap to required PMPM immediately visible.
- Show how risk and pharmacy drift change the answer.
- Give a clear accept, reject, or revise recommendation.
---

# Capitation Rate Analysis

The proposed Medicare Advantage capitation rate is still below the indicated level after risk drift, pharmacy trend, and corridor exposure are reflected. The plan should not accept the file without a revised trend assumption and a stronger stop-loss structure.

## Rate Development Summary
| Component | PMPM | Basis | Note |
|---|---|---|---|
| Base medical trend | $404.10 | 5.8 percent | Updated utilization trend |
| Risk adjustment | $26.70 | 1.12 factor | Members are sicker than the filed average |
| Pharmacy trend | $18.40 | 7.1 percent | Drug inflation remains elevated |
| Required PMPM | $449.20 | Fully loaded | Actuarially indicated |

## Proposed vs. Required Rate
| Line Item | Required | Proposed | Gap |
|---|---|---|---|
| Required PMPM | $449.20 | $437.60 | $11.60 gap |
| Margin target | $10.20 | $8.60 | $1.60 gap |
| Total gap | $459.40 | $446.20 | $13.20 gap |

## Sensitivity Analysis
| Scenario | PMPM | Change vs Base | Implication |
|---|---|---|---|
| Utilization up 1 percent | $452.10 | +$2.90 | Gap widens |
| Risk score down 0.03 | $446.80 | -$2.40 | Still below the required level |
| Pharmacy trend up 0.5 point | $454.30 | +$5.10 | Drug pressure is material |

## Risk Corridor / Stop-Loss Analysis
| Provision | Current Term | Exposure | Assessment |
|---|---|---|---|
| Downside corridor | 1.5 percent | $5.2 million | Too thin for the volatility |
| Stop-loss trigger | $125,000 per member | $2.1 million | Catastrophic support is needed |
| Shared savings | 40 percent | $1.0 million | Only attractive if rate is corrected |

## Recommendation
- Do not accept the current filing; require a revised rate with a higher trend factor and better pharmacy support.
- Verify the current provider roster before finalizing the attribution layer used in the risk model.
- Keep the corridor and stop-loss negotiation tied to the actual volatility pattern instead of a generic market assumption.

The rate view is anchored in 42 CFR Part 438 or 42 CFR Part 422, the CMS rate-setting cycle, and the underlying encounter-trend pattern. The proposed rate should not be accepted until trend, risk score, and high-cost claim exposure are all reconciled to the current dataset.
