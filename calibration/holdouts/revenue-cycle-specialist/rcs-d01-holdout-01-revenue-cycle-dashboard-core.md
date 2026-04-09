---
holdout_id: rcs-d01-holdout-01-revenue-cycle-dashboard-core
agent_slug: revenue-cycle-specialist
agents_relevant:
- revenue-cycle-specialist
deliverable_id: rcs-d01
deliverable_title: Revenue Cycle Performance Dashboard
seed_ref: revenue-cycle-specialist/rcs-d01-seed-01-revenue-cycle-dashboard-core.yaml
scenario_summary: A hospital revenue cycle team needs an executive dashboard covering
  A/R, denials, collections, and bad debt.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- CMS Medicare Claims Processing Manual
- CMS remittance advice and claims processing guidance
- HFMA revenue cycle best practices
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Use the exact Revenue Cycle Performance Dashboard structure from the prompt template
  with filled synthetic values.
- Keep A/R, denials, collections, and bad debt in one operational view.
- Make the action items financially specific.
---
# Revenue Cycle Performance Dashboard

**Organization**: Pine Crest Regional Hospital
**Reporting Period**: March 2026
**Prepared By**: Sarah Molina, MBA

## Summary KPIs
| Metric | Current Month | Prior Month | Trend | Benchmark | Status |
|---|---|---|---|---|---|
| Days in A/R (Gross) | 41 | 43 | ↓ | <45 | 🟢 |
| Days in A/R (Net) | 34 | 36 | ↓ | <40 | 🟢 |
| Clean Claim Rate | 96.4% | 95.8% | ↑ | >95% | 🟢 |
| Initial Denial Rate | 4.2% | 4.7% | ↓ | <5% | 🟢 |
| Denial Overturn Rate | 68% | 65% | ↑ | >65% | 🟢 |
| Net Collection Rate | 98.4% | 98.1% | ↑ | >98% | 🟢 |
| Cost to Collect | 2.7% | 2.8% | ↓ | <3% | 🟢 |
| POS Collections | 31% | 29% | ↑ | >30% | 🟢 |
| DNFB Days | 4.1 | 4.4 | ↓ | <5 | 🟢 |
| Bad Debt % Net Rev | 1.8% | 1.9% | ↓ | <2% | 🟢 |

## A/R Aging Summary
| Aging Bucket | Balance | % of Total A/R | Prior Month % | Benchmark % |
|---|---|---|---|---|
| 0-30 days | $9.8M | 52% | 53% | 50-55% |
| 31-60 days | $4.1M | 22% | 21% | 20-25% |
| 61-90 days | $2.1M | 11% | 11% | 10-15% |
| 91-120 days | $1.1M | 6% | 6% | 5-8% |
| 121-180 days | $0.7M | 4% | 4% | 3-5% |
| >180 days | $0.9M | 5% | 5% | <5% |
| Total A/R | $18.7M | 100% | 100% | 100% |

## Denial Analysis — Top CARCs by Dollar Value
| Rank | CARC | Description | Denied $ | # Claims | Avg $/Claim | Overturn Rate | Root Cause |
|---|---|---|---|---|---|---|---|
| 1 | 16 | Claim/service lacks information or has submission/billing error | $184,000 | 312 | $590 | 71% | Missing auth or referral data |
| 2 | 50 | These are non-covered services because this is not deemed medically necessary | $126,000 | 211 | $598 | 62% | Medical necessity edits |
| 3 | 234 | Ambulatory patient grouping reduction | $84,000 | 146 | $575 | 55% | Charge coding mismatch |
| 4 | 97 | Processed in error | $61,000 | 94 | $649 | 80% | Duplicate billing workflow |
| 5 | 204 | This service/equipment/drug is not covered under the patient’s current benefit plan | $55,000 | 88 | $625 | 44% | Benefit verification gap |

## Action Items
| Issue | Owner | Due Date | Expected Revenue Impact |
|---|---|---|---|
| Top denial category cleanup | Denials manager | 2026-04-30 | $120,000 |
| Front-end benefit verification rework | Patient access director | 2026-05-07 | $95,000 |
| POS collections script refresh | Registration manager | 2026-05-14 | $40,000 |
