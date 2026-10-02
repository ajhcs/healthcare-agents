const Ajv = require('ajv');
const registry = require('../agents/registry.json');
const workflows = require('../workflows/workflows.json').workflows;
const schema = {
  type: 'object', additionalProperties: false,
  properties: {
    schema_version: { const: 'healthcare-admin.selection.v1' },
    selected_by: { enum: ['user', 'host_agent'] },
    rationale: { type: 'string', minLength: 1, maxLength: 2000, pattern: '\\S' },
    workflow_ids: { type: 'array', minItems: 1, maxItems: 16, uniqueItems: true, items: { enum: workflows.map(w => w.id) } },
    agent_id: { enum: registry.agents.map(a => a.slug) }
  },
  required: ['schema_version', 'selected_by', 'rationale'],
  oneOf: [{ properties: { workflow_ids: {} }, required: ['workflow_ids'] }, { properties: { agent_id: {} }, required: ['agent_id'] }]
};
const valid = new Ajv({ strict: true }).compile(schema);
function validateSelection(value) {
  if (!valid(value)) throw new Error('Invalid selection contract');
  return JSON.parse(JSON.stringify(value));
}
function resolveSelection(problem, options = {}) {
  const supplied = [options.selection !== undefined, options.workflowIds !== undefined, options.agentId !== undefined, typeof problem === 'object' && problem !== null].filter(Boolean).length;
  if (supplied > 1) throw new Error('Select one authoritative routing input');
  if (options.selection !== undefined) return validateSelection(options.selection);
  if (typeof problem === 'object' && problem !== null) return validateSelection(problem);
  if (options.workflowIds !== undefined || options.agentId !== undefined) return validateSelection({
    schema_version: 'healthcare-admin.selection.v1', selected_by: 'user', rationale: 'Explicit validated identifier selection',
    ...(options.workflowIds !== undefined ? { workflow_ids: options.workflowIds } : { agent_id: options.agentId })
  });
  // An exact canonical identifier is an explicit selection, not a lexical inference.
  if (typeof problem === 'string' && workflows.some(w => w.id === problem.trim())) return resolveSelection('', { workflowIds: [problem.trim()] });
  return null;
}
module.exports = { selectionSchema: schema, validateSelection, resolveSelection };
