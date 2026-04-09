---
holdout_id: soc-d01-example-01-system-performance
agent_slug: strategy-operations-consultant
agents_relevant:
- strategy-operations-consultant
deliverable_id: soc-d01
deliverable_title: Operational Performance Assessment
seed_ref: calibration/seeds/strategy-operations-consultant/soc-d01-seed-01-system-performance.yaml
scenario_summary: Systemwide operational assessment with labor pressure, throughput
  misses, and supply chain slippage across two hospitals.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 482.13
- 42 CFR 482.43
- AHRQ Lean healthcare resources
- BLS OEWS 2025
generated_by: sonnet-4.6
reviewed_by: human
review_status: reviewed
review_date: '2026-04-09'
frozen: true
superseded_by: null
retirement_trigger: Retire when throughput, labor, or supply-chain benchmarks materially
  change the operational baseline.
expectations:
- Show the labor, throughput, and supply chain gap in one view.
- Give a clear priority order rather than a long list of ideas.
- Use operational language that the front line can execute.
---

# Operational Performance Assessment

The assessment shows a system that is moving patients and supplies, but not cleanly enough to avoid recurring waste. The report should identify the bottlenecks, the productivity gap, and the few moves that matter most.

## Executive Summary
- The system is carrying the workload, but labor, throughput, and supply chain each show a measurable drag.
- Productivity is below benchmark because the same bottlenecks recur in different forms across the campuses.
- The improvement plan should focus on the few changes that cut waste at the source instead of adding more reporting layers.

## Labor Productivity
| Metric | Current | Benchmark | Gap |
|---|---|---|---|
| Adjusted discharges per FTE | 31.8 | 35.4 | Below benchmark |
| Overtime as percent of wages | 8.6 percent | 6.0 percent | Too high |
| Agency labor as percent of wages | 6.2 percent | 2.5 percent | Too high |
| Supply labor ratio | 1.14 | 1.00 | High |

## Throughput Metrics
| Metric | Current | Target | Assessment |
|---|---|---|---|
| Discharges before noon | 18.4 percent | 25.0 percent | Slow discharge cycle |
| Average length of stay | 4.8 days | 4.4 days | Too long |
| Bed turnaround time | 68 minutes | 55 minutes | Too slow |
| First case on-time starts | 71 percent | 85 percent | Too low |

## Supply Chain
| Metric | Current | Target | Assessment |
|---|---|---|---|
| Stockout rate | 3.2 percent | 1.5 percent | Too high |
| PAR compliance | 91.0 percent | 96.0 percent | Below target |
| Contract compliance | 88.0 percent | 95.0 percent | Below target |

## Priority Improvement Initiatives
| Initiative | Expected Impact | Owner |
|---|---|---|
| Daily labor huddle | Reduce overtime and agency use within 60 days | Operations director |
| Discharge-by-noon push | Lift throughput and bed availability | Hospitalist and nursing leads |
| Supply par cleanup | Cut stockouts and expedite waste | Supply chain manager |

## Implementation Roadmap
| Phase | Timeframe | Deliverable |
|---|---|---|
| Phase 1 | Weeks 1-4 | Baseline labor and throughput metrics |
| Phase 2 | Weeks 5-8 | Pilot the labor huddle and discharge push |
| Phase 3 | Weeks 9-12 | Expand the supply chain control changes |

The assessment uses CMS conditions of participation, BLS labor data, and AHRQ improvement logic to keep the recommendations operational rather than aspirational. The highest-value moves are the ones that remove a recurring bottleneck, not the ones that merely rebadge a metric dashboard.
