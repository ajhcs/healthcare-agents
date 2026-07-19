const { findReviewProtocol, sha256 } = require('./review-protocols');
const { buildObjectEntriesForRefs } = require('./scale-input-fitness-kernel');

const DATA_PRODUCER = 'b7ed00c7d83adbe937780a83bdecb9dca7dd3ca9';
const TOOLKIT_PRODUCER = 'b990b36b9dc837e2f5684c88955ac482a9e25b24';
const REVIEW_BASE = 'f2f410f3b5600a8b63d144bd89dd2deddb1fe67a';
const PRIOR_COUNTS = Object.freeze({
  material_discrepancies: 26, reviewer_concerns: 24, open_conflicts: 5, overturn_gates: 10,
  revenue_discrepancies: 2, revenue_preserved_concerns: 56,
  annual_discrepancies: 2, annual_preserved_concerns: 172,
  physician_discrepancies: 2, physician_methods_preserved_concerns: 202,
  physician_workforce_preserved_concerns: 202,
  service_line_discrepancies: 3, service_line_methods_preserved_concerns: 216,
  service_line_governance_preserved_concerns: 218,
  safety_net_discrepancies: 3, safety_net_methods_preserved_concerns: 230,
  safety_net_population_health_preserved_concerns: 232,
  emergency_department_discrepancies: 3, current_methods_preserved_concerns: 244,
  current_operations_preserved_concerns: 246,
  cumulative_discrepancies: 41, prior_review_open_conflicts: 41
});
const CONSTANTS = Object.freeze({
  ACQUISITION_RAW_HASH: 'sha256:fc8e8270345fbe0da0b6f7c3241474719ed83cadb447b589e20c11aad218a9d8',
  ACQUISITION_REF: `git:${DATA_PRODUCER}:contracts/v7/fixtures/scale-essential-service-designation-count-acquisition.json`,
  ACQUISITION_SEMANTIC_HASH: 'sha256:cdc5f2af11fa03a86776169183be1e8f599e0272498e8efd46f17c138c033f2c',
  COMMITTED_INPUT_REF: `git:${DATA_PRODUCER}:contracts/v7/fixtures/scale-essential-service-designation-count-input.json`,
  DATA_FEATURE: '501e43db745f436194aa0d3521ea14b035065ba1', DATA_PRODUCER,
  DATA_TRACKER: '864edd795911213715476904ad247672eb833c9c',
  EVIDENCE_BUNDLE_RAW_HASH: 'sha256:9750edce3c08658c942f4c3a142a48a7f28a6abf8b27c18acbd2eb35ef6514ed',
  EVIDENCE_BUNDLE_CANONICAL_HASH: 'sha256:f75d14a1b929a251a5836141bd597be65b7a755c1a129a9c6266ae2cb8198ce6',
  EVIDENCE_BUNDLE_REF: 'ushso-rebuild://scale-inputs/essential-service-designation-count/public-evidence-bundle',
  EVIDENCE_BUNDLE_SEMANTIC_HASH: 'sha256:f2bf1efaac0e025e343b034d1f2dbba800bf6e5c981149c27e2325239f5fe7ed',
  NORMALIZED_INPUT_RAW_HASH: 'sha256:8709679d1150511046bc62c295448a428533e1ec6be95fb79db5277889f12076',
  PRIOR_COUNTS,
  PRODUCER_BOUND_INPUT_RAW_HASH: 'sha256:6dcc0a304a8bf63a82daa6db3379c67c4817435b5e4357dd94f6914861ef08a5',
  TOOLKIT_FEATURE: '1269875a41f91fe8a4d06c7ddb16dff94b5c5e77',
  TOOLKIT_HANDOFF_FILE_HASH: 'sha256:5eaa9d61e7af36031b2fcd311d474f2b442d6fd2d3a9a2794e1f45e4e0cce1b4',
  TOOLKIT_RUNTIME_HANDOFF_FILE_HASH: 'sha256:97d1647177509586ddede6e99bead7200c593dd36682acd9d6c61864d983f334',
  TOOLKIT_RUNTIME_HANDOFF_CANONICAL_HASH: 'sha256:ae84b10862dde5aef55798fb7e2ac33f444eac7595112efcbdd4ac66c199e083',
  TOOLKIT_PRODUCER, TOOLKIT_TRACKER: 'afd26ab4ae3d60bf63702a33462b34c40415962c'
});
const EVIDENCE_PATHS = Object.freeze({ acquisition: 'data-mcp/acquisition.json', normalized_input: 'data-mcp/normalized-input.json', producer_bound_input: 'data-mcp/producer-bound-input.json', public_evidence_bundle: 'data-mcp/public-evidence-bundle.json' });
const OBJECT_ARTIFACT_REFS = Object.freeze({
  prior_cumulative_packet: 'upstream/prior/cumulative-packet.json', cumulative_packet: 'upstream/cumulative-packet.json',
  decision_scenario: 'upstream/decision-scenario.json', identity_binding: 'upstream/identity-binding.json',
  no_execution_result: 'upstream/no-execution-result.json', process_claim: 'upstream/process-claim.json',
  prior_review_record: 'upstream/prior/cumulative-review-record.json', prior_assurance_case: 'upstream/prior/cumulative-module-assurance-case.json',
  toolkit_handoff: 'upstream/handoff.json'
});
const ESSENTIAL_SERVICE_DESIGNATION_COUNT_CANONICAL_CONTEXT = Object.freeze({ constants: CONSTANTS, evidencePaths: EVIDENCE_PATHS, objectArtifactRefs: OBJECT_ARTIFACT_REFS });

function deriveEssentialServiceDesignationCountCanonical({ objects, artifactHashes = {} }) {
  const objectEntries = buildObjectEntriesForRefs(OBJECT_ARTIFACT_REFS, objects, artifactHashes);
  const packet = objects.cumulative_packet;
  const claim = objects.process_claim;
  const cells = packet.cells.filter(cell => cell.input_family === 'essential_service_designation_count');
  const conflicts = cells.flatMap(cell => cell.conflict_refs);
  const priorConflicts = objects.prior_review_record.open_conflict_refs;
  const priorDiscrepancies = [
    ...objects.prior_review_record.prior_material_discrepancies,
    ...objects.prior_review_record.prior_revenue_discrepancies,
    ...objects.prior_review_record.prior_annual_discrepancies,
    ...objects.prior_review_record.prior_physician_discrepancies,
    ...objects.prior_review_record.prior_service_line_discrepancies,
    ...objects.prior_review_record.prior_safety_net_discrepancies,
    ...objects.prior_review_record.current_discrepancies
  ];
  const postures = ['acquire', 'merge_affiliate', 'partner', 'compete', 'build_capacity', 'defer'];
  const evidenceRefs = [...new Set([
    claim.claim_id, objects.decision_scenario.scenario_id, objects.identity_binding.binding_id,
    packet.packet_id, objects.no_execution_result.result_id, ...packet.unresolved_conflict_refs,
    ...cells.flatMap(cell => [...cell.receipt_refs, ...cell.observation_refs]),
    ...objects.prior_review_record.prior_concern_overturns.flatMap(item => item.evidence_refs)
  ])].sort();
  const frozenInputs = {
    evidence_bundle_ref: CONSTANTS.EVIDENCE_BUNDLE_REF, evidence_bundle_hash: objects.toolkit_handoff.upstream_hashes.evidence_bundle,
    identity_binding_ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/essential-service-designation-count/identity-binding.json`,
    identity_binding_hash: objects.identity_binding.binding_sha256,
    computations: [
      { ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/essential-service-designation-count/cumulative-packet.json`, hash: packet.packet_sha256 },
      { ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/essential-service-designation-count/no-execution-result.json`, hash: objects.no_execution_result.result_sha256 }
    ],
    claim_candidates: [{ claim_id: claim.claim_id, claim_hash: claim.claim_sha256, evidence_refs: evidenceRefs }]
  };
  const decisionScenario = { ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/essential-service-designation-count/decision-scenario.json`, hash: objects.decision_scenario.scenario_sha256 };
  const evidenceBoundary = 'Frozen temporary-only essential-service-designation-count packet. All 54 cells remain 0 populated, 30 blocked_source_conflict, 24 unavailable_public, and 0 not_yet_researched. Six taxonomy, issuer, effective-period, combination-code, crosswalk, boundary, and rights conflicts plus 41 prior conflicts make 47 cumulative open conflicts. AHRQ 2023 supplies dated system identity but no designation field. CMS PSF providerType is a payment classification, not a product-system essential-service designation count. No approved issuer taxonomy, eligible-code rule, facility-to-system crosswalk, common effective period, combination-code rule, or deduplication rule exists. ProviderType aggregation, stale AHRQ rollup, expired or terminated inclusion, state/federal mixing, narrative substitution, missing-as-zero, and imputation remain prohibited. Rights remain unknown_review_required. All ten comparability gates are blocked. The registered transaction/regulatory/governance lane is advisory and not exact designation-taxonomy or legal authority. No averaging, adjudication, automatic adjudication, human authority, profile population, calculation, scoring, sensitivity, projection, recommendation, promotion, or deployment is authorized.';
  const manifestBody = {
    schema_version: 'ushso.scale-input-fitness-upstream-manifest.v1', active_family: 'essential_service_designation_count',
    producer_pins: { healthcare_toolkit: TOOLKIT_PRODUCER, healthcare_data_mcp: DATA_PRODUCER },
    producer_provenance: { toolkit_feature: CONSTANTS.TOOLKIT_FEATURE, toolkit_tracker: CONSTANTS.TOOLKIT_TRACKER, data_feature: CONSTANTS.DATA_FEATURE, data_tracker: CONSTANTS.DATA_TRACKER },
    toolkit_handoff_file_hash: CONSTANTS.TOOLKIT_HANDOFF_FILE_HASH, toolkit_runtime_handoff_file_hash: CONSTANTS.TOOLKIT_RUNTIME_HANDOFF_FILE_HASH,
    evidence_bundle_ref: CONSTANTS.EVIDENCE_BUNDLE_REF, evidence_bundle_hash: objects.toolkit_handoff.upstream_hashes.evidence_bundle,
    evidence_lineage: {
      acquisition_ref: CONSTANTS.ACQUISITION_REF, acquisition_raw_hash: CONSTANTS.ACQUISITION_RAW_HASH, acquisition_semantic_hash: CONSTANTS.ACQUISITION_SEMANTIC_HASH,
      committed_input_ref: CONSTANTS.COMMITTED_INPUT_REF, normalized_input_artifact_ref: `upstream/${EVIDENCE_PATHS.normalized_input}`, normalized_input_raw_hash: CONSTANTS.NORMALIZED_INPUT_RAW_HASH,
      producer_bound_input_artifact_ref: `upstream/${EVIDENCE_PATHS.producer_bound_input}`, producer_bound_input_raw_hash: CONSTANTS.PRODUCER_BOUND_INPUT_RAW_HASH,
      bundle_artifact_ref: `upstream/${EVIDENCE_PATHS.public_evidence_bundle}`, bundle_raw_hash: CONSTANTS.EVIDENCE_BUNDLE_RAW_HASH, bundle_semantic_hash: CONSTANTS.EVIDENCE_BUNDLE_SEMANTIC_HASH
    },
    objects: objectEntries,
    review_input_hashes: [frozenInputs.evidence_bundle_hash, frozenInputs.identity_binding_hash, ...frozenInputs.computations.map(item => item.hash), claim.claim_sha256, decisionScenario.hash],
    expected_counts: { total_cells: 54, populated_cells: 0, blocked_cells: 30, unavailable_public_cells: 24, not_yet_researched_cells: 0, essential_service_designation_count_unavailable_cells: 6, essential_service_designation_count_conflicts: 6, cumulative_open_conflicts: 47, ...PRIOR_COUNTS },
    evidence_identifiers: evidenceRefs
  };
  const upstreamManifest = { ...manifestBody, manifest_sha256: sha256(manifestBody) };
  const reviewer = (reviewerId, agentSlug) => ({ reviewer_id: reviewerId, agent_slug: agentSlug, prompt_version: '2026-07-19', repo_commit: REVIEW_BASE, model: 'gpt-5.6-sol', runtime: 'codex-desktop-2026-07-19', independence: { prior_exposure: 'none', conflict_disclosures: [], direct_material_conflict: false, attestation: true } });
  const posture = (name, ref) => ({ posture: name, effect: 'unresolved', claim_refs: [claim.claim_id], evidence_refs: [packet.packet_id, ref], rationale: `The unavailable ${name} evidence state establishes only that Scale execution is ineligible.`, limitation: 'No approved designation taxonomy, eligible-code rule, issuer scope, effective-period rule, facility-to-system crosswalk, combination-code rule, deduplication rule, or approved count exists. No posture is recommended.' });
  function commonReview(competenceRole, priorConcerns, laneConcerns) {
    return {
      competence_role: competenceRole, exposure_status: 'independent_first', evidence_mutated: false,
      claim_dispositions: [{ claim_id: claim.claim_id, evidence_assessment: 'supported_by_available_evidence', review_disposition: 'request_additional_evidence', evidence_refs: [packet.packet_id, objects.no_execution_result.result_id, ...conflicts, ...priorConflicts], limitation: evidenceBoundary, overturn_condition: 'Receipt six source-backed counts under one approved issuer designation taxonomy, eligible-code rule, current facility-to-system crosswalk, organizational boundary, common effective period, combination-code rule, and deduplication rule; clear source rights; resolve all 47 conflicts and all ten blocked gates; obtain independent methods review, actual designation-taxonomy competence review, and named human adjudication; preserve all 41 prior discrepancies and all 490 ordered prior concern entries without providerType aggregation, stale AHRQ rollup, expired or terminated records, state/federal mixing, narrative substitution, missing-as-zero, imputation, fabricated zeroes, averaging, automatic adjudication, or human-authority claims.' }],
      posture_assessments: postures.map((name, index) => posture(name, conflicts[index])),
      missing_evidence_requests: [
        { request_id: 'missing:approved-designation-taxonomy', description: 'Approve one issuer-specific essential-service designation taxonomy and eligible-code rule; CMS providerType is not that taxonomy.' },
        { request_id: 'missing:six-system-designation-counts', description: 'Receipt one source-backed designation inventory and count for each frozen system; providerType rows and unavailable evidence are not counts or zeroes.' },
        { request_id: 'missing:facility-system-crosswalk', description: 'Receipt a current facility-to-product-system crosswalk with one organizational boundary and explicit affiliate treatment.' },
        { request_id: 'missing:effective-period-and-code-rules', description: 'Freeze one comparable effective period plus expired/terminated, combination-code expansion, and deduplication rules.' },
        { request_id: 'missing:state-federal-reconciliation', description: 'Keep issuer and jurisdiction taxonomies separate until an approved state/federal reconciliation exists.' },
        { request_id: 'missing:designation-competence-review', description: 'Route the completed packet to qualified designation-taxonomy competence because the current protocol registry contains no exact lane.' },
        { request_id: 'missing:source-rights-clearance', description: 'Resolve unknown_review_required access and redistribution rights for the exact sources.' }
      ],
      prohibited_claims: [
        'Do not calculate, score, rank, normalize, aggregate providerType rows, expand or deduplicate combination codes, impute, hand-count narrative pages, or run Scale v1 or any sensitivity.',
        'Unavailable, absent, definitionally incompatible, unreceipted, or conflicted essential-service-designation count evidence is not zero.',
        'Do not substitute AHRQ hospital membership, CMS providerType payment classifications, state/federal narrative labels, stale rollups, or expired records for a designation inventory or count.',
        'Do not infer regulatory status, essential-service eligibility, access, capacity, quality, market position, feasibility, rank, recommendation, or profile population.',
        'Do not average positions, automatically adjudicate, fabricate zeroes or human authority, project, promote, or deploy.'
      ],
      preserved_reviewer_concerns: [...priorConcerns, ...laneConcerns], overall_disposition: 'block'
    };
  }
  const sharedConcerns = [
    'All six essential-service-designation-count cells remain unavailable_public, null, unapproved, source_backed false, source_backed_zero false, and imputed false.',
    'Six designation taxonomy, issuer, effective-period, combination-code, crosswalk, boundary, and rights conflicts remain open in addition to 41 prior conflicts: 47 cumulative.',
    'All 41 prior material discrepancies and all 490 ordered prior concern entries remain active and unresolved.',
    'AHRQ 2023 supplies dated identity and hospital linkage but has no essential-service-designation field; schema absence is not a count or zero.',
    'CMS Provider Specific File providerType is a Medicare payment classification and cannot be aggregated into a product-system designation count.',
    'No approved issuer taxonomy or eligible-code list identifies which designation records qualify for this Scale input.',
    'No approved effective-period rule determines current records or excludes expired and terminated records consistently.',
    'No approved combination-code expansion or deduplication rule prevents omission or double counting.',
    'No current receipted facility-to-system crosswalk establishes the six product-system organizational boundaries.',
    'State and federal designation taxonomies must not be mixed, and narrative service or safety-net claims must not substitute for coded designations.',
    'ProviderType aggregation, stale AHRQ rollup, expired-record inclusion, narrative substitution, missing-as-zero, imputation, and fabricated zeroes are prohibited.',
    'Source access and redistribution rights remain unknown_review_required for the frozen designation evidence packet.',
    'All ten comparability gates are blocked, including designation taxonomy; no gate has passed.',
    'The registry has no exact designation-taxonomy competence lane; the registered transaction/regulatory/governance candidate is advisory diligence only, not legal, designation-taxonomy, professional, adjudication, or release authority, so qualified human designation review remains required without averaging or automatic adjudication.'
  ];
  const methodsCandidate = {
    ...commonReview('evidence_methods_measurement_biostatistics', objects.prior_review_record.current_methods_preserved_concerns, sharedConcerns),
    criterion_results: [
      { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:1', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [packet.packet_id, ...conflicts], rationale: 'The observation-claim-warrant chain supports only nonexecution: zero observations and six unavailable cells support no comparative count.' },
      { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:2', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [packet.packet_id, ...cells.flatMap(cell => cell.receipt_refs)], rationale: 'Issuer taxonomy, eligible-code set, effective-period rule, facility crosswalk, product-system boundary, combination-code rule, deduplication rule, and rights are absent or incompatible.' },
      { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:3', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [packet.packet_id, ...conflicts], rationale: 'AHRQ identity, CMS providerType classifications, PSF guidance, and release metadata are dependent construct evidence, not independent corroboration of one designation count.' }
    ],
    method_challenges: [
      { challenge_id: 'method:provider-type-negative-control', description: 'Keep CMS providerType payment classifications from becoming eligible designations, counts, or zeroes.' },
      { challenge_id: 'method:taxonomy-substitution', description: 'Reject unapproved issuer, state, federal, narrative, and payment taxonomies as the Scale designation taxonomy.' },
      { challenge_id: 'method:crosswalk-period-perturbation', description: 'Perturb facility membership and effective dates without aggregating, expanding, deduplicating, or selecting a value.' },
      { challenge_id: 'method:source-withholding', description: 'Withhold each source; no unavailable value may become populated or inferred.' }
    ]
  };
  const regulatoryCandidate = {
    ...commonReview('transaction_regulatory_governance', objects.prior_review_record.current_operations_preserved_concerns, sharedConcerns),
    criterion_results: [
      { criterion_id: 'cso.transaction-regulatory-governance.v1:criterion:1', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [packet.packet_id, ...conflicts], rationale: 'Issuer, jurisdiction, designation taxonomy, eligible codes, effective dates, facility identity, system control, and product boundary are distinct unresolved questions.' },
      { criterion_id: 'cso.transaction-regulatory-governance.v1:criterion:2', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [...cells.flatMap(cell => cell.receipt_refs), ...conflicts], rationale: 'The current rule version, state/federal relationship, combination-code treatment, termination rule, crosswalk, and counsel questions remain unresolved.' },
      { criterion_id: 'cso.transaction-regulatory-governance.v1:criterion:3', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [objects.no_execution_result.result_id, packet.packet_id], rationale: 'Public providerType and roster evidence is diligence input only, not a designation, eligibility, legal, governance, or approval conclusion.' }
    ],
    method_challenges: [
      { challenge_id: 'regulatory:issuer-jurisdiction-separation', description: 'Keep federal, state, payment, licensure, and narrative taxonomies separate unless an approved crosswalk establishes equivalence.' },
      { challenge_id: 'regulatory:effective-record-negative-control', description: 'Withhold expired, terminated, future, and ambiguous effective records; no unavailable count may become a zero.' },
      { challenge_id: 'regulatory:combination-code-negative-control', description: 'Do not expand or deduplicate combination codes without an approved issuer rule.' },
      { challenge_id: 'regulatory:authority-boundary', description: 'Treat registered candidate routing as advisory diligence only; require qualified human designation-taxonomy and counsel review.' }
    ]
  };
  function makeRequest(label, protocolId, candidate, reviewerValue) {
    const protocol = findReviewProtocol(protocolId, '1.0.0');
    return { schema_version: 'ushso.review-request.v1', request_id: `review-request:scale-essential-service-designation-count:${label}:2026-07-19`, review_tier: 'ordinary_material_claim', protocol: { protocol_id: protocol.protocol_id, version: protocol.version, protocol_hash: protocol.protocol_hash }, reviewer: reviewerValue, frozen_inputs: frozenInputs, decision_scenario: decisionScenario, posture_taxonomy: postures, evidence_boundary: evidenceBoundary, candidate_review: candidate };
  }
  const methodsRequest = makeRequest('methods', 'cso.evidence-methods-measurement.v1', methodsCandidate, reviewer('scale-essential-service-designation-count:methods:1', 'healthit-clinical-data-analyst'));
  const regulatoryRequest = makeRequest('regulatory_designation', 'cso.transaction-regulatory-governance.v1', regulatoryCandidate, reviewer('scale-essential-service-designation-count:regulatory-designation:1', 'quality-compliance-officer'));
  return { upstreamManifest, methodsRequest, regulatoryRequest, priorDiscrepancies, essentialServiceDesignationCells: cells, essentialServiceDesignationConflicts: conflicts };
}

module.exports = { ESSENTIAL_SERVICE_DESIGNATION_COUNT_CANONICAL_CONTEXT, deriveEssentialServiceDesignationCountCanonical };
