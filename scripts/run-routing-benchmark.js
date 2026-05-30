#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT, fail, readJson, runRequired } = require('./_release-utils');

const benchmark = readJson(path.join(ROOT, 'docs', 'eval', 'routing-benchmark.json'));
const registry = readJson(path.join(ROOT, 'agents', 'registry.json'));
const messages = [];
const slugs = new Set(registry.agents.map(agent => agent.slug));
const covered = new Set();
const failures = [];
const confusion = new Map();
let top1 = 0;
let top3 = 0;
let reciprocalSum = 0;

for (const testCase of benchmark.cases) {
  if (!slugs.has(testCase.expected_agent)) messages.push(`${testCase.id} expected unknown agent ${testCase.expected_agent}`);
  covered.add(testCase.expected_agent);
  const output = runRequired('node', ['bin/cli.js', 'choose', testCase.prompt, '--json']).stdout;
  const result = JSON.parse(output);
  const rank = result.top_matches.findIndex(match => match.slug === testCase.expected_agent) + 1;
  if (rank === 1) top1 += 1;
  if (rank > 0 && rank <= 3) top3 += 1;
  reciprocalSum += rank > 0 ? 1 / rank : 0;
  if (rank !== 1) {
    failures.push({ id: testCase.id, expected: testCase.expected_agent, actual: result.primary_agent, rank: rank || null });
    const key = `${testCase.expected_domain} -> ${result.top_matches[0].domain}`;
    confusion.set(key, (confusion.get(key) || 0) + 1);
  }
}

for (const slug of slugs) {
  if (!covered.has(slug)) messages.push(`routing benchmark has no case for ${slug}`);
}

const count = benchmark.cases.length || 1;
const metrics = {
  cases: benchmark.cases.length,
  top1_accuracy: Number((top1 / count).toFixed(4)),
  top3_accuracy: Number((top3 / count).toFixed(4)),
  mrr: Number((reciprocalSum / count).toFixed(4)),
  confusion_pairs: [...confusion.entries()].map(([pair, cases]) => ({ pair, cases })),
  failures
};

const minimums = benchmark.minimums || {};
if (metrics.top1_accuracy < minimums.top1_accuracy) messages.push(`top1_accuracy ${metrics.top1_accuracy} below threshold ${minimums.top1_accuracy}`);
if (metrics.top3_accuracy < minimums.top3_accuracy) messages.push(`top3_accuracy ${metrics.top3_accuracy} below threshold ${minimums.top3_accuracy}`);
if (metrics.mrr < minimums.mrr) messages.push(`mrr ${metrics.mrr} below threshold ${minimums.mrr}`);

console.log(JSON.stringify(metrics, null, 2));
fail(messages);
