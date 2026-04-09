---
exemplar_id: hie-ex-002
agent_slug: healthit-interoperability-engineer
agents_relevant:
  - healthit-interoperability-engineer
deliverable_id: hie-d01
deliverable_title: Interface Specification Document
scenario_summary: Emergency department ADT feed with patient merge handling and downstream census updates
complexity: high
mcp_servers_relevant:
  - provider_directory
  - current_regulatory_policy
regulatory_as_of: 2026-04-01
source_basis:
  - HL7v2.5.1
  - 45 CFR 164.312
  - TEFCA Common Agreement
generated_by: sonnet-4.6
reviewed_by: human
review_status: reviewed
review_date: 2026-04-09
---

# Interface Specification

**Interface Name**: Emergency ADT and merge feed
**Interface ID**: HIE-ADT-2026-002
**Standard**: HL7v2.5.1
**Message Type**: ADT^A01, ADT^A08, ADT^A40
**Direction**: Bidirectional
**Source System**: County General Meditech Expanse 24.0
**Destination System**: Metro HIE subscriber services and bed management
**Interface Engine**: Rhapsody 8.3
**Transport**: VPN plus MLLP
**Encryption**: TLS 1.2 with certificate validation and secured logs

## Message Flow
Emergency registration emits arrival, demographic update, and merge events. The interface fans out to the HIE subscriber feed and the bed management feed so census, patient identity, and encounter updates stay aligned.

## Trigger Events
| Event | Description | Expected Volume |
|---|---|---|
| ADT^A01 | Emergency department admit | 240 per day |
| ADT^A08 | Demographic update | 180 per day |
| ADT^A40 | Patient merge | 3 per week |

## Segment Mapping
| Segment.Field | Source Element | Transformation | Destination Element | Notes |
|---|---|---|---|---|
| MSH-3 | Registration sending application | Static sender name | MSH-3 | Stable interface identity |
| PID-3 | Medical record number | Preserve enterprise identifier | PID-3 | Keep identifier type stable |
| PID-5 | Patient name | Normalize spacing and casing | PID-5 | Preserve legal name fields |
| MRG-1 | Prior patient identifier | Route into merge table | MRG-1 | Required for duplicate resolution |
| PV1-2 | Patient class | Normalize inpatient and emergency values | PV1-2 | Maintain census accuracy |
| PV1-3 | Assigned location | Pass through local bed location | PV1-3 | Bed tracking use case |

## Code Table Crosswalks
| Source Code | Source Description | Destination Code | Destination Description |
|---|---|---|---|
| ED-ADM | Emergency admit | ER | Emergency room visit class |
| ED-OBS | Observation stay | O | Observation visit class |
| MERGE-ACK | Merge completed | MERGED | Consolidated patient identity |

## Error Handling
| Error Type | Detection | Response | Escalation |
|---|---|---|---|
| Merge chaining | More than one prior identifier in a single event | Resolve in sequence and retain audit trail | MPI analyst |
| Duplicate patient | Same demographic cluster appears twice | Quarantine and request identity review | Registration lead |
| Queue buildup | Send backlog exceeds threshold | Halt noncritical fan-out and alert | Interface team on call |
| ACK timeout | No response from destination | Retry and then queue | Interface analyst |

## SLA
- Arrival and update messages under 3 minutes end to end.
- Availability at 99.9 percent monthly uptime.
- Error rate under 0.1 percent of daily traffic.
- Initial stabilization support for 2 weeks after go-live.

## Regulatory Notes
HL7v2.5.1, TEFCA Common Agreement, and 45 CFR 164.312 apply. The merge path must preserve auditability and keep downstream census feeds synchronized.
