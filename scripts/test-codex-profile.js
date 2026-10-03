#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const root = fs.realpathSync(path.resolve(__dirname, '..'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hag-codex-profile-'));
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const profile = path.join(os.homedir(), '.codex', 'config.toml');
const before = fs.existsSync(profile) ? sha(profile) : null;
const defaults = Object.fromEntries(['.codex-plugin/plugin.json', '.mcp.json', 'mcp.json', 'plugin.json'].map(p => [p, sha(path.join(root, p))]));
let passed = 0;
function check(name, fn) { fn(); passed++; console.log('PASS ' + name); }
function stage(args, success = true, source = root) {
  const p = spawnSync(process.execPath, [path.join(source, 'scripts/stage-codex-plugin.js'), ...args], {
    cwd: source, encoding: 'utf8', timeout: 180000, maxBuffer: 8000000, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' }
  });
  assert.equal(p.error, undefined);
  if (!success) { assert.notEqual(p.status, 0); return p.stderr; }
  assert.equal(p.status, 0, p.stderr); return JSON.parse(p.stdout);
}
async function sdk(receipt, common = false) {
  const manifest = JSON.parse(fs.readFileSync(path.join(receipt.installed_root, '.codex-plugin/plugin.json')));
  const config = JSON.parse(fs.readFileSync(path.join(receipt.installed_root, common ? 'mcp.json' : manifest.mcpServers))).mcpServers['healthcare-admin'];
  const expand = s => s.replaceAll('$' + '{PLUGIN_ROOT}', receipt.installed_root);
  const client = new Client({ name: 'clean-codex-profile', version: '1' }, { capabilities: {} });
  const transport = new StdioClientTransport({ command: config.command, args: config.args.map(expand), cwd: config.cwd ? expand(config.cwd) : receipt.installed_root, stderr: 'pipe' });
  try {
    await client.connect(transport);
    assert.equal((await client.listTools()).tools.length, 8);
    assert.equal((await client.callTool({ name: 'get_admin_workflows', arguments: {} })).structuredContent.result.workflows.length, 6);
    const input = JSON.parse(fs.readFileSync(path.join(receipt.installed_root, 'examples/admin-v2/denial-spike-workup.json')));
    assert.equal((await client.callTool({ name: 'investigate_denial_spike', arguments: { case: input } })).structuredContent.result.values.percentage_point_change, 8);
    input.evidence = [];
    assert.equal((await client.callTool({ name: 'investigate_denial_spike', arguments: { case: input } })).structuredContent.error.code, 'CONTRACT_INVALID');
  } finally { await client.close(); }
}
async function main() {
  try {
    check('missing Python fails before creating an output', () => {
      const out = path.join(tmp, 'no-python');
      assert.match(stage(['--stdio-bridge', '--python', path.join(tmp, 'unavailable-python'), '--output', out], false), /existing POSIX Python/);
      assert.equal(fs.existsSync(out), false);
    });
    check('existing directory is preserved', () => {
      const out = path.join(tmp, 'existing'); fs.mkdirSync(out); fs.writeFileSync(path.join(out, 'owner'), 'keep');
      assert.match(stage(['--stdio-bridge', '--output', out], false), /already exists/);
      assert.equal(fs.readFileSync(path.join(out, 'owner'), 'utf8'), 'keep');
    });
    check('broken output symlink is preserved', () => {
      const out = path.join(tmp, 'existing-link'); fs.symlinkSync(path.join(tmp, 'missing-target'), out);
      assert.match(stage(['--stdio-bridge', '--output', out], false), /already exists/);
      assert.equal(fs.lstatSync(out).isSymbolicLink(), true);
    });
    check('package tree cannot be used as output', () => {
      assert.match(stage(['--stdio-bridge', '--output', path.join(root, 'invalid-profile-output')], false), /outside this package/);
      assert.equal(fs.existsSync(path.join(root, 'invalid-profile-output')), false);
    });
    check('unknown flags and invalid marketplace names are rejected', () => {
      assert.match(stage(['--security-off', '--output', path.join(tmp, 'invalid')], false), /Unknown option/);
      assert.match(stage(['--name', 'invalid/name', '--output', path.join(tmp, 'invalid')], false), /marketplace name/);
    });
    const bridge = stage(['--stdio-bridge', '--offline', '--output', path.join(tmp, 'bridge profile with spaces'), '--name', 'healthcare-agents-profile-test']);
    check('fresh bridge profile has two synchronized MCP changes and resolved executables', () => {
      assert.equal(bridge.transport, 'python-anonymous-pipes'); assert.equal(bridge.offline, true);
      assert.equal(bridge.profile_changes.length, 2); assert.equal(bridge.lifecycle_scripts_enabled, false);
      assert.equal(bridge.primary_mcp_schema_valid, true);
      assert.equal(bridge.dependency_lock_sha256, sha(path.join(bridge.marketplace_root, 'package-lock.json')));
      assert.equal(bridge.installed_dependencies['node_modules/@modelcontextprotocol/sdk'], '1.31.0');
      assert.equal(path.isAbsolute(bridge.python.executable), true);
      const manifest = JSON.parse(fs.readFileSync(path.join(bridge.installed_root, '.codex-plugin/plugin.json')));
      assert.equal(manifest.mcpServers, './.mcp.json');
      const config = JSON.parse(fs.readFileSync(path.join(bridge.installed_root, manifest.mcpServers))).mcpServers['healthcare-admin'];
      assert.equal(config.command, bridge.python.executable);
      assert.deepEqual(config.args, ['-B', path.join(bridge.installed_root, 'bin/mcp-stdio-bridge.py'), '--node', process.execPath]);
    });
    check('every staged package file matches its recorded bytes', () => {
      for (const [p, hash] of Object.entries(bridge.staged_file_sha256)) assert.equal(sha(path.join(bridge.installed_root, p)), hash);
    });
    await sdk(bridge); await sdk(bridge, true); passed++; console.log('PASS declared bridge profile: eight tools, six catalog workflows, +8pp and typed rejection');
    const portable = stage(['--offline', '--output', path.join(tmp, 'portable'), '--name', 'healthcare-agents-portable-test']);
    check('portable profile retains Node and requires no Python preflight', () => {
      assert.equal(portable.transport, 'portable-node'); assert.equal(portable.python, null);
      assert.equal(portable.profile_changes.length, 2);
      assert.equal(portable.primary_mcp_schema_valid, true);
      const server = JSON.parse(fs.readFileSync(path.join(portable.installed_root, '.mcp.json'))).mcpServers['healthcare-admin'];
      assert.deepEqual(server, { command: process.execPath, args: [path.join(portable.installed_root, 'bin/mcp-server.js'), '--stdio'] });
      assert.equal(JSON.parse(fs.readFileSync(path.join(portable.installed_root, '.codex-plugin/plugin.json'))).mcpServers, './.mcp.json');
    });
    await sdk(portable); await sdk(portable, true); passed++; console.log('PASS portable profile official SDK (native sandbox compatibility not claimed)');
    const reset = stage(['--offline', '--output', path.join(tmp, 'bridge to portable'), '--name', 'healthcare-agents-reset-test'], true, bridge.installed_root);
    assert.equal(reset.transport, 'portable-node'); assert.equal(reset.python, null);
    assert.equal(reset.profile_changes.length, 2);
    const resetServer = JSON.parse(fs.readFileSync(path.join(reset.installed_root, '.mcp.json'))).mcpServers['healthcare-admin'];
    assert.deepEqual(resetServer, { command: process.execPath, args: [path.join(reset.installed_root, 'bin/mcp-server.js'), '--stdio'] });
    await sdk(reset); await sdk(reset, true); passed++; console.log('PASS restaged bridge to portable removes Python selection and launches Node');
    const renewed = stage(['--stdio-bridge', '--offline', '--output', path.join(tmp, 'bridge to bridge'), '--name', 'healthcare-agents-renewed-test'], true, bridge.installed_root);
    const renewedConfig = JSON.parse(fs.readFileSync(path.join(renewed.installed_root, '.mcp.json'))).mcpServers['healthcare-admin'];
    assert.deepEqual(renewedConfig.args, ['-B', path.join(renewed.installed_root, 'bin/mcp-stdio-bridge.py'), '--node', process.execPath]);
    await sdk(renewed); await sdk(renewed, true); passed++; console.log('PASS restaged bridge replaces paths and never accumulates node arguments');
    check('source defaults and normal Codex profile remain byte-identical', () => {
      for (const [p, hash] of Object.entries(defaults)) assert.equal(sha(path.join(root, p)), hash);
      assert.equal(fs.existsSync(profile) ? sha(profile) : null, before);
      assert.equal(bridge.codex_profile_written, false); assert.equal(bridge.plugin_activated, false);
    });
    console.log(JSON.stringify({ checks: passed, network_calls: 0, model_calls: 0, native_activation: 'separate campaign' }));
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
