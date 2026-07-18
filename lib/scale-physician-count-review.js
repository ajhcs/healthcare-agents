const {
  ZERO_OUTPUT_KEYS,
  clone,
  createScaleInputFitnessKernel,
  rawSha256,
  semanticHash,
  stablePrettyJson
} = require('./scale-input-fitness-kernel');
const {
  PHYSICIAN_COUNT_CANONICAL_CONTEXT,
  derivePhysicianCountCanonical
} = require('./scale-physician-count-canonical');

const {
  ACQUISITION_RAW_HASH, ACQUISITION_REF, ACQUISITION_SEMANTIC_HASH,
  COMMITTED_INPUT_REF, DATA_FEATURE, DATA_PRODUCER, DATA_TRACKER,
  EVIDENCE_BUNDLE_RAW_HASH, EVIDENCE_BUNDLE_REF, EVIDENCE_BUNDLE_SEMANTIC_HASH,
  NORMALIZED_INPUT_RAW_HASH, PRIOR_COUNTS, PRODUCER_BOUND_INPUT_RAW_HASH,
  TOOLKIT_FEATURE, TOOLKIT_HANDOFF_FILE_HASH, TOOLKIT_RUNTIME_HANDOFF_FILE_HASH,
  TOOLKIT_PRODUCER, TOOLKIT_TRACKER
} = PHYSICIAN_COUNT_CANONICAL_CONTEXT.constants;
const OBJECT_ARTIFACT_REFS = PHYSICIAN_COUNT_CANONICAL_CONTEXT.objectArtifactRefs;
const EVIDENCE_ARTIFACT_REFS = Object.freeze({
  normalized_input_artifact_ref: `upstream/${PHYSICIAN_COUNT_CANONICAL_CONTEXT.evidencePaths.normalized_input}`,
  producer_bound_input_artifact_ref: `upstream/${PHYSICIAN_COUNT_CANONICAL_CONTEXT.evidencePaths.producer_bound_input}`,
  bundle_artifact_ref: `upstream/${PHYSICIAN_COUNT_CANONICAL_CONTEXT.evidencePaths.public_evidence_bundle}`
});
const PROHIBITED_USES = Object.freeze([
  'calculation', 'scoring', 'ranking', 'sensitivity_analysis', 'projection',
  'adjudication', 'strategic_recommendation', 'promotion', 'deployment'
]);
const HANDOFF_KEYS = Object.freeze([
  'active_family', 'adjudication_performed', 'physician_count_blocked_cell_count',
  'physician_count_open_conflict_count', 'physician_count_open_conflict_refs',
  'automatic_resolution', 'conflict_output_hash', 'cumulative_cell_counts',
  'cumulative_open_conflict_count', 'data_producer_commit', 'downstream_bead',
  'evidence_bundle_ref', 'evidence_lineage', 'final_disposition',
  'first_assessment_hashes', 'handoff_sha256', 'human_authority_conveyed',
  'output_inventory', 'positions_averaged', 'prior_counts', 'prohibited_uses',
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
  activeFamily: 'physician_count',
  familyLabel: 'physician-count',
  concernLineageLabel: 'physician-slice',
  conflictRefToken: ':physician-count:',
  toolkitProducer: TOOLKIT_PRODUCER,
  dataProducer: DATA_PRODUCER,
  toolkitHandoffFileHash: TOOLKIT_HANDOFF_FILE_HASH,
  downstreamBead: 'healthcare-toolkit-2rr9.6.3.6',
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
    totalCells: 54, populatedCells: 0, blockedCells: 30, notResearchedCells: 24,
    familyCells: 6, familyConflicts: 6, cumulativeConflicts: 23,
    familyCellsLabel: 'six', familyConflictsLabel: 'six', cumulativeConflictsLabel: 'twenty-three'
  },
  priorCounts: PRIOR_COUNTS,
  expectedManifestCounts: {
    total_cells: 54, populated_cells: 0, blocked_cells: 30,
    not_yet_researched_cells: 24, physician_count_blocked_cells: 6,
    physician_count_conflicts: 6, cumulative_open_conflicts: 23,
    ...PRIOR_COUNTS
  },
  expectedEvidenceIdentifiers: (objects, artifactHashes) => derivePhysicianCountCanonical({ objects, artifactHashes }).upstreamManifest.evidence_identifiers,
  zeroInventoryObjectRoles: ['prior_review_record', 'prior_assurance_case'],
  validatePrior,
  validateAdditionalUpstream,
  deriveCanonicalManifest: (objects, artifactHashes) => derivePhysicianCountCanonical({ objects, artifactHashes }).upstreamManifest,
  deriveCanonicalRequest: (request, objects, artifactHashes) => {
    const canonical = derivePhysicianCountCanonical({ objects, artifactHashes });
    return request?.protocol?.protocol_id === 'cso.operations-access-capacity.v1'
      ? canonical.workforceRequest : canonical.methodsRequest;
  },
  deriveCanonicalRequests: (objects, artifactHashes) => {
    const canonical = derivePhysicianCountCanonical({ objects, artifactHashes });
    return [canonical.methodsRequest, canonical.workforceRequest];
  },
  manifestKeys: MANIFEST_KEYS,
  requestKeys: REQUEST_KEYS,
  canonicalRequestHashes: {
    'cso.evidence-methods-measurement.v1': 'sha256:49742764c9df55be1efaf039d8b8824b649559567681e88fff822f181a7915a3',
    'cso.operations-access-capacity.v1': 'sha256:cc8afef67b42b1209776ae2ce3482f12810d096d1cf2df6e8088f406ee86caf7'
  },
  requestRequiredTerms: [
    'six physician-count', '23 cumulative', '26 roster/bed material discrepancies',
    '24 roster/bed reviewer concerns', 'ten evidence-specific overturn gates',
    '56 revenue-review concerns', 'two annual-review discrepancies',
    '172 annual-review concerns'
  ],
  boundaryRequiredTerms: ['no averaging', 'no adjudication', 'no automatic adjudication', 'human'],
  expectedConcerns: expectedPhysicianConcerns,
  concernErrorMessage: 'review must preserve the exact ordered prior and physician-slice concern lineage',
  blockedCellMessage: 'blocked and unapproved',
  handoffKeys: HANDOFF_KEYS,
  prohibitedUses: PROHIBITED_USES,
  reviewerRoles: [
    { protocolId: 'cso.evidence-methods-measurement.v1', protocolVersion: '1.0.0', agentSlug: 'healthit-clinical-data-analyst', competenceRole: 'evidence_methods_measurement_biostatistics', label: 'evidence/methods' },
    { protocolId: 'cso.operations-access-capacity.v1', protocolVersion: '1.0.0', agentSlug: 'operations-workforce-manager', competenceRole: 'operations_access_capacity_workforce', label: 'physician-workforce' }
  ],
  reviewHashKeys: ['methods', 'physician_workforce'],
  expectedReviewHashes: {
    methods: 'sha256:77dd1bf714b08eb31912147664e2511dd737b2b325e190d74cca870e06279f3c',
    physician_workforce: 'sha256:c83908e70e1a3fd5f36d77876cac4a73fcc4e00c551b8035a6a9cb5ef60a7e22'
  },
  expectedAssessmentHashes: {
    methods: 'sha256:af13ad57d5ffb8e80f3ddd558aa1d2d3291c892082fd8c71683b4ed5a104ec1b',
    physician_workforce: 'sha256:98c7853ab388c028b070d1a7c40ec8f9668bad9279ccaed956f4966ef96ccc0b'
  },
  handoffFamilyBlockedField: 'physician_count_blocked_cell_count',
  handoffFamilyConflictCountField: 'physician_count_open_conflict_count',
  handoffFamilyConflictRefsField: 'physician_count_open_conflict_refs',
  closedOutputInventory: true
});

function validatePhysicianCountUpstream(manifest, objects, artifactHashes = {}, evidenceArtifacts = {}) {
  return kernel.validateUpstream(manifest, objects, artifactHashes, evidenceArtifacts);
}

function validatePhysicianCountReviewRequest(request, manifest, objects, artifactHashes, evidenceArtifacts) {
  return kernel.validateReviewRequest(request, manifest, objects, artifactHashes, evidenceArtifacts);
}

function validatePhysicianCountReviewHandoff(handoff, reviews, conflict, manifest, objects, artifactHashes, evidenceArtifacts) {
  const messages = kernel.validateReviewHandoff(handoff, reviews, conflict, manifest, objects, artifactHashes, evidenceArtifacts);
  if (handoff?.toolkit_runtime_handoff_file_hash !== TOOLKIT_RUNTIME_HANDOFF_FILE_HASH) messages.push('handoff must preserve the frozen Toolkit runtime handoff raw hash');
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
  const runtimeBytes = JSON.stringify(sortObject(runtimeHandoff)) + '\n';
  if (rawSha256(runtimeBytes) !== TOOLKIT_RUNTIME_HANDOFF_FILE_HASH) messages.push('normalized-to-runtime Toolkit handoff deterministic substitution hash drift');
  if (objects?.toolkit_handoff?.downstream_bead !== 'beads-5y2') messages.push('Toolkit handoff must route to beads-5y2');
  const gates = objects?.cumulative_packet?.comparability_gates || [];
  if (gates.length !== 10 || gates.some(gate => gate.status === 'passed')) messages.push('all ten comparability gates must remain unresolved');
  if (gates.find(gate => gate.dimension === 'physician_basis')?.status !== 'blocked') messages.push('physician basis gate must remain blocked');
}

function validatePrior(record, assurance, messages) {
  if ((record?.prior_material_discrepancies || []).length !== PRIOR_COUNTS.material_discrepancies) messages.push('prior record must preserve 26 material discrepancies');
  if ((record?.prior_preserved_concerns || []).length !== PRIOR_COUNTS.reviewer_concerns) messages.push('prior record must preserve 24 reviewer concerns');
  if ((record?.prior_concern_overturns || []).length !== PRIOR_COUNTS.overturn_gates) messages.push('prior record must preserve ten overturn gates');
  if ((record?.prior_revenue_discrepancies || []).length !== PRIOR_COUNTS.revenue_discrepancies) messages.push('prior record must preserve two revenue-review discrepancies');
  if ((record?.prior_revenue_preserved_concerns || []).length !== PRIOR_COUNTS.revenue_preserved_concerns) messages.push('prior record must preserve 56 revenue-review concerns');
  if ((record?.current_discrepancies || []).length !== PRIOR_COUNTS.annual_discrepancies) messages.push('prior record must preserve two annual-review discrepancies');
  if ((record?.current_preserved_concerns || []).length !== PRIOR_COUNTS.annual_preserved_concerns) messages.push('prior record must preserve 172 annual-review concerns');
  if ((record?.open_conflict_refs || []).length !== PRIOR_COUNTS.prior_review_open_conflicts) messages.push('prior record must preserve seventeen open conflicts');
  if ([...(record?.prior_revenue_discrepancies || []), ...(record?.current_discrepancies || [])].some(item => item.material !== true || item.human_route_required !== true || item.deterministic_resolution !== null)) messages.push('prior review discrepancies must remain material and unresolved');
  if ((assurance?.open_conflict_refs || []).length !== PRIOR_COUNTS.prior_review_open_conflicts) messages.push('prior assurance must preserve seventeen open conflicts');
  if (assurance?.professional_judgment_status !== 'human_required' || assurance?.human_review_route !== 'human_competence_matched_adjudication') messages.push('prior assurance must retain human-required competence-matched review');
}

function expectedPhysicianConcerns(objects) {
  return [
    ...(objects?.prior_review_record?.prior_preserved_concerns || []).map(item => item.concern),
    ...(objects?.prior_review_record?.current_preserved_concerns || []).map(item => item.concern),
    'All six physician-count cells remain blocked_source_conflict and unpopulated.',
    'Six physician-count conflicts remain open in addition to seventeen prior roster, bed, revenue, and annual-discharge conflicts: 23 cumulative.',
    'The 26 roster/bed material discrepancies, 24 roster/bed reviewer concerns, ten evidence-specific overturn gates, two revenue-review discrepancies, 56 revenue-review concerns, two annual-review discrepancies, and 172 annual-review concerns remain active.',
    'The official total_mds technical definition and an approved physician roster, workforce basis, affiliation rule, credentialing rule, employment rule, active-status rule, specialty scope, deduplication method, APP inclusion rule, and current vintage are not present.',
    "System-specific roster conflicts remain explicit: ChristianaCare includes West Grove/current four-facility uncertainty; Jefferson predates the frozen 33-facility boundary and LVHN; Temple lacks Fox Chase/faculty-practice reconciliation; Penn lacks post-vintage/faculty-practice reconciliation; Cooper predates Cape Regional and leaves Children's scope unresolved; Main Line lacks rehabilitation/medical-staff reconciliation. Candidate total_mds values remain source-local and unapproved.",
    'No averaging, no automatic adjudication, and no model-generated human authority are permitted.'
  ];
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
  validatePhysicianCountReviewHandoff, validatePhysicianCountReviewRequest,
  validatePhysicianCountUpstream
};
