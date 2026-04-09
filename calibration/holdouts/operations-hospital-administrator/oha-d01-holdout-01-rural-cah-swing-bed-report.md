---
holdout_id: oha-d01-holdout-01-rural-cah-swing-bed-report
agent_slug: operations-hospital-administrator
agents_relevant:
- operations-hospital-administrator
deliverable_id: oha-d01
deliverable_title: Daily Capacity Report
seed_ref: operations-hospital-administrator/oha-d01-seed-01-rural-cah-swing-bed-report.yaml
scenario_summary: Daily capacity report for a synthetic critical access hospital balancing
  acute beds, swing-bed use, and 96-hour length-of-stay discipline.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- 'Critical Access Hospital conditions: 42 CFR 485.610, 42 CFR 485.618, 42 CFR 485.620,
  42 CFR 485.631, 42 CFR 485.645'
- 'CMS Emergency Preparedness requirements: 42 CFR 482.15 and CAH emergency preparedness
  crosswalk'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Distinguish clearly between total bed use, staffed acute capacity, and swing-bed
  occupancy within the 25-bed CAH limit.
- Show actionable escalation items tied to staffing, transfer timing, and rural transport
  constraints.
- Reflect CAH-specific operational discipline, including the 96-hour acute stay limit
  and 24/7 emergency readiness.
- Avoid big-medical-center language that ignores CAH scale.
---

# Daily Hospital Capacity Report

**Date**: 2026-04-09
**Time**: 06:40
**Prepared by**: Tessa Moore, Rural Hospital Administrator
**Capacity Status**: Orange

## Census Summary
| Unit | Licensed | Staffed | Occupied | Available | Pending Admits | Pending DC |
|------|----------|---------|----------|-----------|----------------|------------|
| Acute Inpatient | 15 | 15 | 14 | 1 | 3 | 4 |
| Swing-Bed Skilled Care | 10 | 10 | 6 | 4 | 0 | 2 |
| **TOTAL BEDS IN USE AGAINST CAH LIMIT** | **25** | **25** | **20** | **5** | **3** | **6** |

## Throughput Metrics (Rolling 24 Hours)
| Metric | Value | Target | Variance |
|--------|-------|--------|----------|
| Admissions | 5 | 4 | +1 |
| Discharges | 3 | 4 | -1 |
| Transfers In | 0 | 0 | on plan |
| Transfers Out | 1 | 2 | -1 |
| ED Boarding (hours) | 2.6 | < 4 hrs | within target |
| Discharge Before Noon % | 50% | > 40% | +10 pts |
| Bed Turnaround Time | 52 min | < 60 min | within target |
| Observation patients | 2 | 2 | on plan |
| Observation > 48 hrs | 0 | 0 | on plan |

## Escalation Items
| Issue | Unit | Impact | Action Required | Owner | ETA |
|-------|------|--------|-----------------|-------|-----|
| Sepsis patient requires tertiary ICU transfer; rotor transport delayed by weather | ED / Acute | Prolonged use of monitored acute bed and escalation risk | Maintain stabilization plan, confirm ground fallback, and recheck transfer transport window every 30 minutes | ED Medical Director + House Supervisor | 08:00 |
| One day-shift RN callout leaves limited acute staffing margin | Acute Inpatient | Only one acute bed remains operationally usable | Reassign charge coverage, call in per-diem RN, and hold one pending non-emergent direct admit until staffing confirmed | CNO Designee | 07:30 |
| Two swing-bed discharges depend on morning family transport from outlying county | Swing-Bed | Delayed bed release could constrain acute conversion options | Social services to confirm pickup and prepare meds and paperwork by 09:00 | Swing-Bed Coordinator | 09:00 |
| One observation patient at 22 hours awaiting repeat troponin and provider reassessment | ED Observation | Potential same-day conversion or discharge decision needed | Finalize workup before noon and avoid unnecessary overnight carryover | Hospitalist + ED Charge | 12:00 |

## Surge Actions Activated
- No formal surge beds opened; current plan preserves one acute bed for emergent local need.
- Elective direct admissions paused until RN coverage is confirmed.
- Mutual-aid transfer coordination active for one ICU-level patient.
- Additional staffing called in: one per-diem RN and one cross-trained aide.
- Incident command not activated; hospital remains in elevated monitoring status.

## Operational Notes
- Acute occupied beds and swing-bed occupied beds total 20, remaining within the 25-bed CAH limit.
- Thursday night volume exceeded the recent rural baseline due to influenza activity and one farm trauma admission.
- The hospital remains compliant with 24/7 emergency services coverage, but staffing is thin until the day-shift replacement is secured.
- Case review this afternoon will include all acute inpatients approaching the annual 96-hour length-of-stay control threshold.
- Primary huddle focus: tertiary transfer execution, staffing stabilization, and early discharge readiness for two swing-bed residents and two acute medical patients.

## Regulatory / Source Notes
- Bed-use planning reflects the CAH 25-bed limit under 42 CFR 485.620.
- Acute stay monitoring remains tied to the CAH 96-hour annual length-of-stay expectation under 42 CFR 485.620.
- On-call practitioner and nursing coverage controls remain aligned with 42 CFR 485.631.
- Emergency service continuity remains aligned with 42 CFR 485.618.
