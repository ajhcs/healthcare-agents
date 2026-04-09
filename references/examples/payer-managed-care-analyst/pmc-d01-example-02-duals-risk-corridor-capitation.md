---
exemplar_id: pmc-d01-example-02-duals-risk-corridor-capitation
agent_slug: payer-managed-care-analyst
agents_relevant:
- payer-managed-care-analyst
deliverable_id: pmc-d01
deliverable_title: Capitation Rate Development Summary
scenario_summary: Initial full-risk dual-eligible capitation model incorporates asymmetric
  risk corridor protection and elevated trend for long-term services and specialty
  pharmacy.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- CMS Medicare Advantage rate and risk-adjustment resources
- CMS Medicaid actuarial rate-setting guidance
- 42 CFR 438.4
- Actuarial Standard of Practice No. 49
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Capitation Rate Development Summary

**Plan/Product**: Northgate Community Health Duals Product
**Population**: Medicaid — Full-benefit dual-eligible special population
**Rating Period**: 2027-01-01 to 2027-12-31
**Base Period**: 2025-01-01 to 2025-12-31
**Enrolled Members**: 9,860
**Member Months**: 118,320

## Rate Cell Summary
| Rate Cell | Members | Base PMPM | Trend Factor | Projected PMPM | Admin Load | Final PMPM |
|-----------|---------|-----------|-------------|----------------|------------|------------|
| Adult M 19-44 | 410 | $1,284.22 | 1.091 | $1,401.08 | 9.8% | $1,593.76 |
| Adult F 19-44 | 530 | $1,436.41 | 1.094 | $1,571.98 | 9.8% | $1,788.16 |
| Adult M 45-64 | 2,040 | $1,882.67 | 1.102 | $2,074.23 | 9.8% | $2,359.49 |
| Adult F 45-64 | 2,310 | $2,018.04 | 1.104 | $2,228.12 | 9.8% | $2,534.55 |
| Child 0-1 | 0 | $0.00 | 1.000 | $0.00 | 0.0% | $0.00 |
| Child 1-5 | 0 | $0.00 | 1.000 | $0.00 | 0.0% | $0.00 |
| Child 6-14 | 0 | $0.00 | 1.000 | $0.00 | 0.0% | $0.00 |
| Child 15-18 | 0 | $0.00 | 1.000 | $0.00 | 0.0% | $0.00 |
| **Composite** | **5,290** | **$1,836.95** |  | **$2,026.47** | **9.8%** | **$2,305.25** |

## PMPM Build-Up by Service Category
| Category | Util/1,000 | Cost/Unit | Base PMPM | Trend | Projected PMPM | % Total |
|----------|-----------|-----------|-----------|-------|----------------|---------|
| Inpatient Acute | 124.6 admits | $13,842 | $143.69 | 8.6% | $156.05 | 7.7% |
| Inpatient BH | 412.0 days | $1,466 | $50.34 | 6.9% | $53.81 | 2.7% |
| ED | 612.4 visits | $1,184 | $60.44 | 5.8% | $63.95 | 3.2% |
| Outpatient Surgery | 144.1 procedures | $4,108 | $49.33 | 7.1% | $52.83 | 2.6% |
| Professional | 11.76 visits/member/year | $168 | $164.64 | 5.7% | $174.02 | 8.6% |
| Pharmacy | 22.84 scripts/member/year | $236.90 | $450.85 | 12.8% | $508.55 | 25.1% |
| SNF/LTC | 2,486.0 days | $286 | $592.50 | 9.4% | $648.19 | 32.0% |
| Other |  |  | $325.16 | 13.2% | $369.07 | 18.2% |
| **Total Medical** |  |  | **$1,836.95** |  | **$2,026.47** | **100%** |

## Non-Benefit Cost Loading
| Component | PMPM | % of Premium |
|-----------|------|-------------|
| Administration | $126.79 | 5.5% |
| Care management | $39.19 | 1.7% |
| Quality improvement | $16.14 | 0.7% |
| Risk/profit margin | $34.58 | 1.5% |
| Premium tax/fees | $11.53 | 0.5% |
| Contribution to reserves | $50.55 | 2.2% |
| **Total non-benefit** | **$278.78** | **12.1%** |

## Final Composite Rate: $2,305.25 PMPM
## Projected MLR: 87.9%
## Projected Annual Revenue: $272,517,960
## Projected Annual Medical Cost: $239,290,310

## Key Assumptions
1. Trend uses a 24-month midpoint projection with 9.4% LTSS growth and 12.8% pharmacy growth driven by specialty and cell-and-gene therapy exposure.
2. Completion factors rely on lag triangles with the most recent quarter blended using a Bornhuetter-Ferguson overlay because LTSS runout is slower than acute claims.
3. Population mix assumes risk score lift of 1.8% from documented frailty and dual-status coding cleanup, partially offset by lower county benchmark revenue in two regions.
4. Provider reimbursement changes include a 3.0% SNF rate escalator and a revised home health episodic contract effective 2027-04-01.
5. The arrangement includes an asymmetric risk corridor: provider retains 100% of results within plus or minus 3%, shares 50% of losses from 3% to 8%, and receives 30% of gains beyond 3%.

## Sensitivity Analysis
| Scenario | PMPM Impact | Annual P&L Impact |
|----------|------------|-------------------|
| Trend +1% | +$18.37 | -$2,173,000 before corridor; -$1,086,000 after corridor |
| Trend -1% | -$18.37 | +$2,173,000 before corridor; +$652,000 after corridor |
| Utilization +5% (IP only) | +$7.18 | -$849,000 before corridor; -$424,000 after corridor |
| Risk score shift +3% | +$69.16 | +$8,182,000 |
