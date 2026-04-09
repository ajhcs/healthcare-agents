---
holdout_id: r3p-d02-holdout-01-contract-pharmacy-margin-review
agent_slug: revenue-340b-program-manager
agents_relevant:
- revenue-340b-program-manager
deliverable_id: r3p-d02
deliverable_title: Contract Pharmacy Financial Analysis
seed_ref: revenue-340b-program-manager/r3p-d02-seed-01-contract-pharmacy-margin-review.yaml
scenario_summary: A health system needs a contract pharmacy analysis that compares
  savings, fees, and net benefit across multiple locations.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- 42 U.S.C. 256b
- HRSA 340B Program resources
- Medicaid Exclusion File guidance
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Use the exact Contract Pharmacy Financial Analysis structure from the prompt template
  with filled synthetic values.
- Keep the savings and fee math explicit enough to support a renewal decision.
- State a clear recommendation instead of leaving the analysis open-ended.
---
# Contract Pharmacy Financial Analysis

**Entity**: Pine Crest Health Partners
**Contract Pharmacy**: Maple Street Pharmacy Alliance
**TPA**: Cedar TPA Services
**Analysis Period**: Q1 2026

## Volume & Revenue
| Metric | This Period | Prior Period | Change |
|---|---|---|---|
| Total Rx dispensed | 18,420 | 17,960 | +460 |
| 340B-eligible Rx | 10,116 | 9,524 | +592 |
| Capture rate | 54.9% | 53.0% | +1.9 pts |
| Gross 340B savings | $1,280,000 | $1,176,000 | +$104,000 |

## Fee Analysis
| Fee Type | Per Rx | Total | % of Savings |
|---|---|---|---|
| Pharmacy dispensing fee | $0.00 | $172,000 | 13.4% |
| TPA administration fee | $0.00 | $48,000 | 3.8% |
| TPA technology fee | $0.00 | $34,000 | 2.7% |
| Other fees | $0.00 | $41,000 | 3.2% |
| Total fees |  | $295,000 | 23.0% |

## Net 340B Benefit
| Metric | Amount |
|---|---|
| Gross 340B savings | $1,280,000 |
| Less: Total fees | ($295,000) |
| Net 340B benefit to entity | $985,000 |
| Net benefit per Rx | $53.46 |

## Recommendation
- Status: Complete — Continue arrangement as-is
- Status: Complete — Renegotiate fee structure (target: fees < 30% of savings)
- Status: Complete — Add/remove pharmacy locations
- Status: Complete — Terminate arrangement (fees exceed benefit)

## Notes
- Contract pharmacy network review should reconcile dispense volume, eligibility logic, and accumulator behavior before any fee renegotiation
- Fee benchmark target: keep total fees below 30% of gross savings unless there is a documented access or service rationale
