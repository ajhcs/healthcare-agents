const {
  ZERO_OUTPUT_KEYS,
  clone,
  createScaleInputFitnessKernel,
  rawSha256,
  semanticHash,
  stablePrettyJson
} = require('./scale-input-fitness-kernel');
const {
  EMERGENCY_DEPARTMENT_COUNT_CANONICAL_CONTEXT,
  deriveEmergencyDepartmentCountCanonical
} = require('./scale-emergency-department-count-canonical');

const {
  ACQUISITION_RAW_HASH, ACQUISITION_REF, ACQUISITION_SEMANTIC_HASH,
  COMMITTED_INPUT_REF, DATA_FEATURE, DATA_PRODUCER, DATA_TRACKER,
  EVIDENCE_BUNDLE_CANONICAL_HASH, EVIDENCE_BUNDLE_RAW_HASH,
  EVIDENCE_BUNDLE_REF, EVIDENCE_BUNDLE_SEMANTIC_HASH,
  NORMALIZED_INPUT_RAW_HASH, PRIOR_COUNTS, PRODUCER_BOUND_INPUT_RAW_HASH,
  TOOLKIT_FEATURE, TOOLKIT_HANDOFF_FILE_HASH, TOOLKIT_RUNTIME_HANDOFF_FILE_HASH,
  TOOLKIT_RUNTIME_HANDOFF_CANONICAL_HASH, TOOLKIT_PRODUCER, TOOLKIT_TRACKER
} = EMERGENCY_DEPARTMENT_COUNT_CANONICAL_CONTEXT.constants;
const OBJECT_ARTIFACT_REFS = EMERGENCY_DEPARTMENT_COUNT_CANONICAL_CONTEXT.objectArtifactRefs;
const EVIDENCE_ARTIFACT_REFS = Object.freeze({
  normalized_input_artifact_ref: `upstream/${EMERGENCY_DEPARTMENT_COUNT_CANONICAL_CONTEXT.evidencePaths.normalized_input}`,
  producer_bound_input_artifact_ref: `upstream/${EMERGENCY_DEPARTMENT_COUNT_CANONICAL_CONTEXT.evidencePaths.producer_bound_input}`,
  bundle_artifact_ref: `upstream/${EMERGENCY_DEPARTMENT_COUNT_CANONICAL_CONTEXT.evidencePaths.public_evidence_bundle}`
});
const PROHIBITED_USES = Object.freeze([
  'calculation', 'scoring', 'ranking', 'sensitivity_analysis', 'projection',
  'adjudication', 'strategic_recommendation', 'promotion', 'deployment',
  'profile_population'
]);
const HANDOFF_KEYS = Object.freeze([
  'active_family', 'adjudication_performed', 'emergency_department_count_unavailable_cell_count',
  'emergency_department_count_open_conflict_count', 'emergency_department_count_open_conflict_refs',
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
  expectedConflictRequestId: 'conflict-request:scale-emergency-department-count:2026-07-19',
  expectedConflictOutputHash: 'sha256:6714f808e513d70bbb10654c7b320ffe67218e9092d187c9081bf9ed2b4aef22',
  expectedHandoffHash: 'sha256:7f583466e92155d08699cfd5d3f7e6f2163b79f950495c2e76a24fb655839d1f',
  activeFamily: 'emergency_department_count',
  familyLabel: 'emergency-department-count',
  concernLineageLabel: 'emergency-department count slice',
  conflictRefToken: ':emergency-department-count:',
  toolkitProducer: TOOLKIT_PRODUCER,
  dataProducer: DATA_PRODUCER,
  toolkitHandoffFileHash: TOOLKIT_HANDOFF_FILE_HASH,
  downstreamBead: 'healthcare-toolkit-2rr9.6.3.12',
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
    totalCells: 54, populatedCells: 0, blockedCells: 30, unavailableCells: 18,
    notResearchedCells: 6, familyCells: 6, familyConflicts: 6, cumulativeConflicts: 41,
    familyCellsLabel: 'six', familyConflictsLabel: 'six', cumulativeConflictsLabel: 'forty-one'
  },
  priorCounts: PRIOR_COUNTS,
  expectedManifestCounts: {
    total_cells: 54, populated_cells: 0, blocked_cells: 30, unavailable_public_cells: 18,
    not_yet_researched_cells: 6, emergency_department_count_unavailable_cells: 6,
    emergency_department_count_conflicts: 6, cumulative_open_conflicts: 41,
    ...PRIOR_COUNTS
  },
  expectedEvidenceIdentifiers: (objects, artifactHashes) => deriveEmergencyDepartmentCountCanonical({ objects, artifactHashes }).upstreamManifest.evidence_identifiers,
  zeroInventoryObjectRoles: ['prior_review_record', 'prior_assurance_case'],
  validatePrior,
  validateAdditionalUpstream,
  deriveCanonicalManifest: (objects, artifactHashes) => deriveEmergencyDepartmentCountCanonical({ objects, artifactHashes }).upstreamManifest,
  deriveCanonicalRequest: (request, objects, artifactHashes) => {
    const canonical = deriveEmergencyDepartmentCountCanonical({ objects, artifactHashes });
    return request?.protocol?.protocol_id === 'cso.operations-access-capacity.v1'
      ? canonical.operationsRequest : canonical.methodsRequest;
  },
  deriveCanonicalRequests: (objects, artifactHashes) => {
    const canonical = deriveEmergencyDepartmentCountCanonical({ objects, artifactHashes });
    return [canonical.methodsRequest, canonical.operationsRequest];
  },
  manifestKeys: MANIFEST_KEYS,
  requestKeys: REQUEST_KEYS,
  canonicalRequestHashes: {
    'cso.evidence-methods-measurement.v1': 'sha256:cd6b02192f0dbd07a6f276e519f4b8b538e06ba50beb656e192118d7a35cff2f',
    'cso.operations-access-capacity.v1': 'sha256:697434bfc25f5b64e0c1e59f80e2c67e2bcec42ea40d023af29e562ebc28f1b1'
  },
  requestRequiredTerms: [
    'six definition', '41 cumulative', '38 prior discrepancies',
    '462 ordered prior concern entries', 'all ten gates', 'nine comparability gates'
  ],
  boundaryRequiredTerms: ['no averaging', 'no adjudication', 'no automatic adjudication', 'human'],
  expectedConcerns: expectedEmergencyDepartmentConcerns,
  concernErrorMessage: 'review must preserve the exact ordered 230/232-item prior lane ancestry and append only deterministic emergency-department concerns',
  familyCellState: 'unavailable_public',
  familyCellMessage: 'unavailable, unapproved, and unpopulated',
  handoffKeys: HANDOFF_KEYS,
  prohibitedUses: PROHIBITED_USES,
  reviewerRoles: [
    { protocolId: 'cso.evidence-methods-measurement.v1', protocolVersion: '1.0.0', agentSlug: 'healthit-clinical-data-analyst', competenceRole: 'evidence_methods_measurement_biostatistics', label: 'evidence/methods' },
    { protocolId: 'cso.operations-access-capacity.v1', protocolVersion: '1.0.0', agentSlug: 'operations-hospital-administrator', competenceRole: 'operations_access_capacity_workforce', label: 'emergency-access operations/access/capacity' }
  ],
  reviewHashKeys: ['methods', 'operations'],
  expectedReviewHashes: {
    methods: 'sha256:3d13c79ac197c3bf4e464bc87dcb1d6a34a2e8db35c6c259367375da7505fc19',
    operations: 'sha256:e668672517da2f7492adcb067ec963d38920c5a526042ef7929c89844d71ba4c'
  },
  expectedAssessmentHashes: {
    methods: 'sha256:3e068adfdd4ee6f2fe988e7d9d9c7bf2d87a64fe3b203f460e8a06f094c15ebe',
    operations: 'sha256:54dfb8c7754a664ba0173a2f19ae4ba74775b542dd4c545b9d19789c863646bc'
  },
  handoffFamilyCellCountField: 'emergency_department_count_unavailable_cell_count',
  handoffFamilyConflictCountField: 'emergency_department_count_open_conflict_count',
  handoffFamilyConflictRefsField: 'emergency_department_count_open_conflict_refs',
  closedOutputInventory: true
});

function validateEmergencyDepartmentCountUpstream(manifest, objects, artifactHashes = {}, evidenceArtifacts = {}) {
  return kernel.validateUpstream(manifest, objects, artifactHashes, evidenceArtifacts);
}

function validateEmergencyDepartmentCountReviewRequest(request, manifest, objects, artifactHashes, evidenceArtifacts) {
  return kernel.validateReviewRequest(request, manifest, objects, artifactHashes, evidenceArtifacts);
}

function validateEmergencyDepartmentCountReviewHandoff(handoff, reviews, conflict, manifest, objects, artifactHashes, evidenceArtifacts) {
  const messages = kernel.validateReviewHandoff(handoff, reviews, conflict, manifest, objects, artifactHashes, evidenceArtifacts);
  if (handoff?.toolkit_runtime_handoff_file_hash !== TOOLKIT_RUNTIME_HANDOFF_FILE_HASH) messages.push('handoff must preserve the frozen Toolkit runtime handoff raw hash');
  const canonical = deriveEmergencyDepartmentCountCanonical({ objects, artifactHashes });
  const priorIds = canonical.priorDiscrepancies.map(item => item.discrepancy_id);
  const currentIds = (conflict?.discrepancies || []).map(item => item.discrepancy_id);
  if (JSON.stringify(handoff?.prior_discrepancy_ids) !== JSON.stringify(priorIds)) messages.push('handoff must preserve all 38 prior discrepancy IDs in exact immutable order');
  if (JSON.stringify(handoff?.current_discrepancy_ids) !== JSON.stringify(currentIds)) messages.push('handoff must append only the exact current emergency-department discrepancy IDs');
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
  const bundle = artifacts.public_evidence_bundle;
  if (bundle && rawSha256(JSON.stringify(sortObject(bundle.value))) !== EVIDENCE_BUNDLE_CANONICAL_HASH) messages.push('public evidence bundle full canonical transport drift');
  if (objects?.toolkit_handoff?.producer_pins?.toolkit_runtime !== '0'.repeat(40)) messages.push('normalized Toolkit handoff must preserve the zero runtime placeholder');
  const runtimeHandoff = clone(objects?.toolkit_handoff || {});
  if (runtimeHandoff.producer_pins) runtimeHandoff.producer_pins.toolkit_runtime = TOOLKIT_PRODUCER;
  const runtimeCanonical = JSON.stringify(sortObject(runtimeHandoff));
  const runtimeBytes = runtimeCanonical + '\n';
  if (rawSha256(runtimeBytes) !== TOOLKIT_RUNTIME_HANDOFF_FILE_HASH) messages.push('normalized-to-runtime Toolkit handoff deterministic substitution hash drift');
  if (rawSha256(runtimeCanonical) !== TOOLKIT_RUNTIME_HANDOFF_CANONICAL_HASH) messages.push('normalized-to-runtime Toolkit handoff full canonical hash drift');
  if (objects?.toolkit_handoff?.downstream_bead !== 'beads-dui') messages.push('Toolkit handoff must route to beads-dui');
  const gates = objects?.cumulative_packet?.comparability_gates || [];
  if (gates.length !== 10 || gates.some(gate => gate.status === 'passed')) messages.push('all ten comparability gates must remain unresolved');
  if (gates.filter(gate => gate.status === 'blocked').length !== 9 || gates.filter(gate => gate.status === 'not_assessed').length !== 1) messages.push('comparability gates must remain exactly nine blocked and one not_assessed');
  if (gates.find(gate => gate.dimension === 'emergency_department_definition')?.status !== 'blocked') messages.push('emergency-department definition gate must remain blocked');
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
  if ((record?.prior_service_line_discrepancies || []).length !== PRIOR_COUNTS.service_line_discrepancies) messages.push('prior record must preserve three service-line discrepancies');
  if ((record?.prior_service_line_methods_preserved_concerns || []).length !== PRIOR_COUNTS.service_line_methods_preserved_concerns) messages.push('prior record must preserve the exact 216-item service-line methods ancestry');
  if ((record?.prior_service_line_governance_preserved_concerns || []).length !== PRIOR_COUNTS.service_line_governance_preserved_concerns) messages.push('prior record must preserve the exact 218-item service-line governance ancestry');
  if ((record?.current_discrepancies || []).length !== PRIOR_COUNTS.safety_net_discrepancies) messages.push('prior record must preserve three safety-net discrepancies');
  if ((record?.current_methods_preserved_concerns || []).length !== PRIOR_COUNTS.current_methods_preserved_concerns) messages.push('prior record must preserve the exact 230-item methods ancestry');
  if ((record?.current_population_health_preserved_concerns || []).length !== PRIOR_COUNTS.current_population_health_preserved_concerns) messages.push('prior record must preserve the exact 232-item population-health ancestry');
  if ((record?.open_conflict_refs || []).length !== PRIOR_COUNTS.prior_review_open_conflicts) messages.push('prior record must preserve thirty-five open conflicts');
  const discrepancies = [
    ...(record?.prior_material_discrepancies || []), ...(record?.prior_revenue_discrepancies || []),
    ...(record?.prior_annual_discrepancies || []), ...(record?.prior_physician_discrepancies || []),
    ...(record?.prior_service_line_discrepancies || []),
    ...(record?.current_discrepancies || [])
  ];
  if (discrepancies.length !== PRIOR_COUNTS.cumulative_discrepancies || discrepancies.some(item => item.material !== true || item.human_route_required !== true || item.deterministic_resolution !== null)) messages.push('all 38 prior review discrepancies must remain ordered, material, and unresolved');
  if ((assurance?.open_conflict_refs || []).length !== PRIOR_COUNTS.prior_review_open_conflicts) messages.push('prior assurance must preserve thirty-five open conflicts');
  if (assurance?.professional_judgment_status !== 'human_required' || assurance?.human_review_route !== 'human_competence_matched_adjudication') messages.push('prior assurance must retain human-required competence-matched review');
}

function expectedEmergencyDepartmentConcerns(objects, request, artifactHashes) {
  const canonical = deriveEmergencyDepartmentCountCanonical({ objects, artifactHashes });
  return request?.protocol?.protocol_id === 'cso.operations-access-capacity.v1'
    ? canonical.operationsRequest.candidate_review.preserved_reviewer_concerns
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
  EVIDENCE_BUNDLE_CANONICAL_HASH, EVIDENCE_BUNDLE_RAW_HASH,
  EVIDENCE_BUNDLE_REF, EVIDENCE_BUNDLE_SEMANTIC_HASH,
  NORMALIZED_INPUT_RAW_HASH, PRIOR_COUNTS, PROHIBITED_USES,
  PRODUCER_BOUND_INPUT_RAW_HASH, TOOLKIT_FEATURE, TOOLKIT_HANDOFF_FILE_HASH,
  TOOLKIT_RUNTIME_HANDOFF_CANONICAL_HASH, TOOLKIT_RUNTIME_HANDOFF_FILE_HASH,
  TOOLKIT_PRODUCER, TOOLKIT_TRACKER,
  ZERO_OUTPUT_KEYS, semanticHash, stablePrettyJson,
  validateEmergencyDepartmentCountReviewHandoff, validateEmergencyDepartmentCountReviewRequest,
  validateEmergencyDepartmentCountUpstream
};
