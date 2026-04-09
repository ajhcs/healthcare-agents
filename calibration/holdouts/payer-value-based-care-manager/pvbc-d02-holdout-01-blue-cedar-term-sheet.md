---
holdout_id: pvbc-d02-holdout-01-blue-cedar-term-sheet
agent_slug: payer-value-based-care-manager
agents_relevant:
- payer-value-based-care-manager
deliverable_id: pvbc-d02
deliverable_title: Risk-Based Contract Term Sheet
seed_ref: payer-value-based-care-manager/pvbc-d02-seed-01-blue-cedar-term-sheet.yaml
scenario_summary: A straightforward Medicare Advantage shared-risk deal needs a defensible
  attribution method, a capped downside corridor, and quality measures that can be
  produced without manual abstraction.
complexity: routine
regulatory_as_of: '2026-04-09'
source_basis:
- 'CMS Quality ID #317: Preventive Care and Screening: Screening for High Blood Pressure
  and Follow-Up Documented: https://qpp.cms.gov/docs/QPP_quality_measure_specifications/CQM-Measures/2021_Measure_317_MIPSCQM.pdf'
- 'CMS Quality ID #134: Preventive Care and Screening: Screening for Depression and
  Follow-Up Plan: https://qpp.cms.gov/docs/QPP_quality_measure_specifications/CQM-Measures/2025_Measure_134_MIPSCQM.pdf'
- 'CMS Quality ID #487: Screening for Social Drivers of Health: https://qpp.cms.gov/docs/QPP_quality_measure_specifications/CQM-Measures/2025_Measure_487_MIPSCQM.pdf'
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Must include every section from the term sheet template and keep the gain/loss table
  fully populated.
- Must make downside exposure explicit, including a per-member stop-loss, an aggregate
  cap, and a risk corridor.
- Must end with three negotiation priorities that are specific, operational, and measurable.
---

# Value-Based Contract Term Sheet

**Provider Organization**: Blue Cedar Medical Group  
**Payer**: Orion Health Plan  
**Product Line**: Medicare Advantage  
**Effective Date**: 2026-07-01  
**Term**: 2 years

## Attribution
- Methodology: Prospective with quarterly reconciliation to claims reality
- Primary attribution logic: PCP assignment anchored to plurality of E&M visits, with hospice and SNF carve-outs excluded
- Lookback period: 24 months
- Minimum attributed lives: 6,500
- Estimated attributed population: 7,480

## Financial Model
- Model type: Shared savings only for the first six months, then two-sided shared risk after quality stabilization
- Benchmark basis: Historical blended with 25% regional adjustment in Year 1 and 35% in Year 2
- Risk adjustment model: HCC v28 normalized to the payer RAF file, with a 3% coding-intensity cap
- Trending methodology: MA regional trend plus pharmacy carve-out trend
- Rebasing frequency: Annual

## Gain/Loss Sharing
| Parameter | Savings | Losses |
|-----------|---------|--------|
| Sharing percentage | 65% | 40% |
| Minimum threshold | 2.5% | 2.0% |
| Maximum sharing | 6% of benchmark | 4% of benchmark |
| Quality gate | Yes, 2% withhold | N/A |

## Risk Protections
- Individual stop-loss: $90,000 per member per year
- Aggregate stop-loss: 4.0% of total benchmark
- Risk corridor: ±3%
- High-cost claimant exclusion: $125,000 for transplant, neonatal ICU, and hemophilia cases
- Reinsurance: Included through a payer-funded excess-loss layer

## Quality Requirements
| Measure | Domain | Target | Penalty/Bonus |
|---------|--------|-------:|---------------|
| Controlling High Blood Pressure | Preventive care | 82% | 1.0% bonus |
| Depression Screening and Follow-Up | Behavioral health | 80% | 0.5% bonus |
| Screening for Social Drivers of Health | Equity and access | 65% | 0.5% withhold release |
| Statin Therapy for CVD | Chronic disease | 85% | 1.0% bonus |

## Reconciliation
- Reconciliation frequency: Quarterly interim and annual final
- Claims runout: 120 days
- Dispute resolution window: 45 days
- Payment timeline: 20 days after final reconciliation

## Recommended Negotiation Priorities
1. Keep the first-year arrangement prospective enough to support staffing, but require a quarterly true-up so the roster stays current.
2. Hold the aggregate downside cap at 4.0% and preserve the high-cost claimant carve-out above $125,000.
3. Tie the quality gate to measures that the EHR can emit directly without manual chart chasing.
