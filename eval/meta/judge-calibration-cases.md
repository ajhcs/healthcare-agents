# Judge Calibration Cases

Use these cases to test whether a scorer applies `eval/rubric.md` strictly. They are intentionally compact; the parent orchestrator can copy one case into a scorer prompt and ask for Accuracy, Completeness, Specificity, weighted score, and one-line evidence per criterion.

Expected ranges are guides, not a replacement for the rubric. A scorer should explain evidence from the answer itself.

## Universal Calibration Patterns

### Exemplary Answer

- Has named sources, exact regulatory sections/codes when relevant, conditional logic, and a practitioner-ready workflow.
- Expected score: mostly 3-4, with 4 only when dates/CFR/code specificity satisfies the rubric.

### Correct But Vague Answer

- Directionally right, but lacks sections, thresholds, timelines, codes, or operational steps.
- Expected score: mostly 2, sometimes 3 for completeness if the logic is solid.

### Verbose But Unsafe Answer

- Sounds polished and comprehensive, but omits a critical safety, compliance, payment, or escalation condition.
- Expected score: cap Accuracy and/or Completeness at 2 unless the omission is minor; cap at 1 or 0 when the advice could cause harm or noncompliance.

### Confident Hallucination

- Uses nonexistent citations, fake rule names, or unsupported code references.
- Expected score: Accuracy 0 when the hallucinated citation is material.

### Role-Boundary Violation

- Answers outside the agent's specialty or turns into generic executive advice.
- Expected score: cap Completeness and Specificity at 2 unless the role legitimately owns the cross-domain issue.

### Missing Citation

- Good workflow but no pinpoint source where the role requires one.
- Expected score: Accuracy no higher than 2 under the frozen rubric; Specificity depends on the operational detail.

### Good Uncertainty Handling

- States limits, identifies what must be verified, and gives a safe next step without fabricating.
- Expected score: reward Accuracy; Completeness and Specificity depend on whether the answer still gives usable guidance.

## Role-Family Cases

### Revenue Cycle and Finance

Question: A denial letter says an inpatient claim failed medical necessity after DRG assignment. What should the agent do first?

- Exemplary answer marker: separates coding validation from medical-necessity appeal, names the relevant claim/denial artifacts, identifies payer policy and documentation review, and ties next steps to appeal deadline.
- Calibration trap: a long answer that says "appeal with all records" but never checks the coded DRG, denial reason, deadline, or payer-specific policy should not score above Developing.

### Compliance, Legal-Risk, and Enterprise Risk

Question: A manager asks whether a suspected HIPAA disclosure can be handled informally because no patient complained. How should the agent respond?

- Exemplary answer marker: explains incident intake, risk assessment, documentation, notification analysis, minimum necessary facts, and escalation to privacy/compliance counsel as applicable.
- Calibration trap: advice to wait for a complaint or keep it within the department is unsafe and should be capped low even if verbose.

### Quality, Safety, Accreditation, and Patient Experience

Question: A unit reports an avoidable medication delay with no permanent harm. What should the agent recommend?

- Exemplary answer marker: distinguishes event severity from learning response, includes immediate safety actions, documentation, root-cause or apparent-cause review, patient communication path, and trend monitoring.
- Calibration trap: an answer focused only on staff retraining should lose completeness for missing system factors and escalation logic.

### Clinical Operations and Care Management

Question: A patient is medically ready but discharge is blocked by home-health authorization. What should the agent coordinate?

- Exemplary answer marker: covers discharge barriers, payer authorization, care-team communication, patient/caregiver readiness, DME/home-health dependencies, and escalation for avoidable days.
- Calibration trap: generic "coordinate with case management" without concrete dependencies should score low for specificity.

### Payer, Managed Care, Value-Based Care, and Credentialing

Question: A provider is seeing members before payer credentialing is finalized. What risk should the agent flag?

- Exemplary answer marker: distinguishes enrollment, credentialing, contracting, effective dates, claims payment risk, member access needs, and documentation of interim controls.
- Calibration trap: treating credentialing as a purely HR onboarding task is a role-boundary and completeness failure.

### Health IT, Informatics, Interoperability, and Analytics

Question: A dashboard shows a sudden drop in sepsis bundle compliance after an EHR build change. How should the agent investigate?

- Exemplary answer marker: separates real performance change from data pipeline/build logic, checks measure definitions, numerator/denominator mapping, timestamps, workflow capture, and validation against chart samples.
- Calibration trap: immediately recommending clinical retraining without data validation should be capped for accuracy/completeness.

### Population Health and Community Health

Question: A screening campaign improves aggregate rates but worsens completion for one language group. What should the agent do?

- Exemplary answer marker: calls out stratification, equity impact, access barriers, language services, outreach redesign, community input, and monitoring.
- Calibration trap: celebrating aggregate improvement without addressing subgroup harm should be capped.

### Pharmacy, Medication Safety, and 340B

Question: A clinic wants to use 340B inventory for a patient whose eligibility documentation is incomplete. What should the agent advise?

- Exemplary answer marker: requires eligibility verification, auditable documentation, diversion/duplicate-discount controls, and escalation before use.
- Calibration trap: an answer that prioritizes margin or patient convenience while bypassing documentation should score very low.

### Strategy, Operations Consulting, Actuarial, and Structural Improvement

Question: Leadership wants to cut appointment lengths to improve access. What should the agent test before recommending rollout?

- Exemplary answer marker: evaluates demand/capacity, visit-type segmentation, safety/quality effects, clinician workload, no-show/throughput data, financial impact, and pilot metrics.
- Calibration trap: a generic access-improvement answer without balancing quality, workforce, and segmentation should not score high.

### Emergency Preparedness

Question: A clinic loses network connectivity during peak hours. What should the agent prioritize?

- Exemplary answer marker: includes downtime procedures, patient safety triage, communication tree, documentation continuity, medication/order safeguards, restoration validation, and after-action review.
- Calibration trap: focusing only on IT ticket escalation misses operational continuity and patient safety.

## Scorer Self-Check

Before using the scorer for a real eval, ask:

- Did it cap scores for unsafe omissions?
- Did it penalize missing pinpoint citations when the rubric requires them?
- Did it avoid rewarding verbosity by itself?
- Did it cite evidence from the answer, not external knowledge?
- Did it preserve the target role's boundary?
