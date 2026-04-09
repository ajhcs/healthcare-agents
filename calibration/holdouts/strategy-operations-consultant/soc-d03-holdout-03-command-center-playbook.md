---
holdout_id: soc-d03-example-03-command-center-playbook
agent_slug: strategy-operations-consultant
agents_relevant:
- strategy-operations-consultant
deliverable_id: soc-d03
deliverable_title: Throughput Command Center Playbook
seed_ref: calibration/seeds/strategy-operations-consultant/soc-d03-seed-03-command-center-playbook.yaml
scenario_summary: Command center playbook for discharge flow, bed management, and
  same-day escalation when throughput drifts out of tolerance.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 482.13
- 42 CFR 482.43
- AHRQ flow management resources
- CMS quality reporting guidance
generated_by: sonnet-4.6
reviewed_by: human
review_status: reviewed
review_date: '2026-04-09'
frozen: true
superseded_by: null
retirement_trigger: Retire when throughput thresholds, discharge planning rules, or
  bed-management governance materially change.
expectations:
- Define trigger points that can actually be used by a live command center.
- Tie every escalation to a named owner and a visible action.
- Protect safety and compliance while improving flow.
---

# Throughput Command Center Playbook

The playbook needs a practical set of triggers, actions, and safety checks so the command center can fix flow in real time instead of documenting it after the fact.

## Trigger Thresholds
| Signal | Trigger | Owner |
|---|---|---|
| Discharges before noon | Below 18 percent | Operations lead |
| ED boarders | Above 12 patients | ED and bed tower leaders |
| Bed turnaround | Above 60 minutes | House supervisor |
| First case delays | Above 15 minutes | Perioperative manager |

## Escalation Actions
| Trigger | Action | Expected Result |
|---|---|---|
| Discharge metric misses target | Run a same-day discharge huddle and pull transport earlier | Free beds before evening admissions |
| Boarders rise above threshold | Open surge beds and reassign a flow nurse | Reduce ED hold time |
| Bed turnaround slips | Escalate cleaning and patient transport together | Shorten the room reset cycle |
| OR starts slip | Call the anesthesia and surgeon leads in real time | Protect the first case schedule |

## Regulatory Safety Checks
| Checkpoint | Control | Why It Matters |
|---|---|---|
| Discharge planning | Do not discharge without the required transition steps | Avoids compliance drift |
| EMTALA | Do not delay triage or medical screening for bed flow | Protects patient rights |
| Infection prevention | Do not shortcut isolation or room-cleaning controls | Avoids a survey finding |

## 24-Hour Recovery Plan
- Hour 0 to 4: stabilize the boarders, assign owners, and clear the highest-risk discharge delays.
- Hour 4 to 12: move low-complexity discharges first and redirect admissions to the cleanest bed path.
- Hour 12 to 24: reset staffing, document the root cause, and close the loop with unit leaders.

The playbook balances throughput speed with EMTALA, discharge planning, and infection prevention controls so the command center does not solve one problem by creating a survey finding. The core discipline is rapid escalation with explicit ownership, then a same-day reset once the backlog is under control.
