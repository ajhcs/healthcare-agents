#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const Ajv2020 = require('ajv/dist/2020');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const root = path.resolve(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'healthcare-plugin-consumer-'));
let passed = 0;
async function check(name, fn) { await fn(); passed++; console.log('PASS ' + name); }
function execute(command, args, cwd) {
  const r = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 120000, maxBuffer: 2000000, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } });
  assert.equal(r.status, 0, command + ': ' + r.stderr + r.stdout); return r.stdout;
}
async function main() {
  try {
    const packed = JSON.parse(execute('npm', ['pack', '--json', '--pack-destination', tmp], root))[0];
    const project = path.join(tmp, 'consumer with spaces'); fs.mkdirSync(project);
    fs.writeFileSync(path.join(project, 'package.json'), '{"private":true}\n');
    execute('npm', ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', path.join(tmp, packed.filename)], project);
    const installed = path.join(project, 'node_modules/healthcare-agents');
    await check('plugin: current portable manifests validate against pinned official schemas', () => {
      for (const name of ['plugin', 'mcp']) {
        const validate = new Ajv2020({ strict: true }).compile(JSON.parse(fs.readFileSync(path.join(installed, 'docs/admin-v2/plugin-schemas', name + '.schema.json'))));
        assert.equal(validate(JSON.parse(fs.readFileSync(path.join(installed, name + '.json')))), true, JSON.stringify(validate.errors));
      }
      const manifest = JSON.parse(fs.readFileSync(path.join(installed, '.codex-plugin/plugin.json')));
      assert.equal(manifest.mcpServers, './.mcp.json'); assert.equal(manifest.version, require(path.join(installed, 'package.json')).version);
      assert.equal(fs.existsSync(path.join(installed, '.app.json')), false); // No invented app registration.
    });
    for (const filename of ['mcp.json', '.mcp.json']) {
      const config = JSON.parse(fs.readFileSync(path.join(installed, filename))).mcpServers['healthcare-admin'];
      const expand = value => value.replaceAll('${PLUGIN_ROOT}', installed);
      const transport = new StdioClientTransport({ command: config.command, args: config.args.map(expand), cwd: config.cwd ? expand(config.cwd) : installed, stderr: 'pipe' });
      const client = new Client({ name: 'installed-plugin-contract', version: '1' }, { capabilities: {} });
      try {
        await client.connect(transport);
        await check(filename + ': launcher works from fresh offline-installed consumer with spaces', async () => {
          assert.equal((await client.listTools()).tools.length, 8);
          assert.equal((await client.callTool({ name: 'get_admin_workflows', arguments: {} })).structuredContent.result.workflows.length, 6);
        });
        await check(filename + ': installed six tools produce independent review facts', async () => {
          const cases = [
            ['investigate_denial_spike', 'denial-spike-workup', { baseline_claims: 7, baseline_denied: 1, current_claims: 14, current_denied: 3, denied_dollars: 12.34 }, v => { assert.equal(v.percentage_point_change, 7.1428571429); assert.equal(v.recoverable_dollars, null); }],
            ['model_access_capacity', 'ambulatory-access-backlog', { weekly_requests: 31, weekly_slots: 29, backlog: 17, additional_weekly_slots: 8 }, v => assert.equal(v.weeks_to_clear_backlog, 3)],
            ['review_survey_evidence', 'survey-readiness-gap-review', { findings: [{ id: 'Z', standard_ref: 'Synthetic standard', evidence_present: true, owner: 'Nursing', due_date: '2028-02-29' }] }, v => { assert.equal(v.missing_evidence, 0); assert.equal(v.finding_records[0].owner, 'Nursing'); }],
            ['prepare_appeal_evidence', 'prior-authorization-appeal-workup', { decision_date: '2028-02-28', appeal_deadline: '2028-03-01', rule_reference: 'Synthetic notice', available_documents: [], required_documents: ['signed review'] }, v => { assert.equal(v.supplied_calendar_day_window, 2); assert.deepEqual(v.missing_documents, ['signed review']); }],
            ['review_payment_variance', 'payer-contract-underpayment-review', { lines: [{ id: 'A', expected: .29, paid: .11, currency: 'USD', contract_ref: 'Synthetic' }, { id: 'B', expected: .08, paid: .31, currency: 'USD', contract_ref: 'Synthetic' }] }, v => { assert.equal(v.net_variance, -.05); assert.equal(v.positive_variance, .18); }],
            ['summarize_discharge_barriers', 'discharge-barrier-workplan', { barriers: [{ category: 'transport', cases: 3, avoidable_days: 8, owner: 'Transport' }] }, v => { assert.equal(v.barrier_counts, 3); assert.equal(v.reported_avoidable_days, 8); }]
          ];
          for (const [name, id, data, expected] of cases) {
            const input = { schema_version: 'healthcare-admin.case.v2', workflow_id: id, data_mode: 'synthetic_only', human_owner: 'Synthetic consumer owner',
              evidence: [{ id: 'review', origin: 'synthetic', as_of: '2026-10-02', description: 'Independent synthetic consumer', fields: Object.keys(data) }], data };
            const result = (await client.callTool({ name, arguments: { case: input } })).structuredContent;
            assert.equal(result.ok, true); expected(result.result.values);
            assert.equal(result.result.external_actions_performed, false);
          }
        });
        await check(filename + ': installed builder and provenance rejection', async () => {
          const specification = JSON.parse(fs.readFileSync(path.join(installed, 'workflows/admin-v2/custom-example.json')));
          const result = (await client.callTool({ name: 'draft_custom_workflow', arguments: { specification, specification_provenance: { origin: 'synthetic', as_of: '2026-10-02', description: 'Synthetic consumer specification' } } })).structuredContent;
          assert.equal(result.ok, true); assert.equal(result.result.manifest.files.length, 3);
          assert.equal((await client.callTool({ name: 'draft_custom_workflow', arguments: { specification } })).structuredContent.error.code, 'CONTRACT_INVALID');
        });
      } finally { await client.close(); }
    }
    console.log('Plugin clean consumer: ' + passed + ' checks passed; actual local SDK launch, no marketplace/native plugin activation claim');
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
