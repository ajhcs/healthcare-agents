const { findReviewProtocol, sha256 } = require('./review-protocols');
const { buildObjectEntriesForRefs } = require('./scale-input-fitness-kernel');

const DATA_PRODUCER = 'ec350c6a0b4ed62aefc9c6e5e1be0a0c0e6b5f62';
const TOOLKIT_PRODUCER = '1154c2bfc85f193b0bfc18773e12aa21ab4d2fba';
const REVIEW_BASE = 'cbf9d93a71326e400143d491a2d3adbb513e96dc';
const PRIOR_COUNTS = Object.freeze({
  material_discrepancies: 26, reviewer_concerns: 24, open_conflicts: 5, overturn_gates: 10,
  revenue_discrepancies: 2, revenue_preserved_concerns: 56,
  annual_discrepancies: 2, annual_preserved_concerns: 172,
  physician_discrepancies: 2, physician_methods_preserved_concerns: 202,
  physician_workforce_preserved_concerns: 202,
  service_line_discrepancies: 3, service_line_methods_preserved_concerns: 216,
  service_line_governance_preserved_concerns: 218,
  safety_net_discrepancies: 3, current_methods_preserved_concerns: 230,
  current_population_health_preserved_concerns: 232,
  cumulative_discrepancies: 38, prior_review_open_conflicts: 35
});
const CONSTANTS = Object.freeze({
  ACQUISITION_RAW_HASH: 'sha256:56f638d8fab0e0c769646a424f25bafb7107898f4ef7f7e8ec11e3440f3f5dd1',
  ACQUISITION_REF: `git:${DATA_PRODUCER}:contracts/v6/fixtures/scale-emergency-department-count-acquisition.json`,
  ACQUISITION_SEMANTIC_HASH: 'sha256:e84905fd10e6a547689f737c2a10fdd38b7aaceb3a157f044e6bb056bea46b6a',
  COMMITTED_INPUT_REF: `git:${DATA_PRODUCER}:contracts/v6/fixtures/scale-emergency-department-count-input.json`,
  DATA_FEATURE: '95e7f51dfe9ec8c3f7b49e5145685fdc54df049c', DATA_PRODUCER,
  DATA_TRACKER: 'd4936645e7be04c221916d33d6d805d9d509bb44',
  EVIDENCE_BUNDLE_RAW_HASH: 'sha256:e927b2d68c5140fa61883874a8c714686c6ec61605da8d58df0a054bdce7ea63',
  EVIDENCE_BUNDLE_CANONICAL_HASH: 'sha256:690ff721331b247b45d820bdd9d4e15ee1688d44ea49004b03f37b7e4c165849',
  EVIDENCE_BUNDLE_REF: 'ushso-rebuild://scale-inputs/emergency-department-count/public-evidence-bundle',
  EVIDENCE_BUNDLE_SEMANTIC_HASH: 'sha256:f0ed4ea90a03aae3ec3248041be8fd1dc102097900f9367a854ec3a18437f46e',
  NORMALIZED_INPUT_RAW_HASH: 'sha256:d1057779b813516f5e8df880c17f862ea0b32c75ef2cbea0052f9ad6f8b0a2bd',
  PRIOR_COUNTS,
  PRODUCER_BOUND_INPUT_RAW_HASH: 'sha256:1c60f5f9b1e0dda49222a8b9cc15e0f3c3a7121a201edc4f15921907319d6e9b',
  TOOLKIT_FEATURE: '9e96aa1ce3793c19b43d1e19f5791facc543d113',
  TOOLKIT_HANDOFF_FILE_HASH: 'sha256:e124dcc9ee5ce27f098318c90df61cc23c0a6a53c457462618f8ef0702d4e786',
  TOOLKIT_RUNTIME_HANDOFF_FILE_HASH: 'sha256:21ba6651abbc4b409fd614f504610f1af6dfae1cdb33b7ae66c206fd84ba06af',
  TOOLKIT_RUNTIME_HANDOFF_CANONICAL_HASH: 'sha256:245519192d0611adc8587e72dafb507c6350e51bf687584a2eb3ce9088e1af59',
  TOOLKIT_PRODUCER, TOOLKIT_TRACKER: 'ebffaffdfb4e20f565f13cbadd9b5f8927a2ca4b'
});
const EVIDENCE_PATHS = Object.freeze({ acquisition: 'data-mcp/acquisition.json', normalized_input: 'data-mcp/normalized-input.json', producer_bound_input: 'data-mcp/producer-bound-input.json', public_evidence_bundle: 'data-mcp/public-evidence-bundle.json' });
const OBJECT_ARTIFACT_REFS = Object.freeze({
  prior_cumulative_packet: 'upstream/prior/cumulative-packet.json', cumulative_packet: 'upstream/cumulative-packet.json',
  decision_scenario: 'upstream/decision-scenario.json', identity_binding: 'upstream/identity-binding.json',
  no_execution_result: 'upstream/no-execution-result.json', process_claim: 'upstream/process-claim.json',
  prior_review_record: 'upstream/prior/cumulative-review-record.json', prior_assurance_case: 'upstream/prior/cumulative-module-assurance-case.json',
  toolkit_handoff: 'upstream/handoff.json'
});
const EMERGENCY_DEPARTMENT_COUNT_CANONICAL_CONTEXT = Object.freeze({ constants: CONSTANTS, evidencePaths: EVIDENCE_PATHS, objectArtifactRefs: OBJECT_ARTIFACT_REFS });

function deriveEmergencyDepartmentCountCanonical({ objects, artifactHashes = {} }) {
  const objectEntries = buildObjectEntriesForRefs(OBJECT_ARTIFACT_REFS, objects, artifactHashes);
  const packet = objects.cumulative_packet;
  const claim = objects.process_claim;
  const cells = packet.cells.filter(cell => cell.input_family === 'emergency_department_count');
  const conflicts = cells.flatMap(cell => cell.conflict_refs);
  const priorConflicts = objects.prior_review_record.open_conflict_refs;
  const priorDiscrepancies = [
    ...objects.prior_review_record.prior_material_discrepancies,
    ...objects.prior_review_record.prior_revenue_discrepancies,
    ...objects.prior_review_record.prior_annual_discrepancies,
    ...objects.prior_review_record.prior_physician_discrepancies,
    ...objects.prior_review_record.prior_service_line_discrepancies,
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
    identity_binding_ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/emergency-department-count/identity-binding.json`,
    identity_binding_hash: objects.identity_binding.binding_sha256,
    computations: [
      { ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/emergency-department-count/cumulative-packet.json`, hash: packet.packet_sha256 },
      { ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/emergency-department-count/no-execution-result.json`, hash: objects.no_execution_result.result_sha256 }
    ],
    claim_candidates: [{ claim_id: claim.claim_id, claim_hash: claim.claim_sha256, evidence_refs: evidenceRefs }]
  };
  const decisionScenario = { ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/emergency-department-count/decision-scenario.json`, hash: objects.decision_scenario.scenario_sha256 };
  const evidenceBoundary = 'Frozen temporary-only emergency-department count packet. All 54 cells remain 0 populated, 30 blocked_source_conflict, 18 unavailable_public, and 6 not_yet_researched. Six definition, campus, boundary, and period conflicts plus 35 prior conflicts make 41 cumulative open conflicts. AHRQ 2023 supplies identity and hospital membership but no emergency-department field. CMS Hospital General Information supplies one facility-level Emergency Services flag, not a count or dedicated-department inventory. 42 CFR 489.24(b) defines a dedicated emergency department but does not enumerate departments. Hospital membership, facility rows, flag sums, campus inference, missing-as-no, and facility aggregation remain prohibited. Rights remain unknown_review_required. Nine comparability gates are blocked and designation taxonomy is not assessed. No averaging, adjudication, automatic adjudication, human authority, profile population, calculation, scoring, sensitivity, projection, recommendation, promotion, or deployment is authorized.';
  const manifestBody = {
    schema_version: 'ushso.scale-input-fitness-upstream-manifest.v1', active_family: 'emergency_department_count',
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
    expected_counts: { total_cells: 54, populated_cells: 0, blocked_cells: 30, unavailable_public_cells: 18, not_yet_researched_cells: 6, emergency_department_count_unavailable_cells: 6, emergency_department_count_conflicts: 6, cumulative_open_conflicts: 41, ...PRIOR_COUNTS },
    evidence_identifiers: evidenceRefs
  };
  const upstreamManifest = { ...manifestBody, manifest_sha256: sha256(manifestBody) };
  const reviewer = (reviewerId, agentSlug) => ({ reviewer_id: reviewerId, agent_slug: agentSlug, prompt_version: '2026-07-19', repo_commit: REVIEW_BASE, model: 'gpt-5.6-sol', runtime: 'codex-desktop-2026-07-19', independence: { prior_exposure: 'none', conflict_disclosures: [], direct_material_conflict: false, attestation: true } });
  const posture = (name, ref) => ({ posture: name, effect: 'unresolved', claim_refs: [claim.claim_id], evidence_refs: [packet.packet_id, ref], rationale: `The unavailable ${name} evidence state establishes only that Scale execution is ineligible.`, limitation: 'No comparable dedicated-department inventory, campus definition, system boundary, period, or approved count exists. No posture is recommended.' });
  function commonReview(competenceRole, priorConcerns, laneConcerns) {
    return {
      competence_role: competenceRole, exposure_status: 'independent_first', evidence_mutated: false,
      claim_dispositions: [{ claim_id: claim.claim_id, evidence_assessment: 'supported_by_available_evidence', review_disposition: 'request_additional_evidence', evidence_refs: [packet.packet_id, objects.no_execution_result.result_id, ...conflicts, ...priorConflicts], limitation: evidenceBoundary, overturn_condition: 'Receipt six source-backed counts under one approved dedicated-emergency-department definition, main-campus/off-campus rule, facility/campus-to-system crosswalk, organizational boundary, and aligned period; clear source rights; resolve all 41 conflicts and all ten gates; obtain independent methods and operations/access/capacity review plus named human competence-matched adjudication; preserve all 38 prior discrepancies and all 462 ordered prior concern entries without flag summation, facility aggregation, campus inference, missing-as-no, imputation, fabricated zeroes, averaging, automatic adjudication, or human-authority claims.' }],
      posture_assessments: postures.map((name, index) => posture(name, conflicts[index])),
      missing_evidence_requests: [
        { request_id: 'missing:approved-dedicated-department-definition', description: 'Approve one dedicated-emergency-department definition plus main-campus, off-campus, provider, facility, and department multiplicity rules.' },
        { request_id: 'missing:six-system-department-inventories', description: 'Receipt one source-backed dedicated-department inventory and count for each frozen system; facility Emergency Services flags and unavailable evidence are not counts or zeroes.' },
        { request_id: 'missing:facility-campus-system-crosswalk', description: 'Reconcile CCNs, hospitals, facilities, campuses, departments, acquired entities, and current product-system boundaries without aggregation inference.' },
        { request_id: 'missing:period-alignment', description: 'Freeze one comparable period or approved lag rule across all six product systems.' },
        { request_id: 'missing:source-rights-clearance', description: 'Resolve unknown_review_required access and redistribution rights for the exact sources.' }
      ],
      prohibited_claims: [
        'Do not calculate, score, rank, normalize, aggregate facilities or flags, infer campuses, impute, hand-count marketing pages, or run Scale v1 or any sensitivity.',
        'Unavailable, absent, definitionally incompatible, unreceipted, or conflicted emergency-department count evidence is not zero.',
        'Do not substitute AHRQ hospital membership, CMS Emergency Services flags, CCN or facility rows, flag sums, or campus inference for a dedicated-emergency-department inventory or count.',
        'Do not infer installed or staffed capacity, access, throughput, demand, quality, market position, feasibility, rank, recommendation, or profile population.',
        'Do not average positions, automatically adjudicate, fabricate zeroes or human authority, project, promote, or deploy.'
      ],
      preserved_reviewer_concerns: [...priorConcerns, ...laneConcerns], overall_disposition: 'block'
    };
  }
  const sharedConcerns = [
    'All six emergency-department-count cells remain unavailable_public, null, unapproved, source_backed false, source_backed_zero false, and imputed false.',
    'Six emergency-department definition, campus, boundary, and period conflicts remain open in addition to 35 prior conflicts: 41 cumulative.',
    'All 38 prior material discrepancies and all 462 ordered prior concern entries remain active and unresolved.',
    'AHRQ 2023 supplies identity and dated hospital membership but has no emergency-department field; schema absence is not a count or zero.',
    'CMS Hospital General Information exposes one facility-level Emergency Services yes/no flag, not the number or location of dedicated emergency departments.',
    '42 CFR 489.24(b) defines dedicated emergency departments but does not enumerate qualifying on-campus or off-campus departments for these product systems.',
    'Facility rows, CCNs, Emergency Services flag sums, campus inference, facility aggregation, missing-as-no, imputation, and fabricated zeroes are prohibited; source rights remain unknown_review_required.',
    'ChristianaCare retains West Grove/current-roster, Union source-period, and department multiplicity questions.',
    'Jefferson Health retains the frozen 33-facility, LVHN post-vintage, and campus-to-department crosswalk questions.',
    'Temple Health retains Jeanes CCN/campus multiplicity and Episcopal/Fox Chase scope questions.',
    'Penn Medicine retains multi-campus CCN multiplicity and post-vintage membership questions.',
    'Cooper retains Cape Regional post-vintage, Children’s emergency scope, and campus multiplicity questions.',
    'Main Line Health retains rehabilitation/hospital scope, facility multiplicity, and common-period questions.',
    'Nine comparability gates are blocked and designation taxonomy remains not_assessed; no averaging, automatic adjudication, or model-generated human authority is permitted.'
  ];
  const methodsCandidate = {
    ...commonReview('evidence_methods_measurement_biostatistics', objects.prior_review_record.current_methods_preserved_concerns, sharedConcerns),
    criterion_results: [
      { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:1', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [packet.packet_id, ...conflicts], rationale: 'The observation-claim-warrant chain supports only nonexecution: zero observations and six unavailable cells support no comparative count.' },
      { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:2', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [packet.packet_id, ...cells.flatMap(cell => cell.receipt_refs)], rationale: 'Dedicated-department definition, department and campus multiplicity, product-system boundary, common period, and rights are absent or incompatible.' },
      { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:3', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [packet.packet_id, ...conflicts], rationale: 'AHRQ membership, CMS facility flags, and the regulatory definition are different constructs, not independent corroboration of one department count.' }
    ],
    method_challenges: [
      { challenge_id: 'method:flag-sum-negative-control', description: 'Keep CMS Emergency Services flags facility-local and never sum them into department counts or zeroes.' },
      { challenge_id: 'method:definition-substitution', description: 'Reject hospital membership, CCNs, facility rows, and a regulatory definition as a dedicated-department inventory.' },
      { challenge_id: 'method:campus-rollup-negative-control', description: 'Perturb hospital, campus, and current-system membership without aggregating or selecting a product-system value.' },
      { challenge_id: 'method:source-withholding', description: 'Withhold each source; no unavailable value may become populated.' }
    ]
  };
  const operationsConcerns = sharedConcerns;
  const operationsCandidate = {
    ...commonReview('operations_access_capacity_workforce', objects.prior_review_record.current_population_health_preserved_concerns, operationsConcerns),
    criterion_results: [
      { criterion_id: 'cso.operations-access-capacity.v1:criterion:1', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [packet.packet_id, ...conflicts], rationale: 'Dedicated-department inventory, facility Emergency Services designation, installed capacity, staffed capacity, throughput, and access are distinct constructs.' },
      { criterion_id: 'cso.operations-access-capacity.v1:criterion:2', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [...cells.flatMap(cell => cell.receipt_refs), ...conflicts], rationale: 'No operating assumptions or bottleneck evidence resolve department multiplicity, campus scope, system boundary, or common period.' },
      { criterion_id: 'cso.operations-access-capacity.v1:criterion:3', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [objects.no_execution_result.result_id, packet.packet_id], rationale: 'No workforce, facility, scheduling, transfer, referral, or throughput evidence supports capacity or access inference from an unavailable count.' }
    ],
    method_challenges: [
      { challenge_id: 'operations:installed-staffed-negative-control', description: 'Keep department inventory, Emergency Services flags, installed capacity, staffed capacity, throughput, and realized access nonequivalent.' },
      { challenge_id: 'operations:campus-boundary', description: 'Compare CCNs, hospitals, facilities, main campuses, off-campus departments, and product systems without aggregation.' },
      { challenge_id: 'operations:peak-bottleneck-withholding', description: 'Withhold workforce, scheduling, transfer, referral, arrival, boarding, and throughput evidence; no capacity or access claim may emerge.' },
      { challenge_id: 'operations:flag-count-negative-control', description: 'Keep facility Emergency Services yes/no flags from becoming department counts or feasibility evidence.' }
    ]
  };
  function makeRequest(label, protocolId, candidate, reviewerValue) {
    const protocol = findReviewProtocol(protocolId, '1.0.0');
    return { schema_version: 'ushso.review-request.v1', request_id: `review-request:scale-emergency-department-count:${label}:2026-07-18`, review_tier: 'ordinary_material_claim', protocol: { protocol_id: protocol.protocol_id, version: protocol.version, protocol_hash: protocol.protocol_hash }, reviewer: reviewerValue, frozen_inputs: frozenInputs, decision_scenario: decisionScenario, posture_taxonomy: postures, evidence_boundary: evidenceBoundary, candidate_review: candidate };
  }
  const methodsRequest = makeRequest('methods', 'cso.evidence-methods-measurement.v1', methodsCandidate, reviewer('scale-emergency-department-count:methods:1', 'healthit-clinical-data-analyst'));
  const operationsRequest = makeRequest('operations', 'cso.operations-access-capacity.v1', operationsCandidate, reviewer('scale-emergency-department-count:operations:1', 'operations-hospital-administrator'));
  return { upstreamManifest, methodsRequest, operationsRequest, priorDiscrepancies, emergencyDepartmentCells: cells, emergencyDepartmentConflicts: conflicts };
}

module.exports = { EMERGENCY_DEPARTMENT_COUNT_CANONICAL_CONTEXT, deriveEmergencyDepartmentCountCanonical };
