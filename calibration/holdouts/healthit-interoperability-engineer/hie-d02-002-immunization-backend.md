---
holdout_id: hie-ho-005
agent_slug: healthit-interoperability-engineer
agents_relevant:
  - healthit-interoperability-engineer
deliverable_id: hie-d02
deliverable_title: FHIR API Integration Checklist
seed_ref: hie-seed-005
scenario_summary: Backend service for immunization registry submission from multiple clinic sites
complexity: high
regulatory_as_of: 2026-04-01
source_basis:
  - FHIR R4
  - HL7 Bulk Data Access IG
  - US Core IG v6.1.0
  - 45 CFR Part 170
generated_by: opus-4.6
reviewed_by: human
review_status: reviewed
review_date: 2026-04-09
frozen: true
superseded_by: null
retirement_trigger: Registry endpoint change or public health policy update
expectations:
  - Require system scoped authorization for the registry back end.
  - Describe the resource set for immunization submission and supporting reads.
  - Cover duplicate suppression and maintenance window behavior.
  - Include validation, retry, and logging controls for every submission.
---

# FHIR API Integration Checklist

Application Name: State immunization registry backend service
FHIR Server: North Star Public Health FHIR R4 5.2
FHIR Version: R4 4.0.1
Implementation Guide: HL7 Bulk Data Access IG
Launch Type: Backend Service

## Authorization
- SMART backend service authorization configured with system scoped access.
- Client registration completed with service account credentials and key rotation.
- Write scopes limited to Immunization while read scopes stay limited to supporting resources.
- Retry and token refresh behavior tested against registry maintenance windows.
- No patient interactive launch required because the workflow is server to server.

## Resources Required
| FHIR Resource | Operations | Search Parameters | US Core Profile |
|---|---|---|---|
| Patient | read, search | identifier, birthdate, name | US Core Patient |
| Immunization | create, update, search | patient, status, date | US Core Immunization |
| Observation | read, search | code, date, patient | US Core Observation |
| Organization | read, search | name, identifier | US Core Organization |

## Testing
- Duplicate suppression validated against repeat submissions for the same immunization event.
- Bulk export and submission validation run before each release.
- Token expiration and maintenance window retries verified in a nonproduction environment.
- Error responses checked for 401, 403, 404, 409, and 429 behavior.
- Registry payloads verified for CVX codes, patient identifiers, and stable submission metadata.

## Compliance
- USCDI data elements mapped to FHIR resources.
- Terminology bindings verified for CVX, SNOMED CT, and LOINC where supporting observations are used.
- Audit logging enabled for every submission path.
- Information blocking review completed under 45 CFR Part 171.

## Regulatory Notes
FHIR R4, HL7 Bulk Data Access IG, US Core IG v6.1.0, and 45 CFR Part 170 apply. The implementation must preserve idempotency, logging, and registry acceptance rules across site submissions.
