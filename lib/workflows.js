const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WORKFLOWS_PATH = path.join(ROOT, 'workflows', 'workflows.json');
const PLATFORMS_PATH = path.join(ROOT, 'platforms', 'platforms.json');
const SAFETY_PATH = path.join(ROOT, 'safety', 'snippets.json');
const REGISTRY_PATH = path.join(ROOT, 'agents', 'registry.json');
const {
  getEvidencePackForWorkflow,
  summarizeEvidencePack
} = require('./evidence-packs');
const {
  getCaseDataForWorkflow,
  formatCaseDataMarkdown
} = require('./operator-os/case-data-provider');
const {
  buildDenialSpikeGoldenArtifact
} = require('./operator-os/golden-artifacts');

const TARGET_ALIASES = {
  claude: 'claude',
  codex: 'codex',
  copilot: 'copilot',
  'github-copilot': 'copilot',
  'm365-copilot': 'm365_copilot',
  m365: 'm365_copilot',
  'm365_copilot': 'm365_copilot'
};

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'how',
  'i', 'in', 'is', 'it', 'of', 'on', 'or', 'our', 'the', 'to', 'with',
  'we', 'what', 'when', 'why', 'after', 'before', 'into', 'than', 'that',
  'this', 'need', 'needs', 'prepare'
]);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadWorkflowRegistry() {
  return readJson(WORKFLOWS_PATH);
}

function loadWorkflows() {
  return loadWorkflowRegistry().workflows;
}

function loadPlatforms() {
  return readJson(PLATFORMS_PATH).platforms;
}

function loadSafety() {
  return readJson(SAFETY_PATH);
}

function loadAgentRegistry() {
  return readJson(REGISTRY_PATH);
}

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function tokenize(value) {
  return normalize(value).split(/\s+/).filter(token => token.length > 2 && !STOP_WORDS.has(token));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function findWorkflow(id) {
  return loadWorkflows().find(workflow => workflow.id === id);
}

function validateWorkflowRegistry() {
  const messages = [];
  const registry = loadWorkflowRegistry();
  const workflows = registry.workflows || [];
  const agentSlugs = new Set(loadAgentRegistry().agents.map(agent => agent.slug));
  const safety = loadSafety();
  const safetyKeys = new Set(Object.keys(safety.snippets));
  const ids = new Set();

  if (registry.schema_version !== '1.0.0') messages.push('workflow registry schema_version must be 1.0.0');
  if (!Array.isArray(workflows) || workflows.length < 1) messages.push('workflow registry must include workflows');

  for (const workflow of workflows) {
    const prefix = workflow && workflow.id ? workflow.id : '<unknown>';
    for (const field of [
      'id', 'name', 'category', 'summary', 'triggers', 'primary_agent',
      'handoff_agents', 'required_inputs', 'red_flags', 'output_artifact',
      'artifact_sections', 'safety_constraints', 'platform_prompt_templates',
      'examples', 'canary_tests'
    ]) {
      if (workflow[field] == null || (Array.isArray(workflow[field]) && workflow[field].length === 0)) {
        messages.push(`${prefix}: missing required field ${field}`);
      }
    }
    if (ids.has(workflow.id)) messages.push(`${prefix}: duplicate workflow id`);
    ids.add(workflow.id);
    if (!agentSlugs.has(workflow.primary_agent)) messages.push(`${prefix}: unknown primary_agent ${workflow.primary_agent}`);
    for (const slug of workflow.handoff_agents || []) {
      if (!agentSlugs.has(slug)) messages.push(`${prefix}: unknown handoff_agent ${slug}`);
    }
    for (const key of workflow.safety_constraints || []) {
      if (!safetyKeys.has(key)) messages.push(`${prefix}: unknown safety constraint ${key}`);
    }
    for (const key of safety.required_in_generated_artifacts || []) {
      if (!(workflow.safety_constraints || []).includes(key)) messages.push(`${prefix}: missing required safety constraint ${key}`);
    }
    for (const target of ['claude', 'codex', 'copilot', 'm365_copilot']) {
      if (!workflow.platform_prompt_templates || !workflow.platform_prompt_templates[target]) {
        messages.push(`${prefix}: missing platform prompt template ${target}`);
      }
    }
    for (const item of [...(workflow.examples || []), ...(workflow.canary_tests || [])]) {
      if (item.expected_workflow !== workflow.id) messages.push(`${prefix}: example has mismatched expected_workflow`);
    }
  }

  return messages;
}

function validatePlatformRegistry() {
  const messages = [];
  const platforms = loadPlatforms();
  const ids = new Set();
  for (const platform of platforms) {
    for (const field of [
      'id', 'name', 'install_surface', 'export_surface', 'file_paths',
      'frontmatter_rules', 'instruction_limits', 'managed_block_strategy',
      'uninstall_strategy', 'test_strategy'
    ]) {
      if (platform[field] == null || (Array.isArray(platform[field]) && platform[field].length === 0)) {
        messages.push(`${platform.id || '<unknown>'}: missing platform field ${field}`);
      }
    }
    if (ids.has(platform.id)) messages.push(`${platform.id}: duplicate platform id`);
    ids.add(platform.id);
  }
  return messages;
}

function scoreWorkflow(workflow, problem) {
  const problemText = normalize(problem);
  const problemTokens = tokenize(problem);
  const tokenSet = new Set(problemTokens);
  const routeText = [
    workflow.id,
    workflow.name,
    workflow.category,
    workflow.summary,
    workflow.triggers.join(' '),
    workflow.required_inputs.join(' '),
    workflow.output_artifact,
    workflow.artifact_sections.join(' ')
  ].join(' ');
  const routeTokens = new Set(tokenize(routeText));
  let score = 0;
  for (const token of problemTokens) {
    if (routeTokens.has(token)) score += 5;
    for (const trigger of workflow.triggers) {
      const triggerText = normalize(trigger);
      if (triggerText.includes(token) || token.includes(triggerText)) score += 2;
    }
  }
  for (const trigger of workflow.triggers) {
    const triggerText = normalize(trigger);
    if (triggerText && problemText.includes(triggerText)) score += 28;
  }
  if (problemText.includes(normalize(workflow.name))) score += 35;
  if (problemText.includes(workflow.id.replace(/-/g, ' '))) score += 35;
  for (const antiTrigger of workflow.anti_triggers || []) {
    if (problemText.includes(normalize(antiTrigger))) score -= 20;
  }
  const requiredOverlap = workflow.required_inputs.filter(input => tokenize(input).some(token => tokenSet.has(token))).length;
  score += requiredOverlap * 3;
  return score;
}

function routeWorkflow(problem) {
  const ranked = loadWorkflows()
    .map(workflow => ({ workflow, score: scoreWorkflow(workflow, problem) }))
    .sort((a, b) => b.score - a.score || a.workflow.id.localeCompare(b.workflow.id));
  const best = ranked[0];
  const second = ranked[1];
  const confidence = Math.max(0.35, Math.min(0.97, (best.score + 20) / ((best.score + (second ? second.score : 0)) + 40)));
  return {
    workflow: best.workflow,
    confidence: Number(confidence.toFixed(2)),
    rationale: buildRationale(best.workflow, problem, best.score, second && second.workflow),
    ranked: ranked.slice(0, 5).map(item => ({ id: item.workflow.id, name: item.workflow.name, score: item.score }))
  };
}

function buildRationale(workflow, problem, score, second) {
  const problemText = normalize(problem);
  const matched = workflow.triggers.filter(trigger => problemText.includes(normalize(trigger))).slice(0, 4);
  const parts = [];
  if (matched.length) parts.push(`matched triggers: ${matched.join(', ')}`);
  parts.push(`primary specialist: ${workflow.primary_agent}`);
  parts.push(`artifact: ${workflow.output_artifact}`);
  if (second) parts.push(`next closest workflow: ${second.id}`);
  parts.push(`routing score: ${score}`);
  return parts.join('; ');
}

function inferMissingInputs(problem, workflow) {
  const problemText = normalize(problem);
  return workflow.required_inputs.filter(input => {
    const inputTokens = tokenize(input);
    return !inputTokens.some(token => problemText.includes(token));
  });
}

function buildDraftScaffold(workflow) {
  return workflow.artifact_sections.map(section => ({
    heading: section,
    prompt: `Add ${section.toLowerCase()} details using approved local evidence, assumptions, owner, and review status.`
  }));
}

function safetyText(keys) {
  const snippets = loadSafety().snippets;
  return keys.map(key => snippets[key]).filter(Boolean);
}

function normalizeTarget(target) {
  const key = String(target || 'codex').toLowerCase();
  return TARGET_ALIASES[key] || key;
}

function buildPlatformPrompts(workflow, problem) {
  const prompts = {};
  for (const [target, template] of Object.entries(workflow.platform_prompt_templates)) {
    prompts[target] = `${template}\n\nProblem: ${problem}\n\nReturn the ${workflow.output_artifact} with required context, missing inputs, handoffs, safety constraints, and a quality checklist.`;
  }
  return prompts;
}

function createWorkup(problem, options = {}) {
  const target = normalizeTarget(options.target || 'codex');
  const routed = routeWorkflow(problem);
  const workflow = routed.workflow;
  const requiredMissing = inferMissingInputs(problem, workflow);
  const safety = safetyText(workflow.safety_constraints);
  const platformPrompts = buildPlatformPrompts(workflow, problem);
  const workup = {
    problem,
    workflow: {
      id: workflow.id,
      name: workflow.name,
      confidence: routed.confidence,
      rationale: routed.rationale
    },
    roles: {
      primary: workflow.primary_agent,
      handoffs: workflow.handoff_agents
    },
    questions: {
      required: requiredMissing.map(input => `What is the ${input}?`),
      optional: workflow.optional_inputs.map(input => `Do you have ${input}?`)
    },
    immediate_triage_steps: workflow.artifact_sections.slice(0, 5).map(section => `Build the ${section.toLowerCase()} section from approved local evidence.`),
    evidence_to_collect: unique([...workflow.required_inputs, ...workflow.optional_inputs]).slice(0, 12),
    red_flags: workflow.red_flags,
    artifacts: {
      primary: workflow.output_artifact,
      sections: workflow.artifact_sections,
      draft_scaffold: buildDraftScaffold(workflow)
    },
    safety: {
      phi: loadSafety().snippets.no_phi_by_default,
      medical: loadSafety().snippets.no_medical_advice,
      governance: loadSafety().snippets.local_policy_review,
      escalation: loadSafety().snippets.escalate_required,
      constraints: safety
    },
    platform_prompts: platformPrompts,
    selected_platform_prompt: platformPrompts[target] || platformPrompts.codex,
    top_matches: routed.ranked
  };
  if (options.includeEvidencePack !== false) {
    const evidencePack = getEvidencePackForWorkflow(workflow.id);
    if (evidencePack) workup.evidence_pack = summarizeEvidencePack(evidencePack);
  }
  return workup;
}

async function createWorkupAsync(problem, options = {}) {
  const workup = createWorkup(problem, options);
  const caseData = getCaseDataForWorkflow(workup.workflow.id, problem, options);
  if (caseData && caseData.status !== 'not_requested') {
    workup.case_data = caseData;
  }
  return workup;
}

function formatWorkupMarkdown(workup) {
  const lines = [];
  lines.push(`# ${workup.workflow.name}`);
  lines.push('');
  lines.push(`Problem: ${workup.problem}`);
  lines.push(`Confidence: ${workup.workflow.confidence}`);
  lines.push(`Rationale: ${workup.workflow.rationale}`);
  lines.push('');
  lines.push('## Roles');
  lines.push(`- Primary: ${workup.roles.primary}`);
  lines.push(`- Handoffs: ${workup.roles.handoffs.join(', ') || 'None'}`);
  lines.push('');
  lines.push('## Missing Questions');
  for (const question of workup.questions.required) lines.push(`- ${question}`);
  if (!workup.questions.required.length) lines.push('- No required missing inputs detected from the prompt.');
  lines.push('');
  lines.push('## Evidence To Collect');
  for (const item of workup.evidence_to_collect) lines.push(`- ${item}`);
  lines.push('');
  if (workup.evidence_pack) {
    lines.push('## Evidence Pack');
    lines.push(`- ${workup.evidence_pack.title} v${workup.evidence_pack.version}`);
    lines.push(`- Last reviewed: ${workup.evidence_pack.last_reviewed}`);
    lines.push(`- Offline-first: ${workup.evidence_pack.offline_first ? 'yes' : 'no'}`);
    lines.push('- Citation cards:');
    for (const category of workup.evidence_pack.source_categories) {
      const cards = workup.evidence_pack.cards_by_category[category] || [];
      if (!cards.length) continue;
      lines.push(`  - ${category}: ${cards.map(card => card.title).join('; ')}`);
    }
    if (workup.evidence_pack.limitations.length) {
      lines.push('- Source limitation: some cards are source-family or local-policy lookup cards, not verified pinpoint citations.');
    }
    lines.push('');
  }
  if (workup.case_data) {
    lines.push(formatCaseDataMarkdown(workup.case_data));
    lines.push('');
  }
  if (workup.workflow.id === 'denial-spike-workup' && workup.case_data && workup.case_data.status === 'ok') {
    lines.push(buildDenialSpikeGoldenArtifact(workup));
    lines.push('');
  } else {
    lines.push(`## ${workup.artifacts.primary}`);
    for (const section of workup.artifacts.draft_scaffold) {
      lines.push(`### ${section.heading}`);
      lines.push(section.prompt);
      lines.push('');
    }
  }
  lines.push('## Red Flags');
  for (const flag of workup.red_flags) lines.push(`- ${flag}`);
  lines.push('');
  lines.push('## Safety');
  for (const item of workup.safety.constraints) lines.push(`- ${item}`);
  lines.push('');
  lines.push('## Platform Prompt');
  lines.push(workup.selected_platform_prompt);
  return lines.join('\n');
}

module.exports = {
  ROOT,
  WORKFLOWS_PATH,
  PLATFORMS_PATH,
  SAFETY_PATH,
  loadWorkflowRegistry,
  loadWorkflows,
  loadPlatforms,
  loadSafety,
  loadAgentRegistry,
  findWorkflow,
  validateWorkflowRegistry,
  validatePlatformRegistry,
  routeWorkflow,
  createWorkup,
  createWorkupAsync,
  formatWorkupMarkdown,
  normalizeTarget
};
