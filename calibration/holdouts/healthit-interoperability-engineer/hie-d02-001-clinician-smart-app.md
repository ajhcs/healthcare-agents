---
holdout_id: hie-ho-004
agent_slug: healthit-interoperability-engineer
agents_relevant:
  - healthit-interoperability-engineer
deliverable_id: hie-d02
deliverable_title: FHIR API Integration Checklist
seed_ref: hie-seed-004
scenario_summary: EHR-launched clinician chart review app for an ambulatory cardiology practice
complexity: moderate
regulatory_as_of: 2026-04-01
source_basis:
  - FHIR R4
  - US Core IG v6.1.0
  - SMART App Launch v2.0
  - 45 CFR Part 171
generated_by: opus-4.6
reviewed_by: human
review_status: reviewed
review_date: 2026-04-09
frozen: true
superseded_by: null
retirement_trigger: EHR vendor change or SMART launch policy update
expectations:
  - List the required SMART launch and OAuth items for a read only clinician app.
  - Tie the resource set to the cardiology chart review use case.
  - Confirm search and profile testing for US Core resources.
  - Include access logging, refresh logic, and information blocking review.
---

# FHIR API Integration Checklist

Application Name: Cardiology chart review app
FHIR Server: Meridian Health FHIR R4 5.2
FHIR Version: R4 4.0.1
Implementation Guide: US Core IG v6.1.0
Launch Type: EHR Launch

## Authorization
- SMART on FHIR App Launch v2.0 configured for launched clinician sessions.
- OAuth 2.0 client registration completed with redirect URI, client identifier, and refresh strategy.
- Scopes limited to read only access for the chart review workflow.
- Token refresh path tested for expired session recovery.
- Backend service authorization not requested because the workflow is clinician launched and user scoped.

## Resources Required
| FHIR Resource | Operations | Search Parameters | US Core Profile |
|---|---|---|---|
| Patient | read, search | name, birthdate, identifier | US Core Patient |
| Encounter | read, search | patient, date, status | US Core Encounter |
| Observation | read, search | code, category, date | US Core Observation |
| MedicationRequest | read, search | patient, status, intent | US Core MedicationRequest |
| AllergyIntolerance | read, search | patient, clinical-status | US Core AllergyIntolerance |
| Condition | read, search | patient, code, category | US Core Condition |

## Testing
- Sandbox environment configured with representative cardiology test patients.
- Search results validated against the server capability statement.
- Authorization failures verified for 401, 403, 404, and 429 responses.
- Pagination and token refresh behavior tested with long patient lists.
- Rendering checked for missing Encounter context and empty Observation panels.

## Compliance
- USCDI data elements mapped to FHIR resources.
- Terminology bindings verified for SNOMED CT, LOINC, RxNorm, and ICD-10-CM.
- Patient consent and clinician authorization workflow reviewed.
- Information blocking obligations reviewed under 45 CFR Part 171.
- Audit logging enabled for every API access path.

## Regulatory Notes
FHIR R4, US Core IG v6.1.0, SMART App Launch v2.0, and 45 CFR Part 171 apply. The checklist should remain read only and aligned to the exact scope the EHR launch allows.
