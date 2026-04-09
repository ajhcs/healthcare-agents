---
holdout_id: prs-d01-holdout-01-ma-exchange-renewal-gap
agent_slug: payer-relations-specialist
agents_relevant:
- payer-relations-specialist
deliverable_id: prs-d01
deliverable_title: Payer Contract Analysis Report
seed_ref: payer-relations-specialist/prs-d01-seed-01-ma-exchange-renewal-gap.yaml
scenario_summary: A renewal review where commercial, exchange, and Medicare Advantage
  terms diverge sharply and the organization needs a negotiation memo that separates
  rate lift from product-line risk.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- CMS Medicare Physician Fee Schedule, https://www.cms.gov/medicare/payment/fee-schedules/physician
- CMS Medicare Advantage and Part D, https://www.cms.gov/medicare/health-drug-plans/health-plans
- NAIC State Insurance Regulators Directory, https://content.naic.org/state-insurance-regulators
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- The report must split commercial and Medicare Advantage economics rather than blending
  them into one reimbursement view.
- The clause analysis must flag all-products participation, silent PPO language, deemed
  acceptance, and recoupment lookback as separate risks.
- The recommendation set must include at least one rate target table with current
  and target Medicare percentages by service category.
- The final grade must be justified by both financial underperformance and contract
  language leverage.
---

# Payer Contract Analysis Report

**Payer**: Harbor Vale Health Plan  
**Contract ID**: HVHP-26-1142  
**Product Lines**: PPO, exchange, and Medicare Advantage  
**Effective Date**: 2025-10-01 — **Expiration**: 2028-09-30  
**Auto-Renewal**: Yes, with 150-day notice  
**Analyst**: Mara Ilyas  
**Analysis Date**: 2026-04-09

## Financial Summary
| Service Category | Annual Revenue | % of Total | Current % Medicare | Market Benchmark |
|-----------------|---------------:|-----------:|-------------------:|-----------------:|
| Professional E/M | $21,450,000 | 32% | 121% | 142% |
| Professional Procedures | $13,820,000 | 21% | 114% | 136% |
| Inpatient (DRG/Per Diem) | $10,440,000 | 16% | 89% | 111% |
| Outpatient Facility | $12,760,000 | 19% | 96% | 122% |
| Ancillary | $7,110,000 | 12% | 108% | 125% |
| **Total** | **$65,580,000** | **100%** | **103%** | **128%** |

## Contract Language Risk Assessment
| Clause | Current Language | Risk Level | Recommendation |
|--------|------------------|------------|-----------------|
| Timely filing | 90 days from date of service; corrected claims 60 days from remittance | High | Move corrected claims and appeals to 180 days from remittance |
| Clean claim definition | Portal rejects if taxonomy, auth, or ordering provider data is incomplete | Medium | Add payer-caused portal defects to the clean-claim exception list |
| Recoupment/offset | 30-month lookback with offset after notice | High | Reduce to 18 months and add a payment hold during dispute |
| All-products | PPO participation requires exchange and MA participation | High | Decouple product lines; keep pricing separate by line of business |
| Silent PPO/wrap | Rates may be leased to affiliates with notice by posting | High | Require express written approval for any downstream rate sharing |
| Deemed acceptance | Silence after 14 business days equals agreement | High | Replace with signed amendment requirement |
| Termination notice | 120 days without cause | Medium | Extend to 180 days and preserve continuity-of-care handling |
| MFN clause | Commercial only, but broad enough to influence re-pricing | High | Narrow the clause or remove it entirely |

## Negotiation Priorities (Ranked)
1. Separate Medicare Advantage from commercial and exchange pricing. Estimated value: $5.2M by preventing cross-product dilution.
2. Raise facility and inpatient rates to the minimum acceptable band. Estimated value: $2.7M annual lift.
3. Remove deemed acceptance and narrow recoupment authority. Estimated value: reduced retroactive exposure and fewer silent amendments.

## Recommended Rate Targets
| Service Category | Current % Medicare | Target % Medicare | Revenue Impact |
|-----------------|-------------------:|-------------------:|---------------:|
| Professional E/M | 121% | 141% | $3,380,000 |
| Professional Procedures | 114% | 135% | $2,050,000 |
| Inpatient (DRG/Per Diem) | 89% | 113% | $1,440,000 |
| Outpatient Facility | 96% | 124% | $2,010,000 |
| Ancillary | 108% | 126% | $620,000 |

## Overall Contract Grade: C-

## Findings
- The organization is not underpaid across every line, but the inpatient and facility components are well below a defensible market floor.
- Medicare Advantage should not be priced off the same logic as commercial PPO because the acuity and utilization mix are different.
- The all-products clause is the principal strategic defect because it forces weak lines to ride along with stronger ones.
- Harbor Vale's amendment process is too one-sided; a short notice window plus deemed acceptance creates avoidable compliance risk.
- If the payer refuses product-line separation, the organization should defend the commercial line first and keep the MA discussion separate.

## Sources Reviewed
- CMS Medicare Physician Fee Schedule
- CMS Medicare Advantage and Part D
- NAIC State Insurance Regulators Directory
