---
holdout_id: pmc-d01-holdout-02-medicaid-expansion-glp1-pressure
agent_slug: payer-managed-care-analyst
agents_relevant:
- payer-managed-care-analyst
deliverable_id: pmc-d01
deliverable_title: Capitation Rate Development Summary
seed_ref: payer-managed-care-analyst/pmc-d01-seed-02-medicaid-expansion-glp1-pressure.yaml
scenario_summary: Expansion-population re-rate for a provider-sponsored plan highlights
  rapid pharmacy trend, rising ED use, and a proposed stop-loss attachment review
  for high-cost claimants.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- CMS Medicaid managed care actuarial rate-setting guidance
- 42 CFR 438.4
- CMS MLR reporting resources
- Actuarial Standard of Practice No. 49
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- The draft should make pharmacy the largest marginal trend driver and connect it
  to GLP-1 uptake rather than burying it inside other services.
- Sensitivity analysis should show how inpatient shock claims and risk-score movement
  affect annual margin.
- The write-up should acknowledge that stop-loss attachment review is a pricing support
  issue rather than an actuarial certification.
---

# Capitation Rate Development Summary

**Plan/Product**: Cedar Vale Provider Health Plan
**Population**: Medicaid — expansion adults
**Rating Period**: 2027-01-01 to 2027-12-31
**Base Period**: 2025-04-01 to 2026-03-31
**Enrolled Members**: 18,970
**Member Months**: 227,640

## Rate Cell Summary
| Rate Cell | Members | Base PMPM | Trend Factor | Projected PMPM | Admin Load | Final PMPM |
|-----------|---------|-----------|-------------|----------------|------------|------------|
| Adult M 19-44 | 6,840 | $301.85 | 1.081 | $326.30 | 11.7% | $372.21 |
| Adult F 19-44 | 7,920 | $364.62 | 1.084 | $395.24 | 11.7% | $450.84 |
| Adult M 45-64 | 1,760 | $512.96 | 1.096 | $562.19 | 11.7% | $641.26 |
| Adult F 45-64 | 2,450 | $598.11 | 1.099 | $657.32 | 11.7% | $749.77 |
| Child 0-1 | 0 | $0.00 | 1.000 | $0.00 | 0.0% | $0.00 |
| Child 1-5 | 0 | $0.00 | 1.000 | $0.00 | 0.0% | $0.00 |
| Child 6-14 | 0 | $0.00 | 1.000 | $0.00 | 0.0% | $0.00 |
| Child 15-18 | 0 | $0.00 | 1.000 | $0.00 | $0.00 | $0.00 |
| **Composite** | **18,970** | **$393.24** |  | **$425.68** | **11.7%** | **$485.61** |

## PMPM Build-Up by Service Category
| Category | Util/1,000 | Cost/Unit | Base PMPM | Trend | Projected PMPM | % Total |
|----------|-----------|-----------|-----------|-------|----------------|---------|
| Inpatient Acute | 52.4 admits | $6,284 | $27.45 | 7.2% | $29.43 | 6.9% |
| Inpatient BH | 136.8 days | $1,128 | $12.86 | 5.5% | $13.57 | 3.2% |
| ED | 488.6 visits | $816 | $33.23 | 7.9% | $35.85 | 8.4% |
| Outpatient Surgery | 92.6 procedures | $2,764 | $21.33 | 6.8% | $22.78 | 5.3% |
| Professional | 7.42 visits/member/year | $112 | $69.25 | 5.4% | $72.99 | 17.1% |
| Pharmacy | 12.84 scripts/member/year | $108.60 | $116.19 | 13.9% | $132.34 | 31.1% |
| SNF/LTC | 26.4 days | $462 | $1.02 | 6.1% | $1.08 | 0.3% |
| Other |  |  | $111.91 | 5.1% | $117.64 | 27.7% |
| **Total Medical** |  |  | **$393.24** |  | **$425.68** | **100%** |

## Non-Benefit Cost Loading
| Component | PMPM | % of Premium |
|-----------|------|-------------|
| Administration | $26.71 | 5.5% |
| Care management | $8.26 | 1.7% |
| Quality improvement | $4.37 | 0.9% |
| Risk/profit margin | $9.23 | 1.9% |
| Premium tax/fees | $3.40 | 0.7% |
| Contribution to reserves | $7.96 | 1.6% |
| **Total non-benefit** | **$59.93** | **12.3%** |

## Final Composite Rate: $485.61 PMPM
## Projected MLR: 87.7%
## Projected Annual Revenue: $110,544,260
## Projected Annual Medical Cost: $96,922,195

## Key Assumptions
1. Pharmacy trend is the primary driver at 13.9%, reflecting sustained GLP-1 uptake, specialty drug mix, and only partial offset from generic conversion.
2. Inpatient unit cost includes a 3.1% increase on the dominant hospital contract effective at the start of the rating year.
3. ED utilization growth is tied to primary care leakage in two counties rather than a broad acuity shift across the full book.
4. Specific stop-loss attachment review compares the current $175,000 threshold with a proposed $225,000 threshold; the premium draft reflects retained claims below the higher attachment point.
5. Completion factors were set with pharmacy at 99.0% and acute facility claims at 96.1% for the final incurred month.

## Sensitivity Analysis
| Scenario | PMPM Impact | Annual P&L Impact |
|----------|------------|-------------------|
| Trend +1% | +$3.93 | -$894,625 |
| Trend -1% | -$3.93 | +$894,625 |
| Utilization +5% (IP only) | +$1.37 | -$311,867 |
| Risk score shift +3% | +$12.77 | +$2,907,263 |
