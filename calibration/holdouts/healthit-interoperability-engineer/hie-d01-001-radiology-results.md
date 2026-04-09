---
holdout_id: hie-ho-001
agent_slug: healthit-interoperability-engineer
agents_relevant:
  - healthit-interoperability-engineer
deliverable_id: hie-d01
deliverable_title: Interface Specification Document
seed_ref: hie-seed-001
scenario_summary: Outpatient imaging order and final report exchange between a hospital RIS and an ambulatory EHR
complexity: high
regulatory_as_of: 2026-04-01
source_basis:
  - HL7v2.5.1
  - LOINC
  - SNOMED CT
  - 45 CFR 164.312
generated_by: opus-4.6
reviewed_by: human
review_status: reviewed
review_date: 2026-04-09
frozen: true
superseded_by: null
retirement_trigger: Annual interface standard refresh or RIS replacement
expectations:
  - Document the bidirectional order and result flow with stable accession handling.
  - Map the radiology result identifiers to a maintained LOINC crosswalk.
  - Call out duplicate control, amendment handling, and queue alerting.
  - Include transport security, acknowledgment behavior, and SLA targets.
---

# Interface Specification

Interface Name: Radiology orders and final reports exchange
Interface ID: HIE-RAD-2026-001
Standard: HL7v2.5.1
Message Type: ORM^O01 and ORU^R01
Direction: Bidirectional
Source System: Silver Pine Imaging RIS 6.2
Destination System: Meridian Health Epic 2026.1
Interface Engine: Mirth Connect 4.5
Transport: MLLP over TLS 1.2
Encryption: Mutual TLS with signed certificates and interface engine log encryption

## Message Flow
Radiology order entry moves from the RIS into the interface engine, then to accessioning and destination routing. Final report messages return through the same engine path so amended interpretations preserve accession identity and patient context.

## Trigger Events
| Event | Description | Expected Volume |
|---|---|---|
| ORM^O01 | New outpatient imaging order | 180 per day |
| ORU^R01 | Final radiology report | 180 per day |
| ORU^R01 with correction | Amended report after radiologist review | 8 per day |

## Segment Mapping
| Segment.Field | Source Element | Transformation | Destination Element | Notes |
|---|---|---|---|---|
| MSH-3 | RIS sending application | Static sending application value | MSH-3 | Stable interface identity |
| PID-3 | Patient medical record number | Pass through local enterprise identifier | PID-3 | Identifier type remains MR |
| OBR-2 | Order placer number | Preserve accession number | OBR-2 | Order and result share accession identity |
| OBR-4 | Radiology procedure code | Crosswalk to LOINC where available | OBR-4 | No local display code leakage |
| OBX-3 | Report finding code | Crosswalk to standard code or constrained local code set | OBX-3 | Crosswalk maintenance required |
| OBX-5 | Narrative finding | Pass through with character normalization | OBX-5 | Preserve radiologist wording |
| NTE-3 | Result comment | Pass through free text | NTE-3 | Use only for supplemental comment content |

## Code Table Crosswalks
| Source Code | Source Description | Destination Code | Destination Description |
|---|---|---|---|
| RAD-HEAD-1V | Skull radiograph one view | 24627-2 | XR Skull single view |
| RAD-CHEST-2V | Chest radiograph two views | 30747-2 | XR Chest two views |
| RAD-LUMBAR-4V | Lumbar spine four views | 72100-5 | XR Lumbar spine complete |

## Error Handling
| Error Type | Detection | Response | Escalation |
|---|---|---|---|
| Duplicate accession | Same accession arrives twice | Quarantine the second message and alert | Interface analyst |
| Parse failure | Segment length or delimiter error | Reject message and preserve raw payload | Interface team on call |
| Code not mapped | Crosswalk miss on OBR-4 or OBX-3 | Map to constrained fallback and flag | Analyst review within 24 hours |
| ACK timeout | No MSA response within timeout window | Retry three times then queue | Interface team on call |

## SLA
- Message latency under 5 minutes from final signoff to destination receipt.
- Availability at 99.9 percent monthly uptime.
- Error rate under 0.1 percent of daily volume.
- Support coverage for radiology go-live and first week stabilization.

## Regulatory Notes
HL7v2.5.1, LOINC, 45 CFR 164.312, and HIPAA audit logging apply. Radiology routing should preserve traceability for amendments and support post-go-live review.
