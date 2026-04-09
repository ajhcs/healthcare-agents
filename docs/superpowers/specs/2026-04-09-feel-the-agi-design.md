# Healthcare Agents: "Feel the AGI" Upgrade

**Date:** 2026-04-09
**Status:** Draft — pending user review
**Scope:** Orchestrator agent, per-agent upgrades (MCP intelligence, regulatory attack surfaces, calibration-driven edits), reference library, scenario library, calibration pipeline, registry, lifecycle governance.

---

## 1. Problem Statement

Healthcare Agents ships 51 specialist agents with 21,000+ lines of dense domain knowledge. The agents know things and produce templates. They do not *do* things — they cannot route tasks, recommend live data lookups, collaborate across agents, or demonstrate calibrated work product quality. Competing repos (mbse-agents) ship structural features like reference architectures, reviewer attack surfaces, and tool crosswalks that healthcare-agents lacks.

Three capabilities are needed:

1. **Agents that act, not just advise** — MCP/tool intelligence baked into workflows, not bolted on as an appendix.
2. **Multi-agent orchestration** — a routing agent that decomposes tasks into dependency-aware workflows with handoff contracts.
3. **Structural depth** — reference exemplars, regulatory attack surfaces, and calibration against gold-standard work products.

## 2. Constraints

- **Zero runtime dependencies.** Everything is `.md` or `.yaml`. No Python, no Node, no framework. The repo works with 12+ tools via file copy.
- **Backward compatible.** Users who only want `agents/*.md` are unaffected. All new infrastructure is invisible to them.
- **Pure markdown agents.** MCP/tool integration is instructions within agent prompts, not code.
- **Phased delivery.** Pilot on 3-5 agents first. Scale to 51 only after confirming calibration signal.
- **Cost-aware generation.** Sonnet for test generation, Opus for evaluation/judging.

## 3. Audiences

| Audience | What they see | What they care about |
|----------|--------------|---------------------|
| **User** | `agents/`, `references/examples/`, `scenarios/`, `README.md`, `INSTALL.md` | Clone, copy agents, get results |
| **Maintainer** | `calibration/`, `registry.yaml`, `scripts/`, `docs/lifecycle.md` | Improve agents, run calibration, manage releases |
| **Researcher** | `calibration/`, `eval/`, `docs/superpowers/specs/` | Understand methodology, reproduce results |

## 4. Repo Structure

```
healthcare-agents/
├── agents/                          # SHIPPED — user-facing agent prompts
│   ├── orchestrator.md              # routing/coordination centerpiece
│   └── *.md                         # 51+ specialist agents
│
├── references/
│   ├── examples/                    # SHIPPED — user-facing gold exemplars
│   │   ├── cm-d01-chf-complex.md
│   │   └── ...
│   └── style-guide.md              # exemplar authoring rules
│
├── scenarios/                       # SHIPPED — multi-agent workflow examples
│   ├── cardiology-service-line.md
│   └── ...
│
├── registry.yaml                    # SOURCE OF TRUTH — repo-visible, not user-facing
│
├── docs/
│   ├── mcp-capabilities.md          # tool-agnostic capability catalog
│   ├── audiences.md                 # user / maintainer / researcher roles
│   ├── lifecycle.md                 # refresh cadence, governance, release mechanics
│   └── superpowers/specs/           # design specs
│
├── calibration/                     # MAINTAINER-ONLY
│   ├── seeds/                       # structured scenario packets
│   ├── holdouts/                    # gold exemplars for scoring (never shipped)
│   ├── results/                     # gap reports, synthesis summaries
│   ├── applied/                     # traceability: gap_id -> prompt edit -> commit
│   ├── rubric.yaml                  # calibration rubric (separate from eval/)
│   ├── run-manifests/               # model, prompt version, date, cost, hashes
│   ├── lint-references.sh           # deterministic lint
│   └── run-calibration.sh           # Sonnet test + Opus judge
│
├── eval/                            # UNTOUCHED — canonical simple loop
│   ├── rubric.md                    # frozen
│   ├── results.tsv                  # append-only
│   ├── role-baselines/
│   └── harness/                     # existing Python harness
│
├── scripts/
│   ├── generate-registry.sh         # agents/*.md -> registry.yaml skeleton
│   ├── generate-roster.sh           # registry.yaml -> orchestrator roster
│   ├── lint-agents.sh               # existing + line-budget enforcement
│   ├── lint-references.sh           # reference/holdout validation
│   ├── validate-dag.sh              # orchestrator output DAG validation
│   ├── audit-agents.py              # existing
│   └── install-self-improvement-kit.sh  # existing
│
└── README.md
```

## 5. Registry — Single Source of Truth

### 5.1 Purpose

`registry.yaml` defines every agent, its deliverables, routing triggers, tool opportunities, and growth budget. The orchestrator roster, calibration seeds, lint checks, and reference exemplars all derive from the registry. Nothing else is authoritative for this information.

`registry.yaml` is repo-visible (users can see it on GitHub) but not a user-facing product asset. It is not referenced in `INSTALL.md` or required for agent usage. Same category as `scripts/` — public but not part of the user contract.

### 5.2 Schema

```yaml
agents:
  - slug: string                     # filename without .md
    name: string                     # display name from frontmatter
    domain: string                   # one of: strategy, clinical-operations,
                                     #   quality-safety-compliance, revenue-cycle,
                                     #   payer-managed-care, population-health,
                                     #   health-it, operations, pharmacy, emergency
    deliverables:
      - id: string                   # globally unique, e.g. "cm-d01"
        title: string                # exact title from <!-- deliverable: --> marker
        prompt_section: string       # heading path where deliverable lives
    routing_triggers: [string]       # keywords/phrases that route to this agent
    tool_opportunities:
      - trigger: string              # situation description
        capability_class: string     # from capability taxonomy (Section 8)
        query_template: string       # what to look up
        materiality: string          # why the lookup matters
    line_budget: int                 # current lines + 150, hard cap
    regulatory_refresh: string       # quarterly | annually | as-needed
    refresh_owner: string            # maintainer | contributor
    
utility_agents:                      # excluded from registry generation,
  - eval-exam-architect              # roster, and calibration
```

### 5.3 Registry Generation

A script (`scripts/generate-registry.sh`) reads each agent file and produces the registry skeleton:

- **Agent identity:** Extracted from YAML frontmatter (`name`, `description`).
- **Deliverables:** Extracted from `<!-- deliverable: Title -->` HTML comment markers in the agent file. NOT from heading levels. Everything between two consecutive markers (or between a marker and the next `## ` heading) belongs to that deliverable.
- **Exclusions:** Agents listed in `utility_agents` or with frontmatter `utility: true` are skipped.

The skeleton is then manually curated to add `routing_triggers`, `tool_opportunities`, `line_budget`, and `regulatory_refresh`. The script warns when agent files diverge from the registry (new deliverables added without registry update, deliverable titles changed, etc.).

### 5.4 Deliverable Marker Convention

Agents use HTML comment markers to identify deliverable boundaries:

```markdown
## Your Technical Deliverables

<!-- deliverable: Coding Audit Report -->
### Coding Audit Report

(content...)

<!-- deliverable: CDI Query Effectiveness Report -->
### CDI Query Effectiveness Report

(content...)
```

Markers are invisible in rendered markdown and in tools that consume `.md` as a prompt. A one-time migration script adds markers to all 51 agents.

**Parser rule:** Scan for `<!-- deliverable: (.+) -->`. Nested `###` headings within a deliverable block are children. A naive "all `###` after deliverables" parser will misclassify nested headings in agents like `healthit-epic-applications-analyst.md`, `pophealth-surveillance-coordinator.md`, and `strategy-structural-improvement-consultant.md`.

**Fixture suite:** Test registry extraction against these three agents specifically, plus any agent with 3+ levels of heading nesting under Technical Deliverables.

## 6. Reference Library

### 6.1 Examples vs. Holdouts

- `references/examples/` — user-facing gold exemplars. Shipped with the repo. Users study these.
- `calibration/holdouts/` — calibration-only targets. Never shipped as examples. The judge scores agent output against holdout expectations, not the full holdout document.

Shipping calibration targets as user examples leaks the answer key. These sets must never overlap. Holdouts live under `calibration/holdouts/`, not `references/`, to enforce this separation structurally.

### 6.2 Exemplar Frontmatter (Normative Schema)

```yaml
---
exemplar_id: string                  # globally unique
agent_slug: string                   # must exist in registry
agents_relevant: [string]            # agent slugs — stored once, tagged many
deliverable_id: string               # from registry
deliverable_title: string            # from registry
scenario_summary: string
complexity: routine | moderate | high
mcp_servers_relevant: [string]       # capability classes, not product names

regulatory_as_of: string             # YYYY-MM-DD
source_basis: [string]               # real regulations/frameworks that inform content
generated_by: string                 # model ID
reviewed_by: string                  # model ID or "human"
review_status: draft | reviewed | stale
review_date: string                  # YYYY-MM-DD
---
```

### 6.3 Holdout Frontmatter (Normative Schema)

```yaml
---
holdout_id: string
agent_slug: string
agents_relevant: [string]
deliverable_id: string
deliverable_title: string
seed_ref: string                     # seed_id this was generated from

scenario_summary: string
complexity: routine | moderate | high

regulatory_as_of: string
source_basis: [string]
generated_by: string
reviewed_by: string
review_status: draft | reviewed | stale
review_date: string
frozen: bool                         # once reviewed, content locked until re-review
superseded_by: string | null
retirement_trigger: string           # human-readable staleness condition

expectations: [string]               # extracted at review time, used by judge
---
```

**Freeze rule:** When `frozen: true`, any content edit requires `review_status` to reset to `draft` and a new `reviewed_by` pass.

### 6.4 Cross-Domain References

References are stored once and tagged with `agents_relevant: [slug1, slug2]`. No duplicate files. The orchestrator and individual agents reference by filename.

### 6.5 PHI Safety

All synthetic patient data must be obviously fictional:
- Names: culturally diverse, clearly fictional (no celebrity names)
- MRNs: 7-digit numbers starting with `44xxxxx`
- NPIs: valid Luhn check digit but not assigned in NPPES
- DOBs: no real person matching demographics
- Facilities: generic names ("Valley Medical Center", "Riverside Health System")

### 6.6 Style Guide

`references/style-guide.md` governs tone, granularity, and structural rules for all exemplars and holdouts. Key rules:
- Write as a senior practitioner, not as an AI describing a deliverable
- 50-150 lines per document
- No meta-commentary, no hedging
- Follow the deliverable template from the agent prompt (filled in, not bracketed)
- All citations must be verifiable against public sources

### 6.7 Volume

Pilot: 5 agents x ~10 references each (split ~5 examples / ~5 holdout) = ~50 documents. Full scale: ~350-400 documents as end-state, not v1.

## 7. Calibration Pipeline

### 7.1 Purpose

The existing `/eval` loop tests knowledge breadth ("can this agent answer domain questions well?"). Calibration tests deliverable depth ("when this agent produces a work product, does it match what a senior practitioner would produce?"). Different purpose, different namespace, different artifacts.

Calibration lives under `calibration/`, not `eval/`. The existing eval loop is untouched.

### 7.2 Pipeline Stages

```
Stage 1: GENERATE   — Sonnet reads agent prompt + structured seed -> produces deliverable
Stage 2: LINT       — Deterministic checks -> structured lint result
Stage 3: JUDGE      — Opus scores attempt vs rubric + expectation checklist from holdout
Stage 4: SYNTHESIZE — Opus reads all gap reports for one agent -> structured findings
Stage 5: UPGRADE    — Human reviews findings -> agent prompt edited with traceability
```

### 7.3 Stage 1: Generate (Sonnet)

Sonnet receives:
- The full agent `.md` as system prompt
- A structured scenario seed packet (not the holdout document)
- Instruction: "Produce the [deliverable_title] for this scenario"

Sonnet does NOT see the holdout. It only has the agent prompt and the seed.

### 7.4 Scenario Seed Packet (Normative Schema)

```yaml
seed_id: string                      # globally unique, e.g. "cm-seed-003"
agent_slug: string                   # must exist in registry
deliverable_id: string               # must exist in registry for this agent
deliverable_title: string            # from registry

required_facts:                      # dict — agent must use these
  key: value                         # sufficiently specified to produce deliverable

intentionally_unknown:               # list — agent should acknowledge, not invent
  - string

red_flags:                           # dict — senior practitioner would catch
  flag_key: string                   # expected behavior if caught

mcp_uncertainty_points:              # list — ONLY where MCP scoring applies
  - fact: string                     # what's uncertain in the scenario
    capability_class: string         # from capability taxonomy
    action: string                   # what the lookup would resolve

holdout_ref: string                  # filename in calibration/holdouts/
```

**Design rationale:**
- `required_facts` provides enough information to produce a real deliverable. No penalty for missing facts we never provided.
- `intentionally_unknown` is explicit. The agent should flag these as gaps, not fabricate. Judging rewards acknowledgment of uncertainty.
- `red_flags` are things a senior practitioner would catch. Missing them is a real signal.
- `mcp_uncertainty_points` are the ONLY places MCP awareness is scored. No false negatives from static generation. Each point references a `capability_class` from the taxonomy, not a product name.

### 7.5 Stage 2: Lint (Deterministic)

**Lint Result (Normative Schema):**

```yaml
seed_id: string
agent_slug: string
timestamp: string                    # ISO 8601

missing_sections: [string]           # deliverable template sections not found
unresolved_placeholders: [string]    # "[brackets]", "[____]", "TBD"
citation_parse_failures:
  - raw_text: string
    expected_pattern: string         # ICD-10, CPT, CFR, etc.
static_mcp_claims: [string]          # "verified via X" in static output
min_length_met: bool
frontmatter_valid: bool
overall_pass: bool
```

Lint failures are logged as signal for Stage 3, not hard blockers. They become structured data in the gap report.

### 7.6 Stage 3: Judge (Opus)

Opus receives three inputs:
1. The expectation checklist extracted from the holdout (NOT the full holdout document)
2. Sonnet's generated attempt
3. The calibration rubric

**Judging is against rubric + expectation checklist, not direct exemplar similarity.** Healthcare deliverables have multiple valid outputs. The judge checks "did it hit the checkpoints a senior practitioner would hit?" not "does it look like our exemplar?"

**Calibration rubric dimensions (scored 0-4 each):**

| Dimension | What it measures |
|-----------|-----------------|
| Structural completeness | Covers all sections the deliverable type requires? |
| Regulatory precision | Citations specific and correct? CFR numbers, code specificity? |
| Clinical realism | Would a practitioner recognize this as plausible work product? |
| Actionability | Could someone act on this without further research? |
| MCP awareness | Where seed has `mcp_uncertainty_points`, does agent recognize lookup value? Null if seed has no uncertainty points. |

### 7.7 Per-Deliverable Gap Report (Normative Schema)

```yaml
seed_id: string
agent_slug: string
deliverable_id: string
generated_by: string                 # model ID (Sonnet)
judged_by: string                    # model ID (Opus)
timestamp: string

scores:
  structural_completeness: 0-4
  regulatory_precision: 0-4
  clinical_realism: 0-4
  actionability: 0-4
  mcp_awareness: 0-4 | null
  weighted_total: float

expectation_checklist:
  - expectation: string
    met: true | false | partial
    notes: string

lint: <lint result>                  # embedded structured lint output

gaps:
  - gap_id: string                   # globally unique
    gap_type: enum
    severity: high | medium | low
    dimension: string                # which score axis
    evidence: string                 # what specifically was wrong
    likely_prompt_fix: string        # actionable edit description
    confidence: float                # 0.0-1.0
```

**`gap_type` enum (fixed set):**
- `computational_omission` — should have computed a score/value but described generically
- `context_blindness` — ignored a seed fact or failed to flag an intentionally_unknown item
- `mcp_opportunity_missed` — seed had an uncertainty point, agent didn't recognize lookup value
- `specificity_gap` — correct direction but vague where specific citations were needed
- `structural_omission` — missing a required section of the deliverable
- `regulatory_error` — cited wrong regulation or applied guideline incorrectly
- `clinical_implausibility` — output a practitioner would reject as unrealistic
- `hallucinated_citation` — cited a regulation, code, or source that does not exist

### 7.8 Stage 4: Synthesize (Opus)

Opus reads all gap reports for one agent and produces a structured calibration summary.

**Output contract — per-gap fields, not narrative:**

```yaml
agent_slug: string
calibration_run_id: string
date: string

systematic_strengths:
  - dimension: string
    evidence: string
    mean_score: float

systematic_gaps:
  - gap_type: string
    recurrence_count: int            # how many holdouts showed this pattern
    severity: high | medium | low
    evidence_summary: string         # aggregated across gap reports
    likely_prompt_fix: string
    confidence: float
    promotion_eligible: bool         # meets promotion criteria (see Section 9.3)

recommended_edits:
  - target_section: string           # exact heading in agent prompt
    edit_type: strengthen | add_conditional | add_example | fix_error
    description: string
    source_gap_ids: [string]         # traceability to specific gaps
```

The human-readable summary is rendered FROM this structure, not authored as prose.

### 7.9 Stage 5: Upgrade (Human-in-the-Loop)

The synthesis is a recommendation. A human reviews, decides which findings to apply, and commits. This is not automated end-to-end.

### 7.10 Run Manifest

Each calibration run produces:

```yaml
run_id: string
date: string
agents_tested: [string]
generator_model: string
judge_model: string
agent_prompt_versions:               # commit hash per agent at run time
  agent_slug: string
seeds_used: int
holdouts_used: int
lint_pass_rate: float
mean_calibration_score: float
estimated_cost_usd: float
human_qa_sample: int                 # spot-checked gap reports
human_qa_concordance: float | null   # % agreement with Opus judge
```

`human_qa_sample` addresses model-judge trust. Periodic spot checks, tracked per run.

### 7.11 Cost Estimate (Pilot)

- ~25 holdouts x 1 Sonnet generation = ~25 Sonnet calls
- ~25 Opus judge calls + 5 Opus synthesis calls = ~30 Opus calls
- Total: ~$5-10 per full pilot calibration pass

## 8. Tool Capability Taxonomy

### 8.1 Purpose

Agents recommend external data lookups by `capability_class`, not by product name. This keeps the repo tool-agnostic (works with any MCP server, API, or manual lookup that provides the capability) and prevents impossible claims.

### 8.2 Capability Classes

```yaml
capability_classes:
  provider_directory:
    description: "Look up provider NPI, taxonomy, practice address, enrollment status"
    does_not_do: "Board certification, malpractice history, sanctions, licensure verification"
    example_servers: [NPI Registry, NPPES direct]

  coverage_determination:
    description: "Check NCD/LCD coverage policies for procedures, services, DME under Medicare Part B"
    does_not_do: "Part D formulary, Part A inpatient coverage, commercial payer policies"
    example_servers: [CMS Coverage]

  coding_edit_policy:
    description: "Verify NCCI column1/column2 edits, MUEs, modifier indicators"
    does_not_do: "DRG grouping, HCC mapping, fee schedule lookup"
    example_servers: [CMS Coverage NCCI subset, direct CMS NCCI files]

  trial_registry:
    description: "Search clinical trials by condition, phase, eligibility, location, sponsor"
    does_not_do: "Published results, full protocols, regulatory submissions"
    example_servers: [ClinicalTrials.gov]

  literature_search:
    description: "Search biomedical literature by topic, author, MeSH terms"
    does_not_do: "Full text retrieval for all articles, non-biomedical literature"
    example_servers: [PubMed]

  current_regulatory_policy:
    description: "Check recent CMS transmittals, proposed rules, final rules, program updates"
    does_not_do: "Historical regulatory interpretation, state-specific Medicaid policy"
    example_servers: [CMS Coverage what's new, Federal Register]

  drug_coverage_exclusion:
    description: "Check SAD exclusion list for Part B billing eligibility of specific drugs"
    does_not_do: "Part D formulary coverage, drug pricing, therapeutic alternatives"
    example_servers: [CMS Coverage SAD list]
```

### 8.3 Validation Rule

Every `tool_opportunity` in the registry must reference a `capability_class`. A capability-mapping test rejects any `query_template` that references a capability the class explicitly lists under `does_not_do`.

## 9. Agent Upgrade Pattern

### 9.1 Three Upgrade Categories (Applied in Order)

1. **Calibration-driven edits** — evidence-backed fixes from the pipeline
2. **External Data & Tool Use section** — MCP/tool intelligence
3. **Regulatory attack surfaces** — what auditors actually challenge

### 9.2 Calibration-Driven Edit Rules

- Only apply gaps meeting promotion criteria (Section 9.3)
- Each edit traces to a `gap_id` via `calibration/applied/<agent>.yaml`
- Edits go into existing sections, not new sections
- **Exception:** `structural_omission` may add a new deliverable subsection under Technical Deliverables when ALL THREE conditions are met:
  1. The deliverable is core to the role (appears in professional standards)
  2. The current prompt truly lacks it (not a variation of existing)
  3. At least 2 holdouts independently reveal the gap
- **Anti-overfitting rule:** Edits must generalize the pattern the gap revealed. Holdout-specific facts must never be copied into the prompt. If a holdout showed a LACE score of 14, the prompt fix is "add worked LACE computation example" — not "mention that COPD patients with 3 prior ED visits score 14."

### 9.3 Promotion Criteria

A calibration gap is promoted to a prompt edit when EITHER:
- `severity: high` with `confidence >= 0.7` from a single holdout, OR
- Same `gap_type` + matching evidence pattern across 2+ holdouts, regardless of individual confidence scores

Gaps meeting neither criterion are logged in the traceability artifact under `rejected_gaps` with reason. They become candidates for the next calibration round.

### 9.4 Applied Upgrade Traceability (Normative Schema)

```yaml
agent_slug: string
calibration_run_id: string
calibration_date: string

applied_gaps:
  - gap_id: string
    gap_type: string
    prompt_section: string           # exact section header where edit landed
    edit_summary: string
    commit: string                   # git short hash
    promotion_reason: high_severity | recurrence
    recurrence_count: int | null

rejected_gaps:
  - gap_id: string
    reason: string
```

### 9.5 External Data & Tool Use Section

Every agent gets a new section: `## External Data & Tool Use`

**Design rules:**
- Tool-agnostic framing. "If you have access to a provider lookup service" not "If the NPI Registry MCP server is connected."
- Only ask about tool access when the lookup would materially change the answer.
- Capability names reference the taxonomy (Section 8), not product names.
- Global section provides the pattern and server catalog.
- Inline conditional hooks land at the specific workflow step where calibration found an `mcp_opportunity_missed`. Locality matters.

**Inline hook format (added to workflow steps):**

```markdown
7. **Arrange post-acute services** — home health, DME, outpatient therapies,
   specialist follow-up; confirm insurance coverage. If the receiving
   facility's credentials are uncertain and a provider directory tool is
   available, verify active NPI and enrollment status before finalizing
   the referral.
```

**Global section structure:**

```markdown
## External Data & Tool Use

This section describes external tools that enhance your capabilities when
available. Your core sections are complete and self-sufficient without tools.

### Detecting Tool Availability

Before recommending a tool-based action, determine whether the tool is
accessible. If unclear, ask. Do not assume availability. Do not fabricate
tool outputs.

### When to Recommend Connecting a Tool

| Situation | Capability needed | Why |
|-----------|------------------|-----|
| [agent-specific situations from registry tool_opportunities] |

### Conditional Workflow Pattern

Act on what you know, flag where a lookup would add value:

> "Based on the documentation, [analysis]. If you have access to
> [capability type], I'd recommend verifying [specific fact] because
> [specific reason for this task]."
```

### 9.6 Regulatory Attack Surfaces

Every agent gets a new section: `## What Auditors Actually Challenge`

**Capped at 4-6 items per agent.** Each item uses an HTML comment marker for lint detection:

```markdown
## What Auditors Actually Challenge

<!-- attack-surface: tcm-interactive-contact -->
### 1. TCM Billing Without Interactive Contact Documentation
- **What goes wrong**: Organization bills 99495/99496 but the medical
  record lacks documentation of interactive contact within 2 business
  days of discharge
- **Why it's caught**: RAC reviews target TCM claims where 2-business-day
  contact is missing or documented only as "attempted"
- **How to prevent it**: EHR template requires documented successful
  contact before TCM claim releases
- **Source**: OIG Work Plan 2025
- **Evidence type**: OIG_work_plan
- **Source confidence**: high
- **As of**: 2026-04-01
```

**Provenance rules:**
- `evidence_type` is a fixed set: `CFR`, `MLN`, `OIG_work_plan`, `joint_commission_standard`, `cms_survey_finding`, `observed_payer_pattern`, `published_audit_report`
- `source_confidence`: `high` (published federal source with specific citation), `medium` (published source, general reference), `low` (observed pattern without published citation)
- Only `high` and `medium` ship in agent prompts. `low` stays in calibration notes.
- `as_of` date required. Lint fails without it.

### 9.7 Prompt Growth Discipline

Each agent has a `line_budget` in `registry.yaml` = current lines + 150 (hard cap).

| Category | Typical addition |
|----------|-----------------|
| Calibration-driven edits | +20-40 lines (targeted, in existing sections) |
| External Data & Tool Use | +30-50 lines (new section) |
| Attack surfaces (4-6) | +40-60 lines (new section) |
| **Total** | **+90-150 lines** |

If an edit would exceed budget, the lowest-value existing content must be moved to `references/examples/` or docs first. Growth is a tradeoff.

**Compatibility with /eval line cap:** The existing `/eval` loop caps growth at `max(BASELINE_LINES * 1.2, BASELINE_LINES + 50)` per session. After calibration upgrades land, the next `/eval` session sees the new (larger) baseline. The eval cap applies to further growth within that session, not to calibration growth itself. No conflict — they're sequential.

**Lint enforcement:** `lint-agents.sh` checks that every agent's current line count <= its `line_budget` in the registry. If at or over budget, lint fails.

## 10. Orchestrator Agent

### 10.1 Identity

```yaml
---
name: Healthcare Operations Orchestrator
description: Routes healthcare administration tasks to specialist agents,
  coordinates multi-agent workflows, recommends external data sources,
  and ensures deliverable handoffs are complete.
---
```

### 10.2 What It Is Not

- Not a generalist. Does not produce domain deliverables. Routes to specialists.
- Not a replacement for direct agent activation when the user knows what they need.
- Not a tool gateway. Recommends tools, does not call them.
- Does not hallucinate agent capabilities. If no agent covers a need, says so.

### 10.3 Routing Contract

**Input:** Plain language task description from the user.

**Output:** Structured workflow (see Section 10.5).

**Dispatch rules:**

- **Single-agent tasks:** State which `agent_slug` to activate, which `deliverable_id` to request, scenario context, and tool recommendation if applicable.
- **Multi-agent tasks:** Produce a DAG (Section 10.5) with dependency-aware sequencing.
- **Dispatch priority:** When multiple agents could handle a task, prefer the agent whose deliverable the user will act on. Never route two agents for the same deliverable.

### 10.4 Agent Roster

Generated from `registry.yaml` by `scripts/generate-roster.sh`. NOT hand-maintained.

Format per agent:
```
| slug | name | Route when... | Key deliverables (id: title) |
```

All 51 agents listed. The generation script warns when the roster diverges from the registry.

### 10.5 Orchestrator Output Schema (DAG-Based)

```yaml
workflow:
  title: string

  steps:
    - step_id: int
      agent_slug: string             # from registry
      agent_name: string             # from registry
      deliverable_id: string         # from registry
      deliverable_title: string      # from registry
      why: string
      required_inputs:
        - source: user | step_{n}
          data: string
      outputs_passed_forward:
        - field: string
          consumers: [int]           # step_ids
      depends_on: [int]              # step_ids — THE SINGLE TRUTH
      independent_review: bool       # if true, must not receive other agents' work
      tool_recommendation:
        capability_class: string | null
        query_template: string | null
        materiality: string | null

  # DERIVED from depends_on — not manually authored
  derived:
    parallelizable_groups: [[int]]
    critical_path: [int]
    fan_in_point: int | null

  blockers:
    - type: missing_input | compliance_escalation | domain_conflict | no_covering_agent
      condition: string
      affects: [int]                 # step_ids
      escalate_to: user
      workflow_status: blocked | paused | partial
      resolution: string
```

**`depends_on` is the single truth.** Parallel groups, critical path, and fan-in are computed/derived, never manually authored. A DAG validator rejects circular dependencies, invalid references, and `independent_review: true` steps with non-empty `depends_on`.

### 10.6 Handoff Schema

```yaml
# For each agent transition:
handoff:
  from_step: int
  to_step: int
  passes: [string]                   # specific data elements
  does_not_pass: [string]            # what receiving agent derives independently
  conflict_protocol:
    on_disagreement: surface_to_user
    escalate_to: user
    workflow_status: paused
```

### 10.7 Estimated Size

~440 lines total. Comparable to a specialist agent. Dense with routing logic rather than domain knowledge.

## 11. Scenarios

Multi-agent workflow examples in `scenarios/`. Each shows a complete orchestration:

- The user's request
- The orchestrator's DAG output
- Each agent's deliverable summary
- Handoff data between agents
- Where tool lookups added value
- Where blockers required user input

3-5 scenarios for the pilot, aligned with pilot agents.

## 12. Lifecycle & Governance

### 12.1 Refresh Cadence

| Artifact | Cadence | Trigger |
|----------|---------|---------|
| Agent prompts | As needed via calibration | Calibration finding or regulatory change |
| Attack surfaces | Annually minimum | OIG Work Plan publication (~October) |
| Reference exemplars | When `regulatory_as_of` stale | ICD FY change (Oct 1), CPT (Jan 1), NCCI quarterly |
| Calibration holdouts | When `regulatory_as_of` stale | Same triggers as exemplars |
| Registry | When agents added/removed/restructured | Agent file changes |
| Orchestrator roster | Regenerated from registry | Registry changes |

### 12.2 Review Status Lifecycle

`draft` -> `reviewed` -> `stale` -> (updated -> `draft`) or (retired)

### 12.3 Release Mechanics

1. Calibration runs on a feature branch
2. Findings reviewed by maintainer
3. Agent edits applied with traceability (`calibration/applied/*.yaml`)
4. Lint passes (line budgets, frontmatter, citations, attack surface provenance)
5. PR opened against main
6. Shipped: `agents/`, `references/examples/`, `scenarios/`, `registry.yaml`
7. Not shipped internals: `calibration/` holdouts, seeds, gap reports

### 12.4 Backward Compatibility

Users who only want `agents/*.md` get `agents/*.md`. The registry, calibration pipeline, and research infrastructure improve agent quality but are invisible to end users.

## 13. Success Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Calibration score (pilot) | TBD | +15% after first round | `calibration/results/` |
| Eval loop score | Current `eval/results.tsv` | No regression | Existing `/eval` loop |
| Agent line count | ~420 avg | <570 avg post-upgrade | `lint-agents.sh` |
| Exemplar coverage | 0 | 5+ per pilot agent, 3+ per remaining | Registry-derivable count |
| Attack surface coverage | 0 | 4-6 per agent, high/medium confidence | Lint marker count |
| Orchestrator routing accuracy | N/A | 90%+ correct agent + deliverable | Manual eval |
| Regulatory staleness | Unchecked | 0 stale artifacts at release | Lint check |

## 14. Test Suite

| # | Test | Catches |
|---|------|---------|
| 1 | Registry extraction fixtures | Nested-heading misclassification (Epic, Surveillance, Structural Improvement) |
| 2 | DAG validator | Circular deps, invalid refs, contradictory `independent_review` |
| 3 | Capability-mapping validator | Tool claims exceeding class `does_not_do` |
| 4 | Line budget compatibility | Agent lines <= `line_budget`; no conflict with `/eval` cap |
| 5 | Release-gate staleness | Fails on `review_status: stale` or missing `regulatory_as_of` |
| 6 | Utility prompt exclusion | `eval-exam-architect.md` etc. excluded from registry/roster/calibration |
| 7 | Seed-registry consistency | Every seed's `agent_slug` + `deliverable_id` exists in registry |
| 8 | Holdout-seed linkage | Every holdout's `seed_ref` points to existing seed |
| 9 | Deliverable marker coverage | Agent deliverable markers match registry |
| 10 | Attack surface marker validation | 4-6 per agent, required provenance fields, high/medium only |

## 15. Phased Delivery

### Phase 1: Pilot (3-5 agents)

**Agents:** Medical Coding Specialist, Compliance Officer, Care Management Specialist, Healthcare Interoperability Engineer, Healthcare Strategy Consultant.

**Deliverables:**
- `registry.yaml` with pilot agents fully populated
- Deliverable markers added to pilot agents
- 5 exemplars + 5 holdouts per pilot agent (~50 documents)
- Calibration pipeline operational (seeds, lint, judge, synthesis)
- First calibration run with traceability
- Agent upgrades applied (calibration edits, tool section, attack surfaces)
- Orchestrator with pilot-agent roster and 2-3 scenarios

**Gate:** Calibration scores show measurable improvement. Eval loop shows no regression.

### Phase 2: Scale (remaining 46 agents)

**Deliverables:**
- All agents get deliverable markers and registry entries
- Full registry populated
- 3+ exemplars + 3+ holdouts per agent
- Calibration run for all agents
- Agent upgrades applied across all agents
- Orchestrator roster complete
- 5+ scenarios

**Gate:** Line budgets held. No eval regressions. Attack surfaces sourced at high/medium confidence.

### Phase 3: Polish

**Deliverables:**
- README overhaul showing orchestrator, tool integration, scenarios
- Identify agent gaps (roles needed but not covered) — add new agents if warranted
- Full scenario library (10+ scenarios)
- Lifecycle governance operational (refresh cadence, staleness checks)
