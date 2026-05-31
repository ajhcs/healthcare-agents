# Revenue Cycle Denial Spike Workup

Triage a denial-rate increase, payer policy shift, AR aging issue, or write-off spike into an evidence-backed recovery plan.

Primary specialist: `revenue-cycle-specialist`
Supporting handoffs: `revenue-contract-analyst`, `healthit-clinical-data-analyst`, `quality-compliance-officer`
Output artifact: denial spike triage brief

## Example Input

> Commercial payer denial rate jumped 18 percent after a policy change and our AR days are climbing.

## Required Context

- payer or product
- denial codes or reason categories
- timeframe and baseline
- service lines affected
- estimated dollar exposure
- current appeal status

## Operator OS Evidence Pack

`denial-spike-workup` is the first Operator OS exemplar. The workflow has a committed offline-first evidence pack at `workflows/evidence-packs/denial-spike-workup.operator-os.v1.json`.

Use it with:

```bash
healthcare-agents evidence-pack list
healthcare-agents evidence-pack show denial-spike-workup
healthcare-agents evidence-pack show denial-spike-workup --json
```

The pack contains citation cards for CARC/RARC interpretation, payer policy or contract lookup, appeal deadline basis, AR exposure calculation, PHI/minimum necessary handling, 835/837/remit mapping, authorization and eligibility evidence, coding/CDI escalation, payer-relations escalation, and monitoring proof. Cards marked `source-family-not-pinpoint` or `local-policy-required` are lookup controls and owner assignments; they are not invented pinpoint citations.

Default workup generation does not fetch live sources. It can run in secure, offline, air-gapped, Azure, or Codex Cloud-style environments using committed metadata only.

## Data Modes and Provenance

Default mode is prompt-only. Case enrichment is explicit:

```bash
healthcare-agents workup "denial spike for payer X" --data-mode synthetic_only
healthcare-agents workup "denial spike for payer X" --data-mode hybrid_synthetic_public --json
```

Supported modes:

- `prompt_only`: no case enrichment beyond the user prompt.
- `synthetic_only`: deterministic fixture data only.
- `public_evidence`: offline evidence-pack metadata only.
- `public_search`: reserved for future explicit refresh/search; disabled by default.
- `hybrid_synthetic_public`: synthetic fixture plus offline evidence-pack metadata.
- `internal_private`: reserved for future local uploaded/private input; disabled without explicit local input.

Every generated case field must be labeled `source_derived`, `synthetic`, or `user_supplied`. Synthetic fields are demo fixtures and must not be treated as real patient, payer, provider, contract, or claim facts.

## Denial Spike Artifact Standard

A strong Denial Spike workup should include:

- Executive summary with what changed, where, exposure, urgency, and recommended action.
- Spike definition with timeframe, baseline, denominator, remit lag, submission timing, and affected cohorts.
- Exposure analysis that separates gross charges, expected allowed, patient responsibility, write-off, and recoverability where data supports it.
- Segmentation by payer/product, CARC/RARC, service line, location, provider group, claim type, dates of service, submission date, and remit date.
- Root-cause hypotheses across eligibility/COB, authorization, coding/modifier, medical necessity, claim edit/build, timely filing, payer processing, and contract/policy dispute.
- Evidence pull list covering 835/remit, 837, claim status, clearinghouse edits, authorization logs, eligibility responses, coding notes, payer policies, contracts, and recent workflow/system changes.
- Appeal and escalation strategy with verified rule basis, deadline basis, owner, payer contact path, and escalation threshold.
- Owner matrix for Revenue Cycle, Denials, Patient Access/Auth, Coding/CDI, Contracting/Payer Relations, Health IT/Data, and Compliance/legal when needed.
- Monitoring plan that proves whether new denials stopped, not just whether a cleanup queue shrank.

## Red Flags

- possible coding compliance risk
- payer policy retroactivity
- large dollar exposure
- patient access impact
- appeal deadline risk

## Example Output

```markdown
# Revenue Cycle Denial Spike Workup

Problem: Commercial payer denial rate jumped 18 percent after a policy change and our AR days are climbing.
Confidence: 0.72
Rationale: matched triggers: denial rate, AR days; primary specialist: revenue-cycle-specialist; artifact: denial spike triage brief; next closest workflow: prior-authorization-appeal-workup; routing score: 106

## Roles
- Primary: revenue-cycle-specialist
- Handoffs: revenue-contract-analyst, healthit-clinical-data-analyst, quality-compliance-officer

## Missing Questions
- What is the timeframe and baseline?
- What is the service lines affected?
- What is the estimated dollar exposure?
- What is the current appeal status?

## Evidence To Collect
- payer or product
- denial codes or reason categories
- timeframe and baseline
- service lines affected
- estimated dollar exposure
- current appeal status
- sample remits
- policy citation
- clearinghouse edits
- coding audit notes
- contract language

## Evidence Pack
- Operator OS Denial Spike Evidence Pack v1.0.0
- Last reviewed: 2026-05-31
- Offline-first: yes
- Citation cards:
  - standards: CARC/RARC reason-code interpretation
  - payer_policy: Payer policy or contract lookup
  - governance: PHI and minimum necessary handling; Monitoring and prevention proof
- Source limitation: some cards are source-family or local-policy lookup cards, not verified pinpoint citations.

## denial spike triage brief
### Executive summary
Add executive summary details using approved local evidence, assumptions, owner, and review status.

### Trend and exposure
Add trend and exposure details using approved local evidence, assumptions, owner, and review status.

### Root-cause hypotheses
Add root-cause hypotheses details using approved local evidence, assumptions, owner, and review status.

### Evidence pull list
Add evidence pull list details using approved local evidence, assumptions, owner, and review status.

### Appeal and escalation strategy
Add appeal and escalation strategy details using approved local evidence, assumptions, owner, and review status.

### Owner matrix
Add owner matrix details using approved local evidence, assumptions, owner, and review status.

### Monitoring plan
Add monitoring plan details using approved local evidence, assumptions, owner, and review status.

## Red Flags
- possible coding compliance risk
- payer policy retroactivity
- large dollar exposure
- patient access impact
- appeal deadline risk

## Safety
- Healthcare Agents provides healthcare administration decision support only. Do not use it for diagnosis, treatment, emergency guidance, or final clinical decision-making.
- Do not include direct patient identifiers or PHI unless you are working in a locally approved, governed environment and can apply minimum necessary data handling.
- Validate all outputs against local policy, payer contracts, applicable laws, and the accountable human owner before action.
- Escalate final clinical, legal, coding, billing, audit, compliance, contracting, employment, security, and executive decisions to qualified human owners.

## Platform Prompt
Read the revenue-cycle-specialist prompt first, then produce a structured denial spike triage brief with missing inputs, evidence pulls, handoffs, and safety constraints.

Problem: Commercial payer denial rate jumped 18 percent after a policy change and our AR days are climbing.

Return the denial spike triage brief with required context, missing inputs, handoffs, safety constraints, and a quality checklist.
```

## Platform Prompts

Claude: Use the revenue-cycle-specialist as primary for a denial spike workup. Ask for payer, denial codes, timeframe, service lines, exposure, and appeal status before drafting the triage brief.

Codex: Read the revenue-cycle-specialist prompt first, then produce a structured denial spike triage brief with missing inputs, evidence pulls, handoffs, and safety constraints.

GitHub Copilot: Create a scoped denial spike workup issue or prompt packet with acceptance criteria, evidence requests, and revenue-cycle/compliance handoffs.

Microsoft 365 Copilot: Use governed tenant data only. Produce an executive denial spike triage brief and clearly separate instructions, knowledge sources, and action placeholders.
