---
exemplar_id: pvbc-d02-example-01-northwind-risk-term-sheet
agent_slug: payer-value-based-care-manager
agents_relevant:
- payer-value-based-care-manager
deliverable_id: pvbc-d02
deliverable_title: Risk-Based Contract Term Sheet
scenario_summary: A commercial shared-risk arrangement with midterm quality gating
  and stop-loss protections is structured to keep downside bounded while forcing discipline
  on attribution and reporting.
complexity: moderate
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 'CMS ACO REACH Model page: https://www.cms.gov/priorities/innovation/innovation-models/aco-reach'
- "CMS ACO REACH Model PY 2026 Model Update \u2013 Quick Reference: https://www.cms.gov/priorities/innovation/aco-reach-model-performance-year-2026-model-update-quick-reference"
- 'CMS Quality ID #438: Statin Therapy for the Prevention and Treatment of Cardiovascular
  Disease: https://qpp.cms.gov/docs/QPP_quality_measure_specifications/CQM-Measures/2025_Measure_438_MIPSCQM.pdf'
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Value-Based Contract Term Sheet

**Provider Organization**: Northwind Medical Group IPA  
**Payer**: Meridian Choice Health  
**Product Line**: Commercial  
**Effective Date**: 2026-10-01  
**Term**: 3 years

## Attribution
- Methodology: Retrospective
- Primary attribution logic: Plurality of primary care visits with monthly refresh
- Lookback period: 24 months
- Minimum attributed lives: 8,000
- Estimated attributed population: 11,420

## Financial Model
- Model type: Shared risk
- Benchmark basis: Blended historical/regional, 70/30 weighting
- Risk adjustment model: HCC v28 with 3% coding-intensity cap
- Trending methodology: Regional commercial trend index
- Rebasing frequency: Annual

## Gain/Loss Sharing
| Parameter | Savings | Losses |
|-----------|---------|--------|
| Sharing percentage | 60% | 50% |
| Minimum threshold | 2.5% | 2.0% |
| Maximum sharing | 8% of benchmark | 6% of benchmark |
| Quality gate | Yes, 3% withhold | N/A |

## Risk Protections
- Individual stop-loss: $75,000 per member per year
- Aggregate stop-loss: 5.0% of total benchmark
- Risk corridor: ±3% in Year 1, ±5% in Years 2-3
- High-cost claimant exclusion: First $100,000 for transplant, neonatal ICU, and hemophilia cases
- Reinsurance: Separate annual excess-loss policy

## Quality Requirements
| Measure | Domain | Target | Penalty/Bonus |
|---------|--------|-------:|---------------|
| Controlling High Blood Pressure | Preventive care | 82% | 1.0% bonus |
| Depression Screening and Follow-Up | Behavioral health | 80% | 0.5% bonus |
| Screening for Social Drivers of Health | Equity and access | 65% | 0.5% withhold release |
| Statin Therapy for CVD | Chronic disease | 85% | 1.0% bonus |

## Reconciliation
- Reconciliation frequency: Quarterly interim and annual final
- Claims runout: 4 months
- Dispute resolution window: 45 days
- Payment timeline: 30 days after final reconciliation

## Recommended Negotiation Priorities
1. Cap aggregate downside at 5.0% and hold the first-year corridor at ±3%.
2. Lock the catastrophic carve-out for claimants above $100,000 and require payer-funded reinsurance.
3. Keep the quality gate tied to measures that can be produced directly from the EHR and claims feed without manual abstraction.
