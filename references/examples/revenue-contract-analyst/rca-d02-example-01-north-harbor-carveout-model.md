---
exemplar_id: rca-d02-example-01-north-harbor-carveout-model
agent_slug: revenue-contract-analyst
agents_relevant:
- revenue-contract-analyst
deliverable_id: rca-d02
deliverable_title: Reimbursement Modeling Worksheet
scenario_summary: Financial model for a proposed outpatient amendment that increases
  percent-of-OPPS rates but narrows implant carve-out eligibility and changes observation
  reimbursement.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
- coverage_determination
regulatory_as_of: '2026-04-09'
source_basis:
- CMS Hospital Outpatient PPS
- CMS Medicare Physician Fee Schedule Search
- Federal Register final rules for CY 2026 OPPS and PFS payment updates
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Reimbursement Modeling — Proposed Rate Change

**Payer**: North Harbor Commercial PPO
**Proposed Change**: Increase outpatient reimbursement from 132% to 138% of CY 2026 OPPS, revise implant carve-out threshold from invoice cost above $2,500 to above $7,500, and convert observation from APC-based payment to $235 per hour capped at 24 hours
**Effective Date**: 2026-07-01
**Modeling Period**: 12 months of historical claims from 2025-03 through 2026-02

## Current vs. Proposed Terms
| Service Type | Current Methodology | Current Rate | Proposed Methodology | Proposed Rate |
|-------------|-------------------|-------------|--------------------|--------------|
| Inpatient | DRG-based | DRG x $7,480 base | DRG-based | DRG x $7,480 base |
| Outpatient | % Medicare | 132% of CY 2026 OPPS | % Medicare | 138% of CY 2026 OPPS |
| Professional | Fee schedule | 112% of CY 2026 PFS | Fee schedule | 112% of CY 2026 PFS |
| Emergency | APC/Fee schedule blend | 134% of CY 2026 OPPS | APC/Fee schedule blend | 140% of CY 2026 OPPS |
| Observation | APC-based composite and ancillary packaging | Historic paid average $1,864 per case | Per hour | $235 per hour, 24-hour cap |

## Projected Financial Impact (Applied to 12-Month Historical Volume)
| Service Type | Current Revenue | Projected Revenue | Variance $ | Variance % |
|-------------|----------------|------------------|-----------|-----------|
| Inpatient | $11,882,440 | $11,882,440 | $0 | 0.0% |
| Outpatient | $22,417,615 | $23,336,804 | $919,189 | 4.1% |
| Professional | $4,108,921 | $4,108,921 | $0 | 0.0% |
| Emergency | $6,294,770 | $6,548,101 | $253,331 | 4.0% |
| Observation | $2,916,550 | $2,501,448 | -$415,102 | -14.2% |
| **Total** | **$47,620,296** | **$48,377,714** | **$757,418** | **1.6%** |

## Sensitivity Analysis
| Scenario | IP Volume Change | OP Volume Change | Rate Change | Revenue Impact |
|----------|-----------------|-----------------|-------------|---------------|
| Base case | 0% | 0% | As proposed | $757,418 |
| Volume growth | +3% | +5% | As proposed | $881,902 |
| Volume decline | -3% | -5% | As proposed | $632,411 |
| Counter-offer | 0% | 0% | OP at 140% of CY 2026 OPPS and observation at $255 per hour | $1,284,966 |

## Recommendation
Accepting the proposal as written increases modeled annual revenue by $757,418, but that headline gain masks a significant observation loss and materially weaker implant economics for high-volume orthopedic and spine cases.

Counter-propose the following:
- Raise standard outpatient reimbursement to 140% of CY 2026 OPPS.
- Keep the implant carve-out threshold at invoice cost above $2,500, or adopt invoice cost plus 12% for items above $5,000.
- Increase observation reimbursement to $255 per hour with a 30-hour cap and preserve separate payment for high-cost drugs when OPPS status indicators support separate reimbursement.
- Clarify that percent-of-Medicare references use the CMS rule set in effect on date of service, including applicable APC weights and status indicators.

Key modeling findings:
- The increase from 132% to 138% of OPPS produces most of the upside on surgical hospital outpatient department volume.
- The revised implant threshold shifts 143 historical claims from separately payable to packaged reimbursement and removes $522,000 of implant-related recovery opportunity versus the current structure.
- Observation is the single largest negative line item because 61% of historical cases exceeded 10 hours and 18% exceeded 24 hours.
- Emergency pricing improves modestly, but the amendment’s value is dependent on preserving existing trauma activation language and separate reimbursement for qualifying drug administrations.

Negotiation view:
- The payer’s narrative of a broad 6-point OPPS increase is directionally positive but incomplete.
- The proposed carve-out changes move risk back to the provider on the exact encounters with the highest supply cost volatility.
- The contract only becomes meaningfully attractive if the observation and implant terms are revised together rather than traded off against the outpatient percent increase.

Assumption note:
- OPPS logic in the model uses CY 2026 APC weights and status indicator behavior.
- Professional lines remain at 112% of CY 2026 PFS with no proposed amendment effect.
- Coverage-sensitive implant cases with device-intensive status were modeled using historical paid claims and published CMS payment mechanics; payer-specific prior authorization effects were excluded from the revenue projection.
