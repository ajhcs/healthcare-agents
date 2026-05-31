# Trust and Safety

Healthcare Agents is a healthcare administration prompt pack. It is built for operational decision support across revenue cycle, quality, compliance, payer, health IT, population health, pharmacy, operations, strategy, and emergency preparedness workflows.

It is not a clinical, legal, coding-of-record, billing-authority, audit, contracting, employment, actuarial, or compliance authority.

## Scope

Use these agents for administrative support such as triage, workplans, checklists, draft artifacts, source-aware questions, and handoff planning.

Do not use these agents to make final decisions about diagnosis, treatment, medical necessity, patient placement, discharge, prescribing, coding, billing, refunds, contract interpretation, legal exposure, compliance findings, audit conclusions, licensure, employment action, or emergency command decisions.

## Human Authority

Each registry entry names a required human owner. That owner, or the appropriate local governance body, remains responsible for final review and sign-off.

Escalate to a human owner when:

- The request asks for a final clinical, legal, coding, billing, compliance, audit, employment, contracting, actuarial, or executive decision.
- The facts are ambiguous, incomplete, privileged, reportable, time-sensitive, high dollar, patient-safety related, or likely to affect rights, coverage, payment, licensure, sanctions, or public reporting.
- The work depends on current law, payer policy, code sets, accreditation standards, contracts, state requirements, or local policy that must be verified.

## PHI and Approved Environments

This repository does not make any AI runtime safe for protected health information.

Use PHI only in an approved environment with the required security, privacy, contractual, logging, access-control, retention, and business-associate controls. Apply minimum necessary use: remove direct identifiers, reduce date and location precision where possible, and use synthetic or aggregated examples when they are sufficient.

Do not paste PHI into public models, unapproved tools, issue trackers, logs, pull requests, screenshots, or chat transcripts.

Evidence packs and fixtures in this repository must not contain PHI, private payer contract text, payer portal exports, local caches, or downloaded source payloads. Demo case data must be synthetic and provenance-labeled.

## Source Freshness

Agent prompts include source awareness, but healthcare rules change. Verify current source materials before relying on outputs, especially for CMS rules, payer policies, ICD-10/CPT/HCPCS code sets, NCCI edits, HEDIS/Stars/MIPS specifications, HIPAA/OIG guidance, 340B/HRSA rules, accreditation standards, state Medicaid and licensure rules, contracts, and local policies.

The registry last-reviewed date is provenance metadata for the prompt pack. It is not evidence that every external source is current on that date.

Operator OS evidence packs use citation cards. When exact source text has not been locally verified, cards use source-family or local-policy-required status and name the lookup path, human owner, effective/review date, and red flags. They must not invent page numbers, fake URLs, unsupported payer policies, appeal deadlines, or billing/legal claims.

Release readiness now treats source freshness as a gated lifecycle control:

- Each registry entry must name source families, regulatory domains, source-service provenance, a `last_reviewed.date`, and a review basis.
- `node scripts/validate-source-freshness.js` fails the release gate when any registry entry is missing source metadata or exceeds the configured freshness limit.
- The default stale-source limit is 180 days, with a 120-day warning threshold. Maintainers can override those values with `SOURCE_FRESHNESS_MAX_DAYS` and `SOURCE_FRESHNESS_WARN_DAYS` for a stricter release.
- A fresh registry review means the prompt metadata and source-family map were reviewed. Users still need current primary-source verification for local decisions.

## Eval Limits

The public scorecard reports internal rubric results for prompt quality, role coverage, and usability. Scores are not certification, accreditation, legal review, coding validation, billing approval, clinical validation, compliance approval, or proof of fitness for PHI.

Use eval scores as maintenance signals only. A high score does not remove the need for current-source verification and human review.

Human review remains required for payer-specific contracts, policy interpretation, appeals, coding, billing, medical necessity, legal/compliance decisions, and any use of private or PHI-bearing case material.

## Installation Safety

Run a dry run before writing files:

    healthcare-agents install --all --dry-run

Use the doctor command to see detected tools, target paths, collisions, and existing installed files:

    healthcare-agents doctor

Use single-agent installs when a full prompt pack is unnecessary:

    healthcare-agents install revenue-cycle-specialist --codex --dry-run
