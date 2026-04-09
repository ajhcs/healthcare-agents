---
exemplar_id: prs-d03-example-01-underpayment-quarter-close
agent_slug: payer-relations-specialist
agents_relevant:
- payer-relations-specialist
deliverable_id: prs-d03
deliverable_title: Payer Underpayment Recovery Report
scenario_summary: A quarter-end recovery report for a multispecialty practice that
  needs to quantify fee schedule loading errors, bundling defects, and appeal yield
  across three major payers.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- CMS Medicare Physician Fee Schedule, https://www.cms.gov/medicare/payment/fee-schedules/physician
- CMS National Correct Coding Initiative, https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci
- CMS Medicare Claims Processing Manual, https://www.cms.gov/regulations-and-guidance/guidance/manuals/internet-only-manuals-ioms
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Payer Underpayment Recovery Report — Q4 2025

**Organization**: Cedar Wren Medical Partners  
**Reporting Period**: 2025-10-01 to 2025-12-31  
**Analyst**: Jonah Patel

## Summary by Payer
| Payer | Claims Analyzed | Underpayments Found | Total Variance | Recovered | Pending | Recovery Rate |
|-------|----------------:|--------------------:|---------------:|---------:|--------:|--------------:|
| Aster Ridge Health Plan | 8,420 | 312 | $184,260 | $161,880 | $14,640 | 88% |
| Meridian Cross PPO | 6,170 | 189 | $96,870 | $79,550 | $11,960 | 82% |
| Northline Select | 4,330 | 146 | $71,040 | $52,930 | $9,410 | 75% |
| **Total** | **18,920** | **647** | **$352,170** | **$294,360** | **$35,010** | **84%** |

## Top Underpayment Root Causes
| Cause | Claims Affected | Total Variance | % of Total |
|-------|----------------:|---------------:|-----------:|
| Fee schedule loading error | 211 | $124,400 | 35% |
| Incorrect modifier application | 167 | $86,150 | 24% |
| Improper bundling | 98 | $62,030 | 18% |
| Downcoding | 84 | $41,620 | 12% |
| COB/secondary calculation | 61 | $22,740 | 6% |
| Other | 26 | $15,230 | 5% |

## Appeal Status
| Status | Count | Amount |
|--------|------:|-------:|
| Submitted, awaiting response | 182 | $88,430 |
| Resolved — paid | 298 | $161,880 |
| Resolved — denied, appeal planned | 74 | $41,200 |
| Denied — exhausted appeals | 21 | $12,310 |
| Past contractual filing deadline | 72 | $48,350 |

## Key Findings
- The largest variance sits in a fee schedule load issue on E/M and minor procedure families, which points to a system configuration defect rather than a coding problem.
- Modifier handling is inconsistent on bilateral and distinct-procedure claims, especially where 25, 59, and 26 were applied.
- Northline Select produced the weakest recovery rate because its appeal queue had the highest count of aged files approaching filing cutoff.
- Several bundled-device disputes were recoverable only when the contract carve-out language was cited line by line with the remittance code.
- Downcoding is present, but it is not the main leak; the greater loss comes from systematic underpayment on clean claims that never should have paid below contract.

## Recommendations
1. Rebuild the fee schedule validation file for the top 200 CPT/HCPCS lines and compare paid amounts to contract logic before the next remittance cycle.
2. Require payer-specific appeal packets for modifier and bundling disputes so the supporting contract clause is attached on first submission.
3. Escalate Northline Select into contract review because its filing window and payment logic are producing avoidable write-offs.
4. Add a weekly underpayment exception report for claims above the $25 variance threshold so recovery work starts sooner.

## Sources Reviewed
- CMS Medicare Physician Fee Schedule
- CMS National Correct Coding Initiative
- CMS Medicare Claims Processing Manual
