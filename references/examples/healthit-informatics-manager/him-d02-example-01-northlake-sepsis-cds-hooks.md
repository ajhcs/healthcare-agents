---
exemplar_id: him-d02-example-01-northlake-sepsis-cds-hooks
agent_slug: healthit-informatics-manager
agents_relevant:
- healthit-informatics-manager
deliverable_id: him-d02
deliverable_title: CDS Intervention Design Document
scenario_summary: An inpatient sepsis screening intervention uses CDS Hooks to prompt
  early bundle completion while minimizing alert fatigue.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- CDS Hooks Specification, cds-hooks.hl7.org
- Surviving Sepsis Campaign International Guidelines, Society of Critical Care Medicine
- ONC HTI-1 Final Rule, Federal Register 89 FR 1192
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# CDS Intervention Design

**Intervention Name**: Early Sepsis Evaluation and Bundle Prompt
**Clinical Objective**: Increase timely clinician recognition of suspected sepsis and improve completion of the initial evidence-based treatment bundle within 3 hours of trigger
**Requesting Department**: Hospital Medicine and Emergency Services
**Clinical Sponsor**: Lena Harrow, MD, FCCM
**Design Date**: 2026-04-22

## CDS Five Rights Assessment
| Right | Design Decision | Rationale |
|-------|----------------|-----------|
| Information | Adult sepsis screening prompt based on abnormal vitals, suspected infection indicators, lactate status, and organ dysfunction signals | Aligns with current sepsis management guidance and reduces reliance on memory during fast-paced care |
| Person | ED attending, admitting hospitalist, and advanced practice clinician entering orders | These roles can order cultures, fluids, antibiotics, and lactate testing in real time |
| Format | Soft-stop suggestion card with one-click order set launch plus linked evidence summary | Allows action without hard-stop friction and supports clinician judgment |
| Channel | Inpatient and ED EHR workflow through CDS Hooks with SMART launch to the sepsis navigator | Keeps the intervention inside the ordering workflow where care decisions occur |
| Time | `order-sign` when antibiotics, blood cultures, vasopressors, or lactate are being signed on eligible encounters | Captures the point at which treatment decisions are already in motion |

## Technical Specification
- **CDS Hook**: `order-sign`
- **Trigger Logic**: Fire when patient age is 18 years or older, encounter class is emergency or inpatient, suspected infection signal is present, and at least two physiologic criteria plus one organ dysfunction criterion are met within the last 6 hours
- **Inclusion Criteria**: Temperature above 38.3 C or below 36.0 C, heart rate above 90, respiratory rate above 22, systolic blood pressure below 100, MAP below 65, lactate at or above 2.0 mmol/L, creatinine rise above baseline, bilirubin above 2.0 mg/dL, platelet count below 100 K/uL
- **Exclusion Criteria**: Comfort-measures-only status, active hospice encounter, sepsis bundle already initiated in current encounter, ICU stay longer than 12 hours, documented clinician dismissal within prior 6 hours
- **Prefetch Resources**: Patient, Encounter, Observation, Condition, MedicationRequest, AllergyIntolerance, ServiceRequest
- **Response Cards**:
  - Information card summarizing why the patient met trigger criteria
  - Suggestion card launching the adult sepsis order bundle
  - SMART app link to Riverlight Sepsis Review with trend graph and organ dysfunction details

## Suggested Actions Returned by CDS Service
- Launch sepsis order bundle with blood cultures, repeat lactate, broad-spectrum antibiotics, and fluid guidance
- Open hemodynamic trend view
- Document dismissal reason with structured options when clinician chooses not to proceed

## Workflow and Safety Constraints
- Fire no more than once every 6 hours per encounter unless new organ dysfunction appears
- Suppress in encounters where ICU sepsis pathway is already active
- Require visible display of the last lactate result and timestamp to prevent duplicate ordering
- Route dismissal reasons to quality review if the patient is transferred to ICU within 12 hours

## Alert Fatigue Risk Assessment
- Estimated daily fire volume: 42 across all adult acute-care sites
- Expected override rate: 46%
- Hard stop vs. soft stop: Soft stop, because false-positive burden is material and the objective is early recognition support rather than forcing a mandatory order set
- Suppression logic: One fire per encounter every 6 hours, no repeat fire after completed bundle initiation, suppress after clinician dismissal with documented rationale unless patient status worsens

## HTI-1 DSI Compliance
- Source transparency displayed in linked metadata panel including developer, internal review owner, evidence basis, revision date, and funding source
- This intervention is rules-based rather than predictive AI, so training data and fairness testing for ML do not apply
- Version control maintained in the clinical content repository with governance approval record
- Known limitations documented: screening supports suspicion of sepsis but does not establish diagnosis

## Build and Validation Plan
- Sandbox build reviewed by hospitalist, ED, ICU, and pharmacy champions
- Ten retrospective chart validations and ten live simulation cases before production activation
- Medication content cross-check by antimicrobial stewardship pharmacist
- Latency target under 800 milliseconds for card return

## Monitoring Plan
| Metric | Baseline | Target | Review Frequency |
|--------|----------|--------|-----------------|
| Fire rate | 0 per day for CDS Hooks version | 30 to 50 per day | Weekly for 4 weeks, then monthly |
| Override rate | 0% for CDS Hooks version | Under 55% | Weekly for 4 weeks, then monthly |
| Lactate order completion within 3 hours | 61% | 80% | Monthly |
| Antibiotic administration within 3 hours for eligible cases | 68% | 85% | Monthly |
| ICU transfer after dismissal | 9% | Under 5% | Monthly |
| User feedback score | No baseline | 4.0 out of 5.0 | 30, 60, and 90 days |

## Downstream Data and Reporting Impacts
- Structured dismissal reasons stored for quality review and sepsis committee reporting
- Trigger audit table retained for 13 months to support safety review and rule tuning
- FHIR resource mappings reviewed to ensure encounter, observation, and problem data remain extractable

## Approval
- Clinical sponsor approval: Lena Harrow, MD on 2026-04-24
- Informatics governance approval: Northlake Informatics Governance Committee on 2026-04-28
- Pharmacy review: Completed by Arin Sol, PharmD on 2026-04-25
- Compliance review: Completed by Helene Rusk, CHC on 2026-04-26
