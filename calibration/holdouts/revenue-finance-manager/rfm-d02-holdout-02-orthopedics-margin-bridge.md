---
holdout_id: rfm-d02-holdout-02-orthopedics-margin-bridge
agent_slug: revenue-finance-manager
agents_relevant:
- revenue-finance-manager
deliverable_id: rfm-d02
deliverable_title: Service Line Profitability Analysis
seed_ref: calibration/seeds/revenue-finance-manager/rfm-d02-seed-02-orthopedics-margin-bridge.yaml
scenario_summary: Orthopedics profitability review with implant cost pressure, outpatient
  migration, and a payer mix that rewards standardization.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- CMS FY 2026 OPPS Final Rule
- CMS FY 2026 IPPS Final Rule
- CMS Hospital Cost Report Worksheet A
- BLS OEWS 2025
generated_by: sonnet-4.6
reviewed_by: human
review_status: reviewed
review_date: '2026-04-09'
frozen: true
superseded_by: null
retirement_trigger: Retire when the surgical case mix, implant price structure, or
  CMS outpatient payment logic materially changes the line economics.
expectations:
- Show the profitable and fragile service lines side by side.
- Separate volume growth from true contribution margin.
- Give concrete actions that a service line leader can execute.
---

# Service Line Profitability Analysis

Orthopedics is profitable and growing, but the line still leaves money on the table because implant costs and room utilization drift against plan. The right answer is a margin bridge, not a generic growth story.

## Service Line Summary
| Service Line | Volume | Net Revenue | Direct Cost | Contribution Margin | Margin % |
|---|---|---|---|---|---|
| Orthopedics | 1,220 | $19,800 | $16,000 | $3,800 | 19.2 percent |
| Cardiology | 930 | $14,700 | $12,600 | $2,100 | 14.3 percent |
| Imaging | 5,880 | $11,100 | $8,700 | $2,400 | 21.6 percent |
| General surgery | 640 | $10,200 | $8,900 | $1,300 | 12.7 percent |

## Payer Mix by Service Line
| Service Line | Medicare | MA | Commercial | Medicaid | Self-Pay |
|---|---|---|---|---|---|
| Orthopedics | 31 percent | 22 percent | 37 percent | 8 percent | 2 percent |
| Cardiology | 29 percent | 27 percent | 34 percent | 8 percent | 2 percent |
| Imaging | 36 percent | 18 percent | 35 percent | 9 percent | 2 percent |
| General surgery | 33 percent | 24 percent | 31 percent | 10 percent | 2 percent |

## Volume and Revenue per Case
| Service Line | Cases | Revenue per Case | Direct Cost per Case | Contribution per Case |
|---|---|---|---|---|
| Orthopedics | 1,220 | $16,230 | $13,115 | $3,115 |
| Cardiology | 930 | $15,806 | $13,548 | $2,258 |
| Imaging | 5,880 | $1,888 | $1,480 | $408 |
| General surgery | 640 | $15,938 | $13,906 | $2,032 |

## Strategic Recommendations
- Standardize the top implant sets and lock preferred vendors before the next contract refresh.
- Protect outpatient surgery migration while keeping block-time utilization above 85 percent.
- Use payer mix drift to focus physician outreach on commercially insured referrals without overreaching on access.

CMS OPPS and Medicare cost report logic separate the services that deserve reinvestment from the services that only look good because of top-line volume. The best margin levers are standardization, site-of-service migration, and tighter supply control where revenue per case and direct cost per case are too far apart.
