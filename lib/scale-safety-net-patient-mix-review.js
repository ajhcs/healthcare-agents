const {
  ZERO_OUTPUT_KEYS,
  clone,
  createScaleInputFitnessKernel,
  rawSha256,
  semanticHash,
  stablePrettyJson
} = require('./scale-input-fitness-kernel');
const {
  SAFETY_NET_PATIENT_MIX_CANONICAL_CONTEXT,
  deriveSafetyNetPatientMixCanonical
} = require('./scale-safety-net-patient-mix-canonical');

const {
  ACQUISITION_RAW_HASH, ACQUISITION_REF, ACQUISITION_SEMANTIC_HASH,
  COMMITTED_INPUT_REF, DATA_FEATURE, DATA_PRODUCER, DATA_TRACKER,
  EVIDENCE_BUNDLE_RAW_HASH, EVIDENCE_BUNDLE_REF, EVIDENCE_BUNDLE_SEMANTIC_HASH,
  NORMALIZED_INPUT_RAW_HASH, PRIOR_COUNTS, PRODUCER_BOUND_INPUT_RAW_HASH,
  TOOLKIT_FEATURE, TOOLKIT_HANDOFF_FILE_HASH, TOOLKIT_RUNTIME_HANDOFF_FILE_HASH,
  TOOLKIT_PRODUCER, TOOLKIT_TRACKER
} = SAFETY_NET_PATIENT_MIX_CANONICAL_CONTEXT.constants;
const OBJECT_ARTIFACT_REFS = SAFETY_NET_PATIENT_MIX_CANONICAL_CONTEXT.objectArtifactRefs;
const EVIDENCE_ARTIFACT_REFS = Object.freeze({
  normalized_input_artifact_ref: `upstream/${SAFETY_NET_PATIENT_MIX_CANONICAL_CONTEXT.evidencePaths.normalized_input}`,
  producer_bound_input_artifact_ref: `upstream/${SAFETY_NET_PATIENT_MIX_CANONICAL_CONTEXT.evidencePaths.producer_bound_input}`,
  bundle_artifact_ref: `upstream/${SAFETY_NET_PATIENT_MIX_CANONICAL_CONTEXT.evidencePaths.public_evidence_bundle}`
});
const PROHIBITED_USES = Object.freeze([
  'calculation', 'scoring', 'ranking', 'sensitivity_analysis', 'projection',
  'adjudication', 'strategic_recommendation', 'promotion', 'deployment',
  'profile_population'
]);
const HANDOFF_KEYS = Object.freeze([
  'active_family', 'adjudication_performed', 'safety_net_patient_mix_pct_unavailable_cell_count',
  'safety_net_patient_mix_pct_open_conflict_count', 'safety_net_patient_mix_pct_open_conflict_refs',
  'automatic_resolution', 'conflict_output_hash', 'cumulative_cell_counts',
  'cumulative_discrepancy_count', 'cumulative_open_conflict_count',
  'current_discrepancy_ids', 'data_producer_commit', 'downstream_bead',
  'evidence_bundle_ref', 'evidence_lineage', 'final_disposition',
  'first_assessment_hashes', 'handoff_sha256', 'human_authority_conveyed',
  'output_inventory', 'positions_averaged', 'prior_counts', 'prohibited_uses',
  'prior_discrepancy_ids',
  'review_hashes', 'route', 'schema_version', 'toolkit_handoff_file_hash',
  'toolkit_runtime_handoff_file_hash', 'toolkit_producer_commit',
  'upstream_manifest_hash'
]);
const MANIFEST_KEYS = Object.freeze([
  'active_family', 'evidence_bundle_hash', 'evidence_bundle_ref',
  'evidence_identifiers', 'evidence_lineage', 'expected_counts',
  'manifest_sha256', 'objects', 'producer_pins', 'producer_provenance',
  'review_input_hashes', 'schema_version', 'toolkit_handoff_file_hash',
  'toolkit_runtime_handoff_file_hash'
]);
const REQUEST_KEYS = Object.freeze([
  'candidate_review', 'decision_scenario', 'evidence_boundary', 'frozen_inputs',
  'posture_taxonomy', 'protocol', 'request_id', 'review_tier', 'reviewer',
  'schema_version'
]);

const kernel = createScaleInputFitnessKernel({
  activeFamily: 'safety_net_patient_mix_pct',
  familyLabel: 'safety-net-patient-mix',
  concernLineageLabel: 'safety-net patient-mix slice',
  conflictRefToken: ':safety-net-patient-mix:',
  toolkitProducer: TOOLKIT_PRODUCER,
  dataProducer: DATA_PRODUCER,
  toolkitHandoffFileHash: TOOLKIT_HANDOFF_FILE_HASH,
  downstreamBead: 'healthcare-toolkit-2rr9.6.3.10',
  objectArtifactRefs: OBJECT_ARTIFACT_REFS,
  handoffRoleMap: {
    prior_cumulative_packet: 'prior_cumulative_packet',
    prior_cumulative_review_record: 'prior_review_record',
    prior_cumulative_module_assurance_case: 'prior_assurance_case',
    decision_scenario: 'decision_scenario', identity_binding: 'identity_binding',
    cumulative_packet: 'cumulative_packet', no_execution_result: 'no_execution_result',
    process_claim: 'process_claim'
  },
  evidence: {
    bundleRef: EVIDENCE_BUNDLE_REF,
    bundleSemanticHash: EVIDENCE_BUNDLE_SEMANTIC_HASH,
    committedInputRef: COMMITTED_INPUT_REF,
    normalizedRawHash: NORMALIZED_INPUT_RAW_HASH,
    producerBoundRawHash: PRODUCER_BOUND_INPUT_RAW_HASH,
    bundleRawHash: EVIDENCE_BUNDLE_RAW_HASH,
    artifactRefs: EVIDENCE_ARTIFACT_REFS
  },
  expected: {
    totalCells: 54, populatedCells: 0, blockedCells: 30, unavailableCells: 12,
    notResearchedCells: 12, familyCells: 6, familyConflicts: 6, cumulativeConflicts: 35,
    familyCellsLabel: 'six', familyConflictsLabel: 'six', cumulativeConflictsLabel: 'thirty-five'
  },
  priorCounts: PRIOR_COUNTS,
  expectedManifestCounts: {
    total_cells: 54, populated_cells: 0, blocked_cells: 30, unavailable_public_cells: 12,
    not_yet_researched_cells: 12, safety_net_patient_mix_pct_unavailable_cells: 6,
    safety_net_patient_mix_pct_conflicts: 6, cumulative_open_conflicts: 35,
    ...PRIOR_COUNTS
  },
  expectedEvidenceIdentifiers: (objects, artifactHashes) => deriveSafetyNetPatientMixCanonical({ objects, artifactHashes }).upstreamManifest.evidence_identifiers,
  zeroInventoryObjectRoles: ['prior_review_record', 'prior_assurance_case'],
  validatePrior,
  validateAdditionalUpstream,
  deriveCanonicalManifest: (objects, artifactHashes) => deriveSafetyNetPatientMixCanonical({ objects, artifactHashes }).upstreamManifest,
  deriveCanonicalRequest: (request, objects, artifactHashes) => {
    const canonical = deriveSafetyNetPatientMixCanonical({ objects, artifactHashes });
    return request?.protocol?.protocol_id === 'cso.population-health-services.v1'
      ? canonical.populationRequest : canonical.methodsRequest;
  },
  deriveCanonicalRequests: (objects, artifactHashes) => {
    const canonical = deriveSafetyNetPatientMixCanonical({ objects, artifactHashes });
    return [canonical.methodsRequest, canonical.populationRequest];
  },
  manifestKeys: MANIFEST_KEYS,
  requestKeys: REQUEST_KEYS,
  canonicalRequestHashes: {
    'cso.evidence-methods-measurement.v1': 'sha256:c5d9882065c223ec7a67d73dc885f7cf7201147cb7e0ca3715bb9dbed3758ba0',
    'cso.population-health-services.v1': 'sha256:d8659e6b47924a86caf68eada4f98f9761656c3bd2e86928fe65f8729c5b2ce2'
  },
  requestRequiredTerms: [
    'six safety-net', '35 cumulative', '35 prior material discrepancies',
    '434 ordered prior concern entries', 'ten gates', 'eight comparability gates'
  ],
  boundaryRequiredTerms: ['no averaging', 'no adjudication', 'no automatic adjudication', 'human'],
  expectedConcerns: expectedSafetyNetConcerns,
  concernErrorMessage: 'review must preserve the exact ordered 216/218-item prior lane ancestry and append only lane-specific safety-net concerns',
  familyCellState: 'unavailable_public',
  familyCellMessage: 'unavailable, unapproved, and unpopulated',
  handoffKeys: HANDOFF_KEYS,
  prohibitedUses: PROHIBITED_USES,
  reviewerRoles: [
    { protocolId: 'cso.evidence-methods-measurement.v1', protocolVersion: '1.0.0', agentSlug: 'healthit-clinical-data-analyst', competenceRole: 'evidence_methods_measurement_biostatistics', label: 'evidence/methods' },
    { protocolId: 'cso.population-health-services.v1', protocolVersion: '1.0.0', agentSlug: 'pophealth-population-health-manager', competenceRole: 'population_health_services_research', label: 'safety-net population-health/health-services' }
  ],
  reviewHashKeys: ['methods', 'population_health'],
  expectedReviewHashes: {
    methods: 'sha256:945051ec9623e0b2a5128db0876e93cebbb0329f8811d50bda5f1af28dbe0393',
    population_health: 'sha256:cfd949767343996e41f644b328113f54bddb61d69d16bab799384e45ce01fcee'
  },
  expectedAssessmentHashes: {
    methods: 'sha256:84387b8b4d205445861abffc9c3a79853e3eede068e4230f422a5d69abd62c29',
    population_health: 'sha256:4b3efcbdbaccf972896d046be1ebc90e1af2aec02712603f9d29cc68d10aa883'
  },
  handoffFamilyCellCountField: 'safety_net_patient_mix_pct_unavailable_cell_count',
  handoffFamilyConflictCountField: 'safety_net_patient_mix_pct_open_conflict_count',
  handoffFamilyConflictRefsField: 'safety_net_patient_mix_pct_open_conflict_refs',
  closedOutputInventory: true
});

function validateSafetyNetPatientMixUpstream(manifest, objects, artifactHashes = {}, evidenceArtifacts = {}) {
  return kernel.validateUpstream(manifest, objects, artifactHashes, evidenceArtifacts);
}

function validateSafetyNetPatientMixReviewRequest(request, manifest, objects, artifactHashes, evidenceArtifacts) {
  return kernel.validateReviewRequest(request, manifest, objects, artifactHashes, evidenceArtifacts);
}

function validateSafetyNetPatientMixReviewHandoff(handoff, reviews, conflict, manifest, objects, artifactHashes, evidenceArtifacts) {
  const messages = kernel.validateReviewHandoff(handoff, reviews, conflict, manifest, objects, artifactHashes, evidenceArtifacts);
  if (handoff?.toolkit_runtime_handoff_file_hash !== TOOLKIT_RUNTIME_HANDOFF_FILE_HASH) messages.push('handoff must preserve the frozen Toolkit runtime handoff raw hash');
  const canonical = deriveSafetyNetPatientMixCanonical({ objects, artifactHashes });
  const priorIds = canonical.priorDiscrepancies.map(item => item.discrepancy_id);
  const currentIds = (conflict?.discrepancies || []).map(item => item.discrepancy_id);
  if (JSON.stringify(handoff?.prior_discrepancy_ids) !== JSON.stringify(priorIds)) messages.push('handoff must preserve all 35 prior discrepancy IDs in exact immutable order');
  if (JSON.stringify(handoff?.current_discrepancy_ids) !== JSON.stringify(currentIds)) messages.push('handoff must append only the exact current safety-net discrepancy IDs');
  if (handoff?.cumulative_discrepancy_count !== priorIds.length + currentIds.length) messages.push('handoff cumulative discrepancy count must preserve prior plus current unresolved discrepancies');
  return [...new Set(messages)];
}

function validateAdditionalUpstream(manifest, objects, artifacts, messages) {
  const provenance = manifest.producer_provenance || {};
  if (provenance.toolkit_feature !== TOOLKIT_FEATURE || provenance.toolkit_tracker !== TOOLKIT_TRACKER) messages.push('Toolkit feature/tracker provenance drift');
  if (provenance.data_feature !== DATA_FEATURE || provenance.data_tracker !== DATA_TRACKER) messages.push('Data feature/tracker provenance drift');
  if (manifest.toolkit_runtime_handoff_file_hash !== TOOLKIT_RUNTIME_HANDOFF_FILE_HASH) messages.push('Toolkit runtime handoff file hash drift');
  const acquisition = artifacts.acquisition;
  if (!acquisition) messages.push('exact acquisition evidence artifact is required');
  else {
    if (acquisition.raw_hash !== ACQUISITION_RAW_HASH) messages.push('acquisition exact bytes drift');
    if (semanticHash(acquisition.value) !== ACQUISITION_SEMANTIC_HASH) messages.push('acquisition semantic self-hash drift');
  }
  const lineage = manifest.evidence_lineage || {};
  if (lineage.acquisition_ref !== ACQUISITION_REF) messages.push('committed acquisition Git path drift');
  if (lineage.acquisition_raw_hash !== ACQUISITION_RAW_HASH) messages.push('acquisition raw hash drift');
  if (lineage.acquisition_semantic_hash !== ACQUISITION_SEMANTIC_HASH) messages.push('acquisition semantic hash drift');
  if (objects?.toolkit_handoff?.producer_pins?.toolkit_runtime !== '0'.repeat(40)) messages.push('normalized Toolkit handoff must preserve the zero runtime placeholder');
  const runtimeHandoff = clone(objects?.toolkit_handoff || {});
  if (runtimeHandoff.producer_pins) runtimeHandoff.producer_pins.toolkit_runtime = TOOLKIT_PRODUCER;
  const runtimeBytes = stablePrettyJson(runtimeHandoff);
  if (rawSha256(runtimeBytes) !== TOOLKIT_RUNTIME_HANDOFF_FILE_HASH) messages.push('normalized-to-runtime Toolkit handoff deterministic substitution hash drift');
  if (objects?.toolkit_handoff?.downstream_bead !== 'beads-vrl') messages.push('Toolkit handoff must route to beads-vrl');
  const gates = objects?.cumulative_packet?.comparability_gates || [];
  if (gates.length !== 10 || gates.some(gate => gate.status === 'passed')) messages.push('all ten comparability gates must remain unresolved');
  if (gates.filter(gate => gate.status === 'blocked').length !== 8 || gates.filter(gate => gate.status === 'not_assessed').length !== 2) messages.push('comparability gates must remain exactly eight blocked and two not_assessed');
  if (gates.find(gate => gate.dimension === 'safety_net_denominator')?.status !== 'blocked') messages.push('safety-net denominator gate must remain blocked');
}

function validatePrior(record, assurance, messages) {
  if ((record?.prior_material_discrepancies || []).length !== PRIOR_COUNTS.material_discrepancies) messages.push('prior record must preserve 26 material discrepancies');
  if ((record?.prior_preserved_concerns || []).length !== PRIOR_COUNTS.reviewer_concerns) messages.push('prior record must preserve 24 reviewer concerns');
  if ((record?.prior_concern_overturns || []).length !== PRIOR_COUNTS.overturn_gates) messages.push('prior record must preserve ten overturn gates');
  if ((record?.prior_revenue_discrepancies || []).length !== PRIOR_COUNTS.revenue_discrepancies) messages.push('prior record must preserve two revenue-review discrepancies');
  if ((record?.prior_revenue_preserved_concerns || []).length !== PRIOR_COUNTS.revenue_preserved_concerns) messages.push('prior record must preserve 56 revenue-review concerns');
  if ((record?.prior_annual_discrepancies || []).length !== PRIOR_COUNTS.annual_discrepancies) messages.push('prior record must preserve two annual-review discrepancies');
  if ((record?.prior_annual_preserved_concerns || []).length !== PRIOR_COUNTS.annual_preserved_concerns) messages.push('prior record must preserve 172 annual-review concerns');
  if ((record?.prior_physician_discrepancies || []).length !== PRIOR_COUNTS.physician_discrepancies) messages.push('prior record must preserve two physician-review discrepancies');
  if ((record?.prior_physician_methods_preserved_concerns || []).length !== PRIOR_COUNTS.physician_methods_preserved_concerns) messages.push('prior record must preserve the exact 202-item physician methods ancestry');
  if ((record?.prior_physician_workforce_preserved_concerns || []).length !== PRIOR_COUNTS.physician_workforce_preserved_concerns) messages.push('prior record must preserve the exact 202-item physician workforce ancestry');
  if ((record?.current_discrepancies || []).length !== PRIOR_COUNTS.service_line_discrepancies) messages.push('prior record must preserve three service-line discrepancies');
  if ((record?.current_methods_preserved_concerns || []).length !== PRIOR_COUNTS.current_methods_preserved_concerns) messages.push('prior record must preserve the exact 216-item methods ancestry');
  if ((record?.current_governance_preserved_concerns || []).length !== PRIOR_COUNTS.current_governance_preserved_concerns) messages.push('prior record must preserve the exact 218-item governance ancestry');
  if ((record?.open_conflict_refs || []).length !== PRIOR_COUNTS.prior_review_open_conflicts) messages.push('prior record must preserve twenty-nine open conflicts');
  const discrepancies = [
    ...(record?.prior_material_discrepancies || []), ...(record?.prior_revenue_discrepancies || []),
    ...(record?.prior_annual_discrepancies || []), ...(record?.prior_physician_discrepancies || []),
    ...(record?.current_discrepancies || [])
  ];
  if (discrepancies.length !== PRIOR_COUNTS.cumulative_discrepancies || discrepancies.some(item => item.material !== true || item.human_route_required !== true || item.deterministic_resolution !== null)) messages.push('all 35 prior review discrepancies must remain ordered, material, and unresolved');
  if ((assurance?.open_conflict_refs || []).length !== PRIOR_COUNTS.prior_review_open_conflicts) messages.push('prior assurance must preserve twenty-nine open conflicts');
  if (assurance?.professional_judgment_status !== 'human_required' || assurance?.human_review_route !== 'human_competence_matched_adjudication') messages.push('prior assurance must retain human-required competence-matched review');
}

function expectedSafetyNetConcerns(objects, request, artifactHashes) {
  const canonical = deriveSafetyNetPatientMixCanonical({ objects, artifactHashes });
  return request?.protocol?.protocol_id === 'cso.population-health-services.v1'
    ? canonical.populationRequest.candidate_review.preserved_reviewer_concerns
    : canonical.methodsRequest.candidate_review.preserved_reviewer_concerns;
}

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, sortObject(value[key])]));
  return value;
}

module.exports = {
  ACQUISITION_RAW_HASH, ACQUISITION_REF, ACQUISITION_SEMANTIC_HASH,
  COMMITTED_INPUT_REF, DATA_FEATURE, DATA_PRODUCER, DATA_TRACKER,
  EVIDENCE_BUNDLE_RAW_HASH, EVIDENCE_BUNDLE_REF, EVIDENCE_BUNDLE_SEMANTIC_HASH,
  NORMALIZED_INPUT_RAW_HASH, PRIOR_COUNTS, PROHIBITED_USES,
  PRODUCER_BOUND_INPUT_RAW_HASH, TOOLKIT_FEATURE, TOOLKIT_HANDOFF_FILE_HASH,
  TOOLKIT_RUNTIME_HANDOFF_FILE_HASH, TOOLKIT_PRODUCER, TOOLKIT_TRACKER,
  ZERO_OUTPUT_KEYS, semanticHash, stablePrettyJson,
  validateSafetyNetPatientMixReviewHandoff, validateSafetyNetPatientMixReviewRequest,
  validateSafetyNetPatientMixUpstream
};
