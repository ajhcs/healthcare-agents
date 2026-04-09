---
exemplar_id: hie-ex-004
agent_slug: healthit-interoperability-engineer
agents_relevant:
  - healthit-interoperability-engineer
deliverable_id: hie-d02
deliverable_title: FHIR API Integration Checklist
scenario_summary: Standalone patient access app for medication lists, allergies, and recent lab results
complexity: moderate
mcp_servers_relevant:
  - provider_directory
  - current_regulatory_policy
regulatory_as_of: 2026-04-01
source_basis:
  - FHIR R4
  - US Core IG v6.1.0
  - SMART App Launch v2.0
  - 45 CFR Part 171
generated_by: sonnet-4.6
reviewed_by: human
review_status: reviewed
review_date: 2026-04-09
---

# FHIR API Integration Checklist

**Application Name**: Patient access companion app
**FHIR Server**: Harborview Health FHIR R4 5.2
**FHIR Version**: R4 4.0.1
**Implementation Guide**: US Core IG v6.1.0
**Launch Type**: Standalone Launch

## Authorization
- SMART on FHIR App Launch v2.0 configured for patient sign in.
- OAuth 2.0 client registered with a redirect URI and refresh token support.
- Scopes limited to read only patient access.
- Token refresh and logout behavior tested.
- OpenID and FHIR user identity claims validated during launch.

## Resources Required
| FHIR Resource | Operations | Search Parameters | US Core Profile |
|---|---|---|---|
| Patient | read, search | name, birthdate, identifier | US Core Patient |
| Observation | read, search | code, date, category | US Core Observation |
| MedicationRequest | read, search | status, intent, patient | US Core MedicationRequest |
| AllergyIntolerance | read, search | patient, clinical-status | US Core AllergyIntolerance |
| Condition | read, search | patient, code | US Core Condition |

## Testing
- Sandbox patients loaded with realistic medication and allergy history.
- Search and profile validation confirmed against the capability statement.
- Error handling verified for 401, 403, 404, and 429 responses.
- Pagination tested with multiple lab result pages.
- Accessibility review completed for the patient-facing screens.

## Compliance
- USCDI data elements mapped to FHIR resources.
- Terminology bindings verified for SNOMED CT, LOINC, RxNorm, and ICD-10-CM.
- Consent and patient identity workflow reviewed.
- Information blocking obligations reviewed under 45 CFR Part 171.
- Audit logging enabled for every access request.

## Regulatory Notes
FHIR R4, US Core IG v6.1.0, SMART App Launch v2.0, and 45 CFR Part 171 apply. The app remains read only and should not request unnecessary write scopes.
