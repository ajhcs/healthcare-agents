---
holdout_id: rcs-d02-holdout-01-denial-root-cause-workbench
agent_slug: revenue-cycle-specialist
agents_relevant:
- revenue-cycle-specialist
deliverable_id: rcs-d02
deliverable_title: Denial Root Cause Analysis
seed_ref: revenue-cycle-specialist/rcs-d02-seed-01-denial-root-cause-workbench.yaml
scenario_summary: The revenue cycle team needs a detailed denial root-cause analysis
  for prior auth, medical necessity, and coding-related rejections.
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
- Use the exact Denial Root Cause Analysis structure from the prompt template with
  filled synthetic values.
- Quantify denial trend, category mix, and corrective actions clearly.
- Show the root cause drill-down for the top category instead of summarizing it away.
---
# Denial Root Cause Analysis

**Analysis Period**: January–March 2026
**Payer**: All major commercial and Medicare Advantage payers
**Service Line**: Orthopedics and cardiology
**Prepared By**: Liam Brooks, RHIA

## Denial Volume & Trend
- Total claims denied: 6,420
- Total denied charges: $2.14M
- Initial denial rate: 5.1% (target: <5%)
- Denial rate trend (6-month): Worsening after the January payer policy change

## Denial Category Breakdown
| Category | Volume | % of Denials | $ Value | Preventable? |
|---|---|---|---|---|
| Eligibility/Registration | 1,480 | 23% | $410,000 | Yes — front-end |
| Authorization | 1,180 | 18% | $560,000 | Yes — front-end |
| Medical Necessity | 1,020 | 16% | $430,000 | Partially — CDI/UM |
| Coding/Billing | 1,260 | 20% | $390,000 | Yes — mid-cycle |
| Duplicate | 420 | 7% | $80,000 | Yes — claims edit |
| Timely Filing | 310 | 5% | $52,000 | Yes — process |
| Coordination of Benefits | 260 | 4% | $70,000 | Partially |
| Contractual/Non-Covered | 490 | 8% | $148,000 | No — payer policy |

## Root Cause Drill-Down: Authorization
### CARC 197: Precertification or authorization missing or not on file
- The scheduling team books orthopedic procedures before authorization status is final.
- Cardiology authorizations are not refreshed when the service date changes by more than 30 days.
- Payer portal screenshots are not stored in the claim file, so denials are hard to overturn.
- The front-end edit stops at registration, but the authorization follow-up workqueue is not reviewed daily.

## 90-Day Action Plan
| Priority | Action | Owner | Deadline | Projected $ Impact |
|---|---|---|---|---|
| 1 | Add a same-day authorization check for all high-dollar procedures | Patient access manager | 2026-04-16 | $310,000 |
| 2 | Refresh the cardiology precertification queue twice daily | Scheduling supervisor | 2026-04-18 | $120,000 |
| 3 | Require proof-of-authorization screenshots to be stored with the claim | Revenue integrity lead | 2026-04-30 | $85,000 |

## Notes
- Organization: Crescent Valley Physician Group
- The action plan assumes weekly denial review until the top two root causes stabilize
