# Operator OS Evidence Pack Authoring

Evidence packs are offline-first source-control artifacts for healthcare administration workflows. They should help an agent ask for the right local evidence, cite source families honestly, and preserve human review boundaries.

## Authoring Rules

- Commit metadata, lookup paths, owner roles, verification status, red flags, and required fields.
- Do not commit PHI, private payer contracts, payer portal exports, screenshots, downloaded source payloads, local caches, credentials, endpoints, or run logs.
- Use source-family-not-pinpoint when exact source text has not been locally verified.
- Use local-policy-required when final interpretation depends on local policy, payer contract, provider manual, legal/compliance owner, or clinical/coding owner.
- Avoid invented page numbers, fake URLs, unsupported appeal deadlines, survey guarantees, billing authority, legal conclusions, clinical determinations, or production IT instructions.

## Scaffold Command

Use the deterministic scaffold as a starting point:

    healthcare-agents evidence-pack scaffold clean-claim-rate-decline
    node scripts/scaffold-evidence-pack.js --workflow clean-claim-rate-decline

The scaffold reads workflows/workflows.json, selects a reusable profile from lib/operator-os/workflow-profiles.js, and prints JSON to stdout. It never fetches network resources and does not write or overwrite pack files.

## Validation

    node scripts/validate-evidence-packs.js
    node scripts/validate-operator-os-coverage.js
    node scripts/test-evidence-pack-regression.js

Release readiness runs the same validators. Active packs must be offline-first, have non-empty citation-card metadata, avoid PHI-like samples, avoid live URLs as offline locators, and use declared source categories.

## Provenance

Generated fixture fields must be labeled:

- synthetic: deterministic demo or test fixture content.
- user_supplied: directly derived from CLI prompt or future local user input.
- source_derived: derived from a named citation card, evidence-pack card, uploaded local file, or other explicit local source.

Prompt-derived payer, product, CARC/RARC, system, dashboard, or review-scope fields must not be labeled as purely synthetic.

## Human Review Boundaries

Evidence packs support decision preparation. They do not replace final clinical, legal, compliance, coding, billing, contract, actuarial, pharmacy-benefit, production IT, emergency command, or executive authority.
