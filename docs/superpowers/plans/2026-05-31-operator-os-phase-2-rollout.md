# Operator OS Phase 2 Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the Operator OS pattern proven by `denial-spike-workup` across the healthcare workflow catalog without weakening offline-first execution, citation-card honesty, provenance enforcement, release safety, or specialist role boundaries.

**Architecture:** Treat PR #35 as Phase 1 infrastructure: evidence-pack registry, citation cards, case-data provider modes, provenance helpers, golden artifact scoring, CLI commands, docs, and release checks. Phase 2 adds a rollout matrix, pack scaffolding, workflow-priority waves, reusable validation profiles, broader provenance fixtures, catalog docs, and review gates so every workflow graduates deliberately instead of receiving shallow copy-paste evidence packs.

**Tech Stack:** Node.js CommonJS modules, existing CLI in `bin/cli.js`, existing workflow registry in `workflows/workflows.json`, Phase 1 evidence-pack APIs in `lib/evidence-packs.js`, Phase 1 provenance APIs in `lib/operator-os/*`, Beads for durable execution, Codex Goals for multi-day orchestration, read-only subagents for domain review and verification.

---

## 1. Phase 2 Goal Prompt

Use this Codex Goal prompt after PR #35 is merged or after this plan is moved onto a fresh branch from current `main`:

```text
Execute /mnt/d/Coding Projects/healthcare-agents/docs/superpowers/plans/2026-05-31-operator-os-phase-2-rollout.md end to end. Use Beads as the durable task graph, expand Operator OS evidence packs and provenance support across the workflow catalog in prioritized waves, delegate bounded domain/review/verification work to subagents, preserve offline-first behavior and role boundaries, verify every acceptance gate, pause only for the listed blockers, and prepare PR-ready changes without pushing directly to main.
```

Completion means:

- All workflows have an explicit Operator OS status: `exemplar`, `standard_pack`, `prompt_only`, or `deferred`.
- Every `exemplar` and `standard_pack` workflow has an offline evidence pack with citation cards that validate.
- Every generated fixture or case-data helper labels fields with provenance.
- Validation can report catalog coverage and prevent shallow packs from passing as complete.
- Docs explain which workflows are Operator OS-ready and which remain prompt-only.
- Release readiness passes without live external fetching.

---

## 2. Pre-Rollout Review Gate

Before broad rollout, verify the Phase 1 provenance hardening found during local review of PR #35 remains in place:

- [ ] Inspect `lib/operator-os/denial-spike-synthetic.js`.
- [ ] Confirm prompt-derived payer, product, CARC, or RARC fields are labeled `user_supplied` with source `cli.problem`.
- [ ] Confirm purely fixture-generated fields remain labeled `synthetic`.
- [ ] Keep the regression test in `scripts/test-case-data-provider.js` proving that prompt-derived fields are not mislabeled as purely synthetic.

Acceptance:

- A prompt such as `Medicare Advantage denials spiked` cannot produce a `Medicare Advantage payer` field labeled only as `synthetic`.
- The Denial Spike golden artifact still passes.
- `node scripts/test-case-data-provider.js` passes.
- `npm run release:check` passes.

Rationale:

Phase 2 will add more fixtures. If provenance semantics are loose at the foundation, the rollout will multiply ambiguity across the catalog.

---

## 3. Durable Task Graph

Before creating or updating Beads:

```bash
bd-agent-sync pull
bd prime
bd ready -n 100
```

Create or reuse one parent epic:

```bash
bd create "Operator OS Phase 2 workflow catalog rollout" --type epic --priority 1
```

Create child Beads:

```bash
bd create "Harden Phase 1 provenance semantics before rollout" --type task --priority 1
bd create "Add Operator OS workflow coverage matrix and validator" --type task --priority 1
bd create "Add evidence-pack scaffold tooling and reusable validation profiles" --type task --priority 1
bd create "Roll out Wave 1 revenue and payer packs" --type task --priority 1
bd create "Roll out Wave 2 compliance quality and safety packs" --type task --priority 1
bd create "Roll out Wave 3 operations health IT and analytics packs" --type task --priority 2
bd create "Roll out Wave 4 remaining catalog packs" --type task --priority 2
bd create "Expand case fixtures and provenance tests across priority workflows" --type task --priority 1
bd create "Update CLI and docs for Operator OS catalog coverage" --type task --priority 2
bd create "Run final release readiness and subagent reviews for Phase 2" --type task --priority 1
```

After Bead changes:

```bash
bd-agent-sync push
```

Parent agent owns Beads, git, commits, PR, and final verification. Subagents provide read-only research, domain review, and verification reports.

---

## 4. Workflow Rollout Status Model

Add a committed coverage matrix file:

- Create: `workflows/operator-os-coverage.json`

Shape:

```json
{
  "schema_version": "operator-os.coverage.v1",
  "last_reviewed": "2026-05-31",
  "workflows": [
    {
      "workflow_id": "denial-spike-workup",
      "operator_os_status": "exemplar",
      "evidence_pack_id": "denial-spike-workup-operator-os-v1",
      "case_fixture_status": "implemented",
      "golden_artifact_status": "implemented",
      "domain_reviewer": "revenue-cycle-specialist",
      "priority_wave": 0
    }
  ]
}
```

Allowed statuses:

- `exemplar`: has full evidence pack, fixture/provenance support, golden artifact or scored artifact checks, docs, and domain review.
- `standard_pack`: has evidence pack, citation cards, docs, and validation, but no rich fixture or golden artifact yet.
- `prompt_only`: intentionally uses workflow registry prompts and safety snippets only.
- `deferred`: requires external policy design, high-risk private data handling, or scope not suitable for this release.

Acceptance:

- Every workflow in `workflows/workflows.json` appears exactly once.
- Every `exemplar` and `standard_pack` entry references an existing evidence pack.
- `denial-spike-workup` remains `exemplar`.
- No workflow can silently disappear from coverage reporting.

---

## 5. New Validation And Tooling

Add:

- `scripts/validate-operator-os-coverage.js`
- `scripts/scaffold-evidence-pack.js`
- `lib/operator-os/workflow-profiles.js`

`scripts/validate-operator-os-coverage.js` must check:

- Coverage schema version.
- Every workflow is listed once.
- Every coverage workflow ID exists.
- Every `exemplar` and `standard_pack` has an evidence pack.
- `exemplar` workflows have case fixture and golden artifact status set to `implemented`.
- `prompt_only` workflows do not pretend to have pack IDs.
- Priority waves are integers from 0 through 4.
- Domain reviewer matches a registered primary or handoff agent.

`lib/operator-os/workflow-profiles.js` must export reusable profile data for:

- revenue_cycle
- payer_contracting
- prior_authorization
- compliance
- quality_safety
- operations
- health_it
- analytics
- pharmacy
- emergency_preparedness
- care_coordination
- value_based_care

Each profile must define:

- Source categories.
- Minimum citation-card coverage.
- Required evidence families.
- Common failure modes.
- Human review owners.
- PHI/compliance notes.

`scripts/scaffold-evidence-pack.js` must:

- Accept workflow IDs with `--workflow clean-claim-rate-decline` style arguments.
- Read the workflow registry.
- Choose a profile from category and primary agent.
- Print a deterministic JSON evidence-pack draft to stdout.
- Refuse to overwrite existing packs.
- Use `source-family-not-pinpoint` or `local-policy-required` by default.
- Never fetch network resources.

Acceptance:

- `node scripts/validate-operator-os-coverage.js` passes.
- `node scripts/scaffold-evidence-pack.js --workflow clean-claim-rate-decline` prints valid JSON.
- Scaffold output validates after being saved as an evidence-pack file and reviewed.
- Release readiness includes the coverage validator.

---

## 6. Rollout Waves

### Wave 0: Existing Exemplar

- `denial-spike-workup`

Keep as `exemplar`. Only harden provenance and docs if needed.

### Wave 1: Revenue And Payer Workflows

Create standard packs for:

- `clean-claim-rate-decline`
- `payer-contract-underpayment-review`
- `prior-authorization-appeal-workup`

Required themes:

- Claim submission evidence.
- Payer/product segmentation.
- Contract or policy lookup path.
- Appeal or recovery timeline.
- Coding/CDI or authorization human review.
- AR/finance impact.
- Compliance and minimum necessary guardrails.

Acceptance:

- Each workflow has one active offline evidence pack.
- Each pack has at least 8 citation cards.
- Each pack has at least one card for source standards, payer/contract policy, local operations data, human escalation, and compliance/privacy.
- Domain review uses revenue-cycle, revenue-contract, or clinical-prior-authorization specialist boundaries as appropriate.

### Wave 2: Compliance, Quality, And Safety

Create standard packs for:

- `hipaa-security-evidence-checklist`
- `survey-readiness-gap-review`
- `patient-safety-rca2-workup`
- `hedis-stars-gap-closure-sprint`

Required themes:

- Regulatory or accreditation source family.
- Local policy and evidence binder location.
- Owner and sign-off authority.
- Event facts or measure definition.
- Corrective action monitoring.
- Legal/compliance or clinical review boundary.

Acceptance:

- Packs avoid legal conclusions and survey guarantees.
- Patient-safety pack explicitly avoids blame assignment and clinical causality conclusions.
- HEDIS/Stars pack requires current measure specs or local abstraction policy before measure-level advice.

### Wave 3: Operations, Health IT, And Analytics

Create standard packs for:

- `ed-boarding-capacity-workup`
- `ambulatory-access-backlog`
- `hl7-fhir-interface-incident`
- `clinical-dashboard-specification`

Required themes:

- Operational telemetry and denominator definitions.
- System logs or interface transaction evidence.
- Local change-control owner.
- Safety escalation where patient access or throughput risk exists.
- Data dictionary and source-of-truth control.

Acceptance:

- Health IT pack does not recommend production changes without change control.
- Dashboard pack requires metric definitions, lineage, refresh cadence, and validation owner.
- Operations packs distinguish incident command from decision support.

### Wave 4: Remaining Catalog

Create standard packs for:

- `discharge-barrier-workplan`
- `value-based-care-downside-risk-readiness`
- `pharmacy-contract-scorecard`
- `emergency-preparedness-exercise-readiness`

Required themes:

- Care coordination or operational owner.
- Contract, plan, or exercise-document source family.
- Local evidence binder.
- Risk and escalation threshold.
- Monitoring or after-action review path.

Acceptance:

- Emergency-preparedness pack does not provide live emergency guidance.
- Pharmacy contract pack avoids final legal, pharmacy-benefit, or financial authority.
- Value-based-care pack distinguishes actuarial assumptions from operational readiness evidence.

---

## 7. Case Fixtures And Provenance Expansion

Add fixture builders only where they materially improve testing and demos:

- Create: `lib/operator-os/fixtures/revenue-cycle.js`
- Create: `lib/operator-os/fixtures/compliance-quality.js`
- Create: `lib/operator-os/fixtures/operations-it.js`
- Modify: `lib/operator-os/case-data-provider.js`
- Modify: `scripts/test-case-data-provider.js`

Rules:

- Fixtures may be fully synthetic.
- Prompt-derived facts must be labeled `user_supplied`.
- Source-derived fields must name an evidence pack card or local source key.
- No fixture may include patient names, MRNs, dates of birth, SSNs, phone numbers, addresses, private payer contract text, or payer portal export rows.
- Every fixture must pass `assertAllFieldsProvenanced`.

Priority fixture coverage:

- `denial-spike-workup`: exemplar, already present after Wave 0 hardening.
- `clean-claim-rate-decline`: synthetic clean-claim trend fixture.
- `payer-contract-underpayment-review`: synthetic underpayment variance fixture.
- `hipaa-security-evidence-checklist`: synthetic evidence-binder gap fixture with no security secrets.
- `hl7-fhir-interface-incident`: synthetic interface incident fixture with no live endpoint or credential.
- `clinical-dashboard-specification`: synthetic dashboard metric-definition fixture.

Acceptance:

- `node scripts/test-case-data-provider.js` covers every fixture builder.
- Provider remains fail-closed for `public_search` and `internal_private`.
- Default `prompt_only` mode remains unchanged.

---

## 8. CLI And Docs

Modify `bin/cli.js`:

- Add `healthcare-agents operator-os coverage`.
- Add `healthcare-agents operator-os coverage --json`.
- Add `healthcare-agents evidence-pack scaffold clean-claim-rate-decline` only if it can call the same deterministic scaffold logic as the script.

Add docs:

- Create: `docs/operator-os/catalog.md`
- Create: `docs/operator-os/evidence-pack-authoring.md`
- Modify: `README.md`
- Modify: `docs/trust-and-safety.md`

Docs must explain:

- Operator OS statuses.
- Which workflows are exemplar vs standard pack vs prompt-only.
- Offline-first usage in Azure and secure environments.
- Citation-card status meanings.
- Provenance labels.
- Why live fetch/search is not part of normal runtime.
- Human review boundaries by workflow family.

Acceptance:

- CLI coverage output lists all 16 workflows.
- Docs match the coverage matrix exactly.
- Docs do not imply autonomous legal, clinical, compliance, coding, billing, contract, or production IT authority.

---

## 9. Subagent Review Requirements

Use read-only subagents for each wave:

- Revenue/payer reviewer for Wave 1.
- Compliance/quality/safety reviewer for Wave 2.
- Operations/Health IT/analytics reviewer for Wave 3.
- Cross-domain governance reviewer for Wave 4.
- Implementation/security reviewer before final verification.

Each reviewer receives:

- Changed files for the wave.
- Evidence packs for that wave.
- Relevant workflow registry entries.
- The status model from section 4.
- Instruction to report only actionable defects, unsupported claims, missing evidence-card coverage, role-boundary violations, and missing tests.

Acceptance:

- Every wave has a review note in the Goal checkpoint.
- Actionable findings are fixed or explicitly deferred into Beads.

---

## 10. Verification

Run after each wave:

```bash
node scripts/validate-evidence-packs.js
node scripts/validate-operator-os-coverage.js
node scripts/test-evidence-pack-regression.js
node scripts/test-case-data-provider.js
node scripts/test-cli-regression.js
node scripts/validate-packlist.js
```

Run before PR:

```bash
npm run release:check
git diff --check
git status --short
```

Acceptance:

- Focused tests pass after every wave.
- `npm run release:check` passes before PR.
- Package contents include coverage docs and validation scripts.
- No generated caches, downloaded evidence payloads, PHI-like samples, private documents, or run logs are included.

---

## 11. Pause Conditions

Pause and notify Cole only for:

- Need for private payer contracts, PHI, security secrets, customer data, paid databases, or authenticated portals.
- Decision to make live fetch/search part of runtime behavior.
- Decision to classify a workflow as `deferred` because safe source-family coverage is not enough.
- Ambiguous public product positioning that changes claims on trust, autonomy, or clinical/compliance authority.
- Conflicting user edits in files needed for the active Bead.
- Verification failure outside the Phase 2 branch scope.

Do not pause for normal source gaps. Use `source-family-not-pinpoint` and `local-policy-required` honestly.

---

## 12. Phase 3 Boundary

Do not include these in Phase 2:

- Live web search or scheduled external refresh jobs.
- Payer portal connectors.
- MCP adapters.
- PHI-bearing upload parsing.
- Private contract ingestion.
- Autonomous appeal drafting.
- UI application work.
- Production deployment.

Phase 3 should be a separate plan for evidence refresh and private-data adapters after the offline catalog is complete and reviewed.
