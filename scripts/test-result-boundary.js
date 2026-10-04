#!/usr/bin/env node
const assert = require('node:assert/strict');
const path = require('path');
const { spawnSync } = require('child_process');
const { ToolRuntime, MAX_RESULT_BYTES } = require('../lib/admin-tools');
const root = path.resolve(__dirname, '..');
const makeCase = rows => ({ schema_version: 'healthcare-admin.case.v2', workflow_id: 'survey-readiness-gap-review', data_mode: 'synthetic_only',
  human_owner: 'Synthetic boundary reviewer', evidence: [{ id: 'proof', origin: 'synthetic', as_of: '2026-10-02', description: 'Invented independent large-result case', fields: ['findings'] }],
  data: { findings: Array.from({ length: rows }, (_,i) => ({ id: 'boundary-' + i, standard_ref: 's'.repeat(1900), evidence_present: false, owner: 'o'.repeat(1900), due_date: '2028-02-29' })) } });
const normalize = (target, input) => {
  const wire = { payload_json: JSON.stringify({ case: input }) };
  return target === 'claude' ? { type: 'tool_use', id: 'boundary-id', name: 'review_survey_evidence', input: wire }
    : target === 'azure' ? { type: 'function_call', call_id: 'boundary-id', name: 'review_survey_evidence', arguments: JSON.stringify(wire) }
      : { type: 'function', id: 'boundary-id', function: { name: 'review_survey_evidence', arguments: JSON.stringify(wire) } };
};
let passed = 0;
async function check(name, fn) { await fn(); passed++; console.log('PASS ' + name); }
async function main() {
  const runtime = new ToolRuntime();
  try {
    for (const [rows, expected] of [[100, true], [200, false]]) {
      await check('MCP complete envelope boundary at ' + rows + ' rows', async () => {
        const result = await runtime.call('review_survey_evidence', { case: makeCase(rows) });
        assert.equal(result.structuredContent.ok, expected);
        assert.ok(Buffer.byteLength(JSON.stringify(result)) + 1 <= MAX_RESULT_BYTES);
        assert.deepEqual(JSON.parse(result.content[0].text), result.structuredContent);
        if (expected) assert.equal(result.structuredContent.result.values.finding_records.length, rows);
        else { assert.equal(result.structuredContent.error.code, 'OUTPUT_TOO_LARGE'); assert.equal(result.isError, true); }
      });
      for (const target of ['claude', 'azure', 'databricks']) {
        await check(target + ' complete Node/Python envelopes at ' + rows + ' rows', () => {
          const request = { target, call: normalize(target, makeCase(rows)) };
          assert.ok(Buffer.byteLength(JSON.stringify(request)) < MAX_RESULT_BYTES);
          const direct = spawnSync(process.execPath, [path.join(root, 'bin/host-tool-bridge.js')], { input: JSON.stringify(request), encoding: 'utf8', maxBuffer: 3 * MAX_RESULT_BYTES, timeout: 15000 });
          assert.equal(direct.status, 0, direct.stderr); assert.ok(Buffer.byteLength(direct.stdout) <= MAX_RESULT_BYTES);
          const parsed = JSON.parse(direct.stdout);
          assert.equal(parsed.structured_content.ok, expected);
          assert.equal(parsed.tool_result.tool_use_id || parsed.tool_result.call_id || parsed.tool_result.tool_call_id, 'boundary-id');
          if (!expected) assert.equal(parsed.structured_content.error.code, 'OUTPUT_TOO_LARGE');
          const python = spawnSync('python3', ['-c', "import sys,json;sys.path.insert(0,'adapters/python');from host_tools import run_host_call;r=json.load(sys.stdin);print(json.dumps(run_host_call(r['target'],r['call'])))"], {
            cwd: root, input: JSON.stringify(request), encoding: 'utf8', maxBuffer: 3 * MAX_RESULT_BYTES, timeout: 15000, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } });
          assert.equal(python.status, 0, python.stderr);
          const viaPython = JSON.parse(python.stdout); assert.deepEqual(viaPython, parsed);
          if (target === 'claude') assert.equal(viaPython.tool_result.is_error, !expected);
        });
      }
    }
  } finally { await runtime.close(); }
  console.log('Complete result boundary: ' + passed + ' checks passed; valid small results or correlated typed OUTPUT_TOO_LARGE');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
