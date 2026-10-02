#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const Ajv = require('ajv');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { StreamableHTTPClientTransport } = require('@modelcontextprotocol/sdk/client/streamableHttp.js');
const { CallToolResultSchema } = require('@modelcontextprotocol/sdk/types.js');
const { ToolRuntime, definitions } = require('../lib/admin-tools');
const { startLocalHttp } = require('../lib/admin-mcp-http');
const root = path.resolve(__dirname, '..');
const fixture = id => JSON.parse(fs.readFileSync(path.join(root, 'examples/admin-v2', id + '.json')));
const custom = JSON.parse(fs.readFileSync(path.join(root, 'workflows/admin-v2/custom-example.json')));
const copy = x => JSON.parse(JSON.stringify(x));
const provenance = { origin: 'synthetic', as_of: '2026-10-02', description: 'Synthetic custom workflow fixture' };
let passed = 0;
async function check(name, fn) { await fn(); passed++; console.log('PASS ' + name); }
function payload(result) {
  assert.deepEqual(JSON.parse(result.content[0].text), result.structuredContent);
  assert.equal(result.isError, !result.structuredContent.ok);
  return result.structuredContent;
}
const scenarios = [
  ['investigate_denial_spike', 'denial-spike-workup', v => {
    assert.equal(v.baseline_rate, .10); assert.equal(v.current_rate, .18);
    assert.equal(v.percentage_point_change, 8); assert.equal(v.relative_change, .8);
    assert.equal(v.recoverable_dollars, null);
  }],
  ['model_access_capacity', 'ambulatory-access-backlog', v => assert.equal(v.weeks_to_clear_backlog, 5)],
  ['review_survey_evidence', 'survey-readiness-gap-review', v => {
    assert.equal(v.missing_evidence, 1); assert.equal(v.gaps[0].id, 'F1');
    assert.equal(v.finding_records[1].owner, 'Nursing'); assert.equal(Object.hasOwn(v, 'compliant'), false);
  }],
  ['prepare_appeal_evidence', 'prior-authorization-appeal-workup', v => {
    assert.equal(v.supplied_calendar_day_window, 30); assert.deepEqual(v.missing_documents, ['clinician statement']);
  }],
  ['review_payment_variance', 'payer-contract-underpayment-review', v => {
    assert.equal(v.net_variance, 150); assert.equal(v.positive_variance, 200); assert.equal(v.lines[1].variance, -50);
  }],
  ['summarize_discharge_barriers', 'discharge-barrier-workplan', v => {
    assert.equal(v.barrier_counts, 6); assert.equal(v.reported_avoidable_days, 13); assert.equal(Object.hasOwn(v, 'discharge_approved'), false);
  }]
];
async function exercise(client, label) {
  const call = (name, args) => client.callTool({ name, arguments: args });
  await check(label + ': eight strict schemas and accurate read-only annotations', async () => {
    const listed = await client.listTools(); assert.equal(listed.tools.length, 8);
    const ajv = new Ajv({ strict: true, allErrors: true });
    for (const tool of listed.tools) {
      assert.equal(tool.inputSchema.additionalProperties, false);
      assert.deepEqual(tool.annotations, { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false });
      ajv.compile(tool.inputSchema); ajv.compile(tool.outputSchema);
    }
    assert.equal(payload(await call('get_admin_workflows', {})).result.workflows.length, 6);
  });
  for (const [name, id, expected] of scenarios) {
    await check(label + ': real calculation ' + id, async () => {
      const input = fixture(id); const p = payload(await call(name, { case: input }));
      assert.equal(p.ok, true); expected(p.result.values);
      assert.equal(p.result.human_owner, input.human_owner); assert.deepEqual(p.result.evidence, input.evidence);
      assert.equal(p.result.status, 'draft_for_human_review'); assert.equal(p.result.external_actions_performed, false);
      assert.equal(p.result.input_sha256, crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex'));
    });
  }
  const bad = [
    ['unattributed', i => { i.evidence[0].fields.pop(); }],
    ['unknown data', i => { i.data.patient_name = 'synthetic marker must not appear in errors'; }],
    ['wrong workflow', i => { i.workflow_id = 'ambulatory-access-backlog'; }],
    ['mixed synthetic provenance', i => { i.evidence[0].origin = 'user_supplied'; }],
    ['invalid calendar date', i => { i.evidence[0].as_of = '2026-02-30'; }],
    ['over denominator', i => { i.data.current_denied = 1001; }],
    ['blank owner', i => { i.human_owner = ' '; }]
  ];
  for (const [description, mutate] of bad) {
    await check(label + ': refuses ' + description, async () => {
      const input = fixture('denial-spike-workup'); mutate(input);
      const p = payload(await call('investigate_denial_spike', { case: input }));
      assert.equal(p.error.code, 'CONTRACT_INVALID');
      assert.equal(JSON.stringify(p).includes('synthetic marker'), false);
    });
  }
  await check(label + ': runtime policy cannot be changed by model arguments', async () => {
    const input = fixture('denial-spike-workup'); input.data_mode = 'aggregate';
    for (const e of input.evidence) e.origin = 'user_supplied';
    assert.equal(payload(await call('investigate_denial_spike', { case: input })).error.code, 'MODE_NOT_ALLOWED');
    assert.equal(payload(await call('get_admin_workflows', { allowAggregate: true })).error.code, 'CONTRACT_INVALID');
  });
  await check(label + ': custom workflow bytes, provenance and hashes without writes', async () => {
    const p = payload(await call('draft_custom_workflow', { specification: custom, specification_provenance: provenance }));
    assert.equal(p.ok, true); assert.equal(p.result.human_owner, custom.human_owner);
    assert.deepEqual(p.result.specification_provenance, provenance);
    assert.deepEqual(Object.keys(p.result.files).sort(), ['CASE.template.json', 'SKILL.md', 'references/workflow.json']);
    for (const file of p.result.manifest.files) {
      assert.equal(file.sha256, crypto.createHash('sha256').update(p.result.files[file.path]).digest('hex'));
      assert.equal(file.bytes, Buffer.byteLength(p.result.files[file.path]));
    }
    assert.equal(JSON.parse(p.result.files['CASE.template.json']).inputs.community_scope.source, null);
    assert.equal(p.result.external_actions_performed, false);
  });
  await check(label + ': builder rejects absent provenance and impossible date', async () => {
    assert.equal(payload(await call('draft_custom_workflow', { specification: custom })).error.code, 'CONTRACT_INVALID');
    assert.equal(payload(await call('draft_custom_workflow', { specification: custom, specification_provenance: { ...provenance, as_of: '2026-02-30' } })).error.code, 'CONTRACT_INVALID');
  });
  await check(label + ': unknown tool is a protocol error', async () => {
    await assert.rejects(call('approve_discharge', {}), /Unknown administration tool/);
  });
}
async function main() {
  const stdio = new StdioClientTransport({ command: process.execPath, args: [path.join(root, 'bin/mcp-server.js'), '--stdio'], cwd: root, stderr: 'pipe' });
  let stderr = ''; stdio.stderr?.on('data', chunk => { stderr += chunk; });
  const client = new Client({ name: 'synthetic-acceptance', version: '1.0.0' }, { capabilities: {} });
  try {
    await client.connect(stdio); await exercise(client, 'stdio');
    await check('stdio: stdout contained only successfully parsed protocol messages', () => assert.equal(stderr, ''));
  } finally { await client.close(); }
  const local = await startLocalHttp(); const httpClient = new Client({ name: 'synthetic-http', version: '1.0.0' }, { capabilities: {} });
  const transport = new StreamableHTTPClientTransport(new URL(local.url));
  try {
    await httpClient.connect(transport); await exercise(httpClient, 'HTTP');
    await check('HTTP: loopback host and browser Origin validation', async () => {
      assert.equal((await fetch(local.url, { headers: { Origin: 'https://untrusted.example' } })).status, 403);
      const hostileHost = await new Promise((resolve, reject) => {
        const request = http.get(local.url, { headers: { Host: 'untrusted.example' } }, response => { response.resume(); resolve(response.statusCode); });
        request.on('error', reject);
      });
      assert.equal(hostileHost, 403);
      assert.equal((await fetch(local.url.replace('/mcp', '/other'))).status, 404);
      assert.equal((await fetch(local.url, { method: 'PUT' })).status, 405);
    });
    await check('HTTP: JSON and body size boundaries', async () => {
      assert.equal((await fetch(local.url, { method: 'POST', body: '{}' })).status, 415);
      assert.equal((await fetch(local.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })).status, 400);
      assert.equal((await fetch(local.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'x'.repeat(2 * 1024 * 1024 + 8192) })).status, 413);
    });
    await check('HTTP: explicit MCP cancellation terminates worker and releases capacity', async () => {
      const controller = new AbortController();
      const pending = httpClient.request({ method: 'tools/call', params: { name: 'get_admin_workflows', arguments: {} } }, CallToolResultSchema, { signal: controller.signal });
      for (let n = 0; n < 100 && local.runtime.active.size === 0; n++) await new Promise(r => setTimeout(r, 2));
      assert.equal(local.runtime.active.size, 1); controller.abort();
      await assert.rejects(pending, /abort/i);
      for (let n = 0; n < 100 && local.runtime.active.size !== 0; n++) await new Promise(r => setTimeout(r, 2));
      assert.equal(local.runtime.active.size, 0);
      assert.equal(payload(await httpClient.callTool({ name: 'get_admin_workflows', arguments: {} })).ok, true);
    });
    await check('HTTP: DELETE expires session and later calls cannot reuse it', async () => {
      assert.equal(local.sessions.size, 1); const id = transport.sessionId;
      await transport.terminateSession(); assert.equal(local.sessions.size, 0);
      assert.equal((await fetch(local.url, { headers: { 'mcp-session-id': id } })).status, 404);
    });
  } finally { await httpClient.close(); await local.close(); }
  const timeout = new ToolRuntime({ timeoutMs: 1 });
  try { await check('runtime: bounded deadline returns structured TIMEOUT', async () => assert.equal(payload(await timeout.call('get_admin_workflows', {})).error.code, 'TIMEOUT')); }
  finally { await timeout.close(); }
  const runtime = new ToolRuntime({ maxConcurrent: 1 });
  try {
    await check('runtime: capacity, explicit abort and shutdown release workers', async () => {
      const controller = new AbortController(); const pending = runtime.call('get_admin_workflows', {}, controller.signal);
      assert.equal(payload(await runtime.call('get_admin_workflows', {})).error.code, 'BUSY');
      controller.abort(); assert.equal(payload(await pending).error.code, 'CANCELLED'); assert.equal(runtime.active.size, 0);
      const duringClose = runtime.call('get_admin_workflows', {}); await runtime.close();
      assert.equal(payload(await duringClose).error.code, 'CANCELLED');
      assert.equal(payload(await runtime.call('get_admin_workflows', {})).error.code, 'CANCELLED');
    });
  } finally { await runtime.close(); }
  const aggregate = new ToolRuntime({ allowAggregate: true });
  try {
    await check('runtime: explicit owner configuration enables aggregate with retained provenance', async () => {
      const input = fixture('denial-spike-workup'); input.data_mode = 'aggregate';
      for (const e of input.evidence) e.origin = 'user_supplied';
      const p = payload(await aggregate.call('investigate_denial_spike', { case: input }));
      assert.equal(p.ok, true); assert.equal(p.result.data_mode, 'aggregate'); assert.deepEqual(p.result.evidence, input.evidence);
    });
    await check('runtime: input limit rejects before worker allocation', async () => {
      assert.equal(payload(await aggregate.call('get_admin_workflows', { oversized: 'x'.repeat(2 * 1024 * 1024) })).error.code, 'INPUT_TOO_LARGE');
      assert.equal(aggregate.active.size, 0);
    });
  } finally { await aggregate.close(); }
  const limited = await startLocalHttp({ maxSessions: 1 });
  const one = new Client({ name: 'session-capacity', version: '1' }, { capabilities: {} });
  try {
    await one.connect(new StreamableHTTPClientTransport(new URL(limited.url)));
    await check('HTTP: session capacity bounds additional initialization', async () => {
      const r = await fetch(limited.url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'second', version: '1' } } }) });
      assert.equal(r.status, 429);
    });
  } finally { await one.close(); await limited.close(); }
  console.log('Admin MCP: ' + passed + ' checks passed; official SDK client, synthetic data, no API calls');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
