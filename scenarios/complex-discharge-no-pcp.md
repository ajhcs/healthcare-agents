---
scenario_id: pilot-s02
title: Complex Discharge With No PCP
pilot: true
agents_involved:
  - clinical-care-management-specialist
  - healthit-interoperability-engineer
  - quality-compliance-officer
---

# Complex Discharge With No PCP

## User Request

"A patient is leaving the ICU tomorrow with fourteen medications, no established PCP, and unstable housing. We need a complete transition plan, a reliable electronic handoff to the receiving clinic and home health team, and a compliance check on the referral arrangement because the local network is thin."

## Orchestrator DAG

```yaml
workflow:
  title: Complex Discharge Without an Established PCP
  steps:
    - step_id: 1
      agent_slug: clinical-care-management-specialist
      agent_name: Care Management Specialist
      deliverable_id: ccm-d01
      deliverable_title: Comprehensive Care Management Plan
      why: Build the discharge, medication, and community-support plan before the technical handoff is configured.
      required_inputs:
        - source: user
          data: "Discharge summary, active medication list, functional status, insurance coverage, housing status, and preferred receiving providers"
      outputs_passed_forward:
        - field: receiving_team_and_followup_plan
          consumers: [2]
        - field: referral_dependencies
          consumers: [3]
      depends_on: []
      independent_review: false
      tool_recommendation:
        capability_class: provider_directory
        query_template: Verify the receiving clinic and home health NPIs, taxonomy, and practice addresses before the warm handoff.
        materiality: Prevents discharge follow-up from being sent to the wrong receiving entity.
    - step_id: 2
      agent_slug: healthit-interoperability-engineer
      agent_name: Healthcare Interoperability Engineer
      deliverable_id: hie-d02
      deliverable_title: FHIR API Integration Checklist
      why: Ensure the receiving clinic and home health team get a complete, technically reliable discharge packet.
      required_inputs:
        - source: step_1
          data: receiving_team_and_followup_plan
        - source: user
          data: "Current discharge interface flow, source EHR, target systems, and known transport constraints"
      outputs_passed_forward:
        - field: discharge_handoff_checklist
          consumers: []
      depends_on: [1]
      independent_review: false
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check current interoperability and information-blocking guidance affecting discharge-summary exchange and patient access expectations.
        materiality: Keeps the handoff checklist aligned with current exchange requirements.
    - step_id: 3
      agent_slug: quality-compliance-officer
      agent_name: Compliance Officer
      deliverable_id: qco-d02
      deliverable_title: Arrangement Review Checklist
      why: Test whether the fallback referral arrangement creates Stark, AKS, or referral-integrity risk.
      required_inputs:
        - source: user
          data: "Referral arrangement terms, compensation or support offered to receiving entities, and any exclusivity expectations"
      outputs_passed_forward: []
      depends_on: []
      independent_review: true
      tool_recommendation:
        capability_class: current_regulatory_policy
        query_template: Check recent OIG, CMS, or Federal Register updates affecting Stark, AKS, and referral-arrangement expectations.
        materiality: Keeps the legal-risk screen current before the discharge pathway is finalized.
  blockers:
    - type: missing_input
      condition: The user has not identified the intended receiving clinic or home health partner.
      affects: [1, 2]
      escalate_to: user
      workflow_status: blocked
      resolution: Ask the user to confirm the receiving entities before building the handoff plan.
    - type: compliance_escalation
      condition: The arrangement review finds referral or remuneration terms that require counsel review before discharge routing is finalized.
      affects: [3]
      escalate_to: user
      workflow_status: blocked
      resolution: Pause implementation of the preferred referral path and escalate for legal review.
```

## Deliverable Summaries

- Step 1 produces the operational care plan covering medication reconciliation, follow-up ownership, SDOH referrals, and timing.
- Step 2 produces the technical checklist that makes the discharge packet reachable, complete, and monitorable across the actual receiving systems.
- Step 3 produces the compliance checklist for the referral path so the team does not solve the discharge problem by creating a new regulatory one.

## Handoff Data

- `1 -> 2`: pass `receiving_team_and_followup_plan` so the interoperability checklist targets the actual providers, destinations, and follow-up cadence instead of a generic discharge feed.
- `1 -> 3`: pass `referral_dependencies` only as operational facts such as receiving-entity choice and support needs; the compliance officer derives the risk judgment independently.

## Where Tool Lookups Added Value

- `provider_directory` confirms that the receiving clinic and home health partner identities are correct before the electronic handoff is configured.
- `current_regulatory_policy` adds value for both the discharge exchange design and the referral-risk screen because both areas have meaningful recency risk.

## Blockers Requiring User Input

- The workflow pauses if the user has not identified the receiving entities.
- A blocked arrangement review stops the preferred discharge pathway until the user chooses a compliant alternative or escalates to counsel.

