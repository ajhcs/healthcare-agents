const { findReviewProtocol, sha256 } = require('./review-protocols');

const DATA_PRODUCER = '6099486b39e02b45e525077c695fb2c258bfcf81';
const TOOLKIT_PRODUCER = '581265a2f2c80f71832b87de787b8b93e3ac8b1c';
const PRIOR_COUNTS = Object.freeze({
  material_discrepancies: 26, reviewer_concerns: 24, open_conflicts: 5, overturn_gates: 10,
  revenue_discrepancies: 2, revenue_preserved_concerns: 56,
  annual_discrepancies: 2, annual_preserved_concerns: 172,
  prior_review_open_conflicts: 17
});
const CANONICAL_CONSTANTS = Object.freeze({
  ACQUISITION_RAW_HASH: 'sha256:e7964104e56b389a19540b541cc490656578aede63d2dcbcbb8ab73571b3192b',
  ACQUISITION_REF: `git:${DATA_PRODUCER}:contracts/v3/fixtures/scale-physician-count-acquisition.json`,
  ACQUISITION_SEMANTIC_HASH: 'sha256:3de71b8961509cae7086d812761b0cb89eda27b1b10a905f55e8ba4049448d0a',
  COMMITTED_INPUT_REF: `git:${DATA_PRODUCER}:contracts/v3/fixtures/scale-physician-count-input.json`,
  DATA_FEATURE: '20670bc9b4f25c5e152a77325f46c5a81190abfe',
  DATA_PRODUCER,
  DATA_TRACKER: 'fef62745a65b7c1ece5b5ae42fc5192ee67cbf60',
  EVIDENCE_BUNDLE_RAW_HASH: 'sha256:ca656fe66efcd0bccec925897eafeb24136b583de20bbff1410e71bbae74caae',
  EVIDENCE_BUNDLE_REF: 'ushso-rebuild://scale-inputs/physician-count/public-evidence-bundle',
  EVIDENCE_BUNDLE_SEMANTIC_HASH: 'sha256:5f36b30968fc72ec69ac59d3342210d7e346e723eb134f47304ebffde75124b3',
  NORMALIZED_INPUT_RAW_HASH: 'sha256:2c2734cd58f5b97cb6b73c326493c9794e3eb6fd3ded05d7f2ed503033dababa',
  PRIOR_COUNTS,
  PRODUCER_BOUND_INPUT_RAW_HASH: 'sha256:a939aa56b3d342dbdedd0cf6ae0986b41c66328d0045fd5e068c556f36753e59',
  TOOLKIT_FEATURE: '83d40760eb983be3125bd31308d3a13c043c6f00',
  TOOLKIT_HANDOFF_FILE_HASH: 'sha256:1cdde4532d1438feaeb32406cc43ef35e345665520caf407f551f16760e122c9',
  TOOLKIT_RUNTIME_HANDOFF_FILE_HASH: 'sha256:db519e562162107d7d38620358f0049ca96b271e12a189bf10991a9fa2a471e9',
  TOOLKIT_PRODUCER,
  TOOLKIT_TRACKER: '4f62f957c4389a80101d15902d2b72cc4e089e07'
});
const EVIDENCE_PATHS = Object.freeze({
  acquisition: 'data-mcp/acquisition.json',
  normalized_input: 'data-mcp/normalized-input.json',
  producer_bound_input: 'data-mcp/producer-bound-input.json',
  public_evidence_bundle: 'data-mcp/public-evidence-bundle.json'
});
const OBJECT_ARTIFACT_REFS = Object.freeze({
  prior_cumulative_packet: 'upstream/prior/cumulative-packet.json',
  cumulative_packet: 'upstream/cumulative-packet.json',
  decision_scenario: 'upstream/decision-scenario.json',
  identity_binding: 'upstream/identity-binding.json',
  no_execution_result: 'upstream/no-execution-result.json',
  process_claim: 'upstream/process-claim.json',
  prior_review_record: 'upstream/prior/cumulative-review-record.json',
  prior_assurance_case: 'upstream/prior/cumulative-module-assurance-case.json',
  toolkit_handoff: 'upstream/handoff.json'
});
const PHYSICIAN_COUNT_CANONICAL_CONTEXT = Object.freeze({
  constants: CANONICAL_CONSTANTS,
  evidencePaths: EVIDENCE_PATHS,
  objectArtifactRefs: OBJECT_ARTIFACT_REFS
});

function derivePhysicianCountCanonical(input) {
  const { objects, artifactHashes = {} } = input;
  const objectEntries = buildObjectEntries(objects, artifactHashes);
  const { constants, evidencePaths } = PHYSICIAN_COUNT_CANONICAL_CONTEXT;
  const {
    ACQUISITION_RAW_HASH, ACQUISITION_REF, ACQUISITION_SEMANTIC_HASH,
    COMMITTED_INPUT_REF, DATA_FEATURE, DATA_PRODUCER, DATA_TRACKER,
    EVIDENCE_BUNDLE_RAW_HASH, EVIDENCE_BUNDLE_REF, EVIDENCE_BUNDLE_SEMANTIC_HASH,
    NORMALIZED_INPUT_RAW_HASH, PRIOR_COUNTS, PRODUCER_BOUND_INPUT_RAW_HASH,
    TOOLKIT_FEATURE, TOOLKIT_HANDOFF_FILE_HASH, TOOLKIT_RUNTIME_HANDOFF_FILE_HASH,
    TOOLKIT_PRODUCER, TOOLKIT_TRACKER
  } = constants;
  const REVIEW_BASE = 'd07a0e697e9f432cdfbd1e569c7fe7e82e32dd5c';
  const POSTURES = ['acquire', 'merge_affiliate', 'partner', 'compete', 'build_capacity', 'defer'];
  const packet = objects.cumulative_packet;
  const processClaim = objects.process_claim;
  const physicianCells = packet.cells.filter(cell => cell.input_family === 'physician_count');
  const physicianConflicts = physicianCells.flatMap(cell => cell.conflict_refs);
  const priorConflicts = objects.prior_review_record.open_conflict_refs;
  const evidenceRefs = [...new Set([
    processClaim.claim_id,
    objects.decision_scenario.scenario_id,
    objects.identity_binding.binding_id,
    packet.packet_id,
    objects.no_execution_result.result_id,
    ...packet.unresolved_conflict_refs,
    ...physicianCells.flatMap(cell => [...cell.receipt_refs, ...cell.observation_refs]),
    ...objects.prior_review_record.prior_concern_overturns.flatMap(item => item.evidence_refs)
  ])].sort();

  const frozenInputs = {
    evidence_bundle_ref: EVIDENCE_BUNDLE_REF,
    evidence_bundle_hash: objects.toolkit_handoff.upstream_hashes.evidence_bundle,
    identity_binding_ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/physician-count/identity-binding.json`,
    identity_binding_hash: objects.identity_binding.binding_sha256,
    computations: [
      { ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/physician-count/cumulative-packet.json`, hash: packet.packet_sha256 },
      { ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/physician-count/no-execution-result.json`, hash: objects.no_execution_result.result_sha256 }
    ],
    claim_candidates: [{ claim_id: processClaim.claim_id, claim_hash: processClaim.claim_sha256, evidence_refs: evidenceRefs }]
  };
  const decisionScenario = {
    ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/physician-count/decision-scenario.json`,
    hash: objects.decision_scenario.scenario_sha256
  };
  const evidenceBoundary = 'Frozen temporary-only physician-count packet. All 54 six-system-by-nine-input cells remain preserved as 0 populated, 30 blocked_source_conflict, and 24 not_yet_researched. Six physician-count conflicts plus seventeen prior roster, bed, revenue, and annual-discharge conflicts make 23 cumulative open conflicts. The 26 roster/bed material discrepancies, 24 roster/bed reviewer concerns, ten evidence-specific overturn gates, two revenue-review discrepancies, 56 revenue-review concerns, two annual-review discrepancies, and 172 annual-review concerns remain unresolved. Candidate total_mds values are source-local and unapproved; they do not establish employed, currently active, deduplicated, affiliated, credentialed, specialty-scoped, or APP-inclusive physician workforce. No averaging, automatic adjudication, human authority, calculation, sensitivity, projection, recommendation, promotion, or deployment is authorized.';

  const manifestBody = {
    schema_version: 'ushso.scale-input-fitness-upstream-manifest.v1',
    active_family: 'physician_count',
    producer_pins: { healthcare_toolkit: TOOLKIT_PRODUCER, healthcare_data_mcp: DATA_PRODUCER },
    producer_provenance: {
      toolkit_feature: TOOLKIT_FEATURE, toolkit_tracker: TOOLKIT_TRACKER,
      data_feature: DATA_FEATURE, data_tracker: DATA_TRACKER
    },
    toolkit_handoff_file_hash: TOOLKIT_HANDOFF_FILE_HASH,
    toolkit_runtime_handoff_file_hash: TOOLKIT_RUNTIME_HANDOFF_FILE_HASH,
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
      total_cells: 54, populated_cells: 0, blocked_cells: 30, not_yet_researched_cells: 24,
      physician_count_blocked_cells: 6, physician_count_conflicts: 6, cumulative_open_conflicts: 23,
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
        evidence_refs: [packet.packet_id, objects.no_execution_result.result_id, ...physicianConflicts, ...priorConflicts],
        limitation: evidenceBoundary,
        overturn_condition: 'Populate all six physician-count cells from authoritative, receipted evidence under one comparable period, organizational boundary, physician roster, workforce basis, affiliation rule, credentialing rule, employment rule, active-status rule, specialty scope, deduplication method, APP inclusion rule, and facility-to-system aggregation; resolve all 23 cumulative conflicts; preserve and satisfy the 26 roster/bed material discrepancies, 24 roster/bed reviewer concerns, ten evidence-specific overturn gates, two revenue-review discrepancies, 56 revenue-review concerns, two annual-review discrepancies, and 172 annual-review concerns; then obtain a new independent review without imputation, fabricated zeroes, averaging, automatic adjudication, or human-authority claims.'
      }],
      posture_assessments: POSTURES.map(postureName => posture(
        postureName,
        [packet.packet_id, physicianConflicts[POSTURES.indexOf(postureName)]],
        `The blocked ${postureName} evidence state establishes only that Scale execution is currently ineligible.`,
        'Unresolved period, organizational boundary, physician roster, employed-versus-affiliated basis, active status, credentialing, specialty scope, deduplication, APP inclusion, aggregation, and prior evidence prevents any strategic inference.'
      )),
      missing_evidence_requests: [
        { request_id: 'missing:total-mds-technical-definition', description: 'Receipt the official AHRQ total_mds technical definition, source table, period, unit, and construction method.' },
        { request_id: 'missing:physician-workforce-basis', description: 'Approve one comparable employed, affiliated, credentialed, currently active, specialty-scoped, deduplicated, and APP-inclusion basis for all six systems.' },
        { request_id: 'missing:physician-roster-boundary', description: 'Reconcile the source-local highest-ownership system rows and their physician rosters to the frozen six-system product boundary.' },
        { request_id: 'missing:physician-affiliation-aggregation', description: 'Approve affiliation, employment, credentialing, cross-campus duplication, cross-system duplication, and facility-to-system aggregation rules without substitution.' },
        { request_id: 'missing:physician-current-vintage', description: 'Receipt a comparable current-vintage or preapproved-lag observation for every system; 2023 source-local rows cannot establish current workforce.' }
      ],
      prohibited_claims: [
        'Do not calculate, score, rank, normalize, impute, or run Scale v1 or any sensitivity.',
        'Missing, definitionally unsupported, unreceipted, or conflicted physician evidence is not zero and must not be treated as zero.',
        'Do not describe candidate total_mds values as employed, current, active, deduplicated, affiliated, credentialed, specialty-complete, APP-inclusive, or an approved Scale input.',
        'Do not infer workforce capacity, access, network adequacy, referral reach, productivity, feasibility, rank, or recommendation from candidate physician counts.',
        'Do not average reviewer positions, automatically adjudicate a conflict, fabricate human authority, project, promote, or deploy.'
      ],
      preserved_reviewer_concerns: [
        ...objects.prior_review_record.prior_preserved_concerns.map(item => item.concern),
        ...objects.prior_review_record.current_preserved_concerns.map(item => item.concern),
        'All six physician-count cells remain blocked_source_conflict and unpopulated.',
        'Six physician-count conflicts remain open in addition to seventeen prior roster, bed, revenue, and annual-discharge conflicts: 23 cumulative.',
        'The 26 roster/bed material discrepancies, 24 roster/bed reviewer concerns, ten evidence-specific overturn gates, two revenue-review discrepancies, 56 revenue-review concerns, two annual-review discrepancies, and 172 annual-review concerns remain active.',
        'The official total_mds technical definition and an approved physician roster, workforce basis, affiliation rule, credentialing rule, employment rule, active-status rule, specialty scope, deduplication method, APP inclusion rule, and current vintage are not present.',
        "System-specific roster conflicts remain explicit: ChristianaCare includes West Grove/current four-facility uncertainty; Jefferson predates the frozen 33-facility boundary and LVHN; Temple lacks Fox Chase/faculty-practice reconciliation; Penn lacks post-vintage/faculty-practice reconciliation; Cooper predates Cape Regional and leaves Children's scope unresolved; Main Line lacks rehabilitation/medical-staff reconciliation. Candidate total_mds values remain source-local and unapproved.",
        'No averaging, no automatic adjudication, and no model-generated human authority are permitted.'
      ],
      overall_disposition: 'block'
    };
  }

  const methodsCandidate = {
    ...commonReview('evidence_methods_measurement_biostatistics'),
    criterion_results: [
      { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:1', result: 'addressed', claim_refs: [processClaim.claim_id], evidence_refs: [packet.packet_id, ...physicianConflicts], rationale: 'The observation-claim-warrant chain supports only a process no-go: all six source-local total_mds candidates remain null as approved inputs and definitionally conflicted, so no comparative or numerical inference is permitted.' },
      { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:2', result: 'addressed', claim_refs: [processClaim.claim_id], evidence_refs: [packet.packet_id, ...physicianCells.flatMap(cell => cell.receipt_refs)], rationale: 'The 2023 source-local rows lack a receipted total_mds technical definition and approved current roster, employment/affiliation/credentialing basis, active-status rule, specialty scope, deduplication method, APP inclusion rule, and system aggregation.' },
      { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:3', result: 'addressed', claim_refs: [processClaim.claim_id], evidence_refs: [packet.packet_id, ...physicianConflicts], rationale: 'Exact candidate-row repetition cannot resolve construct validity, current vintage, organizational boundary, affiliation, credentialing, employment, specialty, duplication, APP inclusion, or aggregation conflicts and is not corroboration.' }
    ],
    method_challenges: [
      { challenge_id: 'method:source-withholding', description: 'Withhold each source in turn; no absent candidate may become a zero or approved value.' },
      { challenge_id: 'method:definition-negative-control', description: 'Keep total_mds candidates ineligible until the exact technical definition and construction method are receipted.' },
      { challenge_id: 'method:scope-perturbation', description: 'Perturb employment, affiliation, credentialing, active-status, specialty, deduplication, APP, and system-boundary rules; any changing value remains ineligible.' },
      { challenge_id: 'method:missingness-audit', description: 'Verify absent approved definitions, current-vintage receipts, workforce bases, and aggregation rules remain conflicted, never fabricated zeroes.' }
    ]
  };

  const workforceCandidate = {
    ...commonReview('operations_access_capacity_workforce'),
    criterion_results: [
      { criterion_id: 'cso.operations-access-capacity.v1:criterion:1', result: 'addressed', claim_refs: [processClaim.claim_id], evidence_refs: [packet.packet_id, ...physicianConflicts], rationale: 'Candidate total_mds values do not establish employed, currently active, credentialed, affiliated, deduplicated, specialty-scoped, APP-inclusive, productive, or available workforce. No capacity or access inference follows.' },
      { criterion_id: 'cso.operations-access-capacity.v1:criterion:2', result: 'addressed', claim_refs: [processClaim.claim_id], evidence_refs: [...physicianCells.flatMap(cell => cell.receipt_refs), ...physicianConflicts], rationale: 'The packet lacks a common physician roster and operating basis for employment, affiliation, credentialing, active status, specialty, FTE/headcount, cross-system duplication, APP inclusion, current vintage, and facility-to-system aggregation.' },
      { criterion_id: 'cso.operations-access-capacity.v1:criterion:3', result: 'addressed', claim_refs: [processClaim.claim_id], evidence_refs: [objects.no_execution_result.result_id, packet.packet_id], rationale: 'No scheduling, clinical FTE, panel, vacancy, productivity, referral, network-adequacy, access, or service-coverage evidence exists, so feasibility, rank, projection, and recommendation remain prohibited.' }
    ],
    method_challenges: [
      { challenge_id: 'workforce:roster-bottleneck', description: 'Require independently receipted current physician rosters, employment/affiliation status, credentialing, active status, specialties, and cross-system deduplication.' },
      { challenge_id: 'workforce:headcount-versus-capacity', description: 'Do not treat source-local headcount as clinical FTE, panel capacity, scheduling availability, productivity, network adequacy, or service access.' },
      { challenge_id: 'workforce:basis-perturbation', description: 'Test employed-only, affiliated, credentialed, active-only, specialty-scoped, deduplicated, and APP-inclusive bases without selecting a preferred result.' },
      { challenge_id: 'workforce:vintage-boundary-negative-control', description: 'Keep 2023 source-local system rows separate from current product rosters until lag, affiliation, and organizational crosswalks are approved.' }
    ]
  };

  function makeRequest(label, protocolId, review, reviewerValue) {
    const protocol = findReviewProtocol(protocolId, '1.0.0');
    const request = {
      schema_version: 'ushso.review-request.v1',
      request_id: `review-request:scale-physician-count:${label}:2026-07-18`,
      review_tier: 'ordinary_material_claim',
      protocol: { protocol_id: protocol.protocol_id, version: protocol.version, protocol_hash: protocol.protocol_hash },
      reviewer: reviewerValue,
      frozen_inputs: frozenInputs,
      decision_scenario: decisionScenario,
      posture_taxonomy: POSTURES,
      evidence_boundary: evidenceBoundary,
      candidate_review: review
    };
    return request;
  }

  const methodsRequest = makeRequest('methods', 'cso.evidence-methods-measurement.v1', methodsCandidate, reviewer('scale-physician-count:methods:1', 'healthit-clinical-data-analyst'));
  const workforceRequest = makeRequest('physician_workforce', 'cso.operations-access-capacity.v1', workforceCandidate, reviewer('scale-physician-count:physician_workforce:1', 'operations-workforce-manager'));

  return { upstreamManifest, methodsRequest, workforceRequest, physicianCells, physicianConflicts };
}

function buildObjectEntries(objects, artifactHashes) {
  const entries = {};
  for (const [role, artifactRef] of Object.entries(OBJECT_ARTIFACT_REFS)) {
    entries[role] = { artifact_ref: artifactRef, artifact_hash: artifactHashes[role] };
    const value = objects[role];
    const hashKey = Object.keys(value || {}).find(key => key.endsWith('_sha256'));
    if (hashKey) {
      const body = { ...value };
      delete body[hashKey];
      entries[role].semantic_hash = sha256(body);
    }
  }
  return entries;
}

module.exports = {
  PHYSICIAN_COUNT_CANONICAL_CONTEXT,
  derivePhysicianCountCanonical
};
