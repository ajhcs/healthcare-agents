#!/usr/bin/env node
const { fail, loadRegistry } = require('./_release-utils');

const registry = loadRegistry();
const messages = [];
const now = process.env.SOURCE_FRESHNESS_TODAY
  ? new Date(process.env.SOURCE_FRESHNESS_TODAY + 'T00:00:00Z')
  : new Date();
const maxAgeDays = Number(process.env.SOURCE_FRESHNESS_MAX_DAYS || 180);
const warnAgeDays = Number(process.env.SOURCE_FRESHNESS_WARN_DAYS || 120);
const msPerDay = 24 * 60 * 60 * 1000;
let oldest = { slug: null, age: -1 };
let warningCount = 0;

for (const agent of registry.agents) {
  const dateText = agent.last_reviewed && agent.last_reviewed.date;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateText || '') ? new Date(dateText + 'T00:00:00Z') : null;
  if (!date || Number.isNaN(date.getTime())) {
    messages.push(`${agent.slug} has no valid last_reviewed.date`);
    continue;
  }
  const age = Math.floor((now - date) / msPerDay);
  if (age > oldest.age) oldest = { slug: agent.slug, age };
  if (age > maxAgeDays) messages.push(`${agent.slug} source review is stale: ${age} days old, max ${maxAgeDays}`);
  if (age > warnAgeDays) warningCount += 1;
  if (!agent.last_reviewed.basis || agent.last_reviewed.basis.length < 20) {
    messages.push(`${agent.slug} last_reviewed.basis is missing or too terse`);
  }
  if (!agent.source_families || agent.source_families.length === 0) messages.push(`${agent.slug} has no source_families`);
  if (!agent.regulatory_domains || agent.regulatory_domains.length === 0) messages.push(`${agent.slug} has no regulatory_domains`);
}

fail(messages);
console.log(`source freshness ok: oldest=${oldest.slug} ${oldest.age} days, warnings=${warningCount}, max=${maxAgeDays}`);
