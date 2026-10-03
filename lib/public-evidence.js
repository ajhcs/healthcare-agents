'use strict';
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const Ajv = require('ajv');
const { runCase, caseSchemaFor, writeBundle } = require('./admin-workflows');
const LIMIT = 2 * 1024 * 1024;
const sha = value => 'sha256:' + crypto.createHash('sha256').update(value).digest('hex');
const clone = value => JSON.parse(JSON.stringify(value));
const text = { type: 'string', minLength: 1, maxLength: 2000, pattern: '\\S' };
const object = properties => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const pointer = { type: 'string', minLength: 2, maxLength: 256, pattern: '^/' };
const date = { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' };
const period = object({ label: text, start: { anyOf: [date, { type: 'null' }] }, end: { anyOf: [date, { type: 'null' }] } });
const mappingSchema = object({
  schema_version: { const: 'healthcare-admin.evidence-mapping.v1' },
  workflow_id: { enum: Object.keys(require('./admin-workflows').dataSchemas) },
  human_owner: text, source_origin: { enum: ['synthetic', 'source_derived'] }, data_mode: { enum: ['synthetic_only', 'aggregate'] }, as_of: date,
  bundle_sha256: { type: 'string', pattern: '^sha256:[0-9a-f]{64}$' },
  entity_id: text,
  scope: object({ systems: { type: 'array', minItems: 1, items: text }, market: { type: 'object' },
    service_line: { anyOf: [text, { type: 'null' }] }, periods: { type: 'array', minItems: 1, items: text } }),
  accepted_conflict_ids: { type: 'array', maxItems: 1000, uniqueItems: true, items: text },
  data: { type: 'object' },
  bindings: { type: 'array', minItems: 1, maxItems: 5000, items: object({
    path: pointer, coverage_id: text, observation_id: { anyOf: [text, { type: 'null' }] },
    expect: object({ measure_id: text, value_type: { enum: ['integer', 'number', 'string', 'boolean'] },
      unit: text, period, denominator_scope: text,
      derivation_class: { enum: ['source_reported', 'normalized', 'modeled_input'] } })
  }) },
  owner_inputs: { type: 'array', maxItems: 5000, items: object({
    path: pointer, value: { anyOf: [{ type: ['string', 'number', 'boolean', 'null'] }, { type: 'array', maxItems: 0 }] },
    as_of: date, description: text
  }) }
});
const ajv = new Ajv({ allErrors: true, strict: true, allowUnionTypes: true });
const validMapping = ajv.compile(mappingSchema);
const bundleAjv = new Ajv({ allErrors: true, strict: true, strictTypes: false, allowUnionTypes: true });
bundleAjv.addFormat('date', value => /^\d{4}-\d{2}-\d{2}$/.test(value) && calendarDate(value));
bundleAjv.addFormat('date-time', value => {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.exec(value);
  return Boolean(m && calendarDate(m[1]) && Number(m[2]) < 24 && Number(m[3]) < 60 && Number(m[4]) < 60 && Number.isFinite(Date.parse(value)));
});
const validBundleJson = bundleAjv.compile(require('./data-mcp-contract/public-evidence-bundle.schema.json'));
function safeNumbers(value) {
  const pending = [{ value, depth: 0 }];
  while (pending.length) {
    const { value: row, depth } = pending.pop();
    if (depth > 64) throw error('INPUT_NESTING_TOO_DEEP');
    if (typeof row === 'number' && (!Number.isFinite(row) || (Number.isInteger(row) && !Number.isSafeInteger(row)))) throw error('UNSAFE_NUMBER_REQUIRES_REVIEW');
    if (row && typeof row === 'object') for (const child of Object.values(row)) pending.push({ value: child, depth: depth + 1 });
  }
}

function calendarDate(value) {
  const d = new Date(value + 'T00:00:00Z');
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
  return JSON.stringify(value);
}
function error(code) {
  const e = new Error(code); e.code = code; return e;
}
function checkedJson(value) {
  const raw = typeof value === 'string' ? value : JSON.stringify(value);
  if (typeof raw !== 'string' || Buffer.byteLength(raw) > LIMIT) throw error('INPUT_TOO_LARGE');
  return raw;
}
function leaves(value, prefix = '', depth = 0) {
  if (depth > 16) throw error('MAPPING_CONTRACT_INVALID');
  if (value === null || (Array.isArray(value) && value.length === 0)) return [prefix];
  if (!value || typeof value !== 'object') throw error('MAPPING_TEMPLATE_REQUIRES_NULL_LEAVES');
  return Object.keys(value).flatMap(key => leaves(value[key], prefix + '/' + key.replace(/~/g, '~0').replace(/\//g, '~1'), depth + 1));
}
function setLeaf(data, p, value) {
  const keys = p.slice(1).split('/').map(k => k.replace(/~1/g, '/').replace(/~0/g, '~'));
  let row = data;
  for (const key of keys.slice(0, -1)) row = row[key];
  row[keys.at(-1)] = value;
}
function targetUnit(p) {
  const key = p.split('/').at(-1);
  if (['baseline_claims', 'baseline_denied', 'current_claims', 'current_denied'].includes(key)) return 'claims';
  if (['denied_dollars', 'expected', 'paid'].includes(key)) return 'USD';
  if (['weekly_requests', 'weekly_slots', 'additional_weekly_slots'].includes(key)) return 'visits_per_week';
  if (key === 'backlog') return 'visits';
  if (key === 'cases') return 'cases';
  if (key === 'avoidable_days') return 'days';
  if (key === 'evidence_present') return 'evidence_presence';
  if (['decision_date', 'appeal_deadline', 'due_date'].includes(key)) return 'calendar_date';
  if (/^\/(available_documents|required_documents)\//.test(p)) return 'document_label';
  return 'label';
}
function parseJson(raw) {
  // Ignore one leading UTF-8 BOM only while parsing; retain it for byte custody.
  return JSON.parse(raw.startsWith('\uFEFF') ? raw.slice(1) : raw);
}
function validateProducer(raw, mappingRaw, python) {
  let parsed;
  try { parsed = parseJson(raw); } catch { throw error('PUBLIC_EVIDENCE_CONTRACT_INVALID'); }
  safeNumbers(parsed);
  if (!validBundleJson(parsed)) throw error('PUBLIC_EVIDENCE_CONTRACT_INVALID');
  const packet = JSON.stringify({ bundle_json: raw, mapping_json: mappingRaw });
  if (Buffer.byteLength(packet) > LIMIT) throw error('INPUT_TOO_LARGE');
  const result = spawnSync(python, ['-B', path.join(__dirname, 'data-mcp-contract/validate_bundle.py')], {
    input: packet, encoding: 'utf8', timeout: 5000, maxBuffer: LIMIT
  });
  if (result.error) {
    if (result.error.code === 'ENOENT') throw error('EVIDENCE_VALIDATOR_UNAVAILABLE');
    if (result.error.code === 'ETIMEDOUT') throw error('EVIDENCE_VALIDATOR_TIMEOUT');
    throw error('EVIDENCE_VALIDATOR_FAILED');
  }
  if (result.status !== 0) {
    if (/ModuleNotFoundError.*pydantic/.test(result.stderr || '')) throw error('EVIDENCE_VALIDATOR_UNAVAILABLE');
    throw error('PUBLIC_EVIDENCE_CONTRACT_INVALID');
  }
  return JSON.parse(result.stdout).bundle;
}
function mapPublicEvidence(bundleInput, mappingInput, { python = 'python3' } = {}) {
  const raw = checkedJson(bundleInput), mappingRaw = checkedJson(mappingInput);
  if (Buffer.byteLength(raw) + Buffer.byteLength(mappingRaw) > LIMIT) throw error('INPUT_TOO_LARGE');
  let mapping;
  try { mapping = parseJson(mappingRaw); } catch { throw error('MAPPING_CONTRACT_INVALID'); }
  safeNumbers(mapping);
  if (!validMapping(mapping) || !calendarDate(mapping.as_of) || mapping.owner_inputs.some(x => !calendarDate(x.as_of))) throw error('MAPPING_CONTRACT_INVALID');
  caseSchemaFor(mapping.workflow_id);
  const targets = leaves(mapping.data);
  const assignments = [...mapping.bindings, ...mapping.owner_inputs].map(x => x.path);
  if (assignments.some(p => /~(?![01])/.test(p) || p.slice(1).split('/').some(k => ['__proto__', 'prototype', 'constructor'].includes(k)))) throw error('MAPPING_PATHS_INVALID');
  if (!targets.length || assignments.length !== new Set(assignments).size ||
      assignments.length !== targets.length || assignments.some(p => !targets.includes(p))) throw error('MAPPING_PATHS_INVALID');
  if ((mapping.data_mode === 'synthetic_only') !== (mapping.source_origin === 'synthetic')) throw error('MAPPING_ORIGIN_MISMATCH');
  const bundle = validateProducer(raw, mappingRaw, python);
  const data = clone(mapping.data), blockers = [], fieldMap = [], evidence = new Map();
  const block = (code, field = null, refs = []) => blockers.push({ code, field, refs });
  if (mapping.data_mode === 'aggregate' && (bundle.request.parameters.synthetic === true ||
      bundle.sources.some(x => x.receipt.acquisition_method === 'synthetic_fixture'))) block('SYNTHETIC_BUNDLE_CANNOT_BECOME_AGGREGATE');
  if (bundle.bundle_sha256 !== mapping.bundle_sha256) block('BUNDLE_PIN_MISMATCH');
  if (canonical(bundle.scope) !== canonical(mapping.scope)) block('SCOPE_MISMATCH');
  const entity = bundle.entities.find(x => x.entity_id === mapping.entity_id);
  if (!entity) block('ENTITY_NOT_FOUND', null, [mapping.entity_id]);
  else if (entity.unresolved_identifiers.length || entity.conflicts.length || !entity.match_decisions.length ||
      entity.match_decisions.some(x => !x.basis.trim() || !x.confidence.trim())) block('IDENTITY_REQUIRES_REVIEW', null, [mapping.entity_id]);
  const observations = new Map(bundle.observations.map(x => [x.observation_id, x]));
  const coverage = new Map(bundle.coverage.map(x => [x.coverage_id, x]));
  const receipts = new Map(bundle.sources.map(x => [x.receipt.receipt_id, x]));
  const selectedObservations = new Set(mapping.bindings.map(x => x.observation_id));
  const selectedReceipts = new Set(mapping.bindings.flatMap(x => observations.get(x.observation_id)?.receipt_refs || []));
  function lineage(ids, trail = [], seen = new Set()) {
    const all = new Set();
    for (const id of ids) {
      all.add(id);
      if (trail.includes(id) || trail.length >= 16) { block('RECEIPT_LINEAGE_REQUIRES_REVIEW', null, [id]); continue; }
      if (seen.has(id)) continue;
      seen.add(id);
      for (const parent of lineage(receipts.get(id).receipt.parent_receipt_ids, [...trail, id], seen)) all.add(parent);
    }
    return all;
  }
  const lineageByObservation = new Map([...new Set(mapping.bindings.map(x => x.observation_id))].filter(id => observations.has(id)).map(id => {
    const ids = lineage(observations.get(id).receipt_refs);
    for (const id of ids) selectedReceipts.add(id);
    return [id, [...ids]];
  }));
  const aligned = paths => {
    const rows = paths.map(p => mapping.bindings.find(x => x.path === p)).map(x => x && observations.get(x.observation_id)).filter(Boolean);
    if (rows.length > 1 && rows.some(x => canonical(x.period) !== canonical(rows[0].period) || x.denominator_scope !== rows[0].denominator_scope)) block('COHORT_ALIGNMENT_REQUIRES_REVIEW', paths[0], rows.map(x => x.observation_id));
  };
  const samePopulation = paths => {
    const rows = paths.map(p => mapping.bindings.find(x => x.path === p)).map(x => x && observations.get(x.observation_id)).filter(Boolean);
    // Compare available source observations even when other fields are owner inputs.
    // Snapshot dates and document inventory periods need not equal reporting periods.
    if (rows.length > 1 && rows.some(x => x.denominator_scope !== rows[0].denominator_scope)) block('COHORT_ALIGNMENT_REQUIRES_REVIEW', paths[0], rows.map(x => x.observation_id));
  };
  if (mapping.workflow_id === 'denial-spike-workup') {
    aligned(['/baseline_claims', '/baseline_denied']); aligned(['/current_claims', '/current_denied', '/denied_dollars']);
    const rows = mapping.bindings.map(x => observations.get(x.observation_id)).filter(Boolean);
    if (rows.some(x => x.denominator_scope !== rows[0].denominator_scope)) block('COHORT_ALIGNMENT_REQUIRES_REVIEW');
  }
  if (mapping.workflow_id === 'ambulatory-access-backlog') {
    aligned(['/weekly_requests', '/weekly_slots', '/additional_weekly_slots']);
    samePopulation(['/weekly_requests', '/weekly_slots', '/additional_weekly_slots', '/backlog']);
  }
  if (mapping.workflow_id === 'prior-authorization-appeal-workup') samePopulation(mapping.bindings.filter(x =>
    ['/decision_date', '/appeal_deadline'].includes(x.path) || /^\/(available_documents|required_documents)\//.test(x.path)).map(x => x.path));
  if (mapping.workflow_id === 'payer-contract-underpayment-review') Array.isArray(mapping.data.lines) && mapping.data.lines.forEach((_, i) => aligned(['/lines/' + i + '/expected', '/lines/' + i + '/paid']));
  if (mapping.workflow_id === 'discharge-barrier-workplan') aligned(mapping.bindings.filter(x => ['cases', 'avoidable_days'].includes(x.path.split('/').at(-1))).map(x => x.path));

  for (const id of mapping.accepted_conflict_ids) if (!bundle.conflicts.some(x => x.conflict_id === id && x.status === 'accepted_with_rationale')) block('CONFLICT_ACKNOWLEDGEMENT_INVALID', null, [id]);
  for (const conflict of bundle.conflicts) {
    const relevant = (!conflict.entity_refs.length && !conflict.observation_refs.length && !conflict.receipt_refs.length) ||
      conflict.entity_refs.includes(mapping.entity_id) || conflict.observation_refs.some(x => selectedObservations.has(x)) ||
      conflict.receipt_refs.some(x => selectedReceipts.has(x));
    if (relevant && (conflict.status === 'open' || (conflict.status === 'accepted_with_rationale' && !mapping.accepted_conflict_ids.includes(conflict.conflict_id)))) block('SOURCE_CONFLICT_REQUIRES_REVIEW', null, [conflict.conflict_id]);
  }
  function attribute(p, origin, asOf, refs) {
    const field = p.split('/')[1].replace(/~1/g, '/').replace(/~0/g, '~');
    const key = origin + ':' + asOf;
    if (!evidence.has(key)) evidence.set(key, { id: 'mapped-' + (evidence.size + 1), origin, as_of: asOf,
      description: 'Explicit operator mapping; retain the evidence-map sidecar and full public bundle ' + bundle.bundle_sha256 + '. Source declarations are unverified for factual truth and use rights.',
      fields: new Set() });
    evidence.get(key).fields.add(field);
    fieldMap.push({ path: p, origin, as_of: asOf, ...refs });
  }
  for (const binding of mapping.bindings) {
    const c = coverage.get(binding.coverage_id), o = observations.get(binding.observation_id);
    if (!c) { block('COVERAGE_NOT_FOUND', binding.path, [binding.coverage_id]); continue; }
    if (c.entity_ref !== mapping.entity_id || c.measure_id !== binding.expect.measure_id) { block('COVERAGE_SCOPE_MISMATCH', binding.path, [c.coverage_id]); continue; }
    if (c.status !== 'populated') { block('COVERAGE_' + c.status.toUpperCase(), binding.path, [c.coverage_id]); continue; }
    if (!o || !c.observation_refs.includes(binding.observation_id)) { block('OBSERVATION_NOT_COVERED', binding.path, [c.coverage_id]); continue; }
    if (o.unit !== targetUnit(binding.path)) { block('TARGET_UNIT_MISMATCH', binding.path, [o.observation_id]); continue; }
    if (o.entity_ref !== mapping.entity_id || Object.entries(binding.expect).some(([k, v]) => canonical(o[k]) !== canonical(v))) {
      block('OBSERVATION_SCOPE_MISMATCH', binding.path, [o.observation_id]); continue;
    }
    let rightsOk = true;
    for (const rid of lineageByObservation.get(o.observation_id)) {
      const source = receipts.get(rid);
      if (!['public_domain', 'public_use_terms'].includes(source.access_rights)) { block('SOURCE_RIGHTS_REQUIRES_REVIEW', binding.path, [rid]); rightsOk = false; }
      for (const url of [source.receipt.source_url, source.receipt.landing_page]) {
        try { const u = new URL(url); if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password) throw new Error(); }
        catch { block('SOURCE_LOCATOR_REQUIRES_REVIEW', binding.path, [rid]); rightsOk = false; }
      }
    }
    if (!rightsOk) continue;
    setLeaf(data, binding.path, o.value);
    attribute(binding.path, mapping.data_mode === 'synthetic_only' ? 'synthetic' : 'source_derived', mapping.as_of,
      { observation_id: o.observation_id, coverage_id: c.coverage_id, receipt_refs: o.receipt_refs, lineage_receipt_refs: lineageByObservation.get(o.observation_id), dependency_cluster_ids: o.dependency_cluster_ids });
  }
  for (const supplied of mapping.owner_inputs) {
    setLeaf(data, supplied.path, supplied.value);
    attribute(supplied.path, mapping.data_mode === 'synthetic_only' ? 'synthetic' : 'user_supplied', supplied.as_of,
      { owner_input: supplied });
  }
  let caseInput = null;
  if (!blockers.length) {
    const candidate = { schema_version: 'healthcare-admin.case.v2', workflow_id: mapping.workflow_id,
      human_owner: mapping.human_owner, data_mode: mapping.data_mode,
      evidence: [...evidence.values()].map(x => ({ ...x, fields: [...x.fields] })), data };
    try { runCase(candidate); caseInput = candidate; }
    catch { block('CASE_CONTRACT_INVALID'); }
  }
  const result = { schema_version: 'healthcare-admin.evidence-map-result.v1',
    status: blockers.length ? 'blocked' : 'ready_for_human_review',
    workflow_id: mapping.workflow_id, human_owner: mapping.human_owner, case: caseInput, blockers,
    provenance: { raw_bundle_sha256: sha(raw), producer_bundle_sha256: bundle.bundle_sha256,
      producer_bundle_hash_verified: true, mapping_sha256: sha(mappingRaw), mapping: clone(mapping), field_map: fieldMap,
      public_evidence: bundle },
    review_requirements: ['Operator declares synthetic or authorized aggregate inputs; this is not a PHI detector.',
      'Verify entity match, measure meaning, population, period, units, source freshness, rights and use fitness with the named owner.',
      'A matching producer checksum verifies declared bundle content, not the fetched source bytes or factual truth.',
      'Retain all receipts, coverage, conflicts, derivation classes and dependency clusters; do not treat related receipts as independent evidence.',
      'The mapping makes no unit conversion, formula, join, acquisition or external decision. Missing values are never zero-filled.'],
    external_actions_performed: false };
  if (Buffer.byteLength(JSON.stringify(result)) + 1 > LIMIT) throw error('OUTPUT_TOO_LARGE');
  return result;
}
function importEvidence(bundleInput, mappingInput, destination, options) {
  const raw = checkedJson(bundleInput);
  const result = mapPublicEvidence(raw, mappingInput, options);
  const files = { 'public-evidence-bundle.json': raw, 'evidence-map.json': JSON.stringify(result, null, 2) + '\n' };
  if (result.case) files['case.json'] = JSON.stringify(result.case, null, 2) + '\n';
  for (const content of Object.values(files)) if (Buffer.byteLength(content) > LIMIT) throw error('OUTPUT_TOO_LARGE');
  const manifest = writeBundle(destination, files);
  return { status: result.status, blockers: result.blockers, manifest };
}
module.exports = { mapPublicEvidence, importEvidence, mappingSchema };
