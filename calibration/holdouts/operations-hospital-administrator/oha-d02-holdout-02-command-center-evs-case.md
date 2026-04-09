---
holdout_id: oha-d02-holdout-02-command-center-evs-case
agent_slug: operations-hospital-administrator
agents_relevant:
- operations-hospital-administrator
deliverable_id: oha-d02
deliverable_title: Throughput Improvement Business Case
seed_ref: operations-hospital-administrator/oha-d02-seed-02-command-center-evs-case.yaml
scenario_summary: Business case for command-center-driven EVS and transport orchestration
  to reduce room turnover delays and ED boarding.
complexity: routine
regulatory_as_of: '2026-04-09'
source_basis:
- 'CMS Conditions of Participation for Nursing Services: 42 CFR 482.23'
- 'CMS Conditions of Participation for Physical Environment: 42 CFR 482.41'
- Institute for Healthcare Improvement resources on patient flow and discharge process
  redesign
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Translate EVS and transport coordination improvements into staffed-bed equivalents
  and revenue impact.
- Show a modest-capital, operations-heavy intervention rather than a construction-heavy
  expansion.
- Include realistic staffing, technology, and governance requirements.
- Address risk that faster room turnover without discharge readiness could create
  unsafe pressure.
---

# Throughput Improvement Business Case

**Initiative**: Central Throughput Command Center Lite
**Sponsor**: Naomi Crest, Chief Nursing Officer
**Date**: 2026-04-09
**Projected Go-Live**: 2026-08-15

## Current State
- Current occupancy rate: 89.6%
- Current ALOS: 4.7 days (vs. benchmark: 4.5 days)
- Current DBN rate: 35%
- Annual ED boarding hours: 15,480
- Current bed turnaround time: 92 minutes
- Estimated annual revenue lost to capacity constraints: $2,880,000

## Proposed Intervention
Stand up a small centralized throughput hub that coordinates discharge notification, EVS dispatch, patient transport, and real-time bed release using one shared wallboard and mobile task alerts. The intervention uses existing unit footprints and focuses on reducing idle time between discharge order, patient departure, room cleaning, and next bed assignment.

## Expected Impact
| Metric | Current | Projected | Improvement |
|--------|---------|-----------|-------------|
| ALOS | 4.7 days | 4.6 days | -0.1 days |
| DBN rate | 35% | 39% | +4 pts |
| ED boarding hours | 15,480 | 12,900 | -2,580 hrs |
| Bed TAT | 92 min | 58 min | -34 min |
| Effective bed capacity gained | 0 | 4 | +4 beds |
| Annual incremental revenue | $0 | $1,440,000 | +$1,440,000 |

## Implementation Requirements
| Resource | Quantity | Cost |
|----------|----------|------|
| FTEs (new) | 1.0 throughput RN lead, 1.0 EVS dispatcher, 1.0 transport coordinator | $286,000/year |
| Technology | Shared wallboard, mobile alerts, ADT interface work | $185,000 |
| Capital (construction/renovation) | Convert existing alcove into three-station command point | $96,000 |
| Training | EVS, transport, nursing supervisor, bed control, case management | $18,000 |
| **Total Investment** | **Initial year** | **$585,000** |

## ROI Analysis
- Total annual benefit: $1,440,000
- Total annual cost: $286,000 recurring operating cost plus $299,000 one-time implementation cost
- Net annual benefit: $1,154,000 after implementation costs roll off
- Payback period: 6.0 months
- 3-year ROI: 268%

## Implementation Logic
- Current turnover delay is not driven by cleaning time alone; it is driven by notification lag, transport delay, and bed-release sequencing.
- A centralized coordinator model removes handoff lag between units, EVS, transport, and bed assignment.
- Four effective staffed-bed equivalents are created by reclaiming time already sitting inside the discharge-to-ready interval.

## Operating Controls
- Bed release occurs only after discharge readiness is complete, the patient has physically departed the room, EVS has marked the room complete, and staffing is available for the next placement.
- Command-center metrics will be reviewed daily at the morning bed huddle and weekly with nursing, EVS, and transport leadership.
- Infection-prevention and physical-environment controls remain unchanged; the intervention speeds coordination, not clinical shortcuts.

## Risk Assessment
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Units delay notification despite centralized workflow | M | M | Daily variance report by unit and director follow-up |
| Faster turnover pushes premature discharge behavior | L | H | Bed-release checklist tied to discharge completion and nurse sign-off |
| EVS or transport staffing gaps limit gains | M | M | Backup staffing matrix and weekend flex coverage plan |
| Technology adoption stalls | M | M | Super-user rollout and two-week command-center pilot before full launch |

## Recommendation
Approve the command-center-lite model for August 2026 go-live. This is a low-capital operational intervention with a short payback window and measurable effect on boarding and bed release. If turnover gains are less than projected after 60 days, extend dispatcher coverage into the late evening before adding any new software scope.
