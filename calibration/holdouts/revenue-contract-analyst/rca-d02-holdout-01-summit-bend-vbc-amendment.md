---
holdout_id: rca-d02-holdout-01-summit-bend-vbc-amendment
agent_slug: revenue-contract-analyst
agents_relevant:
- revenue-contract-analyst
deliverable_id: rca-d02
deliverable_title: Reimbursement Modeling Worksheet
seed_ref: revenue-contract-analyst/rca-d02-seed-01-summit-bend-vbc-amendment.yaml
scenario_summary: Proposed amendment converts a fee-for-service Medicare Advantage
  arrangement into a shared-savings model with downside risk and a quality withhold
  for a multispecialty physician group.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR Part 422
- CMS Medicare Advantage and Part D Rate Announcements
- OIG General Compliance Program Guidance
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Model current versus proposed economics using the provided historical revenue base
  and attributed membership.
- Quantify downside exposure with a clear dollar cap and explain whether the risk
  corridor is acceptable.
- Call out the interaction between quality withhold, minimum savings rate, and settlement
  timing.
- Present a direct recommendation that leadership could use in negotiation.
---

# Reimbursement Modeling — Proposed Rate Change

**Payer**: Summit Bend Senior Choice
**Proposed Change**: Replace current Medicare Advantage physician fee schedule reimbursement with a shared-savings model using a target PMPM of $462, a 55% provider share of savings, 40% provider responsibility for losses beyond a 1.5% corridor, a downside cap at 3.0% of target spend, and a 2.0% quality withhold on monthly claims payments
**Effective Date**: 2027-01-01
**Modeling Period**: 12 months of historical claims from 2025-01 through 2025-12

## Current vs. Proposed Terms
| Service Type | Current Methodology | Current Rate | Proposed Methodology | Proposed Rate |
|-------------|-------------------|-------------|--------------------|--------------|
| Inpatient | Excluded from amendment | Existing facility contracts | Excluded from amendment | Existing facility contracts |
| Outpatient | Excluded from amendment | Existing facility contracts | Excluded from amendment | Existing facility contracts |
| Professional | MA fee schedule | 112% of current MA schedule, $28,640,000 annualized | Shared savings with quality withhold | 55% of savings above 2.0% MSR; 40% of losses after 1.5% corridor |
| Emergency | Participating physician professional claims | Included in historical professional baseline | Included in physician total cost construct | Settles through PMPM reconciliation |
| Observation | Not separately modeled | Included where billed as physician professional services | Not separately modeled | Included through PMPM reconciliation |

## Projected Financial Impact (Applied to 12-Month Historical Volume)
| Service Type | Current Revenue | Projected Revenue | Variance $ | Variance % |
|-------------|----------------|------------------|-----------|-----------|
| Inpatient | $0 | $0 | $0 | 0.0% |
| Outpatient | $0 | $0 | $0 | 0.0% |
| Professional | $28,640,000 | $29,244,600 | $604,600 | 2.1% |
| Emergency | $0 | $0 | $0 | 0.0% |
| Observation | $0 | $0 | $0 | 0.0% |
| **Total** | **$28,640,000** | **$29,244,600** | **$604,600** | **2.1%** |

## Sensitivity Analysis
| Scenario | IP Volume Change | OP Volume Change | Rate Change | Revenue Impact |
|----------|-----------------|-----------------|-------------|---------------|
| Base case | 0% | 0% | Total cost 2.8% below target, as proposed | $604,600 |
| Volume growth | 0% | 0% | Membership +4% with spend 2.8% below target | $831,200 |
| Volume decline | 0% | 0% | Membership -4% with spend 2.8% below target | $378,000 |
| Counter-offer | 0% | 0% | 60% share, downside cap 2.0%, withhold 1.0% | $1,102,400 |

## Recommendation
Counter-propose before acceptance. The draft can outperform the current fee-schedule arrangement if total cost runs at least 2.8% below target, but the combination of a 2.0% quality withhold, an early downside trigger, and a 3.0% cap on target spend creates asymmetric cash-flow and risk pressure for the physician group.

Negotiation priorities:
- Increase the provider savings share from 55% to 60%.
- Move the downside attachment point from 1.5% to 2.0% so the risk corridor aligns with the minimum savings threshold.
- Reduce the quality withhold from 2.0% to 1.0% or settle it quarterly instead of annually.
- Exclude catastrophic transplant and NICU spend from reconciliation or establish a member-level stop-loss.
- Require transparent attribution and monthly interim performance files to avoid year-end surprises.

Financial interpretation:
- On the supplied baseline, target annual spend equals $105,336,000.
- A 2.8% favorable performance year produces $2,949,408 in gross savings.
- At a 55% share, provider gross earned savings equal $1,622,174 before withhold mechanics.
- The 2.0% quality withhold on $28,640,000 of historical physician claims cash flow delays $572,800 and creates working-capital pressure until settlement.
- Net modeled improvement over the current arrangement is positive, but only if quality thresholds are met and excluded-case protections are negotiated.

Risk view:
- The downside cap at 3.0% of target spend implies maximum exposure of $1,264,032 before considering any offset from retained claims revenue.
- That level is material for a physician-only arrangement and should not be accepted without stronger catastrophic protection.
- Settlement nine months after performance year end weakens the economics further because the group finances both the withhold and any operational changes needed to hit the target.

Executive conclusion:
- Viable only with risk-corridor revisions and better stop-loss language.
- Without those changes, the proposed amendment behaves less like a modest upside opportunity and more like a partially funded risk transfer.
