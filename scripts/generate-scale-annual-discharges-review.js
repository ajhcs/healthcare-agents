#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { analyzeReviewConflicts } = require('../lib/conflict-analysis');
const { findReviewProtocol, sha256 } = require('../lib/review-protocols');
const {
  ACQUISITION_RAW_HASH,
  ACQUISITION_REF,
  ACQUISITION_SEMANTIC_HASH,
  DATA_FEATURE,
  DATA_PRODUCER,
  DATA_TRACKER,
  COMMITTED_INPUT_REF,
  EVIDENCE_BUNDLE_RAW_HASH,
  EVIDENCE_BUNDLE_REF,
  EVIDENCE_BUNDLE_SEMANTIC_HASH,
  NORMALIZED_INPUT_RAW_HASH,
  PRIOR_COUNTS,
  PRODUCER_BOUND_INPUT_RAW_HASH,
  TOOLKIT_HANDOFF_FILE_HASH,
  TOOLKIT_FEATURE,
  TOOLKIT_PRODUCER,
  TOOLKIT_TRACKER,
  semanticHash,
  stablePrettyJson,
  validateAnnualDischargesReviewHandoff,
  validateAnnualDischargesReviewRequest,
  validateAnnualDischargesUpstream
} = require('../lib/scale-annual-discharges-review');
const { evaluateStrategicReview } = require('../lib/strategic-review');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'review-protocols', 'fixtures', 'scale-input-packets', 'annual-discharges');
const UPSTREAM = path.join(OUT, 'upstream');
const REVIEW_BASE = '8ab81b1718f86bba18275e558459680f8c91b7c3';
const POSTURES = ['acquire', 'merge_affiliate', 'partner', 'compete', 'build_capacity', 'defer'];
const roles = {
  prior_cumulative_packet: 'prior/cumulative-packet.json',
  cumulative_packet: 'cumulative-packet.json',
  decision_scenario: 'decision-scenario.json',
  identity_binding: 'identity-binding.json',
  no_execution_result: 'no-execution-result.json',
  process_claim: 'process-claim.json',
  prior_review_record: 'prior/cumulative-review-record.json',
  prior_assurance_case: 'prior/cumulative-module-assurance-case.json',
  toolkit_handoff: 'handoff.json'
};
const evidencePaths = {
  acquisition: 'data-mcp/acquisition.json',
  normalized_input: 'data-mcp/normalized-input.json',
  producer_bound_input: 'data-mcp/producer-bound-input.json',
  public_evidence_bundle: 'data-mcp/public-evidence-bundle.json'
};

const objects = {};
const artifactHashes = {};
const objectEntries = {};
for (const [role, relativePath] of Object.entries(roles)) {
  const raw = fs.readFileSync(path.join(UPSTREAM, relativePath));
  objects[role] = JSON.parse(raw);
  artifactHashes[role] = 'sha256:' + crypto.createHash('sha256').update(raw).digest('hex');
  objectEntries[role] = { artifact_ref: `upstream/${relativePath}`, artifact_hash: artifactHashes[role] };
  const semantic = semanticHash(objects[role]);
  if (semantic) objectEntries[role].semantic_hash = semantic;
}
const normalizedInput = JSON.parse(fs.readFileSync(path.join(UPSTREAM, evidencePaths.normalized_input), 'utf8'));
const producerBoundInput = JSON.parse(JSON.stringify(normalizedInput));
producerBoundInput.producer.commit = DATA_PRODUCER;
fs.writeFileSync(path.join(UPSTREAM, evidencePaths.producer_bound_input), stablePrettyJson(producerBoundInput));
const bundleBody = { schema_version: 'ushso.public-evidence-bundle.v1', ...producerBoundInput };
const publicEvidenceBundle = { ...bundleBody, bundle_sha256: sha256(bundleBody) };
fs.writeFileSync(path.join(UPSTREAM, evidencePaths.public_evidence_bundle), stablePrettyJson(publicEvidenceBundle));
const evidenceArtifacts = {};
for (const [role, relativePath] of Object.entries(evidencePaths)) {
  const raw = fs.readFileSync(path.join(UPSTREAM, relativePath));
  evidenceArtifacts[role] = {
    value: JSON.parse(raw),
    raw_hash: 'sha256:' + crypto.createHash('sha256').update(raw).digest('hex')
  };
}

const packet = objects.cumulative_packet;
const processClaim = objects.process_claim;
const annualCells = packet.cells.filter(cell => cell.input_family === 'annual_discharges');
const annualConflicts = annualCells.flatMap(cell => cell.conflict_refs);
const priorConflicts = objects.prior_review_record.open_conflict_refs;
const evidenceRefs = [...new Set([
  processClaim.claim_id,
  objects.decision_scenario.scenario_id,
  objects.identity_binding.binding_id,
  packet.packet_id,
  objects.no_execution_result.result_id,
  ...packet.unresolved_conflict_refs,
  ...annualCells.flatMap(cell => [...cell.receipt_refs, ...cell.observation_refs]),
  ...objects.prior_review_record.prior_concern_overturns.flatMap(item => item.evidence_refs)
])].sort();

const frozenInputs = {
  evidence_bundle_ref: EVIDENCE_BUNDLE_REF,
  evidence_bundle_hash: objects.toolkit_handoff.upstream_hashes.evidence_bundle,
  identity_binding_ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/annual-discharges/identity-binding.json`,
  identity_binding_hash: objects.identity_binding.binding_sha256,
  computations: [
    { ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/annual-discharges/cumulative-packet.json`, hash: packet.packet_sha256 },
    { ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/annual-discharges/no-execution-result.json`, hash: objects.no_execution_result.result_sha256 }
  ],
  claim_candidates: [{ claim_id: processClaim.claim_id, claim_hash: processClaim.claim_sha256, evidence_refs: evidenceRefs }]
};
const decisionScenario = {
  ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/annual-discharges/decision-scenario.json`,
  hash: objects.decision_scenario.scenario_sha256
};
const evidenceBoundary = 'Frozen temporary-only annual-discharges packet. All 54 six-system-by-nine-input cells remain preserved as 0 populated, 24 blocked_source_conflict, and 30 not_yet_researched. Six annual-discharges conflicts, six revenue conflicts, and five roster/bed conflicts make 17 cumulative open conflicts. The 26 prior material discrepancies, 24 prior reviewer concerns, ten prior overturn gates, two revenue-review discrepancies, and 56 revenue-review concerns remain unresolved. No averaging, no adjudication, human authority, calculation, sensitivity, projection, recommendation, promotion, or deployment is authorized.';

const manifestBody = {
  schema_version: 'ushso.scale-input-fitness-upstream-manifest.v1',
  active_family: 'annual_discharges',
  producer_pins: { healthcare_toolkit: TOOLKIT_PRODUCER, healthcare_data_mcp: DATA_PRODUCER },
  producer_provenance: {
    toolkit_feature: TOOLKIT_FEATURE, toolkit_tracker: TOOLKIT_TRACKER,
    data_feature: DATA_FEATURE, data_tracker: DATA_TRACKER
  },
  toolkit_handoff_file_hash: TOOLKIT_HANDOFF_FILE_HASH,
  evidence_bundle_ref: EVIDENCE_BUNDLE_REF,
  evidence_bundle_hash: objects.toolkit_handoff.upstream_hashes.evidence_bundle,
  evidence_lineage: {
    acquisition_ref: ACQUISITION_REF,
    acquisition_raw_hash: ACQUISITION_RAW_HASH,
    acquisition_semantic_hash: ACQUISITION_SEMANTIC_HASH,
    committed_input_ref: COMMITTED_INPUT_REF,
    normalized_input_artifact_ref: `upstream/${evidencePaths.normalized_input}`,
    normalized_input_raw_hash: NORMALIZED_INPUT_RAW_HASH,
    producer_bound_input_artifact_ref: `upstream/${evidencePaths.producer_bound_input}`,
    producer_bound_input_raw_hash: PRODUCER_BOUND_INPUT_RAW_HASH,
    bundle_artifact_ref: `upstream/${evidencePaths.public_evidence_bundle}`,
    bundle_raw_hash: EVIDENCE_BUNDLE_RAW_HASH,
    bundle_semantic_hash: EVIDENCE_BUNDLE_SEMANTIC_HASH
  },
  objects: objectEntries,
  review_input_hashes: [
    frozenInputs.evidence_bundle_hash,
    frozenInputs.identity_binding_hash,
    ...frozenInputs.computations.map(item => item.hash),
    processClaim.claim_sha256,
    decisionScenario.hash
  ],
  expected_counts: {
    total_cells: 54, populated_cells: 0, blocked_cells: 24, not_yet_researched_cells: 30,
    annual_discharges_blocked_cells: 6, annual_discharges_conflicts: 6, cumulative_open_conflicts: 17,
    ...PRIOR_COUNTS
  },
  evidence_identifiers: evidenceRefs
};
const upstreamManifest = { ...manifestBody, manifest_sha256: sha256(manifestBody) };

function reviewer(reviewerId, agentSlug) {
  return {
    reviewer_id: reviewerId,
    agent_slug: agentSlug,
    prompt_version: '2026-07-18',
    repo_commit: REVIEW_BASE,
    model: 'gpt-5.6-sol',
    runtime: 'codex-desktop-2026-07-18',
    independence: { prior_exposure: 'none', conflict_disclosures: [], direct_material_conflict: false, attestation: true }
  };
}

function posture(postureName, refs, rationale, limitation) {
  return { posture: postureName, effect: 'unresolved', claim_refs: [processClaim.claim_id], evidence_refs: refs, rationale, limitation: `${limitation} No posture is recommended.` };
}

function commonReview(competenceRole) {
  return {
    competence_role: competenceRole,
    exposure_status: 'independent_first',
    evidence_mutated: false,
    claim_dispositions: [{
      claim_id: processClaim.claim_id,
      evidence_assessment: 'supported_by_available_evidence',
      review_disposition: 'request_additional_evidence',
      evidence_refs: [packet.packet_id, objects.no_execution_result.result_id, ...annualConflicts, ...priorConflicts],
      limitation: evidenceBoundary,
      overturn_condition: 'Populate all six annual-discharges cells from authoritative, receipted evidence under one comparable period, organizational boundary, discharge definition, care-setting and payer denominator, rehabilitation rule, shared-CCN rule, and facility-to-system aggregation; resolve all 17 cumulative conflicts; preserve and satisfy the 26 prior material discrepancies, 24 prior reviewer concerns, ten prior overturn gates, two revenue-review discrepancies, and 56 revenue-review concerns; then obtain a new independent review without imputation, fabricated zeroes, averaging, adjudication, or human-authority claims.'
    }],
    posture_assessments: POSTURES.map(postureName => posture(
      postureName,
      [packet.packet_id, annualConflicts[POSTURES.indexOf(postureName)]],
      `The blocked ${postureName} evidence state establishes only that Scale execution is currently ineligible.`,
      'Unresolved period, organizational boundary, discharge denominator, setting, payer, rehabilitation, shared-CCN, and prior roster/revenue evidence prevents any strategic inference.'
    )),
    missing_evidence_requests: [
      { request_id: 'missing:sys-dsch-technical-definition', description: 'Receipt the official AHRQ sys_dsch technical definition, source table, period, and unit.' },
      { request_id: 'missing:annual-discharges-denominator', description: 'Approve one comparable inpatient, payer, setting, rehabilitation, and transfer denominator for all six systems.' },
      { request_id: 'missing:annual-discharges-boundary', description: 'Reconcile the AHRQ source-local highest-ownership system rows to the frozen six-system roster and current organizational boundary.' },
      { request_id: 'missing:shared-ccn-aggregation', description: 'Approve shared-CCN, facility duplication, ownership-share, and system aggregation rules without substitution.' },
      { request_id: 'missing:annual-discharges-license', description: 'Receipt the source license and governed raw HTTP retrieval before treating the six candidate values as source-backed.' }
    ],
    prohibited_claims: [
      'Do not calculate, score, rank, normalize, impute, or run Scale v1 or any sensitivity.',
      'Missing, definitionally unsupported, unreceipted, or conflicted discharge evidence is not zero and must not be treated as zero.',
      'Do not infer throughput, installed or staffed capacity, occupancy, demand, access, operational feasibility, or a recommendation from candidate discharge counts.',
      'Do not average reviewer positions, adjudicate a conflict, fabricate human authority, project, promote, or deploy.'
    ],
    preserved_reviewer_concerns: [
      ...objects.prior_review_record.prior_preserved_concerns.map(item => item.concern),
      ...objects.prior_review_record.current_preserved_concerns.map(item => item.concern),
      'All six annual-discharges cells remain blocked_source_conflict and unpopulated.',
      'Six annual-discharges conflicts remain open in addition to six revenue and five roster/bed conflicts: 17 cumulative.',
      'The 26 prior material discrepancies, 24 prior reviewer concerns, ten prior overturn gates, two revenue-review discrepancies, and 56 revenue-review concerns remain active.',
      'The official sys_dsch technical definition, governed raw HTTP receipt, and source license are not present.',
      'Candidate annual totals cannot establish utilization denominator, throughput, access, occupancy, staffed capacity, demand, or achievable capacity.',
      'No averaging, no adjudication, and no model-generated human authority are permitted.'
    ],
    overall_disposition: 'block'
  };
}

const methodsCandidate = {
  ...commonReview('evidence_methods_measurement_biostatistics'),
  criterion_results: [
    { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:1', result: 'addressed', claim_refs: [processClaim.claim_id], evidence_refs: [packet.packet_id, ...annualConflicts], rationale: 'The observation-claim-warrant chain supports only a process no-go: all six candidate sys_dsch values remain null as approved inputs and definitionally conflicted, so no comparative or numerical inference is permitted.' },
    { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:2', result: 'addressed', claim_refs: [processClaim.claim_id], evidence_refs: [packet.packet_id, ...annualCells.flatMap(cell => cell.receipt_refs)], rationale: 'The 2023 source-local rows lack a receipted sys_dsch technical definition, governed raw retrieval and license, current-roster reconciliation, setting/payer/rehabilitation denominator, and shared-CCN aggregation rule.' },
    { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:3', result: 'addressed', claim_refs: [processClaim.claim_id], evidence_refs: [packet.packet_id, ...annualConflicts], rationale: 'Exact candidate-row repetition cannot resolve construct validity, denominator, organizational-boundary, duplication, or aggregation conflicts and is not corroboration.' }
  ],
  method_challenges: [
    { challenge_id: 'method:source-withholding', description: 'Withhold each source in turn; no absent candidate may become a zero or approved value.' },
    { challenge_id: 'method:definition-negative-control', description: 'Keep sys_dsch candidate values ineligible until the exact technical definition and denominator are receipted.' },
    { challenge_id: 'method:scope-perturbation', description: 'Perturb shared CCNs, ownership shares, rehabilitation inclusion, and system boundaries; any changing value remains ineligible.' },
    { challenge_id: 'method:missingness-audit', description: 'Verify absent approved definitions, receipts, license, and aggregation rules remain conflicted, never fabricated zeroes.' }
  ]
};

const operationsCandidate = {
  ...commonReview('operations_access_capacity_workforce'),
  criterion_results: [
    { criterion_id: 'cso.operations-access-capacity.v1:criterion:1', result: 'addressed', claim_refs: [processClaim.claim_id], evidence_refs: [packet.packet_id, ...annualConflicts], rationale: 'Candidate annual discharges do not distinguish installed beds, staffed beds, achievable capacity, throughput, access friction, occupancy, case mix, transfers, or demand. No capacity inference follows.' },
    { criterion_id: 'cso.operations-access-capacity.v1:criterion:2', result: 'addressed', claim_refs: [processClaim.claim_id], evidence_refs: [...annualCells.flatMap(cell => cell.receipt_refs), ...annualConflicts], rationale: 'The packet lacks a common discharge denominator plus operating assumptions for care setting, payer, rehabilitation, shared CCNs, ownership shares, service mix, and facility-to-system aggregation.' },
    { criterion_id: 'cso.operations-access-capacity.v1:criterion:3', result: 'addressed', claim_refs: [processClaim.claim_id], evidence_refs: [objects.no_execution_result.result_id, packet.packet_id], rationale: 'No workforce, facility, scheduling, transfer, referral, occupancy, length-of-stay, or bottleneck evidence exists, so feasibility, rank, projection, and recommendation remain prohibited.' }
  ],
  method_challenges: [
    { challenge_id: 'operations:binding-bottleneck', description: 'Require independently receipted workforce, staffed-bed, scheduling, transfer, referral, and facility bottleneck evidence.' },
    { challenge_id: 'operations:peak-versus-average', description: 'Do not treat an annual total as evidence of peak, seasonal, service-line, or campus-level achievable capacity.' },
    { challenge_id: 'operations:denominator-perturbation', description: 'Test payer, inpatient setting, rehabilitation, transfer, shared-CCN, and ownership-share definitions without selecting a preferred result.' },
    { challenge_id: 'operations:roster-negative-control', description: 'Keep source-local AHRQ system rows separate from the current product roster until the organizational crosswalk is approved.' }
  ]
};

function makeRequest(label, protocolId, review, reviewerValue) {
  const protocol = findReviewProtocol(protocolId, '1.0.0');
  const request = {
    schema_version: 'ushso.review-request.v1',
    request_id: `review-request:scale-annual-discharges:${label}:2026-07-18`,
    review_tier: 'ordinary_material_claim',
    protocol: { protocol_id: protocol.protocol_id, version: protocol.version, protocol_hash: protocol.protocol_hash },
    reviewer: reviewerValue,
    frozen_inputs: frozenInputs,
    decision_scenario: decisionScenario,
    posture_taxonomy: POSTURES,
    evidence_boundary: evidenceBoundary,
    candidate_review: review
  };
  const messages = validateAnnualDischargesReviewRequest(request, upstreamManifest, objects, artifactHashes, evidenceArtifacts);
  if (messages.length) throw new Error(messages.join('; '));
  return request;
}

const methodsRequest = makeRequest('methods', 'cso.evidence-methods-measurement.v1', methodsCandidate, reviewer('scale-annual-discharges:methods:1', 'healthit-clinical-data-analyst'));
const operationsRequest = makeRequest('utilization_operations', 'cso.operations-access-capacity.v1', operationsCandidate, reviewer('scale-annual-discharges:utilization_operations:1', 'operations-hospital-administrator'));
const methodsReview = evaluateStrategicReview(methodsRequest);
const operationsReview = evaluateStrategicReview(operationsRequest);
const conflictRequest = {
  schema_version: 'ushso.ai-conflict-analysis-request.v1',
  request_id: 'conflict-request:scale-annual-discharges:2026-07-18',
  review_tier: 'ordinary_material_claim',
  reviews: [methodsReview, operationsReview]
};
const conflictAnalysis = analyzeReviewConflicts(conflictRequest);
const handoffBody = {
  schema_version: 'ushso.scale-input-fitness-review-handoff.v1',
  active_family: 'annual_discharges',
  upstream_manifest_hash: upstreamManifest.manifest_sha256,
  toolkit_producer_commit: TOOLKIT_PRODUCER,
  data_producer_commit: DATA_PRODUCER,
  toolkit_handoff_file_hash: TOOLKIT_HANDOFF_FILE_HASH,
  evidence_bundle_ref: EVIDENCE_BUNDLE_REF,
  evidence_lineage: upstreamManifest.evidence_lineage,
  review_hashes: { methods: methodsReview.output_sha256, utilization_operations: operationsReview.output_sha256 },
  first_assessment_hashes: { methods: methodsReview.first_assessment_hash, utilization_operations: operationsReview.first_assessment_hash },
  conflict_output_hash: conflictAnalysis.output_sha256,
  prior_counts: PRIOR_COUNTS,
  annual_discharges_blocked_cell_count: 6,
  annual_discharges_open_conflict_count: 6,
  cumulative_open_conflict_count: 17,
  cumulative_cell_counts: { total: 54, populated: 0, blocked_source_conflict: 24, not_yet_researched: 30 },
  final_disposition: 'block',
  route: 'human_competence_matched_adjudication',
  automatic_resolution: 'prohibited',
  positions_averaged: false,
  adjudication_performed: false,
  human_authority_conveyed: false,
  output_inventory: Object.fromEntries(['adjudications', 'component_scores', 'deployments', 'formula_executions', 'projections', 'promotion_attempts', 'recommendations', 'scale_scores', 'sensitivity_runs'].map(key => [key, 0])),
  prohibited_uses: ['calculation', 'scoring', 'ranking', 'sensitivity_analysis', 'projection', 'adjudication', 'strategic_recommendation', 'promotion', 'deployment'],
  downstream_bead: 'healthcare-toolkit-2rr9.6.3.4'
};
const handoff = { ...handoffBody, handoff_sha256: sha256(handoffBody) };
const handoffMessages = validateAnnualDischargesReviewHandoff(handoff, [methodsReview, operationsReview], conflictAnalysis, upstreamManifest, objects, artifactHashes, evidenceArtifacts);
if (handoffMessages.length) throw new Error(handoffMessages.join('; '));

const outputs = {
  'upstream-manifest.json': upstreamManifest,
  'methods-review-request.json': methodsRequest,
  'utilization_operations-review-request.json': operationsRequest,
  'methods-review.json': methodsReview,
  'utilization_operations-review.json': operationsReview,
  'conflict-analysis-request.json': conflictRequest,
  'conflict-analysis.json': conflictAnalysis,
  'handoff.json': handoff
};
for (const [name, value] of Object.entries(outputs)) fs.writeFileSync(path.join(OUT, name), JSON.stringify(value, null, 2) + '\n');
console.log(`Generated annual-discharges fitness review: ${methodsReview.output_sha256}, ${operationsReview.output_sha256}, ${conflictAnalysis.output_sha256}, ${handoff.handoff_sha256}`);
