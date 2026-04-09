---
holdout_id: pvbc-d02-holdout-02-east-bay-term-sheet
agent_slug: payer-value-based-care-manager
agents_relevant:
- payer-value-based-care-manager
deliverable_id: pvbc-d02
deliverable_title: Risk-Based Contract Term Sheet
seed_ref: payer-value-based-care-manager/pvbc-d02-seed-02-east-bay-term-sheet.yaml
scenario_summary: A multi-year Medicare Advantage arrangement needs full-capitation
  mechanics, a clear quality gate, and asymmetrical downside limits that do not break
  provider viability.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 'CMS Quality ID #317: Preventive Care and Screening: Screening for High Blood Pressure
  and Follow-Up Documented: https://qpp.cms.gov/docs/QPP_quality_measure_specifications/CQM-Measures/2021_Measure_317_MIPSCQM.pdf'
- 'CMS Quality ID #438: Statin Therapy for the Prevention and Treatment of Cardiovascular
  Disease: https://qpp.cms.gov/docs/QPP_quality_measure_specifications/CQM-Measures/2025_Measure_438_MIPSCQM.pdf'
- 'CMS Quality ID #112 (CBE 2372): Breast Cancer Screening: https://qpp.cms.gov/docs/QPP_quality_measure_specifications/CQM-Measures/2025_Measure_112_MIPSCQM.pdf'
- 'CMS Quality ID #113 (CBE 0034): Colorectal Cancer Screening: https://qpp.cms.gov/docs/QPP_quality_measure_specifications/CQM-Measures/2025_Measure_113_MIPSCQM.pdf'
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Must include all required term sheet sections and make the full risk structure readable
  in one pass.
- Must spell out both savings and losses, including thresholds, caps, and quality
  gating.
- Must distinguish the reconciliation rhythm for capitation true-ups and the annual
  settle-up.
---

# Value-Based Contract Term Sheet

**Provider Organization**: East Bay Clinically Integrated Network  
**Payer**: Atlas Advantage Plan  
**Product Line**: Medicare Advantage  
**Effective Date**: 2026-04-01  
**Term**: 4 years

## Attribution
- Methodology: Hybrid prospective attribution with retrospective quarterly true-up
- Primary attribution logic: PCP assignment with specialty overflow logic for cardiology and endocrinology
- Lookback period: 18 months for baseline, 24 months for exceptions
- Minimum attributed lives: 18,000
- Estimated attributed population: 22,600

## Financial Model
- Model type: Full capitation with shared savings overlay
- Benchmark basis: Historical/regional blend, 60/40 weighting
- Risk adjustment model: HCC v28 with a 3% coding cap and new-enrollee normalization
- Trending methodology: Medicare Advantage trend with pharmacy and utilization subindices
- Rebasing frequency: Annual, with midterm actuarial refresh only for market shocks

## Gain/Loss Sharing
| Parameter | Savings | Losses |
|-----------|---------|--------|
| Sharing percentage | 75% | 45% |
| Minimum threshold | 2.0% | 1.5% |
| Maximum sharing | 8% of benchmark | 5% of benchmark |
| Quality gate | Yes, 5% withhold | N/A |

## Risk Protections
- Individual stop-loss: $80,000 per member per year
- Aggregate stop-loss: 5.0% of total benchmark
- Risk corridor: Asymmetric, with a narrower first-loss band and wider savings upside
- High-cost claimant exclusion: $150,000 for transplant, ECMO, and neonatal cases
- Reinsurance: Separate payer-funded excess layer for catastrophic episodes

## Quality Requirements
| Measure | Domain | Target | Penalty/Bonus |
|---------|--------|-------:|---------------|
| Blood pressure screening and follow-up | Preventive care | 85% | 1.5% bonus |
| Depression screening and follow-up | Behavioral health | 82% | 1.0% bonus |
| Screening for Social Drivers of Health | Equity and access | 70% | 1.0% withhold release |
| Statin therapy for high-risk cardiovascular patients | Chronic disease | 88% | 1.5% bonus |
| Breast cancer screening | Preventive care | 78% | 1.0% bonus |
| Colorectal cancer screening | Preventive care | 76% | 1.0% bonus |

## Reconciliation
- Reconciliation frequency: Monthly capitation true-up, quarterly interim, annual final
- Claims runout: 90 days for capitation reconciliations, 120 days for shared-savings settle-up
- Dispute resolution window: 60 days
- Payment timeline: 30 days after final reconciliation

## Recommended Negotiation Priorities
1. Require explicit language that capitation does not eliminate the quarterly quality and utilization true-up.
2. Add a defined corridor width for the first-loss band and a hard aggregate loss cap.
3. Tie the quality gate to the same measure definitions used in the payer reporting file and lock the coding cap in the schedule.
