const Ajv = require('ajv');
const { definitions, ToolRuntime, MAX_RESULT_BYTES, wireBytes, failure } = require('../../lib/admin-tools');
const object = properties => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const text = { type: 'string', minLength: 1, maxLength: 128, pattern: '\\S' };
const wireArguments = { type: 'object', properties: { payload_json: { type: 'string', description: 'Serialized JSON arguments matching the full Healthcare Agents tool contract. The local runtime validates evidence, dates, ownership and bounds.' } }, required: ['payload_json'], additionalProperties: false };
const wireValidator = new Ajv({ strict: true }).compile(wireArguments);
const validators = new Map(Object.entries({
  claude: object({ type: { const: 'tool_use' }, id: text, name: text, input: wireArguments }),
  azure: object({ type: { const: 'function_call' }, call_id: text, name: text, arguments: { type: 'string', maxLength: 2097152 } }),
  databricks: object({ id: text, type: { const: 'function' }, function: object({ name: text, arguments: { type: 'string', maxLength: 2097152 } }) })
}).map(([target, schema]) => [target, new Ajv({ strict: true }).compile(schema)]));
function definitionsFor(target) {
  if (!validators.has(target)) throw new Error('Unsupported host target');
  return definitions.map(tool => {
    const common = { name: tool.name, description: tool.description };
    if (target === 'claude') return { ...common, input_schema: wireArguments };
    if (target === 'azure') return { type: 'function', ...common, parameters: wireArguments, strict: true };
    return { type: 'function', function: { ...common, parameters: wireArguments } };
  });
}
function format(target, id, name, payload) {
  const content = JSON.stringify(payload);
  const toolResult = target === 'claude'
    ? { type: 'tool_result', tool_use_id: id, content, is_error: !payload.ok }
    : target === 'azure' ? { type: 'function_call_output', call_id: id, output: content }
      : { role: 'tool', tool_call_id: id, content };
  const result = { schema_version: 'healthcare-admin.host-result.v1', target, tool_name: name, tool_result: toolResult, structured_content: payload };
  return wireBytes(result) > MAX_RESULT_BYTES ? format(target, id, name, failure('OUTPUT_TOO_LARGE')) : result;
}
async function dispatch(target, call, runtime, signal) {
  const valid = validators.get(target);
  if (!valid || !valid(call)) throw new Error('Invalid normalized host call');
  const id = target === 'claude' ? call.id : target === 'azure' ? call.call_id : call.id;
  const name = target === 'databricks' ? call.function.name : call.name;
  let args;
  try {
    if (Buffer.byteLength(JSON.stringify(call)) > 2 * 1024 * 1024) throw new Error('Too large');
    const wire = target === 'claude' ? call.input : JSON.parse(target === 'azure' ? call.arguments : call.function.arguments);
    if (!wireValidator(wire)) throw new Error('Invalid wire arguments');
    if (Buffer.byteLength(wire.payload_json) > 2 * 1024 * 1024) throw new Error('Too large');
    args = JSON.parse(wire.payload_json);
  } catch {
    return format(target, id, name, { ok: false, error: { code: 'CONTRACT_INVALID', message: 'Host arguments must contain bounded payload_json matching the selected tool contract.', retryable: false } });
  }
  const result = await runtime.call(name, args, signal);
  return format(target, id, name, result.structuredContent);
}
module.exports = { definitionsFor, dispatch, ToolRuntime };
