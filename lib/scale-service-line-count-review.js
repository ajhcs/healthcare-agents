const {
  ZERO_OUTPUT_KEYS,
  clone,
  createScaleInputFitnessKernel,
  rawSha256,
  semanticHash,
  stablePrettyJson
} = require('./scale-input-fitness-kernel');
const {
  SERVICE_LINE_COUNT_CANONICAL_CONTEXT,
  deriveServiceLineCountCanonical
} = require('./scale-service-line-count-canonical');

const {
  ACQUISITION_RAW_HASH, ACQUISITION_REF, ACQUISITION_SEMANTIC_HASH,
  COMMITTED_INPUT_REF, DATA_FEATURE, DATA_PRODUCER, DATA_TRACKER,
  EVIDENCE_BUNDLE_RAW_HASH, EVIDENCE_BUNDLE_REF, EVIDENCE_BUNDLE_SEMANTIC_HASH,
  NORMALIZED_INPUT_RAW_HASH, PRIOR_COUNTS, PRODUCER_BOUND_INPUT_RAW_HASH,
  TOOLKIT_FEATURE, TOOLKIT_HANDOFF_FILE_HASH, TOOLKIT_RUNTIME_HANDOFF_FILE_HASH,
  TOOLKIT_PRODUCER, TOOLKIT_TRACKER
} = SERVICE_LINE_COUNT_CANONICAL_CONTEXT.constants;
const OBJECT_ARTIFACT_REFS = SERVICE_LINE_COUNT_CANONICAL_CONTEXT.objectArtifactRefs;
const EVIDENCE_ARTIFACT_REFS = Object.freeze({
  normalized_input_artifact_ref: `upstream/${SERVICE_LINE_COUNT_CANONICAL_CONTEXT.evidencePaths.normalized_input}`,
  producer_bound_input_artifact_ref: `upstream/${SERVICE_LINE_COUNT_CANONICAL_CONTEXT.evidencePaths.producer_bound_input}`,
  bundle_artifact_ref: `upstream/${SERVICE_LINE_COUNT_CANONICAL_CONTEXT.evidencePaths.public_evidence_bundle}`
});
const PROHIBITED_USES = Object.freeze([
  'calculation', 'scoring', 'ranking', 'sensitivity_analysis', 'projection',
  'adjudication', 'strategic_recommendation', 'promotion', 'deployment',
  'profile_population'
]);
const HANDOFF_KEYS = Object.freeze([
  'active_family', 'adjudication_performed', 'service_line_count_unavailable_cell_count',
  'service_line_count_open_conflict_count', 'service_line_count_open_conflict_refs',
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
  activeFamily: 'service_line_count',
  familyLabel: 'service-line-count',
  concernLineageLabel: 'service-line slice',
  conflictRefToken: ':service-line-count:',
  toolkitProducer: TOOLKIT_PRODUCER,
  dataProducer: DATA_PRODUCER,
  toolkitHandoffFileHash: TOOLKIT_HANDOFF_FILE_HASH,
  downstreamBead: 'healthcare-toolkit-2rr9.6.3.8',
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
    totalCells: 54, populatedCells: 0, blockedCells: 30, unavailableCells: 6,
    notResearchedCells: 18, familyCells: 6, familyConflicts: 6, cumulativeConflicts: 29,
    familyCellsLabel: 'six', familyConflictsLabel: 'six', cumulativeConflictsLabel: 'twenty-nine'
  },
  priorCounts: PRIOR_COUNTS,
  expectedManifestCounts: {
    total_cells: 54, populated_cells: 0, blocked_cells: 30, unavailable_public_cells: 6,
    not_yet_researched_cells: 18, service_line_count_unavailable_cells: 6,
    service_line_count_conflicts: 6, cumulative_open_conflicts: 29,
    ...PRIOR_COUNTS
  },
  expectedEvidenceIdentifiers: (objects, artifactHashes) => deriveServiceLineCountCanonical({ objects, artifactHashes }).upstreamManifest.evidence_identifiers,
  zeroInventoryObjectRoles: ['prior_review_record', 'prior_assurance_case'],
  validatePrior,
  validateAdditionalUpstream,
  deriveCanonicalManifest: (objects, artifactHashes) => deriveServiceLineCountCanonical({ objects, artifactHashes }).upstreamManifest,
  deriveCanonicalRequest: (request, objects, artifactHashes) => {
    const canonical = deriveServiceLineCountCanonical({ objects, artifactHashes });
    return request?.protocol?.protocol_id === 'cso.transaction-regulatory-governance.v1'
      ? canonical.governanceRequest : canonical.methodsRequest;
  },
  deriveCanonicalRequests: (objects, artifactHashes) => {
    const canonical = deriveServiceLineCountCanonical({ objects, artifactHashes });
    return [canonical.methodsRequest, canonical.governanceRequest];
  },
  manifestKeys: MANIFEST_KEYS,
  requestKeys: REQUEST_KEYS,
  canonicalRequestHashes: {
    'cso.evidence-methods-measurement.v1': 'sha256:6605d1e88eecffcdd5bb6f036e4666a7cbb7e85dacd530659c7ad37072a21492',
    'cso.transaction-regulatory-governance.v1': 'sha256:f302845edb21860f2e1f0affe61e2ec4766dd13cd394f866047606eafe517f5e'
  },
  requestRequiredTerms: [
    'six service-line', '29 cumulative', '26 roster/bed material discrepancies',
    '24 original reviewer concerns', 'ten comparability gates',
    '56 revenue concerns', '172 annual concerns', '202-concern physician review lanes'
  ],
  boundaryRequiredTerms: ['no averaging', 'no adjudication', 'no automatic adjudication', 'human'],
  expectedConcerns: expectedServiceLineConcerns,
  concernErrorMessage: 'review must preserve the exact ordered 202-item lane ancestry and append only lane-specific service-line concerns',
  familyCellState: 'unavailable_public',
  familyCellMessage: 'unavailable, unapproved, and unpopulated',
  handoffKeys: HANDOFF_KEYS,
  prohibitedUses: PROHIBITED_USES,
  reviewerRoles: [
    { protocolId: 'cso.evidence-methods-measurement.v1', protocolVersion: '1.0.0', agentSlug: 'healthit-clinical-data-analyst', competenceRole: 'evidence_methods_measurement_biostatistics', label: 'evidence/methods' },
    { protocolId: 'cso.transaction-regulatory-governance.v1', protocolVersion: '1.0.0', agentSlug: 'strategy-healthcare-consultant', competenceRole: 'transaction_regulatory_governance', label: 'limited service-portfolio/rights governance' }
  ],
  reviewHashKeys: ['methods', 'service_portfolio_governance'],
  expectedReviewHashes: {
    methods: 'sha256:072263dcb2523d64a88b883bba13ca4e8b55076a6cb79eb444952d0326fe50cb',
    service_portfolio_governance: 'sha256:02a1c8fe0d23ff8905734553651a64b57661314f0e20a8086df4ad5a596e9158'
  },
  expectedAssessmentHashes: {
    methods: 'sha256:a7558e1fc75af434e436fdecfe8ce3d91a05f9f5f9b23baa83f7a31f1dae7744',
    service_portfolio_governance: 'sha256:0d72a93b133c741cce87d8e31228db898d286d23c4eca0937660a98cbfe4cf12'
  },
  handoffFamilyCellCountField: 'service_line_count_unavailable_cell_count',
  handoffFamilyConflictCountField: 'service_line_count_open_conflict_count',
  handoffFamilyConflictRefsField: 'service_line_count_open_conflict_refs',
  closedOutputInventory: true
});

function validateServiceLineCountUpstream(manifest, objects, artifactHashes = {}, evidenceArtifacts = {}) {
  return kernel.validateUpstream(manifest, objects, artifactHashes, evidenceArtifacts);
}

function validateServiceLineCountReviewRequest(request, manifest, objects, artifactHashes, evidenceArtifacts) {
  return kernel.validateReviewRequest(request, manifest, objects, artifactHashes, evidenceArtifacts);
}

function validateServiceLineCountReviewHandoff(handoff, reviews, conflict, manifest, objects, artifactHashes, evidenceArtifacts) {
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
  const runtimeBytes = stablePrettyJson(runtimeHandoff);
  if (rawSha256(runtimeBytes) !== TOOLKIT_RUNTIME_HANDOFF_FILE_HASH) messages.push('normalized-to-runtime Toolkit handoff deterministic substitution hash drift');
  if (objects?.toolkit_handoff?.downstream_bead !== 'beads-1aq') messages.push('Toolkit handoff must route to beads-1aq');
  const gates = objects?.cumulative_packet?.comparability_gates || [];
  if (gates.length !== 10 || gates.some(gate => gate.status === 'passed')) messages.push('all ten comparability gates must remain unresolved');
  if (gates.find(gate => gate.dimension === 'service_taxonomy')?.status !== 'blocked') messages.push('service taxonomy gate must remain blocked');
}

function validatePrior(record, assurance, messages) {
  if ((record?.prior_material_discrepancies || []).length !== PRIOR_COUNTS.material_discrepancies) messages.push('prior record must preserve 26 material discrepancies');
  if ((record?.prior_preserved_concerns || []).length !== PRIOR_COUNTS.reviewer_concerns) messages.push('prior record must preserve 24 reviewer concerns');
  if ((record?.prior_concern_overturns || []).length !== PRIOR_COUNTS.overturn_gates) messages.push('prior record must preserve ten overturn gates');
  if ((record?.prior_revenue_discrepancies || []).length !== PRIOR_COUNTS.revenue_discrepancies) messages.push('prior record must preserve two revenue-review discrepancies');
  if ((record?.prior_revenue_preserved_concerns || []).length !== PRIOR_COUNTS.revenue_preserved_concerns) messages.push('prior record must preserve 56 revenue-review concerns');
  if ((record?.prior_annual_discrepancies || []).length !== PRIOR_COUNTS.annual_discrepancies) messages.push('prior record must preserve two annual-review discrepancies');
  if ((record?.prior_annual_preserved_concerns || []).length !== PRIOR_COUNTS.annual_preserved_concerns) messages.push('prior record must preserve 172 annual-review concerns');
  if ((record?.current_discrepancies || []).length !== PRIOR_COUNTS.physician_discrepancies) messages.push('prior record must preserve two physician-review discrepancies');
  if ((record?.current_methods_preserved_concerns || []).length !== PRIOR_COUNTS.current_methods_preserved_concerns) messages.push('prior record must preserve the exact 202-item methods ancestry');
  if ((record?.current_workforce_preserved_concerns || []).length !== PRIOR_COUNTS.current_workforce_preserved_concerns) messages.push('prior record must preserve the exact 202-item workforce ancestry');
  if ((record?.open_conflict_refs || []).length !== PRIOR_COUNTS.prior_review_open_conflicts) messages.push('prior record must preserve twenty-three open conflicts');
  if ([...(record?.prior_revenue_discrepancies || []), ...(record?.current_discrepancies || [])].some(item => item.material !== true || item.human_route_required !== true || item.deterministic_resolution !== null)) messages.push('prior review discrepancies must remain material and unresolved');
  if ((assurance?.open_conflict_refs || []).length !== PRIOR_COUNTS.prior_review_open_conflicts) messages.push('prior assurance must preserve twenty-three open conflicts');
  if (assurance?.professional_judgment_status !== 'human_required' || assurance?.human_review_route !== 'human_competence_matched_adjudication') messages.push('prior assurance must retain human-required competence-matched review');
}

function expectedServiceLineConcerns(objects, request, artifactHashes) {
  const canonical = deriveServiceLineCountCanonical({ objects, artifactHashes });
  return request?.protocol?.protocol_id === 'cso.transaction-regulatory-governance.v1'
    ? canonical.governanceRequest.candidate_review.preserved_reviewer_concerns
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
  validateServiceLineCountReviewHandoff, validateServiceLineCountReviewRequest,
  validateServiceLineCountUpstream
};
