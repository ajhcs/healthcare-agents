const {
  ZERO_OUTPUT_KEYS,
  createScaleInputFitnessKernel,
  semanticHash,
  stablePrettyJson
} = require('./scale-input-fitness-kernel');
const {
  ANNUAL_DISCHARGES_CANONICAL_CONTEXT,
  deriveAnnualDischargesCanonical
} = require('./scale-annual-discharges-canonical');

const {
  ACQUISITION_RAW_HASH, ACQUISITION_REF, ACQUISITION_SEMANTIC_HASH,
  COMMITTED_INPUT_REF, DATA_FEATURE, DATA_PRODUCER, DATA_TRACKER,
  EVIDENCE_BUNDLE_RAW_HASH, EVIDENCE_BUNDLE_REF, EVIDENCE_BUNDLE_SEMANTIC_HASH,
  NORMALIZED_INPUT_RAW_HASH, PRIOR_COUNTS, PRODUCER_BOUND_INPUT_RAW_HASH,
  TOOLKIT_FEATURE, TOOLKIT_HANDOFF_FILE_HASH, TOOLKIT_PRODUCER, TOOLKIT_TRACKER
} = ANNUAL_DISCHARGES_CANONICAL_CONTEXT.constants;
const OBJECT_ARTIFACT_REFS = ANNUAL_DISCHARGES_CANONICAL_CONTEXT.objectArtifactRefs;
const EVIDENCE_ARTIFACT_REFS = Object.freeze({
  normalized_input_artifact_ref: `upstream/${ANNUAL_DISCHARGES_CANONICAL_CONTEXT.evidencePaths.normalized_input}`,
  producer_bound_input_artifact_ref: `upstream/${ANNUAL_DISCHARGES_CANONICAL_CONTEXT.evidencePaths.producer_bound_input}`,
  bundle_artifact_ref: `upstream/${ANNUAL_DISCHARGES_CANONICAL_CONTEXT.evidencePaths.public_evidence_bundle}`
});
const PROHIBITED_USES = Object.freeze([
  'calculation', 'scoring', 'ranking', 'sensitivity_analysis', 'projection',
  'adjudication', 'strategic_recommendation', 'promotion', 'deployment'
]);
const HANDOFF_KEYS = Object.freeze([
  'active_family', 'adjudication_performed', 'annual_discharges_blocked_cell_count',
  'annual_discharges_open_conflict_count', 'annual_discharges_open_conflict_refs',
  'automatic_resolution', 'conflict_output_hash', 'cumulative_cell_counts',
  'cumulative_open_conflict_count', 'data_producer_commit', 'downstream_bead',
  'evidence_bundle_ref', 'evidence_lineage', 'final_disposition',
  'first_assessment_hashes', 'handoff_sha256', 'human_authority_conveyed',
  'output_inventory', 'positions_averaged', 'prior_counts', 'prohibited_uses',
  'review_hashes', 'route', 'schema_version', 'toolkit_handoff_file_hash',
  'toolkit_producer_commit', 'upstream_manifest_hash'
]);
const MANIFEST_KEYS = Object.freeze([
  'active_family', 'evidence_bundle_hash', 'evidence_bundle_ref',
  'evidence_identifiers', 'evidence_lineage', 'expected_counts',
  'manifest_sha256', 'objects', 'producer_pins', 'producer_provenance',
  'review_input_hashes', 'schema_version', 'toolkit_handoff_file_hash'
]);
const REQUEST_KEYS = Object.freeze([
  'candidate_review', 'decision_scenario', 'evidence_boundary', 'frozen_inputs',
  'posture_taxonomy', 'protocol', 'request_id', 'review_tier', 'reviewer',
  'schema_version'
]);

const kernel = createScaleInputFitnessKernel({
  activeFamily: 'annual_discharges',
  familyLabel: 'annual-discharges',
  concernLineageLabel: 'annual-slice',
  conflictRefToken: ':annual-discharges:',
  toolkitProducer: TOOLKIT_PRODUCER,
  dataProducer: DATA_PRODUCER,
  toolkitHandoffFileHash: TOOLKIT_HANDOFF_FILE_HASH,
  downstreamBead: 'healthcare-toolkit-2rr9.6.3.4',
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
    totalCells: 54, populatedCells: 0, blockedCells: 24, notResearchedCells: 30,
    familyCells: 6, familyConflicts: 6, cumulativeConflicts: 17,
    familyCellsLabel: 'six', familyConflictsLabel: 'six', cumulativeConflictsLabel: 'seventeen'
  },
  priorCounts: PRIOR_COUNTS,
  expectedManifestCounts: {
    total_cells: 54, populated_cells: 0, blocked_cells: 24,
    not_yet_researched_cells: 30, annual_discharges_blocked_cells: 6,
    annual_discharges_conflicts: 6, cumulative_open_conflicts: 17,
    ...PRIOR_COUNTS
  },
  expectedEvidenceIdentifiers: (objects, artifactHashes) => deriveAnnualDischargesCanonical({ objects, artifactHashes }).upstreamManifest.evidence_identifiers,
  zeroInventoryObjectRoles: ['prior_review_record', 'prior_assurance_case'],
  validatePrior,
  validateAdditionalUpstream,
  deriveCanonicalManifest: (objects, artifactHashes) => deriveAnnualDischargesCanonical({ objects, artifactHashes }).upstreamManifest,
  deriveCanonicalRequest: (request, objects, artifactHashes) => {
    const canonical = deriveAnnualDischargesCanonical({ objects, artifactHashes });
    return request?.protocol?.protocol_id === 'cso.operations-access-capacity.v1'
      ? canonical.operationsRequest : canonical.methodsRequest;
  },
  deriveCanonicalRequests: (objects, artifactHashes) => {
    const canonical = deriveAnnualDischargesCanonical({ objects, artifactHashes });
    return [canonical.methodsRequest, canonical.operationsRequest];
  },
  manifestKeys: MANIFEST_KEYS,
  requestKeys: REQUEST_KEYS,
  canonicalRequestHashes: {
    'cso.evidence-methods-measurement.v1': 'sha256:758c2e0dbf0733ed0d839f752dc2ede9180667e62491398df1ca25e33859223b',
    'cso.operations-access-capacity.v1': 'sha256:171b3596a55381c2b7017694c75b8cb38b5f53cac25d4ac67a2536495e96bda2'
  },
  requestRequiredTerms: ['six annual-discharges', '17 cumulative', '26 prior material discrepancies', '24 prior reviewer concerns', 'ten prior overturn gates', '56 revenue-review concerns'],
  boundaryRequiredTerms: ['no averaging', 'no adjudication', 'human'],
  expectedConcerns: expectedAnnualConcerns,
  concernErrorMessage: 'review must preserve the exact ordered prior and annual-slice concern lineage',
  familyCellState: 'blocked_source_conflict',
  familyCellMessage: 'blocked and unapproved',
  handoffKeys: HANDOFF_KEYS,
  prohibitedUses: PROHIBITED_USES,
  reviewerRoles: [
    { protocolId: 'cso.evidence-methods-measurement.v1', protocolVersion: '1.0.0', agentSlug: 'healthit-clinical-data-analyst', competenceRole: 'evidence_methods_measurement_biostatistics', label: 'evidence/methods' },
    { protocolId: 'cso.operations-access-capacity.v1', protocolVersion: '1.0.0', agentSlug: 'operations-hospital-administrator', competenceRole: 'operations_access_capacity_workforce', label: 'utilization-operations' }
  ],
  reviewHashKeys: ['methods', 'utilization_operations'],
  expectedReviewHashes: {
    methods: 'sha256:661e140bc1d6dc0e9f8a39fbe80959d9c4e1b72b760bc8ac523f9ac84775b9b9',
    utilization_operations: 'sha256:6ccf94c95e4cecfe3d42e0d22ae8d92f3c52d4d494f254934f260280483fba12'
  },
  expectedAssessmentHashes: {
    methods: 'sha256:22563368a4ac2f6780d4a6a7ec06f158aaa0dd4ec7db84b7cf1e85ac5c67a122',
    utilization_operations: 'sha256:b99a43bc4e8d1f760d411a3210093b86a2bcc95a0bceb5306a3083aec50c4b37'
  },
  handoffFamilyCellCountField: 'annual_discharges_blocked_cell_count',
  handoffFamilyConflictCountField: 'annual_discharges_open_conflict_count',
  handoffFamilyConflictRefsField: 'annual_discharges_open_conflict_refs',
  closedOutputInventory: true
});

function validateAnnualDischargesUpstream(manifest, objects, artifactHashes = {}, evidenceArtifacts = {}) {
  return kernel.validateUpstream(manifest, objects, artifactHashes, evidenceArtifacts);
}

function validateAnnualDischargesReviewRequest(request, manifest, objects, artifactHashes, evidenceArtifacts) {
  return kernel.validateReviewRequest(request, manifest, objects, artifactHashes, evidenceArtifacts);
}

function validateAnnualDischargesReviewHandoff(handoff, reviews, conflict, manifest, objects, artifactHashes, evidenceArtifacts) {
  return kernel.validateReviewHandoff(handoff, reviews, conflict, manifest, objects, artifactHashes, evidenceArtifacts);
}

function validateAdditionalUpstream(manifest, objects, artifacts, messages) {
  const provenance = manifest.producer_provenance || {};
  if (provenance.toolkit_feature !== TOOLKIT_FEATURE || provenance.toolkit_tracker !== TOOLKIT_TRACKER) messages.push('Toolkit feature/tracker provenance drift');
  if (provenance.data_feature !== DATA_FEATURE || provenance.data_tracker !== DATA_TRACKER) messages.push('Data feature/tracker provenance drift');
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
  if (objects?.toolkit_handoff?.producer_pins?.toolkit_runtime !== '0'.repeat(40)) messages.push('checked-in Toolkit handoff must preserve the normalized zero runtime placeholder');
  if (objects?.toolkit_handoff?.downstream_bead !== 'beads-aw6') messages.push('Toolkit handoff must route to beads-aw6');
  const gates = objects?.cumulative_packet?.comparability_gates || [];
  if (gates.length !== 10 || gates.some(gate => gate.status === 'passed')) messages.push('all ten comparability gates must remain unresolved');
  if (gates.find(gate => gate.dimension === 'utilization_denominator')?.status !== 'blocked') messages.push('utilization denominator gate must remain blocked');
}

function validatePrior(record, assurance, messages) {
  if ((record?.prior_material_discrepancies || []).length !== PRIOR_COUNTS.material_discrepancies) messages.push('prior record must preserve 26 material discrepancies');
  if ((record?.prior_preserved_concerns || []).length !== PRIOR_COUNTS.reviewer_concerns) messages.push('prior record must preserve 24 reviewer concerns');
  if ((record?.prior_concern_overturns || []).length !== PRIOR_COUNTS.overturn_gates) messages.push('prior record must preserve ten overturn gates');
  if ((record?.current_discrepancies || []).length !== PRIOR_COUNTS.revenue_discrepancies) messages.push('prior record must preserve two revenue-review discrepancies');
  if ((record?.current_preserved_concerns || []).length !== PRIOR_COUNTS.revenue_preserved_concerns) messages.push('prior record must preserve 56 revenue-review concerns');
  if ((record?.open_conflict_refs || []).length !== PRIOR_COUNTS.revenue_open_conflicts) messages.push('prior record must preserve eleven open conflicts');
  if ((record?.current_discrepancies || []).some(item => item.material !== true || item.human_route_required !== true || item.deterministic_resolution !== null)) messages.push('revenue-review discrepancies must remain material and unresolved');
  if ((assurance?.open_conflict_refs || []).length !== PRIOR_COUNTS.revenue_open_conflicts) messages.push('prior assurance must preserve eleven open conflicts');
  if (assurance?.professional_judgment_status !== 'human_required' || assurance?.human_review_route !== 'human_competence_matched_adjudication') messages.push('prior assurance must retain human-required competence-matched review');
}

function expectedAnnualConcerns(objects) {
  return [
    ...(objects?.prior_review_record?.prior_preserved_concerns || []).map(item => item.concern),
    ...(objects?.prior_review_record?.current_preserved_concerns || []).map(item => item.concern),
    'All six annual-discharges cells remain blocked_source_conflict and unpopulated.',
    'Six annual-discharges conflicts remain open in addition to six revenue and five roster/bed conflicts: 17 cumulative.',
    'The 26 prior material discrepancies, 24 prior reviewer concerns, ten prior overturn gates, two revenue-review discrepancies, and 56 revenue-review concerns remain active.',
    'The official sys_dsch technical definition, governed raw HTTP receipt, and source license are not present.',
    'Candidate annual totals cannot establish utilization denominator, throughput, access, occupancy, staffed capacity, demand, or achievable capacity.',
    'No averaging, no adjudication, and no model-generated human authority are permitted.'
  ];
}

module.exports = {
  ACQUISITION_RAW_HASH, ACQUISITION_REF, ACQUISITION_SEMANTIC_HASH,
  COMMITTED_INPUT_REF, DATA_FEATURE, DATA_PRODUCER, DATA_TRACKER,
  EVIDENCE_BUNDLE_RAW_HASH, EVIDENCE_BUNDLE_REF, EVIDENCE_BUNDLE_SEMANTIC_HASH,
  NORMALIZED_INPUT_RAW_HASH, PRIOR_COUNTS, PROHIBITED_USES,
  PRODUCER_BOUND_INPUT_RAW_HASH, TOOLKIT_FEATURE, TOOLKIT_HANDOFF_FILE_HASH,
  TOOLKIT_PRODUCER, TOOLKIT_TRACKER, ZERO_OUTPUT_KEYS,
  semanticHash, stablePrettyJson, validateAnnualDischargesReviewHandoff,
  validateAnnualDischargesReviewRequest, validateAnnualDischargesUpstream
};
