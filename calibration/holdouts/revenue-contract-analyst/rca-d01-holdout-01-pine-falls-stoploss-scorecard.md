---
holdout_id: rca-d01-holdout-01-pine-falls-stoploss-scorecard
agent_slug: revenue-contract-analyst
agents_relevant:
- revenue-contract-analyst
deliverable_id: rca-d01
deliverable_title: Contract Performance Scorecard
seed_ref: revenue-contract-analyst/rca-d01-seed-01-pine-falls-stoploss-scorecard.yaml
scenario_summary: Tertiary hospital contract review centered on a stop-loss and outlier
  provision that appears favorable on paper but has produced recurring denials and
  delayed cash.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR Part 412
- CMS Acute Inpatient PPS
- Public payer provider reimbursement manuals
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Show whether the contract is margin-positive despite stop-loss execution failures.
- Separate contractual underpayments from operational or documentation misses.
- Highlight the renewal importance of outlier, stop-loss, and dispute-timing language.
- Use percent-of-Medicare framing for inpatient and outpatient benchmarking.
---

# Contract Performance Scorecard

**Payer**: Pine Falls Regional PPO
**Contract Effective Date**: 2022-11-01
**Contract Term**: 4 years, current year 4 of 4
**Analysis Period**: 12 months ending 2026-03

## Financial Summary
| Metric | Amount | % of Total Revenue |
|--------|--------|--------------------|
| Gross Charges | $286,440,118 | 100.0% |
| Contractual Adjustments | $192,213,608 | 67.1% |
| Net Revenue (Expected) | $94,226,510 | 32.9% |
| Net Revenue (Actual Paid) | $90,998,804 | 31.8% |
| Underpayment Variance | $3,227,706 | 3.4% of expected |

## Payment-to-Cost Analysis
| Service Type | Net Revenue | Estimated Cost | Payment-to-Cost Ratio | Target Ratio |
|-------------|-----------|---------------|---------------------|-------------|
| Inpatient (DRG) | $46,214,992 | $42,611,004 | 108.5% | >100% |
| Outpatient (APC) | $29,466,780 | $28,116,500 | 104.8% | >100% |
| Emergency | $9,202,315 | $8,904,331 | 103.3% | >100% |
| Professional | $6,114,717 | $6,404,707 | 95.5% | >100% |
| **Total** | **$90,998,804** | **$86,036,542** | **105.8%** | **>100%** |

## Rate Comparison vs. Medicare
| Service Type | Contract Rate | Medicare Rate | % of Medicare | Market Benchmark |
|-------------|-------------|-------------|--------------|-----------------|
| IP Base Rate | $8,442.00 | $6,408.00 | 131.7% | 120-180% |
| OP (weighted avg) | $151.20 | $102.36 | 147.7% | 130-200% |
| Professional (CF) | $36.10 | $32.35 | 111.6% | 110-150% |
| ED (weighted avg) | $336.90 | $233.61 | 144.2% | 130-200% |

## Underpayment Summary
| Category | # Claims | $ Underpaid | Root Cause | Status |
|----------|----------|-----------|------------|--------|
| Wrong fee schedule | 318 | $402,118 | Old outpatient rates loaded after January CMS-linked update | Disputed |
| Bundling override | 224 | $311,906 | Packaged-payment edits applied beyond contract language | Disputed |
| Missing escalator | 0 | $0 | CMS-linked update loaded | Closed |
| Carve-out denial | 96 | $2,513,682 | Stop-loss and implant carve-out threshold met but paid under standard case logic | Escalated |
| **Total** | **638** | **$3,227,706** |  | **Open** |

## Contract Terms Assessment
| Provision | Current Term | Market Standard | Risk Level | Recommendation |
|-----------|-------------|----------------|-----------|---------------|
| Rate escalator | CMS-linked annual updates | 2-4% or CMS-linked | 🟢 | Preserve current structure |
| Timely filing | 180 days | 90-180 days | 🟢 | Strong provider position, retain |
| Clean claim def. | 45 days | 30-45 days | 🟢 | Acceptable |
| Prompt payment | 35 days | 30-45 days | 🟢 | Acceptable, enforce interest rights |
| Termination notice | 120 days | 90-120 days | 🟢 | Acceptable |
| Auto-renewal | Yes, one-year terms | Contract-specific | 🟡 | Retain only with mandatory annual exhibit validation |
| Most-favored-nation | No | Declining in market | 🟢 | Maintain exclusion |

Executive readout:
- The contract remains positive on an aggregate payment-to-cost basis, but that result depends on successful recovery of stop-loss and carve-out denials.
- Inpatient and outpatient benchmark well against Medicare, while professional reimbursement is adequate but not a margin driver.
- The main risk is not the headline rate level; it is the payer’s execution of high-cost-case language and the provider’s burden of proving each trigger.

Renewal stance:
- High priority because the payer is operationally difficult on exactly the claims that create the largest dollar exposure.
- Renewal should require simplified stop-loss trigger language, explicit invoice-submission timing, and deemed-approval mechanics when the payer fails to respond within the dispute window.
- The hospital’s regional trauma and neonatal access role provides leverage to tighten carve-out administration rather than merely asking for a nominal rate increase.

Audit distinction:
- The wrong-fee-schedule and bundling items are clear contractual underpayments.
- A subset of the stop-loss inventory may require resubmission support packages, so recovery forecasting should separate fully documented appeals from claims still missing invoice linkage.
