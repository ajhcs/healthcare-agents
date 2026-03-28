<p align="center">
  <h1 align="center">Healthcare Agents</h1>
  <p align="center">
    <strong>A complete healthcare administration department for your AI assistant.</strong><br>
    51 specialized agents with MHA-level expertise, real CFR citations, and ready-to-use deliverable templates.
  </p>
  <p align="center">
    <a href="#quick-start"><img src="https://img.shields.io/badge/agents-51-blue?style=flat-square" alt="51 Agents"></a>
    <a href="#compatible-tools"><img src="https://img.shields.io/badge/tools-12+-8A2BE2?style=flat-square" alt="12+ Tools"></a>
    <a href="https://github.com/ajhcs/healthcare-agents/stargazers"><img src="https://img.shields.io/github/stars/ajhcs/healthcare-agents?style=flat-square" alt="Stars"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-green?style=flat-square" alt="License"></a>
  </p>
</p>

---

Healthcare admin is drowning in complexity. These agents know the specific CFR sections, CMS payment models, and EHR workflows so you don't have to start from scratch every time.

Not a chatbot with a healthcare skin. Every agent cites real regulations, speaks in practitioner language, and produces actual deliverables — compliance assessments, financial models, audit checklists, gap reports.

> Built on the conventions of [agency-agents](https://github.com/msitarzewski/agency-agents) by [Michael Sitarzewski](https://github.com/msitarzewski).

## Quick Start

```bash
# Claude Code (2 commands, done)
git clone https://github.com/ajhcs/healthcare-agents.git
cp healthcare-agents/agents/*.md ~/.claude/agents/
```

Then just ask:

> *"Activate the Compliance Officer and audit our HIPAA Security Rule compliance against 45 CFR 164.308"*

**Works with 12+ tools** — Claude Code, Cursor, Copilot, Gemini CLI, Windsurf, Cline, Aider, and more. See the full [Installation Guide](INSTALL.md).

## Self-Improving Setup

If you want more than a static agent pack, this repo also ships a lightweight self-improvement kit for **Claude Code and Codex**. It installs:

- a frozen rubric at `eval/rubric.md`
- an append-only score log at `eval/results.tsv`
- an initial role baseline at `eval/role-baselines/`
- the tool-specific entry points Claude and Codex use to run the loop

```bash
git clone https://github.com/ajhcs/healthcare-agents.git
bash healthcare-agents/scripts/install-self-improvement-kit.sh /path/to/your/project
```

Then run the same loop from either tool:

- **Claude Code:** `/eval revenue-medical-coding-specialist`
- **Codex:** `Run the healthcare self-improvement loop for revenue-medical-coding-specialist`

This path does **not** require the Python eval harness. For the full setup and usage details, see [INSTALL.md](INSTALL.md).

## What Makes These Agents Different

| | Generic AI | Healthcare Agents |
|---|---|---|
| **Compliance** | "Follow HIPAA" | Cites 45 CFR 164.500-534, breach notification at 164.400-414 |
| **Finance** | "Optimize revenue" | PMPM decomposition, CARC/RARC denial analysis, CMS-2552 cost reports |
| **Coding** | "Use correct codes" | CC/MCC capture rates, NCCI edits, E/M 2021+ guidelines |
| **Systems** | "Use your EHR" | Epic Caboodle/Cogito, CAQH ProView, 340B OPAIS, PECOS, NHSN |

**21,000+ lines** of dense domain knowledge. **Average 420 lines/agent** of real expertise, not filler.

## Example Output

Ask the 340B Program Manager about contract pharmacy compliance:

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
   [ ] Duplicate discounts — Medicaid claims cross-referenced against 340B purchases
   [ ] Diversion — prescriptions for non-eligible patients filled at contract pharmacy
   [ ] GPO prohibition violations (for DSH hospitals under 100 beds)
   [ ] Missing contract pharmacy agreements or expired registrations

4. RECOMMENDED ACTIONS
   ...
```

Every agent produces structured, actionable deliverables like this — not summaries of what a deliverable *would* look like.

## The 51 Agents

<details>
<summary><strong>Strategy & Advisory</strong> — 5 agents</summary>

| Agent | Specialty |
|-------|-----------|
| Healthcare Strategy Consultant | Service line planning, M&A, market analysis, CON strategy |
| Healthcare Operations Consultant | Lean/Six Sigma, throughput, benchmarking (MGMA/Vizient) |
| Clinical Operations Consultant | Clinical workflows, staffing models, ED/OR throughput |
| Structural Improvement Consultant | Org redesign, governance, change management, post-merger integration |
| Healthcare Actuarial Advisor | Risk adjustment (HCC/RAF), capitation, IBNR, MLR modeling |

</details>

<details>
<summary><strong>Clinical Operations</strong> — 8 agents</summary>

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
<summary><strong>Quality, Safety & Compliance</strong> — 7 agents</summary>

| Agent | Specialty |
|-------|-----------|
| Quality Improvement Specialist | HEDIS, MIPS/QPP, CMS Stars, Leapfrog, eCQMs |
| Process Improvement Analyst | PDSA, Lean, Six Sigma DMAIC, value stream mapping |
| Patient Experience Coordinator | HCAHPS, service recovery, VBP patient experience domain |
| Patient Safety Officer | Sentinel events, RCA/FMEA, Just Culture, PSO reporting |
| Compliance Officer | HIPAA, Stark, Anti-Kickback, FCA, OIG compliance programs, EMTALA |
| Risk Manager | Enterprise/clinical risk, malpractice, claims management |
| Accreditation Specialist | Joint Commission, NCQA, URAC, AAAHC, DNV, survey readiness |

</details>

<details>
<summary><strong>Revenue Cycle & Finance</strong> — 6 agents</summary>

| Agent | Specialty |
|-------|-----------|
| Revenue Cycle Specialist | End-to-end RCM, denials (CARC/RARC), A/R optimization |
| Healthcare Finance Manager | Budgets, cost accounting, CMS-2552 cost reports, margin analysis |
| Healthcare Contract Analyst | Payer contracts, fee schedules, reimbursement modeling |
| Medical Coding Specialist | ICD-10-CM/PCS, CPT, DRG, HCC, E/M coding |
| 340B Program Manager | Covered entity compliance, contract pharmacy, split billing, HRSA audits |
| Chargemaster Analyst | CDM maintenance, price transparency, charge capture integrity |

</details>

<details>
<summary><strong>Payer & Managed Care</strong> — 6 agents</summary>

| Agent | Specialty |
|-------|-----------|
| Value-Based Care Manager | ACO operations (MSSP/ACO REACH), shared savings, risk contracts |
| Payer Relations Specialist | Network development, contract negotiation, No Surprises Act |
| Medicare & Medicaid Specialist | CMS regulations, CoPs, MAC requirements, dual-eligible programs |
| Managed Care Analyst | Capitation modeling, MLR, PMPM, network adequacy |
| Credentialing & Enrollment Coordinator | CAQH, PECOS, CMS-855, privileging, delegated credentialing |
| Medicare Outreach Coordinator | Beneficiary education, enrollment periods, LIS/Extra Help |

</details>

<details>
<summary><strong>Population Health & Community</strong> — 3 agents</summary>

| Agent | Specialty |
|-------|-----------|
| Population Health Manager | Risk stratification, care gaps, SDOH, chronic disease programs |
| Public Health Surveillance Coordinator | Reportable diseases, outbreak investigation, syndromic surveillance |
| Community Health Coordinator | CHNA, Schedule H, health equity, CHW programs, grant management |

</details>

<details>
<summary><strong>Health IT & Informatics</strong> — 6 agents</summary>

| Agent | Specialty |
|-------|-----------|
| Health Informatics Manager | Clinical informatics, USCDI/TEFCA, ONC HTI-1, data governance |
| Epic Applications Analyst | Epic build/config, Bridges, Caboodle/Cogito, certification |
| Health Information Manager | HIM operations, ROI, record retention, legal health record |
| Clinical Data Analyst | Registries, eCQMs, MIPS reporting, SQL/Python for healthcare data |
| Healthcare Interoperability Engineer | HL7v2, FHIR R4, C-CDA, X12 EDI, HIE connectivity |
| Telehealth Program Manager | Virtual care ops, licensure compacts, RPM/RTM billing |

</details>

<details>
<summary><strong>Operations & Administration</strong> — 7 agents</summary>

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
<summary><strong>Pharmacy & Drug Programs</strong> — 2 agents</summary>

| Agent | Specialty |
|-------|-----------|
| Pharmacy Benefits Specialist | Formulary, PBM contracts, specialty pharmacy, biosimilars |
| Medication Safety Specialist | ISMP, LASA drugs, CPOE, BCMA, USP 797/800 |

</details>

<details>
<summary><strong>Emergency & Preparedness</strong> — 1 agent</summary>

| Agent | Specialty |
|-------|-----------|
| Emergency Preparedness Coordinator | HICS, CMS EP CoPs (42 CFR 482.15), surge planning, HVA |

</details>

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
| **Aider** | Add to `.aider.conf.yml` as `read:` entries |
| **Claude Desktop** | Paste into project instructions or Cowork plugins |
| **Claude Web** | Upload `.md` files as project knowledge |
| **OpenClaw** | Copy as skills (see [INSTALL.md](INSTALL.md)) |
| **Any tool** | Paste `.md` content into system prompt / custom instructions |

Full setup instructions with tool-specific tips: **[INSTALL.md](INSTALL.md)**

## Validation

```bash
bash scripts/lint-agents.sh
```

## Contributing

New agents, deeper regulatory citations, updated CMS rules — all welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Disclaimer

These agents provide healthcare administration knowledge for informational and operational purposes. They do not provide clinical advice, legal opinions, or handle PHI. Regulations change — verify against primary sources (CMS.gov, Federal Register, state regulatory bodies).

## License

Apache 2.0 — see [LICENSE](LICENSE).
