#!/usr/bin/env node
// Prepare an independent local marketplace. Activation belongs to the official Codex CLI.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const ROOT = fs.realpathSync(path.resolve(__dirname, '..'));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function run(command, args, cwd, logs, label) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 180000,
    maxBuffer: 8000000, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } });
  if (logs) {
    fs.writeFileSync(path.join(logs, label + '.stdout.log'), result.stdout || '');
    fs.writeFileSync(path.join(logs, label + '.stderr.log'), result.stderr || '');
  }
  if (result.error || result.status !== 0)
    throw new Error(label + ' failed: ' + (result.error ? result.error.message : result.stderr || 'exit ' + result.status));
  return result.stdout;
}
function options(argv) {
  const out = { bridge: false, offline: false, python: 'python3', name: 'healthcare-agents-posix-local' };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--stdio-bridge') out.bridge = true;
    else if (arg === '--offline') out.offline = true;
    else if (['--output', '--python', '--name'].includes(arg)) {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw new Error(arg + ' requires a value');
      out[{ '--output': 'output', '--python': 'python', '--name': 'name' }[arg]] = argv[++i];
    } else throw new Error('Unknown option: ' + arg);
  }
  if (!out.output) throw new Error('--output requires a new directory outside the package');
  if (!/^[a-z][a-z0-9-]{0,63}$/.test(out.name)) throw new Error('Invalid local marketplace name');
  if (!out.bridge && out.python !== 'python3') throw new Error('--python requires --stdio-bridge');
  return out;
}
function prepare(argv) {
  const opts = options(argv);
  const version = process.versions.node.split('.').map(Number);
  if (version[0] < 18 || (version[0] === 18 && (version[1] < 14 || (version[1] === 14 && version[2] < 1))))
    throw new Error('Node >=18.14.1 is required');
  const output = path.resolve(opts.output);
  const parent = fs.realpathSync(path.dirname(output));
  const destination = path.join(parent, path.basename(output));
  if (destination === ROOT || destination.startsWith(ROOT + path.sep))
    throw new Error('Output must be outside this package');
  try { fs.lstatSync(destination); throw new Error('Output already exists; choose a new directory'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }

  let python = null;
  if (opts.bridge) {
    if (process.platform === 'win32') throw new Error('The bridge profile requires POSIX; Windows is unqualified');
    const code = 'import json,os,sys; assert os.name=="posix" and sys.version_info>=(3,8); print(json.dumps({"executable":os.path.realpath(sys.executable),"version":sys.version.split()[0],"platform":sys.platform}))';
    try { python = JSON.parse(run(opts.python, ['-B', '-c', code], ROOT, null, 'existing Python preflight')); }
    catch { throw new Error('Bridge profile requires an existing POSIX Python >=3.8; no interpreter is installed automatically'); }
    if (!path.isAbsolute(python.executable)) throw new Error('Python preflight returned no absolute executable');
    fs.accessSync(python.executable, fs.constants.X_OK);
  }
  // Interpreter/tool preflights precede creation. Never edit Codex home/profile.
  run('npm', ['--version'], ROOT, null, 'existing npm preflight');
  fs.mkdirSync(destination, { mode: 0o700 });
  const logs = path.join(destination, 'logs'); fs.mkdirSync(logs);
  fs.mkdirSync(path.join(destination, 'pack'));
  fs.writeFileSync(path.join(destination, 'package.json'), '{"private":true}\n');
  const packed = JSON.parse(run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', path.join(destination, 'pack')], ROOT, logs, 'pack'))[0];
  if (!packed || path.basename(packed.filename) !== packed.filename || !Array.isArray(packed.files))
    throw new Error('Invalid npm pack receipt');
  const tarball = path.join(destination, 'pack', packed.filename);
  const args = ['install', '--ignore-scripts', '--no-audit', '--no-fund'];
  if (opts.offline) args.push('--offline');
  args.push('./pack/' + packed.filename);
  run('npm', args, destination, logs, 'install');
  const installed = path.join(destination, 'node_modules', 'healthcare-agents');
  const identity = {};
  for (const item of packed.files) {
    const file = path.resolve(installed, item.path);
    if (!file.startsWith(installed + path.sep)) throw new Error('Invalid package file path');
    identity[item.path] = sha(fs.readFileSync(file));
  }
  const changes = [];
  if (opts.bridge) {
    const manifestPath = path.join(installed, '.codex-plugin', 'plugin.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath));
    manifest.mcpServers = './.codex-plugin/mcp-stdio-bridge.json';
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    const configPath = path.join(installed, '.codex-plugin', 'mcp-stdio-bridge.json');
    const config = JSON.parse(fs.readFileSync(configPath));
    const server = config.mcpServers['healthcare-admin'];
    server.command = python.executable;
    server.args.push('--node', process.execPath);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
    for (const relative of ['.codex-plugin/plugin.json', '.codex-plugin/mcp-stdio-bridge.json']) {
      const after = sha(fs.readFileSync(path.join(installed, relative)));
      changes.push({ path: relative, source_sha256: identity[relative], staged_sha256: after });
      identity[relative] = after;
    }
  }
  const marketplaceDirectory = path.join(destination, '.agents', 'plugins');
  fs.mkdirSync(marketplaceDirectory, { recursive: true });
  fs.writeFileSync(path.join(marketplaceDirectory, 'marketplace.json'), JSON.stringify({
    name: opts.name, interface: { displayName: 'Healthcare Agents local ' + (opts.bridge ? 'POSIX bridge' : 'Node') },
    plugins: [{ name: 'healthcare-agents', source: { source: 'local', path: './node_modules/healthcare-agents' },
      policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' }, category: 'Productivity' }]
  }, null, 2) + '\n');
  const lock = JSON.parse(fs.readFileSync(path.join(destination, 'package-lock.json')));
  const receipt = {
    schema_version: 'healthcare-agents.codex-profile.v1',
    package_version: JSON.parse(fs.readFileSync(path.join(installed, 'package.json'))).version,
    marketplace_name: opts.name, plugin_id: 'healthcare-agents@' + opts.name,
    marketplace_root: destination, installed_root: installed,
    transport: opts.bridge ? 'python-anonymous-pipes' : 'portable-node',
    node: { executable: process.execPath, version: process.version }, python,
    offline: opts.offline, lifecycle_scripts_enabled: false,
    tarball_sha256: sha(fs.readFileSync(tarball)), source_package_files: packed.files.length,
    dependency_lock_sha256: sha(fs.readFileSync(path.join(destination, 'package-lock.json'))),
    installed_dependencies: Object.fromEntries(Object.entries(lock.packages || {}).filter(([p]) => p && p !== 'node_modules/healthcare-agents').map(([p, v]) => [p, v.version])),
    profile_changes: changes, staged_file_sha256: identity,
    codex_profile_written: false, plugin_activated: false, security_settings_changed: false,
    host_qualification: 'Bridge native acceptance is Ubuntu/Python3.12.3/Codex0.160 only; other hosts require their own acceptance.'
  };
  fs.writeFileSync(path.join(destination, 'STAGING-RECEIPT.json'), JSON.stringify(receipt, null, 2) + '\n');
  return receipt;
}
if (require.main === module) {
  try { const receipt = prepare(process.argv.slice(2)); console.log(JSON.stringify(receipt, null, 2)); }
  catch (error) { console.error('Healthcare Agents Codex preparation: ' + error.message); process.exitCode = 1; }
}
module.exports = { prepare };
