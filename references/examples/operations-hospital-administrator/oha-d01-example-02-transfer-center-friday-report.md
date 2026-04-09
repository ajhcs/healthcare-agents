---
exemplar_id: oha-d01-example-02-transfer-center-friday-report
agent_slug: operations-hospital-administrator
agents_relevant:
- operations-hospital-administrator
deliverable_id: oha-d01
deliverable_title: Daily Capacity Report
scenario_summary: Daily capacity report for a Friday with heavy transfer-center demand,
  OR add-ons, and telemetry constraints.
complexity: moderate
mcp_servers_relevant:
- provider_directory
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 'EMTALA regulations: 42 CFR 489.24'
- 'CMS Conditions of Participation for Hospitals: 42 CFR 482.23'
- 'CMS Conditions of Participation for Discharge Planning: 42 CFR 482.43'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Daily Hospital Capacity Report

**Date**: 2026-03-20
**Time**: 06:50
**Prepared by**: Rowan Vale, Director of Capacity Management
**Capacity Status**: Orange

## Census Summary
| Unit | Licensed | Staffed | Occupied | Available | Pending Admits | Pending DC |
|------|----------|---------|----------|-----------|----------------|------------|
| Med/Surg | 84 | 76 | 69 | 7 | 5 | 12 |
| ICU | 20 | 18 | 16 | 2 | 1 | 1 |
| Telemetry | 30 | 28 | 28 | 0 | 6 | 4 |
| PCU/Stepdown | 24 | 22 | 20 | 2 | 2 | 3 |
| OB/L&D | 14 | 12 | 8 | 4 | 1 | 1 |
| Pediatrics | 12 | 10 | 6 | 4 | 0 | 1 |
| Behavioral Health | 18 | 16 | 15 | 1 | 0 | 0 |
| **TOTAL** | **202** | **182** | **162** | **20** | **15** | **22** |

## Throughput Metrics (Rolling 24 Hours)
| Metric | Value | Target | Variance |
|--------|-------|--------|----------|
| Admissions | 29 | 27 | +2 |
| Discharges | 24 | 27 | -3 |
| Transfers In | 8 | 5 | +3 |
| Transfers Out | 3 | 4 | -1 |
| ED Boarding (hours) | 3.8 | < 4 hrs | within target |
| Discharge Before Noon % | 37% | > 40% | -3 pts |
| Bed Turnaround Time | 61 min | < 60 min | +1 min |
| Observation patients | 11 | 10 | +1 |
| Observation > 48 hrs | 1 | 0 | +1 |

## Escalation Items
| Issue | Unit | Impact | Action Required | Owner | ETA |
|-------|------|--------|-----------------|-------|-----|
| Telemetry full with six pending admissions, including two transfer-center cardiac cases | Telemetry | Risk of transfer decline and PCU overflow | Convert two med/surg remote-monitoring capable rooms for telemetry use by 10:00 | Nursing Supervisor + Biomed | 10:00 |
| Three add-on cases from OR block release likely require overnight PCU or telemetry placement | OR / PCU | Afternoon bed compression | Confirm surgeon intent by 09:00 and postpone one low-acuity add-on if telemetry conversion not complete | OR Director | 09:00 |
| One observation beneficiary at 44 hours awaiting stress test read | Observation / Telemetry | Status and discharge delay | Escalate cardiology final read by 08:30 and complete MOON follow-up note | UR RN + Cardiology APP | 08:30 |
| Weekend SNF placement backlog for four medically cleared patients | Med/Surg | Blocked beds for Monday surge | Case management to secure transport windows and send discharge packets by 11:00 | CM Manager | 11:00 |

## Surge Actions Activated
- Discharge lounge open in accelerated mode from 08:30 to 18:00.
- No surge beds open at report time; telemetry flex conversion pending equipment placement.
- Elective admissions continue as scheduled, with review of afternoon add-ons at 09:00.
- Elective surgeries not cancelled; one add-on remains conditional.
- ED diversion inactive and not indicated at this time.
- Additional staffing called in: 1 telemetry RN, 1 monitor technician, 1 transporter.

## Transfer Center Summary
- Last 24 hours: 13 inbound transfer requests, 11 accepted, 2 redirected due to no telemetry bed at request time.
- All declines were reviewed against contemporaneous capacity and documented with on-call physician concurrence.
- Highest-demand service lines were interventional cardiology, neurology, and GI bleed stabilization.
- Call-to-accept decision median time was 12 minutes for emergent requests and 24 minutes for urgent requests.

## Operational Notes
- Midnight census was 164, placing the hospital at 90.1% of staffed beds at census close and 100% of staffed telemetry beds.
- Friday discharge execution is the main control point; twelve med/surg and four telemetry discharges are listed, but only nine are physician-confirmed at report time.
- Weekend environmental services staffing is stable; no EVS backlog is present.
- Focus for bed huddle: telemetry decompression, weekend SNF handoff completion, and OR add-on discipline.

## Regulatory / Source Notes
- Transfer acceptance and decline decisions were reviewed under EMTALA requirements in 42 CFR 489.24.
- Unit staffing validation for telemetry flex rooms will follow hospital nursing service controls aligned with 42 CFR 482.23.
- Discharge barriers tied to post-acute placement remain under discharge planning requirements in 42 CFR 482.43.
