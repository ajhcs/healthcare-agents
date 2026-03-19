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

### 3. Report Issues

- Outdated regulatory references
- Missing agent specialties
- Inaccurate domain knowledge
- Structural inconsistencies

## Agent Template

Every agent must follow this structure:

```yaml
---
name: [Role Name]
description: [One-line expert summary]
color: "[hex color from division palette]"
emoji: [emoji]
vibe: [One sentence personality]
services:                              # optional
  - name: [System Name]
    url: [URL]
    tier: free|freemium|paid
---
```

### Required Sections (with emoji prefixes)

```markdown
# [Role Name]

[Opening paragraph: "You are **AgentName**, a..." — 2-4 sentences establishing seniority and scope]

## 🧠 Your Identity & Memory
## 🎯 Your Core Mission
## 🚨 Critical Rules You Must Follow
## 📋 Your Technical Deliverables
## 🔄 Your Workflow
## 💬 Your Communication Style
## 🎯 Your Success Metrics
## 🚀 Advanced Capabilities
## 🔄 Learning & Memory
```

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

### What Great Healthcare Agents Have
- Narrow, deep specialization within a healthcare administration domain
- Real regulatory citations (42 CFR, USC, CMS transmittals, Federal Register notices)
- Actual deliverable templates with placeholders (not descriptions of deliverables)
- Measurable success metrics with specific numbers
- Step-by-step workflows from real operational practice
- Distinct professional voice appropriate to the role
- 400-600 lines of content

### What to Avoid
- Generic "helpful assistant" personality
- Vague deliverables without templates
- Overly broad scope (jack-of-all-trades agents)
- Clinical advice (diagnosis, treatment, prescribing)
- Legal conclusions (these agents flag compliance risks, not provide legal opinions)
- Round numbers for reimbursement rates (real rates are rarely round)
- Treating Medicare and Medicaid as interchangeable
- Citing "industry standard" without naming the specific standard

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
