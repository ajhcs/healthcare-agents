# Release-Grade Eval Coverage Plan

**Date:** 2026-05-30  
**Status:** Planning draft  
**Scope:** Finish release-grade eval coverage for all 51 Healthcare Agents.

## Goal

Move Healthcare Agents from partial tracked eval evidence to complete release-grade
coverage across every installable agent.

The project currently has 51 installable healthcare administration agents, 51 role
baselines, a frozen scoring rubric, a canonical markdown eval loop, scorecard
generation, and release gates. The missing product-proof step is not a new eval
harness. The missing step is a controlled 41-agent release campaign that appends
defensible latest result rows for every remaining agent and updates public claims
only when the generated scorecard supports them.

## Current State

Canonical eval workflow:

- `.claude/commands/eval.md`: executable self-improvement loop for one agent.
- `eval/rubric.md`: frozen 0-4 Accuracy, Completeness, Specificity metric.
- `eval/results.tsv`: append-only result log.
- `eval/role-baselines/*.md`: frozen expected-capability baselines for all 51 agents.
- `docs/eval/exam-architect-playbook.md`: scorer and question-writing guidance.
- `docs/eval/model-tuning.md`: model-role and manifest guidance.
- `eval/meta/*.md`: calibration, consistency, and prompt-overfitting checks.
- `scripts/generate-scorecard.js`: derives public scorecard artifacts from results.
- `scripts/validate-scorecard-claims.js`: keeps README claims aligned with scorecard.
- `scripts/release-readiness.sh`: current local release gate.

Current public evidence posture:

- README states tracked eval evidence covers 10/51 evaluated agents.
- `docs/eval/scorecard.md` reports 10 agents with eval rows and average latest score
  80.97.
- The remaining 41 agents have prompts and role baselines but no latest scored row
  in `eval/results.tsv`.
- The repo deliberately does not claim universal 51/51 improvement until the TSV
  and generated scorecard prove it.

## Research Summary

The plan uses external eval practice as operating guidance, not as a mandate to add
a new framework.

- OpenAI Evals emphasizes custom/private evals, repeatable eval data, and careful
  eval design for workflow-specific behavior.
- Promptfoo emphasizes CLI-driven evals, CI integration, prompt drift detection,
  reports, and red-team style checks.
- Inspect AI emphasizes model-graded evaluations, structured logs, and reusable
  evaluation components.
- DeepEval emphasizes LLM-as-judge scoring, role adherence, hallucination checks,
  and CI-friendly quality gates.

These reinforce the repo's existing direction: preserve the lightweight markdown
loop, pin artifacts and model IDs, keep scorer/editor roles separate, gate public
claims with generated evidence, and add only small validation scripts where the
release process needs machine checks.

Do not reintroduce the retired Python/DSPy harness. Do not adopt Promptfoo,
Inspect, or DeepEval into the normal loop unless a separate future plan decides
that the lightweight workflow has reached its limit.

## Release Definition

Eval coverage is complete only when every slug in `agents/registry.json` has a
latest row in `eval/results.tsv`.

Each latest row must include:

- `score_pre_edit`
- `score_post_edit`, or intentional `N/A` for a capped/reverted case
- `delta`
- `status`
- weak areas
- concise description
- a referenced local run-log path or campaign manifest entry when practical

Release-grade coverage requires:

- 51/51 agents have latest rows.
- No latest row is `capped` unless a later resolved row exists or docs explicitly
  call it unresolved.
- `npm run validate:scorecard` passes after regeneration.
- `npm test` passes.
- README eval badge, summary table, and Eval Status section match generated
  scorecard values.
- `docs/release-manifest.json` eval-status claim matches the generated scorecard.
- The phrase "51/51 improved" is used only if all latest rows actually support
  `status=improved`.

## Non-Goals

- Do not change `eval/rubric.md`.
- Do not modify files under `eval/role-baselines/` during ordinary eval runs.
- Do not rebuild the retired Python eval harness.
- Do not make raw run logs committed artifacts by default.
- Do not claim external clinical, legal, coding, billing, audit, compliance, or
  accreditation validity from internal prompt-rubric scores.
- Do not optimize prompts into generic healthcare administration boilerplate.

## Remaining Agent Inventory

The following 41 agents need latest tracked eval rows.

### Clinical Operations

- `clinical-care-management-specialist`
- `clinical-case-manager`
- `clinical-documentation-improvement-specialist`
- `clinical-infection-prevention-specialist`
- `clinical-prior-authorization-specialist`
- `clinical-referral-specialist`
- `clinical-research-coordinator`
- `clinical-utilization-management-specialist`

### Emergency Preparedness

- `emergency-preparedness-coordinator`

### Health IT & Informatics

- `healthit-clinical-data-analyst`
- `healthit-epic-applications-analyst`
- `healthit-information-manager`
- `healthit-telehealth-program-manager`

### Operations & Administration

- `operations-ambulatory-manager`
- `operations-home-health-administrator`
- `operations-hospital-administrator`
- `operations-long-term-care-administrator`
- `operations-physician-practice-manager`
- `operations-supply-chain-manager`
- `operations-workforce-manager`

### Payer & Managed Care

- `payer-credentialing-enrollment-coordinator`
- `payer-medicare-medicaid-specialist`
- `payer-medicare-outreach-coordinator`
- `payer-relations-specialist`
- `payer-value-based-care-manager`

### Pharmacy Programs

- `pharmacy-benefits-specialist`
- `pharmacy-medication-safety-specialist`

### Population Health & Community Health

- `pophealth-community-health-coordinator`
- `pophealth-population-health-manager`
- `pophealth-surveillance-coordinator`

### Quality, Safety & Compliance

- `quality-accreditation-specialist`
- `quality-improvement-specialist`
- `quality-patient-experience-coordinator`
- `quality-patient-safety-officer`
- `quality-risk-manager`

### Revenue Cycle & Finance

- `revenue-chargemaster-analyst`

### Strategy & Advisory

- `strategy-actuarial-advisor`
- `strategy-clinical-operations-consultant`
- `strategy-healthcare-consultant`
- `strategy-operations-consultant`
- `strategy-structural-improvement-consultant`

## Operating Model

### Campaign Branching

Use one umbrella branch for coordination and one short-lived branch per batch or
per high-risk agent when parallel work would otherwise create collisions.

Recommended branch naming:

- `codex/eval-coverage-campaign`
- `codex/eval-coverage-clinical`
- `codex/eval-coverage-quality`
- `codex/eval-coverage-operations`

The parent orchestrator owns all commits that touch `eval/results.tsv`. If several
workers run in parallel, merge their results through the parent branch in a
controlled order to avoid TSV conflicts.

### Model Roles

Follow `docs/eval/model-tuning.md`.

- Parent orchestrator: reliable tool-using coding agent. Owns preflight, manifests,
  run logs, line caps, result rows, commits, and release checks.
- Scorer/judge: strongest available reasoning model. Read-only. Generates questions,
  answers as the target agent, scores with the frozen rubric, and produces the
  editor brief.
- Editor: fast strong model. Edits only `agents/<slug>.md` and only from the scorer
  brief.
- Adjudicator: different strong model family when possible. Used for high-risk
  roles, close deltas, suspicious scorer behavior, or release-scoring disputes.

### Question Discipline

Each eval iteration must preserve the exact 25-question set before answering or
editing.

Default mix:

- 5 factual mechanics
- 8 applied reasoning
- 5 edge cases
- 4 cross-domain scenarios
- 3 deliverable-production prompts

The question artifact must include each full prompt, type, source basis, expected
coverage, and scoring emphasis. Weak-area labels are not a substitute for full
question text.

### Scoring Discipline

Use the frozen rubric exactly:

```text
weighted_score = (Accuracy * 0.40) + (Completeness * 0.35) + (Specificity * 0.25)
```

Average across 25 questions and multiply by 25 for the 0-100 score.

Scores across different question sets are not directly comparable. The meaningful
delta inside an improvement iteration is the same-question pre/post delta.

### Edit Discipline

Each editor pass may edit only the target agent prompt.

The editor should:

- implement the highest-leverage 1-3 changes first
- add role-specific mechanics instead of generic best-practices boilerplate
- preserve role identity and practitioner voice
- avoid copying question phrasing into the prompt
- stay under the line cap recorded at session start

If the line cap is exceeded, restore the target prompt, append a capped row, and
do not keep the oversized edit.

## Campaign Artifacts

Create a local ignored run-log directory:

```text
eval/run-logs/<timestamp>-51-agent-release-coverage/
  manifest.json
  calibration-summary.md
  batch-plan.md
  batches/
    clinical-operations/
    quality-safety-compliance/
    operations-administration/
    payer-managed-care/
    healthit-informatics/
    mixed-remaining/
  final-summary.md
```

Per-agent run logs should follow the existing recommendation:

```text
eval/run-logs/<timestamp>-<agent-slug>/
  manifest.json
  agent-before.md
  agent-after.md
  questions.md
  questions.json
  scorer-output-pre.json
  editor-brief.md
  scorer-output-post.json
  git.diff
  summary.md
```

Raw run logs remain ignored unless explicitly promoted for review after checking
for secrets, PHI, patient data, and private operational credentials.

## Proposed Machine Checks

### Eval Coverage Validator

Add `scripts/validate-eval-coverage.js`.

Responsibilities:

- Load `agents/registry.json`.
- Parse `eval/results.tsv`.
- Determine each agent's latest row by row order.
- Fail if any registry slug lacks a latest row.
- Fail if any latest row has malformed numeric fields, except allowed `N/A`.
- Warn or fail on latest `status=capped`, depending on strictness mode.
- Emit a summary with total agents, covered agents, improved agents, reverted
  agents, capped agents, and average latest score.

Recommended modes:

```bash
node scripts/validate-eval-coverage.js
REQUIRE_FULL_EVAL_COVERAGE=1 node scripts/validate-eval-coverage.js
```

Before the campaign is complete, the non-strict command can report current
coverage without failing. After completion, the strict mode becomes part of release
validation.

### Package Script

Add:

```json
{
  "validate:eval-coverage": "node scripts/validate-eval-coverage.js"
}
```

Do not add strict full-coverage enforcement to `npm test` until 51/51 coverage
exists, or the release gate will fail for the known current backlog.

## Phase Plan

### Phase 0: Tracker Setup

Create a `bd` epic:

```text
Finish release-grade eval coverage for all 51 healthcare agents
```

Create child beads for the phases below. Include dependency edges so implementation
agents can work from `bd ready -n 100`.

Rationale: the campaign touches many files over many runs. Tracker structure is
needed so future agents do not lose the invariant that `eval/results.tsv`,
scorecard artifacts, README claims, and release manifest must all agree.

### Phase 1: Campaign Scaffolding

Tasks:

1. Create the ignored campaign run-log directory.
2. Write `manifest.json` with every registry slug, domain, current evaluated
   status, batch assignment, baseline path, prompt path, and final result state.
3. Write `batch-plan.md` listing batch order, risk tier, target model roles, and
   per-batch acceptance checks.
4. Add `scripts/validate-eval-coverage.js`.
5. Add `npm run validate:eval-coverage`.

Acceptance criteria:

- The validator reports `10/51` current coverage without corrupting artifacts.
- Strict mode fails while coverage is incomplete.
- Existing `npm test` still passes.

Dependencies:

- None.

Unblocks:

- Pilot evals.
- Final coverage gate.

### Phase 2: Scorer Calibration

Tasks:

1. Select the scorer model and record exact model ID, effort, temperature, and
   tool/search settings.
2. Run 2-3 cases from `eval/meta/judge-calibration-cases.md`, including at least
   one high-risk healthcare case.
3. Run the lightweight consistency check from
   `eval/meta/scorer-consistency-check.md`.
4. Record `passed`, `warning`, or `failed` in `calibration-summary.md`.

Acceptance criteria:

- Scorer penalizes missing citations when the rubric requires them.
- Scorer caps unsafe omissions.
- Scorer does not reward verbosity by itself.
- Any warning is documented with required adjudicator policy.

Dependencies:

- Phase 1 campaign scaffolding.

Unblocks:

- Pilot evals.

### Phase 3: Three-Agent Pilot

Pilot agents:

- `operations-ambulatory-manager`: lower-risk operational prompt.
- `quality-patient-safety-officer`: high-risk safety prompt.
- `strategy-healthcare-consultant`: strategy/advisory prompt with board-level
  deliverables.

Tasks for each agent:

1. Run canonical `/eval` preflight.
2. Generate or select 25 questions and persist full question artifacts.
3. Answer and score pre-edit.
4. Produce targeted editor brief.
5. Edit only the target agent.
6. Re-answer and re-score the same questions.
7. Run overfitting check for retained edits.
8. Append result row.
9. Commit retained agent edit and TSV row, or restore prompt and commit the result
   row for reverted/capped cases.

Acceptance criteria:

- All three pilot agents have latest rows.
- Run logs contain full question artifacts.
- Scorecard regenerates without drift.
- The process is documented well enough to repeat for the remaining 38 agents.

Dependencies:

- Phase 2 scorer calibration.

Unblocks:

- Full domain batch execution.

### Phase 4: Domain Batch Execution

Run the remaining 38 agents in domain batches. Recommended order is based on risk,
not alphabetical convenience.

#### Batch 1: Quality, Safety & Compliance

Agents:

- `quality-accreditation-specialist`
- `quality-improvement-specialist`
- `quality-patient-experience-coordinator`
- `quality-patient-safety-officer` if not fully handled in pilot
- `quality-risk-manager`

Rationale: these roles are closest to patient safety, compliance, survey readiness,
and risk governance. They benefit most from early calibration and adjudication.

#### Batch 2: Clinical Operations

Agents:

- `clinical-care-management-specialist`
- `clinical-case-manager`
- `clinical-documentation-improvement-specialist`
- `clinical-infection-prevention-specialist`
- `clinical-prior-authorization-specialist`
- `clinical-referral-specialist`
- `clinical-research-coordinator`
- `clinical-utilization-management-specialist`

Rationale: these prompts must maintain clear administrative boundaries while still
handling clinical-adjacent operational workflows. Overreach and weak escalation
logic are the main risks.

#### Batch 3: Revenue, Pharmacy, And Payment-Sensitive Roles

Agents:

- `revenue-chargemaster-analyst`
- `pharmacy-benefits-specialist`
- `pharmacy-medication-safety-specialist`

Rationale: the remaining revenue role and pharmacy roles have payment, compliance,
medication safety, and benefit-design implications. They should use stricter
adjudication for close deltas.

#### Batch 4: Payer & Managed Care

Agents:

- `payer-credentialing-enrollment-coordinator`
- `payer-medicare-medicaid-specialist`
- `payer-medicare-outreach-coordinator`
- `payer-relations-specialist`
- `payer-value-based-care-manager`

Rationale: these roles need detailed distinctions between credentialing,
enrollment, contracting, beneficiary education, Medicare/Medicaid rules, and
value-based care economics.

#### Batch 5: Health IT & Informatics

Agents:

- `healthit-clinical-data-analyst`
- `healthit-epic-applications-analyst`
- `healthit-information-manager`
- `healthit-telehealth-program-manager`

Rationale: these prompts need source-specific technical workflows while keeping
privacy, downtime, governance, and production-change boundaries intact.

#### Batch 6: Operations & Administration

Agents:

- `operations-ambulatory-manager` if not fully handled in pilot
- `operations-home-health-administrator`
- `operations-hospital-administrator`
- `operations-long-term-care-administrator`
- `operations-physician-practice-manager`
- `operations-supply-chain-manager`
- `operations-workforce-manager`

Rationale: these roles are broad and practical. The main weakness risk is generic
operations advice that lacks healthcare-specific mechanics, metrics, and owner
handoffs.

#### Batch 7: Population Health, Emergency Preparedness, And Strategy

Agents:

- `pophealth-community-health-coordinator`
- `pophealth-population-health-manager`
- `pophealth-surveillance-coordinator`
- `emergency-preparedness-coordinator`
- `strategy-actuarial-advisor`
- `strategy-clinical-operations-consultant`
- `strategy-healthcare-consultant` if not fully handled in pilot
- `strategy-operations-consultant`
- `strategy-structural-improvement-consultant`

Rationale: this batch covers cross-sector planning, community benefit, emergency
operations, actuarial/strategy work, and structural improvement. The key risk is
losing concrete deliverable mechanics in favor of generic executive prose.

Per-batch acceptance criteria:

- Every agent in the batch has a latest result row.
- No target prompt remains modified without a matching TSV row.
- Run logs contain full question artifacts.
- High-risk or close-delta cases have adjudication notes.
- `npm run validate:scorecard` passes after the batch.

Dependencies:

- Phase 3 pilot retrospective.

Unblocks:

- Final scorecard and public claim update.

### Phase 5: Scorecard And Public Claims

Tasks:

1. Run `npm run validate:scorecard`.
2. Review generated `docs/eval/scorecard.md` and `docs/eval/scorecard.json`.
3. Update README badge, summary table, and Eval Status section to match generated
   values.
4. Update `docs/release-manifest.json` eval-status claim and evidence text.
5. Add a release note describing the 51-agent eval coverage campaign and limits.

Acceptance criteria:

- README no longer says `10/51 evaluated`.
- README does not claim `51/51 improved` unless every latest row is improved.
- Scorecard, README, release manifest, and `eval/results.tsv` agree.

Dependencies:

- All Phase 4 batches complete.

Unblocks:

- Final release validation.

### Phase 6: Final Validation And Closure

Run:

```bash
npm run validate:registry
npm run validate:safety
npm run validate:scorecard
REQUIRE_FULL_EVAL_COVERAGE=1 npm run validate:eval-coverage
npm test
```

Also run:

```bash
git diff --check
git status --short
```

Acceptance criteria:

- All validation commands pass.
- Working tree is clean after committing.
- `bd` epic and child beads are closed with evidence.
- PR description names the eval coverage count, latest average score, validation
  commands, and explicit scope limits.

Dependencies:

- Phase 5 public claims update.

## Task DAG

```text
A1 Inventory remaining agents and create campaign manifest
A2 Add eval coverage validator
A3 Run scorer calibration
B1 Run 3-agent pilot
B2 Review pilot artifacts and finalize batch procedure
C1 Quality/Safety/Compliance batch
C2 Clinical Operations batch
C3 Revenue/Pharmacy batch
C4 Payer/Managed Care batch
C5 Health IT/Informatics batch
C6 Operations/Admin batch
C7 Population/Emergency/Strategy batch
D1 Regenerate scorecard and update public claims
D2 Add release note and manifest update
E1 Run final validation
E2 Close campaign beads

A1 -> A2
A1 -> A3
A2 -> B1
A3 -> B1
B1 -> B2
B2 -> C1
B2 -> C2
B2 -> C3
B2 -> C4
B2 -> C5
B2 -> C6
B2 -> C7
C1 -> D1
C2 -> D1
C3 -> D1
C4 -> D1
C5 -> D1
C6 -> D1
C7 -> D1
D1 -> D2
D2 -> E1
E1 -> E2
```

## Recommended Bead Structure

Use `bd`, not `br` or `bv`, because this repository documents `bd` as the active
tracker.

Epic:

- Finish release-grade eval coverage for all 51 healthcare agents

Child beads:

1. Add eval coverage validator and campaign manifest schema.
2. Run scorer calibration for release campaign.
3. Pilot release eval workflow on three representative agents.
4. Evaluate remaining Clinical Operations agents.
5. Evaluate remaining Quality, Safety & Compliance agents.
6. Evaluate remaining Operations & Administration agents.
7. Evaluate remaining Payer & Managed Care agents.
8. Evaluate remaining Health IT & Informatics agents.
9. Evaluate remaining Revenue, Pharmacy, Population Health, Emergency, and Strategy agents.
10. Regenerate scorecard and update README/release claims.
11. Run final release-readiness validation and close coverage campaign.

Each bead should include:

- affected agent slugs
- required preflight checks
- expected run-log artifacts
- exact validation commands
- dependency links
- acceptance criteria that mention `eval/results.tsv` and generated scorecard
  consistency

## Risk Register

### Cost And Time Explosion

Risk: 41 agents times up to 5 iterations can become excessive.

Mitigation: require one scored iteration per agent, default to at most two
improvement iterations, and reserve up to five for high-risk or low-scoring cases.

### Judge Drift

Risk: scorer thresholds drift across a long campaign.

Mitigation: run initial calibration, repeat calibration after major model changes,
and use adjudication for high-risk roles or small deltas.

### Prompt Overfitting

Risk: prompts improve on local questions by memorizing phrasing or adding generic
coverage.

Mitigation: preserve questions, run fresh-question probes, search edits for copied
question phrasing, and prefer reusable role mechanics.

### Role Flattening

Risk: many agents converge into the same generic healthcare-administration prompt.

Mitigation: every editor brief must include `identity_to_preserve` and
`anti_patterns_to_avoid`; reviewers compare changes against role baselines and
adjacent agents.

### Public Overclaiming

Risk: docs claim universal improvement or external validation not supported by
internal rubric evidence.

Mitigation: derive counts and averages from scorecard JSON, preserve interpretation
limits, and let `validate-scorecard-claims.js` fail on stale claims.

### TSV Conflicts

Risk: parallel workers append conflicting `eval/results.tsv` rows.

Mitigation: parent orchestrator owns TSV appends, or workers land branches one at a
time through a coordination branch.

## Final Deliverables

- 51/51 latest eval rows in `eval/results.tsv`.
- Generated `docs/eval/scorecard.md` and `docs/eval/scorecard.json` showing full
  coverage.
- README eval badge, table, and Eval Status section aligned with scorecard JSON.
- Updated `docs/release-manifest.json`.
- Optional release note for the eval coverage campaign.
- `scripts/validate-eval-coverage.js` and package script.
- Closed `bd` epic with child beads and validation evidence.

## Final Validation Commands

```bash
npm run validate:registry
npm run validate:safety
npm run validate:scorecard
REQUIRE_FULL_EVAL_COVERAGE=1 npm run validate:eval-coverage
npm test
```

This plan is complete when those commands pass and the generated scorecard supports
the public claims in README and release notes.
