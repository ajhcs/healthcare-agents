# Exam Architect Playbook

> Internal scorer and item-writing guide for the lightweight healthcare-agent eval loop. This is not an installable agent prompt.

## Purpose

Use this playbook when acting as the scorer/judge in `.claude/commands/eval.md`. The scorer writes 25 challenge questions, answers them as the target agent using only the target `agents/<slug>.md`, scores those answers with `eval/rubric.md`, and produces a practical improvement brief for the editor.

The active eval system is intentionally simple:

- Use `.claude/commands/eval.md` as the executable workflow.
- Use `eval/rubric.md` as the frozen 0-4 metric.
- Read `eval/role-baselines/<slug>.md` when it exists.
- Append results only to `eval/results.tsv`.
- Do not recreate retired Python harnesses, schemas, DSPy optimizers, GEPA, MIPRO, or JSON item pipelines.

## Scorer Contract

The scorer is read-only except for the parent loop's required result logging. It must not edit agent prompts, baselines, or the rubric.

For each iteration:

1. Read the target agent fresh.
2. Read the role baseline if present.
3. Generate 25 fresh questions unless the command explicitly supplies a frozen bank.
4. Persist all 25 full question prompts before answering.
5. Mix factual, applied, edge-case, cross-domain, and deliverable questions.
6. Answer as the agent, constrained by the current prompt.
7. Score Accuracy, Completeness, and Specificity independently.
8. Return the lowest-scoring patterns and a narrow improvement brief.

Do not inflate scores to reward plausible healthcare knowledge that is absent from the agent prompt. The eval loop measures whether the prompt gives the agent enough role-specific operating guidance.

## Universal Item-Writing Rules

Good questions expose whether the prompt can drive practitioner-grade output. They are not trivia, compliance theater, or trick questions.

- Start with a real work situation, not an abstract definition request.
- Make the lead-in focused: the answer should have a clear task, decision, or deliverable.
- Require application at least as often as recall.
- Test one primary capability per question, with secondary implications only when clinically or operationally natural.
- Include enough facts for a skilled agent to answer without guessing.
- Avoid hidden assumptions; if payer type, setting, timeframe, authority, or data source matters, state it.
- Prefer named artifacts: audit plan, denial appeal outline, root-cause analysis, workflow map, dashboard spec, policy exception memo, committee briefing, or risk register.
- Distractors and edge conditions should reflect common professional mistakes, not gotchas.
- Avoid "all of the above," "none of the above," "which statement is true," and negative stems unless the negative condition is the point of the work.
- Avoid absolute words such as "always" or "never" unless a regulation or policy really is absolute.
- Do not ask for external web lookups during scoring. Source expectations test whether the agent prompt contains and invokes the right source families.
- Do not reward generic "review applicable regulations" language when the role should know which regulation, manual, standard, code set, committee, or workflow applies.

## Question-Type Targets

For a 25-question iteration, use this as a default mix. Adjust only when the role baseline clearly calls for a different emphasis.

| Type | Target | Purpose |
|---|---:|---|
| Factual mechanics | 5 | Tests core terms, frameworks, thresholds, code sets, agencies, and required artifacts. |
| Applied reasoning | 8 | Tests step-by-step decisions in realistic work contexts. |
| Edge cases | 5 | Tests exceptions, contraindications, special populations, timing, payer variation, and regulatory traps. |
| Cross-domain scenarios | 4 | Tests handoffs across finance, compliance, operations, clinical quality, IT, payer, or pharmacy. |
| Deliverable production | 3 | Tests whether the agent can produce a usable artifact with structure, owners, next steps, and citations. |

Every iteration should include at least:

- One question where a generic answer should score 2 or lower.
- One question where the best answer must cite a specific authority, code set, standard, or source family.
- One question where the agent must refuse, caveat, or escalate instead of over-answering.
- One question that tests preservation of the role's distinctive identity.

## Question Artifact Requirements

Every scored run must preserve the exact question set. This is what makes same-question retesting and before/after deltas defensible.

Write the full question set before answers are generated. The artifact must include all 25 full prompts and enough metadata for another scorer to reuse them verbatim:

```markdown
## Q001 — <short label>

- Type: applied reasoning
- Source basis: role baseline + agent prompt
- Expected coverage:
  - <capability, source family, deliverable element, or edge case>
- Scoring emphasis: accuracy | completeness | specificity | mixed

Prompt:
<full question text exactly as shown to the answerer>
```

Do not store only focus rows such as "authorization mechanics" or "network adequacy reporting." Those are useful for summaries, but they are not reusable question artifacts. If a later retest cannot recover the exact prompt text, it must be labeled fresh-comparable rather than baseline-exact.

## Citation And Source Expectations

Accuracy 3+ usually requires named sources or regulatory sections. Accuracy 4 requires the answer to use the most specific source level the prompt makes available, such as CFR section, CMS manual chapter, accreditation standard family, measure specification, code set, contract section, or authoritative guidance date.

The scorer must judge against the agent prompt and referenced source families, not against live independent research. If the prompt names a source family but not the exact section, a strong answer can still earn high Completeness and Specificity when it correctly identifies the required lookup path and decision logic. Do not grant Accuracy 4 for invented section numbers.

Common source families by domain:

- Federal regulation: CFR, CMS manuals, Federal Register rules, OIG guidance, HIPAA/HITECH, Stark, Anti-Kickback Statute, EMTALA, No Surprises Act.
- Accreditation and quality: Joint Commission, CMS Conditions of Participation, NCQA, HEDIS, AHRQ, NQF, CDC, NHSN, measure technical specs.
- Revenue and coding: ICD-10-CM/PCS Official Guidelines, CPT/HCPCS, NCCI, MS-DRG manuals, payer LCD/NCD policies, UB-04/CMS-1500 rules.
- Health IT: ONC certification, USCDI, HL7 FHIR, C-CDA, HIPAA Security Rule, TEFCA, SMART on FHIR, data governance policies.
- Payer and value-based care: CMS MA rules, Medicaid managed care rules, NCQA, contract exhibits, risk adjustment manuals, HEDIS, Stars, prior authorization rules.
- Pharmacy: USP chapters, 340B HRSA guidance, FDA labeling, REMS, formulary rules, state board rules, medication safety standards.
- Operations and strategy: service-line data, staffing standards, access metrics, throughput measures, financial statements, market data, governance charters.

## Anti-Overfitting Rules

The eval loop uses same-question pre/post scoring within an iteration to measure delta. That makes anti-overfitting discipline mandatory.

- Do not reveal answer keys or exact ideal wording to the editor; summarize weaknesses and missing mechanics.
- Do not recommend adding a one-off sentence that only answers one question.
- Prefer durable prompt improvements: frameworks, decision trees, source hierarchies, required deliverable components, escalation rules, and common failure modes.
- Preserve the agent's specialty. A payer-contracting agent should not become a generic healthcare consultant; a pharmacy agent should not become a general compliance agent.
- Keep edits compact. If a weakness requires a new section, scope it to the missed capability.
- Never modify `eval/rubric.md` to make an agent look better.
- Do not reuse questions across iterations unless using a deliberate validation or holdout bank.
- Keep holdout-style questions away from editing guidance.

## Weakness-To-Edit Mapping

Use this mapping in the scorer's improvement brief. The editor should receive targeted prompt changes, not broad rewrite advice.

| Weakness pattern | Likely prompt gap | Recommended edit |
|---|---|---|
| Correct but vague | Missing source hierarchy or named artifacts | Add source families, required citations, and output checklist for the role's common deliverables. |
| Misses exceptions | No edge-case section | Add "watch-outs" with conditions, exclusions, timing rules, and escalation triggers. |
| Wrong domain boundary | Role identity too broad or too narrow | Add scope boundaries: what the agent owns, what it coordinates, and when it refers out. |
| No step-by-step workflow | Prompt describes expertise but not operating method | Add a compact workflow: intake, validate, analyze, decide, document, escalate, monitor. |
| Poor cross-domain impact | Prompt ignores downstream teams | Add handoff impacts for finance, compliance, clinical ops, IT, payer, pharmacy, or quality. |
| Weak deliverables | Prompt lacks artifact standards | Add templates or required sections for memos, audits, dashboards, appeals, action plans, or committee briefs. |
| Hallucinated citations | Prompt encourages specificity without guardrails | Add "cite exact sections only when known; otherwise name the source family and lookup path." |
| Unsafe certainty | Missing caveat/escalation rules | Add legal, clinical, privacy, patient-safety, or financial-risk escalation triggers. |
| Overly generic voice | Prompt lacks role-specific differentiators | Add practitioner stance, decision criteria, and role-native terminology. |

## Role-Family Blueprints

Use these blueprints to design questions and calibrate strong answers. They are starting points, not exhaustive role definitions.

### Revenue Cycle And Finance

- Canonical deliverables: denial appeal, coding rationale, charge capture review, revenue leakage analysis, underpayment workplan, clean-claim checklist.
- Required mechanics: code or modifier logic, payer policy interpretation, claim lifecycle, authorization, timely filing, DRG/APC/RVU or risk adjustment impact, audit trail.
- Primary sources: ICD-10-CM/PCS, CPT/HCPCS, NCCI, CMS manuals, payer policies, LCD/NCD, contracts, fee schedules.
- Common failures: cites generic CMS rules, misses payer-specific conditions, ignores documentation sufficiency, omits downstream compliance risk.
- Red flags: upcoding advice, unsupported rebilling, hiding errors, ignoring refund obligations.
- Strong markers: exact code or policy family, defensible documentation logic, financial impact, compliance-safe next action.

Example: "A denied outpatient infusion claim includes a valid authorization, a missing modifier, and documentation that supports medical necessity. Draft the appeal structure and identify what must be corrected before resubmission."

### Compliance, Legal-Risk, And Enterprise Risk

- Canonical deliverables: risk assessment, compliance investigation plan, corrective action plan, board briefing, policy gap analysis, disclosure decision memo.
- Required mechanics: issue intake, authority mapping, evidence preservation, privilege awareness, materiality, remediation, monitoring, escalation.
- Primary sources: OIG guidance, HIPAA/HITECH, Stark, Anti-Kickback Statute, EMTALA, CMS Conditions of Participation, state law source families, internal policies.
- Common failures: treats legal conclusions as operational advice, skips evidence chain, misses reporting deadlines, gives broad ethics language without control design.
- Red flags: telling staff to conceal issues, retaliatory steps, casual PHI sharing, definitive legal advice without counsel.
- Strong markers: separates facts from legal determinations, identifies governing authority, proposes controls, assigns owners, and escalates appropriately.

Example: "A clinic manager reports that a referring physician received free staff support from the hospital during a new service-line launch. Build the first-pass compliance triage plan and list the source families counsel should review."

### Quality, Safety, Accreditation, And Patient Experience

- Canonical deliverables: RCA, FMEA, tracer plan, measure improvement plan, safety huddle brief, survey readiness checklist, patient-experience action plan.
- Required mechanics: event classification, harm and severity, contributing factors, measure numerator/denominator logic, intervention design, monitoring, governance.
- Primary sources: CMS Conditions of Participation, Joint Commission standards, NCQA, HEDIS, AHRQ, CDC/NHSN, measure specifications.
- Common failures: jumps to training as the only fix, ignores system causes, omits reliability checks, confuses quality improvement with punitive review.
- Red flags: blaming individuals without evidence, skipping immediate safety containment, manipulating measure data.
- Strong markers: containment first, structured causal analysis, measure logic, accountable action plan, sustainability checks.

Example: "A med-surg unit has three falls with injury in 30 days after a staffing model change. Draft the RCA workplan, including immediate containment, data to review, and how success will be measured."

### Clinical Operations And Care Management

- Canonical deliverables: staffing plan, access redesign, discharge barrier plan, care coordination workflow, command-center escalation, throughput dashboard.
- Required mechanics: demand/capacity, acuity, handoffs, role clarity, queue management, escalation thresholds, patient safety, finance and quality impacts.
- Primary sources: internal operating policies, CMS CoPs, care management standards, utilization management rules, throughput metrics, service-line benchmarks.
- Common failures: proposes more staffing without constraint analysis, ignores patient safety or equity, misses handoff failure modes.
- Red flags: unsafe scope-of-practice changes, discharge pressure without clinical readiness, ignoring EMTALA or patient rights.
- Strong markers: operational math, decision rights, workflow clarity, exception handling, measurable outcomes.

Example: "ED boarding increased after the hospital opened a new observation unit. Identify the operational hypotheses, data cuts, and 14-day intervention plan."

### Payer, Managed Care, Value-Based Care, And Credentialing

- Canonical deliverables: prior authorization escalation, payer contract issue brief, value-based performance plan, credentialing timeline, network adequacy risk memo.
- Required mechanics: contract terms, medical policy, utilization management, quality measures, risk adjustment, Stars/HEDIS, delegation, appeals, provider data.
- Primary sources: CMS MA and Medicaid managed care rules, NCQA, HEDIS, payer contracts, provider manuals, risk adjustment manuals, state insurance rules.
- Common failures: ignores contract language, treats all payers alike, misses delegation oversight, omits member/provider notice rules.
- Red flags: advice to bypass authorization, cherry-pick risk, falsify credentialing data, or manipulate quality submissions.
- Strong markers: contract-aware steps, member impact, compliance constraints, measurable performance and appeal path.

Example: "A Medicare Advantage payer denies a post-acute stay as not medically necessary despite new functional decline. Outline the appeal package and the operational feedback loop for future authorizations."

### Health IT, Informatics, Interoperability, And Analytics

- Canonical deliverables: interface requirement, data quality plan, dashboard specification, FHIR mapping, access-control review, incident triage, analytics validation plan.
- Required mechanics: source-of-truth selection, data lineage, terminology mapping, privacy/security controls, interoperability standard, workflow fit, validation.
- Primary sources: HIPAA Security Rule, ONC certification, USCDI, HL7 FHIR, C-CDA, TEFCA, SMART on FHIR, NIST and organizational security policies.
- Common failures: builds dashboards without definitions, ignores identity/access, assumes interoperability is just API availability, misses clinical workflow.
- Red flags: exposing PHI in public tools, weakening audit logs, using unvalidated data for payment or quality decisions.
- Strong markers: data definitions, standard-specific mapping, validation checks, privacy controls, adoption workflow.

Example: "The quality team wants a sepsis dashboard from EHR flowsheets and lab feeds. Specify the data validation plan, governance decisions, and interoperability risks before go-live."

### Population Health And Community Health

- Canonical deliverables: registry design, outreach plan, risk stratification method, equity impact review, community partner workflow, intervention evaluation.
- Required mechanics: cohort definition, attribution, social risk, stratification, outreach channel, consent/privacy, closed-loop referral, outcome measurement.
- Primary sources: HEDIS, CMS quality programs, CDC, USPSTF, state public health guidance, community health needs assessment, internal registries.
- Common failures: vague outreach, ignores denominator management, omits equity or access barriers, no feedback loop.
- Red flags: discriminatory targeting, unsupported clinical advice, PHI sharing without permissible basis.
- Strong markers: precise cohort logic, barrier-aware interventions, partner accountability, measurable outcomes.

### Pharmacy, Medication Safety, And 340B

- Canonical deliverables: formulary review, medication safety alert response, 340B audit plan, diversion risk assessment, prior authorization support, REMS workflow.
- Required mechanics: indication, dose and route, contraindications, formulary tier, substitution, compounding, procurement, eligible patient/location/provider logic.
- Primary sources: USP standards, HRSA 340B guidance, FDA labels and REMS, state board rules, ISMP, formulary policies, payer pharmacy policies.
- Common failures: misses operational inventory controls, ignores eligibility documentation, treats medication choice as purely clinical without formulary and safety context.
- Red flags: unsafe dosing certainty, diversion, bypassing REMS, unsupported substitution, noncompliant 340B accumulation.
- Strong markers: safety and compliance checks, documentation trail, pharmacist escalation, formulary and payer implications.

Example: "A covered entity finds repeated 340B accumulations for infusion drugs ordered by a non-credentialed specialist at a mixed-use site. Build the audit workplan and immediate containment steps."

### Strategy, Operations Consulting, Actuarial, And Structural Improvement

- Canonical deliverables: market scan, business case, operating model, transformation roadmap, board memo, scenario model, synergy or margin-improvement plan.
- Required mechanics: problem framing, baseline economics, stakeholder incentives, regulatory constraints, implementation sequencing, risk, KPIs, governance.
- Primary sources: financial statements, service-line data, market data, payer mix, claims/utilization data, actuarial assumptions, board strategy, regulatory constraints.
- Common failures: generic strategy slogans, no quantified baseline, ignores implementation feasibility, misses patient/community or compliance risk.
- Red flags: strategy based on illegal steering, patient dumping, unsupported actuarial assumptions, quality deterioration hidden as savings.
- Strong markers: quantified tradeoffs, explicit assumptions, operating cadence, risk controls, decision-ready recommendation.

Example: "A health system is considering consolidating two ambulatory surgery locations. Draft the decision memo structure, including volume, payer, access, staffing, quality, and regulatory analyses."

### Emergency Preparedness

- Canonical deliverables: incident action plan, hazard vulnerability analysis, continuity plan, drill after-action report, evacuation decision brief, communications plan.
- Required mechanics: command structure, triggers, resource tracking, patient prioritization, communications, regulatory reporting, continuity, after-action improvement.
- Primary sources: CMS emergency preparedness rule, HVA methods, FEMA/ICS/NIMS, Joint Commission emergency management standards, state/local emergency guidance.
- Common failures: plans without triggers, ignores vulnerable populations, weak communications, no recovery phase.
- Red flags: unsafe evacuation advice, bypassing incident command, ignoring required notifications.
- Strong markers: clear command roles, operational thresholds, resource constraints, patient safety, recovery and documentation.

## Non-Coding Scenario Patterns

Use these patterns to avoid over-indexing on coding-style questions.

- Compliance: triage a suspected Stark or AKS issue, identify facts to preserve, source families to review, and escalation path.
- Health IT: design data governance for an EHR interface, including terminology, access control, audit logging, and validation.
- Quality: build an RCA or FMEA after a safety event with containment, causal analysis, countermeasures, and measurement.
- Operations: diagnose throughput, staffing, access, or discharge bottlenecks using demand/capacity and handoff logic.
- Payer: prepare an appeal, contract variance analysis, credentialing escalation, or value-based performance remediation plan.
- Pharmacy: respond to a medication safety alert, formulary exception, REMS constraint, or 340B audit finding.
- Strategy: create a board-ready business case or operating model recommendation with assumptions, risks, KPIs, and implementation sequence.

## Judge Calibration Examples

Use these anchors to keep scoring strict and consistent. The examples are intentionally short; real eval scoring should include one-line justifications for each criterion.

### Compliance Question

Prompt: "A department offers free clinical staff support to a high-referring physician during a launch. What should the compliance agent do first?"

- Score 4 answer marker: preserves facts, pauses arrangement if needed, maps Stark/AKS/OIG and internal conflict policies, routes to counsel, defines fair-market-value and commercial-reasonableness review, documents corrective actions.
- Score 3 marker: identifies Stark/AKS risk and counsel escalation but misses evidence preservation or remediation monitoring.
- Score 2 marker: says "review compliance rules and consult legal" without naming source families or concrete triage steps.
- Score 0 marker: says the arrangement is acceptable because it helps patient access, with no risk review.

### Health IT Question

Prompt: "The organization wants to publish a quality dashboard from EHR and claims feeds. What must be validated before executives use it?"

- Score 4 marker: names source-of-truth, measure definitions, data lineage, denominator/numerator validation, refresh cadence, access controls, PHI safeguards, owner signoff, and known limitations.
- Score 3 marker: covers definitions, validation, and privacy but lacks lineage or governance detail.
- Score 2 marker: says to check data accuracy and HIPAA compliance generically.
- Score 0 marker: recommends using the raw feed immediately because dashboards are non-clinical.

### Quality Question

Prompt: "Three serious falls occur after a staffing change. What is the quality agent's first RCA plan?"

- Score 4 marker: immediate safety containment, event timeline, staffing/acuity data, environment review, patient factors, system causes, action owners, effectiveness measures, leadership escalation.
- Score 3 marker: solid RCA structure but misses containment or measurement.
- Score 2 marker: proposes staff education and reminders without causal analysis.
- Score 0 marker: blames a nurse or suppresses reporting.

### Operations Question

Prompt: "Clinic access is worsening despite unchanged appointment supply. What should the operations agent analyze?"

- Score 4 marker: demand by segment, template utilization, no-show/cancellation, referral leakage, visit length, provider mix, backlog aging, triage rules, staffing, and 30/60/90-day interventions.
- Score 3 marker: covers demand/capacity and scheduling but misses segmentation or governance.
- Score 2 marker: recommends adding slots without diagnosing constraints.
- Score 0 marker: recommends discouraging complex patients to improve access metrics.

### Payer Question

Prompt: "A Medicare Advantage denial conflicts with the contract's appeal timelines. What should the payer agent do?"

- Score 4 marker: verifies contract and provider manual, preserves deadline, builds medical necessity and contract argument, identifies notice rights, escalates if systemic, logs root cause and payer pattern.
- Score 3 marker: prepares an appeal with contract reference but misses systemic tracking.
- Score 2 marker: says to appeal with more documentation but no contract or timeline detail.
- Score 0 marker: advises resubmitting as a different service to get paid.

### Pharmacy Question

Prompt: "A mixed-use site may have accumulated 340B claims for ineligible orders. What should the pharmacy agent do?"

- Score 4 marker: freezes questionable accumulation, defines affected NDCs/accounts/dates, tests patient/provider/location eligibility, reviews split-billing logic, estimates repayment exposure, documents corrective action, escalates to compliance.
- Score 3 marker: strong audit plan but misses containment or repayment analysis.
- Score 2 marker: reviews purchase records without eligibility logic.
- Score 0 marker: says to keep accumulating because the entity is covered.

### Strategy Question

Prompt: "Leadership asks whether to consolidate two ambulatory sites. What does a strategy agent need before recommending?"

- Score 4 marker: volume, payer mix, contribution margin, access/travel impact, staffing, regulatory and certificate constraints, quality outcomes, capital needs, transition risk, scenarios, KPIs, and governance.
- Score 3 marker: covers financial and operational analysis but misses access or regulatory constraints.
- Score 2 marker: gives generic SWOT categories with no healthcare mechanics.
- Score 0 marker: recommends closure solely based on highest-margin payer mix.

## Improvement Brief Template

When separate scorer and editor roles are available, return this concise brief after scoring:

```markdown
## Improvement Brief

Weak areas:
- <criterion and question pattern, not full answer key>
- <criterion and question pattern>

Targeted edits:
- Add <specific workflow/source/edge-case guidance> to <existing section if known>.
- Add <deliverable checklist/escalation rule/source hierarchy>.

Identity to preserve:
- <role-specific voice, boundaries, and differentiators>

Anti-patterns to avoid:
- <generic broadening, boilerplate, duplicated sections, invented citations>

Expected gain:
- <which question types should improve and why>
```

Keep the brief actionable enough for the editor to improve the prompt, but not so specific that it trains to the exact 25 questions.
