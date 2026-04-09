---
holdout_id: hea-d01-holdout-02-caboodle-sprint-access-dashboard-holdout
agent_slug: healthit-epic-applications-analyst
agents_relevant:
- healthit-epic-applications-analyst
deliverable_id: hea-d01
deliverable_title: Epic Build Change Request
seed_ref: healthit-epic-applications-analyst/hea-d01-seed-02-caboodle-sprint-access-dashboard-holdout.yaml
scenario_summary: Requests a reporting-oriented Epic build change to preserve Caboodle
  access dashboard accuracy after a Sprint update alters scheduling source behavior.
complexity: routine
regulatory_as_of: '2026-04-09'
source_basis:
- 'Epic on FHIR public implementation overview: https://fhir.epic.com/'
- 'ONC certification program overview and health IT interoperability resources: https://www.healthit.gov/topic/certification-ehrs/about-onc-health-it-certification-program'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Treat the request as an Epic build change, not a generic BI ticket.
- Specify both source-system and downstream reporting effects.
- Keep the testing plan anchored in POC and MST rather than describing ad hoc validation.
- Explain why the change belongs to Caboodle/Cogito governance and not only to operational
  reporting.
---

# Epic Build Change Request

**Request ID**: SYN-CHG-2604-205
**Application**: Cadence / Caboodle / Cogito
**Requested By**: Briar Vale, Access Analytics
**Priority**: Standard
**Target Date**: 2026-05-13

## Description
Reconcile scheduling event build and downstream analytics logic after a Sprint update changed reschedule event sequencing, causing weekly access dashboards to overcount completed rebooks for Pulmonology DEP 61102 and Rheumatology DEP 61108.

## Clinical/Business Justification
Access leadership uses the rebook metric to evaluate patient access, template utilization, and call-center performance. Inflated counts distort operational decisions, weaken confidence in Cogito reporting, and create avoidable rework when clinic managers compare dashboard totals to scheduling workbench output. The requested change should restore alignment between source Cadence activity and Caboodle-derived reporting without introducing unsupported dashboard-only workarounds.

## Build Specification

### Records Affected
| Record Type | Record ID | Current Config | Proposed Change |
|-------------|-----------|----------------|-----------------|
| DEP | DEP 61102 | Pulmonology event stream inherits post-Sprint reschedule sequencing | Review and adjust source event handling for affected scheduling workflow |
| DEP | DEP 61108 | Rheumatology event stream inherits same sequencing behavior | Apply matched remediation to preserve cross-clinic consistency |
| Reporting Rule | COG-ACC-314 | Weekly rebook logic counts revised event pair as two completed actions | Update analytics logic to count true completed rebook once per appointment chain |
| INI | INI CAD 188 | Current scheduling event behavior reflects new Sprint default | Review whether default should remain or be locally overridden for source alignment |

### Downstream Impact
- Orders: None. No order-entry workflows are involved.
- Clinical Documentation: None. Scheduling metric logic does not alter encounter filing or note content.
- Revenue Cycle (PB/HB): Low impact. Access analytics change does not alter claim generation, but inaccurate completed-visit forecasting affects operational planning.
- Interfaces (Bridges): Possible low impact. Confirm reminder and downstream scheduling event feeds are not using the same event sequence assumption.
- Reporting (Caboodle/Clarity): Direct impact. Weekly access dashboards, trend extracts, and any dependent executive summaries require reconciliation.
- MyChart: Low impact. Self-scheduling behavior is not changing, but patient-generated rebooks should be included correctly in reporting counts.

### Testing Plan
| Test Scenario | Environment | Tester | Expected Result |
|--------------|-------------|--------|-----------------|
| Staff reschedules specialty visit once within same department | POC | N. Soren, Cadence Analyst | Source event chain resolves to one completed rebook outcome |
| Patient rebooks through MyChart after cancellation | POC | N. Soren, Cadence Analyst | Source event captured correctly and available for downstream analytics |
| Weekly dashboard refresh after revised event logic | MST | B. Vale, Access Analytics | Pulmonology and Rheumatology totals reconcile to source scheduling sample |
| Clarity versus Caboodle comparison for sampled appointment chains | MST | R. Fenn, Cogito Analyst | Event counts align for tested rebook scenarios |
| Reminder-vendor feed validation for rescheduled appointments | MST | S. Ilar, Interface Analyst | Downstream scheduling feed remains accepted and semantically correct |

## Approval
- Application team lead: Access applications review scheduled for 2026-04-17
- Clinical informaticist: Not required; no clinical workflow change
- Revenue cycle: Informational review only
- Governance committee: Cogito reporting governance approval required before PRD promotion
