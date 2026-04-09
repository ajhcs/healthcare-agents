---
holdout_id: prs-d03-holdout-01-code-payer-underpayment-mix
agent_slug: payer-relations-specialist
agents_relevant:
- payer-relations-specialist
deliverable_id: prs-d03
deliverable_title: Payer Underpayment Recovery Report
seed_ref: payer-relations-specialist/prs-d03-seed-01-code-payer-underpayment-mix.yaml
scenario_summary: A dense underpayment review for a cardiology and infusion group
  where the model must separate fee schedule defects, carve-out mistakes, and appeals
  that missed the filing window.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- CMS Medicare Physician Fee Schedule, https://www.cms.gov/medicare/payment/fee-schedules/physician
- CMS National Correct Coding Initiative, https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci
- CMS Medicare Claims Processing Manual, https://www.cms.gov/regulations-and-guidance/guidance/manuals/internet-only-manuals-ioms
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- The report must quantify underpayments by payer and by root cause, not only as a
  single lump sum.
- The appeal table must include files awaiting response, paid resolutions, denied
  appeals, exhausted appeals, and cases past filing deadline.
- The recommendations must separate system fixes from contract-language fixes and
  from claim-specific appeal work.
- The narrative should identify which payer presents the weakest recovery rate and
  explain why that matters.
---

# Payer Underpayment Recovery Report — Q1 2026

**Organization**: Ironwood Cardiology and Infusion Center  
**Reporting Period**: 2025-11-01 to 2026-01-31  
**Analyst**: Priya Deshmukh

## Summary by Payer
| Payer | Claims Analyzed | Underpayments Found | Total Variance | Recovered | Pending | Recovery Rate |
|-------|----------------:|--------------------:|---------------:|---------:|--------:|--------------:|
| Aster Ridge Health Plan | 9,480 | 308 | $168,240 | $139,870 | $15,760 | 83% |
| Meridian Cross PPO | 7,610 | 262 | $129,910 | $102,540 | $14,120 | 79% |
| Northline Select | 6,120 | 211 | $120,770 | $95,130 | $11,400 | 79% |
| **Total** | **23,210** | **781** | **$418,920** | **$337,540** | **$41,280** | **81%** |

## Top Underpayment Root Causes
| Cause | Claims Affected | Total Variance | % of Total |
|-------|----------------:|---------------:|-----------:|
| Fee schedule loading error | 266 | $151,020 | 36% |
| Incorrect modifier application | 184 | $97,340 | 23% |
| Improper bundling | 132 | $69,450 | 17% |
| Downcoding | 101 | $47,210 | 11% |
| COB/secondary calculation | 63 | $21,900 | 5% |
| Other | 35 | $12,000 | 3% |

## Appeal Status
| Status | Count | Amount |
|--------|------:|-------:|
| Submitted, awaiting response | 214 | $96,240 |
| Resolved — paid | 372 | $171,850 |
| Resolved — denied, appeal planned | 96 | $51,230 |
| Denied — exhausted appeals | 28 | $16,010 |
| Past contractual filing deadline | 71 | $83,590 |

## Key Findings
- Meridian Cross PPO has the weakest recovery posture because its variance is spread across multiple root causes, not just one loading defect.
- The fee schedule error is concentrated in E/M, infusion administration, and a small cluster of procedure codes, which makes the fix highly leverageable.
- Modifier disputes are recurring on the same billing team workflows, so the issue is operational rather than payer-specific in every instance.
- Bundling disputes are strongest when the contract carve-out language is attached to the appeal packet and the paid line is compared against the remittance logic.
- The deadline bucket is too large to ignore; those cases need a separate fast-track process before the filing window closes.

## Recommendations
1. Rebuild the expected reimbursement file against the current payer fee schedules and lock the version before the next payment cycle.
2. Create a payer-specific modifier checklist for 25, 59, and 26 claims so the same error does not recur.
3. Route all cases with near-term filing deadlines into a daily exception queue.
4. Add a contract-language review step for bundling and carve-out disputes so the appeal includes the exact payment clause.

## Sources Reviewed
- CMS Medicare Physician Fee Schedule
- CMS National Correct Coding Initiative
- CMS Medicare Claims Processing Manual
