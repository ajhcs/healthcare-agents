<p align="center">
  <h1 align="center">Healthcare Agents</h1>
  <p align="center">
    <strong>51 eval-improved AI agents for US healthcare administration.</strong><br>
    Revenue cycle, compliance, quality, clinical operations, payer relations, health IT, population health, pharmacy, strategy, and emergency preparedness.
  </p>
  <p align="center">
    <a href="#install"><img src="https://img.shields.io/badge/install-curl%20%7C%20npx-success?style=flat-square" alt="Install"></a>
    <a href="#the-51-agents"><img src="https://img.shields.io/badge/agents-51-blue?style=flat-square" alt="51 agents"></a>
    <a href="#eval-status"><img src="https://img.shields.io/badge/eval-51%2F51%20improved-brightgreen?style=flat-square" alt="51 of 51 improved"></a>
    <a href="#compatibility"><img src="https://img.shields.io/badge/Claude%20%7C%20Codex%20%7C%20OpenCode-compatible-8A2BE2?style=flat-square" alt="Claude Codex OpenCode compatible"></a>
    <a href="https://github.com/ajhcs/healthcare-agents/releases/tag/v1.1.1"><img src="https://img.shields.io/badge/version-1.1.1-blue?style=flat-square" alt="v1.1.1"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-green?style=flat-square" alt="Apache 2.0"></a>
  </p>
</p>

Healthcare Agents is a portable prompt pack for healthcare administration work. Each agent is a long-form Markdown system prompt with structured YAML frontmatter, concrete regulatory/source awareness, role-specific workflows, and deliverable templates.

The pack is designed to install cleanly into agent tools that understand subagents, project instructions, custom rules, or `SKILL.md` folders.

## Install

Fast path:

```bash
curl -fsSL https://raw.githubusercontent.com/ajhcs/healthcare-agents/main/install.sh | bash
```

Or use npm:

```bash
npx healthcare-agents install
```

Target a specific runtime:

| Runtime | Command |
|---|---|
| Claude Code subagents | `npx healthcare-agents install --claude` |
| Claude Skills / Claude Desktop / Claude Cowork | `npx healthcare-agents install --claude-skills` |
| Codex CLI / Codex App | `npx healthcare-agents install --codex` |
| OpenCode skills | `npx healthcare-agents install --opencode` |
| Open Agent Skills convention | `npx healthcare-agents install --agent-skills` |
| Cursor | `npx healthcare-agents install --cursor` |
| GitHub Copilot | `npx healthcare-agents install --copilot` |
| All known targets | `npx healthcare-agents install --all` |

Preview first:

```bash
npx healthcare-agents install --all --dry-run
```

Update existing installs:

```bash
npx healthcare-agents install --all --force
```

## Why Use This

| Generic prompt | Healthcare Agents |
|---|---|
| "Follow HIPAA" | Distinguishes HIPAA Privacy, Security, Breach Notification, and operational handoffs. |
| "Improve revenue" | Uses CARC/RARC, 837/835, charge capture, cost report, payer contract, 340B, and coding mechanics. |
| "Check quality" | Separates HEDIS, MIPS/QPP, Stars, HCAHPS/CAHPS, accreditation, patient safety, and QI methods. |
| "Use healthcare data" | Names FHIR, HL7v2, X12, C-CDA, Epic Caboodle/Cogito, USCDI, TEFCA, eCQMs, and data-lineage controls. |
| "Make a plan" | Produces checklists, charters, dashboards, appeal packets, audit binders, gap analyses, and operating playbooks. |

The agents do not give clinical advice, legal opinions, or permission to handle PHI. They provide healthcare administration expertise, source-aware workflows, and structured deliverables.

## Compatibility

| Tool / Standard | Install Target | Notes |
|---|---|---|
| Claude Code subagents | `~/.claude/agents/*.md` | Agent frontmatter now uses lowercase hyphen `name` values that match filenames. |
| Claude Skills | `~/.claude/skills/<slug>/SKILL.md` | Generated SKILL.md wrappers include valid `name`, `description`, `license`, and `compatibility` fields. |
| Claude Desktop / Claude Cowork | Claude-compatible skills | Use `--claude-desktop`, `--claude-cowork`, or `--claude-skills` to generate skill folders. |
| Codex CLI / Codex App | `~/.codex/agents/*.md` plus `~/.codex/AGENTS.md` | Installer adds a managed AGENTS.md block telling Codex how to load the matching specialist. |
| OpenCode | `~/.config/opencode/skills/<slug>/SKILL.md` | Matches OpenCode's SKILL.md directory/name requirements. |
| Open Agent Skills | `~/.agents/skills/<slug>/SKILL.md` | Portable fallback for tools that scan the common `.agents/skills` convention. |
| Cursor | `.cursor/rules/*.md` | Uses the same Markdown prompts as project rules. |
| Windsurf | `.windsurf/rules/*.md` | Uses the same Markdown prompts as project rules. |
| GitHub Copilot | `.github/instructions/*.md` | Copy as repository instruction files; rename to `.instructions.md` if your setup requires it. |
| Gemini CLI | `~/.gemini/agents/*.md` | Installs Markdown agent files globally. |
| Cline | `.clinerules/*.md` | Installs prompt files into project rules. |
| Amazon Q Developer | `.amazonq/rules/*.md` | Installs prompt files into project rules. |
| Continue.dev | `.continue/*.md` | Installs prompt files as reusable context. |
| Aider | `.aider.conf.yml` managed `read:` block | Adds all agent prompts as read-only context entries. |

Reference standards checked for this release:

- Claude Code subagents and skills: <https://code.claude.com/docs/en/sub-agents> and <https://code.claude.com/docs/en/skills>
- Codex AGENTS.md, skills, and app docs: <https://developers.openai.com/>
- OpenCode skills: <https://opencode.ai/docs/skills>

## Quick Examples

Ask Claude Code:

```text
Use the revenue-cycle-specialist agent to diagnose why our clean claim rate dropped.
```

Ask Codex:

```text
Read the healthcare agent for quality-compliance-officer and build a HIPAA Security Rule audit checklist.
```

Ask OpenCode:

```text
Use the revenue-contract-analyst skill to model payer contract underpayment risk.
```

Manual install into a project:

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
mkdir -p .claude/agents .opencode/skills
cp healthcare-agents/agents/*.md .claude/agents/
bash healthcare-agents/install.sh --path ./agents --force
```

## Eval Status

All 51 agents have been improved through the lightweight eval loop.

| Pass | Agents | Average Before | Average After | Delta |
|---|---:|---:|---:|---:|
| First before/after pass | 15 | 85.0 | 93.9 | +8.9 |
| Remaining before/after pass | 36 | 85.11 | 95.50 | +10.40 |

The active eval system is intentionally simple:

- `.claude/commands/eval.md` is the canonical workflow for Claude Code and Codex.
- `eval/rubric.md` is the frozen scoring rubric.
- `eval/role-baselines/` contains expected-capability baselines for all 51 agents.
- `docs/eval/exam-architect-playbook.md` guides question writing and scorer behavior.
- `docs/eval/model-tuning.md` documents model-role routing for current SOTA models.
- `eval/run-logs/` keeps local exact-question artifacts; raw run logs are ignored by git.

Same-question before/after comparisons must persist full Q001-Q025 question artifacts before answers are generated. This prevents score deltas from being based on paraphrased weak areas or unrecoverable question sets.

## The 51 Agents

<details>
<summary><strong>Strategy & Advisory</strong> -- 5 agents</summary>

| Agent | Specialty |
|---|---|
| `strategy-healthcare-consultant` | Service line planning, M&A, market analysis, CON strategy |
| `strategy-operations-consultant` | Lean/Six Sigma, throughput, benchmarking, predictive operations |
| `strategy-clinical-operations-consultant` | Clinical workflows, staffing models, ED/OR throughput |
| `strategy-structural-improvement-consultant` | Org redesign, governance, change management, post-merger integration |
| `strategy-actuarial-advisor` | Risk adjustment, capitation, IBNR, MLR, actuarial caveats |

</details>

<details>
<summary><strong>Clinical Operations</strong> -- 8 agents</summary>

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
<summary><strong>Quality, Safety & Compliance</strong> -- 7 agents</summary>

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
<summary><strong>Revenue Cycle & Finance</strong> -- 6 agents</summary>

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
<summary><strong>Payer & Managed Care</strong> -- 6 agents</summary>

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
<summary><strong>Health IT & Informatics</strong> -- 6 agents</summary>

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
<summary><strong>Operations & Administration</strong> -- 7 agents</summary>

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
<summary><strong>Population Health & Community</strong> -- 3 agents</summary>

| Agent | Specialty |
|---|---|
| `pophealth-population-health-manager` | Risk stratification, care gaps, SDOH, chronic disease programs |
| `pophealth-surveillance-coordinator` | Reportable diseases, outbreak investigation, syndromic surveillance |
| `pophealth-community-health-coordinator` | CHNA, Schedule H, health equity, CHW programs, grants |

</details>

<details>
<summary><strong>Pharmacy & Drug Programs</strong> -- 2 agents</summary>

| Agent | Specialty |
|---|---|
| `pharmacy-benefits-specialist` | Formulary, PBM contracts, specialty pharmacy, biosimilars |
| `pharmacy-medication-safety-specialist` | ISMP, LASA drugs, CPOE, BCMA, USP 797/800 |

</details>

<details>
<summary><strong>Emergency & Preparedness</strong> -- 1 agent</summary>

| Agent | Specialty |
|---|---|
| `emergency-preparedness-coordinator` | HICS, CMS EP CoPs, surge planning, HVA |

</details>

## Self-Improvement Kit

Install the eval loop into another project that already has `agents/*.md`:

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
bash healthcare-agents/scripts/install-self-improvement-kit.sh /path/to/project
```

Then run:

```text
/eval revenue-medical-coding-specialist
```

Or in Codex:

```text
Run the healthcare self-improvement loop for revenue-medical-coding-specialist.
```

## Validation

```bash
bash scripts/lint-agents.sh
bash install.sh --all --dry-run
```

## Limitations

- The agents are healthcare administration aids, not clinicians, attorneys, auditors, or billing authorities.
- Regulations, payer policies, and code sets change. Verify against current primary sources before operational use.
- The prompts do not process PHI safely by themselves. Use your organization's approved privacy, security, and de-identification workflows.
- Tool support differs by runtime. The installer provides the best-known current file layouts, plus plain Markdown fallback.

## FAQ

### Are these Claude Code agents or skills?

Both. The source files in `agents/*.md` install as Claude Code subagents. The installer can also generate one `SKILL.md` folder per agent for Claude Skills, Claude Desktop/Cowork where skills are available, OpenCode, and the open `.agents/skills` convention.

### Do these work in Codex?

Yes. The installer copies prompts to `~/.codex/agents` and writes a managed `~/.codex/AGENTS.md` block telling Codex how to select and read specialists. For repo-local Codex App work, keep the prompts in the repository and reference them from `AGENTS.md`.

### Why did the frontmatter names change?

Claude Code and OpenCode expect lowercase hyphen identifiers. v1.1.0 keeps human labels in `display_name` while making `name` match the filename slug.

### Can I install just one agent?

The installer installs the pack. For one-off use, copy the specific `agents/<slug>.md` file or generated `SKILL.md` folder into your tool's expected location.

### Can I use these for HIPAA, coding, or payer work?

Use them for structured analysis, checklists, source-aware workflows, and draft deliverables. Do not treat them as final legal, clinical, coding, billing, or compliance determinations.

## Contributing

Issues and improvement ideas are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Apache 2.0. See [LICENSE](LICENSE).
