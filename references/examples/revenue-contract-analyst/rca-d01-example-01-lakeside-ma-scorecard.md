---
exemplar_id: rca-d01-example-01-lakeside-ma-scorecard
agent_slug: revenue-contract-analyst
agents_relevant:
- revenue-contract-analyst
deliverable_id: rca-d01
deliverable_title: Contract Performance Scorecard
scenario_summary: Annual Medicare Advantage contract review for a regional hospital
  showing strong outpatient pricing but material underpayments tied to a missed escalator
  and stale professional fee schedule.
complexity: moderate
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- CMS Medicare Physician Fee Schedule Search
- CMS Acute Inpatient PPS
- CMS Hospital Outpatient PPS
- 45 CFR Part 180
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Contract Performance Scorecard

**Payer**: Lakeside Advantage Health Plan
**Contract Effective Date**: 2024-01-01
**Contract Term**: 3 years, current year 3 of 3
**Analysis Period**: 12 months ending 2026-02

## Financial Summary
| Metric | Amount | % of Total Revenue |
|--------|--------|--------------------|
| Gross Charges | $148,620,410 | 100.0% |
| Contractual Adjustments | $96,481,226 | 64.9% |
| Net Revenue (Expected) | $52,139,184 | 35.1% |
| Net Revenue (Actual Paid) | $51,112,904 | 34.4% |
| Underpayment Variance | $1,026,280 | 2.0% of expected |

## Payment-to-Cost Analysis
| Service Type | Net Revenue | Estimated Cost | Payment-to-Cost Ratio | Target Ratio |
|-------------|-----------|---------------|---------------------|-------------|
| Inpatient (DRG) | $18,904,220 | $17,842,760 | 106.0% | >100% |
| Outpatient (APC) | $19,612,115 | $17,233,401 | 113.8% | >100% |
| Emergency | $5,488,704 | $5,276,920 | 104.0% | >100% |
| Professional | $7,107,865 | $6,941,027 | 102.4% | >100% |
| **Total** | **$51,112,904** | **$47,294,108** | **108.1%** | **>100%** |

## Rate Comparison vs. Medicare
| Service Type | Contract Rate | Medicare Rate | % of Medicare | Market Benchmark |
|-------------|-------------|-------------|--------------|-----------------|
| IP Base Rate | $7,615.00 | $6,408.00 | 118.8% | 120-180% |
| OP (weighted avg) | $142.66 | $102.36 | 139.4% | 130-200% |
| Professional (CF) | $35.80 | $32.35 | 110.7% | 110-150% |
| ED (weighted avg) | $318.42 | $233.61 | 136.3% | 130-200% |

## Underpayment Summary
| Category | # Claims | $ Underpaid | Root Cause | Status |
|----------|----------|-----------|------------|--------|
| Wrong fee schedule | 1,842 | $418,905 | 2025 professional schedule used past 2026 update date | Disputed |
| Bundling override | 611 | $171,844 | Multiple procedure reduction applied to status indicator S services | Disputed |
| Missing escalator | 924 | $286,617 | 2.5% annual increase not loaded for facility claims | Disputed |
| Carve-out denial | 77 | $148,914 | Separately payable oncology drug carve-out denied at packaged OPPS logic | Disputed |
| **Total** | **3,454** | **$1,026,280** |  | **Open** |

## Contract Terms Assessment
| Provision | Current Term | Market Standard | Risk Level | Recommendation |
|-----------|-------------|----------------|-----------|---------------|
| Rate escalator | 2.5% annual, fixed | 2-4% or CMS-linked | 🟡 | Preserve escalator and require written implementation confirmation within 30 days of each anniversary |
| Timely filing | 120 days | 90-180 days | 🟢 | Acceptable, retain current term |
| Clean claim def. | 45 days | 30-45 days | 🟢 | Acceptable, but tie missing documentation requests to one-time notice |
| Prompt payment | 30 days | 30-45 days | 🟢 | Strong provision, retain and enforce interest language |
| Termination notice | 180 days | 90-120 days | 🔴 | Counter to 120 days to preserve contracting agility |
| Auto-renewal | Yes, one-year terms | Contract-specific | 🟡 | Retain only with mutual annual rate review trigger |
| Most-favored-nation | No | Declining in market | 🟢 | Maintain exclusion |

Leadership view: the contract remains margin-positive, but current-year underpayments erased roughly one-third of the nominal 2.5% annual escalator. Outpatient reimbursement benchmarks well against Medicare and local transparency files, while professional rates sit at the low edge of acceptable market range.

Renewal priority: medium-high. The payer is a top-six revenue contributor and the next negotiation should focus on three items: moving professional reimbursement to 114% of CY 2026 PFS, reducing termination notice from 180 to 120 days, and tightening exhibit-loading language so CMS-based updates become operational automatically on the contractual effective date.

Dispute posture: supportable. Each open category has claim-line expected-versus-paid detail, contract citations to Exhibit B and Amendment 2, and remittance trace numbers. Recovery should be pursued before renewal discussions close so the escalator failure does not reset the baseline for the next term.

Benchmark note: percent-of-Medicare comparisons in this scorecard reflect CY 2026 locality-adjusted PFS for professional services, CY 2026 OPPS for outpatient and emergency weighted averages, and FY 2026 IPPS base-rate logic for inpatient benchmarking.
