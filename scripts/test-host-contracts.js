#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { definitionsFor, dispatch, ToolRuntime } = require('../adapters/hosts/contracts');
const Ajv = require('ajv');
const root = path.resolve(__dirname, '..');
const input = JSON.parse(fs.readFileSync(path.join(root, 'examples/admin-v2/denial-spike-workup.json')));
input.data = { baseline_claims: 200, baseline_denied: 30, current_claims: 400, current_denied: 40, denied_dollars: 3000 };
input.evidence[0].fields = Object.keys(input.data);
const call = (target, name, args, id = 'synthetic-call-1') => {
  const wire = { payload_json: JSON.stringify(args) };
  return target === 'claude' ? { type: 'tool_use', id, name, input: wire }
    : target === 'azure' ? { type: 'function_call', call_id: id, name, arguments: JSON.stringify(wire) }
      : { type: 'function', id, function: { name, arguments: JSON.stringify(wire) } };
};
let passed = 0;
async function check(name, fn) { await fn(); passed++; console.log('PASS ' + name); }
async function main() {
  const runtime = new ToolRuntime();
  try {
    for (const target of ['claude', 'azure', 'databricks']) {
      await check(target + ': eight shallow host schemas; full local validation retained', () => {
        const tools = definitionsFor(target); assert.equal(tools.length, 8);
        for (const tool of tools) {
          const schema = tool.input_schema || tool.parameters || tool.function.parameters;
          assert.deepEqual(Object.keys(schema.properties), ['payload_json']);
          assert.equal(schema.additionalProperties, false); new Ajv({ strict: true }).compile(schema);
          assert.equal(JSON.stringify(schema).includes('pattern'), false);
        }
      });
      await check(target + ': actual CLI callback returns independent arithmetic and correlated ID', () => {
        const request = { target, call: call(target, 'investigate_denial_spike', { case: input }) };
        const r = spawnSync(process.execPath, [path.join(root, 'bin/host-tool-bridge.js')], { input: JSON.stringify(request), encoding: 'utf8', timeout: 15000 });
        assert.equal(r.status, 0, r.stderr); const result = JSON.parse(r.stdout);
        assert.equal(result.target, target); assert.equal(result.structured_content.ok, true);
        const values = result.structured_content.result.values;
        assert.equal(values.baseline_rate, .15); assert.equal(values.current_rate, .10); assert.equal(values.percentage_point_change, -5);
        assert.equal(values.relative_change, -.3333333333); assert.equal(values.recoverable_dollars, null);
        const response = result.tool_result; assert.equal(response.tool_use_id || response.call_id || response.tool_call_id, request.call.id || request.call.call_id);
        assert.deepEqual(JSON.parse(response.output || response.content), result.structured_content);
      });
      await check(target + ': malformed payload is structured, correlated and does not echo input', async () => {
        const c = call(target, 'get_admin_workflows', {}); const wire = { payload_json: '{sensitive-synthetic-marker' };
        if (target === 'claude') c.input = wire;
        else if (target === 'azure') c.arguments = JSON.stringify(wire);
        else c.function.arguments = JSON.stringify(wire);
        const result = await dispatch(target, c, runtime); assert.equal(result.structured_content.error.code, 'CONTRACT_INVALID');
        assert.equal(JSON.stringify(result).includes('sensitive-synthetic-marker'), false);
        if (target === 'claude') assert.equal(result.tool_result.is_error, true);
      });
      await check(target + ': full case contract rejects missing attribution', async () => {
        const bad = JSON.parse(JSON.stringify(input)); bad.evidence = [];
        const result = await dispatch(target, call(target, 'investigate_denial_spike', { case: bad }), runtime);
        assert.equal(result.structured_content.error.code, 'CONTRACT_INVALID');
      });
      await check(target + ': unknown tool cannot dispatch an action', async () => {
        const result = await dispatch(target, call(target, 'submit_appeal', {}), runtime);
        assert.equal(result.structured_content.error.code, 'CONTRACT_INVALID');
      });
      await check(target + ': AbortSignal propagates cancellation', async () => {
        const controller = new AbortController(); const pending = dispatch(target, call(target, 'get_admin_workflows', {}), runtime, controller.signal);
        controller.abort(); assert.equal((await pending).structured_content.error.code, 'CANCELLED');
      });
    }
    await check('host envelope refuses unknown metadata and target', async () => {
      await assert.rejects(dispatch('other', {}, runtime), /Invalid normalized host call/);
      await assert.rejects(dispatch('claude', { ...call('claude', 'get_admin_workflows', {}), auth: 'not-read' }, runtime), /Invalid normalized host call/);
    });
  } finally { await runtime.close(); }
  const python = spawnSync('python3', ['-c', "import sys;sys.path.insert(0,'adapters/python');from host_tools import tool_definitions,run_host_call,HostBridgeError;assert len(tool_definitions('azure'))==8;r=run_host_call('azure',{'type':'function_call','call_id':'python-test','name':'get_admin_workflows','arguments':'{\\\"payload_json\\\":\\\"{}\\\"}'});assert r['structured_content']['ok'];assert r['tool_result']['call_id']=='python-test';\ntry: tool_definitions('azure',timeout=.001)\nexcept HostBridgeError as e: assert 'deadline' in str(e)\nelse: raise AssertionError('expected timeout')"], { cwd: root, encoding: 'utf8', timeout: 15000, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } });
  await check('Python: actual local Node bridge, call correlation and subprocess deadline', () => assert.equal(python.status, 0, python.stderr));
  console.log('Host wrapper contracts: ' + passed + ' checks passed; SDK/tenant bindings untested, no provider API calls');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
