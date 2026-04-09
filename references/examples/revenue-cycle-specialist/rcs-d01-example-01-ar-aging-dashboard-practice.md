---
exemplar_id: rcs-d01-example-01-ar-aging-dashboard-practice
agent_slug: revenue-cycle-specialist
agents_relevant:
- revenue-cycle-specialist
deliverable_id: rcs-d01
deliverable_title: Revenue Cycle Performance Dashboard
scenario_summary: A physician practice needs a dashboard tuned to point-of-service
  collections, A/R aging, and bad-debt pressure.
complexity: moderate
mcp_servers_relevant:
- coverage_determination
- coding_edit_policy
- provider_enrollment_status
regulatory_as_of: '2026-04-09'
source_basis:
- CMS Medicare Claims Processing Manual
- CMS remittance advice and claims processing guidance
- HFMA revenue cycle best practices
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---
# Revenue Cycle Performance Dashboard

**Organization**: Cedar Ridge Specialty Practice
**Reporting Period**: April 2026
**Prepared By**: Monica Reyes, CPA

## Summary KPIs
| Metric | Current Month | Prior Month | Trend | Benchmark | Status |
|---|---|---|---|---|---|
| Days in A/R (Gross) | 29 | 31 | ↓ | <45 | 🟢 |
| Days in A/R (Net) | 25 | 26 | ↓ | <40 | 🟢 |
| Clean Claim Rate | 97.1% | 96.8% | ↑ | >95% | 🟢 |
| Initial Denial Rate | 3.6% | 3.8% | ↓ | <5% | 🟢 |
| Denial Overturn Rate | 72% | 69% | ↑ | >65% | 🟢 |
| Net Collection Rate | 98.8% | 98.5% | ↑ | >98% | 🟢 |
| Cost to Collect | 2.1% | 2.2% | ↓ | <3% | 🟢 |
| POS Collections | 38% | 35% | ↑ | >30% | 🟢 |
| DNFB Days | 3.0 | 3.4 | ↓ | <5 | 🟢 |
| Bad Debt % Net Rev | 1.3% | 1.4% | ↓ | <2% | 🟢 |

## A/R Aging Summary
| Aging Bucket | Balance | % of Total A/R | Prior Month % | Benchmark % |
|---|---|---|---|---|
| 0-30 days | $1.6M | 58% | 57% | 50-55% |
| 31-60 days | $0.6M | 22% | 23% | 20-25% |
| 61-90 days | $0.2M | 8% | 8% | 10-15% |
| 91-120 days | $0.1M | 4% | 4% | 5-8% |
| 121-180 days | $0.1M | 4% | 4% | 3-5% |
| >180 days | $0.1M | 4% | 4% | <5% |
| Total A/R | $2.7M | 100% | 100% | 100% |

## Denial Analysis — Top CARCs by Dollar Value
| Rank | CARC | Description | Denied $ | # Claims | Avg $/Claim | Overturn Rate | Root Cause |
|---|---|---|---|---|---|---|---|
| 1 | 16 | Claim/service lacks information or has submission/billing error | $31,000 | 58 | $534 | 74% | Missing demographic or auth detail |
| 2 | 50 | These are non-covered services because this is not deemed medically necessary | $24,000 | 42 | $571 | 66% | Provider note specificity |
| 3 | 197 | Precertification/authorization missing | $22,000 | 36 | $611 | 59% | Authorization follow-up delay |
| 4 | 234 | Ambulatory patient grouping reduction | $15,000 | 24 | $625 | 63% | Coding/edit mismatch |
| 5 | 204 | Service not covered under current benefit plan | $12,000 | 19 | $632 | 49% | Benefit verification gap |

## Action Items
| Issue | Owner | Due Date | Expected Revenue Impact |
|---|---|---|---|
| Front-end benefit verification refresh | Patient access manager | 2026-04-20 | $18,000 |
| POS collections script update | Front desk lead | 2026-04-25 | $9,000 |
| Monthly physician-level dashboard review | Practice administrator | 2026-05-01 | $0 |
