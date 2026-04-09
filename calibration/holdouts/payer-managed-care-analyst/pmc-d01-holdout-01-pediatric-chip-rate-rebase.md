---
holdout_id: pmc-d01-holdout-01-pediatric-chip-rate-rebase
agent_slug: payer-managed-care-analyst
agents_relevant:
- payer-managed-care-analyst
deliverable_id: pmc-d01
deliverable_title: Capitation Rate Development Summary
seed_ref: payer-managed-care-analyst/pmc-d01-seed-01-pediatric-chip-rate-rebase.yaml
scenario_summary: CHIP capitation rebase for a pediatric population reflects neonatal
  volatility, seasonal respiratory utilization, and a revised outpatient hospital
  fee schedule.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- CMS Medicaid and CHIP managed care actuarial rate-setting guidance
- 42 CFR 438.4
- Actuarial Standard of Practice No. 49
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- The draft should show a pediatric-heavy rate-cell mix and make infant costs visibly
  higher than school-age cohorts.
- The PMPM build-up should connect respiratory seasonality to inpatient and ED assumptions
  rather than treating trend as a single undifferentiated factor.
- Non-benefit loads should remain modest and consistent with a public program product.
---

# Capitation Rate Development Summary

**Plan/Product**: Bright Harbor Kids Coverage
**Population**: CHIP — pediatric product across synthetic Metro North, Lakeview, and Cedar counties
**Rating Period**: 2027-07-01 to 2028-06-30
**Base Period**: 2025-01-01 to 2025-12-31
**Enrolled Members**: 27,640
**Member Months**: 331,680

## Rate Cell Summary
| Rate Cell | Members | Base PMPM | Trend Factor | Projected PMPM | Admin Load | Final PMPM |
|-----------|---------|-----------|-------------|----------------|------------|------------|
| Adult M 19-44 | 0 | $0.00 | 1.000 | $0.00 | 0.0% | $0.00 |
| Adult F 19-44 | 0 | $0.00 | 1.000 | $0.00 | 0.0% | $0.00 |
| Adult M 45-64 | 0 | $0.00 | 1.000 | $0.00 | 0.0% | $0.00 |
| Adult F 45-64 | 0 | $0.00 | 1.000 | $0.00 | 0.0% | $0.00 |
| Child 0-1 | 1,840 | $812.74 | 1.066 | $866.21 | 10.9% | $972.13 |
| Child 1-5 | 7,220 | $224.95 | 1.059 | $238.22 | 10.9% | $267.35 |
| Child 6-14 | 12,630 | $148.12 | 1.051 | $155.67 | 10.9% | $174.70 |
| Child 15-18 | 5,950 | $176.84 | 1.054 | $186.39 | 10.9% | $209.18 |
| **Composite** | **27,640** | **$216.58** |  | **$228.41** | **10.9%** | **$256.35** |

## PMPM Build-Up by Service Category
| Category | Util/1,000 | Cost/Unit | Base PMPM | Trend | Projected PMPM | % Total |
|----------|-----------|-----------|-----------|-------|----------------|---------|
| Inpatient Acute | 28.6 admits | $4,206 | $10.02 | 6.8% | $10.70 | 4.7% |
| Inpatient BH | 24.1 days | $1,012 | $2.03 | 4.4% | $2.12 | 0.9% |
| ED | 428.3 visits | $516 | $18.41 | 6.1% | $19.53 | 8.6% |
| Outpatient Surgery | 66.8 procedures | $1,864 | $10.38 | 5.9% | $10.99 | 4.8% |
| Professional | 6.72 visits/member/year | $84 | $47.04 | 4.8% | $49.30 | 21.6% |
| Pharmacy | 8.94 scripts/member/year | $62.80 | $46.79 | 8.7% | $50.86 | 22.3% |
| SNF/LTC | 1.4 days | $398 | $0.05 | 3.8% | $0.05 | 0.0% |
| Other |  |  | $81.86 | 3.6% | $84.86 | 37.1% |
| **Total Medical** |  |  | **$216.58** |  | **$228.41** | **100%** |

## Non-Benefit Cost Loading
| Component | PMPM | % of Premium |
|-----------|------|-------------|
| Administration | $18.20 | 7.1% |
| Care management | $4.10 | 1.6% |
| Quality improvement | $2.31 | 0.9% |
| Risk/profit margin | $3.59 | 1.4% |
| Premium tax/fees | $1.54 | 0.6% |
| Contribution to reserves | $3.88 | 1.5% |
| **Total non-benefit** | **$33.62** | **13.1%** |

## Final Composite Rate: $256.35 PMPM
## Projected MLR: 89.1%
## Projected Annual Revenue: $85,020,336
## Projected Annual Medical Cost: $75,754,229

## Key Assumptions
1. Winter respiratory utilization was normalized using a two-year seasonal pattern so ED and pediatric admission trend did not overstate the rating period midpoint.
2. Infant base experience excludes one synthetic NICU shock case after credibility review and redistributes only the recurring neonatal intensity.
3. Hospital outpatient unit cost reflects the 2.4% fee schedule change beginning 2027-07-01, applied only to affected outpatient categories.
4. Enrollment mix is stable, with infant share holding near 6.7% and no material migration between counties.
5. Pediatric dental remains carved out for the first half of the rating period in this draft and does not enter the premium build.

## Sensitivity Analysis
| Scenario | PMPM Impact | Annual P&L Impact |
|----------|------------|-------------------|
| Trend +1% | +$2.17 | -$719,986 |
| Trend -1% | -$2.17 | +$719,986 |
| Utilization +5% (IP only) | +$0.50 | -$165,840 |
| Risk score shift +3% | +$0.00 | $0 |
