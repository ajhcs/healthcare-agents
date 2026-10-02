const path = require('path');
const crypto = require('crypto');
const Ajv = require('ajv');
const { Worker } = require('worker_threads');
const admin = require('./admin-workflows');
const ajv = new Ajv({ strict: true, allErrors: true });
const text = { type: 'string', minLength: 1, maxLength: 1000000 };
const obj = properties => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const list = items => ({ type: 'array', items, maxItems: 1000 });
const number = { type: 'number' };
const integer = { type: 'integer', minimum: 0 };
const nullable = schema => ({ anyOf: [schema, { type: 'null' }] });
const record = admin.dataSchemas['survey-readiness-gap-review'].properties.findings.items;
const evidence = admin.caseSchemaFor('denial-spike-workup').properties.evidence;
const values = {
  'denial-spike-workup': obj({ baseline_rate: number, current_rate: number, percentage_point_change: number, relative_change: nullable(number), denied_dollars: number, recoverable_dollars: { type: 'null' } }),
  'ambulatory-access-backlog': obj({ weekly_shortfall: integer, proposed_net_weekly_capacity: { type: 'integer' }, weeks_to_clear_backlog: nullable(integer) }),
  'survey-readiness-gap-review': obj({ findings: integer, missing_evidence: integer, gaps: list(record), finding_records: list(record) }),
  'prior-authorization-appeal-workup': obj({ supplied_calendar_day_window: integer, rule_reference: text, missing_documents: list(text) }),
  'payer-contract-underpayment-review': obj({ currency: { const: 'USD' }, net_variance: number, positive_variance: number, lines: list({ ...admin.dataSchemas['payer-contract-underpayment-review'].properties.lines.items, properties: { ...admin.dataSchemas['payer-contract-underpayment-review'].properties.lines.items.properties, variance: number }, required: [...admin.dataSchemas['payer-contract-underpayment-review'].properties.lines.items.required, 'variance'] }) }),
  'discharge-barrier-workplan': obj({ barrier_counts: integer, reported_avoidable_days: integer, barriers: admin.dataSchemas['discharge-barrier-workplan'].properties.barriers })
};
const MAX_RESULT_BYTES = 2 * 1024 * 1024;
const wireBytes = value => Buffer.byteLength(JSON.stringify(value)) + 1;
const errors = ['CONTRACT_INVALID', 'MODE_NOT_ALLOWED', 'INPUT_TOO_LARGE', 'OUTPUT_TOO_LARGE', 'CANCELLED', 'TIMEOUT', 'BUSY', 'INTERNAL_ERROR'];
const errorSchema = obj({ ok: { const: false }, error: obj({ code: { enum: errors }, message: text, retryable: { type: 'boolean' } }) });
const outputSchema = result => ({ type: 'object', oneOf: [obj({ ok: { const: true }, result }), errorSchema] });
const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const actions = [
  ['investigate_denial_spike', 'denial-spike-workup'],
  ['model_access_capacity', 'ambulatory-access-backlog'],
  ['review_survey_evidence', 'survey-readiness-gap-review'],
  ['prepare_appeal_evidence', 'prior-authorization-appeal-workup'],
  ['review_payment_variance', 'payer-contract-underpayment-review'],
  ['summarize_discharge_barriers', 'discharge-barrier-workplan']
];
function resultSchema(id) {
  return obj({ schema_version: { const: 'healthcare-admin.result.v2' }, status: { const: 'draft_for_human_review' },
    workflow_id: { const: id }, human_owner: text, data_mode: { enum: ['synthetic_only', 'aggregate'] },
    input_sha256: { type: 'string', pattern: '^[a-f0-9]{64}$' }, values: values[id], evidence,
    interpretation_checks: list(text), next_actions: list(text), completion_gate: text, external_actions_performed: { const: false } });
}
const catalog = admin.catalog();
const workflowSchema = obj(Object.fromEntries(Object.entries(catalog.workflows[0]).map(([key, value]) => [key, Array.isArray(value) ? list(text) : text])));
const provenanceSchema = obj({ origin: { enum: ['synthetic', 'user_supplied'] }, as_of: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' }, description: { type: 'string', minLength: 1, maxLength: 2000, pattern: '\\S' } });
const manifestSchema = obj({ schema_version: { const: 'healthcare-admin.bundle.v2' }, package_version: text,
  files: list(obj({ path: text, sha256: { type: 'string', pattern: '^[a-f0-9]{64}$' }, bytes: integer })) });
const definitions = [
  { name: 'get_admin_workflows', title: 'Find supported administration workflows', description: 'List six healthcare administration workflow contracts, required evidence, human owners and completion gates. Local reference only.',
    inputSchema: obj({}), outputSchema: outputSchema(obj({ schema_version: { const: 'healthcare-admin.catalog.v2' }, workflows: list(workflowSchema) })), annotations },
  ...actions.map(([name, id]) => {
    const workflow = catalog.workflows.find(w => w.id === id);
    return { name, title: workflow.name, description: workflow.purpose + ' Supply the full case with dated field-level evidence and human owner. Returns a calculation draft, never an operational approval. Local synthetic-only policy is the default.',
      inputSchema: obj({ case: admin.caseSchemaFor(id) }), outputSchema: outputSchema(resultSchema(id)), annotations };
  }),
  { name: 'draft_custom_workflow', title: 'Draft a reusable administration workflow',
    description: 'Validate a source-required custom workflow specification and return skill, reference, case-template bytes and hashes in memory. Supply specification provenance. No filesystem write, formula execution, installation or external action occurs.',
    inputSchema: obj({ specification: admin.customSchema, specification_provenance: provenanceSchema }),
    outputSchema: outputSchema(obj({ status: { const: 'draft_for_human_review' }, human_owner: text,
      specification_provenance: provenanceSchema, files: obj({ 'SKILL.md': text, 'references/workflow.json': text, 'CASE.template.json': text }),
      manifest: manifestSchema, external_actions_performed: { const: false } })), annotations }
];
const inputValidators = new Map(definitions.map(d => [d.name, ajv.compile(d.inputSchema)]));
const outputValidators = new Map(definitions.map(d => [d.name, ajv.compile(d.outputSchema)]));
const messages = {
  CONTRACT_INVALID: 'The supplied case or specification failed its contract. Reconcile required evidence, dates, counts and the human owner before retrying.',
  MODE_NOT_ALLOWED: 'This runtime accepts synthetic cases/specifications only. Approved aggregate mode requires an explicit owner-controlled runtime policy.',
  INPUT_TOO_LARGE: 'Tool input exceeds the 2 MiB limit.',
  OUTPUT_TOO_LARGE: 'The complete tool result envelope exceeds the 2 MiB limit.',
  CANCELLED: 'The tool call was cancelled; no external action or file write occurred.',
  TIMEOUT: 'The calculation exceeded its runtime deadline; no external action or file write occurred.',
  BUSY: 'The local calculation capacity is full; retry after another call completes.',
  INTERNAL_ERROR: 'The local calculation failed. No external action or file write occurred.'
};
function failure(code) { return { ok: false, error: { code, message: messages[code], retryable: ['BUSY', 'TIMEOUT'].includes(code) } }; }
function mcpResult(payload) {
  const result = { isError: !payload.ok, structuredContent: payload, content: [{ type: 'text', text: JSON.stringify(payload) }] };
  return wireBytes(result) > MAX_RESULT_BYTES ? mcpResult(failure('OUTPUT_TOO_LARGE')) : result;
}
function executeTool(name, args, allowAggregate = false) {
  const validate = inputValidators.get(name);
  if (!validate || !validate(args)) return failure('CONTRACT_INVALID');
  if (args.case && !allowAggregate && args.case.data_mode !== 'synthetic_only') return failure('MODE_NOT_ALLOWED');
  if (args.specification_provenance && !allowAggregate && args.specification_provenance.origin !== 'synthetic') return failure('MODE_NOT_ALLOWED');
  try {
    let result;
    if (name === 'get_admin_workflows') result = admin.catalog();
    else if (name === 'draft_custom_workflow') {
      const date = args.specification_provenance.as_of;
      if (new Date(date + 'T00:00:00Z').toISOString().slice(0, 10) !== date) return failure('CONTRACT_INVALID');
      const files = admin.customBundleFiles(args.specification);
      result = { status: 'draft_for_human_review', human_owner: args.specification.human_owner,
        specification_provenance: args.specification_provenance, files,
        manifest: { schema_version: 'healthcare-admin.bundle.v2', package_version: require('../package.json').version,
          files: Object.entries(files).map(([path, content]) => ({ path, bytes: Buffer.byteLength(content), sha256: crypto.createHash('sha256').update(content).digest('hex') })) },
        external_actions_performed: false };
    } else result = admin.runCase(args.case);
    const payload = { ok: true, result };
    if (!outputValidators.get(name)(payload)) return failure('INTERNAL_ERROR');
    if (Buffer.byteLength(JSON.stringify(payload)) > 2 * 1024 * 1024) return failure('OUTPUT_TOO_LARGE');
    return payload;
  } catch { return failure('CONTRACT_INVALID'); }
}
class ToolRuntime {
  constructor({ timeoutMs = 5000, maxConcurrent = 4, allowAggregate = false } = {}) {
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) throw new Error('Invalid runtime timeout');
    if (!Number.isInteger(maxConcurrent) || maxConcurrent < 1 || maxConcurrent > 16) throw new Error('Invalid runtime capacity');
    this.timeoutMs = timeoutMs; this.maxConcurrent = maxConcurrent; this.allowAggregate = allowAggregate;
    this.active = new Map(); this.closed = false;
  }
  call(name, args, signal) {
    if (!inputValidators.has(name)) return Promise.resolve(mcpResult(failure('CONTRACT_INVALID')));
    if (signal?.aborted) return Promise.resolve(mcpResult(failure('CANCELLED')));
    let serialized;
    try { serialized = JSON.stringify(args); } catch { return Promise.resolve(mcpResult(failure('CONTRACT_INVALID'))); }
    if (!serialized || Buffer.byteLength(serialized) > 2 * 1024 * 1024) return Promise.resolve(mcpResult(failure('INPUT_TOO_LARGE')));
    if (this.closed) return Promise.resolve(mcpResult(failure('CANCELLED')));
    if (this.active.size >= this.maxConcurrent) return Promise.resolve(mcpResult(failure('BUSY')));
    return new Promise(resolve => {
      let worker;
      try { worker = new Worker(path.join(__dirname, 'admin-tool-worker.js'), { workerData: { name, args, allowAggregate: this.allowAggregate }, resourceLimits: { maxOldGenerationSizeMb: 96 } }); }
      catch { resolve(mcpResult(failure('INTERNAL_ERROR'))); return; }
      this.active.set(worker, () => finish(failure('CANCELLED')));
      let finished = false;
      const finish = payload => {
        if (finished) return; finished = true;
        clearTimeout(timer); signal?.removeEventListener('abort', abort);
        this.active.delete(worker); worker.removeAllListeners(); worker.terminate().catch(() => {});
        resolve(mcpResult(payload));
      };
      const abort = () => finish(failure('CANCELLED'));
      const timer = setTimeout(() => finish(failure('TIMEOUT')), this.timeoutMs);
      signal?.addEventListener('abort', abort, { once: true });
      worker.once('message', payload => finish(outputValidators.get(name)(payload) ? payload : failure('INTERNAL_ERROR')));
      worker.once('error', () => finish(failure('INTERNAL_ERROR')));
      worker.once('exit', () => finish(failure('INTERNAL_ERROR')));
      if (signal?.aborted) abort();
    });
  }
  async close() {
    this.closed = true;
    const workers = [...this.active.keys()];
    for (const cancel of [...this.active.values()]) cancel();
    await Promise.all(workers.map(w => w.terminate()));
  }
}
module.exports = { definitions, executeTool, ToolRuntime, failure, mcpResult, MAX_RESULT_BYTES, wireBytes };
