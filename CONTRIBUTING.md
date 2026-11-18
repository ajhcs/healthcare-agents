# Contributing to Healthcare Admin Agents

Thank you for considering contributing! This pack aims to provide MHA-level healthcare administration expertise through specialized AI agents.

## How to Contribute

### 1. Create a New Agent

1. Fork the repository
2. Choose the appropriate division prefix (or propose a new division):
   - `strategy-` — Strategic planning and advisory
   - `clinical-` — Clinical operations
   - `quality-` — Quality, safety, and compliance
   - `revenue-` — Revenue cycle and finance
   - `payer-` — Payer relations and managed care
   - `pophealth-` — Population health and community
   - `healthit-` — Health IT and informatics
   - `operations-` — Operations and administration
   - `pharmacy-` — Pharmacy and drug programs
   - `emergency-` — Emergency preparedness
3. Create your agent file following the template below
4. Run `bash scripts/lint-agents.sh` to validate
5. Submit a Pull Request

### 2. Improve Existing Agents

- Add deeper regulatory citations (specific CFR sections, CMS transmittals)
- Update for new CMS rules, HRSA guidance, or legislative changes
- Add real-world deliverable templates
- Expand domain knowledge sections
- Fix inaccuracies
- Tighten model-facing invocation triggers, completion criteria, and role-specific routing branches without flattening the agent into generic guidance

### 3. Keep Registry And Release Evidence In Sync

`agents/registry.json` is a maintained product index, not a scratch cache. Any
change to an agent slug, frontmatter display name, frontmatter description,
domain, handoff, source family, role boundary, prompt file, or reviewed date
must update the registry in the same pull request.

After changing `workflows/workflows.json`, `workflows/admin-v2/catalog.json` or
`agents/registry.json`, regenerate the router indexes and workflow references
with `node scripts/generate-router-indexes.js`.
Check them with `node scripts/validate-router-indexes.js`.

Before opening a release-oriented PR, run:

```bash
npm run release:check
```

That command is the same no-network release gate CI runs. It regenerates the eval
scorecard, validates README claims against tracked scorecard evidence, checks the
registry against agent files and usage docs, runs CLI and installer regression
tests, validates package contents, smokes the packed tarball, checks source
freshness, and validates the release manifest.

Before updating public publication claims, also run the optional network check:

```bash
npm run verify:public-release:network
```

The release manifest in `docs/release-manifest.json` maps major README/release
claims to evidence, commands, artifacts, and bead IDs. Update it when adding,
removing, or materially changing a product claim.

### 4. Report Issues

- Outdated regulatory references
- Missing agent specialties
- Inaccurate domain knowledge
- Structural inconsistencies

## Agent Template

Every agent must follow this structure:

```yaml
---
name: [lowercase-hyphen-slug matching filename]
display_name: [Human Role Name]
description: [Model-facing trigger: "Use for..." plus the narrow role branch]
color: "[hex color from division palette]"
emoji: [emoji]
vibe: [One sentence personality]
services:                              # optional
  - name: [System Name]
    url: [URL]
    tier: free|freemium|paid
---
```

### Frontmatter Description Standard

The `description` field is the model-facing invocation pointer. Write it for
routing, not marketing copy. It should:

- Start with the leading phrase `Use for`.
- Name the role and administrative domain.
- Include one compact trigger branch, or a short same-branch cluster when the
  terms are inseparable in real routing.
- Avoid restating identity that already lives in the opening role paragraph.
- Stay synchronized with `agents/registry.json`.

Examples:

```yaml
description: Use for Prior Authorization Specialist work in Clinical Operations including payer criteria, peer-to-peer prep, and PA appeals.
description: Use for Healthcare Interoperability Engineer work in Health IT & Informatics including HL7v2, FHIR, X12, HIE, patient matching, and interface errors.
```

When an agent has truly distinct trigger branches, prefer sharpening the shared
leading words in the source prompt and registry before splitting into additional
model-visible surfaces. More model-invoked surfaces spend context load.

### Prompt structure

```markdown
# [Role Name]

[Describe the work product and who will use it.]

## Review the Work

### Best Inputs
[Which domain facts change the result]

### Output Modes
[How to adapt to triage, workplan, audit/checklist, or artifact/template]

### Role Finish Check
[Evidence and source checks that the reviewer can inspect]
[Human decision owner]

### Collaboration & Handoffs
[Which neighboring roles help and when]

## 🚨 Critical Rules You Must Follow
## Domain Reference
## Deliverable Templates
## Workflow Playbooks
```

Add references for advanced cases, communication examples, or measures when
they help a specialist decide or produce useful work. Preserve the format
compatibility of standalone prompts.

### Division Color Palette

| Division | Hex |
|----------|-----|
| Strategy | `#1E3A5F` |
| Clinical | `#2E8B57` |
| Quality | `#7C3AED` |
| Revenue | `#D97706` |
| Payer | `#0891B2` |
| PopHealth | `#059669` |
| Health IT | `#3B82F6` |
| Operations | `#6B7280` |
| Pharmacy | `#DC2626` |
| Emergency | `#EF4444` |

## Quality Standards

### Role Finish Check Standard

Put the finish check near the beginning. Name the evidence the reviewer can
inspect, the applicable source or version to verify, and the human owner
who can accept the work. Use concrete `provenance.source_service_names`
from `agents/registry.json` as lookup leads. Keep the exact source and
applicability checks in the prompt for the decisions they affect.

Keep routing and cross-workflow instructions in the router. A specialist prompt
should also work when installed on its own, including its governing safety
boundaries. Put the steps and acceptance checks for a specific workflow in its
contract. Write detailed procedures where order or precision matters, and let
the host choose routine mechanics.

Keep role terminology, evidence hierarchy, source references, and templates.
Use example metrics to help an owner choose measures and verify a local target.
Label examples and verify versioned facts before applying them. Prefer an
observable review criterion over a fictional biography, memory claim, or a
length target.

After editing a role prompt or the built-in workflow catalog, run
`node scripts/generate-admin-v2-assets.js` to refresh shipped role briefs
and workflow skills. After changing routing data or workflow templates, run
`node scripts/generate-router-indexes.js`. Run `npm run validate:registry` and
`npm run validate:workflows` before review.

The Codex prompts follow the outcome, review criteria, and selective delegation
approach described in the [GPT‑6.2 prompting guide](https://learn.chatgpt.com/guides/prompting-gpt-6-2-astra).

### The Services Litmus Test

From [agency-agents](https://github.com/msitarzewski/agency-agents): *"Is this agent for the user, or for the vendor? An agent that solves the user's problem using a service belongs here. A service's quickstart guide wearing an agent costume does not."*

## Filename Convention

`{division-prefix}-{kebab-case-role-name}.md`

Derived from the `name` frontmatter field. Examples:
- "340B Program Manager" in Revenue → `revenue-340b-program-manager.md`
- "Epic Applications Analyst" in Health IT → `healthit-epic-applications-analyst.md`

## Code of Conduct

- Be respectful and professional
- Healthcare is a domain where accuracy matters — cite your sources
- Regulatory knowledge has a shelf life — note when guidance may have changed
- Welcome contributions from all healthcare administration backgrounds
