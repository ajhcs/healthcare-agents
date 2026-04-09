---
holdout_id: hie-ho-003
agent_slug: healthit-interoperability-engineer
agents_relevant:
  - healthit-interoperability-engineer
deliverable_id: hie-d01
deliverable_title: Interface Specification Document
seed_ref: hie-seed-003
scenario_summary: Specialist referral scheduling and consult note exchange between a primary care clinic and an external specialty group
complexity: high
regulatory_as_of: 2026-04-01
source_basis:
  - HL7v2.5.1
  - C-CDA R2.1
  - DirectTrust
  - 45 CFR 164.312
generated_by: opus-4.6
reviewed_by: human
review_status: reviewed
review_date: 2026-04-09
frozen: true
superseded_by: null
retirement_trigger: Referral workflow redesign or HIE participant change
expectations:
  - Map referral scheduling events to the originating referral packet.
  - Describe the consult note exchange path over Direct messaging.
  - Include patient matching and consent behavior for document retrieval.
  - Define error handling for failed delivery and scheduling acknowledgments.
---

# Interface Specification

Interface Name: Specialist referral scheduling and consult exchange
Interface ID: HIE-REF-2026-001
Standard: HL7v2.5.1, C-CDA R2.1, and DirectTrust transport
Message Type: SIU^S12, SIU^S13, and C-CDA referral note exchange
Direction: Bidirectional
Source System: Summit Family Clinic Athena 2025.9
Destination System: North Shore Specialty Access Portal
Interface Engine: Cloverleaf 20.1
Transport: Direct secure messaging plus HTTPS callback
Encryption: S/MIME for Direct payloads and TLS 1.2 for callback traffic

## Message Flow
The clinic creates a referral packet, sends the consult note through Direct, and uses scheduling events to confirm appointment status. The specialty portal returns scheduling acknowledgments and document retrieval responses so the originating clinic can close the loop.

## Trigger Events
| Event | Description | Expected Volume |
|---|---|---|
| SIU^S12 | New appointment request | 75 per day |
| SIU^S13 | Reschedule request | 18 per day |
| Direct referral note | Specialty consult packet | 75 per day |

## Segment Mapping
| Segment.Field | Source Element | Transformation | Destination Element | Notes |
|---|---|---|---|---|
| MSH-3 | Clinic sending application | Static source app value | MSH-3 | Stable routing identity |
| PID-3 | Patient medical record number | Preserve enterprise identifier | PID-3 | Match to referral packet |
| SCH-1 | Scheduling placer ID | Link to referral order number | SCH-1 | Maintains handshake traceability |
| SCH-11 | Appointment timing | Normalize to destination timezone | SCH-11 | Avoids slot drift |
| RGS-1 | Referral grouping | Preserve consult group identifier | RGS-1 | Supports multiple specialty touches |
| NTE-3 | Referral comment | Pass through free text | NTE-3 | Do not strip clinical context |

## Code Table Crosswalks
| Source Code | Source Description | Destination Code | Destination Description |
|---|---|---|---|
| REF-CARD | Cardiology referral | 108252007 | Referral to cardiology service |
| REF-ENDO | Endocrinology referral | 394579002 | Referral to endocrinology service |
| SLOT-URG | Urgent slot | URGENT | Urgent scheduling priority |

## Error Handling
| Error Type | Detection | Response | Escalation |
|---|---|---|---|
| Appointment drift | Acknowledgment does not match referral ID | Reconcile and hold in queue | Referral coordinator |
| Consent gap | Document retrieval blocked by consent rules | Do not retry blindly; request consent review | Privacy lead |
| Document loss | Direct send failure or bounce | Quarantine the message and notify sender | Interface team on call |
| ACK timeout | No response from specialty portal | Retry and then escalate manually | Interface analyst |

## SLA
- Referral packet latency under 10 minutes.
- Scheduling acknowledgment under 30 minutes during business hours.
- Availability at 99.5 percent monthly uptime.
- Support coverage for referral cutover and first week stabilization.

## Regulatory Notes
HL7v2.5.1, C-CDA R2.1, DirectTrust, and 45 CFR 164.312 apply. Document exchange should preserve patient choice, traceability, and a clear consult closure path.
