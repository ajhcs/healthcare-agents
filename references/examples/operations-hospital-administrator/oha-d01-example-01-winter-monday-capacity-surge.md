---
exemplar_id: oha-d01-example-01-winter-monday-capacity-surge
agent_slug: operations-hospital-administrator
agents_relevant:
- operations-hospital-administrator
deliverable_id: oha-d01
deliverable_title: Daily Capacity Report
scenario_summary: Daily capacity report for a winter respiratory surge day with ICU
  strain, ED boarding, and observation patients nearing status escalation.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 'CMS Conditions of Participation for Hospitals: 42 CFR 482.15, 42 CFR 482.23, 42
  CFR 482.41'
- 'EMTALA regulations: 42 CFR 489.24'
- 'NOTICE Act / MOON requirement: 42 USC 1395cc(a)(1)(Y)'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Daily Hospital Capacity Report

**Date**: 2026-01-12
**Time**: 07:15
**Prepared by**: Mara Ellison, MHA, Administrator on Call
**Capacity Status**: Red

## Census Summary
| Unit | Licensed | Staffed | Occupied | Available | Pending Admits | Pending DC |
|------|----------|---------|----------|-----------|----------------|------------|
| Med/Surg | 96 | 88 | 84 | 4 | 6 | 11 |
| ICU | 24 | 22 | 22 | 0 | 3 | 1 |
| Telemetry | 36 | 32 | 31 | 1 | 4 | 5 |
| PCU/Stepdown | 28 | 24 | 24 | 0 | 2 | 3 |
| OB/L&D | 18 | 16 | 11 | 5 | 1 | 2 |
| Pediatrics | 20 | 14 | 9 | 5 | 1 | 2 |
| Behavioral Health | 22 | 20 | 18 | 2 | 0 | 1 |
| **TOTAL** | **244** | **216** | **199** | **17** | **17** | **25** |

## Throughput Metrics (Rolling 24 Hours)
| Metric | Value | Target | Variance |
|--------|-------|--------|----------|
| Admissions | 41 | 34 | +7 |
| Discharges | 27 | 34 | -7 |
| Transfers In | 6 | 5 | +1 |
| Transfers Out | 2 | 4 | -2 |
| ED Boarding (hours) | 6.3 | < 4 hrs | +2.3 hrs |
| Discharge Before Noon % | 29% | > 40% | -11 pts |
| Bed Turnaround Time | 83 min | < 60 min | +23 min |
| Observation patients | 17 | 12 | +5 |
| Observation > 48 hrs | 3 | 0 | +3 |

## Escalation Items
| Issue | Unit | Impact | Action Required | Owner | ETA |
|-------|------|--------|-----------------|-------|-----|
| Three ventilated transfer requests pending with no staffed ICU bed | ICU | Transfer delay and EMTALA acceptance pressure for specialized capability | Open 2 PACU surge critical care beds once RT and ICU float coverage confirmed | ICU Director + House Supervisor | 09:00 |
| Nine admitted patients boarding in ED | ED | Door-to-room delay, LWBS risk, EMS wall time | Pull discharge-ready list by 08:00 and move two stable telemetry discharges to discharge lounge by 09:30 | CM Director + Telemetry Charge | 09:30 |
| EVS turnover backlog on four discharged rooms | Med/Surg | Four staffed beds unavailable | Redeploy day-shift EVS lead and two float technicians to 4 North and 5 West | EVS Manager | 08:15 |
| Observation patient synthetic MRN SX-448219 at 53 hours without final status determination | Telemetry | MOON follow-up and status compliance exposure | UR review with hospitalist by 08:30; confirm inpatient conversion or discharge plan | UR RN Lead + Hospitalist 3 | 08:30 |
| Two high-volume orthopedic cases expected to require overnight admission | OR / PCU | Post-op bed mismatch this afternoon | Defer one elective joint case if PCU census remains full at 11:00 | OR Director + COO | 11:00 |

## Surge Actions Activated
- Discharge lounge open at 08:00 with six chairs staffed by one RN and one transporter.
- Four surge beds activated: two PACU critical care capable beds and two med/surg flex beds on 3 East.
- Elective admissions under review; one orthopedic overnight case and one elective EP admission placed on contingency list.
- Elective surgeries requiring post-op inpatient placement subject to 11:00 reassessment.
- ED diversion not activated as of 07:15; reassess with regional EMS if boarding exceeds 12 patients or ICU transfers remain unresolved at 10:00.
- Additional staffing called in: 4 RN shifts, 2 EVS shifts, 1 patient transport shift.

## Operational Notes
- Midnight census was 201 against 216 staffed beds, placing the hospital at 93.1% staffed-bed occupancy before morning admissions.
- Respiratory viral volume is driving med/surg and ICU demand; 14 inpatients are on droplet isolation and 5 on airborne precautions.
- Transfer center logged 11 inbound requests in the last 24 hours, accepted 9, and declined 2 due to no staffed ICU bed; all declines were escalated and documented with contemporaneous bed board screenshots.
- Observation census includes 5 Medicare beneficiaries beyond 24 hours; MOON delivery audit completed overnight with one signature refusal documented by patient representative.
- Focus for morning huddle: discharge execution by 11:00, ICU decompression, and room turnover acceleration on 4 North, 5 West, and Telemetry South.

## Regulatory / Source Notes
- Surge space activation follows the hospital emergency operations framework aligned to 42 CFR 482.15.
- Nursing coverage validation for flex beds follows staffing adequacy expectations under 42 CFR 482.23.
- Overflow areas may not be used unless physical environment and life-safety conditions remain compliant with 42 CFR 482.41.
- Transfer acceptance and decline documentation reviewed against EMTALA obligations under 42 CFR 489.24.
- Observation notice timing reviewed against the MOON requirement under 42 USC 1395cc(a)(1)(Y).
