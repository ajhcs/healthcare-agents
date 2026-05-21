#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const RESULTS_PATH = path.join(ROOT, 'eval', 'results.tsv');
const REGISTRY_PATH = path.join(ROOT, 'agents', 'registry.json');
const OUT_DIR = path.join(ROOT, 'docs', 'eval');
const MD_PATH = path.join(OUT_DIR, 'scorecard.md');
const JSON_PATH = path.join(OUT_DIR, 'scorecard.json');

function parseTsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split('\t');
  return lines.filter(Boolean).map(line => {
    const cells = line.split('\t');
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] || '']));
  });
}

function numeric(value) {
  if (!value || value === 'N/A') return null;
  const parsed = Number(value.replace(/^\+/, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function latestRows(rows) {
  const byAgent = new Map();
  for (const row of rows) byAgent.set(row.agent, row);
  return byAgent;
}

function markdownTable(rows) {
  const lines = [
    '| Agent | Latest score | Improvement delta | Status | Notes |',
    '|---|---:|---:|---|---|'
  ];
  for (const row of rows) {
    lines.push([
      row.agent,
      row.latest_score == null ? 'N/A' : row.latest_score.toFixed(2),
      row.improvement_delta == null ? 'N/A' : (row.improvement_delta >= 0 ? '+' : '') + row.improvement_delta.toFixed(2),
      row.status,
      row.notes.replace(/\|/g, '\\|')
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
  }
  return lines.join('\n');
}

function main() {
  const rows = parseTsv(fs.readFileSync(RESULTS_PATH, 'utf8'));
  const latest = latestRows(rows);
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  const scoreRows = registry.agents.map(agent => {
    const row = latest.get(agent.slug);
    const pre = row ? numeric(row.score_pre_edit) : null;
    const post = row ? numeric(row.score_post_edit) : null;
    const delta = row ? numeric(row.delta) : null;
    return {
      agent: agent.slug,
      display_name: agent.display_name,
      domain: agent.domain,
      latest_score: post == null ? pre : post,
      improvement_delta: delta,
      status: row ? row.status : 'not evaluated',
      weak_areas: row ? row.weak_areas : '',
      notes: row ? row.description : 'No row found in eval/results.tsv.'
    };
  }).sort((a, b) => a.agent.localeCompare(b.agent));

  const evaluated = scoreRows.filter(row => row.latest_score != null);
  const average = evaluated.reduce((sum, row) => sum + row.latest_score, 0) / Math.max(evaluated.length, 1);
  const generated = new Date().toISOString().slice(0, 10);
  const markdown = [
    '# Healthcare Agents Eval Scorecard',
    '',
    'This scorecard reports internal prompt-rubric results from eval/results.tsv. These scores are not certification, accreditation, legal review, coding validation, billing approval, clinical validation, or compliance approval.',
    '',
    'Generated: ' + generated,
    'Agents in registry: ' + registry.agent_count,
    'Agents with eval rows: ' + evaluated.length,
    'Average latest score: ' + average.toFixed(2),
    '',
    markdownTable(scoreRows),
    '',
    '## Interpretation Limits',
    '',
    '- Scores are internal rubric results for prompt quality and task coverage.',
    '- Scores do not validate facts against current law, payer policy, code sets, contracts, or local operating procedures.',
    '- Human owners remain responsible for final clinical, legal, coding, billing, audit, compliance, contracting, employment, and executive decisions.',
    '- A high score does not make any agent or runtime appropriate for PHI unless used in an approved environment with minimum necessary controls.',
    ''
  ].join('\n');

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(MD_PATH, markdown);
  fs.writeFileSync(JSON_PATH, JSON.stringify({
    generated,
    source: 'eval/results.tsv',
    registry: 'agents/registry.json',
    disclaimer: 'Internal rubric results only; not certification or authority for healthcare decisions.',
    average_latest_score: Number(average.toFixed(2)),
    agents: scoreRows
  }, null, 2) + '\n');
  console.log('wrote ' + path.relative(ROOT, MD_PATH) + ' and ' + path.relative(ROOT, JSON_PATH));
}

main();
