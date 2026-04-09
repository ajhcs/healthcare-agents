---
holdout_id: rca-d02-holdout-02-glacier-brook-enrollment-model
agent_slug: revenue-contract-analyst
agents_relevant:
- revenue-contract-analyst
deliverable_id: rca-d02
deliverable_title: Reimbursement Modeling Worksheet
seed_ref: revenue-contract-analyst/rca-d02-seed-02-glacier-brook-enrollment-model.yaml
scenario_summary: New payer contract model for a multisite cardiology group where
  go-live economics depend on clinic and physician enrollment effective dates as much
  as on the proposed professional fee schedule.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR Part 424
- CMS Medicare Physician Fee Schedule Search
- Public payer credentialing and participation policies
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Reflect the proposed rate improvement but also isolate revenue at risk if enrollment
  lags.
- Make clear which portion of the modeled upside depends on NPIs and locations being
  active on the effective date.
- Provide a recommendation that distinguishes contracting value from implementation
  risk.
---

# Reimbursement Modeling — Proposed Rate Change

**Payer**: Glacier Brook Choice Network
**Proposed Change**: New participating agreement at 116% of CY 2026 PFS for professional services, 140% of CY 2026 OPPS-equivalent technical reimbursement for in-office diagnostics, and a $185 add-on for diagnostic stress echo interpretation bundles
**Effective Date**: 2026-08-01
**Modeling Period**: 12 months of historical claims from 2025-07 through 2026-06

## Current vs. Proposed Terms
| Service Type | Current Methodology | Current Rate | Proposed Methodology | Proposed Rate |
|-------------|-------------------|-------------|--------------------|--------------|
| Inpatient | Out-of-network realized payment | 92% of Medicare-equivalent | % Medicare | 116% of CY 2026 PFS for professional inpatient services |
| Outpatient | Out-of-network realized payment | 101% of Medicare-equivalent | Technical fee schedule | 140% of CY 2026 OPPS-equivalent diagnostics |
| Professional | Out-of-network realized payment | 94% of CY 2026 PFS-equivalent | % Medicare | 116% of CY 2026 PFS |
| Emergency | Out-of-network realized payment | 95% of Medicare-equivalent | % Medicare | 116% of CY 2026 PFS |
| Observation | Included within professional services | No separate payment | Included within professional services | No separate payment |

## Projected Financial Impact (Applied to 12-Month Historical Volume)
| Service Type | Current Revenue | Projected Revenue | Variance $ | Variance % |
|-------------|----------------|------------------|-----------|-----------|
| Inpatient | $1,884,210 | $2,253,100 | $368,890 | 19.6% |
| Outpatient | $6,228,540 | $7,981,440 | $1,752,900 | 28.1% |
| Professional | $14,906,880 | $18,367,210 | $3,460,330 | 23.2% |
| Emergency | $118,604 | $143,220 | $24,616 | 20.8% |
| Observation | $0 | $0 | $0 | 0.0% |
| **Total** | **$23,138,234** | **$28,744,970** | **$5,606,736** | **24.2%** |

## Sensitivity Analysis
| Scenario | IP Volume Change | OP Volume Change | Rate Change | Revenue Impact |
|----------|-----------------|-----------------|-------------|---------------|
| Base case | 0% | 0% | As proposed with full timely enrollment | $5,606,736 |
| Volume growth | +3% | +6% | As proposed with full timely enrollment | $6,012,218 |
| Volume decline | -3% | -6% | As proposed with full timely enrollment | $5,201,144 |
| Counter-offer | 0% | 0% | Same rates plus 90-day provisional in-network treatment during credentialing | $5,606,736 with reduced implementation risk |

## Recommendation
Proceed only if the payer confirms effective participation dates for all four sites and the 11 pending physician NPIs before go-live, or agrees to provisional in-network treatment for clean claims submitted during the credentialing window.

Financial read:
- The proposed contract is attractive on rate structure alone, adding $5,606,736 on historical volume.
- The largest upside comes from professional services and in-office diagnostic testing.
- A material implementation risk remains because two new clinic sites and 11 pending NPIs represent 28% of projected contracted revenue.

Contracting position:
- Accept the economic terms if enrollment risk is solved contractually or operationally.
- Counter for a 90-day provisional participation clause if payer enrollment cannot be fully validated before 2026-08-01.
- Require retroactive effective-date protection for claims held solely due to payer credentialing backlog.

Risk interpretation:
- Without enrollment confirmation, the first months of the contract could pay at out-of-network or nonparticipating rates despite a favorable signed agreement.
- The modeled upside should therefore be split into secured revenue and enrollment-contingent revenue in leadership review.
- The contract is financially strong; the real question is execution readiness rather than negotiated reimbursement level.
