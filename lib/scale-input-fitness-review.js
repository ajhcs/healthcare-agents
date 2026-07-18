const {
  ZERO_OUTPUT_KEYS,
  createScaleInputFitnessKernel,
  semanticHash,
  stablePrettyJson
} = require('./scale-input-fitness-kernel');

const TOOLKIT_PRODUCER = '370dd2da1cb233eea8f89cb4773ed669a8c37b58';
const DATA_PRODUCER = 'b1fdfad94e65239fa73928990c086a63423b7c94';
const TOOLKIT_HANDOFF_FILE_HASH = 'sha256:c448ed24b8737df3ec4e934d801aaae1bff40cdb3d31d142e3e354071d045a3b';
const EVIDENCE_BUNDLE_REF = 'ushso-rebuild://scale-inputs/operating-revenue/public-evidence-bundle';
const COMMITTED_INPUT_REF = `git:${DATA_PRODUCER}:contracts/v1/fixtures/scale-operating-revenue-input.json`;
const NORMALIZED_INPUT_RAW_HASH = 'sha256:04fadae952898bc6dac87d0aaf4a3b04711cc9acc387ec751612f4b937b5b89f';
const PRODUCER_BOUND_INPUT_RAW_HASH = 'sha256:78bca41b71402ec8e4c7b64b73ab1cb722b28e527039caeb515590aa7693554b';
const EVIDENCE_BUNDLE_RAW_HASH = 'sha256:a2eee1faa34275b852a5976bd321cc3cc13ae6020d1d749da229dcc2f0577543';
const EVIDENCE_BUNDLE_SEMANTIC_HASH = 'sha256:e3b908d6dbe6036b167d9d79acc0165dd796230bb4793451a463f4fdc844f726';
const PRIOR_COUNTS = Object.freeze({ discrepancies: 26, reviewer_concerns: 24, open_conflicts: 5, overturn_gates: 10 });
const OBJECT_ARTIFACT_REFS = Object.freeze({
  baseline_packet: 'upstream/baseline-packet.json',
  cumulative_packet: 'upstream/cumulative-packet.json',
  decision_scenario: 'upstream/decision-scenario.json',
  identity_binding: 'upstream/identity-binding.json',
  no_execution_result: 'upstream/no-execution-result.json',
  process_claim: 'upstream/process-claim.json',
  prior_review_record: 'upstream/prior/claim-review-record.json',
  prior_assurance_case: 'upstream/prior/module-assurance-case.json',
  toolkit_handoff: 'upstream/handoff.json'
});
const EVIDENCE_ARTIFACT_REFS = Object.freeze({
  normalized_input_artifact_ref: 'upstream/data-mcp/normalized-input.json',
  producer_bound_input_artifact_ref: 'upstream/data-mcp/producer-bound-input.json',
  bundle_artifact_ref: 'upstream/data-mcp/public-evidence-bundle.json'
});
const PROHIBITED_USES = Object.freeze([
  'calculation', 'scoring', 'ranking', 'sensitivity_analysis', 'projection',
  'adjudication', 'strategic_recommendation', 'promotion', 'deployment'
]);
const HANDOFF_KEYS = Object.freeze([
  'active_family', 'adjudication_performed', 'automatic_resolution',
  'conflict_output_hash', 'cumulative_cell_counts', 'cumulative_open_conflict_count',
  'data_producer_commit', 'downstream_bead', 'evidence_bundle_ref',
  'evidence_lineage', 'final_disposition', 'first_assessment_hashes',
  'handoff_sha256', 'human_authority_conveyed',
  'operating_revenue_blocked_cell_count', 'operating_revenue_open_conflict_count',
  'output_inventory', 'positions_averaged', 'prior_counts', 'prohibited_uses',
  'review_hashes', 'route', 'schema_version', 'toolkit_handoff_file_hash',
  'toolkit_producer_commit', 'upstream_manifest_hash'
]);
const MANIFEST_KEYS = Object.freeze([
  'active_family', 'evidence_bundle_hash', 'evidence_bundle_ref',
  'evidence_identifiers', 'evidence_lineage', 'expected_counts',
  'manifest_sha256', 'objects', 'producer_pins', 'review_input_hashes',
  'schema_version', 'toolkit_handoff_file_hash'
]);
const REQUEST_KEYS = Object.freeze([
  'candidate_review', 'decision_scenario', 'evidence_boundary', 'frozen_inputs',
  'posture_taxonomy', 'protocol', 'request_id', 'review_tier', 'reviewer',
  'schema_version'
]);

const kernel = createScaleInputFitnessKernel({
  activeFamily: 'operating_revenue_usd',
  familyLabel: 'operating-revenue',
  concernLineageLabel: 'operating-revenue slice',
  conflictRefToken: ':operating_revenue_usd:',
  toolkitProducer: TOOLKIT_PRODUCER,
  dataProducer: DATA_PRODUCER,
  toolkitHandoffFileHash: TOOLKIT_HANDOFF_FILE_HASH,
  downstreamBead: 'healthcare-toolkit-2rr9.6.3.2',
  objectArtifactRefs: OBJECT_ARTIFACT_REFS,
  handoffRoleMap: {
    prior_claim_review_record: 'prior_review_record',
    prior_module_assurance_case: 'prior_assurance_case',
    baseline_packet: 'baseline_packet', decision_scenario: 'decision_scenario',
    identity_binding: 'identity_binding', cumulative_packet: 'cumulative_packet',
    no_execution_result: 'no_execution_result', process_claim: 'process_claim'
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
    totalCells: 54, populatedCells: 0, blockedCells: 18, notResearchedCells: 36,
    familyCells: 6, familyConflicts: 6, cumulativeConflicts: 11,
    familyCellsLabel: 'six', familyConflictsLabel: 'six', cumulativeConflictsLabel: 'eleven'
  },
  priorCounts: PRIOR_COUNTS,
  expectedManifestCounts: {
    total_cells: 54, populated_cells: 0, blocked_cells: 18,
    not_yet_researched_cells: 36, operating_revenue_blocked_cells: 6,
    operating_revenue_conflicts: 6, cumulative_open_conflicts: 11,
    ...PRIOR_COUNTS
  },
  expectedEvidenceIdentifiers: expectedRevenueEvidenceIdentifiers,
  validatePrior,
  requestRequiredTerms: ['six operating-revenue', 'five prior roster/bed', '26 prior material discrepancies', '24 prior reviewer concerns', 'ten prior overturn gates'],
  boundaryRequiredTerms: ['no averaging', 'no adjudication', 'human'],
  expectedConcerns: expectedRevenueConcerns,
  concernErrorMessage: 'review must preserve all 24 prior reviewer concerns and slice concerns',
  manifestKeys: MANIFEST_KEYS,
  requestKeys: REQUEST_KEYS,
  canonicalRequestHashes: {
    'cso.evidence-methods-measurement.v1': 'sha256:e9752569161c12103c43322b2b53dfdcf7ffd6dd3065a0ce5199a0f3c9f7af8a',
    'cso.healthcare-finance-capital.v1': 'sha256:15097149a64db874f1598ded605b6a26b8d5a933ef3d755dd880983b3a73d4ac'
  },
  handoffKeys: HANDOFF_KEYS,
  prohibitedUses: PROHIBITED_USES,
  reviewerRoles: [
    { protocolId: 'cso.evidence-methods-measurement.v1', agentSlug: 'healthit-clinical-data-analyst', label: 'evidence/methods' },
    { protocolId: 'cso.healthcare-finance-capital.v1', agentSlug: 'revenue-finance-manager', label: 'healthcare-finance' }
  ],
  reviewHashKeys: ['methods', 'finance'],
  expectedReviewHashes: {
    methods: 'sha256:a1c2ffa255955228a7fb05e4f3babc13ffb7d9f4676b502fb9b07676b3454b6e',
    finance: 'sha256:3215dcd2db03df351d9275fec156a97020e1ca03086f88782bcc57fbed404540'
  },
  expectedAssessmentHashes: {
    methods: 'sha256:1eb50dc2c84efde26886ddbe55178f3d20ddd0c792a621b6bcb12939437104fb',
    finance: 'sha256:0f34a91e74e4c7eef3ecc49feffce18cce5f00b7bf5819a144affee5e8564bce'
  },
  handoffFamilyBlockedField: 'operating_revenue_blocked_cell_count',
  handoffFamilyConflictCountField: 'operating_revenue_open_conflict_count',
  closedOutputInventory: true
});

function validateScalePacketUpstream(manifest, objects, artifactHashes = {}, evidenceArtifacts = {}) {
  return kernel.validateUpstream(manifest, objects, artifactHashes, evidenceArtifacts);
}

function validateScalePacketReviewRequest(request, manifest, objects, artifactHashes, evidenceArtifacts) {
  return kernel.validateReviewRequest(request, manifest, objects, artifactHashes, evidenceArtifacts);
}

function validateScalePacketReviewHandoff(handoff, reviews, conflict, manifest, objects, artifactHashes, evidenceArtifacts) {
  return kernel.validateReviewHandoff(handoff, reviews, conflict, manifest, objects, artifactHashes, evidenceArtifacts);
}

function validatePrior(record, assurance, messages) {
  if ((record?.discrepancies || []).length !== PRIOR_COUNTS.discrepancies) messages.push('prior record must preserve 26 material discrepancies');
  if ((record?.preserved_concerns || []).length !== PRIOR_COUNTS.reviewer_concerns) messages.push('prior record must preserve 24 reviewer concerns');
  if ((record?.open_conflict_refs || []).length !== PRIOR_COUNTS.open_conflicts) messages.push('prior record must preserve five open roster/bed conflicts');
  if ((record?.concern_overturns || []).length !== PRIOR_COUNTS.overturn_gates) messages.push('prior record must preserve ten overturn gates');
  if ((record?.discrepancies || []).some(item => item.material !== true || item.human_route_required !== true || item.deterministic_resolution !== null)) messages.push('prior discrepancies must remain material and unresolved');
  if ((assurance?.open_conflict_refs || []).length !== PRIOR_COUNTS.open_conflicts) messages.push('prior assurance must preserve five open roster/bed conflicts');
  if (assurance?.professional_judgment_status !== 'human_required' || assurance?.human_review_route !== 'human_competence_matched_adjudication') messages.push('prior assurance must retain human-required competence-matched review');
}

function expectedRevenueConcerns(objects) {
  return [
    ...(objects?.prior_review_record?.preserved_concerns || []).map(item => item.concern),
    'All six operating-revenue cells remain blocked_source_conflict and unpopulated.',
    'Six operating-revenue conflicts remain open in addition to five prior roster/bed conflicts.',
    'The 26 prior material discrepancies, 24 prior reviewer concerns, and ten prior overturn gates remain active.',
    'No averaging, no adjudication, and no model-generated human authority are permitted.'
  ];
}

function expectedRevenueEvidenceIdentifiers(objects) {
  const packet = objects?.cumulative_packet || {};
  const revenueCells = (packet.cells || []).filter(cell => cell.input_family === 'operating_revenue_usd');
  return [...new Set([
    objects?.process_claim?.claim_id,
    objects?.decision_scenario?.scenario_id,
    objects?.identity_binding?.binding_id,
    packet.packet_id,
    objects?.no_execution_result?.result_id,
    ...(packet.unresolved_conflict_refs || []),
    ...revenueCells.flatMap(cell => [...(cell.receipt_refs || []), ...(cell.observation_refs || [])]),
    ...(objects?.prior_review_record?.concern_overturns || []).flatMap(item => item.evidence_refs || [])
  ].filter(Boolean))].sort();
}

module.exports = {
  DATA_PRODUCER,
  COMMITTED_INPUT_REF,
  EVIDENCE_BUNDLE_RAW_HASH,
  EVIDENCE_BUNDLE_REF,
  EVIDENCE_BUNDLE_SEMANTIC_HASH,
  NORMALIZED_INPUT_RAW_HASH,
  PRIOR_COUNTS,
  PRODUCER_BOUND_INPUT_RAW_HASH,
  PROHIBITED_USES,
  TOOLKIT_HANDOFF_FILE_HASH,
  TOOLKIT_PRODUCER,
  ZERO_OUTPUT_KEYS,
  semanticHash,
  stablePrettyJson,
  validateScalePacketReviewHandoff,
  validateScalePacketReviewRequest,
  validateScalePacketUpstream
};
