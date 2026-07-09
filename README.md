<p align="center">
  <img src="docs/assets/healthcare-agents-hero.png" alt="Healthcare Agents command center showing specialist agents across revenue cycle, compliance, quality, clinical operations, payer, health IT, population health, pharmacy, strategy, and emergency preparedness workflows" width="100%">
</p>

<h1 align="center">Healthcare Agents</h1>

<p align="center">
  <strong>51 specialist AI agents for US healthcare administration.</strong><br>
  Installable prompts and skills for Claude Code, Codex, OpenCode, Cursor, Copilot, and other agentic coding tools.
</p>

<p align="center">
  <a href="#install"><img src="https://img.shields.io/badge/install-npm%20npx-success?style=flat-square" alt="Install with npm npx"></a>
  <a href="#agent-catalog"><img src="https://img.shields.io/badge/agents-51-blue?style=flat-square" alt="51 agents"></a>
  <a href="#eval-status"><img src="https://img.shields.io/badge/eval-51%2F51%20evaluated-brightgreen?style=flat-square" alt="51 of 51 agents have tracked eval rows"></a>
  <a href="#supported-tools"><img src="https://img.shields.io/badge/Claude%20%7C%20Codex%20%7C%20OpenCode%20%7C%20Cursor-compatible-8A2BE2?style=flat-square" alt="Claude, Codex, OpenCode, and Cursor compatible"></a>
  <a href="https://github.com/ajhcs/healthcare-agents/releases/tag/v1.5.0"><img src="https://img.shields.io/badge/version-1.5.0-blue?style=flat-square" alt="v1.5.0"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-green?style=flat-square" alt="Apache 2.0 license"></a>
</p>

<table>
  <tr>
    <td align="center"><strong>51</strong><br><sub>healthcare specialists</sub></td>
    <td align="center"><strong>10</strong><br><sub>administrative domains</sub></td>
    <td align="center"><strong>94.18</strong><br><sub>avg latest tracked score</sub></td>
    <td align="center"><strong>16</strong><br><sub>Operator OS workflows</sub></td>
  </tr>
</table>

Healthcare Agents is a model-agnostic prompt library for healthcare administration work: revenue cycle, quality and compliance, clinical operations, payer relations, health IT, population health, pharmacy programs, operations, strategy, and emergency preparedness.

Each agent is a long-form Markdown specialist with YAML frontmatter, role-specific source awareness, compliance boundaries, operational workflows, concrete deliverable templates, best-input guidance, output modes, and cross-agent handoff rules. The pack installs into tools that support subagents, custom instructions, repository rules, or `SKILL.md` folders.

## TL;DR

| You need | Healthcare Agents gives you |
|---|---|
| Healthcare-specific agent behavior | 51 narrow specialists instead of one generic "healthcare assistant." |
| Easier agent selection | CLI chooser, task-based docs, starter prompts, output modes, and handoff maps. |
| Practical administrative output | Appeal packets, audit binders, gap analyses, dashboards, charters, payer matrices, readiness plans, and workflow checklists. |
| Operator OS workflow support | 16 offline-first workflow evidence packs with coverage metadata, citation cards, provenance rules, and secure-environment defaults. |
| Better regulatory handling | Role-aware references to HIPAA, CMS, OIG, HEDIS, Stars, MIPS/QPP, HRSA 340B, NHSN, TEFCA, HL7/FHIR, X12, and other domain sources. |
| Portable installation | Claude Code agents, Claude/OpenCode skills, Codex agent prompts, Cursor/Windsurf/Copilot rules, Aider context, and plain Markdown. |
| Prompt quality controls | An included self-improvement kit with a frozen rubric, role baselines, scorer guidance, and append-only eval results. |

These agents are for healthcare administration support. They are not clinicians, attorneys, auditors, coders of record, billing authorities, or a safe PHI-processing environment. See [Trust and Safety](docs/trust-and-safety.md) for scope, PHI, human escalation, source freshness, and eval limits.

## Healthcare Admin Workup Engine and Operator OS

The Workup Engine routes a plain-language healthcare administration problem to a canonical workflow, primary specialist, supporting handoffs, missing questions, evidence list, safety boundaries, and a platform-ready prompt. Operator OS adds the release-gated layer around those workflows: coverage status, offline evidence packs, citation cards, fixture provenance, package validation, and secure-environment defaults.

Use the Workup Engine when you want a structured first pass for an operational problem. Use the Operator OS commands when you need to inspect the evidence-control surface behind that workflow, generate a local evidence-pack scaffold, or verify which workflows have exemplar or standard-pack coverage.

~~~bash
healthcare-agents workflows
healthcare-agents workflow denial-spike-workup
healthcare-agents operator-os coverage
healthcare-agents evidence-pack list
healthcare-agents evidence-pack show denial-spike-workup
healthcare-agents evidence-pack scaffold clean-claim-rate-decline
healthcare-agents workup "Commercial payer denial rate jumped 18 percent after a policy change and our AR days are climbing."
healthcare-agents workup "Commercial payer denial rate jumped" --data-mode synthetic_only
healthcare-agents workup "Commercial payer denial rate jumped" --data-mode public-evidence
healthcare-agents workup "Prepare a HIPAA evidence checklist for a vendor security review." --target copilot
healthcare-agents export m365-declarative-agent denial-spike-workup
~~~

### What a workup returns

Each routed workup includes:

- the selected workflow and routing confidence;
- the primary specialist and handoff agents;
- missing required inputs and optional evidence questions;
- evidence to collect from local systems or accountable owners;
- red flags and safety constraints;
- a platform-specific prompt for Codex, Claude, GitHub Copilot, or Microsoft 365 Copilot;
- evidence-pack context when the workflow has Operator OS coverage;
- optional fixture case data when an explicit data mode asks for it.

### Operator OS coverage

Version 1.5.0 gives all 16 workflow-pack entries an Operator OS status. Denial Spike is the first exemplar; the remaining workflows ship as standard packs with offline evidence metadata and citation-card scaffolds.

| Workflow | Category | Status | Primary specialist |
|---|---|---|---|
| `denial-spike-workup` | Revenue Cycle | exemplar | `revenue-cycle-specialist` |
| `clean-claim-rate-decline` | Revenue Cycle | standard pack | `revenue-cycle-specialist` |
| `payer-contract-underpayment-review` | Payer Contracting | standard pack | `revenue-contract-analyst` |
| `prior-authorization-appeal-workup` | Clinical Administration | standard pack | `clinical-prior-authorization-specialist` |
| `discharge-barrier-workplan` | Care Coordination | standard pack | `clinical-case-manager` |
| `hipaa-security-evidence-checklist` | Compliance | standard pack | `quality-compliance-officer` |
| `survey-readiness-gap-review` | Compliance | standard pack | `quality-accreditation-specialist` |
| `patient-safety-rca2-workup` | Quality and Safety | standard pack | `quality-patient-safety-officer` |
| `ed-boarding-capacity-workup` | Operations | standard pack | `operations-hospital-administrator` |
| `ambulatory-access-backlog` | Operations | standard pack | `operations-ambulatory-manager` |
| `value-based-care-downside-risk-readiness` | Value-Based Care | standard pack | `payer-value-based-care-manager` |
| `hedis-stars-gap-closure-sprint` | Quality | standard pack | `quality-improvement-specialist` |
| `hl7-fhir-interface-incident` | Health IT | standard pack | `healthit-interoperability-engineer` |
| `clinical-dashboard-specification` | Analytics | standard pack | `healthit-clinical-data-analyst` |
| `pharmacy-contract-scorecard` | Pharmacy | standard pack | `pharmacy-benefits-specialist` |
| `emergency-preparedness-exercise-readiness` | Emergency Preparedness | standard pack | `emergency-preparedness-coordinator` |

The source of truth is [workflows/operator-os-coverage.json](workflows/operator-os-coverage.json). The human-readable table lives in [Operator OS Catalog Coverage](docs/operator-os/catalog.md).

Denial Spike is the first Operator OS exemplar. It ships with a versioned, offline-first evidence pack and citation cards that identify source families, lookup paths, review owners, verification status, and red flags without requiring live network access. Runtime case enrichment is explicit-mode only: default workups use the prompt plus public evidence-pack metadata, while synthetic demo data requires `--data-mode synthetic_only` or `--data-mode hybrid_synthetic_public` and every generated field carries provenance. Hyphenated data-mode aliases such as `--data-mode public-evidence` are accepted for CLI ergonomics. Live evidence refresh/search and private case ingestion are future maintenance paths, not default runtime dependencies.

### Evidence packs and citation cards

Evidence packs are committed, offline-first source-control artifacts. They do not store payer portal exports, private contract text, downloaded policy payloads, PHI, screenshots, or live-search results. They tell the agent which source families, local lookup paths, required fields, owners, and red flags matter for a workflow.

Citation-card statuses are intentionally conservative:

| Status | Meaning |
|---|---|
| `verified-pinpoint` | Exact source text or citation was locally verified. This is rare in the public pack. |
| `source-family-not-pinpoint` | The pack names the right source family and lookup path, but not an exact verified citation. |
| `local-policy-required` | Final interpretation depends on local policy, payer contract, provider manual, legal/compliance owner, clinical owner, coding owner, or system owner. |
| `expired-review` | The card is stale and cannot be active in a release pack. |

This is deliberate. The catalog is designed for Azure, Codex Cloud, locked-down enterprise workstations, and other secure environments that cannot rely on live external fetching. Live evidence refresh/search, payer portal connectors, private case ingestion, and MCP adapters are future integration paths, not default runtime dependencies.

### Case data modes and provenance

Runtime case enrichment is explicit-mode only. Default workups use the prompt and public workflow metadata. Fixture or evidence metadata appears only when the user requests a data mode.

| Data mode | Network? | Private data? | Behavior |
|---|---:|---:|---|
| `prompt_only` | No | No | Default. No case-data enrichment. |
| `public_evidence` | No | No | Attaches offline evidence-pack metadata for the routed workflow. |
| `synthetic_only` | No | No | Attaches deterministic synthetic fixture data where a fixture exists. |
| `hybrid_synthetic_public` | No | No | Combines synthetic fixture data with evidence-pack metadata. |
| `public_search` | Disabled | No | Reserved for a future explicit refresh/search adapter; fails closed today. |
| `internal_private` | No by default | Requires future local input | Reserved for future governed private-data ingestion; fails closed today. |

Hyphenated aliases are accepted for CLI ergonomics, so `--data-mode public-evidence` and `--data-mode hybrid-synthetic-public` normalize to the underscore forms.

Every generated fixture field carries provenance:

| Provenance | Meaning |
|---|---|
| `synthetic` | Deterministic demo or test fixture value. |
| `user_supplied` | Directly derived from the CLI prompt or future local user input. |
| `source_derived` | Derived from a named citation card, evidence-pack card, uploaded local file, or other explicit local source. |

Prompt-derived facts such as payer, product, CARC/RARC code, interface type, dashboard domain, or review scope must not be labeled as purely synthetic.

Phase 2 expands the same Operator OS pattern across the workflow catalog. Use `healthcare-agents operator-os coverage` to see exemplar and standard-pack status for all 16 workflows, and see [Operator OS Catalog Coverage](docs/operator-os/catalog.md) plus [Evidence Pack Authoring](docs/operator-os/evidence-pack-authoring.md) for coverage rules, provenance labels, citation-card status meanings, and secure-environment boundaries.

Start with the [workflow gallery](docs/workflows/README.md), [example workup packets](docs/examples/workup-packets.md), and [platform compatibility guides](docs/platforms/github-copilot.md).

## Current Release

Version 1.5.0 is the Operator OS catalog hardening release. It makes all 16
healthcare administration workflows visible through Operator OS coverage,
evidence-pack show, evidence-pack scaffold, and routed workup commands, with
offline-first standard evidence packs across the catalog. See
[the v1.5.0 release notes](docs/release-notes/2026-05-31-operator-os-catalog-hardening.md)
for dogfood evidence, release checks, and scope limits.

## Install

Codex plugin install:

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
cd healthcare-agents
bash scripts/install-codex-plugin.sh
```

For local development from this checkout:

```bash
bash scripts/install-codex-plugin.sh
```

The script creates a local Codex marketplace wrapper at `~/.healthcare-agents-codex-marketplace`, symlinks it to this repo-root plugin, runs `codex plugin marketplace add`, and installs `healthcare-agents@healthcare-agents-local`. Start a new Codex thread after installing or updating the plugin so the self-directing router is loaded.

Use natural phrasing:

```text
Use the Healthcare Agents plugin for a prior authorization appeal.
Use Healthcare Agents in the revenue cycle area for a denial spike.
Use the quality department for a survey readiness checklist.
```

Fast path:

```bash
npx --yes healthcare-agents install
```

GitHub-backed fallback:

```bash
npx --yes github:ajhcs/healthcare-agents install
```

Shell installer fallback:

```bash
curl -fsSL https://raw.githubusercontent.com/ajhcs/healthcare-agents/main/install.sh | bash
```

Target a specific tool:

| Runtime | Command |
|---|---|
| Codex plugin | `bash scripts/install-codex-plugin.sh` |
| Claude Code subagents | `npx --yes healthcare-agents install --claude` |
| Claude Skills, Claude Desktop, Claude Cowork | `npx --yes healthcare-agents install --claude-skills` |
| Codex CLI / Codex App | `npx --yes healthcare-agents install --codex` |
| OpenCode skills | `npx --yes healthcare-agents install --opencode` |
| Open Agent Skills convention | `npx --yes healthcare-agents install --agent-skills` |
| Cursor rules | `npx --yes healthcare-agents install --cursor` |
| Windsurf rules | `npx --yes healthcare-agents install --windsurf` |
| GitHub Copilot instructions | `npx --yes healthcare-agents install --copilot` |
| GitHub Copilot full repo setup | `npx --yes healthcare-agents install --copilot-all` |
| Claude workflow skills | `npx --yes healthcare-agents install --claude-workflow-skills` |
| Codex workflow skills | `npx --yes healthcare-agents install --codex-skills` |
| All known targets | `npx --yes healthcare-agents install --all` |

Preview before writing files:

```bash
npx --yes healthcare-agents install --all --dry-run
```

Inspect local install targets and collisions:

```bash
npx --yes healthcare-agents doctor
```

Install one agent instead of the full pack:

```bash
npx --yes healthcare-agents install revenue-cycle-specialist --codex
```

Update existing installs:

```bash
npx --yes healthcare-agents install --all --force
```

Uninstall:

```bash
npx --yes healthcare-agents uninstall --all
```

## Choose the Right Agent

Start with the task, not the agent name. Use the [agent selection guide](docs/usage/agent-selection-guide.md) when you know the operational problem, the [starter prompts](docs/usage/starter-prompts.md) when you want copy-ready examples, and the [handoff map](docs/usage/handoff-map.md) when the request spans departments.

The CLI exposes the same discovery surface:

```bash
healthcare-agents list --domain revenue
healthcare-agents show revenue-cycle-specialist
healthcare-agents choose "clean claim rate dropped after an EHR update"
healthcare-agents prompt quality-compliance-officer --mode audit/checklist
```

Every agent now supports four output modes:

| Ask for | When to use it |
|---|---|
| `quick triage` | Symptoms, weak data, or first-pass root cause analysis |
| `workplan` | Owners, sequence, dependencies, KPIs, and timeline |
| `audit/checklist` | Evidence requests, pass/fail criteria, remediation owners |
| `artifact/template` | A draft work product with assumptions and placeholders |

Common starting points:

| You need | Start with |
|---|---|
| Clean claim or denial problem | `revenue-cycle-specialist` |
| Survey readiness | `quality-accreditation-specialist` |
| Prior authorization delays | `clinical-prior-authorization-specialist` |
| ED boarding or capacity issue | `operations-hospital-administrator` |
| Interface or FHIR issue | `healthit-interoperability-engineer` |
| Value-based care performance | `payer-value-based-care-manager` |
| Safety event or RCA | `quality-patient-safety-officer` |
| CHNA or community benefit | `pophealth-community-health-coordinator` |

## Quick Examples

Claude Code:

```text
Use the revenue-cycle-specialist agent in quick triage mode to diagnose why our clean claim rate dropped, then list coding, contract, and prior authorization handoffs.
```

Codex:

```text
Read the quality-compliance-officer healthcare agent and use audit/checklist mode to draft a HIPAA Security Rule evidence checklist for a small clinic.
```

OpenCode:

```text
Use the revenue-contract-analyst skill to model payer contract underpayment risk from a sample allowed-amount table.
```

Rules-based tools:

```text
Using the healthit-interoperability-engineer instructions, review this HL7v2 interface mapping for common ADT and ORU risks.
```

Manual project install:

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
mkdir -p .claude/agents
cp healthcare-agents/agents/*.md .claude/agents/
```

## Why Use This

| Generic healthcare prompting | Healthcare Agents |
|---|---|
| "Follow HIPAA." | Separates Privacy Rule, Security Rule, Breach Notification, minimum necessary, BAAs, operational evidence, and escalation boundaries. |
| "Improve revenue." | Uses CARC/RARC, 837/835, charge capture, CDM, denial prevention, payer contracts, 340B, coding, and cost-report mechanics. |
| "Check quality." | Distinguishes HEDIS, MIPS/QPP, Stars, CAHPS/HCAHPS, accreditation, patient safety, infection prevention, and QI methodology. |
| "Analyze healthcare data." | Names FHIR, HL7v2, X12, C-CDA, Epic Caboodle/Cogito, USCDI, TEFCA, eCQMs, registries, and data-lineage controls. |
| "Make an operational plan." | Produces healthcare-specific work products: appeal packets, readiness binders, staffing models, audit trails, gap analyses, and KPI dashboards. |

## Supported Tools

```mermaid
flowchart LR
  A["agents/*.md<br/>source prompts"] --> B["Claude Code<br/>~/.claude/agents"]
  A --> C["Codex<br/>~/.codex/agents + AGENTS.md"]
  A --> D["Rules folders<br/>Cursor · Windsurf · Copilot"]
  A --> E["Generated SKILL.md"]
  A --> I["Codex plugin<br/>router skill + source prompts"]
  E --> F["Claude Skills<br/>Desktop · Cowork"]
  E --> G["OpenCode Skills"]
  E --> H["Open Agent Skills<br/>.agents/skills"]
```

| Tool / Standard | Install Target | Notes |
|---|---|---|
| Claude Code subagents | `~/.claude/agents/*.md` | Source prompts use lowercase hyphen `name` values matching filenames. |
| Codex plugin | repo-root `.codex-plugin/plugin.json` plus `skills/healthcare-agents/SKILL.md` | Adds one self-directing router that checks compact workflow/agent indexes, then reads one full selected source prompt. |
| Claude Skills | `~/.claude/skills/<slug>/SKILL.md` | Generated skill wrappers include `name`, `description`, `license`, and `compatibility`. |
| Claude Desktop / Claude Cowork | Claude-compatible skills | Use `--claude-desktop`, `--claude-cowork`, or `--claude-skills`. |
| Codex CLI / Codex App | `~/.codex/agents/*.md` plus `~/.codex/AGENTS.md` | Installer adds a managed discovery block telling Codex how to choose specialists, use output modes, and name handoffs. |
| OpenCode | `~/.config/opencode/skills/<slug>/SKILL.md` | Matches OpenCode's skill directory conventions. |
| Open Agent Skills | `~/.agents/skills/<slug>/SKILL.md` | Portable fallback for tools that scan a common `.agents/skills` layout. |
| Cursor | `.cursor/rules/*.md` | Installs the same Markdown prompts as project rules. |
| Windsurf | `.windsurf/rules/*.md` | Installs the same Markdown prompts as project rules. |
| GitHub Copilot | `.github/instructions/*.md` | Rename to `.instructions.md` if your Copilot setup requires that extension. |
| Gemini CLI | `~/.gemini/agents/*.md` | Installs Markdown agent files globally. |
| Cline | `.clinerules/*.md` | Installs prompt files into project rules. |
| Amazon Q Developer | `.amazonq/rules/*.md` | Installs prompt files into project rules. |
| Continue.dev | `.continue/*.md` | Installs prompts as reusable context files. |
| Aider | `.aider.conf.yml` managed `read:` block | Adds all agent prompts as read-only context entries. |

## Agent Catalog

<details open>
<summary><strong>Strategy & Advisory</strong> - 5 agents</summary>

| Agent | Specialty |
|---|---|
| `strategy-healthcare-consultant` | Service line planning, M&A, market analysis, CON strategy |
| `strategy-operations-consultant` | Lean/Six Sigma, throughput, benchmarking, predictive operations |
| `strategy-clinical-operations-consultant` | Clinical workflows, staffing models, ED/OR throughput |
| `strategy-structural-improvement-consultant` | Org redesign, governance, change management, post-merger integration |
| `strategy-actuarial-advisor` | Risk adjustment, capitation, IBNR, MLR, actuarial caveats |

</details>

<details>
<summary><strong>Clinical Operations</strong> - 8 agents</summary>

| Agent | Specialty |
|---|---|
| `clinical-utilization-management-specialist` | Medical necessity, status, notices, InterQual/MCG boundaries |
| `clinical-care-management-specialist` | Care coordination, TCM/CCM, readmission prevention, SDOH |
| `clinical-research-coordinator` | IRB, ICH-GCP E6(R3), 21 CFR Part 11, trial operations |
| `clinical-documentation-improvement-specialist` | CDI queries, CC/MCC capture, DRG optimization |
| `clinical-prior-authorization-specialist` | PA workflows, appeals, ePA, payer/state variation |
| `clinical-referral-specialist` | Referral management, network navigation, care gap closure |
| `clinical-case-manager` | Discharge planning, post-acute placement, LOS optimization |
| `clinical-infection-prevention-specialist` | NHSN, HAI surveillance, stewardship, outbreak response |

</details>

<details>
<summary><strong>Quality, Safety & Compliance</strong> - 7 agents</summary>

| Agent | Specialty |
|---|---|
| `quality-improvement-specialist` | HEDIS, MIPS/QPP, Stars, eCQMs, SPC, Baldrige |
| `quality-process-improvement-analyst` | PDSA, Lean, Six Sigma DMAIC, capability/takt math |
| `quality-patient-experience-coordinator` | CAHPS/HCAHPS, service recovery, grievance escalation |
| `quality-patient-safety-officer` | Sentinel events, RCA2, HFMEA, Just Culture, PSO boundaries |
| `quality-compliance-officer` | HIPAA, Stark, AKS, FCA, OIG, EMTALA, CIA evidence |
| `quality-risk-manager` | ERM, malpractice, claims, CRP, NPDB/state reporting boundaries |
| `quality-accreditation-specialist` | TJC, NCQA, URAC, AAAHC, DNV, survey readiness |

</details>

<details>
<summary><strong>Revenue Cycle & Finance</strong> - 6 agents</summary>

| Agent | Specialty |
|---|---|
| `revenue-cycle-specialist` | End-to-end RCM, denials, EDI, A/R, patient financial experience |
| `revenue-finance-manager` | Budgets, reserves, CMS-2552, cost accounting, margin analysis |
| `revenue-contract-analyst` | Payer contracts, fee schedules, reimbursement modeling |
| `revenue-medical-coding-specialist` | ICD-10-CM/PCS, CPT, DRG, HCC, E/M, appeals |
| `revenue-340b-program-manager` | Covered entity compliance, contract pharmacy, split billing, HRSA audits |
| `revenue-chargemaster-analyst` | CDM maintenance, price transparency, charge capture integrity |

</details>

<details>
<summary><strong>Payer & Managed Care</strong> - 6 agents</summary>

| Agent | Specialty |
|---|---|
| `payer-value-based-care-manager` | ACOs, shared savings, attribution, downside-risk readiness |
| `payer-relations-specialist` | Network development, contract negotiation, No Surprises Act |
| `payer-medicare-medicaid-specialist` | CMS regulations, CoPs, MAC requirements, dual-eligible programs |
| `payer-managed-care-analyst` | Capitation, MLR, PMPM, network adequacy |
| `payer-credentialing-enrollment-coordinator` | CAQH, PECOS, CMS-855, delegated credentialing |
| `payer-medicare-outreach-coordinator` | Beneficiary education, enrollment periods, LIS/Extra Help |

</details>

<details>
<summary><strong>Health IT & Informatics</strong> - 6 agents</summary>

| Agent | Specialty |
|---|---|
| `healthit-informatics-manager` | Clinical informatics, USCDI/TEFCA, ONC HTI-1, data governance |
| `healthit-epic-applications-analyst` | Epic build/config, Bridges, Caboodle/Cogito |
| `healthit-information-manager` | HIM operations, ROI, record retention, legal health record |
| `healthit-clinical-data-analyst` | Registries, eCQMs, MIPS, SQL/Python healthcare analytics |
| `healthit-interoperability-engineer` | HL7v2, FHIR R4, C-CDA, X12 EDI, HIE connectivity |
| `healthit-telehealth-program-manager` | Virtual care ops, licensure, RPM/RTM, payer policy matrices |

</details>

<details>
<summary><strong>Operations & Administration</strong> - 7 agents</summary>

| Agent | Specialty |
|---|---|
| `operations-hospital-administrator` | Bed management, capacity planning, throughput |
| `operations-physician-practice-manager` | wRVU compensation, MGMA benchmarking, practice operations |
| `operations-ambulatory-manager` | Clinic workflows, scheduling optimization, patient access |
| `operations-home-health-administrator` | CoPs, OASIS, PDGM, home health VBP |
| `operations-long-term-care-administrator` | SNF CoPs, MDS, PDPM, Five-Star, PBJ |
| `operations-supply-chain-manager` | GPOs, value analysis, OR supplies, recalls |
| `operations-workforce-manager` | Staffing models, scheduling, retention, workforce analytics |

</details>

<details>
<summary><strong>Population Health & Community</strong> - 3 agents</summary>

| Agent | Specialty |
|---|---|
| `pophealth-population-health-manager` | Risk stratification, care gaps, SDOH, chronic disease programs |
| `pophealth-surveillance-coordinator` | Reportable diseases, outbreak investigation, syndromic surveillance |
| `pophealth-community-health-coordinator` | CHNA, Schedule H, health equity, CHW programs, grants |

</details>

<details>
<summary><strong>Pharmacy & Drug Programs</strong> - 2 agents</summary>

| Agent | Specialty |
|---|---|
| `pharmacy-benefits-specialist` | Formulary, PBM contracts, specialty pharmacy, biosimilars |
| `pharmacy-medication-safety-specialist` | ISMP, LASA drugs, CPOE, BCMA, USP 797/800 |

</details>

<details>
<summary><strong>Emergency & Preparedness</strong> - 1 agent</summary>

| Agent | Specialty |
|---|---|
| `emergency-preparedness-coordinator` | HICS, CMS EP CoPs, surge planning, HVA |

</details>

## Eval Status

The tracked eval evidence currently covers 51/51 evaluated agents. Those 51/51 tracked improved agents have an average latest score of 94.18 in `eval/results.tsv` and `docs/eval/scorecard.json`.

The remaining eval backlog is now closed: every registry agent has role baselines, prompt coverage, and a latest scored row in `eval/results.tsv`. The repository treats these rows as internal prompt-rubric evidence only, with public claims generated from `docs/eval/scorecard.json`.

These are internal prompt-rubric results only, not certification, accreditation, legal review, coding validation, billing approval, clinical validation, compliance approval, or proof of PHI readiness.

| Source | Current value |
|---|---:|
| Agents in registry | 51 |
| Agents with tracked eval rows | 51 |
| Tracked improved agents | 51 |
| Average latest tracked score | 94.18 |

The eval kit is intentionally simple and auditable:

| File | Purpose |
|---|---|
| `.claude/commands/eval.md` | Canonical workflow for Claude Code and Codex. |
| `eval/rubric.md` | Frozen scoring rubric. |
| `eval/role-baselines/` | Expected-capability baselines for all 51 agents. |
| `eval/results.tsv` | Append-only results log. |
| `docs/eval/exam-architect-playbook.md` | Guidance for question writing and scoring behavior. |
| `docs/eval/model-tuning.md` | GPT-5.6 family role, effort, pro-mode, and migration guidance. |
| `docs/eval/gpt-5.6-migration.md` | Research evidence, architecture decision, evaluation matrix, and rollout plan. |
| `docs/eval/canary-suite.json` | Domain canaries plus HealthAdminBench-derived workflow-reliability probes. |
| `eval/run-logs/` | Local ignored artifacts for exact questions, scorer outputs, editor briefs, and summaries. |

Same-question before/after comparisons must preserve full Q001-Q025 artifacts before answers are generated. This keeps score deltas tied to the exact same exam rather than paraphrased weak areas.

The GPT-5.6 runtime path routes from compact generated indexes, then loads one selected specialist prompt. Shared platform instructions require a compact long-horizon state ledger and an evidence-backed `Completed`, `Partial`, or `Blocked` terminal status. This reduces irrelevant starting context and targets the state-loss, document-transition, and subtask-versus-full-task failures reported by HealthAdminBench; it does not claim external benchmark improvement until the actual GUI benchmark is run.

## Self-Improvement Kit

Install the eval loop into another project that already has `agents/*.md`:

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
bash healthcare-agents/scripts/install-self-improvement-kit.sh /path/to/project
```

Run in Claude Code:

```text
/eval revenue-medical-coding-specialist
```

Run in Codex:

```text
Run the healthcare self-improvement loop for revenue-medical-coding-specialist.
```

During a normal eval run, only the requested `agents/<slug>.md` file should change, `eval/results.tsv` should only receive appended rows, and local artifacts should stay under ignored `eval/run-logs/` paths.

## Repository Layout

```text
.
├── agents/                         # 51 source agent prompts
├── .claude/commands/eval.md         # canonical self-improvement workflow
├── eval/
│   ├── rubric.md                    # frozen scoring rubric
│   ├── results.tsv                  # append-only eval log
│   ├── role-baselines/              # expected capability baselines
│   └── run-logs/                    # local ignored exact-question artifacts
├── docs/eval/                       # scorecard, routing benchmark, canary suite, scorer guidance
├── docs/operator-os/                # catalog coverage and evidence-pack authoring docs
├── docs/usage/                      # agent chooser, starter prompts, handoff map
├── workflows/                       # workflow registry, Operator OS coverage, evidence packs
│   └── evidence-packs/              # offline-first evidence-pack JSON files
├── lib/operator-os/                 # data modes, provenance, fixtures, golden artifacts
├── bin/cli.js                       # GitHub-backed npx entrypoint
├── install.sh                       # multi-tool installer
└── scripts/                         # release, validation, scaffold, and self-improvement helpers
```

## Validation

Validate agent prompt structure:

```bash
bash scripts/lint-agents.sh
```

Run the full local release gate used by CI:

```bash
npm run release:check
```

Run the Operator OS validators directly:

```bash
npm run validate:evidence-packs
npm run validate:operator-os-coverage
npm run test:evidence-packs
npm run test:case-data-provider
npm run test:operator-os-coverage
```

Validate the compact GPT-5.6 router inputs and HealthAdminBench-derived reliability canaries:

```bash
npm run validate:registry
npm run validate:health-admin-canaries
```

Dogfood the Operator OS catalog:

```bash
healthcare-agents operator-os coverage --json
healthcare-agents evidence-pack list --json
healthcare-agents evidence-pack show denial-spike-workup --json
healthcare-agents evidence-pack scaffold clean-claim-rate-decline
healthcare-agents workup "CARC 197 denials doubled for imaging authorizations" --target codex --data-mode public-evidence --json
```

Release maintainers should also run:

```bash
node scripts/verify-public-release.js
node scripts/validate-public-version-sync.js
npm pack --json --dry-run
npm publish --dry-run --access public
```

Preview installer behavior:

```bash
bash install.sh --all --dry-run
```

Check CLI help:

```bash
npx --yes healthcare-agents --help
```

## Limitations

- The agents provide healthcare administration support, not final clinical, legal, coding, billing, audit, or compliance determinations.
- Operator OS evidence packs are source-family and local-governance controls. Most public cards are not verified pinpoint citations.
- Standard-pack workflows have evidence metadata and validation, but Denial Spike is the only exemplar with full golden-artifact scoring in v1.5.0.
- Live public search, scheduled evidence refresh, payer portal connectors, private payer contract ingestion, PHI-bearing upload parsing, and MCP adapters are not part of the default runtime.
- Regulations, code sets, payer policies, accreditation standards, and program manuals change. Verify against current primary sources before operational use.
- The prompts do not make an AI tool HIPAA-compliant and do not create a safe PHI-processing environment. Use approved privacy, security, de-identification, and vendor-review workflows.
- Tool support differs by runtime. The installer uses best-known current file layouts and keeps plain Markdown as the fallback.
- The eval scores measure performance against this repository's rubric and role baselines; they are not external certification.

## Troubleshooting

| Problem | Fix |
|---|---|
| `npx healthcare-agents` cannot find the package | Use `npx --yes healthcare-agents install`, confirm network access to the npm registry, or use the GitHub-backed fallback command above. |
| Existing files are skipped | Re-run with `--force` after reviewing `--dry-run` output. |
| Your tool does not auto-discover the agents | Install to a custom path with `--path <dir>` or copy the relevant `agents/<slug>.md` file into the tool's documented rule/context folder. |
| Claude/OpenCode rejects a skill name | Use v1.1.1 or newer; agent and skill names are lowercase hyphen slugs. |
| You only want one agent | Copy the specific `agents/<slug>.md` file or generated `SKILL.md` folder manually. The installer is pack-oriented. |
| `--data-mode public-evidence` fails in older installs | Upgrade to v1.5.0 or use the underscore form `--data-mode public_evidence`. |
| A workflow has no synthetic fixture | Use `--data-mode public-evidence` or plain workup mode. Only priority workflows have deterministic fixtures in v1.5.0. |

## FAQ

### Are these Claude Code agents or skills?

Both. The source files in `agents/*.md` install as Claude Code subagents. The installer can also generate one `SKILL.md` folder per agent for Claude Skills, Claude Desktop/Cowork where skills are available, OpenCode, and the open `.agents/skills` convention.

### Do these work in Codex?

Yes. The recommended Codex path is the plugin install, which loads one self-directing Healthcare Agents router and keeps the 51 source prompts as external reference. Use it for prompts like "Use the Healthcare Agents plugin for a prior authorization appeal," "Use Healthcare Agents in the revenue cycle area for a denial spike," or "Use the quality department for a survey readiness checklist."

The older installer path still works: `npx --yes healthcare-agents install --codex` copies prompts to `~/.codex/agents` and writes a managed `~/.codex/AGENTS.md` block. Use that when you want prompt files copied into your Codex home instead of installing the repo as a plugin.

### Why did the frontmatter names change?

Claude Code and OpenCode expect lowercase hyphen identifiers. v1.1.1 and newer keep human labels in `display_name` while making `name` match the filename slug.

### Can I use these for HIPAA, coding, payer, or compliance work?

Use them for structured analysis, checklists, source-aware workflows, and draft deliverables. Do not treat them as final legal, clinical, coding, billing, audit, or compliance determinations.

### Can I use these with PHI?

Only inside an environment your organization has approved for PHI, with the right vendor agreements, access controls, retention settings, and de-identification practices. The prompts themselves do not solve that governance problem.

### Does Operator OS fetch external evidence?

No. Normal workup generation, evidence-pack display, scaffold generation, tests, package validation, and release readiness do not fetch live external resources. Evidence packs contain offline metadata and lookup paths so teams can bring their own current local sources.

### What is the difference between exemplar and standard pack?

An exemplar has the full Operator OS treatment: evidence pack, citation cards, fixture/provenance support, artifact scoring, docs, and domain review. A standard pack has evidence-pack metadata, citation cards, docs, and validation, but not full golden-artifact scoring yet. In v1.5.0, `denial-spike-workup` is the exemplar and the other 15 workflows are standard packs.

### How do I publish the npm package after a release PR merges?

Publishing is maintainer-controlled. Use the [release publishing runbook](docs/release-publishing.md). The short local path is:

```bash
npm login --auth-type=legacy
npm whoami
npm run release:check
npm publish --dry-run --access public
npm publish --access public --otp=<one-time-password>
node scripts/validate-public-version-sync.js --network
node scripts/verify-public-release.js --network
```

### Can I add my own agents?

Yes. Follow the conventions in [CONTRIBUTING.md](CONTRIBUTING.md), run `bash scripts/lint-agents.sh`, and keep the agent narrow, source-aware, and operationally concrete.

## License

Apache 2.0. See [LICENSE](LICENSE).
