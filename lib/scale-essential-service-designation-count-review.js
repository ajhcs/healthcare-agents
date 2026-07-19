const {
  ZERO_OUTPUT_KEYS,
  clone,
  createScaleInputFitnessKernel,
  rawSha256,
  semanticHash,
  stablePrettyJson
} = require('./scale-input-fitness-kernel');
const {
  ESSENTIAL_SERVICE_DESIGNATION_COUNT_CANONICAL_CONTEXT,
  deriveEssentialServiceDesignationCountCanonical
} = require('./scale-essential-service-designation-count-canonical');

const {
  ACQUISITION_RAW_HASH, ACQUISITION_REF, ACQUISITION_SEMANTIC_HASH,
  COMMITTED_INPUT_REF, DATA_FEATURE, DATA_PRODUCER, DATA_TRACKER,
  EVIDENCE_BUNDLE_CANONICAL_HASH, EVIDENCE_BUNDLE_RAW_HASH,
  EVIDENCE_BUNDLE_REF, EVIDENCE_BUNDLE_SEMANTIC_HASH,
  NORMALIZED_INPUT_RAW_HASH, PRIOR_COUNTS, PRODUCER_BOUND_INPUT_RAW_HASH,
  TOOLKIT_FEATURE, TOOLKIT_HANDOFF_FILE_HASH, TOOLKIT_RUNTIME_HANDOFF_FILE_HASH,
  TOOLKIT_RUNTIME_HANDOFF_CANONICAL_HASH, TOOLKIT_PRODUCER, TOOLKIT_TRACKER
} = ESSENTIAL_SERVICE_DESIGNATION_COUNT_CANONICAL_CONTEXT.constants;
const OBJECT_ARTIFACT_REFS = ESSENTIAL_SERVICE_DESIGNATION_COUNT_CANONICAL_CONTEXT.objectArtifactRefs;
const EVIDENCE_ARTIFACT_REFS = Object.freeze({
  normalized_input_artifact_ref: `upstream/${ESSENTIAL_SERVICE_DESIGNATION_COUNT_CANONICAL_CONTEXT.evidencePaths.normalized_input}`,
  producer_bound_input_artifact_ref: `upstream/${ESSENTIAL_SERVICE_DESIGNATION_COUNT_CANONICAL_CONTEXT.evidencePaths.producer_bound_input}`,
  bundle_artifact_ref: `upstream/${ESSENTIAL_SERVICE_DESIGNATION_COUNT_CANONICAL_CONTEXT.evidencePaths.public_evidence_bundle}`
});
const PROHIBITED_USES = Object.freeze([
  'calculation', 'scoring', 'ranking', 'sensitivity_analysis', 'projection',
  'adjudication', 'strategic_recommendation', 'promotion', 'deployment',
  'profile_population'
]);
const HANDOFF_KEYS = Object.freeze([
  'active_family', 'adjudication_performed', 'essential_service_designation_count_unavailable_cell_count',
  'essential_service_designation_count_open_conflict_count', 'essential_service_designation_count_open_conflict_refs',
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
  expectedConflictRequestId: 'conflict-request:scale-essential-service-designation-count:2026-07-19',
  expectedConflictOutputHash: 'sha256:52cebc1995a7c4d6f87ccdf51902f3df3d869e7db3f33a61a331b1a2403bcdd2',
  expectedHandoffHash: 'sha256:f7a7780a153ae3ad44609996f3151ef6549adf349bd4fb032d024d88eb2930eb',
  activeFamily: 'essential_service_designation_count',
  familyLabel: 'essential-service-designation-count',
  concernLineageLabel: 'essential-service-designation count slice',
  conflictRefToken: ':essential-service-designation-count:',
  toolkitProducer: TOOLKIT_PRODUCER,
  dataProducer: DATA_PRODUCER,
  toolkitHandoffFileHash: TOOLKIT_HANDOFF_FILE_HASH,
  downstreamBead: 'healthcare-toolkit-2rr9.6.3.14',
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
    totalCells: 54, populatedCells: 0, blockedCells: 30, unavailableCells: 24,
    notResearchedCells: 0, familyCells: 6, familyConflicts: 6, cumulativeConflicts: 47,
    familyCellsLabel: 'six', familyConflictsLabel: 'six', cumulativeConflictsLabel: 'forty-seven'
  },
  priorCounts: PRIOR_COUNTS,
  expectedManifestCounts: {
    total_cells: 54, populated_cells: 0, blocked_cells: 30, unavailable_public_cells: 24,
    not_yet_researched_cells: 0, essential_service_designation_count_unavailable_cells: 6,
    essential_service_designation_count_conflicts: 6, cumulative_open_conflicts: 47,
    ...PRIOR_COUNTS
  },
  expectedEvidenceIdentifiers: (objects, artifactHashes) => deriveEssentialServiceDesignationCountCanonical({ objects, artifactHashes }).upstreamManifest.evidence_identifiers,
  zeroInventoryObjectRoles: ['prior_review_record', 'prior_assurance_case'],
  validatePrior,
  validateAdditionalUpstream,
  deriveCanonicalManifest: (objects, artifactHashes) => deriveEssentialServiceDesignationCountCanonical({ objects, artifactHashes }).upstreamManifest,
  deriveCanonicalRequest: (request, objects, artifactHashes) => {
    const canonical = deriveEssentialServiceDesignationCountCanonical({ objects, artifactHashes });
    return request?.protocol?.protocol_id === 'cso.transaction-regulatory-governance.v1'
      ? canonical.regulatoryRequest : canonical.methodsRequest;
  },
  deriveCanonicalRequests: (objects, artifactHashes) => {
    const canonical = deriveEssentialServiceDesignationCountCanonical({ objects, artifactHashes });
    return [canonical.methodsRequest, canonical.regulatoryRequest];
  },
  manifestKeys: MANIFEST_KEYS,
  requestKeys: REQUEST_KEYS,
  canonicalRequestHashes: {
    'cso.evidence-methods-measurement.v1': 'sha256:0ea0dd4825af1c468eb8df6fa10ba89c5d156df614e8743d732b3bfa905e6e13',
    'cso.transaction-regulatory-governance.v1': 'sha256:7e38774e1f42d02360cdcddd0ab16f40767c5adda9bb8cd5b99378b95d3b001c'
  },
  requestRequiredTerms: [
    'six designation', '47 cumulative', '41 prior',
    '490 ordered prior concern entries', 'all ten blocked gates', 'no exact designation-taxonomy'
  ],
  boundaryRequiredTerms: ['no averaging', 'no adjudication', 'no automatic adjudication', 'human'],
  expectedConcerns: expectedDesignationConcerns,
  concernErrorMessage: 'review must preserve the exact ordered 244/246-item prior lane ancestry and append only deterministic essential-service-designation concerns',
  familyCellState: 'unavailable_public',
  familyCellMessage: 'unavailable, unapproved, and unpopulated',
  handoffKeys: HANDOFF_KEYS,
  prohibitedUses: PROHIBITED_USES,
  reviewerRoles: [
    { protocolId: 'cso.evidence-methods-measurement.v1', protocolVersion: '1.0.0', agentSlug: 'healthit-clinical-data-analyst', competenceRole: 'evidence_methods_measurement_biostatistics', label: 'evidence/methods' },
    { protocolId: 'cso.transaction-regulatory-governance.v1', protocolVersion: '1.0.0', agentSlug: 'quality-compliance-officer', competenceRole: 'transaction_regulatory_governance', label: 'limited regulatory/designation governance' }
  ],
  reviewHashKeys: ['methods', 'regulatory'],
  expectedReviewHashes: {
    methods: 'sha256:94ef02af7d53ead1763ba7d5a7e4a255f8eab7f2adf18293c13f5bbf0ae74c4b',
    regulatory: 'sha256:73c63182362d5f3e4284ac5fde38ed75f0a5e3ce1dd808d2cdc0403775a03a41'
  },
  expectedAssessmentHashes: {
    methods: 'sha256:b04e01ae6f6a92053bc6256c24006bc76fa5183be0da75807863680ac88d7415',
    regulatory: 'sha256:f8d95e695b8eb1ead745f25f4586a9f95703dbfab563422284ee626dd67099aa'
  },
  handoffFamilyCellCountField: 'essential_service_designation_count_unavailable_cell_count',
  handoffFamilyConflictCountField: 'essential_service_designation_count_open_conflict_count',
  handoffFamilyConflictRefsField: 'essential_service_designation_count_open_conflict_refs',
  closedOutputInventory: true
});

function validateEssentialServiceDesignationCountUpstream(manifest, objects, artifactHashes = {}, evidenceArtifacts = {}) {
  return kernel.validateUpstream(manifest, objects, artifactHashes, evidenceArtifacts);
}

function validateEssentialServiceDesignationCountReviewRequest(request, manifest, objects, artifactHashes, evidenceArtifacts) {
  return kernel.validateReviewRequest(request, manifest, objects, artifactHashes, evidenceArtifacts);
}

function validateEssentialServiceDesignationCountReviewHandoff(handoff, reviews, conflict, manifest, objects, artifactHashes, evidenceArtifacts) {
  const messages = kernel.validateReviewHandoff(handoff, reviews, conflict, manifest, objects, artifactHashes, evidenceArtifacts);
  if (handoff?.toolkit_runtime_handoff_file_hash !== TOOLKIT_RUNTIME_HANDOFF_FILE_HASH) messages.push('handoff must preserve the frozen Toolkit runtime handoff raw hash');
  const canonical = deriveEssentialServiceDesignationCountCanonical({ objects, artifactHashes });
  const priorIds = canonical.priorDiscrepancies.map(item => item.discrepancy_id);
  const currentIds = (conflict?.discrepancies || []).map(item => item.discrepancy_id);
  if (JSON.stringify(handoff?.prior_discrepancy_ids) !== JSON.stringify(priorIds)) messages.push('handoff must preserve all 41 prior discrepancy IDs in exact immutable order');
  if (JSON.stringify(handoff?.current_discrepancy_ids) !== JSON.stringify(currentIds)) messages.push('handoff must append only the exact current essential-service-designation discrepancy IDs');
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
  if (objects?.toolkit_handoff?.downstream_bead !== 'beads-2if') messages.push('Toolkit handoff must route to beads-2if');
  const gates = objects?.cumulative_packet?.comparability_gates || [];
  if (gates.length !== 10 || gates.some(gate => gate.status === 'passed')) messages.push('all ten comparability gates must remain unresolved');
  if (gates.some(gate => gate.status !== 'blocked')) messages.push('all ten comparability gates must remain blocked');
  if (gates.find(gate => gate.dimension === 'designation_taxonomy')?.status !== 'blocked') messages.push('designation taxonomy gate must remain blocked');
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
  if ((record?.prior_safety_net_discrepancies || []).length !== PRIOR_COUNTS.safety_net_discrepancies) messages.push('prior record must preserve three safety-net discrepancies');
  if ((record?.prior_safety_net_methods_preserved_concerns || []).length !== PRIOR_COUNTS.safety_net_methods_preserved_concerns) messages.push('prior record must preserve the exact 230-item safety-net methods ancestry');
  if ((record?.prior_safety_net_population_health_preserved_concerns || []).length !== PRIOR_COUNTS.safety_net_population_health_preserved_concerns) messages.push('prior record must preserve the exact 232-item safety-net population-health ancestry');
  if ((record?.current_discrepancies || []).length !== PRIOR_COUNTS.emergency_department_discrepancies) messages.push('prior record must preserve three emergency-department discrepancies');
  if ((record?.current_methods_preserved_concerns || []).length !== PRIOR_COUNTS.current_methods_preserved_concerns) messages.push('prior record must preserve the exact 244-item emergency-department methods ancestry');
  if ((record?.current_operations_preserved_concerns || []).length !== PRIOR_COUNTS.current_operations_preserved_concerns) messages.push('prior record must preserve the exact 246-item emergency-department operations ancestry');
  if ((record?.open_conflict_refs || []).length !== PRIOR_COUNTS.prior_review_open_conflicts) messages.push('prior record must preserve forty-one open conflicts');
  const discrepancies = [
    ...(record?.prior_material_discrepancies || []), ...(record?.prior_revenue_discrepancies || []),
    ...(record?.prior_annual_discrepancies || []), ...(record?.prior_physician_discrepancies || []),
    ...(record?.prior_service_line_discrepancies || []), ...(record?.prior_safety_net_discrepancies || []),
    ...(record?.current_discrepancies || [])
  ];
  if (discrepancies.length !== PRIOR_COUNTS.cumulative_discrepancies || discrepancies.some(item => item.material !== true || item.human_route_required !== true || item.deterministic_resolution !== null)) messages.push('all 41 prior review discrepancies must remain ordered, material, and unresolved');
  if ((assurance?.open_conflict_refs || []).length !== PRIOR_COUNTS.prior_review_open_conflicts) messages.push('prior assurance must preserve forty-one open conflicts');
  if (assurance?.professional_judgment_status !== 'human_required' || assurance?.human_review_route !== 'human_competence_matched_adjudication') messages.push('prior assurance must retain human-required competence-matched review');
}

function expectedDesignationConcerns(objects, request, artifactHashes) {
  const canonical = deriveEssentialServiceDesignationCountCanonical({ objects, artifactHashes });
  return request?.protocol?.protocol_id === 'cso.transaction-regulatory-governance.v1'
    ? canonical.regulatoryRequest.candidate_review.preserved_reviewer_concerns
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
  validateEssentialServiceDesignationCountReviewHandoff, validateEssentialServiceDesignationCountReviewRequest,
  validateEssentialServiceDesignationCountUpstream
};
