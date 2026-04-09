---
holdout_id: hie-ho-002
agent_slug: healthit-interoperability-engineer
agents_relevant:
  - healthit-interoperability-engineer
deliverable_id: hie-d01
deliverable_title: Interface Specification Document
seed_ref: hie-seed-002
scenario_summary: Inpatient pharmacy encoded orders and medication administration feed between CPOE and the pharmacy system
complexity: high
regulatory_as_of: 2026-04-01
source_basis:
  - HL7v2.5.1
  - RxNorm
  - NDC
  - 45 CFR 164.312
generated_by: opus-4.6
reviewed_by: human
review_status: reviewed
review_date: 2026-04-09
frozen: true
superseded_by: null
retirement_trigger: Medication workflow redesign or interface engine replacement
expectations:
  - Document the encoded order path and the administration path separately.
  - Preserve dose units and administration timing through the interface.
  - Describe allergy and formulary guardrails before medication verification.
  - Include retry logic and duplicate suppression for repeat administration updates.
---

# Interface Specification

Interface Name: Inpatient pharmacy encoded orders and administration feed
Interface ID: HIE-PHARM-2026-001
Standard: HL7v2.5.1
Message Type: RDE^O11 and RAS^O17
Direction: Bidirectional
Source System: North Valley CPOE 9.1
Destination System: Harborview Pharmacy Carousel 7.8
Interface Engine: Rhapsody 8.3
Transport: VPN plus MLLP
Encryption: TLS 1.2 with mutually trusted certificates and secured engine logging

## Message Flow
Medication orders originate in the CPOE, pass through allergy and formulary checks, then reach the pharmacy system for verification. Medication administration updates return from the nursing workflow so the pharmacy and clinical chart stay aligned.

## Trigger Events
| Event | Description | Expected Volume |
|---|---|---|
| RDE^O11 | New medication order | 320 per day |
| RDE^O11 change | Dose or schedule update | 90 per day |
| RAS^O17 | Administration record | 900 per day |

## Segment Mapping
| Segment.Field | Source Element | Transformation | Destination Element | Notes |
|---|---|---|---|---|
| MSH-3 | CPOE sending application | Static source app value | MSH-3 | Stable interface name |
| PID-3 | Patient medical record number | Pass through enterprise identifier | PID-3 | Preserve identifier type |
| ORC-1 | Order control | Normalize to local order event codes | ORC-1 | Support new and change actions |
| RXE-2 | Medication code | Crosswalk to RxNorm and NDC | RXE-2 | Maintain formulary mapping |
| RXR-2 | Route of administration | Normalize route codes | RXR-2 | Prevent free text drift |
| RXA-5 | Administered dose | Preserve numeric dose and units | RXA-5 | Enforce unit consistency |
| RXA-12 | Administration notes | Pass through structured note | RXA-12 | Keep omission reason visible |

## Code Table Crosswalks
| Source Code | Source Description | Destination Code | Destination Description |
|---|---|---|---|
| MED-HSP-10MG | Heparin 10 milligrams | 316953 | Heparin sodium injectable solution |
| MED-VAN-1G | Vancomycin 1 gram | 833166 | Vancomycin injection |
| ROUTE-IV | Intravenous | IV | Intravenous route |

## Error Handling
| Error Type | Detection | Response | Escalation |
|---|---|---|---|
| Dose unit drift | Unit mismatch between order and administration | Normalize only when conversion is exact | Pharmacy analyst |
| Allergy gap | Allergy context absent during verification | Hold message and alert pharmacist | Medication safety team |
| Administration duplication | Same administration event repeats | Suppress duplicate and keep audit trail | Interface analyst |
| ACK timeout | No response from destination | Retry and queue for manual review | Interface team on call |

## SLA
- Order latency under 2 minutes for non-controlled medications.
- Administration posting under 5 minutes after charted dose.
- Availability at 99.9 percent monthly uptime.
- Stabilization support for the first 14 production days.

## Regulatory Notes
HL7v2.5.1, RxNorm, NDC, and 45 CFR 164.312 apply. Medication transport must preserve dose precision, route normalization, and traceable exception handling.
