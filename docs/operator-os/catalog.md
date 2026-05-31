# Operator OS Catalog Coverage

Operator OS coverage is offline-first. Evidence packs are committed source-family metadata and lookup controls, not downloaded source payloads, private payer documents, PHI, or live search results.

Source of truth: workflows/operator-os-coverage.json

| Workflow | Category | Status | Wave | Evidence pack | Fixture | Golden | Reviewer |
|---|---|---:|---:|---|---|---|---|
| denial-spike-workup | Revenue Cycle | exemplar | 0 | denial-spike-workup-operator-os-v1 | implemented | implemented | revenue-cycle-specialist |
| clean-claim-rate-decline | Revenue Cycle | standard_pack | 1 | clean-claim-rate-decline-operator-os-v1 | implemented | not_applicable | revenue-cycle-specialist |
| payer-contract-underpayment-review | Payer Contracting | standard_pack | 1 | payer-contract-underpayment-review-operator-os-v1 | implemented | not_applicable | revenue-contract-analyst |
| prior-authorization-appeal-workup | Clinical Administration | standard_pack | 1 | prior-authorization-appeal-workup-operator-os-v1 | implemented | not_applicable | clinical-prior-authorization-specialist |
| hipaa-security-evidence-checklist | Compliance | standard_pack | 2 | hipaa-security-evidence-checklist-operator-os-v1 | implemented | not_applicable | quality-compliance-officer |
| survey-readiness-gap-review | Compliance | standard_pack | 2 | survey-readiness-gap-review-operator-os-v1 | not_implemented | not_applicable | quality-accreditation-specialist |
| patient-safety-rca2-workup | Quality and Safety | standard_pack | 2 | patient-safety-rca2-workup-operator-os-v1 | not_implemented | not_applicable | quality-patient-safety-officer |
| hedis-stars-gap-closure-sprint | Quality | standard_pack | 2 | hedis-stars-gap-closure-sprint-operator-os-v1 | not_implemented | not_applicable | quality-improvement-specialist |
| ed-boarding-capacity-workup | Operations | standard_pack | 3 | ed-boarding-capacity-workup-operator-os-v1 | not_implemented | not_applicable | operations-hospital-administrator |
| ambulatory-access-backlog | Operations | standard_pack | 3 | ambulatory-access-backlog-operator-os-v1 | not_implemented | not_applicable | operations-ambulatory-manager |
| hl7-fhir-interface-incident | Health IT | standard_pack | 3 | hl7-fhir-interface-incident-operator-os-v1 | implemented | not_applicable | healthit-interoperability-engineer |
| clinical-dashboard-specification | Analytics | standard_pack | 3 | clinical-dashboard-specification-operator-os-v1 | implemented | not_applicable | healthit-clinical-data-analyst |
| discharge-barrier-workplan | Care Coordination | standard_pack | 4 | discharge-barrier-workplan-operator-os-v1 | not_implemented | not_applicable | clinical-case-manager |
| value-based-care-downside-risk-readiness | Value-Based Care | standard_pack | 4 | value-based-care-downside-risk-readiness-operator-os-v1 | not_implemented | not_applicable | payer-value-based-care-manager |
| pharmacy-contract-scorecard | Pharmacy | standard_pack | 4 | pharmacy-contract-scorecard-operator-os-v1 | not_implemented | not_applicable | pharmacy-benefits-specialist |
| emergency-preparedness-exercise-readiness | Emergency Preparedness | standard_pack | 4 | emergency-preparedness-exercise-readiness-operator-os-v1 | not_implemented | not_applicable | emergency-preparedness-coordinator |

## Status Model

- exemplar: full evidence pack, fixture/provenance support, golden artifact or scored artifact checks, docs, and domain review.
- standard_pack: evidence pack, citation cards, docs, and validation, without rich golden artifact coverage yet.
- prompt_only: workflow registry prompts and safety snippets only.
- deferred: requires external policy design, high-risk private data handling, or scope not suitable for this release.

## Runtime Boundary

Normal CLI workup generation, docs, and release checks do not fetch live external resources. public_search, payer portal connectors, private contract ingestion, PHI-bearing upload parsing, and scheduled refresh jobs remain out of Phase 2 scope.

Every generated fixture field must carry source_derived, synthetic, or user_supplied provenance. Prompt-derived facts use user_supplied with source cli.problem.

## Human Review

Evidence packs identify lookup paths and accountable owners. They do not replace final clinical, legal, compliance, coding, billing, contract, actuarial, pharmacy-benefit, production IT, or executive authority.
