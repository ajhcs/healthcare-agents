# Feel the AGI Upgrade Implementation Plan

> **For agentic workers:** Use this as an execution plan, not as an invitation to invent adjacent scope. Keep checkboxes updated in place. Prefer small, reviewable commits.

**Goal:** Implement the registry-driven "Feel the AGI" upgrade described in [docs/superpowers/specs/2026-04-09-feel-the-agi-design.md](/mnt/d/Coding%20Projects/healthcare-agents/docs/superpowers/specs/2026-04-09-feel-the-agi-design.md): pilot a registry, calibration pipeline, orchestrator, tool-awareness pattern, attack surfaces, reference library, and governance without breaking the existing `agents/*.md` user path or the existing simple `/eval` loop.

**Architecture:** Pilot-first rollout. The first implementation wave covers 5 agents end-to-end using one shared registry, maintainer tooling with schema-aware validation, structured calibration artifacts, and a pilot-scoped orchestrator prototype. After the pilot proves signal and stability, the same pipeline scales to the remaining agents and only then promotes the orchestrator into the shipped `agents/` surface.

**Tech Stack:** Markdown, YAML, Bash entry points, minimal Python for structured schema parsing/validation/canonicalization, and git. No new third-party install step. Existing Python eval systems remain separate and are only touched where explicitly called out for metadata consolidation. The existing `eval/` loop remains canonical for prompt self-improvement and is not repurposed as a release gate in this plan.

**Spec:** [docs/superpowers/specs/2026-04-09-feel-the-agi-design.md](/mnt/d/Coding%20Projects/healthcare-agents/docs/superpowers/specs/2026-04-09-feel-the-agi-design.md)

**Execution posture:** Characterization-first for prompt-visible marker insertion and generated artifacts. Pilot-first for content authoring. Manual review stays in the loop for calibration synthesis and prompt upgrades.

**Pilot agents:**
- `agents/clinical-care-management-specialist.md`
- `agents/revenue-medical-coding-specialist.md`
- `agents/quality-compliance-officer.md`
- `agents/healthit-interoperability-engineer.md`
- `agents/strategy-healthcare-consultant.md`

**Key decisions already locked by the spec:**
- `registry.yaml` is the single source of truth for agent routing metadata and prompt growth budgets.
- Deliverable extraction uses explicit HTML comment markers and must treat those markers as prompt-visible raw text.
- `scripts/lint-references.sh` is the canonical reference/holdout validator.
- The orchestrator DAG uses `depends_on` as the single graph truth; parallel groups and fan-in are derived.
- Calibration edits are human-reviewed and traceable to `gap_id`s.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `docs/superpowers/specs/2026-04-09-feel-the-agi-design.md` | Read-only reference | Source of truth for the implementation |
| `docs/superpowers/plans/2026-04-09-feel-the-agi-implementation-plan.md` | Create | Durable execution plan |
| `registry.yaml` | Create | Pilot registry entries, deliverables, routing metadata, budgets |
| `docs/audiences.md` | Create | User / maintainer / researcher audience contract |
| `docs/lifecycle.md` | Create | Refresh cadence, review lifecycle, release mechanics |
| `docs/mcp-capabilities.md` | Create | Human-readable capability taxonomy derived from the spec |
| `references/style-guide.md` | Create | Exemplar/holdout writing rules and PHI safety guardrails |
| `docs/orchestrator-pilot.md` | Create | Pilot-scoped orchestration prototype backed only by pilot registry coverage |
| `agents/orchestrator.md` | Create later | Full-catalog shipped orchestrator, only after 51-agent registry coverage and validator updates |
| `agents/eval-exam-architect.md` | Edit | Mark as utility prompt for exclusion from registry/roster/calibration |
| `agents/clinical-care-management-specialist.md` | Edit | Deliverable markers, pilot upgrades |
| `agents/revenue-medical-coding-specialist.md` | Edit | Deliverable markers, pilot upgrades |
| `agents/quality-compliance-officer.md` | Edit | Deliverable markers, pilot upgrades |
| `agents/healthit-interoperability-engineer.md` | Edit | Deliverable markers, pilot upgrades |
| `agents/strategy-healthcare-consultant.md` | Edit | Deliverable markers, pilot upgrades |
| `scripts/generate-registry.sh` | Create | Agent -> registry skeleton generation for pilot and later scale-out |
| `scripts/merge-registry.py` | Create | Preserve curated registry fields while merging regenerated skeleton content |
| `scripts/generate-roster.sh` | Create | Registry -> orchestrator roster generation |
| `scripts/lint-agents.sh` | Edit | Enforce line budgets, marker coverage, attack-surface provenance |
| `scripts/audit-agents.py` | Edit | Respect utility metadata and keep specialist-only audit scope explicit |
| `scripts/lint-references.sh` | Create | Validate exemplar/holdout frontmatter and content invariants |
| `scripts/validate-dag.sh` | Create | Validate orchestrator DAG output fixtures |
| `scripts/validate-calibration-artifacts.py` | Create | Validate seeds, attempt lint, gap reports, synthesis summaries, traces, and run manifests |
| `scripts/run-maintainer-checks.sh` | Create | Aggregate registry, DAG, lint, and fixture checks |
| `scripts/test-fixtures/registry/` | Create | Marker extraction fixture inputs/expected outputs |
| `scripts/test-fixtures/dag/` | Create | Valid and invalid DAG examples |
| `scripts/test-fixtures/references/` | Create | Valid and invalid exemplar/holdout files |
| `scripts/test-fixtures/calibration/` | Create | Valid and invalid seeds, lint results, gap reports, synthesis summaries, traces, and manifests |
| `scripts/tests/test-generate-registry.sh` | Create | Registry extraction regression tests |
| `scripts/tests/test-merge-registry.sh` | Create | Curated-field preservation and regeneration merge tests |
| `scripts/tests/test-generate-roster.sh` | Create | Roster generation regression tests |
| `scripts/tests/test-validate-dag.sh` | Create | DAG validation tests |
| `scripts/tests/test-lint-references.sh` | Create | Reference/holdout lint tests |
| `scripts/tests/test-lint-agents-budgets.sh` | Create | Line-budget and attack-surface lint tests |
| `scripts/tests/test-validate-calibration-artifacts.sh` | Create | Seed/gap/summary/trace/manifest schema tests |
| `scripts/tests/test-capability-mapping.sh` | Create | Capability class `does_not_do` guardrail tests |
| `scripts/tests/test-utility-exclusion.sh` | Create | Utility prompt exclusion tests |
| `scripts/tests/test-release-gate.sh` | Create | Staleness/review gate tests |
| `calibration/rubric.yaml` | Create | Calibration rubric distinct from `eval/rubric.md` |
| `calibration/prompts/` | Create | Generator, judge, and synthesis prompt templates |
| `calibration/lint-attempt.sh` | Create | Deterministic Stage 2 lint for generated deliverables |
| `calibration/run-calibration.sh` | Create | Maintainer entry point for generation, lint, judge, synthesize flow |
| `calibration/seeds/` | Create | Structured scenario seed packets for pilot agents |
| `calibration/holdouts/` | Create | Calibration-only holdout documents for pilot agents |
| `calibration/results/` | Create | Gap reports and synthesis summaries |
| `calibration/applied/` | Create | `gap_id -> edit -> commit` traceability artifacts |
| `calibration/run-manifests/` | Create | Per-run manifests with model/version/cost metadata |
| `references/examples/` | Create | User-facing pilot exemplars |
| `scenarios/` | Create | Pilot orchestration scenarios |
| `README.md` | Edit later | Public-facing explanation after pilot is working |
| `INSTALL.md` | Edit later | Clarify unchanged agent-only install path without adding maintainer-only workflow there |

---

## Sequencing

1. Lock scaffolding, metadata, and exclusion rules first.
2. Build registry generation and safe merge/update behavior before touching orchestrator generation.
3. Add deliverable markers to pilot agents before generating the pilot registry.
4. Build validators, calibration schemas, and provider command contracts before authoring large volumes of examples and holdouts.
5. Run the calibration flow on pilot artifacts before editing pilot agent prompts.
6. Generate the pilot orchestrator prototype only after the pilot registry exists and roster generation is stable.
7. Promote the orchestrator into `agents/` only after full-catalog coverage and validator updates exist.
8. Update public docs after the pilot path works end-to-end.

This sequencing matters because the registry, marker format, and validators are the stability layer for everything else.

---

## Task 1: Scaffold Maintainer Surface

**Files:**
- Create: `registry.yaml`
- Create: `docs/audiences.md`
- Create: `docs/lifecycle.md`
- Create: `docs/mcp-capabilities.md`
- Create: `references/style-guide.md`
- Create directories: `calibration/seeds/`, `calibration/holdouts/`, `calibration/results/`, `calibration/applied/`, `calibration/run-manifests/`, `references/examples/`, `scenarios/`, `scripts/tests/`, `scripts/test-fixtures/`
- Edit: `agents/eval-exam-architect.md`

- [ ] Add `utility: true` to the frontmatter of [agents/eval-exam-architect.md](/mnt/d/Coding%20Projects/healthcare-agents/agents/eval-exam-architect.md) so exclusion is local and machine-detectable.
- [ ] Create empty scaffolding directories for calibration, examples, scenarios, tests, and fixtures, including `scripts/test-fixtures/calibration/`.
- [ ] Create [docs/audiences.md](/mnt/d/Coding%20Projects/healthcare-agents/docs/audiences.md) from the spec’s audience contract. Keep it concise and user-readable.
- [ ] Create [docs/lifecycle.md](/mnt/d/Coding%20Projects/healthcare-agents/docs/lifecycle.md) from the spec’s refresh cadence, review-status lifecycle, and release mechanics.
- [ ] Create [docs/mcp-capabilities.md](/mnt/d/Coding%20Projects/healthcare-agents/docs/mcp-capabilities.md) as the human-readable explanation of the capability taxonomy from Section 8 of the spec.
- [ ] Create [references/style-guide.md](/mnt/d/Coding%20Projects/healthcare-agents/references/style-guide.md) using the exact contracts from the spec: tone, granularity, PHI safety, citation verification, and template-following rules.
- [ ] Seed [registry.yaml](/mnt/d/Coding%20Projects/healthcare-agents/registry.yaml) with top-level keys only: `agents: []` and `utility_agents:` containing `eval-exam-architect`.
- [ ] Record the metadata precedence rule in maintainer docs: `utility: true` in agent frontmatter is authoritative, and `utility_agents` in `registry.yaml` is the generated/aggregated mirror used by downstream tooling.

**Test scenarios:**
- `agents/eval-exam-architect.md` with `utility: true` is excluded by every registry/roster/calibration test.
- `docs/audiences.md` and `docs/lifecycle.md` do not introduce new policy beyond the spec.
- `references/style-guide.md` includes explicit PHI safety rules and verifiable-citation requirements.

**Commit boundary:** One commit for scaffolding + utility exclusion + maintainer docs.

---

## Task 2: Implement Registry Generation for the Pilot

**Files:**
- Create: `scripts/generate-registry.sh`
- Create: `scripts/merge-registry.py`
- Create: `scripts/tests/test-generate-registry.sh`
- Create: `scripts/tests/test-merge-registry.sh`
- Create: `scripts/test-fixtures/registry/healthit-epic-applications-analyst.md`
- Create: `scripts/test-fixtures/registry/pophealth-surveillance-coordinator.md`
- Create: `scripts/test-fixtures/registry/strategy-structural-improvement-consultant.md`
- Create expected outputs under `scripts/test-fixtures/registry/*.expected.yaml`
- Edit later: `registry.yaml`

- [ ] Implement [scripts/generate-registry.sh](/mnt/d/Coding%20Projects/healthcare-agents/scripts/generate-registry.sh) as a shell-first generator that:
  - accepts an explicit list of agent paths or slugs
  - skips files with `utility: true`
  - extracts `slug`, `name`, and deliverable titles from `<!-- deliverable: ... -->` markers
  - records `prompt_section` as a heading path string
  - writes a deterministic YAML skeleton for only the requested agents
- [ ] Keep generation deterministic: stable ordering by slug, stable field ordering, and no timestamps in output.
- [ ] Implement [scripts/merge-registry.py](/mnt/d/Coding%20Projects/healthcare-agents/scripts/merge-registry.py) so regeneration preserves curated fields in `registry.yaml` by `slug` and `deliverable_id` while updating generated identity/deliverable fields.
- [ ] Add fixture tests for the three nested-heading agents called out in the spec so naive heading parsing cannot regress back in.
- [ ] Add a failing test case for an agent file with no deliverable markers; the script should exit non-zero with a clear error.
- [ ] Add a passing test case for a utility-marked agent; the script should skip it without error.
- [ ] Add a merge test where a regenerated deliverable title changes but curated `routing_triggers`, `tool_opportunities`, `line_budget`, and refresh metadata survive untouched.

**Implementation decision:** The generator should support `--slugs` or `--files` so Phase 1 can populate only the pilot agents while Phase 2 can scale to all agents with the same script. Generation writes a deterministic skeleton; `scripts/merge-registry.py` is the only path that updates curated `registry.yaml`.

**Test scenarios:**
- Nested `###` headings inside a deliverable block are treated as children, not new deliverables.
- Utility prompts are skipped.
- Output ordering is stable across repeated runs.
- Missing markers fail loudly.

**Commit boundary:** One commit for generator + fixtures + tests.

---

## Task 3: Add Deliverable Markers to Pilot Agents

**Files:**
- Edit: [clinical-care-management-specialist.md](/mnt/d/Coding%20Projects/healthcare-agents/agents/clinical-care-management-specialist.md)
- Edit: [revenue-medical-coding-specialist.md](/mnt/d/Coding%20Projects/healthcare-agents/agents/revenue-medical-coding-specialist.md)
- Edit: [quality-compliance-officer.md](/mnt/d/Coding%20Projects/healthcare-agents/agents/quality-compliance-officer.md)
- Edit: [healthit-interoperability-engineer.md](/mnt/d/Coding%20Projects/healthcare-agents/agents/healthit-interoperability-engineer.md)
- Edit: [strategy-healthcare-consultant.md](/mnt/d/Coding%20Projects/healthcare-agents/agents/strategy-healthcare-consultant.md)

- [ ] Insert `<!-- deliverable: Title -->` markers immediately above each deliverable boundary in the five pilot agents.
- [ ] Keep marker text identical to the visible `###` title.
- [ ] Do not add explanatory prose around markers.
- [ ] Run the registry generator against only the five pilot agents and inspect the output for exact title matches.
- [ ] Curate [registry.yaml](/mnt/d/Coding%20Projects/healthcare-agents/registry.yaml) for the pilot agents by filling:
  - `domain`
  - `routing_triggers`
  - `tool_opportunities`
    - `trigger`
    - `capability_class`
    - `query_template`
    - `materiality`
  - `line_budget`
  - `regulatory_refresh`
  - `refresh_owner`

**Implementation decision:** For Phase 1, populate only the pilot agents in `registry.yaml`. Do not create partial placeholder entries for the remaining 46 agents yet.

**Test scenarios:**
- Markers do not alter visible markdown rendering.
- Generated deliverable titles match visible headings exactly.
- Prompt-visible comments stay short and semantically neutral.
- `line_budget` initializes from the current file line count snapshot plus 150.

**Commit boundary:** One commit for pilot marker insertion + pilot registry population.

---

## Task 4: Build Maintainer Validators and Release Gate

**Files:**
- Edit: `scripts/lint-agents.sh`
- Edit: `scripts/audit-agents.py`
- Edit: `eval/harness/pipeline.py`
- Create: `scripts/lint-references.sh`
- Create: `scripts/validate-dag.sh`
- Create: `scripts/validate-calibration-artifacts.py`
- Create: `scripts/run-maintainer-checks.sh`
- Create: `scripts/tests/test-lint-references.sh`
- Create: `scripts/tests/test-validate-dag.sh`
- Create: `scripts/tests/test-lint-agents-budgets.sh`
- Create: `scripts/tests/test-validate-calibration-artifacts.sh`
- Create: `scripts/tests/test-capability-mapping.sh`
- Create: `scripts/tests/test-utility-exclusion.sh`
- Create: `scripts/tests/test-release-gate.sh`
- Create fixtures under `scripts/test-fixtures/dag/`, `scripts/test-fixtures/references/`, and `scripts/test-fixtures/calibration/`

- [ ] Extend [scripts/lint-agents.sh](/mnt/d/Coding%20Projects/healthcare-agents/scripts/lint-agents.sh) to:
  - read pilot `line_budget`s from `registry.yaml`
  - fail when a pilot agent exceeds its budget
  - validate attack-surface marker count and provenance fields once those sections exist
  - preserve current canonical specialist checks and treat utility-marked files as excluded
- [ ] Update [scripts/audit-agents.py](/mnt/d/Coding%20Projects/healthcare-agents/scripts/audit-agents.py) to respect `utility: true` instead of only hard-coded filename exclusions.
- [ ] Update [eval/harness/pipeline.py](/mnt/d/Coding%20Projects/healthcare-agents/eval/harness/pipeline.py) to derive utility-prompt exclusions from frontmatter metadata or a shared helper, keeping filename fallback only for backward compatibility while the migration lands.
- [ ] Implement [scripts/lint-references.sh](/mnt/d/Coding%20Projects/healthcare-agents/scripts/lint-references.sh) to validate exemplar and holdout frontmatter, `review_status`, `regulatory_as_of`, `deliverable_id`, `agent_slug`, and expected citation/placeholder rules.
- [ ] Implement [scripts/validate-dag.sh](/mnt/d/Coding%20Projects/healthcare-agents/scripts/validate-dag.sh) to check:
  - valid `depends_on` references
  - no cycles
  - `independent_review: true` implies empty `depends_on`
  - derived fields are not manually authored in fixture input
- [ ] Implement [scripts/validate-calibration-artifacts.py](/mnt/d/Coding%20Projects/healthcare-agents/scripts/validate-calibration-artifacts.py) to validate:
  - seed packets
  - Stage 2 attempt-lint outputs
  - per-deliverable gap reports
  - synthesis summaries
  - applied trace files
  - run manifests
- [ ] Implement [scripts/run-maintainer-checks.sh](/mnt/d/Coding%20Projects/healthcare-agents/scripts/run-maintainer-checks.sh) as the aggregator that runs all shell tests plus lint checks.
- [ ] Add capability-mapping tests to reject invalid pairings, especially:
  - `provider_directory` used for board certification
  - `provider_directory` used for payer enrollment status
  - `coding_edit_policy` used for DRG grouping

**Test scenarios:**
- A stale exemplar fails the release gate.
- A holdout missing `seed_ref` fails reference lint.
- A DAG with circular dependencies fails validation.
- A DAG with an `independent_review` step and non-empty `depends_on` fails validation.
- A pilot agent over budget fails agent lint.
- A malformed seed, gap report, synthesis summary, applied trace, or run manifest fails calibration-artifact validation.
- A utility prompt remains excluded from all generated catalogs.

**Commit boundary:** One commit for validators, shell tests, and fixture corpus.

---

## Task 5: Define Calibration Prompt Templates and Shell Contract

**Files:**
- Create: `calibration/rubric.yaml`
- Create: `calibration/prompts/generate.md`
- Create: `calibration/prompts/judge.md`
- Create: `calibration/prompts/summarize.md`
- Create: `calibration/lint-attempt.sh`
- Create: `calibration/run-calibration.sh`

- [ ] Create [calibration/rubric.yaml](/mnt/d/Coding%20Projects/healthcare-agents/calibration/rubric.yaml) from the spec’s five score dimensions and anchor philosophy.
- [ ] Create the three calibration prompt templates:
  - [calibration/prompts/generate.md](/mnt/d/Coding%20Projects/healthcare-agents/calibration/prompts/generate.md)
  - [calibration/prompts/judge.md](/mnt/d/Coding%20Projects/healthcare-agents/calibration/prompts/judge.md)
  - [calibration/prompts/summarize.md](/mnt/d/Coding%20Projects/healthcare-agents/calibration/prompts/summarize.md)
- [ ] Implement [calibration/lint-attempt.sh](/mnt/d/Coding%20Projects/healthcare-agents/calibration/lint-attempt.sh) for spec Stage 2 deterministic lint. It must emit the normative lint-result schema and run on every generated deliverable before judging.
- [ ] Implement [calibration/run-calibration.sh](/mnt/d/Coding%20Projects/healthcare-agents/calibration/run-calibration.sh) as a provider-agnostic shell entry point that:
  - reads seeds and holdouts for a given agent or run manifest
  - renders the prompt templates with agent content + seed packet + rubric
  - delegates generation/judging/synthesis to environment-provided commands, not repo-hardcoded CLIs
  - runs `calibration/lint-attempt.sh` between generation and judging
  - validates every produced calibration artifact against its normative schema before continuing
  - writes structured outputs into `calibration/results/` and `calibration/run-manifests/`
- [ ] Lock the provider command contract in the runner docs and shell help text:
  - `CALIBRATION_GENERATOR_CMD`, `CALIBRATION_JUDGE_CMD`, and `CALIBRATION_SYNTHESIZER_CMD` are shell commands that read a rendered prompt from stdin
  - generator stdout must be raw markdown deliverable text only
  - judge stdout must be a single gap-report artifact matching the spec schema
  - synthesizer stdout must be a single synthesis-summary artifact matching the spec schema
  - non-zero exit, timeout, or schema-invalid stdout fails the run
- [ ] Lock run-manifest creation to the spec schema, including `generator_model`, `judge_model`, `agent_prompt_versions`, `estimated_cost_usd`, `human_qa_sample`, and `human_qa_concordance`.

**Implementation decision:** Do not hardcode a specific vendor CLI into the repo. Use environment variables such as `CALIBRATION_GENERATOR_CMD`, `CALIBRATION_JUDGE_CMD`, and `CALIBRATION_SYNTHESIZER_CMD` so maintainers can wire Sonnet/Opus through their local tooling without creating a repo runtime dependency. Shell is only the entry layer; schema enforcement for returned artifacts is handled by `scripts/validate-calibration-artifacts.py`.

**Test scenarios:**
- Missing generator/judge command env vars fail with a clear setup message.
- A dry-run mode renders the prompt payloads without calling any model command.
- Prompt templates contain only schema-backed fields and no holdout leakage into generation.
- Judge prompts consume expectation checklists, not full holdout text.
- Attempt-lint runs before judging and rejects schema-invalid lint output.
- Invalid gap-report or synthesis-summary payloads fail immediately with a clear artifact path and validator error.

**Commit boundary:** One commit for calibration shell contract + prompt templates + rubric.

---

## Task 6: Author Pilot Seed Packets, Holdouts, and Examples

**Files:**
- Create pilot seed packets under:
  - `calibration/seeds/clinical-care-management-specialist/*.yaml`
  - `calibration/seeds/revenue-medical-coding-specialist/*.yaml`
  - `calibration/seeds/quality-compliance-officer/*.yaml`
  - `calibration/seeds/healthit-interoperability-engineer/*.yaml`
  - `calibration/seeds/strategy-healthcare-consultant/*.yaml`
- Create pilot holdouts under matching agent subdirectories in `calibration/holdouts/`
- Create pilot examples under matching agent subdirectories in `references/examples/`
- Create initial run manifest under `calibration/run-manifests/`

- [ ] For each pilot agent, author 5 seed packets matching the spec schema.
- [ ] For each pilot seed, author one holdout document with:
  - frontmatter matching the holdout schema
  - extracted `expectations`
  - `frozen: true` only after review
- [ ] For each pilot agent, author 5 user-facing examples that do not overlap with the holdout set.
- [ ] Run `scripts/lint-references.sh` against both `references/examples/` and `calibration/holdouts/` until all pilot artifacts pass.
- [ ] Run `scripts/validate-calibration-artifacts.py` against pilot seeds and any hand-authored calibration artifacts until they all pass.
- [ ] Create an initial run manifest file for the first pilot pass, even before values are filled, so the full schema shape is stable.

**Implementation decision:** Use per-agent subdirectories in both `calibration/seeds/` and `calibration/holdouts/` during authoring, even if shipped examples remain browsable flat or via README links later. This keeps pilot batches auditable and easier to review.

**Test scenarios:**
- No holdout file is duplicated into `references/examples/`.
- Every seed references a real pilot `deliverable_id` in `registry.yaml`.
- Every holdout references an existing seed.
- Every example and holdout satisfies the style guide and PHI safety rules.

**Commit boundary:** Separate commits per pilot agent or per content batch. Do not land all 50 documents as one opaque content dump.

---

## Task 7: Run Pilot Calibration and Apply Prompt Upgrades

**Files:**
- Generate outputs under `calibration/results/`
- Generate traces under `calibration/applied/`
- Edit pilot agent files listed in Task 3

- [ ] Run one pilot calibration pass across the five pilot agents using the authored seeds and holdouts.
- [ ] Review the resulting gap reports and synthesis summaries manually before editing prompts.
- [ ] For each promoted finding, write a trace file in `calibration/applied/<agent-slug>.yaml` capturing:
  - `agent_slug`
  - `calibration_run_id`
  - `calibration_date`
  - `applied_gaps` with `gap_id`, `gap_type`, `prompt_section`, `edit_summary`, `commit`, `promotion_reason`, and `recurrence_count`
  - `rejected_gaps` with explicit reasons
- [ ] Apply only promoted edits to the pilot agent files:
  - calibration-driven fixes in existing sections
  - `## External Data & Tool Use`
  - inline tool hooks where `mcp_opportunity_missed` recurred
  - `## What Auditors Actually Challenge` with 4-6 items and provenance markers
- [ ] Re-run `scripts/lint-agents.sh` after each pilot agent upgrade to enforce line budgets.
- [ ] Re-run `scripts/audit-agents.py`, `scripts/run-maintainer-checks.sh`, and the calibration-artifact validator after each pilot agent upgrade.
- [ ] Keep the simple `/eval` boundary intact by not editing `.claude/commands/eval.md`, `eval/rubric.md`, `eval/role-baselines/`, or `scripts/run-eval.sh` as part of this work.

**Implementation decision:** Do not use the canonical `/eval` loop as a release gate. It mutates prompts, appends `eval/results.tsv`, and creates commits, so it is incompatible with objective post-upgrade verification. If maintainers want a characterization run later, it must happen in a disposable worktree and is informational only.

**Test scenarios:**
- No applied edit copies holdout-specific facts into a prompt.
- Every prompt edit traces back to at least one `gap_id`.
- No pilot agent exceeds `line_budget`.
- Attack-surface sections include 4-6 items only, each with source, evidence type, confidence, and `as_of`.
- Existing `/eval` assets and instructions remain untouched because this plan does not invoke `/eval` as a merge gate.

**Commit boundary:** One commit per upgraded pilot agent so regressions can be isolated cleanly.

---

## Task 8: Build the Pilot Orchestrator Prototype from the Pilot Registry

**Files:**
- Create: `docs/orchestrator-pilot.md`
- Create: `scripts/generate-roster.sh`
- Create: `scripts/tests/test-generate-roster.sh`
- Create DAG fixtures under `scripts/test-fixtures/dag/`
- Create pilot scenarios:
  - `scenarios/tcm-rac-audit.md`
  - `scenarios/complex-discharge-no-pcp.md`
  - `scenarios/interoperability-discharge-handoff.md`

- [ ] Implement [scripts/generate-roster.sh](/mnt/d/Coding%20Projects/healthcare-agents/scripts/generate-roster.sh) to render a roster table from `registry.yaml` for the current pilot agents.
- [ ] Create [docs/orchestrator-pilot.md](/mnt/d/Coding%20Projects/healthcare-agents/docs/orchestrator-pilot.md) with:
  - static identity, non-goals, routing contract, and handoff schema
  - generated pilot roster inserted between stable markers
  - DAG-based output schema
  - blocker and escalation rules
- [ ] Make the pilot scope explicit in the prototype itself: it supports only the 5 pilot agents and is not yet a shipped `agents/` asset.
- [ ] Add test coverage ensuring the roster generator preserves exact `deliverable_id: title` pairs from `registry.yaml`.
- [ ] Author 3 pilot scenarios aligned only with the 5 pilot agents. Each scenario file must include:
  - the user request
  - the orchestrator DAG output
  - each agent's deliverable summary
  - handoff data between agents
  - where tool lookups added value
  - where blockers required user input
- [ ] Validate the embedded DAG blocks in those scenarios with `scripts/validate-dag.sh`.

**Implementation decision:** The roster section in `docs/orchestrator-pilot.md` should be generated between explicit markers such as `<!-- roster:start -->` and `<!-- roster:end -->`. Treat these markers the same way as deliverable markers: prompt-visible, terse, and structural only. Promotion to `agents/orchestrator.md` is a Phase 2 task gated on full 51-agent registry coverage and validator updates for non-specialist agent types.

**Test scenarios:**
- The roster reflects the current pilot registry exactly.
- A scenario with invalid `depends_on` fails DAG validation.
- A scenario with an independent compliance review step and dependencies fails validation.
- A valid pilot-only DAG passes validation and produces derived graph metadata.
- No pilot scenario requires a non-pilot agent.

**Commit boundary:** One commit for roster generation + pilot orchestrator prototype, then one commit for pilot scenarios if they are substantial.

---

## Task 9: Public Documentation and Release Packaging

**Files:**
- Edit: `README.md`
- Edit: `INSTALL.md`

- [ ] Update [README.md](/mnt/d/Coding%20Projects/healthcare-agents/README.md) to explain:
  - examples and scenarios as shipped study material
  - the orchestrator as a pilot/maintainer prototype until full-catalog routing exists
  - calibration as maintainer infrastructure, not the user path
- [ ] Update [INSTALL.md](/mnt/d/Coding%20Projects/healthcare-agents/INSTALL.md) only to preserve the simple `agents/*.md` install flow and self-improvement kit path. Do not document `registry.yaml` or the maintainer calibration workflow there.
- [ ] Make sure no user-facing doc implies the registry or calibration internals are required for basic agent usage.

**Test scenarios:**
- Agent-only users can still follow the existing install path without reading maintainer docs.
- Maintainer guidance lives in maintainer docs and README, not in `INSTALL.md`, and does not disturb the `/eval` kit.

**Commit boundary:** One doc-only commit after the pilot implementation is working.

---

## Task 10: Phase 2 and Phase 3 Scale-Out

This task does not start until Phase 1 gates pass.

**Phase 1 gates:**
- Pilot calibration improves measurable score on the five pilot agents.
- Existing `/eval` assets and instructions remain unchanged, and no Phase 1 gate depends on mutating `/eval` runs.
- Registry extraction, registry-merge, DAG validation, calibration-artifact validation, and release-gate tests are stable.
- Pilot agents stay within line budgets.

- [ ] Add deliverable markers to the remaining 46 agent prompts.
- [ ] Expand `registry.yaml` from pilot-only to full-catalog coverage.
- [ ] Author the remaining examples, holdouts, seeds, and attack-surface sections, with a minimum floor of `3+` exemplars and `3+` holdouts per remaining agent.
- [ ] Expand orchestrator roster generation from pilot-only to full 51-agent coverage.
- [ ] Update validators and audit tooling so `agents/orchestrator.md` can live in `agents/` without being treated as a specialist prompt. Use explicit metadata such as `agent_type: orchestrator` or an equivalent allowlist rule.
- [ ] Promote the orchestrator from `docs/orchestrator-pilot.md` to `agents/orchestrator.md` only after the full registry and validator updates land.
- [ ] Add 5+ more scenarios after the full roster is available.
- [ ] Re-run calibration and release-gate checks across the full catalog.
- [ ] Finish Phase 3 polish from the spec: README overhaul, gap identification for new missing roles, and lifecycle/staleness operations.

**Do not start scale-out early.** The registry/parser, calibration contract, and orchestrator DAG path need to prove stable on the pilot first.

---

## Dependencies and Order of Operations

| Unit | Depends on |
|------|------------|
| Task 1 | none |
| Task 2 | Task 1 |
| Task 3 | Task 2 |
| Task 4 | Tasks 1-3 |
| Task 5 | Tasks 1-4 |
| Task 6 | Tasks 1-5 |
| Task 7 | Tasks 4-6 |
| Task 8 | Tasks 2-4 and pilot `registry.yaml` from Task 3 |
| Task 9 | Tasks 7-8 |
| Task 10 | Tasks 7-9 and all Phase 1 gates |

---

## Risks to Watch

- **Prompt-visible markers alter model behavior.**
  Keep markers terse. If behavior changes materially, move registry delimiters to sidecar metadata.

- **Registry drift from prompt edits.**
  Registry generation, merge-preservation tests, and marker-coverage tests must run before merge.

- **Pilot content authoring becomes the bottleneck.**
  Land infrastructure and content in separate commits. Do not block tooling completion on authoring all 50 pilot documents in one pass.

- **Calibration scripts become vendor-specific.**
  Keep shell entry points provider-agnostic via environment-supplied commands.

- **Calibration artifact drift breaks the research loop.**
  Validate seeds, attempt-lint results, gap reports, synthesis summaries, traces, and manifests as first-class schemas.

- **Shell entry points become a YAML parsing trap.**
  Keep Bash as the user-facing CLI layer only. Use minimal Python for schema parsing, canonicalization, and merge logic.

- **Prompt growth degrades prompt quality or future maintainer workflows.**
  Enforce budgets continuously and keep the simple `/eval` boundary untouched rather than invoking it as a gate.

---

## Definition of Done

Phase 1 is complete when all of the following are true:

- The five pilot agents have deliverable markers, registry entries, tool sections, and attack-surface sections.
- `registry.yaml` exists and drives roster generation for the pilot.
- Registry extraction, registry-merge, DAG validation, calibration-artifact validation, capability mapping, release-gate, and utility-exclusion tests all pass via `scripts/run-maintainer-checks.sh`.
- The calibration pipeline can run a full pilot pass using seed packets, prompt templates, attempt-lint, holdouts, gap reports, synthesis summaries, trace files, and run manifests.
- `docs/orchestrator-pilot.md` exists and can emit valid pilot-only DAGs backed by the registry.
- `README.md` and `INSTALL.md` explain the new surface without breaking the old install path or overstating orchestrator coverage.
- The existing `/eval` loop remains untouched as a boundary, and Phase 1 does not depend on mutating `/eval` runs or cross-run score comparisons.
