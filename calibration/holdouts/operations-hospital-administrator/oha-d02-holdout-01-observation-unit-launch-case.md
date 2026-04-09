---
holdout_id: oha-d02-holdout-01-observation-unit-launch-case
agent_slug: operations-hospital-administrator
agents_relevant:
- operations-hospital-administrator
deliverable_id: oha-d02
deliverable_title: Throughput Improvement Business Case
seed_ref: operations-hospital-administrator/oha-d02-seed-01-observation-unit-launch-case.yaml
scenario_summary: Business case for creating a dedicated observation unit to reduce
  inpatient bed use and improve status management discipline.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- CMS Two-Midnight Rule final policy history
- 'NOTICE Act / MOON requirement: 42 USC 1395cc(a)(1)(Y)'
- 'CMS Conditions of Participation for Utilization Review: 42 CFR 482.30'
- 'CMS Conditions of Participation for Discharge Planning: 42 CFR 482.43'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Quantify how observation-volume migration out of inpatient units changes effective
  bed capacity.
- Show explicit financial impact from reduced short-stay inpatient denials and improved
  throughput.
- Address MOON timing, UR workflow, and escalation for observation stays exceeding
  48 hours.
- Include a real implementation footprint with staffing, renovation, and monitoring
  requirements.
---

# Throughput Improvement Business Case

**Initiative**: 12-Bed Clinical Decision Unit Launch
**Sponsor**: Darren Kline, Chief Operating Officer
**Date**: 2026-04-09
**Projected Go-Live**: 2026-10-01

## Current State
- Current occupancy rate: 91.2%
- Current ALOS: 5.1 days (vs. benchmark: 4.6 days)
- Current DBN rate: 28%
- Annual ED boarding hours: 21,960
- Current bed turnaround time: 79 minutes
- Estimated annual revenue lost to capacity constraints: $4,950,000

## Proposed Intervention
Open a 12-bed Clinical Decision Unit adjacent to the ED and migrate low-to-moderate acuity observation patients out of med/surg and telemetry. The unit will run protocol-based care for chest pain, syncope, transient neurologic workup, cellulitis, dehydration, asthma, and other short-stay observation pathways. Observation status review will be standardized at placement, at 24 hours, and again at 36 hours, with urgent escalation for stays extending beyond 48 hours.

## Expected Impact
| Metric | Current | Projected | Improvement |
|--------|---------|-----------|-------------|
| ALOS | 5.1 days | 4.8 days | -0.3 days |
| DBN rate | 28% | 34% | +6 pts |
| ED boarding hours | 21,960 | 17,100 | -4,860 hrs |
| Bed TAT | 79 min | 66 min | -13 min |
| Effective bed capacity gained | 0 | 9 | +9 beds |
| Annual incremental revenue | $0 | $3,240,000 | +$3,240,000 |

## Implementation Requirements
| Resource | Quantity | Cost |
|----------|----------|------|
| FTEs (new) | 6.0 RN, 1.0 APP, 1.0 unit clerk, shared CM/pharmacy | $1,260,000/year |
| Technology | ED-to-CDU tracking, monitored-bed integration, status-workflow alerts | $310,000 |
| Capital (construction/renovation) | Build 12 monitored observation beds with recliner-capable spaces adjacent to ED | $1,480,000 |
| Training | Observation criteria, MOON workflow, protocol operations, UR escalation | $72,000 |
| **Total Investment** | **Initial year** | **$3,122,000** |

## ROI Analysis
- Total annual benefit: $3,240,000
- Total annual cost: $1,260,000 recurring operating cost plus $1,862,000 one-time implementation cost
- Net annual benefit: $1,980,000 after implementation costs roll off
- Payback period: 14.9 months
- 3-year ROI: 96%

## Strategic Rationale
- Current observation demand is 22 encounters per day and is consuming inpatient bed inventory on med/surg and telemetry.
- Concentrating these encounters in a protocol-driven unit reduces unnecessary inpatient placement, improves flow from the ED, and creates cleaner status management.
- Nine effective staffed-bed equivalents are created through faster turnover of inpatient-capable rooms and fewer avoidable short-stay admissions on telemetry and med/surg.

## Operating Model
- Unit design: 12 monitored beds with recliner-capable bays adjacent to the ED.
- Staffing model: dedicated RN team, one APP, one unit clerk, and shared case management plus pharmacy support.
- Core pathways: chest pain, syncope, TIA, cellulitis, dehydration, and asthma.
- Status controls: observation determination at placement, mandatory review at 24 and 36 hours, executive review of any stay beyond 48 hours.

## Compliance and Risk Controls
- Observation remains outpatient status; patient communications, billing workflow, and care coordination must reflect that distinction.
- MOON workflow must trigger within required timeframes for Medicare beneficiaries remaining in observation beyond 24 hours.
- Utilization review and practitioner documentation must support any conversion to inpatient status.
- High-risk discharge cases cannot be accelerated out of the unit until discharge planning steps are complete and documented.

## Risk Assessment
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Unit becomes overflow for medically unstable inpatients | M | H | Clear inclusion and exclusion criteria, APP review, and hourly escalation for status drift |
| Observation stays exceed designed duration and create internal boarding | M | H | 24-hour and 36-hour review triggers, hospitalist escalation, and executive huddle review of >48-hour stays |
| Status documentation remains inconsistent | M | H | EMR hard-stop, UR queue, physician education, and weekly denial review |
| Capital build slips beyond summer window | M | M | Phased construction plan and owner-controlled contingency on equipment delivery |

## Recommendation
Approve the CDU build for October 2026 go-live. The initiative directly addresses inpatient bed scarcity, ED boarding, and status-management defects in one operating model. If observation volume softens below forecast after go-live, reduce APP hours before reducing RN coverage to preserve throughput and notice compliance.
