const PROFILE_DEFINITIONS = {
  revenue_cycle: {
    source_categories: ['standards', 'payer_policy', 'internal_operations', 'clearinghouse', 'coding_audit', 'finance', 'governance', 'human_escalation'],
    minimum_citation_card_coverage: ['claim submission evidence', 'payer/product segmentation', 'AR and finance impact', 'coding or edit review', 'compliance and privacy'],
    required_evidence_families: ['837 claim submission records', '835 remittance records', 'claim scrubber or clearinghouse edits', 'billing-system workqueue trends', 'finance KPI definitions'],
    common_failure_modes: ['Treating gross charges as collectible recovery', 'Ignoring payer mix or volume denominator', 'Resolving coding issues without coding review', 'Using PHI outside an approved environment'],
    human_review_owners: ['Revenue Cycle Denials Lead', 'Revenue Finance Manager', 'Coding Compliance Lead', 'Compliance or Privacy Officer'],
    phi_compliance_notes: 'Use aggregated or de-identified revenue-cycle data by default; case-level claim data requires approved environment and minimum necessary handling.'
  },
  payer_contracting: {
    source_categories: ['contract', 'payer_policy', 'finance', 'internal_operations', 'standards', 'governance', 'human_escalation', 'compliance_privacy'],
    minimum_citation_card_coverage: ['contract lookup path', 'payment variance evidence', 'payer escalation owner', 'dispute timeline', 'compliance and privacy'],
    required_evidence_families: ['contract management record', 'allowed amount history', '835 remittance records', 'fee schedule or exhibit lookup path', 'payer correspondence'],
    common_failure_modes: ['Quoting private contract text into output', 'Making legal conclusions', 'Confusing billed charges with allowed amount', 'Missing dispute deadline owner'],
    human_review_owners: ['Revenue Contract Analyst', 'Payer Relations Specialist', 'Revenue Finance Manager', 'Legal or Compliance Owner'],
    phi_compliance_notes: 'Avoid private payer contract text and claim-level identifiers; use lookup paths and owner review for contract interpretation.'
  },
  prior_authorization: {
    source_categories: ['payer_policy', 'clinical_admin', 'internal_operations', 'appeal_process', 'documentation', 'governance', 'human_escalation', 'compliance_privacy'],
    minimum_citation_card_coverage: ['payer criteria lookup', 'authorization evidence', 'appeal timeline', 'clinical review boundary', 'minimum necessary handling'],
    required_evidence_families: ['authorization log', 'eligibility response', 'denial notice', 'payer policy lookup path', 'clinical documentation checklist'],
    common_failure_modes: ['Making medical necessity determinations', 'Calculating deadlines without source dates', 'Missing licensed review', 'Using PHI outside approved workflow'],
    human_review_owners: ['Prior Authorization Lead', 'Clinical Reviewer', 'Compliance Officer', 'Appeals Manager'],
    phi_compliance_notes: 'Keep output administrative; clinical facts and medical necessity require approved source material and licensed review.'
  },
  compliance: {
    source_categories: ['regulatory', 'local_policy', 'evidence_binder', 'control_owner', 'risk_register', 'corrective_action', 'governance', 'compliance_privacy'],
    minimum_citation_card_coverage: ['regulatory source family', 'local policy evidence', 'owner sign-off', 'corrective action monitoring', 'legal/compliance boundary'],
    required_evidence_families: ['policy repository', 'evidence binder', 'risk register', 'owner sign-off record', 'corrective action tracker'],
    common_failure_modes: ['Providing legal conclusions', 'Treating checklist as audit approval', 'Missing accountable owner', 'Exposing security secrets or PHI'],
    human_review_owners: ['Compliance Officer', 'Privacy Officer', 'Risk Manager', 'Security Owner'],
    phi_compliance_notes: 'Do not include PHI, credentials, secrets, or unapproved evidence artifacts in prompts, fixtures, packs, or logs.'
  },
  quality_safety: {
    source_categories: ['regulatory', 'accreditation', 'local_policy', 'event_facts', 'measure_definition', 'corrective_action', 'governance', 'human_escalation'],
    minimum_citation_card_coverage: ['standard or measure source family', 'event facts or measure definition', 'owner sign-off', 'monitoring plan', 'clinical/compliance boundary'],
    required_evidence_families: ['standard or measure spec lookup', 'policy evidence', 'event timeline or measure definition', 'corrective action tracker', 'quality committee owner'],
    common_failure_modes: ['Assigning blame', 'Making clinical causality conclusions', 'Guaranteeing survey outcome', 'Using stale measure specifications'],
    human_review_owners: ['Quality Leader', 'Patient Safety Officer', 'Compliance Officer', 'Clinical Owner'],
    phi_compliance_notes: 'Use de-identified event facts and aggregate measure data unless local governance approves minimum necessary case detail.'
  },
  survey_readiness: {
    source_categories: ['accreditation_standard', 'cms_or_state_regulatory', 'local_policy', 'prior_findings', 'tracer_methodology', 'corrective_action', 'governance', 'human_escalation'],
    minimum_citation_card_coverage: ['standard-set source family', 'prior finding or RFI evidence', 'department owner sign-off', 'corrective-action monitoring', 'no survey guarantee boundary'],
    required_evidence_families: ['CMS CoPs, state survey agency guidance, or accreditor standards lookup', 'prior survey findings or RFI log', 'local policy evidence binder', 'tracer methodology or mock survey notes', 'corrective action tracker'],
    common_failure_modes: ['Guaranteeing survey outcome', 'Using stale standard set', 'Missing department owner sign-off', 'Treating checklist as legal or accreditation approval'],
    human_review_owners: ['Accreditation Specialist', 'Compliance Officer', 'Quality Leader', 'Department Owner'],
    phi_compliance_notes: 'Use local policy/evidence binder references and de-identified tracer observations; survey readiness output cannot guarantee survey results.'
  },
  rca2_safety: {
    source_categories: ['event_facts', 'protected_review_boundary', 'rca2_methodology', 'local_policy', 'mandatory_reporting_triage', 'action_strength', 'effectiveness_monitoring', 'human_escalation'],
    minimum_citation_card_coverage: ['de-identified event facts', 'protected review boundary', 'RCA2/action-strength method', 'mandatory reporting triage', 'effectiveness monitoring'],
    required_evidence_families: ['de-identified event report', 'event timeline and immediate containment record', 'RCA2 or action-strength methodology', 'risk/legal/compliance escalation policy', 'action effectiveness tracker'],
    common_failure_modes: ['Assigning blame', 'Making clinical causality conclusions', 'Ignoring privilege or protected-review boundary', 'Missing effectiveness monitoring'],
    human_review_owners: ['Patient Safety Officer', 'Risk Manager', 'Quality Leader', 'Legal or Compliance Owner'],
    phi_compliance_notes: 'Use de-identified event facts only; protected safety review, legal privilege, reporting, and clinical conclusions require accountable human owners.'
  },
  hedis_stars: {
    source_categories: ['measure_specification', 'program_guidance', 'local_abstraction_policy', 'data_source', 'validation_owner', 'corrective_action', 'governance', 'compliance_privacy'],
    minimum_citation_card_coverage: ['measurement year and spec source', 'product line/program', 'collection method', 'validation owner', 'corrective-action monitoring'],
    required_evidence_families: ['NCQA HEDIS measurement-year specification or CMS Stars technical note lookup', 'local abstraction policy', 'measure source-system lineage', 'gap closure workqueue', 'quality validation sign-off'],
    common_failure_modes: ['Using stale measure specifications', 'Mixing product lines or programs', 'Providing measure-level advice without current specs', 'Using member-level data outside governed access'],
    human_review_owners: ['Quality Improvement Specialist', 'Population Health Owner', 'Clinical Data Analyst', 'Compliance Officer'],
    phi_compliance_notes: 'Use current measure-year specifications and aggregate gap data where possible; member-level gap data requires governed access.'
  },
  operations: {
    source_categories: ['operational_telemetry', 'local_policy', 'staffing_capacity', 'safety_escalation', 'change_log', 'governance', 'monitoring', 'human_escalation'],
    minimum_citation_card_coverage: ['telemetry denominator', 'local operating policy', 'safety escalation', 'owner cadence', 'monitoring proof'],
    required_evidence_families: ['operations dashboard', 'staffing or capacity source', 'local policy', 'daily huddle or command log', 'monitoring cadence'],
    common_failure_modes: ['Confusing decision support with incident command', 'Missing denominator definitions', 'Ignoring safety escalation', 'Overstating authority'],
    human_review_owners: ['Operations Administrator', 'Clinical Operations Owner', 'Safety Lead', 'Data Owner'],
    phi_compliance_notes: 'Use aggregate operational measures; avoid patient-level examples unless approved and minimum necessary.'
  },
  health_it: {
    source_categories: ['system_logs', 'interface_transactions', 'change_control', 'data_dictionary', 'security_privacy', 'governance', 'monitoring', 'human_escalation'],
    minimum_citation_card_coverage: ['system log evidence', 'transaction sample path', 'change-control owner', 'source-of-truth control', 'security/privacy boundary'],
    required_evidence_families: ['interface logs', 'HL7/FHIR transaction samples without credentials', 'change ticket', 'system owner map', 'monitoring dashboard'],
    common_failure_modes: ['Recommending production changes without change control', 'Including endpoints or credentials', 'Skipping rollback owner', 'Confusing mapping hypothesis with root cause'],
    human_review_owners: ['Interface Engineer', 'Application Owner', 'IT Change Manager', 'Security or Privacy Officer'],
    phi_compliance_notes: 'Do not include live endpoints, credentials, secrets, or patient identifiers in fixtures or evidence packs.'
  },
  analytics: {
    source_categories: ['data_dictionary', 'metric_definition', 'lineage', 'refresh_cadence', 'validation_owner', 'governance', 'privacy', 'human_escalation'],
    minimum_citation_card_coverage: ['metric definition', 'data lineage', 'refresh cadence', 'validation owner', 'privacy boundary'],
    required_evidence_families: ['data dictionary', 'metric definition record', 'lineage map', 'refresh schedule', 'validation sign-off'],
    common_failure_modes: ['Building dashboards without definitions', 'Missing source-of-truth owner', 'Ignoring refresh cadence', 'Using patient-level data unnecessarily'],
    human_review_owners: ['Clinical Data Analyst', 'Operational Owner', 'Quality or Finance Owner', 'Privacy Officer'],
    phi_compliance_notes: 'Prefer aggregate metrics and de-identified examples; patient-level dashboard data requires governed access.'
  },
  pharmacy: {
    source_categories: ['contract', 'pbm_policy', 'finance', 'claims_data', 'clinical_pharmacy_review', 'governance', 'human_escalation', 'compliance_privacy'],
    minimum_citation_card_coverage: ['contract or plan source', 'claims evidence', 'financial scorecard basis', 'pharmacy benefit review', 'legal/compliance boundary'],
    required_evidence_families: ['PBM contract lookup', 'claims extract', 'rebate or formulary source path', 'finance definition', 'pharmacy owner review'],
    common_failure_modes: ['Making final legal or financial authority claims', 'Exposing contract text', 'Overlooking clinical pharmacy review', 'Using PHI outside approved environment'],
    human_review_owners: ['Pharmacy Benefits Specialist', 'Revenue Finance Manager', 'Contracting Owner', 'Compliance Officer'],
    phi_compliance_notes: 'Avoid member-level pharmacy claims and private PBM contract text; use owner-reviewed lookup paths.'
  },
  emergency_preparedness: {
    source_categories: ['exercise_documents', 'hva', 'incident_command', 'after_action', 'local_policy', 'regulatory', 'governance', 'human_escalation'],
    minimum_citation_card_coverage: ['exercise document source', 'HVA or plan reference', 'incident command boundary', 'after-action monitoring', 'regulatory/policy owner'],
    required_evidence_families: ['exercise plan', 'HVA', 'EOP policy', 'after-action tracker', 'resource owner map'],
    common_failure_modes: ['Providing live emergency guidance', 'Overriding incident command', 'Missing after-action owner', 'Treating exercise assumptions as real event facts'],
    human_review_owners: ['Emergency Preparedness Coordinator', 'Hospital Administrator', 'Compliance Officer', 'Supply Chain Owner'],
    phi_compliance_notes: 'Use exercise artifacts and aggregate readiness data; do not include live emergency instructions or patient details.'
  },
  care_coordination: {
    source_categories: ['care_coordination', 'payer_policy', 'post_acute_network', 'local_policy', 'operational_telemetry', 'governance', 'human_escalation', 'compliance_privacy'],
    minimum_citation_card_coverage: ['barrier taxonomy source', 'payer/post-acute evidence', 'owner escalation', 'monitoring cadence', 'patient-rights/privacy boundary'],
    required_evidence_families: ['barrier dashboard', 'post-acute network source', 'payer authorization rule lookup', 'local discharge policy', 'daily huddle cadence'],
    common_failure_modes: ['Making clinical discharge decisions', 'Ignoring patient choice rights', 'Using patient identifiers unnecessarily', 'Missing escalation threshold'],
    human_review_owners: ['Case Management Lead', 'Utilization Management Lead', 'Operations Administrator', 'Compliance Officer'],
    phi_compliance_notes: 'Keep outputs operational and de-identified; discharge decisions stay with qualified clinical owners.'
  },
  value_based_care: {
    source_categories: ['contract', 'measure_definition', 'actuarial_assumption', 'performance_data', 'care_gap_evidence', 'finance', 'governance', 'human_escalation'],
    minimum_citation_card_coverage: ['contract or model source', 'measure definition', 'actuarial assumption boundary', 'performance evidence', 'operational owner'],
    required_evidence_families: ['risk contract lookup', 'measure specification', 'performance dashboard', 'care gap source', 'finance or actuarial model owner'],
    common_failure_modes: ['Treating actuarial assumptions as operational facts', 'Using stale measure definitions', 'Making final contract or finance decisions', 'Ignoring compliance review'],
    human_review_owners: ['Value-Based Care Manager', 'Actuarial or Finance Owner', 'Population Health Owner', 'Compliance Officer'],
    phi_compliance_notes: 'Use aggregate performance data where possible; member-level gap data requires governed access and minimum necessary handling.'
  }
};

function normalize(value) {
  return String(value || '').toLowerCase();
}

function profileKeyForWorkflow(workflow) {
  const category = normalize(workflow.category);
  const primary = normalize(workflow.primary_agent);
  if (workflow.id === 'payer-contract-underpayment-review') return 'payer_contracting';
  if (workflow.id === 'prior-authorization-appeal-workup') return 'prior_authorization';
  if (workflow.id === 'survey-readiness-gap-review') return 'survey_readiness';
  if (workflow.id === 'patient-safety-rca2-workup') return 'rca2_safety';
  if (workflow.id === 'hedis-stars-gap-closure-sprint') return 'hedis_stars';
  if (category.includes('revenue')) return 'revenue_cycle';
  if (category.includes('compliance')) return 'compliance';
  if (category.includes('quality') || primary.includes('patient-safety')) return 'quality_safety';
  if (category.includes('operations')) return 'operations';
  if (category.includes('health it')) return 'health_it';
  if (category.includes('analytics')) return 'analytics';
  if (category.includes('pharmacy')) return 'pharmacy';
  if (category.includes('emergency')) return 'emergency_preparedness';
  if (category.includes('care coordination')) return 'care_coordination';
  if (category.includes('value-based')) return 'value_based_care';
  return 'operations';
}

function getWorkflowProfile(workflow) {
  const key = typeof workflow === 'string' ? workflow : profileKeyForWorkflow(workflow);
  const profile = PROFILE_DEFINITIONS[key];
  if (!profile) throw new Error('unknown workflow profile: ' + key);
  return { key, ...profile };
}

module.exports = {
  PROFILE_DEFINITIONS,
  profileKeyForWorkflow,
  getWorkflowProfile
};
