#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  ROOT,
  VALID_MODES,
  agentFiles,
  fail,
  loadRegistry,
  parseFrontmatter,
  rel
} = require('./_release-utils');

const registry = loadRegistry();
const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
const usageDocs = [
  'docs/usage/agent-selection-guide.md',
  'docs/usage/handoff-map.md',
  'docs/usage/starter-prompts.md'
].map(file => fs.readFileSync(path.join(ROOT, file), 'utf8')).join('\n');

const messages = [];
const files = agentFiles();
const fileSlugs = files.map(file => path.basename(file, '.md'));
const registrySlugs = registry.agents.map(agent => agent.slug);
const slugSet = new Set(registrySlugs);

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function extractRoleFinishCheck(text) {
  const match = text.match(/### Role Finish Check\n([\s\S]*?)(?=\n### |\n## |$)/);
  return match ? match[1] : '';
}

if (registry.agent_count !== registry.agents.length) {
  messages.push(`registry agent_count ${registry.agent_count} does not match agents length ${registry.agents.length}`);
}
if (registry.agents.length !== files.length) {
  messages.push(`registry has ${registry.agents.length} agents but agents/ has ${files.length} markdown files`);
}
for (const slug of fileSlugs) {
  if (!slugSet.has(slug)) messages.push(`agent file missing from registry: agents/${slug}.md`);
}
for (const slug of registrySlugs) {
  if (!fileSlugs.includes(slug)) messages.push(`registry slug has no agent file: ${slug}`);
}
if (new Set(registrySlugs).size !== registrySlugs.length) messages.push('registry contains duplicate slugs');

const domainCounts = new Map();
for (const agent of registry.agents) {
  const promptPath = path.join(ROOT, agent.provenance && agent.provenance.prompt_file || '');
  domainCounts.set(agent.domain, (domainCounts.get(agent.domain) || 0) + 1);
  if (!agent.slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(agent.slug)) messages.push(`invalid slug: ${agent.slug}`);
  if (!fs.existsSync(promptPath)) messages.push(`${agent.slug} prompt_file does not exist: ${agent.provenance && agent.provenance.prompt_file}`);
  if (JSON.stringify(agent.output_modes) !== JSON.stringify(VALID_MODES)) messages.push(`${agent.slug} output_modes do not match canonical four modes`);
  for (const handoff of agent.handoffs || []) {
    if (!slugSet.has(handoff)) messages.push(`${agent.slug} has invalid handoff slug: ${handoff}`);
  }
  for (const field of ['display_name', 'domain', 'description', 'escalation_owner', 'role_boundaries', 'required_human_owner']) {
    if (!agent[field] || String(agent[field]).trim().length < 5) messages.push(`${agent.slug} missing registry field: ${field}`);
  }
  if (!agent.source_families || agent.source_families.length === 0) messages.push(`${agent.slug} has no source_families`);
  if (!agent.provenance || !agent.provenance.source_service_names || agent.provenance.source_service_names.length === 0) {
    messages.push(`${agent.slug} has no provenance.source_service_names`);
  }
  if (!agent.last_reviewed || !/^\d{4}-\d{2}-\d{2}$/.test(agent.last_reviewed.date || '')) {
    messages.push(`${agent.slug} last_reviewed.date is missing or not ISO yyyy-mm-dd`);
  }
  if (!usageDocs.includes(`\`${agent.slug}\``)) messages.push(`${agent.slug} is not referenced in usage docs`);
  if (fs.existsSync(promptPath)) {
    const promptText = fs.readFileSync(promptPath, 'utf8');
    const frontmatter = parseFrontmatter(promptText);
    if (frontmatter.name !== agent.slug) messages.push(`${agent.slug} frontmatter name mismatch in ${rel(promptPath)}`);
    if (frontmatter.display_name !== agent.display_name) messages.push(`${agent.slug} display_name mismatch between registry and prompt`);
    if (frontmatter.description !== agent.description) messages.push(`${agent.slug} description mismatch between registry and prompt`);
    if (promptText.includes('### Completion Criteria')) {
      messages.push(`${agent.slug} uses generic ### Completion Criteria; use role-specific ### Role Finish Check`);
    }
    const finishCheck = extractRoleFinishCheck(promptText);
    if (!finishCheck) {
      messages.push(`${agent.slug} is missing ### Role Finish Check`);
    } else {
      if (finishCheck.includes('Use these source families')) {
        messages.push(`${agent.slug} role finish check uses broad source families instead of concrete source names`);
      }
      const sourceNames = agent.provenance && agent.provenance.source_service_names || [];
      const normalizedFinishCheck = normalizeText(finishCheck);
      const hasConcreteSourceName = sourceNames.some(source => normalizedFinishCheck.includes(normalizeText(source)));
      if (sourceNames.length > 0 && !hasConcreteSourceName) {
        messages.push(`${agent.slug} role finish check omits concrete provenance source names`);
      }
    }
  }
}

if (domainCounts.size !== 10) messages.push(`registry has ${domainCounts.size} domains, expected 10`);
if (!readme.includes('51 specialist AI agents')) messages.push('README is missing the 51-agent product claim');
if (!readme.includes('10') || !readme.includes('administrative domains')) messages.push('README is missing the 10-domain product claim');

const summaryMatches = [...readme.matchAll(/<summary><strong>([^<]+)<\/strong> - (\d+) agents?<\/summary>/g)];
const summaryTotal = summaryMatches.reduce((sum, match) => sum + Number(match[2]), 0);
if (summaryMatches.length !== 10) messages.push(`README catalog has ${summaryMatches.length} domain summaries, expected 10`);
if (summaryTotal !== registry.agents.length) messages.push(`README catalog summaries total ${summaryTotal}, expected ${registry.agents.length}`);

fail(messages);
console.log(`registry consistency ok: ${registry.agents.length} agents, ${domainCounts.size} domains, ${summaryMatches.length} README domain summaries`);
