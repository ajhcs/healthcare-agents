---
exemplar_id: hea-d01-example-01-cadence-self-scheduling-dep-update
agent_slug: healthit-epic-applications-analyst
agents_relevant:
- healthit-epic-applications-analyst
deliverable_id: hea-d01
deliverable_title: Epic Build Change Request
scenario_summary: Adjusts Cadence department and encounter-type build to support limited
  MyChart self-scheduling for established dermatology follow-up visits.
complexity: routine
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 'ONC Cures Act Final Rule overview and information blocking resources: https://www.healthit.gov/topic/information-blocking'
- 'Epic on FHIR public implementation overview: https://fhir.epic.com/'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Epic Build Change Request

**Request ID**: SYN-CHG-2604-117
**Application**: Cadence / MyChart
**Requested By**: Mara Ivers, Ambulatory Operations
**Priority**: Standard
**Target Date**: 2026-05-01

## Description
Enable patient self-scheduling for established dermatology follow-up visits at Northwind Medical Center Dermatology, limited to return patients seen in the last 18 months and excluding procedure-linked visit types.

## Clinical/Business Justification
Dermatology schedulers are handling a high volume of low-complexity return bookings by phone. Moving eligible follow-up visits to MyChart self-scheduling is expected to reduce call burden, improve patient access, and preserve staff attention for prior authorization, urgent add-ons, and procedure coordination. The change stays within current portal release and access practices and does not expand access to new-patient or biopsy-related scheduling.

## Build Specification

### Records Affected
| Record Type | Record ID | Current Config | Proposed Change |
|-------------|-----------|----------------|-----------------|
| DEP | DEP 51042 | Department excluded from MyChart direct scheduling | Enable self-scheduling for approved return visit templates |
| EPT | EPT 2481 | Follow-up dermatology visit allowed only through staff scheduling | Permit MyChart scheduling for established patients with 30-minute slot length |
| SER | SER 884210 | Provider schedules inherit departmental default restrictions | Apply provider-level exception only to four dermatologists participating in phase 1 |
| INI | INI MYC 142 | Direct scheduling lookback window set to 12 months for specialty pilot | Increase lookback window to 18 months for this department group |

### Downstream Impact
- Orders: None. No ordering workflow is triggered by the scheduling change.
- Clinical Documentation: Low impact. Visit type mapping remains unchanged, so note templates and follow-up SmartTexts continue to file as today.
- Revenue Cycle (PB/HB): Low impact. Encounter type remains tied to existing professional billing logic and copay estimation rules.
- Interfaces (Bridges): None. SIU outbound message content and appointment status events are unchanged.
- Reporting (Caboodle/Clarity): Moderate impact. Existing access dashboards need a department filter update to separate self-scheduled versus staff-scheduled follow-ups.
- MyChart: Direct impact. Patients will see a new self-scheduling option with provider and slot restrictions.

### Testing Plan
| Test Scenario | Environment | Tester | Expected Result |
|--------------|-------------|--------|-----------------|
| Established patient schedules approved follow-up through MyChart | POC | L. Fenwick, Analyst | Slot appears, booking succeeds, visit files as dermatology return |
| New patient attempts same workflow | POC | L. Fenwick, Analyst | Visit type suppressed from self-scheduling options |
| Established patient outside 18-month lookback attempts booking | MST | Rowan Pike, Access Lead | Booking blocked with department-approved guidance text |
| Self-scheduled visit transmits standard SIU message to reminder vendor | MST | I. Vale, Interface Analyst | SIU outbound event unchanged and accepted by downstream vendor |
| Scheduled visit posts expected copay estimate in pre-visit workflow | MST | Dina Sol, PB Analyst | Copay estimate remains consistent with current return visit build |

## Approval
- Application team lead: Approved by S. Corbett on 2026-04-18
- Clinical informaticist: Approved by J. Halden on 2026-04-20
- Revenue cycle: Reviewed by P. Sorrell on 2026-04-21; no billing objection
- Governance committee: Departmental ambulatory governance approval scheduled for 2026-04-23
