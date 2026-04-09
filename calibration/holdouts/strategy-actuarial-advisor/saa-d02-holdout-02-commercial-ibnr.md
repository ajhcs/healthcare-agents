---
holdout_id: saa-d02-example-02-commercial-ibnr
agent_slug: strategy-actuarial-advisor
agents_relevant:
- strategy-actuarial-advisor
deliverable_id: saa-d02
deliverable_title: IBNR Reserve Estimate
seed_ref: calibration/seeds/strategy-actuarial-advisor/saa-d02-seed-02-commercial-ibnr.yaml
scenario_summary: Commercial ASO reserve estimate with a light booked reserve, elevated
  late emergence, and a noticeable pharmacy tail.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- CMS encounter data guidance
- ASOP 43
- NAIC annual statement instructions
- CMS risk adjustment methodology
generated_by: sonnet-4.6
reviewed_by: human
review_status: reviewed
review_date: '2026-04-09'
frozen: true
superseded_by: null
retirement_trigger: Retire when CMS encounter data rules or reserve-reporting guidance
  materially changes the claim-development basis.
expectations:
- Show the method blend and why one estimate was selected.
- Separate the reserve by service category so the tail risk is visible.
- Be explicit about whether the booked reserve is light or adequate.
---

# IBNR Reserve Estimate

The booked reserve is light relative to the development pattern and the selected actuarial estimate, especially once pharmacy and outpatient claims age into the tail. The reserve should be increased before the close is finalized.

## Claims Development Triangle (Paid Claims, $000s)
| Accident Year | 12 Months | 24 Months | 36 Months | 48 Months |
|---|---|---|---|---|
| 2023 | 14,200 | 18,600 | 19,540 | 19,880 |
| 2024 | 15,180 | 19,440 | 20,060 | 20,320 |
| 2025 | 16,540 | 20,110 | 20,640 | 20,930 |
| 2026 | 17,220 | 20,480 | — | — |

## Completion Factors
| Age | Completion Factor | Method Note |
|---|---|---|
| 12 months | 94.2 percent | Recent months are still emerging |
| 24 months | 86.7 percent | Outpatient and pharmacy lag the fastest |
| 36 months | 78.4 percent | Tail emergence remains material |

## IBNR Estimate by Method
| Method | Selected Reserve | Weight | Comment |
|---|---|---|---|
| Chain ladder | $18.4 million | 45 percent | Best fit to recent development |
| Bornhuetter-Ferguson | $17.8 million | 35 percent | Useful as a credibility check |
| Expected loss | $18.1 million | 20 percent | Supports a modest tail margin |

## IBNR by Service Category
| Category | Reserved | Trend Pressure | Comment |
|---|---|---|---|
| Inpatient | $7.9 million | Moderate | Stable but still developing |
| Outpatient | $4.6 million | High | Late claims continue to arrive |
| Professional | $3.2 million | Moderate | Clean but slightly late |
| Pharmacy | $2.3 million | High | Long tail and rebate timing matter |

## Adequacy Assessment
| Metric | Result | View |
|---|---|---|
| Booked reserve | $16.9 million | Too low |
| Selected reserve | $18.0 million | Preferred level |
| Indicated deficiency | $1.1 million | Action needed |

## Key Assumptions & Limitations
- Late pharmacy claims continue to emerge at the recent pace.
- The encounter feed is stable enough to support a triangle-based estimate.
- The selected reserve is meant to absorb tail risk without padding the estimate beyond the observed pattern.

The reserve view is triangulated against CMS encounter data, ASOP 43 discipline, and NAIC reporting conventions where the plan has both medical and pharmacy exposure. The selected reserve reflects the method blend that best fits the recent emergence pattern, not just the largest single estimate.
