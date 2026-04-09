<p align="center">
  <h1 align="center">Healthcare Agents</h1>
  <p align="center">
    <strong>51 AI agents that actually know healthcare administration.</strong><br>
    Real CFR citations. Real CMS payment models. Real deliverables. Not a chatbot with a healthcare skin.
  </p>
  <p align="center">
    <a href="#install-in-30-seconds"><img src="https://img.shields.io/badge/install-30_seconds-success?style=flat-square" alt="Install in 30 seconds"></a>
    <a href="#the-51-agents"><img src="https://img.shields.io/badge/agents-51-blue?style=flat-square" alt="51 Agents"></a>
    <a href="#eval-status"><img src="https://img.shields.io/badge/eval_score-80+-brightgreen?style=flat-square" alt="Eval Score 80+"></a>
    <a href="#compatible-tools"><img src="https://img.shields.io/badge/tools-12+-8A2BE2?style=flat-square" alt="12+ Tools"></a>
    <a href="https://github.com/ajhcs/healthcare-agents/stargazers"><img src="https://img.shields.io/github/stars/ajhcs/healthcare-agents?style=flat-square" alt="Stars"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-green?style=flat-square" alt="License"></a>
    <a href="https://github.com/ajhcs/healthcare-agents/releases"><img src="https://img.shields.io/badge/version-1.0.0-blue?style=flat-square" alt="v1.0.0"></a>
  </p>
</p>

---

Drop 22,000+ lines of healthcare administration expertise into any AI coding tool. These agents handle HIPAA compliance audits, medical coding reviews, revenue cycle management, CMS cost reports, payer contract analysis, and 45 other healthcare admin specialties -- with the depth of an MHA graduate, not a generic prompt.

> Built on the conventions of [agency-agents](https://github.com/msitarzewski/agency-agents) by [Michael Sitarzewski](https://github.com/msitarzewski).

## Install in 30 Seconds

One command. Auto-detects your tools.

```bash
curl -fsSL https://raw.githubusercontent.com/ajhcs/healthcare-agents/main/install.sh | bash
```

Or target a specific tool:

| Tool | Command |
|------|---------|
| **Claude Code** | `curl -fsSL https://raw.githubusercontent.com/ajhcs/healthcare-agents/main/install.sh \| bash -s -- --claude` |
| **Cursor** | `curl -fsSL https://raw.githubusercontent.com/ajhcs/healthcare-agents/main/install.sh \| bash -s -- --cursor` |
| **Copilot** | `curl -fsSL https://raw.githubusercontent.com/ajhcs/healthcare-agents/main/install.sh \| bash -s -- --copilot` |
| **Gemini CLI** | `curl -fsSL https://raw.githubusercontent.com/ajhcs/healthcare-agents/main/install.sh \| bash -s -- --gemini` |
| **Codex CLI** | `curl -fsSL https://raw.githubusercontent.com/ajhcs/healthcare-agents/main/install.sh \| bash -s -- --codex` |
| **Windsurf** | `curl -fsSL https://raw.githubusercontent.com/ajhcs/healthcare-agents/main/install.sh \| bash -s -- --windsurf` |
| **All tools** | `curl -fsSL https://raw.githubusercontent.com/ajhcs/healthcare-agents/main/install.sh \| bash -s -- --all` |

<details>
<summary>Manual install (git clone)</summary>

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
cp healthcare-agents/agents/*.md ~/.claude/agents/    # Claude Code
cp healthcare-agents/agents/*.md .cursor/rules/        # Cursor
cp healthcare-agents/agents/*.md .github/instructions/  # Copilot
```

</details>

Then just ask:

> *"Activate the Compliance Officer and audit our HIPAA Security Rule compliance against 45 CFR 164.308"*

Full setup instructions for all 12+ tools: **[INSTALL.md](INSTALL.md)**

## What Makes These Different

| | Generic AI | Healthcare Agents |
|---|---|---|
| **Compliance** | "Follow HIPAA" | Cites 45 CFR 164.500-534, breach notification at 164.400-414 |
| **Finance** | "Optimize revenue" | PMPM decomposition, CARC/RARC denial analysis, CMS-2552 cost reports |
| **Coding** | "Use correct codes" | CC/MCC capture rates, NCCI edits, E/M 2021+ guidelines |
| **Systems** | "Use your EHR" | Epic Caboodle/Cogito, CAQH ProView, 340B OPAIS, PECOS, NHSN |
| **Accreditation** | "Get certified" | Joint Commission tracer methodology, NCQA HEDIS measures, CMS CoPs by facility type |

**22,000+ lines** of dense domain knowledge across 51 agents. **Average 420 lines/agent** of real expertise -- regulatory citations, payment model math, system-specific workflows -- not filler.

### Real Output, Not Summaries

Ask the 340B Program Manager about contract pharmacy compliance and you get this:

```
340B CONTRACT PHARMACY COMPLIANCE ASSESSMENT
=============================================

1. ENTITY ELIGIBILITY VERIFICATION
   - Covered entity type: [Federally Qualified Health Center / DSH Hospital / ...]
   - 340B ID: [HRSA-assigned ID]
   - Registration status in 340B OPAIS: [Active / Pending]

2. CONTRACT PHARMACY NETWORK REVIEW
   - Total contract pharmacies registered: [count]
   - Chain vs. independent mix: [ratio]
   - HRSA contract pharmacy registration dates: [verify all current]

3. COMPLIANCE RED FLAGS
   [ ] Duplicate discounts -- Medicaid claims cross-referenced against 340B purchases
   [ ] Diversion -- prescriptions for non-eligible patients filled at contract pharmacy
   [ ] GPO prohibition violations (for DSH hospitals under 100 beds)
   [ ] Missing contract pharmacy agreements or expired registrations

4. RECOMMENDED ACTIONS
   ...
```

Every agent produces structured, actionable deliverables -- compliance assessments, financial models, audit checklists, gap reports. Not summaries of what a deliverable *would* look like.

## Use Cases

**HIPAA compliance audit** -- The Compliance Officer walks through 45 CFR 164.308 administrative safeguards, 164.310 physical safeguards, and 164.312 technical safeguards. Produces a gap assessment with specific remediation steps and regulatory citations.

**Revenue cycle denial management** -- The Revenue Cycle Specialist analyzes denial patterns using CARC/RARC codes, identifies root causes (registration errors, medical necessity, timely filing), and builds an appeals workflow with payer-specific requirements.

**Medical coding accuracy review** -- The Medical Coding Specialist audits documentation for CC/MCC capture, E/M level support under 2021+ guidelines, and NCCI edit compliance. Flags undercoding and overcoding with CPT/ICD-10 specifics.

**CMS cost report preparation** -- The Healthcare Finance Manager structures CMS-2552 worksheets, calculates cost-to-charge ratios, and identifies reclassification opportunities for wage index and DSH adjustments.

**Payer contract negotiation** -- The Contract Analyst models reimbursement scenarios across fee-for-service, capitation, and value-based arrangements. Compares rates against Medicare benchmarks and MGMA data.

## Eval Status

10 of 51 agents currently score **80+** on a frozen eval rubric. Each agent goes through iterative question-answer-judge-improve cycles: the scorer generates domain-specific exam questions, grades the agent's answers, identifies weak areas, and produces a targeted improvement brief. An editor model patches only the weak spots while preserving the agent's identity and voice.

| Agent | Best Score |
|-------|-----------|
| Revenue Medical Coding Specialist | 82.15 |
| Revenue Finance Manager | 81.55 |
| 340B Program Manager | 81.20 |
| Quality Compliance Officer | 81.15 |
| Healthcare Interoperability Engineer | 81.10 |
| Quality Process Improvement Analyst | 80.85 |
| Revenue Cycle Specialist | 80.65 |
| Revenue Contract Analyst | 80.45 |
| Health Informatics Manager | 80.30 |
| Payer Managed Care Analyst | 80.30 |

Full scores and iteration history: [`eval/results.tsv`](eval/results.tsv)

**Infrastructure:** The `/eval` skill runs the loop. A frozen rubric at `eval/rubric.md` keeps scoring consistent across runs. A calibration pipeline ensures scorer reliability before any agent edits land.

## The 51 Agents

<details>
<summary><strong>Strategy & Advisory</strong> -- 5 agents</summary>

| Agent | Specialty |
|-------|-----------|
| Healthcare Strategy Consultant | Service line planning, M&A, market analysis, CON strategy |
| Healthcare Operations Consultant | Lean/Six Sigma, throughput, benchmarking (MGMA/Vizient) |
| Clinical Operations Consultant | Clinical workflows, staffing models, ED/OR throughput |
| Structural Improvement Consultant | Org redesign, governance, change management, post-merger integration |
| Healthcare Actuarial Advisor | Risk adjustment (HCC/RAF), capitation, IBNR, MLR modeling |

</details>

<details>
<summary><strong>Clinical Operations</strong> -- 8 agents</summary>

| Agent | Specialty |
|-------|-----------|
| Utilization Management Specialist | Medical necessity, InterQual/Milliman, Two-Midnight Rule |
| Care Management Specialist | Care coordination, TCM/CCM, readmission prevention, SDOH |
| Clinical Research Coordinator | IRB, ICH-GCP E6(R3), 21 CFR Part 11, trial management |
| Documentation Improvement Specialist | CDI queries, CC/MCC capture, DRG optimization |
| Prior Authorization Specialist | PA workflows, appeals, gold carding, ePA (CMS-0057-F) |
| Referral Specialist | Referral management, network navigation, care gap closure |
| Case Manager | Discharge planning, post-acute placement, LOS optimization |
| Infection Prevention Specialist | HAI surveillance (NHSN), antimicrobial stewardship, outbreak response |

</details>

<details>
<summary><strong>Quality, Safety & Compliance</strong> -- 7 agents</summary>

| Agent | Specialty |
|-------|-----------|
| Quality Improvement Specialist | HEDIS, MIPS/QPP, CMS Stars, Leapfrog, eCQMs |
| Process Improvement Analyst `80+` | PDSA, Lean, Six Sigma DMAIC, value stream mapping |
| Patient Experience Coordinator | HCAHPS, service recovery, VBP patient experience domain |
| Patient Safety Officer | Sentinel events, RCA/FMEA, Just Culture, PSO reporting |
| Compliance Officer `80+` | HIPAA, Stark, Anti-Kickback, FCA, OIG compliance programs, EMTALA |
| Risk Manager | Enterprise/clinical risk, malpractice, claims management |
| Accreditation Specialist | Joint Commission, NCQA, URAC, AAAHC, DNV, survey readiness |

</details>

<details>
<summary><strong>Revenue Cycle & Finance</strong> -- 6 agents</summary>

| Agent | Specialty |
|-------|-----------|
| Revenue Cycle Specialist `80+` | End-to-end RCM, denials (CARC/RARC), A/R optimization |
| Healthcare Finance Manager `80+` | Budgets, cost accounting, CMS-2552 cost reports, margin analysis |
| Healthcare Contract Analyst `80+` | Payer contracts, fee schedules, reimbursement modeling |
| Medical Coding Specialist `80+` | ICD-10-CM/PCS, CPT, DRG, HCC, E/M coding |
| 340B Program Manager `80+` | Covered entity compliance, contract pharmacy, split billing, HRSA audits |
| Chargemaster Analyst | CDM maintenance, price transparency, charge capture integrity |

</details>

<details>
<summary><strong>Payer & Managed Care</strong> -- 6 agents</summary>

| Agent | Specialty |
|-------|-----------|
| Value-Based Care Manager | ACO operations (MSSP/ACO REACH), shared savings, risk contracts |
| Payer Relations Specialist | Network development, contract negotiation, No Surprises Act |
| Medicare & Medicaid Specialist | CMS regulations, CoPs, MAC requirements, dual-eligible programs |
| Managed Care Analyst `80+` | Capitation modeling, MLR, PMPM, network adequacy |
| Credentialing & Enrollment Coordinator | CAQH, PECOS, CMS-855, privileging, delegated credentialing |
| Medicare Outreach Coordinator | Beneficiary education, enrollment periods, LIS/Extra Help |

</details>

<details>
<summary><strong>Population Health & Community</strong> -- 3 agents</summary>

| Agent | Specialty |
|-------|-----------|
| Population Health Manager | Risk stratification, care gaps, SDOH, chronic disease programs |
| Public Health Surveillance Coordinator | Reportable diseases, outbreak investigation, syndromic surveillance |
| Community Health Coordinator | CHNA, Schedule H, health equity, CHW programs, grant management |

</details>

<details>
<summary><strong>Health IT & Informatics</strong> -- 6 agents</summary>

| Agent | Specialty |
|-------|-----------|
| Health Informatics Manager `80+` | Clinical informatics, USCDI/TEFCA, ONC HTI-1, data governance |
| Epic Applications Analyst | Epic build/config, Bridges, Caboodle/Cogito, certification |
| Health Information Manager | HIM operations, ROI, record retention, legal health record |
| Clinical Data Analyst | Registries, eCQMs, MIPS reporting, SQL/Python for healthcare data |
| Healthcare Interoperability Engineer `80+` | HL7v2, FHIR R4, C-CDA, X12 EDI, HIE connectivity |
| Telehealth Program Manager | Virtual care ops, licensure compacts, RPM/RTM billing |

</details>

<details>
<summary><strong>Operations & Administration</strong> -- 7 agents</summary>

| Agent | Specialty |
|-------|-----------|
| Hospital Operations Administrator | Bed management, capacity planning, patient throughput |
| Physician Practice Manager | wRVU compensation, MGMA benchmarking, practice operations |
| Ambulatory Operations Manager | Clinic workflows, scheduling optimization, patient access |
| Home Health Administrator | CoPs (42 CFR 484), OASIS, PDGM, home health VBP |
| Long-Term Care Administrator | SNF CoPs (42 CFR 483), MDS, PDPM, Five-Star, survey readiness |
| Supply Chain Manager | GPO management, value analysis, OR supplies, FDA recalls |
| Healthcare Workforce Manager | Staffing models, scheduling, retention, burnout prevention |

</details>

<details>
<summary><strong>Pharmacy & Drug Programs</strong> -- 2 agents</summary>

| Agent | Specialty |
|-------|-----------|
| Pharmacy Benefits Specialist | Formulary, PBM contracts, specialty pharmacy, biosimilars |
| Medication Safety Specialist | ISMP, LASA drugs, CPOE, BCMA, USP 797/800 |

</details>

<details>
<summary><strong>Emergency & Preparedness</strong> -- 1 agent</summary>

| Agent | Specialty |
|-------|-----------|
| Emergency Preparedness Coordinator | HICS, CMS EP CoPs (42 CFR 482.15), surge planning, HVA |

</details>

## Self-Improving Agents

These agents are not static. The repo ships a self-improvement kit for **Claude Code and Codex** that runs automated eval-and-improve loops:

```bash
bash healthcare-agents/scripts/install-self-improvement-kit.sh /path/to/your/project
```

Then run from either tool:

- **Claude Code:** `/eval revenue-medical-coding-specialist`
- **Codex:** `Run the healthcare self-improvement loop for revenue-medical-coding-specialist`

The loop generates domain-specific exam questions, scores the agent's answers against a frozen rubric, identifies weak areas, and patches the prompt -- while preserving the agent's identity and voice. In runtimes that support native subagents, the strongest model scores while a faster model edits.

This does **not** require the Python eval harness. See [INSTALL.md](INSTALL.md) for the full setup.

## Compatible Tools

| Tool | Install Method |
|------|----------------|
| **Claude Code** | `cp agents/*.md ~/.claude/agents/` |
| **Cursor** | `cp agents/*.md .cursor/rules/` |
| **Windsurf** | `cp agents/*.md .windsurf/rules/` |
| **GitHub Copilot** | `cp agents/*.md .github/instructions/` |
| **Gemini CLI** | `cp agents/*.md ~/.gemini/agents/` |
| **Codex CLI** | `cp agents/*.md ~/.codex/agents/` |
| **Cline** | `cp agents/*.md .clinerules/` |
| **Amazon Q** | `cp agents/*.md .amazonq/rules/` |
| **Continue.dev** | `cp agents/*.md .continue/` |
| **Aider** | Add to `.aider.conf.yml` as `read:` entries |
| **Claude Desktop** | Paste into project instructions or Cowork plugins |
| **Claude Web** | Upload `.md` files as project knowledge |
| **OpenClaw** | Copy as skills (see [INSTALL.md](INSTALL.md)) |
| **Any tool** | Paste `.md` content into system prompt / custom instructions |

## Validation

```bash
bash scripts/lint-agents.sh
```

## FAQ

### Can AI agents handle HIPAA compliance?

These agents cite specific CFR sections (45 CFR 160, 162, 164), know the difference between addressable and required implementation specifications, and produce structured gap assessments. They do not handle PHI or make legal determinations -- they give you the regulatory framework and audit methodology that a compliance officer would use.

### What healthcare certifications and regulations do these agents cover?

The agents cover CMS Conditions of Participation, Joint Commission standards, NCQA HEDIS measures, MIPS/QPP quality programs, CMS Five-Star ratings, OASIS/PDGM for home health, MDS/PDPM for skilled nursing, HRSA 340B requirements, OIG compliance program guidance, and dozens of other regulatory frameworks. Each agent's specialty section lists its specific coverage.

### Do these agents work with Epic, Cerner, or other EHR systems?

The Epic Applications Analyst has deep knowledge of Epic build/configuration, Bridges integration, and Caboodle/Cogito analytics. Other agents reference EHR-specific workflows where relevant (CPOE for medication safety, CDI queries for documentation improvement, eCQMs for quality reporting). The agents are not EHR plugins -- they provide the healthcare administration expertise that complements your EHR workflows.

### How are agents evaluated and improved?

Each agent goes through iterative eval cycles: a scorer generates domain-specific exam questions (regulatory scenarios, calculation problems, workflow decisions), grades the agent's responses on a frozen rubric, and produces an improvement brief. An editor model patches weak areas while preserving the agent's identity. 10 agents currently score 80+ out of 100. Scores and methodology are fully transparent in [`eval/results.tsv`](eval/results.tsv).

### Can I use these agents for revenue cycle management?

Six agents cover the full revenue cycle: Medical Coding Specialist (ICD-10, CPT, DRG, HCC coding), Revenue Cycle Specialist (denials management, A/R optimization, CARC/RARC analysis), Healthcare Finance Manager (CMS-2552 cost reports, budgeting), Contract Analyst (payer reimbursement modeling), 340B Program Manager (drug discount compliance), and Chargemaster Analyst (CDM maintenance, price transparency).

## Contributing

New agents, deeper regulatory citations, updated CMS rules -- all welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Disclaimer

These agents provide healthcare administration knowledge for informational and operational purposes. They do not provide clinical advice, legal opinions, or handle PHI. Regulations change -- verify against primary sources (CMS.gov, Federal Register, state regulatory bodies).

## License

Apache 2.0 -- see [LICENSE](LICENSE).
