---
exemplar_id: hie-ex-001
agent_slug: healthit-interoperability-engineer
agents_relevant:
  - healthit-interoperability-engineer
deliverable_id: hie-d01
deliverable_title: Interface Specification Document
scenario_summary: Reference lab result delivery to an ambulatory Epic environment with reflex correction handling
complexity: high
mcp_servers_relevant:
  - provider_directory
  - current_regulatory_policy
regulatory_as_of: 2026-04-01
source_basis:
  - HL7v2.5.1
  - LOINC
  - SNOMED CT
  - 45 CFR 164.312
generated_by: sonnet-4.6
reviewed_by: human
review_status: reviewed
review_date: 2026-04-09
---

# Interface Specification

**Interface Name**: Reference lab results to ambulatory EHR
**Interface ID**: HIE-LAB-2026-001
**Standard**: HL7v2.5.1
**Message Type**: ORU^R01 and ORM^O01
**Direction**: Bidirectional
**Source System**: North Valley Diagnostics LIS 8.4
**Destination System**: Meridian Health Epic 2026.1
**Interface Engine**: Mirth Connect 4.5
**Transport**: MLLP over TLS 1.2
**Encryption**: Mutual TLS with secured engine logs

## Message Flow
Orders originate in the ambulatory EHR, route to the lab, and return as final and corrected results. The interface preserves accession identity through the entire lifecycle so corrected reports do not create duplicate chart artifacts.

## Trigger Events
| Event | Description | Expected Volume |
|---|---|---|
| ORM^O01 | Routine lab order | 520 per day |
| ORU^R01 | Final lab result | 520 per day |
| ORU^R01 correction | Corrected result after lab review | 22 per day |

## Segment Mapping
| Segment.Field | Source Element | Transformation | Destination Element | Notes |
|---|---|---|---|---|
| MSH-3 | LIS sending application | Static sender name | MSH-3 | Stable interface identity |
| PID-3 | Patient medical record number | Pass through enterprise identifier | PID-3 | Match type stays MR |
| OBR-4 | Lab test code | Crosswalk to LOINC | OBR-4 | Maintained by lab analysts |
| OBX-3 | Result code | Crosswalk to LOINC | OBX-3 | Preserve analyte identity |
| OBX-5 | Numeric or text result | Pass through with type validation | OBX-5 | Respect OBX-2 value type |
| OBX-8 | Abnormal flag | Map to destination abnormal value set | OBX-8 | Keep critical flags visible |

## Code Table Crosswalks
| Source Code | Source Description | Destination Code | Destination Description |
|---|---|---|---|
| LAB-CBC-1 | Complete blood count | 57021-8 | CBC panel |
| LAB-A1C | Hemoglobin A1c | 4548-4 | Hemoglobin A1c/Hemoglobin.total in blood |
| LAB-BMP | Basic metabolic panel | 24323-8 | Basic metabolic panel panel |

## Error Handling
| Error Type | Detection | Response | Escalation |
|---|---|---|---|
| Duplicate result | Same message control ID arrives twice | Quarantine and alert | Interface analyst |
| Parse failure | Bad delimiter or truncated segment | Reject and preserve raw payload | Interface team on call |
| Code not mapped | LOINC crosswalk miss | Map to constrained fallback and flag | Analyst review within 24 hours |
| ACK timeout | No MSA response | Retry three times and queue | Interface team on call |

## SLA
- Final result latency under 5 minutes.
- Availability at 99.9 percent monthly uptime.
- Error rate under 0.1 percent of daily traffic.
- Go-live support for the first 100 production messages and stabilization week.

## Regulatory Notes
HL7v2.5.1, LOINC, SNOMED CT, and 45 CFR 164.312 apply. Result routing must preserve clinical traceability, audit logging, and correction handling.
