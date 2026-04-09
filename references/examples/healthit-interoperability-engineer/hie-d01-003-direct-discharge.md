---
exemplar_id: hie-ex-003
agent_slug: healthit-interoperability-engineer
agents_relevant:
  - healthit-interoperability-engineer
deliverable_id: hie-d01
deliverable_title: Interface Specification Document
scenario_summary: Hospital discharge summary exchange to a community PCP using Direct messaging and Carequality document retrieval
complexity: high
mcp_servers_relevant:
  - provider_directory
  - current_regulatory_policy
regulatory_as_of: 2026-04-01
source_basis:
  - C-CDA R2.1
  - DirectTrust
  - Carequality
  - 45 CFR 164.312
generated_by: sonnet-4.6
reviewed_by: human
review_status: reviewed
review_date: 2026-04-09
---

# Interface Specification

**Interface Name**: Discharge summary and referral document exchange
**Interface ID**: HIE-DOC-2026-003
**Standard**: C-CDA R2.1 and DirectTrust transport
**Message Type**: CCD, discharge summary, and referral note
**Direction**: Bidirectional
**Source System**: Lakeside Hospital Epic 2026.1
**Destination System**: Community PCP portal and external HIE
**Interface Engine**: Cloverleaf 20.1
**Transport**: Direct secure messaging plus document query via Carequality
**Encryption**: S/MIME with TLS 1.2 for query channels

## Message Flow
The hospital composes the discharge summary, transmits the document to the primary care destination, and publishes the same packet for document discovery through the HIE exchange layer. This keeps transitions of care aligned across point to point and query based exchange.

## Trigger Events
| Event | Description | Expected Volume |
|---|---|---|
| Discharge summary ready | Patient leaves inpatient care | 95 per day |
| Referral note complete | PCP handoff packet prepared | 95 per day |
| Document query response | External retrieval of CCD packet | 40 per day |

## Segment Mapping
| Segment.Field | Source Element | Transformation | Destination Element | Notes |
|---|---|---|---|---|
| Document header | Patient demographics and encounter metadata | Normalize to C-CDA header rules | CCD header | Preserve custodian and author |
| Problem section | Active diagnoses | Map to structured problem list | 11450-4 section | LOINC section identifier |
| Medications section | Discharge medication list | Preserve RxNorm codes and sig text | 10160-0 section | Medication reconciliation use |
| Results section | Final inpatient results | Pass through with result dates | 30954-2 section | Include critical findings |
| Plan of care section | Follow-up instructions | Keep narrative and structured tasks | 18776-5 section | Transition of care use |

## Code Table Crosswalks
| Source Code | Source Description | Destination Code | Destination Description |
|---|---|---|---|
| CCD-DISCHARGE | Hospital discharge summary | 18842-5 | Discharge summary section |
| CCD-MEDLIST | Medication list | 10160-0 | History of medication use |
| CCD-PLAN | Care plan | 18776-5 | Plan of care section |

## Error Handling
| Error Type | Detection | Response | Escalation |
|---|---|---|---|
| Document loss | Direct bounce or no acknowledgment | Quarantine and resend after review | Interface team on call |
| Patient mismatch | Demographic match failure | Hold query response and verify identity | HIM analyst |
| Consent gap | Retrieval blocked by exchange policy | Pause delivery and request privacy review | Privacy lead |
| ACK timeout | No response from destination | Retry then queue | Interface analyst |

## SLA
- Discharge packet latency under 15 minutes.
- Availability at 99.5 percent monthly uptime.
- Error rate under 0.5 percent of daily volume.
- Support coverage during discharge hours and the first week after cutover.

## Regulatory Notes
C-CDA R2.1, DirectTrust, Carequality, and 45 CFR 164.312 apply. The exchange path should preserve discharge content, patient matching, and transition traceability.
