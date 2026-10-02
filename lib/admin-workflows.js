const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Ajv = require('ajv');
const ROOT = path.join(__dirname, '..');
const catalog = () => JSON.parse(fs.readFileSync(path.join(ROOT, 'workflows/admin-v2/catalog.json'), 'utf8'));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const ajv = new Ajv({ allErrors: true, strict: true });
const text = { type: 'string', minLength: 1, maxLength: 2000, pattern: '\\S' };
const date = { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' };
const count = { type: 'integer', minimum: 0, maximum: 1000000000 };
const money = { type: 'number', minimum: 0, maximum: 1000000000 };
const object = properties => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const dataSchemas = {
  'denial-spike-workup': object({ baseline_claims: count, baseline_denied: count, current_claims: count, current_denied: count, denied_dollars: money }),
  'ambulatory-access-backlog': object({ weekly_requests: count, weekly_slots: count, backlog: count, additional_weekly_slots: count }),
  'survey-readiness-gap-review': object({ findings: { type: 'array', maxItems: 1000, items: object({ id: text, standard_ref: text, evidence_present: { type: 'boolean' }, owner: text, due_date: date }) } }),
  'prior-authorization-appeal-workup': object({ decision_date: date, appeal_deadline: date, rule_reference: text, available_documents: { type: 'array', maxItems: 100, uniqueItems: true, items: text }, required_documents: { type: 'array', minItems: 1, maxItems: 100, uniqueItems: true, items: text } }),
  'payer-contract-underpayment-review': object({ lines: { type: 'array', minItems: 1, maxItems: 1000, items: object({ id: text, expected: money, paid: money, currency: { type: 'string', enum: ['USD'] }, contract_ref: text }) } }),
  'discharge-barrier-workplan': object({ barriers: { type: 'array', maxItems: 1000, items: object({ category: text, cases: count, avoidable_days: count, owner: text }) } })
};
function assertSchema(schema, value) {
  const validate = ajv.compile(schema);
  if (!validate(value)) throw new Error('Invalid contract: ' + ajv.errorsText(validate.errors, { separator: '; ' }));
}
function assertDate(value) {
  const parsed = new Date(value + 'T00:00:00Z');
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new Error('Invalid calendar date');
  return parsed;
}
function uniqueIds(rows, key) {
  if (new Set(rows.map(row => row[key])).size !== rows.length) throw new Error('Duplicate ' + key);
}
function runCase(input) {
  assertSchema(object({
    schema_version: { const: 'healthcare-admin.case.v2' },
    workflow_id: { enum: Object.keys(dataSchemas) },
    data_mode: { enum: ['synthetic_only', 'aggregate'] },
    human_owner: text,
    evidence: { type: 'array', minItems: 1, maxItems: 100, items: object({
      id: text, origin: { enum: ['synthetic', 'user_supplied', 'source_derived'] },
      as_of: date, description: text,
      fields: { type: 'array', minItems: 1, uniqueItems: true, items: text }
    }) },
    data: { type: 'object' }
  }), input);
  assertSchema(dataSchemas[input.workflow_id], input.data);
  uniqueIds(input.evidence, 'id');
  const covered = new Set();
  for (const evidence of input.evidence) {
    assertDate(evidence.as_of);
    if (input.data_mode === 'synthetic_only' && evidence.origin !== 'synthetic') throw new Error('Synthetic mode requires synthetic evidence');
    if (input.data_mode === 'aggregate' && evidence.origin === 'synthetic') throw new Error('Aggregate mode cannot silently mix synthetic evidence');
    for (const field of evidence.fields) {
      if (!Object.hasOwn(input.data, field)) throw new Error('Unknown evidence field: ' + field);
      covered.add(field);
    }
  }
  if (Object.keys(input.data).some(key => !covered.has(key))) throw new Error('Every data field requires evidence attribution');
  const d = input.data;
  let values;
  const checks = [];
  switch (input.workflow_id) {
    case 'denial-spike-workup': {
      if (!d.baseline_claims || !d.current_claims) throw new Error('Claim denominators must be positive');
      if (d.baseline_denied > d.baseline_claims || d.current_denied > d.current_claims) throw new Error('Denials exceed claims');
      const baseline = d.baseline_denied / d.baseline_claims;
      const current = d.current_denied / d.current_claims;
      values = { baseline_rate: baseline, current_rate: current, percentage_point_change: Number(((current - baseline) * 100).toFixed(10)),
        relative_change: baseline === 0 ? null : Number(((current - baseline) / baseline).toFixed(10)),
        denied_dollars: d.denied_dollars, recoverable_dollars: null };
      checks.push('Align denial definitions, populations and periods before interpreting a change; denied dollars are not recoverable cash.');
      break;
    }
    case 'ambulatory-access-backlog': {
      const net = d.weekly_slots + d.additional_weekly_slots - d.weekly_requests;
      values = { weekly_shortfall: Math.max(0, d.weekly_requests - d.weekly_slots), proposed_net_weekly_capacity: net,
        weeks_to_clear_backlog: d.backlog === 0 ? 0 : net > 0 ? Math.ceil(d.backlog / net) : null };
      checks.push('Capacity scenario assumes stable demand and usable slots; validate cancellations, staffing, visit mix and equity.');
      break;
    }
    case 'survey-readiness-gap-review':
      uniqueIds(d.findings, 'id');
      d.findings.forEach(row => assertDate(row.due_date));
      values = { findings: d.findings.length, missing_evidence: d.findings.filter(row => !row.evidence_present).length,
        gaps: d.findings.filter(row => !row.evidence_present), finding_records: d.findings };
      checks.push('Evidence presence does not prove standard compliance, implementation or survey readiness.');
      break;
    case 'prior-authorization-appeal-workup': {
      const days = (assertDate(d.appeal_deadline) - assertDate(d.decision_date)) / 86400000;
      if (days < 0) throw new Error('Appeal deadline precedes decision date');
      values = { supplied_calendar_day_window: days, rule_reference: d.rule_reference,
        missing_documents: d.required_documents.filter(item => !d.available_documents.includes(item)) };
      checks.push('The supplied dates and rule must be verified for payer, product, jurisdiction and receipt convention; no deadline is inferred.');
      break;
    }
    case 'payer-contract-underpayment-review':
      uniqueIds(d.lines, 'id');
      if (d.lines.some(row => ['expected', 'paid'].some(key => Math.abs(row[key] * 100 - Math.round(row[key] * 100)) > 0.00001))) throw new Error('USD amounts require cent precision');
      values = { currency: 'USD', net_variance: d.lines.reduce((sum, row) => sum + Math.round(row.expected * 100) - Math.round(row.paid * 100), 0) / 100,
        positive_variance: d.lines.reduce((sum, row) => sum + Math.max(0, Math.round(row.expected * 100) - Math.round(row.paid * 100)), 0) / 100,
        lines: d.lines.map(row => ({ ...row, variance: (Math.round(row.expected * 100) - Math.round(row.paid * 100)) / 100 })) };
      checks.push('Expected payment is supplied, not adjudicated; verify effective contract, carve-outs and adjustments before a dispute.');
      break;
    case 'discharge-barrier-workplan':
      uniqueIds(d.barriers, 'category');
      values = { barrier_counts: d.barriers.reduce((sum, row) => sum + row.cases, 0),
        reported_avoidable_days: d.barriers.reduce((sum, row) => sum + row.avoidable_days, 0), barriers: d.barriers };
      checks.push('Categories must be disjoint before summing cases; avoidable-day labels require local validation and do not authorize discharge.');
      break;
  }
  if (input.workflow_id === 'payer-contract-underpayment-review') {
    for (const key of ['net_variance', 'positive_variance']) values[key] = Math.round((values[key] + Number.EPSILON) * 100) / 100;
    values.lines.forEach(row => { row.variance = Math.round((row.variance + Number.EPSILON) * 100) / 100; });
  }
  const workflow = catalog().workflows.find(row => row.id === input.workflow_id);
  return { schema_version: 'healthcare-admin.result.v2', status: 'draft_for_human_review', workflow_id: input.workflow_id,
    human_owner: input.human_owner, data_mode: input.data_mode, input_sha256: hash(JSON.stringify(input)),
    values, evidence: input.evidence, interpretation_checks: checks, next_actions: workflow.decisions,
    completion_gate: workflow.completion_gate, external_actions_performed: false };
}
const customSchema = object({
  schema_version: { const: 'healthcare-admin.workflow.v2' },
  id: { type: 'string', maxLength: 53, pattern: '^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$' },
  name: text, purpose: text,
  primary_agent: { type: 'string', enum: JSON.parse(fs.readFileSync(path.join(ROOT, 'agents/registry.json'))).agents.map(row => row.slug) },
  human_owner: text,
  required_inputs: { type: 'array', minItems: 1, maxItems: 20, items: object({
    key: { type: 'string', pattern: '^[a-z][a-z0-9_]*$', maxLength: 60 }, label: text,
    type: { enum: ['string', 'number', 'integer', 'date'] }, source_required: { const: true }
  }) },
  steps: { type: 'array', minItems: 1, maxItems: 10, items: text },
  output_sections: { type: 'array', minItems: 1, maxItems: 12, uniqueItems: true, items: text },
  acceptance: { type: 'array', minItems: 1, maxItems: 12, uniqueItems: true, items: text }
});
function validateCustom(spec) {
  assertSchema(customSchema, spec);
  uniqueIds(spec.required_inputs, 'key');
  return spec;
}
function skillFor(workflow) {
  return ['---', 'name: healthcare-' + workflow.id, 'description: ' + JSON.stringify(workflow.purpose), 'license: Apache-2.0', '---', '',
    '# ' + workflow.name, '', workflow.purpose, '',
    'Read [the workflow contract](references/workflow.json) when this task applies. Use its evidence fields and decision checks; adapt the artifact to the user.',
    '', 'Work from approved aggregate, synthetic or otherwise authorized evidence. Keep sources, effective dates, missing facts and conflicts visible.',
    'Preserve the named human owner. External submissions, messages and production changes require scoped authorization.',
    'Provide administrative support; do not make final clinical, legal, coding, billing, audit or compliance decisions.',
    'Report the artifact delivered and remaining evidence or action; calculation alone does not complete the operational workflow.', ''].join('\n');
}
function writeBundle(destination, files) {
  const resolved = path.resolve(destination);
  if (fs.existsSync(resolved)) throw new Error('Output already exists; choose a new directory');
  const parent = path.dirname(resolved);
  fs.mkdirSync(parent, { recursive: true });
  const staging = fs.mkdtempSync(path.join(parent, '.healthcare-bundle-'));
  try {
    for (const [name, content] of Object.entries(files)) {
      const file = path.join(staging, name);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, content, { flag: 'wx' });
    }
    const manifest = { schema_version: 'healthcare-admin.bundle.v2', package_version: require('../package.json').version,
      files: Object.entries(files).map(([name, content]) => ({ path: name, sha256: hash(content), bytes: Buffer.byteLength(content) })) };
    fs.writeFileSync(path.join(staging, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
    if (fs.existsSync(resolved)) throw new Error('Output appeared during build');
    fs.renameSync(staging, resolved);
    return manifest;
  } finally {
    if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true });
  }
}
function buildCustom(spec, destination) {
  validateCustom(spec);
  const template = { schema_version: 'healthcare-admin.custom-case.v2', workflow_id: spec.id,
    human_owner: spec.human_owner, inputs: Object.fromEntries(spec.required_inputs.map(row => [row.key, { value: null, source: null, as_of: null }])) };
  return writeBundle(destination, { 'SKILL.md': skillFor(spec), 'references/workflow.json': JSON.stringify(spec, null, 2) + '\n',
    'CASE.template.json': JSON.stringify(template, null, 2) + '\n' });
}
function exportWorkflow(target, id, destination) {
  if (!['codex', 'claude', 'chatgpt', 'azure', 'databricks'].includes(target)) throw new Error('Unknown export target');
  const workflow = catalog().workflows.find(row => row.id === id);
  if (!workflow) throw new Error('Unknown deep workflow');
  const files = {
    'instructions.md': skillFor(workflow).replace(/^---[\s\S]*?---\n/, ''),
    'references/workflow.json': JSON.stringify(workflow, null, 2) + '\n',
    'compatibility.json': JSON.stringify({ target, local_payload_tested: true, live_host_tested: false,
      surface: ['codex', 'claude'].includes(target) ? 'Agent Skills filesystem payload' : 'Instructions and workflow reference for a customer-managed host',
      execution: 'Calculations require Node >=18 plus the installed healthcare-agents package; no hosted runtime is provisioned.' }, null, 2) + '\n'
  };
  if (['codex', 'claude'].includes(target)) files['SKILL.md'] = skillFor(workflow);
  return writeBundle(destination, files);
}
module.exports = { catalog, runCase, validateCustom, buildCustom, exportWorkflow, skillFor, dataSchemas };
