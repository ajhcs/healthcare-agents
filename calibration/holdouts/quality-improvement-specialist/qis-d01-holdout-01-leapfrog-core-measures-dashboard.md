---
holdout_id: qis-d01-holdout-01-leapfrog-core-measures-dashboard
agent_slug: quality-improvement-specialist
agents_relevant:
- quality-improvement-specialist
deliverable_id: qis-d01
deliverable_title: Quality Measure Performance Dashboard
seed_ref: quality-improvement-specialist/qis-d01-seed-01-leapfrog-core-measures-dashboard.yaml
scenario_summary: A hospital quality dashboard combines inpatient reporting pressure,
  safety indicators, and abstraction operations for leadership review.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 'Leapfrog Hospital Survey materials: https://www.leapfroggroup.org/survey-materials'
- 'QualityNet quality reporting resources: https://qualitynet.cms.gov/'
- 'CMS Care Compare and hospital quality resources: https://www.cms.gov/medicare/quality'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Use the exact dashboard structure from the deliverable template with completed synthetic
  values.
- Show both underperforming and sustaining measures, with operational root causes
  tied to abstraction, workflow, or reporting.
- Include data quality notes that reflect hospital reporting realities such as abstraction
  backlog, claims lag, validation risk, or interface issues.
- Keep the tone executive-facing and operational rather than academic.
---

# Quality Measure Performance Dashboard

**Organization**: Northlake Ember Medical Center
**Product Line / Reporting Program**: Hospital Inpatient Quality Reporting / Leapfrog readiness review
**Measurement Year**: 2025
**Report Date**: 2026-04-09
**Prepared By**: Mira Solen, RN, CPHQ

## Performance Summary
| Measure ID | Measure Name | Denominator | Numerator | Rate | Benchmark (50th) | Benchmark (90th) | Trend vs PY | Gap to Goal |
|------------|-------------|-------------|-----------|------|------------------|------------------|-------------|-------------|
| SEP-1 | Severe Sepsis and Septic Shock Management Bundle | 214 eligible cases | 127 compliant cases | 59.3% |  |  |  |  |
| ED-2 | Admit Decision Time to ED Departure for Admitted Patients | 6,482 ED admits |  | 312 minutes median |  |  |  |  |
| CLABSI | Central Line-Associated Bloodstream Infection SIR | 18,640 line days | 14 observed events | 0.76 SIR |  |  |  |  |
| HCAHPS-CC | Care Transition composite | 1,146 completed surveys | 612 top-box responses | 53.4% |  |  |  |  |
| PC-02 | Cesarean Birth | 1,022 nulliparous term singleton vertex deliveries | 287 cesarean deliveries | 28.1% |  |  |  |  |
| IMM-2 | Influenza Immunization | 3,904 eligible discharges | 3,542 vaccinated or documented | 90.7% |  |  |  |  |

## Measures Below Benchmark
| Measure | Current Rate | Target Rate | Gap | Root Cause | Improvement Action | Owner | Timeline |
|---------|-------------|-------------|-----|------------|-------------------|-------|----------|
| SEP-1 | 59.3% | 72.0% | 12.7 pts | Bundle failures clustered in antibiotic timing and repeat lactate documentation | Daily sepsis miss review, ED pharmacist alert, and abstraction feedback loop to hospitalists | Director of Quality Measurement | 60 days |
| ED-2 | 312 minutes median | 250 minutes median | 62 minutes | Bed assignment delays and discharge order lag on two medicine units | Add noon discharge huddle, inpatient bed escalation trigger, and ED boarding command review | VP, Patient Flow | 45 days |
| HCAHPS-CC | 53.4% | 60.0% | 6.6 pts | Discharge education inconsistent and follow-up call script not used on weekends | Standard discharge teach-back checklist and seven-day callback expansion | Director, Patient Experience | 75 days |
| PC-02 | 28.1% | 24.0% | 4.1 pts | Provider variation in labor management for low-risk first births | OB peer review and labor support pathway refresh | Chair, Women's Services | 90 days |

## Measures At or Above Benchmark
| Measure | Current Rate | Benchmark Percentile | Sustain Strategy |
|---------|-------------|---------------------|-----------------|
| CLABSI | 0.76 SIR |  | Sustain central line rounding, dressing audit, and insertion checklist review |
| IMM-2 | 90.7% |  | Preserve nurse-driven vaccination protocol and daily discharge exception report |

## Data Quality Notes
- Claims lag status: Final coded discharge file is 11 days behind month end close.
- Supplemental data feeds: ADT and lab interfaces are active; bedside nursing checklist extract for sepsis timestamps needs reconciliation.
- Medical record chase status: Chart abstraction backlog is 9% for current inpatient quality sample.
- Known data quality issues: ED provider note timestamps differ from medication administration time on 17 sepsis cases under secondary review.
- Validation sensitivity: PC-02 case list should be rechecked against delivery coding edits before external presentation.
- Operational signal: CLABSI improvement appears durable, while SEP-1 and ED-2 require weekly executive oversight rather than monthly review.
