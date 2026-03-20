<p align="center">
  <h1 align="center">Healthcare Agents</h1>
  <p align="center">
    <strong>A Claude plugin marketplace for healthcare administration.</strong><br>
    51 specialized agents across 10 installable plugins — install only the domains you need.
  </p>
  <p align="center">
    <a href="#plugins"><img src="https://img.shields.io/badge/plugins-10-blue?style=flat-square" alt="10 Plugins"></a>
    <a href="#plugins"><img src="https://img.shields.io/badge/agents-51-green?style=flat-square" alt="51 Agents"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-green?style=flat-square" alt="License"></a>
  </p>
</p>

---

Healthcare admin is drowning in complexity. These agent plugins give your AI assistant deep, modular expertise — real CFR citations, practitioner language, and structured deliverables — without loading 51 agents when you only need 3.

> Originally built on [healthcare-agents](https://github.com/ajhcs/healthcare-agents) by [AJHCS](https://github.com/ajhcs) and the conventions of [agency-agents](https://github.com/msitarzewski/agency-agents).

## Quick Start

### Claude Code (Plugin Marketplace)

```bash
# Add the marketplace
claude plugins:add-marketplace Percepta-Core/healthcare-agents

# Install the plugins you need
claude plugins:install quality-safety-compliance@healthcare-agents
claude plugins:install revenue-cycle-finance@healthcare-agents
claude plugins:install clinical-operations@healthcare-agents
```

Then just ask:

> *"Activate the Compliance Officer and audit our HIPAA Security Rule compliance against 45 CFR 164.308"*

### Manual Install (Any Tool)

```bash
git clone https://github.com/Percepta-Core/healthcare-agents.git

# Claude Code — install one plugin's agents
cp healthcare-agents/plugins/quality-safety-compliance/agents/*.md ~/.claude/agents/

# Or install all agents
for dir in healthcare-agents/plugins/*/agents; do cp "$dir"/*.md ~/.claude/agents/; done
```

## Plugins

Each plugin is a self-contained Claude plugin with its own `.claude-plugin/plugin.json` manifest and agents.

| Plugin | Agents | Description |
|--------|--------|-------------|
| **strategy-advisory** | 5 | Service line planning, M&A, Lean/Six Sigma, org restructuring, actuarial modeling |
| **clinical-operations** | 8 | Utilization management, care coordination, CDI, prior auth, case management, infection prevention |
| **quality-safety-compliance** | 7 | HEDIS, MIPS, HCAHPS, patient safety, HIPAA/Stark/AKS compliance, accreditation |
| **revenue-cycle-finance** | 6 | End-to-end RCM, medical coding, 340B, chargemaster, healthcare finance |
| **payer-managed-care** | 6 | Value-based care, ACO operations, credentialing, Medicare/Medicaid, managed care analytics |
| **population-health** | 3 | Risk stratification, SDOH, CHNA, health equity, syndromic surveillance |
| **health-it-informatics** | 6 | Epic systems, FHIR/HL7, clinical informatics, telehealth, HIM, data analytics |
| **operations-administration** | 7 | Hospital ops, physician practice, ambulatory, home health, LTC, supply chain, workforce |
| **pharmacy-drug-programs** | 2 | Formulary, PBM, specialty pharmacy, medication safety, USP 797/800 |
| **emergency-preparedness** | 1 | HICS, CMS EP CoPs, surge planning, hazard vulnerability analysis |

## Repository Structure

```
healthcare-agents/
├── .claude/
│   └── settings.json              # Marketplace registration
├── plugins/
│   ├── clinical-operations/
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json        # Plugin manifest
│   │   └── agents/
│   │       ├── clinical-utilization-management-specialist.md
│   │       ├── clinical-care-management-specialist.md
│   │       └── ...
│   ├── quality-safety-compliance/
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   └── agents/
│   │       └── ...
│   └── ...                        # 10 plugins total
├── agents/                        # Legacy flat directory (all 51)
├── scripts/
│   └── lint-agents.sh
└── CONTRIBUTING.md
```

## What Makes These Agents Different

| | Generic AI | Healthcare Agent Plugins |
|---|---|---|
| **Compliance** | "Follow HIPAA" | Cites 45 CFR 164.500-534, breach notification at 164.400-414 |
| **Finance** | "Optimize revenue" | PMPM decomposition, CARC/RARC denial analysis, CMS-2552 cost reports |
| **Coding** | "Use correct codes" | CC/MCC capture rates, NCCI edits, E/M 2021+ guidelines |
| **Systems** | "Use your EHR" | Epic Caboodle/Cogito, CAQH ProView, 340B OPAIS, PECOS, NHSN |

**21,000+ lines** of dense domain knowledge. **Average 420 lines/agent** of real expertise.

## Other Tools

The agents are standard Markdown with YAML frontmatter, so they work with any tool:

| Tool | Install Method |
|------|----------------|
| **Cursor** | `cp plugins/<plugin>/agents/*.md .cursor/rules/` |
| **Windsurf** | `cp plugins/<plugin>/agents/*.md .windsurf/rules/` |
| **GitHub Copilot** | `cp plugins/<plugin>/agents/*.md .github/instructions/` |
| **Gemini CLI** | `cp plugins/<plugin>/agents/*.md ~/.gemini/agents/` |
| **Codex CLI** | `cp plugins/<plugin>/agents/*.md ~/.codex/agents/` |
| **Cline** | `cp plugins/<plugin>/agents/*.md .clinerules/` |
| **Amazon Q** | `cp plugins/<plugin>/agents/*.md .amazonq/rules/` |

## Validation

```bash
bash scripts/lint-agents.sh
```

## Contributing

New plugins, new agents, deeper regulatory citations — all welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Disclaimer

These agents provide healthcare administration knowledge for informational and operational purposes. They do not provide clinical advice, legal opinions, or handle PHI. Regulations change — verify against primary sources (CMS.gov, Federal Register, state regulatory bodies).

## License

Apache 2.0 — see [LICENSE](LICENSE).
