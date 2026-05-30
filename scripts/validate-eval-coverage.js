#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT, fail, readJson } = require('./_release-utils');

const RESULTS_PATH = path.join(ROOT, 'eval', 'results.tsv');
const REGISTRY_PATH = path.join(ROOT, 'agents', 'registry.json');
const STRICT = process.env.REQUIRE_FULL_EVAL_COVERAGE === '1' || process.argv.includes('--strict');
const HEADERS = [
  'iteration',
  'agent',
  'score_pre_edit',
  'score_post_edit',
  'delta',
  'status',
  'weak_areas',
  'description'
];
const VALID_STATUS = new Set(['improved', 'evaluated', 'reverted', 'capped']);

function parseTsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const headers = lines.shift().split('\t');
  const rows = lines.map((line, index) => {
    const cells = line.split('\t');
    return {
      line: index + 2,
      raw: line,
      cells,
      data: Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex] || '']))
    };
  });
  return { headers, rows };
}

function numeric(value) {
  if (value === 'N/A') return null;
  const parsed = Number(String(value || '').replace(/^\+/, ''));
  return Number.isFinite(parsed) ? parsed : NaN;
}

function formatCount(label, count) {
  return String(count).padStart(2, ' ') + ' ' + label;
}

const registry = readJson(REGISTRY_PATH);
const registrySlugs = new Set((registry.agents || []).map(agent => agent.slug));
const messages = [];
const warnings = [];

const { headers, rows } = parseTsv(fs.readFileSync(RESULTS_PATH, 'utf8'));
if (JSON.stringify(headers) !== JSON.stringify(HEADERS)) {
  messages.push(`eval/results.tsv header mismatch. Expected: ${HEADERS.join('\t')}`);
}

const latest = new Map();
for (const row of rows) {
  const data = row.data;
  if (row.cells.length !== HEADERS.length) {
    messages.push(`line ${row.line}: expected ${HEADERS.length} tab-separated fields, found ${row.cells.length}`);
  }
  if (!/^\d+$/.test(data.iteration || '')) messages.push(`line ${row.line}: iteration must be a positive integer`);
  if (!registrySlugs.has(data.agent)) messages.push(`line ${row.line}: unknown agent slug: ${data.agent}`);
  if (!VALID_STATUS.has(data.status)) messages.push(`line ${row.line}: invalid status: ${data.status}`);
  if (!data.weak_areas || !data.description) messages.push(`line ${row.line}: weak_areas and description are required`);

  const pre = numeric(data.score_pre_edit);
  const post = numeric(data.score_post_edit);
  const delta = numeric(data.delta);
  if (!Number.isFinite(pre)) messages.push(`line ${row.line}: score_pre_edit must be numeric`);
  if (Number.isNaN(post)) messages.push(`line ${row.line}: score_post_edit must be numeric or N/A`);
  if (Number.isNaN(delta)) messages.push(`line ${row.line}: delta must be numeric, signed numeric, or N/A`);
  if (data.status === 'capped' && (data.score_post_edit !== 'N/A' || data.delta !== 'N/A')) {
    messages.push(`line ${row.line}: capped rows must use N/A for score_post_edit and delta`);
  }
  const revertedOmitsPost = data.score_post_edit === 'N/A';
  const revertedOmitsDelta = data.delta === 'N/A';
  if (data.status === 'reverted' && revertedOmitsPost !== revertedOmitsDelta) {
    messages.push(`line ${row.line}: reverted rows must either provide both score_post_edit and delta or use N/A for both`);
  }
  if (!['capped', 'reverted'].includes(data.status) && (data.score_post_edit === 'N/A' || data.delta === 'N/A')) {
    messages.push(`line ${row.line}: only capped or reverted rows may omit post-edit score and delta`);
  }
  latest.set(data.agent, data);
}

const missing = (registry.agents || []).filter(agent => !latest.has(agent.slug)).map(agent => agent.slug);
const latestRows = (registry.agents || []).map(agent => latest.get(agent.slug)).filter(Boolean);
const statusCounts = latestRows.reduce((counts, row) => {
  counts[row.status] = (counts[row.status] || 0) + 1;
  return counts;
}, {});
const cappedLatest = latestRows.filter(row => row.status === 'capped').map(row => row.agent);
const latestScores = latestRows
  .map(row => numeric(row.score_post_edit) ?? numeric(row.score_pre_edit))
  .filter(Number.isFinite);
const averageLatest = latestScores.reduce((sum, score) => sum + score, 0) / Math.max(latestScores.length, 1);

if (missing.length) {
  const message = `missing latest eval rows for ${missing.length} registry agents: ${missing.join(', ')}`;
  if (STRICT) messages.push(message);
  else warnings.push(message);
}
if (cappedLatest.length) {
  const message = `latest capped rows require resolution before strict release coverage: ${cappedLatest.join(', ')}`;
  if (STRICT) messages.push(message);
  else warnings.push(message);
}
if (STRICT && latestRows.length !== registry.agent_count) {
  messages.push(`strict coverage expected ${registry.agent_count} latest rows, found ${latestRows.length}`);
}

for (const warning of warnings) console.warn('warning: ' + warning);
fail(messages);

console.log([
  'eval coverage ok',
  `mode: ${STRICT ? 'strict' : 'report'}`,
  `agents: ${latestRows.length}/${registry.agent_count}`,
  formatCount('improved', statusCounts.improved || 0),
  formatCount('evaluated', statusCounts.evaluated || 0),
  formatCount('reverted', statusCounts.reverted || 0),
  formatCount('capped', statusCounts.capped || 0),
  `average_latest_score: ${averageLatest.toFixed(2)}`
].join('\n'));
