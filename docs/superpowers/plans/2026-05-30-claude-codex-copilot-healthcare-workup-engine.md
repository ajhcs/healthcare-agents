# Healthcare Agents Claude, Codex, Copilot, and Healthcare Platform Growth Plan

Date: 2026-05-30
Status: proposed implementation plan
Primary target: next major development target for Healthcare Agents
Recommended release theme: Healthcare Admin Workup Engine and multi-runtime distribution

## Executive Summary

Healthcare Agents should evolve from a high-quality specialist prompt pack into a workflow product that healthcare operators can actually use in their daily AI environments: Claude Code, Codex, GitHub Copilot, Microsoft 365 Copilot, Teams, and enterprise Microsoft healthcare stacks.

The next big idea is the Healthcare Admin Workup Engine: a CLI and prompt runtime layer that converts a plain-language healthcare administration problem into a safe, role-routed, evidence-backed work packet. Instead of asking users to know which of 51 agents to invoke, the product should identify the workflow, choose the right primary specialist, name supporting handoffs, ask only the missing questions that matter, and produce a structured artifact users can paste into or execute through their AI tool of choice.

The stretch target is a multi-runtime healthcare AI distribution layer. Healthcare Agents should install and export the same domain intelligence into Claude, Codex, GitHub Copilot, Microsoft 365 Copilot declarative agents, Copilot Studio, Azure AI Foundry Agent Service, Teams, and healthcare developer environments that rely on FHIR, Medplum, SharePoint, ServiceNow, and enterprise knowledge stores.

The strategic bet is simple: health systems do not primarily need more generic prompt files. They need trusted operating workflows that fit their governance, technical environment, and daily administrative problems.

## Recommendation

Build Healthcare Agents 2.0 around four pillars:

1. Workflow-first routing
   - Add canonical healthcare workflows such as denial spike triage, prior authorization appeal workup, discharge barrier planning, survey readiness, HIPAA evidence checklists, patient safety RCA, HEDIS gap closure, and payer contract underpayment analysis.
   - Each workflow should define triggers, required inputs, default specialist, handoffs, output artifact, safety constraints, and validation rubric.

2. Claude and Codex native execution
   - Keep specialist agents as first-class installation targets.
   - Add workflow skills for Claude and Codex so a user can invoke the workflow directly, not just the role.
   - Preserve the current strong CLI release posture, but add workflow validation and platform export tests.

3. Copilot and Microsoft enterprise compatibility
   - Add GitHub Copilot repository instructions, custom agents, and prompt files.
   - Add export templates for Microsoft 365 Copilot declarative agents, Copilot Studio agents, Teams-facing deployment docs, and Azure AI Foundry agent specs.
   - Treat Microsoft 365 and Copilot Studio as governed export paths, not casual local installs.

4. Growth through shareable operational artifacts
   - Publish workflow gallery pages, example workups, copy-paste prompt files, issue templates, demo repositories, and health-system compatibility guides.
   - Make every generated workup and template easy to share with an executive, revenue cycle lead, quality director, compliance officer, or IT governance team.

## Why This Is The Optimal Next Development Target

Healthcare Agents already has useful ingredients:

- A broad set of healthcare administration specialist prompts.
- A CLI with list, show, choose, prompt, doctor, install, and uninstall commands.
- Existing install coverage for Claude Code, Claude Skills, Codex, Cursor, Windsurf, and Copilot rules.
- A simple self-improvement evaluation kit.
- Release-readiness checks that currently pass.
- A routing benchmark that currently reports 51 cases, top-1 accuracy 1.0, top-3 accuracy 1.0, MRR 1.0, and no failures.

The current product gap is not raw prompt count. The gap is activation. A user still has to understand the agent catalog, map their messy operational issue to a role, frame the problem well, and know how to move the result into their AI runtime.

The next target should remove that cognitive burden.

Healthcare administration buyers and users care about:

- Can this help me with a real denial spike, audit, access problem, discharge delay, staffing issue, or compliance evidence request?
- Can it work in the AI environment my organization already allows?
- Can I defend the output to compliance, legal, IT, finance, and operations leadership?
- Can I try it without a procurement project?
- Can I share a useful artifact with my team quickly?

The Healthcare Admin Workup Engine answers those questions better than another round of general prompt refinements.

## Current Repo Reality Check

### Strengths

- The project is already packaged as an npm CLI.
- The local repository version is 1.4.0.
- The GitHub release visible during research is v1.4.0.
- The CLI supports multiple installation targets and basic prompt discovery.
- INSTALL.md already documents Claude Code, Claude Skills, Codex, Cursor, Windsurf, and Copilot rule installation.
- The benchmark and release checks passed during this planning run.
- The agent catalog is differentiated because it is specific to healthcare administration rather than general coding or generic business tasks.

### Gaps

- npm public metadata showed latest version 1.3.0 while the repo and GitHub release showed 1.4.0. That version drift should be fixed before growth work.
- Current Copilot support appears to be rule-file oriented rather than full GitHub Copilot custom agent and prompt-file support.
- Current installs focus on agents and global instructions more than workflow-level packages.
- The repo lacks a canonical workflow schema that can power Claude, Codex, Copilot, Microsoft 365 Copilot, docs, tests, and examples from one source of truth.
- There is no compatibility matrix for Microsoft Cloud for Healthcare, Microsoft 365 Copilot, Copilot Studio, Azure AI Foundry, Teams, FHIR, Medplum, Epic-adjacent workflows, Dragon Copilot-adjacent workflows, ServiceNow, or SharePoint.
- The project does not yet have a public-facing workflow gallery that can drive search, sharing, demos, and product-led adoption.

## External Research Summary

### Claude Code

Relevant Claude Code findings:

- Subagents are Markdown files with YAML frontmatter.
- User-level subagents live under ~/.claude/agents/.
- Project-level subagents live under .claude/agents/.
- Claude uses the subagent description to decide when to delegate.
- Subagents can have separate context windows, custom system prompts, specific tool access, and independent permissions.
- Claude plugins can include skills, agents, hooks, MCP configuration, commands, workflows, and rules.

Implication:

Healthcare Agents should continue supporting Claude subagents, but should add workflow skills and eventually a plugin bundle. Claude users should be able to install both role specialists and workflow procedures.

### Codex

Relevant Codex findings:

- AGENTS.md is the active instruction surface.
- AGENTS.md files can appear anywhere in a repo.
- Scope is directory-based: a file applies to the directory containing it and all children.
- Deeper AGENTS.md files override higher-level files.
- Direct system, developer, and user instructions override AGENTS.md.
- Codex skills install under CODEX_HOME/skills, defaulting to ~/.codex/skills.
- Codex supports MCP server configuration paths for future tool integrations.

Implication:

Healthcare Agents should treat Codex as a first-class runtime, not a Claude compatibility afterthought. Codex installation should provide a clean AGENTS.md contract, specialist agent prompts, workflow skills, and later optional MCP tooling.

### GitHub Copilot

Relevant GitHub Copilot findings:

- Repository custom instructions can live in .github/copilot-instructions.md.
- Path-specific instructions can live in .github/instructions/*.instructions.md with applyTo frontmatter.
- Copilot can also use AGENTS.md in repositories, with nearest-file precedence.
- Custom Copilot coding agents can live in .github/agents/*.agent.md.
- Copilot prompt files can live in .github/prompts/*.prompt.md.
- Copilot coding agent works better when tasks are well-scoped and include acceptance criteria.
- GitHub issue templates are a natural bridge into Copilot coding-agent work.

Implication:

Copilot support should move beyond one generic rule file. Healthcare Agents should generate repository instructions, workflow-specific instructions, custom agents for key healthcare workflows, reusable prompt files, and issue templates.

### Microsoft 365 Copilot, Copilot Studio, and Azure AI Foundry

Relevant Microsoft findings:

- Microsoft 365 Copilot declarative agents use instructions, actions, and knowledge.
- Declarative agents can use SharePoint, OneDrive, Copilot connectors, uploaded files, and plugins.
- Microsoft recommends clear goals, step-by-step workflows, strict structure, atomic tasks, explicit tone and output formats, examples, domain vocabulary, and iterative testing.
- Microsoft warns against storing system-level instructions in SharePoint knowledge documents to work around instruction limits because knowledge sources are not trusted instruction sources and may be blocked, truncated, or sanitized.
- Copilot Studio supports low-code agents with instructions, context, knowledge, topics, tools, inputs, and triggers.
- Copilot Studio is not intended as a medical device or as a substitute for professional medical advice, diagnosis, treatment, or judgment.
- Azure AI Foundry Agent Service supports prompt agents, workflow agents, hosted agents, tool use, observability, versioning, identity, RBAC, private networking, and distribution through Microsoft 365 Copilot, Teams, and Entra Agent Registry.
- Microsoft for Healthcare includes Microsoft Cloud for Healthcare, Dynamics 365, Fabric, Microsoft 365, Dragon products, Azure Health Data Services, healthcare data models, virtual appointments, and Common Data Model healthcare entities.

Implication:

Healthcare Agents should not claim one-click install into a health system tenant. It should provide governed export packages, templates, and compatibility documentation that enterprise IT can review.

### Healthcare-Specific Compatibility

Research surfaced several compatibility ecosystems that matter:

- Microsoft Cloud for Healthcare and Microsoft 365 Copilot for enterprise adoption.
- Dragon Copilot and Nuance products for clinical documentation and ambient workflow awareness.
- Azure Health Data Services for FHIR and healthcare data infrastructure.
- Medplum and SMART on FHIR developer tooling for healthcare app builders.
- Epic, Oracle Health, and other EHR ecosystems as operational context targets, even if direct integration is not phase-one.
- ServiceNow, Jira, GitHub Issues, SharePoint, and Teams as operational workflow homes.

Implication:

The plan should separate three categories:

- Native install targets: Claude, Codex, GitHub Copilot.
- Enterprise export targets: Microsoft 365 Copilot, Copilot Studio, Azure AI Foundry, Teams.
- Compatibility guidance targets: Epic, Dragon Copilot, EHR workflows, Microsoft Cloud for Healthcare, Medplum, FHIR, ServiceNow, SharePoint.

## Product Positioning

Healthcare Agents should position itself as:

An open healthcare administration AI workflow kit that installs into the AI tools healthcare teams already use.

Primary promise:

Turn messy healthcare operations questions into structured workups with the right specialist role, handoffs, missing inputs, safe constraints, and executive-ready artifacts.

Secondary promise:

Deploy the same healthcare administration intelligence across Claude, Codex, GitHub Copilot, Microsoft 365 Copilot, Copilot Studio, and enterprise documentation workflows.

What this is not:

- Not clinical decision support.
- Not a medical device.
- Not a PHI-processing service by default.
- Not an EHR integration product in phase one.
- Not a replacement for compliance, legal, clinical, financial, or operational leadership judgment.

## Target Users

### Primary

- Healthcare operations leaders.
- Revenue cycle leaders.
- Quality and safety leaders.
- Compliance and privacy teams.
- Health system analytics and transformation teams.
- Healthcare consultants and fractional operators.
- IT and AI enablement teams at hospitals, MSOs, payers, and healthcare services companies.

### Secondary

- Developers building healthcare internal tools.
- Policy and payer strategy teams.
- Digital health founders.
- Health system innovation teams.
- Academic medical center administration teams.

### Buying and Adoption Reality

Many health systems are Microsoft-heavy. GitHub Copilot, Microsoft 365 Copilot, Teams, SharePoint, and Azure will often be easier to approve than a new standalone AI application. This is why Copilot and Microsoft compatibility are strategically important.

## Core Feature: Healthcare Admin Workup Engine

### User Experience

The user enters a real operational problem:

    healthcare-agents workup "Commercial payer denial rate jumped 18 percent after a policy change and our AR days are climbing."

The system returns:

- Best matching workflow.
- Confidence and rationale.
- Primary specialist.
- Supporting specialists.
- Missing questions.
- Immediate triage steps.
- Evidence to collect.
- Recommended output artifact.
- Safety and compliance constraints.
- Platform-specific next prompt for Claude, Codex, Copilot, or Microsoft 365 Copilot.

Example commands:

    healthcare-agents workup "Our discharge delays are mostly awaiting SNF placement and family decisions."
    healthcare-agents workup "Prepare a HIPAA evidence checklist for a vendor security review." --target copilot
    healthcare-agents workup "We need a HEDIS gap closure sprint for diabetic eye exams." --target m365-copilot --markdown
    healthcare-agents workup "Claims are being underpaid against the payer contract." --json

### Workup Packet

Every workup should produce:

- Problem restatement.
- Workflow match.
- Primary specialist.
- Supporting handoffs.
- Required context.
- Optional context.
- Red flags.
- First-pass questions.
- Analysis steps.
- Output artifact type.
- Draft artifact scaffold.
- Quality checklist.
- Safety disclaimer.
- Platform-specific invocation.

### Workup JSON Shape

The structured output should be stable enough for tests and future UI work:

    {
      "problem": "...",
      "workflow": {
        "id": "revenue-denial-spike",
        "name": "Revenue Cycle Denial Spike Workup",
        "confidence": 0.91,
        "rationale": "..."
      },
      "roles": {
        "primary": "revenue-cycle-specialist",
        "handoffs": ["payer-contracting-specialist", "healthcare-data-analyst"]
      },
      "questions": {
        "required": [],
        "optional": []
      },
      "artifacts": {
        "primary": "denial-spike-triage-brief",
        "sections": []
      },
      "safety": {
        "phi": "Do not include direct patient identifiers.",
        "medical": "Do not provide clinical diagnosis or treatment advice.",
        "governance": "Validate against local policy, payer contract, and legal guidance."
      },
      "platform_prompts": {
        "claude": "...",
        "codex": "...",
        "copilot": "...",
        "m365_copilot": "..."
      }
    }

## Workflow Pack V1

The initial workflow pack should be small enough to ship but broad enough to feel like a real healthcare operations product.

### 1. Revenue Cycle Denial Spike Workup

- Trigger: denial rate increase, payer policy change, AR aging, increased write-offs.
- Primary specialist: revenue cycle.
- Handoffs: payer contracting, healthcare data analyst, compliance if coding risk appears.
- Artifact: denial spike triage brief.
- Required inputs: payer, denial codes, timeframe, service lines, dollar exposure, current appeal status.
- Output: root-cause hypotheses, evidence pull list, appeal strategy, payer escalation path, executive summary.

### 2. Clean Claim Rate Decline

- Trigger: claim edits, clearinghouse rejections, coding or registration quality issues.
- Primary specialist: revenue cycle.
- Handoffs: front-office operations, coding compliance, analytics.
- Artifact: clean claim recovery plan.
- Required inputs: baseline clean claim rate, current rate, edit categories, affected clinics, system changes.
- Output: issue segmentation, process fix plan, owner matrix, monitoring dashboard spec.

### 3. Payer Contract Underpayment Review

- Trigger: suspected payment variance, payer dispute, fee schedule mismatch, contract renewal prep.
- Primary specialist: payer contracting.
- Handoffs: revenue cycle, finance, legal.
- Artifact: underpayment evidence packet.
- Required inputs: contract terms, allowed amounts, billed charges, payment history, carve-outs.
- Output: variance logic, evidence table, payer dispute letter scaffold, negotiation talking points.

### 4. Prior Authorization Appeal Workup

- Trigger: denied authorization, delayed care, payer medical necessity request.
- Primary specialist: prior authorization.
- Handoffs: care coordination, compliance, clinical reviewer where appropriate.
- Artifact: appeal workup and documentation checklist.
- Required inputs: payer, service, denial reason, policy citation, documentation available.
- Output: non-clinical appeal structure, missing documentation list, escalation path.

### 5. Discharge Barrier Workplan

- Trigger: length-of-stay pressure, SNF placement delay, DME delay, family decision delay.
- Primary specialist: care coordination.
- Handoffs: utilization management, social work, finance, post-acute contracting.
- Artifact: discharge barrier action plan.
- Required inputs: barrier categories, service line, payer mix, avoidable days, escalation rules.
- Output: barrier taxonomy, next actions, owner list, daily huddle script, KPI plan.

### 6. HIPAA Security Evidence Checklist

- Trigger: audit, vendor review, policy refresh, security questionnaire.
- Primary specialist: HIPAA compliance.
- Handoffs: IT security, legal, privacy officer.
- Artifact: evidence checklist and gap register.
- Required inputs: entity type, system scope, vendor involvement, current controls, requested framework.
- Output: evidence map, gaps, responsible owners, collection timeline.

### 7. Survey Readiness Gap Review

- Trigger: accreditation survey, CMS readiness, policy gap, tracer preparation.
- Primary specialist: regulatory compliance.
- Handoffs: quality, nursing leadership, facilities, infection prevention where relevant.
- Artifact: survey readiness gap plan.
- Required inputs: standard set, site, last survey findings, open corrective actions.
- Output: tracer plan, policy evidence list, owner matrix, leadership briefing.

### 8. Patient Safety RCA2 Workup

- Trigger: serious safety event, near miss, sentinel-event-style review.
- Primary specialist: patient safety.
- Handoffs: quality, risk, legal, department leadership.
- Artifact: RCA2-style planning packet.
- Required inputs: event summary, timeline, harm level, involved processes, immediate containment.
- Output: fact-gathering plan, causal factor categories, interview guide, action strength checklist.

### 9. ED Boarding and Capacity Workup

- Trigger: ED boarding, throughput issue, inpatient bed constraint, ambulance diversion risk.
- Primary specialist: hospital operations.
- Handoffs: care coordination, finance, analytics, nursing operations.
- Artifact: capacity command-center brief.
- Required inputs: boarding hours, arrival/admission rates, discharge timing, bed types, staffing constraints.
- Output: bottleneck map, immediate moves, escalation triggers, metric dashboard spec.

### 10. Ambulatory Access Backlog

- Trigger: long third-next-available appointment, referral backlog, high no-show rate.
- Primary specialist: ambulatory operations.
- Handoffs: scheduling, analytics, provider relations, patient access.
- Artifact: access recovery plan.
- Required inputs: specialty, backlog size, template design, referral sources, no-show rate.
- Output: demand/capacity plan, scheduling rule changes, referral triage approach, monitoring metrics.

### 11. Value-Based Care Downside Risk Readiness

- Trigger: new risk contract, downside exposure, quality and cost performance concerns.
- Primary specialist: value-based care.
- Handoffs: population health, finance, analytics, payer contracting.
- Artifact: downside-risk readiness memo.
- Required inputs: contract model, attributed lives, quality measures, cost benchmark, care management model.
- Output: risk register, intervention map, data gaps, governance cadence.

### 12. HEDIS or Stars Gap Closure Sprint

- Trigger: measure gap, payer quality program, Stars rating pressure.
- Primary specialist: quality improvement.
- Handoffs: population health, analytics, patient outreach, compliance.
- Artifact: gap closure sprint plan.
- Required inputs: measure, denominator, numerator gap, patient segment, outreach channels.
- Output: gap stratification, outreach plan, measure documentation checklist, weekly operating rhythm.

### 13. HL7 or FHIR Interface Incident

- Trigger: interface failure, data quality issue, feed latency, mapping error.
- Primary specialist: healthcare IT integration.
- Handoffs: vendor management, analytics, compliance if PHI exposure risk appears.
- Artifact: interface incident workup.
- Required inputs: system names, message type, failure mode, timeline, affected workflows.
- Output: triage checklist, incident communications, root-cause evidence, remediation plan.

### 14. Clinical Dashboard Specification

- Trigger: leadership wants a dashboard, existing dashboard is distrusted, KPI definitions conflict.
- Primary specialist: healthcare data analyst.
- Handoffs: operations owner, quality, finance, IT data engineering.
- Artifact: dashboard requirements spec.
- Required inputs: decision owner, decisions supported, metrics, data sources, cadence.
- Output: metric definitions, grain, filters, mock table, validation plan.

### 15. PBM or Pharmacy Contract Scorecard

- Trigger: pharmacy spend concerns, PBM contract review, formulary performance issue.
- Primary specialist: pharmacy operations or payer contracting.
- Handoffs: finance, legal, analytics.
- Artifact: pharmacy contract scorecard.
- Required inputs: contract terms, utilization, rebate terms, specialty spend, claims sample.
- Output: scorecard structure, data request list, variance hypotheses, negotiation points.

### 16. Emergency Preparedness Exercise Readiness

- Trigger: upcoming exercise, after-action plan, CMS emergency preparedness requirements.
- Primary specialist: emergency preparedness.
- Handoffs: facilities, operations, compliance, communications.
- Artifact: exercise readiness packet.
- Required inputs: hazard scenario, sites, participants, current plan, prior after-action findings.
- Output: exercise objectives, inject list, evaluation checklist, after-action template.

## Claude Implementation Track

### Current State

Claude support should continue to install healthcare specialists into Claude Code's agent surface and install skill content where appropriate.

### Phase-One Claude Work

Add:

- Claude subagent validation for every generated agent file.
- Description linting to ensure Claude can route correctly.
- Role boundary linting to avoid generic prompt drift.
- Workflow skills under a generated Claude skills package.
- Workflow command snippets that invoke the right specialist and output format.
- A Claude install manifest that records generated files, version, and source commit.

### Claude Workflow Skill Shape

Each workflow skill should include:

- When to use this workflow.
- Required user inputs.
- Missing-input triage questions.
- Primary specialist handoff.
- Supporting specialist handoffs.
- Output artifact structure.
- Safety constraints.
- Example prompt.
- Quality checklist.

### Claude Commands

Potential generated commands:

- healthcare-denial-spike-workup
- healthcare-discharge-barrier-plan
- healthcare-hipaa-evidence-checklist
- healthcare-survey-readiness-review
- healthcare-hedis-gap-closure-sprint

### Claude Acceptance Criteria

- Fresh install writes valid Claude agent files.
- Fresh install writes valid workflow skill files.
- User can ask Claude for a denial spike workup and gets the revenue cycle workflow without manually selecting an agent.
- User can ask Claude for a HIPAA evidence checklist and gets privacy/security boundaries.
- Generated files are idempotent and uninstallable.

## Codex Implementation Track

### Current State

Codex uses AGENTS.md as the active durable instruction surface, and Codex skills install under CODEX_HOME/skills by default.

### Phase-One Codex Work

Add:

- Codex-specific AGENTS.md generation with healthcare administration operating boundaries.
- Optional project-local AGENTS.md installation for healthcare projects.
- Codex workflow skills under ~/.codex/skills.
- Specialist prompt install under ~/.codex/agents where this repo already supports that surface.
- A Codex workup command that outputs a prompt optimized for Codex's implementation and review style.

### Codex AGENTS.md Contract

The generated Codex instructions should cover:

- Healthcare administration scope.
- PHI handling caution.
- No clinical diagnosis or treatment advice.
- Use one primary healthcare specialist first.
- Ask for missing inputs when required by the workflow.
- Produce structured artifacts.
- Preserve operational decision ownership.
- Use repo-local instructions when working inside a healthcare project.

### Future Codex MCP Track

Do not make MCP a phase-one dependency. Add an optional future path for:

- Workflow registry MCP resource.
- Agent catalog MCP resource.
- Workup generation MCP tool.
- Compatibility matrix MCP resource.
- Local policy document retrieval, if the user explicitly configures it.

### Codex Acceptance Criteria

- Fresh Codex install creates or updates AGENTS.md without destroying user content.
- Workflow skills install under the expected Codex skill root.
- Workup output is usable directly in Codex.
- Generated instructions comply with Codex precedence rules.
- Installer can dry-run, diff, install, and uninstall.

## GitHub Copilot Implementation Track

### Why Copilot Matters

Many health systems already standardize on Microsoft and GitHub tooling. Copilot compatibility increases the chance that Healthcare Agents can be used inside approved enterprise tooling instead of being treated as a shadow AI workflow.

### Current Gap

Current Copilot support appears to cover rules-style installation. That is not enough. GitHub Copilot now has several relevant instruction surfaces:

- .github/copilot-instructions.md for repository-wide custom instructions.
- .github/instructions/*.instructions.md for path-specific instructions.
- AGENTS.md for agent-style repo guidance.
- .github/agents/*.agent.md for custom Copilot coding agents.
- .github/prompts/*.prompt.md for reusable prompt files.
- GitHub issue templates for scoping cloud-agent tasks.

### Phase-One Copilot Work

Add installer flags:

    healthcare-agents install --copilot-repo
    healthcare-agents install --copilot-instructions
    healthcare-agents install --copilot-agents
    healthcare-agents install --copilot-prompts
    healthcare-agents install --copilot-all

### Repository Instructions

Generate .github/copilot-instructions.md with:

- Healthcare administration scope.
- Approved use cases.
- Forbidden use cases.
- PHI caution.
- Agent selection policy.
- Artifact formatting standards.
- Acceptance criteria style.
- Security and compliance review expectations.

### Path-Specific Instructions

Generate workflow-specific files under .github/instructions/:

- healthcare-revenue-cycle.instructions.md
- healthcare-compliance.instructions.md
- healthcare-quality-safety.instructions.md
- healthcare-analytics.instructions.md
- healthcare-operations.instructions.md

Each file should use applyTo frontmatter for relevant paths, with a conservative default that users can edit.

### Custom Copilot Agents

Do not generate all 51 specialists as custom Copilot agents by default. That would be noisy and hard to govern.

Start with 6 to 8 high-value custom agents:

- healthcare-revenue-cycle-agent
- healthcare-compliance-agent
- healthcare-quality-safety-agent
- healthcare-operations-agent
- healthcare-data-analytics-agent
- healthcare-it-integration-agent
- healthcare-payer-contracting-agent
- healthcare-workup-orchestrator-agent

Each agent file should include:

- Name.
- Description.
- Tool policy.
- Role boundaries.
- Input expectations.
- Output artifact expectations.
- Safety constraints.

### Copilot Prompt Files

Generate prompt files for repeatable workflows:

- denial-spike-workup.prompt.md
- discharge-barrier-plan.prompt.md
- hipaa-evidence-checklist.prompt.md
- survey-readiness-review.prompt.md
- hedis-gap-closure-sprint.prompt.md
- dashboard-spec.prompt.md

Label prompt-file support as preview where appropriate.

### Copilot Issue Templates

Add optional issue templates:

- Healthcare workflow request.
- Revenue cycle workup.
- Compliance evidence checklist.
- Quality improvement sprint.
- Healthcare analytics dashboard spec.

Each issue template should produce a scoped task with:

- Background.
- Goal.
- Required inputs.
- Constraints.
- Acceptance criteria.
- Safety notes.

### Copilot Acceptance Criteria

- Fresh repo install generates valid .github Copilot surfaces.
- Dry-run shows exactly what will be written.
- Existing files are preserved with managed blocks or explicit backup behavior.
- Copilot custom agents are small enough to be governable.
- Prompt files produce consistent workup packets.
- Docs explain which Copilot surfaces work in VS Code, GitHub.com, JetBrains, Visual Studio, and Copilot coding agent.

## Microsoft 365 Copilot, Copilot Studio, and Azure AI Foundry Track

### Principle

Microsoft enterprise deployment should be treated as governed export, not simple install. Health systems will need tenant approval, security review, data handling review, and ownership assignment.

### Microsoft 365 Copilot Declarative Agent Export

Add:

    healthcare-agents export m365-declarative-agent denial-spike-workup
    healthcare-agents export m365-declarative-agent hipaa-evidence-checklist
    healthcare-agents export m365-declarative-agent survey-readiness-review

Generated export package should include:

- Agent name.
- Agent description.
- Instructions.
- Starter prompts.
- Knowledge source guidance.
- Action placeholder guidance.
- Safety boundaries.
- Test cases.
- Admin review checklist.

Critical guidance:

- Do not put hidden system instructions into SharePoint knowledge files.
- Keep knowledge sources as knowledge, not instruction bypasses.
- Use explicit instructions and examples in the agent definition.
- Document PHI expectations and tenant data policy requirements.

### Copilot Studio Export

Add templates for:

- Instructions.
- Topics.
- Trigger phrases.
- Inputs.
- Knowledge source mapping.
- Tool/action placeholders.
- Escalation and human review path.
- Test scripts.

Recommended first Copilot Studio agents:

- Revenue Cycle Workup Assistant.
- Compliance Evidence Assistant.
- Quality Improvement Sprint Assistant.
- Healthcare Operations Triage Assistant.

### Azure AI Foundry Agent Service Export

Add templates for:

- Prompt agent spec.
- Workflow agent spec.
- Tool schema placeholders.
- Identity and RBAC notes.
- Observability checklist.
- Versioning checklist.
- Private networking considerations.
- Teams and Microsoft 365 Copilot distribution notes.

Azure Foundry should be the stretch enterprise architecture for organizations that need more than prompt files.

### Teams and SharePoint

Add docs for:

- Publishing Copilot Studio agents to Teams.
- Using SharePoint libraries as knowledge sources.
- Keeping policy documents separate from instruction documents.
- Maintaining versioned governance records.
- Testing with non-PHI examples.

### Microsoft Acceptance Criteria

- Exported declarative agent instructions are under platform limits or clearly split into supported fields.
- Export packages include test prompts and expected outputs.
- Safety constraints are explicit.
- Docs distinguish instructions, knowledge, actions, and connectors.
- No generated content claims medical-device behavior or clinical decision support.

## Other Healthcare Platform Compatibility

### Microsoft Cloud for Healthcare

Add a compatibility guide for:

- Dynamics 365 healthcare workflows.
- Microsoft Fabric healthcare analytics.
- Azure Health Data Services.
- Healthcare data model terminology.
- Teams and SharePoint operational workflows.
- Dragon product adjacency.

### FHIR and Medplum

Add developer-focused guidance for:

- SMART on FHIR context.
- FHIR resource vocabulary.
- Medplum project usage.
- Healthcare data model examples.
- Safe non-PHI test fixtures.

Phase-one should be docs and workflow vocabulary, not direct API integration.

### Epic, Oracle Health, and EHR Ecosystems

Add a vendor-neutral guide:

- What Healthcare Agents can help with: admin workups, evidence checklists, workflow specs, data request framing, interface incident triage.
- What it cannot do without local integration: inspect patient charts, modify orders, provide clinical recommendations, access EHR data.
- How to use it alongside EHR reporting teams safely.

### Dragon Copilot and Clinical Documentation Tools

Add compatibility framing:

- Dragon Copilot and ambient tools are clinical documentation and workflow products.
- Healthcare Agents should complement them on administration, operations, compliance, revenue cycle, and quality workups.
- Avoid implying integration unless explicitly built.

### ServiceNow, Jira, and GitHub Issues

Add issue-ticket templates:

- Interface incident.
- Compliance evidence request.
- Revenue cycle analytics request.
- Dashboard specification.
- Access backlog workup.

These are high-leverage because many healthcare workflows become tickets.

## Engineering Architecture

### New Data Model

Add:

- workflows/schema.json
- workflows/workflows.json
- workflows/examples/*.json
- platforms/schema.json
- platforms/platforms.json
- safety/snippets.json

Each workflow should define:

- id
- name
- category
- summary
- triggers
- anti_triggers
- primary_agent
- handoff_agents
- required_inputs
- optional_inputs
- red_flags
- output_artifact
- artifact_sections
- safety_constraints
- platform_prompt_templates
- examples
- canary_tests

Each platform should define:

- id
- name
- install_surface
- export_surface
- file_paths
- frontmatter_rules
- instruction_limits
- managed_block_strategy
- uninstall_strategy
- test_strategy

### Templates

Add:

- templates/claude/agent.md
- templates/claude/skill.md
- templates/claude/command.md
- templates/codex/AGENTS.md
- templates/codex/skill.md
- templates/copilot/copilot-instructions.md
- templates/copilot/path-instruction.instructions.md
- templates/copilot/agent.agent.md
- templates/copilot/prompt.prompt.md
- templates/copilot/issue-template.yml
- templates/m365/declarative-agent.md
- templates/copilot-studio/agent-build-guide.md
- templates/azure-foundry/agent-spec.md

### CLI Additions

Add commands:

    healthcare-agents workflows
    healthcare-agents workflow <workflow-id>
    healthcare-agents workup "<problem>"
    healthcare-agents workup "<problem>" --target claude
    healthcare-agents workup "<problem>" --target codex
    healthcare-agents workup "<problem>" --target copilot
    healthcare-agents workup "<problem>" --target m365-copilot
    healthcare-agents export <platform> <workflow-id>

Add install flags:

    --claude-workflow-skills
    --codex-skills
    --copilot-repo
    --copilot-instructions
    --copilot-agents
    --copilot-prompts
    --copilot-all

### Rendering Architecture

Use pure rendering functions:

- renderClaudeAgent(agent)
- renderClaudeWorkflowSkill(workflow)
- renderCodexAgentsMd(config)
- renderCodexWorkflowSkill(workflow)
- renderCopilotRepoInstructions(config)
- renderCopilotPathInstruction(workflow)
- renderCopilotAgent(agentOrWorkflow)
- renderCopilotPrompt(workflow)
- renderM365DeclarativeAgent(workflow)
- renderCopilotStudioGuide(workflow)
- renderAzureFoundrySpec(workflow)

All renderers should be deterministic and snapshot-tested.

### Safety Architecture

Centralize safety language rather than duplicating it by hand. Include reusable snippets for:

- No medical advice.
- No diagnosis or treatment.
- No emergency guidance.
- No PHI unless user has approved local governed use.
- Validate against local policy, payer contracts, laws, and licensed professionals.
- Escalate to compliance, legal, clinical leadership, finance, or IT security where required.

## Testing Plan

### Unit Tests

- Validate workflow schema.
- Validate platform schema.
- Validate routing from examples to workflows.
- Validate required fields.
- Validate safety snippets are present in every generated platform artifact.

### Snapshot Tests

- Claude workflow skill output.
- Codex AGENTS.md output.
- Codex workflow skill output.
- Copilot repo instructions.
- Copilot path-specific instructions.
- Copilot custom agents.
- Copilot prompt files.
- M365 declarative agent export.
- Copilot Studio guide.
- Azure Foundry spec.

### CLI Tests

- healthcare-agents workflows
- healthcare-agents workflow denial-spike-workup
- healthcare-agents workup examples
- healthcare-agents export m365-declarative-agent denial-spike-workup
- install dry-run behavior
- uninstall manifest behavior

### Installer Tests

- Does not overwrite unmanaged user content.
- Uses managed blocks where appropriate.
- Creates missing directories.
- Is idempotent.
- Produces a manifest.
- Can uninstall only files or blocks it owns.

### Validation Scripts

Add:

    node scripts/validate-workflows.js
    node scripts/validate-platform-exports.js
    node scripts/validate-workup-canaries.js
    node scripts/validate-public-version-sync.js

Release checks should fail if:

- workflow schema is invalid
- platform export snapshots drift unexpectedly
- safety snippets are missing
- npm version and package version drift
- examples no longer route correctly

## Documentation Plan

### README

Revise the README around:

- What problem this solves.
- Quick start.
- Workup examples.
- Install targets.
- Workflow gallery.
- Safety boundaries.
- Enterprise compatibility.

### INSTALL.md

Expand installation docs for:

- Claude agents.
- Claude workflow skills.
- Codex AGENTS.md.
- Codex workflow skills.
- GitHub Copilot repository instructions.
- GitHub Copilot custom agents.
- GitHub Copilot prompt files.
- Microsoft 365 Copilot export.
- Copilot Studio export.
- Azure AI Foundry export.

### Workflow Gallery

Add one page per workflow:

- Problem it solves.
- Example input.
- Primary specialist.
- Handoffs.
- Required context.
- Output artifact.
- Example output.
- Platform-specific prompt examples.

### Compatibility Guides

Add:

- docs/platforms/claude.md
- docs/platforms/codex.md
- docs/platforms/github-copilot.md
- docs/platforms/microsoft-365-copilot.md
- docs/platforms/copilot-studio.md
- docs/platforms/azure-ai-foundry.md
- docs/platforms/microsoft-cloud-for-healthcare.md
- docs/platforms/fhir-and-medplum.md
- docs/platforms/ehr-compatibility.md
- docs/platforms/teams-sharepoint-servicenow.md

## Growth and Distribution Plan

### Fix Release Visibility First

The public npm version should match the repo and GitHub release. Before promoting the project:

- Verify package.json.
- Verify npm dist-tags.
- Publish the current release if missing.
- Add a release check that compares local package version, GitHub latest release, and npm latest version.

### Search-Led Growth

Create pages targeting searches like:

- Claude Code healthcare agents.
- Codex healthcare agents.
- GitHub Copilot healthcare instructions.
- Microsoft 365 Copilot healthcare agent template.
- Healthcare revenue cycle AI prompt.
- Denial management AI workup.
- HIPAA compliance AI checklist.
- HEDIS gap closure AI workflow.
- Healthcare admin AI agents.
- FHIR AI agent workflow.

Each page should include a real example, install command, safety caveats, and generated artifact.

### Shareable Artifacts

Make outputs shareable:

- Executive one-page brief.
- Workup packet.
- Evidence checklist.
- Ticket template.
- GitHub issue template.
- Teams message draft.
- SharePoint page outline.
- Copilot prompt file.

### Demo Repositories

Create demo repos or folders for:

- GitHub Copilot healthcare repo setup.
- Claude healthcare workflow setup.
- Codex healthcare workflow setup.
- Microsoft 365 Copilot export examples.

### Community Contribution Model

Add contribution paths for:

- New workflow definitions.
- New platform templates.
- New canary examples.
- New compatibility guides.
- Improved specialist prompts.

Each contribution should require:

- Workflow schema compliance.
- Safety constraints.
- Example input.
- Expected artifact.
- Test case.

### Distribution Channels

Prioritize:

- npm package.
- GitHub releases.
- GitHub topics and README SEO.
- LinkedIn technical posts for healthcare ops and health IT audiences.
- Show HN or relevant open-source launch only after Copilot and workflow gallery are credible.
- Health IT Slack/Discord communities where allowed.
- Direct outreach to healthcare consultants and internal AI enablement teams.

## Implementation Phases

### Phase 0: Release Hygiene

Goal: make the existing product promotable.

Tasks:

- Resolve npm 1.3.0 versus repo/GitHub 1.4.0 version drift.
- Add public version sync validation.
- Confirm release-readiness checks run in CI.
- Confirm install docs match actual CLI behavior.
- Add a short product positioning section to README.

Exit criteria:

- npm, GitHub release, and package.json agree.
- Current install commands work.
- README can support external visitors.

### Phase 1: Workflow Core

Goal: add the workflow substrate that powers every platform.

Tasks:

- Add workflow schema.
- Add first 16 workflow definitions.
- Add workflow listing command.
- Add workflow detail command.
- Add workup command with deterministic heuristic matching.
- Add JSON and Markdown output modes.
- Add canary tests for workflow routing.

Exit criteria:

- User can enter a healthcare admin problem and receive a structured workup.
- Workflow routing is test-covered.
- Workflows are platform-independent.

### Phase 2: Claude and Codex Workflow Installs

Goal: make first-class workflow execution available in the two agentic coding runtimes already central to this repo.

Tasks:

- Generate Claude workflow skills.
- Generate Codex workflow skills.
- Strengthen Codex AGENTS.md generated content.
- Add install manifests for workflow files.
- Add dry-run previews.
- Add uninstall support.

Exit criteria:

- Claude user can install workflows and ask for a denial spike or HIPAA checklist workup.
- Codex user can install workflows and use the generated AGENTS.md and skills.
- Generated files are idempotent.

### Phase 3: GitHub Copilot Compatibility

Goal: make Healthcare Agents credible for Microsoft and GitHub-heavy health systems.

Tasks:

- Add Copilot repository instructions generation.
- Add path-specific instructions generation.
- Add 6 to 8 custom Copilot agents.
- Add prompt files for core workflows.
- Add optional GitHub issue templates.
- Add Copilot platform docs.

Exit criteria:

- A repo can run one install command and receive useful Copilot-ready healthcare workflow surfaces.
- Copilot custom agents and prompt files pass snapshot tests.
- Docs explain what each surface does and where it works.

### Phase 4: Microsoft Enterprise Exports

Goal: support governed enterprise adoption without pretending to bypass tenant controls.

Tasks:

- Add Microsoft 365 Copilot declarative agent export templates.
- Add Copilot Studio build guides.
- Add Azure AI Foundry spec templates.
- Add Teams and SharePoint governance docs.
- Add Microsoft Cloud for Healthcare compatibility guide.

Exit criteria:

- A health system AI enablement team can review exported templates.
- Exported content includes safety and governance notes.
- Docs distinguish local install, repo install, and enterprise deployment.

### Phase 5: Workflow Gallery and Growth Assets

Goal: make the product discoverable and shareable.

Tasks:

- Add workflow gallery docs.
- Add example workup packets.
- Add SEO-oriented platform pages.
- Add demo repo or examples folder.
- Add launch-ready screenshots or terminal examples.
- Add contribution guide for workflows.

Exit criteria:

- A new visitor can understand the product in under two minutes.
- A healthcare operator can find a workflow relevant to their problem.
- A developer can install into their preferred AI runtime.

### Phase 6: Proof and Feedback Loop

Goal: move from plausible to demonstrably useful.

Tasks:

- Recruit 5 to 10 healthcare admin users or consultants for structured feedback.
- Give them three workflows each.
- Measure time to first useful artifact.
- Track missing workflow requests.
- Track confusing install surfaces.
- Track which platforms they actually use.
- Feed findings back into workflow and platform priorities.

Exit criteria:

- At least 10 real-world workup attempts reviewed.
- Top workflow improvements identified.
- Top platform friction points identified.
- Next release backlog is evidence-driven.

## Suggested Bead Conversion

When converting this plan into bd issues, use epics:

- EPIC: Workflow Core and Workup Engine
- EPIC: Claude and Codex Workflow Installs
- EPIC: GitHub Copilot Compatibility
- EPIC: Microsoft Enterprise Exports
- EPIC: Healthcare Platform Compatibility Docs
- EPIC: Workflow Gallery and Growth Assets
- EPIC: Release Hygiene and Public Distribution

Initial beads:

- Add workflow schema and validation.
- Add 16 workflow definitions.
- Add healthcare-agents workflows command.
- Add healthcare-agents workup command.
- Add workflow canary tests.
- Add Claude workflow skill renderer.
- Add Codex workflow skill renderer.
- Add Copilot repo instruction renderer.
- Add Copilot custom agent renderer.
- Add Copilot prompt-file renderer.
- Add M365 declarative agent export template.
- Add Microsoft platform compatibility docs.
- Add npm/GitHub/package version sync validation.
- Add workflow gallery docs.

## Success Metrics

### Product

- Time from problem statement to useful workup under 60 seconds.
- At least 16 validated workflows.
- At least 4 install/export platform families supported.
- At least 20 example workups documented.
- At least 10 user-tested workups reviewed.

### Distribution

- npm latest matches repo release.
- GitHub README clearly communicates install and workflows.
- Copilot docs indexable and usable.
- Workflow gallery pages published.
- Demo repo or examples folder available.

### Quality

- Workflow routing canaries pass.
- Release checks pass.
- Snapshot tests cover all platform renderers.
- Safety snippets present in every generated artifact.
- Installers are idempotent and uninstallable.

## Risks and Mitigations

### Risk: Platform Surface Sprawl

Mitigation:

Use one workflow schema and one platform schema. Generate platform files from source data rather than hand-maintaining copies.

### Risk: Overclaiming Healthcare Capability

Mitigation:

Keep scope to healthcare administration and operational workups. Use explicit safety language. Avoid clinical decision-support claims.

### Risk: Copilot and Microsoft Features Change

Mitigation:

Use templates and docs that can be updated independently. Add versioned compatibility notes and snapshot tests.

### Risk: Enterprise Buyers Need Governance

Mitigation:

Provide review checklists, tenant deployment notes, PHI cautions, and export packages rather than pretending local CLI install is enterprise deployment.

### Risk: Prompt Pack Becomes Too Large

Mitigation:

Default to a curated set of workflow agents for Copilot and Microsoft. Keep the full specialist catalog available for Claude and Codex power users.

## Non-Goals

- Do not build direct Epic integration in this phase.
- Do not build direct Dragon Copilot integration in this phase.
- Do not process PHI in a hosted service.
- Do not claim medical-device, diagnosis, treatment, or emergency guidance capabilities.
- Do not generate all 51 specialists as Copilot custom agents by default.
- Do not fork separate prompt content per platform without a shared source of truth.

## Final Call

The best next development target is not just better prompts. It is a workflow engine plus platform distribution layer.

Build the Healthcare Admin Workup Engine first, then make it install cleanly into Claude, Codex, and GitHub Copilot, with governed export paths for Microsoft 365 Copilot, Copilot Studio, Azure AI Foundry, Teams, and healthcare enterprise environments.

That is the path most likely to make Healthcare Agents genuinely useful, shareable, and popular with the people who can benefit from it: healthcare operators with real administrative problems and constrained enterprise AI environments.
