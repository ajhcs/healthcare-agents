---
holdout_id: soc-d02-example-02-asc-capacity
agent_slug: strategy-operations-consultant
agents_relevant:
- strategy-operations-consultant
deliverable_id: soc-d02
deliverable_title: Capacity Planning Model
seed_ref: calibration/seeds/strategy-operations-consultant/soc-d02-seed-02-asc-capacity.yaml
scenario_summary: Ambulatory surgery capacity model with block utilization pressure,
  growing case volume, and one OR suite reaching saturation.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 482.13
- CMS outpatient payment guidance
- AHRQ capacity planning resources
- BLS OEWS 2025
generated_by: sonnet-4.6
reviewed_by: human
review_status: reviewed
review_date: '2026-04-09'
frozen: true
superseded_by: null
retirement_trigger: Retire when the current OR or ambulatory capacity assumptions
  materially change.
expectations:
- Show the current capacity, forecast, and gap in one table set.
- Compare at least three closing options with different tradeoffs.
- Recommend a practical option rather than the biggest option.
---

# Capacity Planning Model

The capacity view shows that surgery demand is outrunning available block time in a few key days. The model should identify the resource pinch points and the option that adds the most capacity with the least disruption.

## Current State
| Site / Resource | Current Capacity | Current Demand | Utilization |
|---|---|---|---|
| Main ORs | 4 rooms / 78 percent utilization | 3,100 cases per year | Near saturation on Tuesday-Thursday |
| ASC rooms | 2 rooms / 84 percent utilization | 1,420 cases per year | Early signs of bottleneck |
| PACU bays | 10 bays / 87 percent utilization | Recovery holds on busy days | Too tight |

## Demand Forecast
| Period | Projected Demand | Growth | Comment |
|---|---|---|---|
| Year 1 | 4,720 cases | 6.1 percent | Volume keeps rising |
| Year 3 | 5,040 cases | 6.0 percent CAGR | Elective growth continues |
| Year 5 | 5,420 cases | 5.1 percent CAGR | Demand stays above current capacity |

## Capacity Gap Analysis
| Constraint | Gap | Impact |
|---|---|---|
| OR block time | 5.2 hours per week | Late-day cases spill over |
| PACU bays | 2 additional bays | Recovery bottleneck on peak days |
| Pre-op intake | 1 additional nurse | Admission prep slows case starts |

## Options to Close the Gap
| Option | Capacity Added | Tradeoff | Time to Deploy |
|---|---|---|---|
| Extend block hours | 5.2 hours per week | Fastest path, but requires surgeon buy-in | 4 to 6 weeks |
| Convert one procedure room | 1 additional room | Highest capital lift | 6 to 9 months |
| Add staggered start times | 2.0 effective rooms | Lower cost, smaller gain | 2 to 4 weeks |

## Recommendation
- Extend block hours first, then add a staggered start pattern if the forecast continues to outrun the current footprint.

The model is built around current throughput math, payer and access pressure, and CMS-related operating constraints that can change the usable capacity window. The recommendation favors the least disruptive option that closes the gap without creating a second bottleneck downstream.
