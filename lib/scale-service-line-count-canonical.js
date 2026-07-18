const { findReviewProtocol, sha256 } = require('./review-protocols');
const { buildObjectEntriesForRefs } = require('./scale-input-fitness-kernel');

const DATA_PRODUCER = '599904b82e99ac389e632e2736415a04a01b633d';
const TOOLKIT_PRODUCER = 'd57b1883044475f9dac87eae1ac6806fda1d9728';
const REVIEW_BASE = '0bf8fb60c789a441363389f1cd39a0868da5eb34';
const PRIOR_COUNTS = Object.freeze({
  material_discrepancies: 26, reviewer_concerns: 24, open_conflicts: 5, overturn_gates: 10,
  revenue_discrepancies: 2, revenue_preserved_concerns: 56,
  annual_discrepancies: 2, annual_preserved_concerns: 172,
  physician_discrepancies: 2, current_methods_preserved_concerns: 202,
  current_workforce_preserved_concerns: 202, prior_review_open_conflicts: 23
});
const CONSTANTS = Object.freeze({
  ACQUISITION_RAW_HASH: 'sha256:59a1debb97e6dd3cb2cbc6ce680c996cac8dbd17050c3b55563d3c90fa1f3946',
  ACQUISITION_REF: `git:${DATA_PRODUCER}:contracts/v4/fixtures/scale-service-line-count-acquisition.json`,
  ACQUISITION_SEMANTIC_HASH: 'sha256:87b8b2ded72ad667ed51c9d99cc9df8f7e86adff4472b1fa883175a96091c5ca',
  COMMITTED_INPUT_REF: `git:${DATA_PRODUCER}:contracts/v4/fixtures/scale-service-line-count-input.json`,
  DATA_FEATURE: '4ea01109986ffab16fb5efc493bd841d62c2c3cb', DATA_PRODUCER,
  DATA_TRACKER: '9204b5d4cf4a773d3596701e7b4cec5380a1a9f8',
  EVIDENCE_BUNDLE_RAW_HASH: 'sha256:e706ec3f986eded782bca2b5e14bf8b12ab7f9b2acd5f2b5caa4a160fdc318d4',
  EVIDENCE_BUNDLE_REF: 'ushso-rebuild://scale-inputs/service-line-count/public-evidence-bundle',
  EVIDENCE_BUNDLE_SEMANTIC_HASH: 'sha256:dfda9c60da75e2cb241c050965ec2cbeff9e3ebb305543ae859f4458345c81f9',
  NORMALIZED_INPUT_RAW_HASH: 'sha256:22321f105525f32475d395739021ba6730e4b86ab044e85b24fac639e0b265f4',
  PRIOR_COUNTS,
  PRODUCER_BOUND_INPUT_RAW_HASH: 'sha256:3b00ae6473196902b28de35ff2b00669446fe2301044788d65b7d60b4c68eeb9',
  TOOLKIT_FEATURE: 'eddba3c1b9949110ace23738cb4daaa2635feb96',
  TOOLKIT_HANDOFF_FILE_HASH: 'sha256:aea012f0382a99b22fdc430e3b1111d959dd1ad23f76cd752581b6449b542584',
  TOOLKIT_RUNTIME_HANDOFF_FILE_HASH: 'sha256:805118104932fc7d9fa2541871ba9313c1075520510ed02f6736670660d10593',
  TOOLKIT_PRODUCER, TOOLKIT_TRACKER: '3d612de3c5137624e845771334807e550bbf8b83'
});
const EVIDENCE_PATHS = Object.freeze({ acquisition: 'data-mcp/acquisition.json', normalized_input: 'data-mcp/normalized-input.json', producer_bound_input: 'data-mcp/producer-bound-input.json', public_evidence_bundle: 'data-mcp/public-evidence-bundle.json' });
const OBJECT_ARTIFACT_REFS = Object.freeze({
  prior_cumulative_packet: 'upstream/prior/cumulative-packet.json', cumulative_packet: 'upstream/cumulative-packet.json',
  decision_scenario: 'upstream/decision-scenario.json', identity_binding: 'upstream/identity-binding.json',
  no_execution_result: 'upstream/no-execution-result.json', process_claim: 'upstream/process-claim.json',
  prior_review_record: 'upstream/prior/cumulative-review-record.json', prior_assurance_case: 'upstream/prior/cumulative-module-assurance-case.json',
  toolkit_handoff: 'upstream/handoff.json'
});
const SERVICE_LINE_COUNT_CANONICAL_CONTEXT = Object.freeze({ constants: CONSTANTS, evidencePaths: EVIDENCE_PATHS, objectArtifactRefs: OBJECT_ARTIFACT_REFS });

function deriveServiceLineCountCanonical({ objects, artifactHashes = {} }) {
  const objectEntries = buildObjectEntriesForRefs(OBJECT_ARTIFACT_REFS, objects, artifactHashes);
  const packet = objects.cumulative_packet;
  const claim = objects.process_claim;
  const cells = packet.cells.filter(cell => cell.input_family === 'service_line_count');
  const conflicts = cells.flatMap(cell => cell.conflict_refs);
  const priorConflicts = objects.prior_review_record.open_conflict_refs;
  const postures = ['acquire', 'merge_affiliate', 'partner', 'compete', 'build_capacity', 'defer'];
  const evidenceRefs = [...new Set([
    claim.claim_id, objects.decision_scenario.scenario_id, objects.identity_binding.binding_id,
    packet.packet_id, objects.no_execution_result.result_id, ...packet.unresolved_conflict_refs,
    ...cells.flatMap(cell => [...cell.receipt_refs, ...cell.observation_refs]),
    ...objects.prior_review_record.prior_concern_overturns.flatMap(item => item.evidence_refs)
  ])].sort();
  const frozenInputs = {
    evidence_bundle_ref: CONSTANTS.EVIDENCE_BUNDLE_REF, evidence_bundle_hash: objects.toolkit_handoff.upstream_hashes.evidence_bundle,
    identity_binding_ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/service-line-count/identity-binding.json`,
    identity_binding_hash: objects.identity_binding.binding_sha256,
    computations: [
      { ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/service-line-count/cumulative-packet.json`, hash: packet.packet_sha256 },
      { ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/service-line-count/no-execution-result.json`, hash: objects.no_execution_result.result_sha256 }
    ],
    claim_candidates: [{ claim_id: claim.claim_id, claim_hash: claim.claim_sha256, evidence_refs: evidenceRefs }]
  };
  const decisionScenario = { ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/service-line-count/decision-scenario.json`, hash: objects.decision_scenario.scenario_sha256 };
  const evidenceBoundary = 'Frozen temporary-only service-line-count packet. All 54 cells remain 0 populated, 30 blocked_source_conflict, 6 unavailable_public, and 18 not_yet_researched. Six service-line taxonomy conflicts plus 23 prior conflicts make 29 cumulative open conflicts. AHRQ provides identity but no service-line field; CMS RBCS classifies paid Medicare Part B HCPCS activity rather than offered services, and embedded CPT/HCPCS redistribution rights remain unknown_review_required. All ten comparability gates remain unresolved. The protocol registry has no service-taxonomy competence lane; the second reviewer is limited to portfolio, rights, transaction, and governance constraints and conveys no taxonomy authority. No averaging, automatic adjudication, human authority, profile population, calculation, sensitivity, projection, recommendation, promotion, or deployment is authorized.';
  const manifestBody = {
    schema_version: 'ushso.scale-input-fitness-upstream-manifest.v1', active_family: 'service_line_count',
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
    expected_counts: { total_cells: 54, populated_cells: 0, blocked_cells: 30, unavailable_public_cells: 6, not_yet_researched_cells: 18, service_line_count_unavailable_cells: 6, service_line_count_conflicts: 6, cumulative_open_conflicts: 29, ...PRIOR_COUNTS },
    evidence_identifiers: evidenceRefs
  };
  const upstreamManifest = { ...manifestBody, manifest_sha256: sha256(manifestBody) };
  const reviewer = (reviewerId, agentSlug) => ({ reviewer_id: reviewerId, agent_slug: agentSlug, prompt_version: '2026-07-18', repo_commit: REVIEW_BASE, model: 'gpt-5.6-sol', runtime: 'codex-desktop-2026-07-18', independence: { prior_exposure: 'none', conflict_disclosures: [], direct_material_conflict: false, attestation: true } });
  const posture = (name, ref) => ({ posture: name, effect: 'unresolved', claim_refs: [claim.claim_id], evidence_refs: [packet.packet_id, ref], rationale: `The unavailable ${name} evidence state establishes only that Scale execution is ineligible.`, limitation: 'No comparable offered-service taxonomy, system count, rights clearance, or taxonomy-competent human review exists. No posture is recommended.' });
  function commonReview(competenceRole, priorConcerns, laneConcerns) {
    return {
      competence_role: competenceRole, exposure_status: 'independent_first', evidence_mutated: false,
      claim_dispositions: [{ claim_id: claim.claim_id, evidence_assessment: 'supported_by_available_evidence', review_disposition: 'request_additional_evidence', evidence_refs: [packet.packet_id, objects.no_execution_result.result_id, ...conflicts, ...priorConflicts], limitation: evidenceBoundary, overturn_condition: 'Receipt six source-backed counts under one approved offered-service taxonomy and frozen organizational boundary; clear source and embedded-code rights; resolve all 29 conflicts and all ten gates; obtain independent methods and actual service-taxonomy competence review; preserve every prior concern without imputation, fabricated zeroes, averaging, automatic adjudication, or human-authority claims.' }],
      posture_assessments: postures.map((name, index) => posture(name, conflicts[index])),
      missing_evidence_requests: [
        { request_id: 'missing:offered-service-taxonomy', description: 'Approve and receipt one field-neutral offered-service taxonomy, counting unit, inclusion/exclusion rules, and cross-system mapping.' },
        { request_id: 'missing:six-system-service-line-counts', description: 'Receipt one source-backed system-level count for each frozen product system; source absence is not zero.' },
        { request_id: 'missing:service-boundary-crosswalk', description: 'Reconcile facilities, faculty practices, rehabilitation, children’s, acquired entities, and post-vintage changes to the frozen boundary.' },
        { request_id: 'missing:taxonomy-competence-review', description: 'Route the completed packet to qualified service-taxonomy competence because the current protocol registry contains no such lane.' },
        { request_id: 'missing:source-rights-clearance', description: 'Resolve unknown_review_required access and redistribution rights, including embedded CPT/HCPCS content.' }
      ],
      prohibited_claims: [
        'Do not calculate, score, rank, normalize, impute, hand-count marketing pages, or run Scale v1 or any sensitivity.',
        'Unavailable, absent, definitionally incompatible, unreceipted, or conflicted service-line evidence is not zero.',
        'Do not treat AHRQ identity rows or CMS RBCS paid-claims categories as offered service-line counts.',
        'Do not infer portfolio breadth, capacity, access, market position, feasibility, rank, recommendation, or profile population.',
        'Do not average positions, automatically adjudicate, fabricate taxonomy or human authority, project, promote, or deploy.'
      ],
      preserved_reviewer_concerns: [...priorConcerns, ...laneConcerns], overall_disposition: 'block'
    };
  }
  const sharedConcerns = [
    'All six service-line-count cells remain unavailable_public, null, unapproved, source_backed false, source_backed_zero false, and imputed false.',
    'Six service-line taxonomy conflicts remain open in addition to 23 prior conflicts: 29 cumulative.',
    'The 26 roster/bed material discrepancies, 24 original reviewer concerns, ten overturn gates, two revenue discrepancies, 56 revenue concerns, two annual discrepancies, 172 annual concerns, two physician discrepancies, and both 202-concern physician review lanes remain active.',
    'AHRQ 2023 supplies identity but no service-line-count field; schema absence is not evidence of a zero.',
    'CMS RBCS 2025 classifies paid Medicare Part B HCPCS activity and is not an offered-service taxonomy or system service-line count.',
    'Both evaluated sources remain unknown_review_required for access or redistribution; CMS embedded CPT/HCPCS rights are unresolved.',
    'No marketing-page hand count, claims aggregation, facility inference, imputation, or fabricated zero is permitted.',
    'ChristianaCare retains the current-four-facility and West Grove boundary question.',
    'Jefferson Health retains the frozen 33-facility and LVHN boundary question.',
    'Temple Health retains faculty-practice and Fox Chase scope questions.',
    'Penn Medicine retains faculty-practice and post-vintage scope questions.',
    'Cooper retains Cape Regional and Children’s scope questions.',
    'Main Line Health retains rehabilitation and service-boundary questions.',
    'All ten comparability gates remain unresolved; no averaging, automatic adjudication, or model-generated human authority is permitted.'
  ];
  const methodsCandidate = {
    ...commonReview('evidence_methods_measurement_biostatistics', objects.prior_review_record.current_methods_preserved_concerns, sharedConcerns),
    criterion_results: [
      { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:1', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [packet.packet_id, ...conflicts], rationale: 'The observation-claim-warrant chain supports only the no-go: zero observations and six unavailable cells cannot support a comparative count.' },
      { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:2', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [packet.packet_id, ...cells.flatMap(cell => cell.receipt_refs)], rationale: 'Definition, counting unit, period, organizational boundary, taxonomy, and rights remain incompatible or absent.' },
      { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:3', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [packet.packet_id, ...conflicts], rationale: 'Repeated identity receipts and one shared claims taxonomy are not independent corroboration of offered services.' }
    ],
    method_challenges: [
      { challenge_id: 'method:schema-absence-negative-control', description: 'Keep AHRQ field absence unavailable, never zero.' },
      { challenge_id: 'method:claims-taxonomy-negative-control', description: 'Reject paid-claims category counts as offered-service counts.' },
      { challenge_id: 'method:boundary-perturbation', description: 'Perturb frozen system boundaries without selecting a preferred count.' },
      { challenge_id: 'method:source-withholding', description: 'Withhold each source; no missing value may become populated.' }
    ]
  };
  const governanceConcerns = [...sharedConcerns,
    'The governance lane is limited to service-line portfolio, source-rights, transaction, and governance constraints; it is not service-taxonomy competence and conveys no taxonomy authority.',
    'The protocol registry lacks a service-taxonomy competence lane, so taxonomy judgment remains explicitly human-routed and blocked.'
  ];
  const governanceCandidate = {
    ...commonReview('transaction_regulatory_governance', objects.prior_review_record.current_workforce_preserved_concerns, governanceConcerns),
    criterion_results: [
      { criterion_id: 'cso.transaction-regulatory-governance.v1:criterion:1', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [packet.packet_id, ...conflicts], rationale: 'Affiliation, acquired-entity, faculty-practice, rehabilitation, children’s, and service-boundary questions prevent portfolio-scope inference.' },
      { criterion_id: 'cso.transaction-regulatory-governance.v1:criterion:2', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [...cells.flatMap(cell => cell.receipt_refs), ...conflicts], rationale: 'Source access, CMS embedded-code redistribution rights, taxonomy authority, and current boundary approvals remain unresolved.' },
      { criterion_id: 'cso.transaction-regulatory-governance.v1:criterion:3', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [objects.no_execution_result.result_id, packet.packet_id], rationale: 'Public identity and claims-taxonomy evidence is diligence input only, not a legal, governance, or offered-service conclusion.' }
    ],
    method_challenges: [
      { challenge_id: 'governance:rights-clearance', description: 'Require clearance for access, reuse, and embedded CPT/HCPCS redistribution.' },
      { challenge_id: 'governance:entity-boundary', description: 'Reconcile each acquired, affiliated, faculty-practice, rehabilitation, and children’s entity.' },
      { challenge_id: 'governance:authority-negative-control', description: 'Do not infer taxonomy authority from this limited governance review.' },
      { challenge_id: 'governance:registry-gap', description: 'Keep the packet blocked until qualified service-taxonomy review is available.' }
    ]
  };
  function makeRequest(label, protocolId, candidate, reviewerValue) {
    const protocol = findReviewProtocol(protocolId, '1.0.0');
    return { schema_version: 'ushso.review-request.v1', request_id: `review-request:scale-service-line-count:${label}:2026-07-18`, review_tier: 'ordinary_material_claim', protocol: { protocol_id: protocol.protocol_id, version: protocol.version, protocol_hash: protocol.protocol_hash }, reviewer: reviewerValue, frozen_inputs: frozenInputs, decision_scenario: decisionScenario, posture_taxonomy: postures, evidence_boundary: evidenceBoundary, candidate_review: candidate };
  }
  const methodsRequest = makeRequest('methods', 'cso.evidence-methods-measurement.v1', methodsCandidate, reviewer('scale-service-line-count:methods:1', 'healthit-clinical-data-analyst'));
  const governanceRequest = makeRequest('service_portfolio_governance', 'cso.transaction-regulatory-governance.v1', governanceCandidate, reviewer('scale-service-line-count:service_portfolio_governance:1', 'strategy-healthcare-consultant'));
  return { upstreamManifest, methodsRequest, governanceRequest, serviceLineCells: cells, serviceLineConflicts: conflicts };
}

module.exports = { SERVICE_LINE_COUNT_CANONICAL_CONTEXT, deriveServiceLineCountCanonical };
