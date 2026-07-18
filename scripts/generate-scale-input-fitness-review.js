#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { analyzeReviewConflicts } = require('../lib/conflict-analysis');
const { findReviewProtocol, sha256 } = require('../lib/review-protocols');
const {
  DATA_PRODUCER,
  COMMITTED_INPUT_REF,
  EVIDENCE_BUNDLE_RAW_HASH,
  EVIDENCE_BUNDLE_REF,
  EVIDENCE_BUNDLE_SEMANTIC_HASH,
  NORMALIZED_INPUT_RAW_HASH,
  PRIOR_COUNTS,
  PRODUCER_BOUND_INPUT_RAW_HASH,
  TOOLKIT_HANDOFF_FILE_HASH,
  TOOLKIT_PRODUCER,
  semanticHash,
  stablePrettyJson,
  validateScalePacketReviewHandoff,
  validateScalePacketReviewRequest,
  validateScalePacketUpstream
} = require('../lib/scale-input-fitness-review');
const { evaluateStrategicReview } = require('../lib/strategic-review');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'review-protocols', 'fixtures', 'scale-input-packets', 'operating-revenue');
const UPSTREAM = path.join(OUT, 'upstream');
const REVIEW_BASE = 'e0c972f16e438c8a3b93de777aaeb3e4ec15bd67';
const POSTURES = ['acquire', 'merge_affiliate', 'partner', 'compete', 'build_capacity', 'defer'];
const roles = {
  baseline_packet: 'baseline-packet.json',
  cumulative_packet: 'cumulative-packet.json',
  decision_scenario: 'decision-scenario.json',
  identity_binding: 'identity-binding.json',
  no_execution_result: 'no-execution-result.json',
  process_claim: 'process-claim.json',
  prior_review_record: 'prior/claim-review-record.json',
  prior_assurance_case: 'prior/module-assurance-case.json',
  toolkit_handoff: 'handoff.json'
};
const evidencePaths = {
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
const revenueCells = packet.cells.filter(cell => cell.input_family === 'operating_revenue_usd');
const revenueConflicts = revenueCells.flatMap(cell => cell.conflict_refs);
const priorConflicts = objects.prior_review_record.open_conflict_refs;
const evidenceRefs = [...new Set([
  processClaim.claim_id,
  objects.decision_scenario.scenario_id,
  objects.identity_binding.binding_id,
  packet.packet_id,
  objects.no_execution_result.result_id,
  ...packet.unresolved_conflict_refs,
  ...revenueCells.flatMap(cell => [...cell.receipt_refs, ...cell.observation_refs]),
  ...objects.prior_review_record.concern_overturns.flatMap(item => item.evidence_refs)
])].sort();

const frozenInputs = {
  evidence_bundle_ref: EVIDENCE_BUNDLE_REF,
  evidence_bundle_hash: objects.toolkit_handoff.upstream_hashes.evidence_bundle,
  identity_binding_ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/operating-revenue/identity-binding.json`,
  identity_binding_hash: objects.identity_binding.binding_sha256,
  computations: [
    { ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/operating-revenue/cumulative-packet.json`, hash: packet.packet_sha256 },
    { ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/operating-revenue/no-execution-result.json`, hash: objects.no_execution_result.result_sha256 }
  ],
  claim_candidates: [{ claim_id: processClaim.claim_id, claim_hash: processClaim.claim_sha256, evidence_refs: evidenceRefs }]
};
const decisionScenario = {
  ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/operating-revenue/decision-scenario.json`,
  hash: objects.decision_scenario.scenario_sha256
};
const evidenceBoundary = 'Frozen temporary-only operating-revenue packet. All 54 six-system-by-nine-input cells remain preserved as 0 populated, 18 blocked_source_conflict, and 36 not_yet_researched. Six operating-revenue conflicts and five prior roster/bed conflicts remain open. The 26 prior material discrepancies, 24 prior reviewer concerns, and ten prior overturn gates remain unresolved. No averaging, adjudication, human authority, calculation, sensitivity, projection, recommendation, promotion, or deployment is authorized.';

const manifestBody = {
  schema_version: 'ushso.scale-input-fitness-upstream-manifest.v1',
  active_family: 'operating_revenue_usd',
  producer_pins: { healthcare_toolkit: TOOLKIT_PRODUCER, healthcare_data_mcp: DATA_PRODUCER },
  toolkit_handoff_file_hash: TOOLKIT_HANDOFF_FILE_HASH,
  evidence_bundle_ref: EVIDENCE_BUNDLE_REF,
  evidence_bundle_hash: objects.toolkit_handoff.upstream_hashes.evidence_bundle,
  evidence_lineage: {
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
    total_cells: 54, populated_cells: 0, blocked_cells: 18, not_yet_researched_cells: 36,
    operating_revenue_blocked_cells: 6, operating_revenue_conflicts: 6, cumulative_open_conflicts: 11,
    ...PRIOR_COUNTS
  },
  evidence_identifiers: evidenceRefs
};
const upstreamManifest = { ...manifestBody, manifest_sha256: sha256(manifestBody) };

function reviewer(reviewerId, agentSlug) {
  return {
    reviewer_id: reviewerId,
    agent_slug: agentSlug,
    prompt_version: '2026-07-17',
    repo_commit: REVIEW_BASE,
    model: 'gpt-5.6-sol',
    runtime: 'codex-desktop-2026-07-17',
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
      evidence_refs: [packet.packet_id, objects.no_execution_result.result_id, ...revenueConflicts, ...priorConflicts],
      limitation: evidenceBoundary,
      overturn_condition: 'Populate all six operating-revenue cells from audited or equivalently authoritative evidence under one comparable fiscal period, consolidation boundary, revenue definition, and one-time-item treatment; resolve the six revenue conflicts and all five prior roster/bed conflicts; preserve and satisfy the 26 prior material discrepancies, 24 prior reviewer concerns, and ten prior overturn gates; then obtain a new independent review without imputation, fabricated zeroes, averaging, adjudication, or human-authority claims.'
    }],
    posture_assessments: POSTURES.map(postureName => posture(
      postureName,
      [packet.packet_id, revenueConflicts[POSTURES.indexOf(postureName)]],
      `The blocked ${postureName} evidence state establishes only that Scale execution is currently ineligible.`,
      'Unresolved fiscal-period, boundary, definition, and prior roster/bed evidence prevents any strategic inference.'
    )),
    missing_evidence_requests: [
      { request_id: 'missing:operating-revenue-common-definition', description: 'Provide a common audited operating-revenue definition and consolidation boundary for all six systems.' },
      { request_id: 'missing:operating-revenue-period-alignment', description: 'Provide one comparable fiscal period or a prespecified approved lag rule with intervening-event review.' },
      { request_id: 'missing:temple-audited-source', description: 'Replace the Temple unaudited report with audited source evidence; absence is not zero.' },
      { request_id: 'missing:cooper-retrievable-source', description: 'Resolve the Cooper HTTP 403 source failure with governed evidence; inaccessible evidence is not zero.' },
      { request_id: 'missing:one-time-and-elimination-treatment', description: 'Prespecify treatment of eliminations, nonoperating items, affiliates, and one-time items.' }
    ],
    prohibited_claims: [
      'Do not calculate, score, rank, normalize, impute, or run Scale v1 or any sensitivity.',
      'Do not treat missing, unaudited, inaccessible, or conflicted revenue as zero.',
      'Do not infer capital capacity, liquidity, valuation, strategic strength, or a recommendation from revenue.',
      'Do not average reviewer positions, adjudicate a conflict, fabricate human authority, project, promote, or deploy.'
    ],
    preserved_reviewer_concerns: [
      ...objects.prior_review_record.preserved_concerns.map(item => item.concern),
      'All six operating-revenue cells remain blocked_source_conflict and unpopulated.',
      'Six operating-revenue conflicts remain open in addition to five prior roster/bed conflicts.',
      'The 26 prior material discrepancies, 24 prior reviewer concerns, and ten prior overturn gates remain active.',
      'No averaging, no adjudication, and no model-generated human authority are permitted.'
    ],
    overall_disposition: 'block'
  };
}

const methodsCandidate = {
  ...commonReview('evidence_methods_measurement_biostatistics'),
  criterion_results: [
    { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:1', result: 'addressed', claim_refs: [processClaim.claim_id], evidence_refs: [packet.packet_id, ...revenueConflicts], rationale: 'The observation-claim-warrant chain supports only a process no-go: every revenue value is null and conflicted, so the packet supports no comparative or numerical inference.' },
    { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:2', result: 'addressed', claim_refs: [processClaim.claim_id], evidence_refs: [packet.packet_id, ...revenueCells.flatMap(cell => cell.receipt_refs)], rationale: 'FY2022, FY2024, and FY2025 periods, differing organizational bases, Temple unaudited evidence, Cooper retrieval failure, and absent approved values defeat comparability and sensitivity eligibility.' },
    { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:3', result: 'addressed', claim_refs: [processClaim.claim_id], evidence_refs: [packet.packet_id, ...revenueConflicts], rationale: 'Source repetition or candidate agreement cannot resolve consolidation, definition, period, or missingness conflicts and cannot be treated as corroboration.' }
  ],
  method_challenges: [
    { challenge_id: 'method:source-withholding', description: 'Withhold each source in turn; no absent candidate may become a zero or approved value.' },
    { challenge_id: 'method:period-negative-control', description: 'Keep FY2022, FY2024, and FY2025 values nonequivalent until an approved lag rule is satisfied.' },
    { challenge_id: 'method:scope-perturbation', description: 'Perturb affiliate and consolidation boundaries; any changing value remains ineligible.' },
    { challenge_id: 'method:missingness-audit', description: 'Verify Temple unaudited and Cooper HTTP 403 states remain missing/conflicted, never fabricated zeroes.' }
  ]
};

const financeCandidate = {
  ...commonReview('healthcare_finance_capital'),
  criterion_results: [
    { criterion_id: 'cso.healthcare-finance-capital.v1:criterion:1', result: 'addressed', claim_refs: [processClaim.claim_id], evidence_refs: [packet.packet_id, ...revenueConflicts], rationale: 'Operating revenue is historical accounting evidence, not liquidity, leverage, operating margin, free cash flow, or forward capital capacity; no Scale or strategic conclusion follows.' },
    { criterion_id: 'cso.healthcare-finance-capital.v1:criterion:2', result: 'addressed', claim_refs: [processClaim.claim_id], evidence_refs: [...revenueCells.flatMap(cell => cell.receipt_refs), ...revenueConflicts], rationale: 'Fiscal periods, consolidation scopes, audited status, affiliate bases, eliminations, and one-time-item treatment are not common. Temple is unaudited and Cooper is inaccessible by HTTP 403, neither is zero.' },
    { criterion_id: 'cso.healthcare-finance-capital.v1:criterion:3', result: 'addressed', claim_refs: [processClaim.claim_id], evidence_refs: [objects.no_execution_result.result_id, packet.packet_id], rationale: 'No debt, liquidity, capital plan, forecast, or scenario assumptions exist, so capital feasibility, valuation, investment, and strategic recommendations remain prohibited.' }
  ],
  method_challenges: [
    { challenge_id: 'finance:remove-one-time-items', description: 'Reconcile recurring operating revenue after documented eliminations and one-time items.' },
    { challenge_id: 'finance:test-obligated-group-scope', description: 'Compare obligated group, consolidated parent, health-system, university, and affiliate boundaries without substitution.' },
    { challenge_id: 'finance:stress-debt-liquidity', description: 'Require separate debt, liquidity, and forward capital evidence before any capacity inference.' },
    { challenge_id: 'finance:audit-status-negative-control', description: 'Keep unaudited Temple and inaccessible Cooper evidence nonnumeric and ineligible.' }
  ]
};

function makeRequest(label, protocolId, review, reviewerValue) {
  const protocol = findReviewProtocol(protocolId, '1.0.0');
  const request = {
    schema_version: 'ushso.review-request.v1',
    request_id: `review-request:scale-operating-revenue:${label}:2026-07-17`,
    review_tier: 'ordinary_material_claim',
    protocol: { protocol_id: protocol.protocol_id, version: protocol.version, protocol_hash: protocol.protocol_hash },
    reviewer: reviewerValue,
    frozen_inputs: frozenInputs,
    decision_scenario: decisionScenario,
    posture_taxonomy: POSTURES,
    evidence_boundary: evidenceBoundary,
    candidate_review: review
  };
  const messages = validateScalePacketReviewRequest(request, upstreamManifest, objects, artifactHashes, evidenceArtifacts);
  if (messages.length) throw new Error(messages.join('; '));
  return request;
}

const methodsRequest = makeRequest('methods', 'cso.evidence-methods-measurement.v1', methodsCandidate, reviewer('scale-operating-revenue:methods:1', 'healthit-clinical-data-analyst'));
const financeRequest = makeRequest('finance', 'cso.healthcare-finance-capital.v1', financeCandidate, reviewer('scale-operating-revenue:finance:1', 'revenue-finance-manager'));
const methodsReview = evaluateStrategicReview(methodsRequest);
const financeReview = evaluateStrategicReview(financeRequest);
const conflictRequest = {
  schema_version: 'ushso.ai-conflict-analysis-request.v1',
  request_id: 'conflict-request:scale-operating-revenue:2026-07-17',
  review_tier: 'ordinary_material_claim',
  reviews: [methodsReview, financeReview]
};
const conflictAnalysis = analyzeReviewConflicts(conflictRequest);
const handoffBody = {
  schema_version: 'ushso.scale-input-fitness-review-handoff.v1',
  active_family: 'operating_revenue_usd',
  upstream_manifest_hash: upstreamManifest.manifest_sha256,
  toolkit_producer_commit: TOOLKIT_PRODUCER,
  data_producer_commit: DATA_PRODUCER,
  toolkit_handoff_file_hash: TOOLKIT_HANDOFF_FILE_HASH,
  evidence_bundle_ref: EVIDENCE_BUNDLE_REF,
  evidence_lineage: upstreamManifest.evidence_lineage,
  review_hashes: { methods: methodsReview.output_sha256, finance: financeReview.output_sha256 },
  first_assessment_hashes: { methods: methodsReview.first_assessment_hash, finance: financeReview.first_assessment_hash },
  conflict_output_hash: conflictAnalysis.output_sha256,
  prior_counts: PRIOR_COUNTS,
  operating_revenue_blocked_cell_count: 6,
  operating_revenue_open_conflict_count: 6,
  cumulative_open_conflict_count: 11,
  cumulative_cell_counts: { total: 54, populated: 0, blocked_source_conflict: 18, not_yet_researched: 36 },
  final_disposition: 'block',
  route: 'human_competence_matched_adjudication',
  automatic_resolution: 'prohibited',
  positions_averaged: false,
  adjudication_performed: false,
  human_authority_conveyed: false,
  output_inventory: Object.fromEntries(['adjudications', 'component_scores', 'deployments', 'formula_executions', 'projections', 'promotion_attempts', 'recommendations', 'scale_scores', 'sensitivity_runs'].map(key => [key, 0])),
  prohibited_uses: ['calculation', 'scoring', 'ranking', 'sensitivity_analysis', 'projection', 'adjudication', 'strategic_recommendation', 'promotion', 'deployment'],
  downstream_bead: 'healthcare-toolkit-2rr9.6.3.2'
};
const handoff = { ...handoffBody, handoff_sha256: sha256(handoffBody) };
const handoffMessages = validateScalePacketReviewHandoff(handoff, [methodsReview, financeReview], conflictAnalysis, upstreamManifest, objects, artifactHashes, evidenceArtifacts);
if (handoffMessages.length) throw new Error(handoffMessages.join('; '));

const outputs = {
  'upstream-manifest.json': upstreamManifest,
  'methods-review-request.json': methodsRequest,
  'finance-review-request.json': financeRequest,
  'methods-review.json': methodsReview,
  'finance-review.json': financeReview,
  'conflict-analysis-request.json': conflictRequest,
  'conflict-analysis.json': conflictAnalysis,
  'handoff.json': handoff
};
for (const [name, value] of Object.entries(outputs)) fs.writeFileSync(path.join(OUT, name), JSON.stringify(value, null, 2) + '\n');
console.log(`Generated operating-revenue fitness review: ${methodsReview.output_sha256}, ${financeReview.output_sha256}, ${conflictAnalysis.output_sha256}, ${handoff.handoff_sha256}`);
