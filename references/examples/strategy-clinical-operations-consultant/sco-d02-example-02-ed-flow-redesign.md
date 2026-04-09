---
exemplar_id: sco-d02-example-02-ed-flow-redesign
agent_slug: strategy-clinical-operations-consultant
agents_relevant:
- strategy-clinical-operations-consultant
deliverable_id: sco-d02
deliverable_title: ED Flow Redesign Blueprint
scenario_summary: Emergency department flow redesign for door-to-provider delays,
  boarding pressure, and a rising leave-without-being-seen rate.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
- provider_directory
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 482.55
- EMTALA guidance
- AHRQ emergency department operations guidance
- BLS OEWS 2025
generated_by: sonnet-4.6
reviewed_by: maintainer
review_status: reviewed
review_date: '2026-04-09'
---

# ED Flow Redesign Blueprint

The ED is moving too slowly at the front end and too unevenly at discharge. The redesign has to protect the medical screening exam while removing triage and bed-placement friction.

## Current Performance
| Metric | Current | Target | Assessment |
|---|---|---|---|
| Annual visits | 62,400 | 58,000 | Demand exceeds baseline |
| Door-to-provider | 41 minutes | 30 minutes | Too slow |
| Leave without being seen | 4.8 percent | 3.0 percent | Too high |
| Admit boarding | 8.2 hours | 4.5 hours | Excessive |

## Root Cause Analysis
| Bottleneck | Evidence | Operational Effect |
|---|---|---|
| Triage queue | Registration and triage are serial instead of parallel | Creates a long front-end wait |
| Bed assignment | Inpatient bed requests wait for manual calls | Boarding extends into the ED |
| Consult response | Specialty consults arrive late in the cycle | Disposition slows and beds stay blocked |

## Recommended Flow Model
### Triage & Intake
- Split quick registration from clinical triage so the medical screening exam is not delayed by paperwork.
- Use an acuity flag for immediate rooming when a higher-risk presentation arrives.

### Treatment
- Create a fast-track lane for low-acuity patients and keep one treatment pod reserved for boarders who are ready to move.
- Set a hard limit on time-to-provider escalation so the charge nurse can move flex resources before the queue spills.

### Disposition
- Assign one bedside discharge coordinator to pull transport, follow-up, and paperwork into a single exit workflow.
- Escalate any admitted patient waiting more than six hours to the throughput huddle so the bed tower cannot ignore the backlog.

## Staffing Model Alignment
| Role | Change | Why It Matters |
|---|---|---|
| Charge nurse | Add flow authority | One owner must be able to reassign rooms and staff quickly |
| Bed coordinator | Move to live status board | Manual calls are too slow for this volume |
| Provider leader | Own consult escalation | Specialty bottlenecks need a named physician owner |

## Implementation Timeline
| Phase | Window | Milestone |
|---|---|---|
| Week 1 | Baseline | Lock the current-state metrics and queue thresholds |
| Weeks 2-4 | Pilot | Run fast-track and boarder pod changes on the highest-volume shifts |
| Weeks 5-8 | Scale | Roll the redesign across the full ED schedule |

The redesign respects EMTALA screening obligations, 42 CFR 482.55 emergency services expectations, and the need to protect the medical screening exam while cutting queue time. The main lever is not faster work at the bedside; it is a cleaner front-end flow and faster disposition ownership.
