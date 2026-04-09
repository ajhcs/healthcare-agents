---
holdout_id: pmm-d02-holdout-01-granite-hollow-hospital-survey-recovery
agent_slug: payer-medicare-medicaid-specialist
agents_relevant:
- payer-medicare-medicaid-specialist
deliverable_id: pmm-d02
deliverable_title: Conditions of Participation Readiness Assessment
seed_ref: payer-medicare-medicaid-specialist/pmm-d02-seed-01-granite-hollow-hospital-survey-recovery.yaml
scenario_summary: Draft readiness assessment for a fictional hospital addressing recent
  infection prevention and patient rights findings ahead of a return survey.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR Part 482
- CMS State Operations Manual, Appendix A
- CMS hospital survey and certification guidance
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Use the hospital CoP table structure from the prompt and populate all listed sections.
- Reflect a realistic mix of compliant, caution, and deficient findings with infection
  prevention carrying the highest operational risk.
- Tie the narrative to return-survey readiness rather than a generic compliance memo.
- Show concrete remediation in the High-Risk Areas table with named operational focus
  areas.
---

# CMS Conditions of Participation — Readiness Assessment

**Facility**: Granite Hollow Regional Hospital
**CMS Certification Number (CCN)**: 22A615
**Facility Type**: Hospital
**Assessment Date**: 2026-04-09
**Last CMS Survey Date**: 2026-01-21
**Accrediting Organization**: TJC

## CoP Compliance Status (Hospital — 42 CFR Part 482)
| CoP Section | Tag Range | Status | Findings | Risk |
|-------------|-----------|--------|----------|------|
| 482.12 Governing Body | A-0043–A-0084 | ⚠️ | Board oversight structure is active, but February quality materials did not document follow-up on previously assigned corrective actions. | Moderate |
| 482.13 Patient Rights | A-0115–A-0214 | ⚠️ | Grievance intake process is centralized; retention of final closure notices and escalation steps was incomplete in sampled files. | High |
| 482.21 QAPI | A-0263–A-0315 | ⚠️ | Falls and ED throughput projects are underway, though evidence of sustained validation and leadership escalation is not uniform. | High |
| 482.22 Medical Staff | A-0338–A-0363 | ✅ | Credentialing files, bylaws, and committee minutes support organized staff accountability. | Low |
| 482.23 Nursing Services | A-0385–A-0411 | ✅ | Staffing plans and charge nurse oversight records were current on sampled inpatient units. | Low |
| 482.24 Medical Records | A-0431–A-0469 | ⚠️ | Delinquent authentication rates improved since January, but late completion risk remains if manual tracking continues. | Moderate |
| 482.25 Pharmaceutical Svcs | A-0489–A-0515 | ✅ | Medication security and controlled-substance accountability audits were current in the reviewed sample. | Low |
| 482.41 Physical Environment | A-0700–A-0726 | ✅ | Environment of care rounds and generator testing logs support stable compliance. | Low |
| 482.42 Infection Prevention | A-0747–A-0772 | ❌ | Isolation signage, unit audit follow-through, and leadership-level trending remain the most significant readiness gap. | High |
| 482.43 Discharge Planning | A-0799–A-0843 | ⚠️ | Case management assessments are timely, but patient choice documentation for post-acute referrals is not consistently visible in the chart. | Moderate |

## High-Risk Areas
| Area | Current State | Gap | Remediation Plan |
|------|--------------|-----|-----------------|
| Infection prevention escalation | Audits occur weekly on high-volume units | Audit results are not always tied to corrective owner and recheck date | Create unit corrective-action log with infection prevention review at each weekly huddle and monthly QAPI escalation |
| Grievance closure evidence | Patient relations maintains a case tracker | Final response letters and communication logs are not consistently retained together | Standardize electronic case file retention and run weekly case closure audit |
| Delinquent record completion | HIM sends provider reminders and tracks aging | Escalation depends on manual follow-up and may fail during leave coverage | Add automated aging report review with department chair escalation at fixed thresholds |
| Governing body follow-through | Board reviews quality dashboard monthly | Assigned actions are not always closed in board minutes | Add standing action-status appendix to each board quality packet |

## Survey Preparedness Score: 74/100
