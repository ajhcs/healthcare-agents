const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'agents', 'registry.json');
const AGENTS_DIR = path.join(ROOT, 'agents');
const VALID_MODES = ['quick triage', 'workplan', 'audit/checklist', 'artifact/template'];

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadRegistry() {
  return readJson(REGISTRY_PATH);
}

function agentFiles() {
  return fs.readdirSync(AGENTS_DIR)
    .filter(name => name.endsWith('.md'))
    .sort()
    .map(name => path.join(AGENTS_DIR, name));
}

function parseFrontmatter(text) {
  if (!text.startsWith('---\n')) return {};
  const end = text.indexOf('\n---\n', 4);
  if (end === -1) return {};
  const yaml = text.slice(4, end).split(/\r?\n/);
  const data = {};
  for (const line of yaml) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    data[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
  return data;
}

function fail(messages) {
  if (!messages.length) return;
  console.error(messages.map(message => 'error: ' + message).join('\n'));
  process.exit(1);
}

function run(command, args, options = {}) {
  return childProcess.spawnSync(command, args, {
    cwd: options.cwd || ROOT,
    env: { ...process.env, ...(options.env || {}) },
    encoding: 'utf8',
    shell: false,
    maxBuffer: options.maxBuffer || 1024 * 1024 * 20
  });
}

function runRequired(command, args, options = {}) {
  const result = run(command, args, options);
  if (result.status !== 0) {
    process.stderr.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    throw new Error(`${command} ${args.join(' ')} exited ${result.status}`);
  }
  return result;
}

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

module.exports = {
  ROOT,
  REGISTRY_PATH,
  AGENTS_DIR,
  VALID_MODES,
  rel,
  readJson,
  loadRegistry,
  agentFiles,
  parseFrontmatter,
  fail,
  run,
  runRequired,
  normalize
};
