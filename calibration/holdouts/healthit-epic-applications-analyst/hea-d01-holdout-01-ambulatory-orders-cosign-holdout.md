---
holdout_id: hea-d01-holdout-01-ambulatory-orders-cosign-holdout
agent_slug: healthit-epic-applications-analyst
agents_relevant:
- healthit-epic-applications-analyst
deliverable_id: hea-d01
deliverable_title: Epic Build Change Request
seed_ref: healthit-epic-applications-analyst/hea-d01-seed-01-ambulatory-orders-cosign-holdout.yaml
scenario_summary: Proposes an Orders and Clinical Documentation change to tighten
  verbal-order cosign workflow for a synthetic multispecialty ambulatory group.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- 'CMS State Operations Manual interpretive guidance for medical records: https://www.cms.gov/regulations-and-guidance/guidance/transmittals/downloads/r37soma.pdf'
- 'CMS diagnostic test signature requirements education resource: https://www.cms.gov/outreach-and-education/medicare-learning-network-mln/mlnproducts/fast-facts/diagnostic-tests'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Name concrete record types that would likely be touched in an Epic orders or cosign
  workflow.
- Show downstream impact on clinical documentation and reporting, not just orders.
- Include test scenarios that distinguish verbal orders, standing orders, and electronically
  signed direct-entry orders.
- Keep the change within supported build governance and avoid production-direct shortcuts.
---

# Epic Build Change Request

**Request ID**: SYN-CHG-2604-181
**Application**: Orders / Clinical Documentation
**Requested By**: Eamon Thurl, Ambulatory Compliance
**Priority**: Urgent
**Target Date**: 2026-04-29

## Description
Strengthen verbal-order cosign routing for imaging and infusion workflows at Juniper Ridge Medical Group so nursing-entered verbal orders route to the correct authorizing provider queue, escalate before the 48-hour policy threshold, and remain visible on operational monitoring.

## Clinical/Business Justification
Compliance review identified delayed authentication of verbal orders across four infusion departments and two imaging centers. The requested change is intended to reduce unsigned-order risk, support a complete legal medical record, and improve staff follow-up before claims, disclosures, or surveys expose missing provider authentication.

## Build Specification

### Records Affected
| Record Type | Record ID | Current Config | Proposed Change |
|-------------|-----------|----------------|-----------------|
| Order Record | ORD-RTE-442 | Verbal order routing follows generic ordering provider assignment | Update routing to use authorizing provider and covering-provider logic for affected workflows |
| SER | SER 776201 | Covering provider relationship not consistently referenced in escalation routing | Apply service-specific routing for imaging and infusion covering pools |
| INI | INI ORD 214 | Escalation timing does not create earlier analyst-visible monitoring state | Adjust threshold handling so overdue verbal orders surface before policy breach |
| Documentation Rule | DOC-COS-071 | Current note filing does not clearly display pending cosign state in workflow summary | Add status visibility for clinical staff and compliance follow-up |

### Downstream Impact
- Orders: Direct impact. Verbal and telephone order routing, escalation, and provider workqueue visibility will change.
- Clinical Documentation: Moderate impact. Pending-authentication state will be easier to identify in associated workflow summaries and note review.
- Revenue Cycle (PB/HB): Low impact. No charge logic changes, but improved authentication should reduce documentation-related denials.
- Interfaces (Bridges): Low impact. Validate that outbound results and document references are unaffected by revised pending-authentication state.
- Reporting (Caboodle/Clarity): Direct impact. Unsigned-order compliance reporting must capture revised routing and escalation states.
- MyChart: None expected. Patient-facing result and order display rules are not part of this request.

### Testing Plan
| Test Scenario | Environment | Tester | Expected Result |
|--------------|-------------|--------|-----------------|
| Nurse enters verbal infusion order for attending physician on service | POC | K. Sable, Orders Analyst | Order routes to correct authorizing provider queue and tracks pending cosign status |
| Imaging verbal order entered during covering-provider session | POC | K. Sable, Orders Analyst | Covering provider receives task per service-specific routing rule |
| Direct-entry electronically signed order by physician | MST | H. Lark, Clinical Informaticist | No cosign task created and no regression to standard workflow |
| Standing order workflow for infusion protocol renewal | MST | P. Rowe, Infusion Lead | Renewal follows approved routing without false overdue escalation |
| Unsigned-order monitoring report after revised routing | MST | J. Fenn, Cogito Analyst | Report counts pending and overdue items consistently with source workqueue state |

## Approval
- Application team lead: Pending ambulatory applications review on 2026-04-15
- Clinical informaticist: Required from ambulatory nursing informatics and imaging operations
- Revenue cycle: Review requested for denial-prevention impact only
- Governance committee: Ambulatory compliance and change advisory review required before promotion
