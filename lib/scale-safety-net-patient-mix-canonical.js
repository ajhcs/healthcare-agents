const { findReviewProtocol, sha256 } = require('./review-protocols');
const { buildObjectEntriesForRefs } = require('./scale-input-fitness-kernel');

const DATA_PRODUCER = '50eba1efda522e875ebfb0b3feadfd80f4073a78';
const TOOLKIT_PRODUCER = '9376d38758d2098b8c1da09aac615ea5d4affb50';
const REVIEW_BASE = '0ead3b3831027ab2e03711efae5a30ca67b620a9';
const PRIOR_COUNTS = Object.freeze({
  material_discrepancies: 26, reviewer_concerns: 24, open_conflicts: 5, overturn_gates: 10,
  revenue_discrepancies: 2, revenue_preserved_concerns: 56,
  annual_discrepancies: 2, annual_preserved_concerns: 172,
  physician_discrepancies: 2, physician_methods_preserved_concerns: 202,
  physician_workforce_preserved_concerns: 202,
  service_line_discrepancies: 3, current_methods_preserved_concerns: 216,
  current_governance_preserved_concerns: 218, cumulative_discrepancies: 35,
  prior_review_open_conflicts: 29
});
const CONSTANTS = Object.freeze({
  ACQUISITION_RAW_HASH: 'sha256:ea349d7b65bc0c44912b2dccecf87fed9cb173164a40dbfccd7b6351f1804288',
  ACQUISITION_REF: `git:${DATA_PRODUCER}:contracts/v5/fixtures/scale-safety-net-patient-mix-acquisition.json`,
  ACQUISITION_SEMANTIC_HASH: 'sha256:4d134a8e9d6ebd31b9633e45e0fd7c42647e80f1d739fc0f77e505416bc98e7d',
  COMMITTED_INPUT_REF: `git:${DATA_PRODUCER}:contracts/v5/fixtures/scale-safety-net-patient-mix-input.json`,
  DATA_FEATURE: '5a248a6d3eb452c482c0a60d8b9168d79ae9be26', DATA_PRODUCER,
  DATA_TRACKER: '83ca5ddf9a2fdf7eb8afebf68955600b9270a52e',
  EVIDENCE_BUNDLE_RAW_HASH: 'sha256:ab7b0cfa21f2c6f4eb872b3e7dfbdd55d047a286eccab6b2dd1c71d0780763c8',
  EVIDENCE_BUNDLE_REF: 'ushso-rebuild://scale-inputs/safety-net-patient-mix/public-evidence-bundle',
  EVIDENCE_BUNDLE_SEMANTIC_HASH: 'sha256:f389828b1c901493d91aab446d23c8a01993d1169166a9863d5ec1f8a83f6cb9',
  NORMALIZED_INPUT_RAW_HASH: 'sha256:fd10799454ff317ff8496888749a234a7934326016f3ddad814e60e4055fe537',
  PRIOR_COUNTS,
  PRODUCER_BOUND_INPUT_RAW_HASH: 'sha256:94951dfb220a1e7e22abc7726f62ded058047933781afcc686207dffe4cd8ca4',
  TOOLKIT_FEATURE: '00bfdac1a7d3fc9251bcff1cf9ac085f48bfcbfb',
  TOOLKIT_HANDOFF_FILE_HASH: 'sha256:a8707ec4b2eb9e56d164e1b20a37284ed721c80903550c17aaa7250a78fcdf58',
  TOOLKIT_RUNTIME_HANDOFF_FILE_HASH: 'sha256:d2a3cc3bf668d176c00795cd587d4b51ca485b3e81e93a14b2ce732b0c5e8327',
  TOOLKIT_PRODUCER, TOOLKIT_TRACKER: 'b3113f4867fb0eda84280b2245607e24a3959226'
});
const EVIDENCE_PATHS = Object.freeze({ acquisition: 'data-mcp/acquisition.json', normalized_input: 'data-mcp/normalized-input.json', producer_bound_input: 'data-mcp/producer-bound-input.json', public_evidence_bundle: 'data-mcp/public-evidence-bundle.json' });
const OBJECT_ARTIFACT_REFS = Object.freeze({
  prior_cumulative_packet: 'upstream/prior/cumulative-packet.json', cumulative_packet: 'upstream/cumulative-packet.json',
  decision_scenario: 'upstream/decision-scenario.json', identity_binding: 'upstream/identity-binding.json',
  no_execution_result: 'upstream/no-execution-result.json', process_claim: 'upstream/process-claim.json',
  prior_review_record: 'upstream/prior/cumulative-review-record.json', prior_assurance_case: 'upstream/prior/cumulative-module-assurance-case.json',
  toolkit_handoff: 'upstream/handoff.json'
});
const SAFETY_NET_PATIENT_MIX_CANONICAL_CONTEXT = Object.freeze({ constants: CONSTANTS, evidencePaths: EVIDENCE_PATHS, objectArtifactRefs: OBJECT_ARTIFACT_REFS });

function deriveSafetyNetPatientMixCanonical({ objects, artifactHashes = {} }) {
  const objectEntries = buildObjectEntriesForRefs(OBJECT_ARTIFACT_REFS, objects, artifactHashes);
  const packet = objects.cumulative_packet;
  const claim = objects.process_claim;
  const cells = packet.cells.filter(cell => cell.input_family === 'safety_net_patient_mix_pct');
  const conflicts = cells.flatMap(cell => cell.conflict_refs);
  const priorConflicts = objects.prior_review_record.open_conflict_refs;
  const priorDiscrepancies = [
    ...objects.prior_review_record.prior_material_discrepancies,
    ...objects.prior_review_record.prior_revenue_discrepancies,
    ...objects.prior_review_record.prior_annual_discrepancies,
    ...objects.prior_review_record.prior_physician_discrepancies,
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
    identity_binding_ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/safety-net-patient-mix/identity-binding.json`,
    identity_binding_hash: objects.identity_binding.binding_sha256,
    computations: [
      { ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/safety-net-patient-mix/cumulative-packet.json`, hash: packet.packet_sha256 },
      { ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/safety-net-patient-mix/no-execution-result.json`, hash: objects.no_execution_result.result_sha256 }
    ],
    claim_candidates: [{ claim_id: claim.claim_id, claim_hash: claim.claim_sha256, evidence_refs: evidenceRefs }]
  };
  const decisionScenario = { ref: `git:${TOOLKIT_PRODUCER}:contracts/reusable-run/v3/fixtures/safety-net-patient-mix/decision-scenario.json`, hash: objects.decision_scenario.scenario_sha256 };
  const evidenceBoundary = 'Frozen temporary-only safety-net patient-mix packet. All 54 cells remain 0 populated, 30 blocked_source_conflict, 12 unavailable_public, and 12 not_yet_researched. Six numerator/denominator/boundary conflicts plus 29 prior conflicts make 35 cumulative open conflicts. AHRQ 2023 exposes binary burden indicators rather than patient-mix percentages; CMS FY 2024 DPP combines Medicare/SSI and Medicaid/non-Medicare fractions with different denominators at hospital/IPPS scope. Neither is a comparable product-system patient-mix percentage. Rights remain unknown_review_required. Eight comparability gates are blocked and two are not assessed. No averaging, adjudication, automatic adjudication, human authority, profile population, calculation, scoring, sensitivity, projection, recommendation, promotion, or deployment is authorized.';
  const manifestBody = {
    schema_version: 'ushso.scale-input-fitness-upstream-manifest.v1', active_family: 'safety_net_patient_mix_pct',
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
    expected_counts: { total_cells: 54, populated_cells: 0, blocked_cells: 30, unavailable_public_cells: 12, not_yet_researched_cells: 12, safety_net_patient_mix_pct_unavailable_cells: 6, safety_net_patient_mix_pct_conflicts: 6, cumulative_open_conflicts: 35, ...PRIOR_COUNTS },
    evidence_identifiers: evidenceRefs
  };
  const upstreamManifest = { ...manifestBody, manifest_sha256: sha256(manifestBody) };
  const reviewer = (reviewerId, agentSlug) => ({ reviewer_id: reviewerId, agent_slug: agentSlug, prompt_version: '2026-07-19', repo_commit: REVIEW_BASE, model: 'gpt-5.6-sol', runtime: 'codex-desktop-2026-07-19', independence: { prior_exposure: 'none', conflict_disclosures: [], direct_material_conflict: false, attestation: true } });
  const posture = (name, ref) => ({ posture: name, effect: 'unresolved', claim_refs: [claim.claim_id], evidence_refs: [packet.packet_id, ref], rationale: `The unavailable ${name} evidence state establishes only that Scale execution is ineligible.`, limitation: 'No comparable numerator, denominator, setting, system boundary, period, or approved patient-mix percentage exists. No posture is recommended.' });
  function commonReview(competenceRole, priorConcerns, laneConcerns) {
    return {
      competence_role: competenceRole, exposure_status: 'independent_first', evidence_mutated: false,
      claim_dispositions: [{ claim_id: claim.claim_id, evidence_assessment: 'supported_by_available_evidence', review_disposition: 'request_additional_evidence', evidence_refs: [packet.packet_id, objects.no_execution_result.result_id, ...conflicts, ...priorConflicts], limitation: evidenceBoundary, overturn_condition: 'Receipt six source-backed percentages under one approved safety-net numerator, patient or encounter denominator, setting, product-system boundary, and aligned period; clear source rights; resolve all 35 conflicts and all ten gates; obtain independent methods and population-health/health-services review plus named human competence-matched adjudication; preserve all 35 prior discrepancies and all 434 ordered prior concern entries without aggregation, imputation, fabricated zeroes, averaging, automatic adjudication, or human-authority claims.' }],
      posture_assessments: postures.map((name, index) => posture(name, conflicts[index])),
      missing_evidence_requests: [
        { request_id: 'missing:approved-safety-net-measure', description: 'Approve one safety-net numerator, patient or encounter denominator, care setting, inclusion/exclusion rule, attribution rule, and percentage method.' },
        { request_id: 'missing:six-system-patient-mix', description: 'Receipt one source-backed product-system percentage for each frozen system; unavailable evidence and binary flags are not zero.' },
        { request_id: 'missing:system-boundary-crosswalk', description: 'Reconcile hospital/IPPS units, facilities, faculty practices, acquired entities, rehabilitation, children’s services, and current product-system boundaries.' },
        { request_id: 'missing:period-alignment', description: 'Freeze one comparable period or approved lag rule across all six product systems.' },
        { request_id: 'missing:source-rights-clearance', description: 'Resolve unknown_review_required access and redistribution rights for the exact sources.' }
      ],
      prohibited_claims: [
        'Do not calculate, score, rank, normalize, impute, hand-count marketing pages, or run Scale v1 or any sensitivity.',
        'Unavailable, absent, definitionally incompatible, unreceipted, or conflicted safety-net patient-mix evidence is not zero.',
        'Do not substitute AHRQ binary burden indicators, CMS DPP, uncompensated-care cost, or facility aggregation for a product-system patient-mix percentage.',
        'Do not infer burden, need, access, utilization, quality, market position, feasibility, rank, recommendation, or profile population.',
        'Do not average positions, automatically adjudicate, fabricate denominator or human authority, project, promote, or deploy.'
      ],
      preserved_reviewer_concerns: [...priorConcerns, ...laneConcerns], overall_disposition: 'block'
    };
  }
  const sharedConcerns = [
    'All six safety-net-patient-mix cells remain unavailable_public, null, unapproved, source_backed false, source_backed_zero false, and imputed false.',
    'Six safety-net numerator/denominator/boundary conflicts remain open in addition to 29 prior conflicts: 35 cumulative.',
    'All 35 prior material discrepancies and all 434 ordered prior concern entries remain active and unresolved.',
    'AHRQ 2023 supplies identity plus binary high-DSH and uncompensated-care burden indicators, not a patient-mix numerator, denominator, or percentage; binary substitution is prohibited.',
    'CMS FY 2024 DPP sums Medicare/SSI and Medicaid/non-Medicare fractions with different denominators at hospital/IPPS scope; it is not a product-system patient-mix percentage.',
    'Uncompensated-care cost, hospital DPP, binary burden, and facility aggregation cannot substitute for the requested measure.',
    'Both evaluated sources remain unknown_review_required; no aggregation, imputation, fabricated zero, or source-local denominator substitution is permitted.',
    'ChristianaCare retains the current-four-facility and West Grove boundary question.',
    'Jefferson Health retains the frozen 33-facility and LVHN boundary question.',
    'Temple Health retains faculty-practice and Fox Chase scope questions.',
    'Penn Medicine retains faculty-practice and post-vintage scope questions.',
    'Cooper retains Cape Regional and Children’s scope questions.',
    'Main Line Health retains rehabilitation and service-boundary questions.',
    'Eight comparability gates are blocked and emergency-department definition plus designation taxonomy remain not_assessed; no averaging, automatic adjudication, or model-generated human authority is permitted.'
  ];
  const methodsCandidate = {
    ...commonReview('evidence_methods_measurement_biostatistics', objects.prior_review_record.current_methods_preserved_concerns, sharedConcerns),
    criterion_results: [
      { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:1', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [packet.packet_id, ...conflicts], rationale: 'The observation-claim-warrant chain supports only nonexecution: zero observations and six unavailable cells support no comparative percentage.' },
      { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:2', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [packet.packet_id, ...cells.flatMap(cell => cell.receipt_refs)], rationale: 'Numerator, denominator, setting, attribution, product-system boundary, period, and rights are absent or incompatible.' },
      { criterion_id: 'cso.evidence-methods-measurement.v1:criterion:3', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [packet.packet_id, ...conflicts], rationale: 'AHRQ burden flags and CMS DPP are different constructs, not independent corroboration of one patient-mix measure.' }
    ],
    method_challenges: [
      { challenge_id: 'method:binary-indicator-negative-control', description: 'Keep AHRQ burden flags categorical context, never percentages or zeroes.' },
      { challenge_id: 'method:denominator-substitution', description: 'Reject CMS DPP fractions, uncompensated-care cost, and mixed denominators as the requested patient-mix denominator.' },
      { challenge_id: 'method:facility-rollup-negative-control', description: 'Perturb hospital membership without aggregating or selecting a product-system value.' },
      { challenge_id: 'method:source-withholding', description: 'Withhold each source; no unavailable value may become populated.' }
    ]
  };
  const populationConcerns = sharedConcerns;
  const populationCandidate = {
    ...commonReview('population_health_services_research', objects.prior_review_record.current_governance_preserved_concerns, populationConcerns),
    criterion_results: [
      { criterion_id: 'cso.population-health-services.v1:criterion:1', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [packet.packet_id, ...conflicts], rationale: 'Binary burden, hospital DPP, uncompensated-care cost, observed patient mix, population need, utilization, and forecast demand are distinct constructs.' },
      { criterion_id: 'cso.population-health-services.v1:criterion:2', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [...cells.flatMap(cell => cell.receipt_refs), ...conflicts], rationale: 'Population, numerator, denominator, attribution, setting, geography, product-system boundary, and time are not frozen comparably.' },
      { criterion_id: 'cso.population-health-services.v1:criterion:3', result: 'addressed', claim_refs: [claim.claim_id], evidence_refs: [objects.no_execution_result.result_id, packet.packet_id], rationale: 'Hospital/IPPS evidence is subject to selection and ecological limits and cannot be transported to whole product-system patient mix.' }
    ],
    method_challenges: [
      { challenge_id: 'population:denominator-perturbation', description: 'Change patient, encounter, inpatient-day, Medicare, Medicaid, and non-Medicare denominators without selecting a preferred percentage.' },
      { challenge_id: 'population:setting-boundary', description: 'Compare IPPS units, hospitals, facilities, faculty practices, and product systems without aggregation.' },
      { challenge_id: 'population:selection-transportability', description: 'Test selection, surveillance, ecological, and transportability limits for each source.' },
      { challenge_id: 'population:burden-mix-negative-control', description: 'Keep burden indicators, DPP, uncompensated-care cost, utilization, need, and patient mix nonequivalent.' }
    ]
  };
  function makeRequest(label, protocolId, candidate, reviewerValue) {
    const protocol = findReviewProtocol(protocolId, '1.0.0');
    return { schema_version: 'ushso.review-request.v1', request_id: `review-request:scale-safety-net-patient-mix:${label}:2026-07-18`, review_tier: 'ordinary_material_claim', protocol: { protocol_id: protocol.protocol_id, version: protocol.version, protocol_hash: protocol.protocol_hash }, reviewer: reviewerValue, frozen_inputs: frozenInputs, decision_scenario: decisionScenario, posture_taxonomy: postures, evidence_boundary: evidenceBoundary, candidate_review: candidate };
  }
  const methodsRequest = makeRequest('methods', 'cso.evidence-methods-measurement.v1', methodsCandidate, reviewer('scale-safety-net-patient-mix:methods:1', 'healthit-clinical-data-analyst'));
  const populationRequest = makeRequest('population_health', 'cso.population-health-services.v1', populationCandidate, reviewer('scale-safety-net-patient-mix:population_health:1', 'pophealth-population-health-manager'));
  return { upstreamManifest, methodsRequest, populationRequest, priorDiscrepancies, safetyNetCells: cells, safetyNetConflicts: conflicts };
}

module.exports = { SAFETY_NET_PATIENT_MIX_CANONICAL_CONTEXT, deriveSafetyNetPatientMixCanonical };
