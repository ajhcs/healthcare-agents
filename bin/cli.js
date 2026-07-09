#!/usr/bin/env node
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'agents', 'registry.json');
const AGENTS_DIR = path.join(ROOT, 'agents');
const {
  loadWorkflows,
  findWorkflow,
  createWorkup,
  createWorkupAsync,
  formatWorkupMarkdown,
  normalizeTarget
} = require('../lib/workflows');
const {
  listEvidencePacks,
  getEvidencePackForWorkflow,
  formatEvidencePackMarkdown
} = require('../lib/evidence-packs');
const { buildEvidencePack } = require('../scripts/scaffold-evidence-pack');
const renderers = require('../lib/renderers');
const VALID_MODES = ['quick triage', 'workplan', 'audit/checklist', 'artifact/template'];

const TOOL_ORDER = [
  'claude',
  'codex',
  'claude-skills',
  'opencode',
  'agent-skills',
  'gemini',
  'cursor',
  'windsurf',
  'copilot',
  'cline',
  'amazonq',
  'aider',
  'continue'
];

const TOOL_CONFIG = {
  claude: { display: 'Claude Code', rel: '.claude/agents', home: true, type: 'files' },
  codex: { display: 'Codex / Codex App', rel: '.codex/agents', home: true, type: 'files' },
  gemini: { display: 'Gemini CLI', rel: '.gemini/agents', home: true, type: 'files' },
  cursor: { display: 'Cursor', rel: '.cursor/rules', home: false, type: 'files' },
  windsurf: { display: 'Windsurf', rel: '.windsurf/rules', home: false, type: 'files' },
  copilot: { display: 'GitHub Copilot', rel: '.github/instructions', home: false, type: 'files' },
  cline: { display: 'Cline', rel: '.clinerules', home: false, type: 'files' },
  amazonq: { display: 'Amazon Q', rel: '.amazonq/rules', home: false, type: 'files' },
  aider: { display: 'Aider', rel: '.aider.conf.yml', home: false, type: 'aider' },
  continue: { display: 'Continue.dev', rel: '.continue', home: false, type: 'files' },
  'claude-skills': { display: 'Claude Skills', rel: '.claude/skills', home: true, type: 'skills' },
  opencode: { display: 'OpenCode Skills', rel: '.config/opencode/skills', home: true, type: 'skills' },
  'agent-skills': { display: 'Open Agent Skills', rel: '.agents/skills', home: true, type: 'skills' }
};

function loadRegistry() {
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
}

function printHelp() {
  console.log(`Healthcare Agents -- 51 AI agents for healthcare administration

Usage:
  healthcare-agents list [--domain <name>] [--json]
  healthcare-agents show <agent> [--json]
  healthcare-agents choose "<problem>" [--json]
  healthcare-agents workflows [--json]
  healthcare-agents workflow <workflow-id> [--json]
  healthcare-agents operator-os coverage [--json]
  healthcare-agents evidence-pack list [--json]
  healthcare-agents evidence-pack show <workflow-id|pack-id> [--json]
  healthcare-agents evidence-pack scaffold <workflow-id>
  healthcare-agents workup "<problem>" [--target codex|claude|copilot|m365-copilot] [--data-mode <mode>] [--json]
  healthcare-agents export <platform> <workflow-id> [--output <dir>]
  healthcare-agents prompt <agent> --mode <mode>
  healthcare-agents doctor [--json]
  healthcare-agents install [agent] [target/options]
  healthcare-agents uninstall [target/options]

Installer targets:
  --claude, --claude-code, --codex, --codex-app, --opencode,
  --cursor, --copilot, --gemini, --windsurf, --cline,
  --amazonq, --aider, --continue, --agent-skills, --skills, --all
  --claude-workflow-skills, --codex-skills, --copilot-all
  --copilot-repo, --copilot-instructions, --copilot-agents,
  --copilot-prompts, --copilot-issue-templates

Installer options:
  --path <dir>  Install to a custom directory
  --force       Overwrite existing files
  --dry-run     Show exact planned writes

Output modes:
  quick triage | workplan | audit/checklist | artifact/template

Data modes:
  prompt_only | public_evidence | synthetic_only | hybrid_synthetic_public | public_search | internal_private
  Hyphenated aliases are accepted, for example public-evidence.

Examples:
  healthcare-agents list --domain revenue
  healthcare-agents show revenue-cycle-specialist
  healthcare-agents choose "clean claim rate dropped after an EHR update"
  healthcare-agents operator-os coverage
  healthcare-agents evidence-pack show denial-spike-workup
  healthcare-agents evidence-pack scaffold clean-claim-rate-decline
  healthcare-agents workup "Commercial payer denial rate jumped 18 percent" --target codex
  healthcare-agents export m365-declarative-agent denial-spike-workup
  healthcare-agents prompt quality-compliance-officer --mode audit/checklist
  healthcare-agents install revenue-cycle-specialist --codex --dry-run`);
}

function hasFlag(args, flag) {
  return args.includes(flag);
}

function readOption(args, name) {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) return undefined;
  return value;
}

function requireOptionValue(args, name, context) {
  const value = readOption(args, name);
  if (value !== undefined) return value;
  console.error(`error: ${context} requires ${name} <value>`);
  process.exit(2);
}

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function tokens(value) {
  const stop = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'how',
    'i', 'in', 'is', 'it', 'of', 'on', 'or', 'our', 'the', 'to', 'with',
    'we', 'what', 'when', 'why'
  ]);
  return normalize(value).split(/\s+/).filter(token => token.length > 2 && !stop.has(token));
}

function findAgent(registry, value) {
  const wanted = normalize(value).replace(/\s+/g, '-');
  return registry.agents.find(agent => {
    return agent.slug === wanted || normalize(agent.display_name).replace(/\s+/g, '-') === wanted;
  });
}

function levenshtein(a, b) {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j += 1) rows[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return rows[a.length][b.length];
}

function suggestions(registry, value) {
  const wanted = normalize(value).replace(/\s+/g, '-');
  const wantedTokens = tokens(value);
  return registry.agents
    .map(agent => {
      const slugTokens = agent.slug.split('-');
      let score = Math.min(levenshtein(wanted, agent.slug), levenshtein(wanted, normalize(agent.display_name).replace(/\s+/g, '-')));
      for (const token of wantedTokens) {
        if (agent.slug.includes(token)) score -= 12;
        if (slugTokens.some(slugToken => slugToken.startsWith(token) || token.startsWith(slugToken))) score -= 8;
      }
      return { slug: agent.slug, score };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map(item => item.slug);
}

function failUnknownAgent(registry, value) {
  const near = suggestions(registry, value);
  console.error(`error: unknown agent: ${value}`);
  if (near.length) console.error(`did you mean: ${near.join(', ')}`);
  process.exit(1);
}

function formatTable(rows, columns) {
  const widths = columns.map(column => Math.max(
    column.header.length,
    ...rows.map(row => String(row[column.key] == null ? '' : row[column.key]).length)
  ));
  const header = columns.map((column, i) => column.header.padEnd(widths[i])).join('  ');
  const line = widths.map(width => '-'.repeat(width)).join('  ');
  const body = rows.map(row => columns.map((column, i) => String(row[column.key] == null ? '' : row[column.key]).padEnd(widths[i])).join('  '));
  return [header, line, ...body].join('\n');
}

function listAgents(args) {
  const registry = loadRegistry();
  const domain = hasFlag(args, '--domain') ? requireOptionValue(args, '--domain', 'list') : undefined;
  let agents = registry.agents;
  if (domain) {
    const needle = normalize(domain);
    agents = agents.filter(agent => normalize(agent.domain).includes(needle));
  }
  if (hasFlag(args, '--json')) {
    console.log(JSON.stringify({ count: agents.length, agents }, null, 2));
    return;
  }
  const rows = agents.map(agent => ({
    slug: agent.slug,
    domain: agent.domain,
    description: agent.description.length > 86 ? agent.description.slice(0, 83) + '...' : agent.description
  }));
  console.log(formatTable(rows, [
    { key: 'slug', header: 'Agent' },
    { key: 'domain', header: 'Domain' },
    { key: 'description', header: 'Description' }
  ]));
}

function showAgent(args) {
  const registry = loadRegistry();
  const slug = args[0];
  if (!slug) {
    console.error('error: show requires an agent slug');
    process.exit(1);
  }
  const agent = findAgent(registry, slug);
  if (!agent) failUnknownAgent(registry, slug);
  if (hasFlag(args, '--json')) {
    console.log(JSON.stringify(agent, null, 2));
    return;
  }
  console.log(`${agent.display_name} (${agent.slug})`);
  console.log(`Domain: ${agent.domain}`);
  console.log(`Description: ${agent.description}`);
  console.log(`Output modes: ${agent.output_modes.join(', ')}`);
  console.log(`Common tasks: ${agent.common_tasks.join('; ')}`);
  console.log(`Handoffs: ${agent.handoffs.length ? agent.handoffs.join(', ') : 'None listed'}`);
  console.log(`Escalation owner: ${agent.escalation_owner}`);
  console.log(`Source families: ${agent.source_families.join('; ')}`);
  console.log(`Regulatory domains: ${agent.regulatory_domains.join('; ')}`);
  console.log(`Last reviewed: ${agent.last_reviewed.date} -- ${agent.last_reviewed.basis}`);
  console.log(`Role boundaries: ${agent.role_boundaries}`);
}

function modeFor(problem) {
  const text = normalize(problem);
  if (/audit|checklist|evidence|survey|tracer|hipaa|compliance|risk|readiness/.test(text)) return 'audit/checklist';
  if (/template|draft|letter|appeal|packet|policy|script|matrix|report/.test(text)) return 'artifact/template';
  if (/plan|implement|project|roadmap|workflow|redesign|launch|rollout/.test(text)) return 'workplan';
  return 'quick triage';
}

function inferMissingInputs(problem, agent) {
  const text = normalize(problem);
  const missing = [];
  if (!/hospital|clinic|ambulatory|payer|plan|snf|home health|aco|health system|practice|pharmacy/.test(text)) {
    missing.push('care setting or organization type');
  }
  if (!/\b\d{4}\b|last|current|month|quarter|week|day|fy|cy|since|from|through/.test(text)) {
    missing.push('time period and baseline/comparison window');
  }
  if (!/data|report|dashboard|sample|file|log|denial|claim|measure|contract|policy|event|case/.test(text)) {
    missing.push('available evidence, data sources, or example records');
  }
  if (!/owner|sign.?off|approve|decision|deadline|due|board|committee|cfo|coo|legal|compliance/.test(text)) {
    missing.push('decision owner, deadline, and escalation threshold');
  }
  const domain = agent.domain.toLowerCase();
  if (domain.includes('revenue') && !/payer|carc|rarc|cpt|hcpcs|icd|claim|denial|835|837|contract/.test(text)) {
    missing.push('payer/product, service line, claim sample, and denial or payment reason codes');
  }
  if (domain.includes('health it') && !/system|ehr|interface|hl7|fhir|x12|log|environment|version/.test(text)) {
    missing.push('system names, environment, standards involved, logs/errors, and change history');
  }
  if (domain.includes('quality') && !/standard|measure|event|policy|survey|source|case|incident/.test(text)) {
    missing.push('applicable standard, event facts, policy source, and evidence location');
  }
  if (domain.includes('clinical') && !/criteria|patient|case|status|discharge|authorization|physician|medical necessity/.test(text)) {
    missing.push('clinical-administrative criteria, responsible clinician, and case facts stripped to minimum necessary');
  }
  return [...new Set(missing)].slice(0, 6);
}

function scoreAgent(agent, problemTokens, problemText) {
  const routeText = [
    agent.slug,
    agent.display_name,
    agent.domain,
    agent.description,
    agent.common_tasks.join(' '),
    agent.source_families.join(' '),
    agent.regulatory_domains.join(' ')
  ].join(' ');
  const hayTokens = new Set(tokens(routeText));
  let score = 0;
  for (const token of problemTokens) if (hayTokens.has(token)) score += 4;
  if (problemText.includes(normalize(agent.display_name))) score += 30;
  if (problemText.includes(agent.slug.replace(/-/g, ' '))) score += 30;
  for (const task of agent.common_tasks) {
    const taskTokens = tokens(task);
    const overlap = taskTokens.filter(token => problemTokens.includes(token)).length;
    score += overlap * 2;
    if (overlap >= 3) score += 10;
  }
  return score;
}

function chooseAgent(args) {
  const registry = loadRegistry();
  const json = hasFlag(args, '--json');
  const problem = args.filter(arg => arg !== '--json').join(' ').trim();
  if (!problem) {
    console.error('error: choose requires a problem description');
    process.exit(1);
  }
  const problemTokens = tokens(problem);
  const problemText = normalize(problem);
  const ranked = registry.agents
    .map(agent => ({ agent, score: scoreAgent(agent, problemTokens, problemText) }))
    .sort((a, b) => b.score - a.score);
  const primary = ranked[0].agent;
  const mode = modeFor(problem);
  const supporting = primary.handoffs.length
    ? primary.handoffs.slice(0, 3)
    : ranked.slice(1, 4).map(item => item.agent.slug);
  const result = {
    problem,
    primary_agent: primary.slug,
    primary_display_name: primary.display_name,
    recommended_output_mode: mode,
    confidence: ranked[0].score > 30 ? 'high' : ranked[0].score > 12 ? 'medium' : 'low',
    top_matches: ranked.slice(0, 5).map(item => ({
      slug: item.agent.slug,
      display_name: item.agent.display_name,
      domain: item.agent.domain,
      score: item.score
    })),
    missing_inputs: inferMissingInputs(problem, primary),
    supporting_agents: supporting,
    human_escalation_owner: primary.escalation_owner,
    role_boundaries: primary.role_boundaries,
    starter_prompt: buildStarterPrompt(primary, mode, problem, supporting)
  };
  if (json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  console.log(`Primary agent: ${result.primary_agent} (${result.primary_display_name})`);
  console.log(`Recommended mode: ${result.recommended_output_mode}`);
  console.log(`Confidence: ${result.confidence}`);
  console.log(`Missing inputs: ${result.missing_inputs.join('; ') || 'None detected'}`);
  console.log(`Supporting agents: ${result.supporting_agents.join(', ') || 'None'}`);
  console.log(`Human escalation owner: ${result.human_escalation_owner}`);
  console.log('\nStarter prompt:');
  console.log(result.starter_prompt);
}

function buildStarterPrompt(agent, mode, problem, supporting) {
  const handoffText = supporting.length ? ` Name supporting handoffs to ${supporting.join(', ')} where the work crosses role boundaries.` : '';
  return `Use the ${agent.slug} healthcare administration agent in ${mode} mode. Problem: ${problem}. Lead with the decision or artifact; state assumptions, immediate risks, and the human owner, and ask only blocking questions. For multi-step work, keep a compact ledger of verified facts and sources, documents, actions, owners, deadlines, discrepancies, and blockers; finish as Completed, Partial, or Blocked with terminal evidence and the next action. Use PHI only in an approved environment with minimum necessary handling. Do not make final clinical, legal, coding, billing, audit, compliance, contracting, employment, or executive decisions. Role boundary: ${agent.role_boundaries}${handoffText}`;
}

function promptAgent(args) {
  const registry = loadRegistry();
  const slug = args[0];
  if (!slug) {
    console.error('error: prompt requires an agent slug');
    process.exit(1);
  }
  const agent = findAgent(registry, slug);
  if (!agent) failUnknownAgent(registry, slug);
  const mode = requireOptionValue(args, '--mode', 'prompt');
  if (!VALID_MODES.includes(mode)) {
    console.error(`error: invalid mode: ${mode}`);
    console.error(`valid modes: ${VALID_MODES.join(', ')}`);
    process.exit(1);
  }
  console.log(buildStarterPrompt(agent, mode, '[describe the healthcare administration problem, setting, data, constraints, and deadline]', agent.handoffs.slice(0, 3)));
}

function argsWithoutOptions(args, optionsWithValues = []) {
  const output = [];
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      if (optionsWithValues.includes(arg)) i += 1;
      continue;
    }
    output.push(arg);
  }
  return output;
}

function listWorkflows(args) {
  const workflows = loadWorkflows();
  if (hasFlag(args, '--json')) {
    console.log(JSON.stringify({ count: workflows.length, workflows }, null, 2));
    return;
  }
  const rows = workflows.map(workflow => ({
    id: workflow.id,
    category: workflow.category,
    primary: workflow.primary_agent,
    artifact: workflow.output_artifact
  }));
  console.log(formatTable(rows, [
    { key: 'id', header: 'Workflow' },
    { key: 'category', header: 'Category' },
    { key: 'primary', header: 'Primary agent' },
    { key: 'artifact', header: 'Artifact' }
  ]));
}

function showWorkflow(args) {
  const id = args[0];
  if (!id) {
    console.error('error: workflow requires a workflow id');
    process.exit(1);
  }
  const workflow = findWorkflow(id);
  if (!workflow) {
    console.error('error: unknown workflow: ' + id);
    process.exit(1);
  }
  if (hasFlag(args, '--json')) {
    console.log(JSON.stringify(workflow, null, 2));
    return;
  }
  console.log(workflow.name + ' (' + workflow.id + ')');
  console.log('Category: ' + workflow.category);
  console.log('Summary: ' + workflow.summary);
  console.log('Primary agent: ' + workflow.primary_agent);
  console.log('Handoffs: ' + (workflow.handoff_agents.join(', ') || 'None'));
  console.log('Output artifact: ' + workflow.output_artifact);
  console.log('Required inputs: ' + workflow.required_inputs.join('; '));
  console.log('Red flags: ' + workflow.red_flags.join('; '));
}

function evidencePackCommand(args) {
  const subcommand = args[0];
  const json = hasFlag(args, '--json');
  if (subcommand === 'list') {
    const packs = listEvidencePacks().map(pack => ({
      id: pack.id,
      workflow_id: pack.workflow_id,
      version: pack.version,
      status: pack.status,
      last_reviewed: pack.last_reviewed
    }));
    if (json) {
      console.log(JSON.stringify({ count: packs.length, packs }, null, 2));
      return;
    }
    console.log(formatTable(packs, [
      { key: 'workflow_id', header: 'Workflow' },
      { key: 'id', header: 'Pack' },
      { key: 'version', header: 'Version' },
      { key: 'status', header: 'Status' },
      { key: 'last_reviewed', header: 'Last reviewed' }
    ]));
    return;
  }
  if (subcommand === 'show') {
    const id = args.find(arg => !arg.startsWith('--') && arg !== 'show');
    if (!id) {
      console.error('error: evidence-pack show requires a workflow id or pack id');
      process.exit(2);
    }
    const pack = getEvidencePackForWorkflow(id);
    if (!pack) {
      const available = listEvidencePacks().map(item => item.workflow_id).join(', ');
      console.error('error: unknown evidence pack: ' + id);
      console.error('available workflow ids: ' + (available || 'none'));
      process.exit(1);
    }
    if (json) {
      console.log(JSON.stringify(pack, null, 2));
      return;
    }
    console.log(formatEvidencePackMarkdown(pack));
    return;
  }
  if (subcommand === 'scaffold') {
    const id = args.find(arg => !arg.startsWith('--') && arg !== 'scaffold');
    if (!id) {
      console.error('error: evidence-pack scaffold requires a workflow id');
      process.exit(2);
    }
    const workflow = findWorkflow(id);
    if (!workflow) {
      console.error('error: unknown workflow: ' + id);
      process.exit(1);
    }
    console.log(JSON.stringify(buildEvidencePack(workflow), null, 2));
    return;
  }
  console.error('error: evidence-pack requires list, show, or scaffold');
  process.exit(2);
}

function operatorOsCommand(args) {
  const subcommand = args[0];
  const json = hasFlag(args, '--json');
  if (subcommand !== 'coverage') {
    console.error('error: operator-os requires coverage');
    process.exit(2);
  }
  const coverage = JSON.parse(fs.readFileSync(path.join(ROOT, 'workflows', 'operator-os-coverage.json'), 'utf8'));
  if (json) {
    console.log(JSON.stringify(coverage, null, 2));
    return;
  }
  const rows = coverage.workflows.map(item => ({
    workflow: item.workflow_id,
    status: item.operator_os_status,
    pack: item.evidence_pack_id || '',
    fixture: item.case_fixture_status,
    golden: item.golden_artifact_status,
    reviewer: item.domain_reviewer,
    wave: item.priority_wave
  }));
  console.log(formatTable(rows, [
    { key: 'workflow', header: 'Workflow' },
    { key: 'status', header: 'Status' },
    { key: 'wave', header: 'Wave' },
    { key: 'fixture', header: 'Fixture' },
    { key: 'golden', header: 'Golden' },
    { key: 'reviewer', header: 'Reviewer' }
  ]));
}

async function workupCommand(args) {
  const json = hasFlag(args, '--json');
  const target = normalizeTarget(readOption(args, '--target') || 'codex');
  const dataMode = readOption(args, '--data-mode');
  const problem = argsWithoutOptions(args, ['--target', '--data-mode']).filter(arg => arg !== '--json' && arg !== '--markdown').join(' ').trim();
  if (!problem) {
    console.error('error: workup requires a healthcare administration problem description');
    process.exit(1);
  }
  let workup;
  try {
    workup = dataMode
      ? await createWorkupAsync(problem, { target, dataMode })
      : createWorkup(problem, { target });
  } catch (e) {
    console.error('error: ' + e.message);
    process.exit(2);
  }
  if (json) {
    console.log(JSON.stringify(workup, null, 2));
    return;
  }
  console.log(formatWorkupMarkdown(workup));
}

const COPILOT_PATH_GROUPS = [
  {
    slug: 'healthcare-revenue-cycle',
    title: 'Healthcare Revenue Cycle Instructions',
    applyTo: '**/{revenue,claims,billing,denials,contracts}/**',
    description: 'Apply revenue cycle, claims, denial, payer contract, and payment review workflow standards.'
  },
  {
    slug: 'healthcare-compliance',
    title: 'Healthcare Compliance Instructions',
    applyTo: '**/{compliance,privacy,security,audit,policies}/**',
    description: 'Apply HIPAA, compliance evidence, audit readiness, privacy, and security review standards.'
  },
  {
    slug: 'healthcare-quality-safety',
    title: 'Healthcare Quality and Safety Instructions',
    applyTo: '**/{quality,safety,hedis,stars,survey}/**',
    description: 'Apply quality improvement, patient safety, accreditation, HEDIS, Stars, and survey readiness standards.'
  },
  {
    slug: 'healthcare-analytics',
    title: 'Healthcare Analytics Instructions',
    applyTo: '**/{analytics,dashboards,metrics,bi,reports}/**',
    description: 'Apply dashboard specification, metric definition, validation, and data governance standards.'
  },
  {
    slug: 'healthcare-operations',
    title: 'Healthcare Operations Instructions',
    applyTo: '**/{operations,access,capacity,discharge,emergency}/**',
    description: 'Apply healthcare operations, access, capacity, discharge, and emergency preparedness workflow standards.'
  }
];

const COPILOT_AGENTS = [
  ['healthcare-revenue-cycle-agent', 'Healthcare Revenue Cycle Agent', 'Revenue cycle workups for denials, clean claims, payment variance, and AR exposure.', ['Revenue cycle administration only', 'No coding-of-record, billing-authority, or legal final decisions']],
  ['healthcare-compliance-agent', 'Healthcare Compliance Agent', 'HIPAA, audit evidence, policy, survey, and compliance checklist workups.', ['Compliance decision support only', 'No final legal, breach, audit, or regulator-response authority']],
  ['healthcare-quality-safety-agent', 'Healthcare Quality and Safety Agent', 'Quality improvement, survey readiness, HEDIS/Stars, and RCA2 planning workups.', ['Quality and safety administration only', 'No diagnosis, treatment, blame assignment, or final clinical judgment']],
  ['healthcare-operations-agent', 'Healthcare Operations Agent', 'Hospital, ambulatory, discharge, capacity, and emergency preparedness operations workups.', ['Operational planning only', 'No emergency medical guidance or live incident command authority']],
  ['healthcare-data-analytics-agent', 'Healthcare Data Analytics Agent', 'Dashboard, metric, data validation, and healthcare analytics specification workups.', ['Analytics specification only', 'No unapproved PHI disclosure or source-of-truth override']],
  ['healthcare-it-integration-agent', 'Healthcare IT Integration Agent', 'HL7, FHIR, interface incident, and health IT workflow triage.', ['Health IT administration only', 'No production changes without local change control or security review']],
  ['healthcare-payer-contracting-agent', 'Healthcare Payer Contracting Agent', 'Payer contract, underpayment, PBM, and negotiation evidence workups.', ['Contracting support only', 'No final legal, finance, or contracting authority']],
  ['healthcare-workup-orchestrator-agent', 'Healthcare Workup Orchestrator Agent', 'Routes messy healthcare administration problems into the right workflow and specialist handoffs.', ['Orchestration and triage only', 'Do not flatten specialist boundaries or skip missing required inputs']]
].map(([name, title, description, boundaries]) => ({ name, title, description, boundaries }));

function exportContent(platform, workflow) {
  if (platform === 'm365-declarative-agent') return { file: 'agent.md', content: renderers.renderM365DeclarativeAgent(workflow) };
  if (platform === 'copilot-studio') return { file: 'agent-build-guide.md', content: renderers.renderCopilotStudioGuide(workflow) };
  if (platform === 'azure-foundry') return { file: 'agent-spec.md', content: renderers.renderAzureFoundrySpec(workflow) };
  if (platform === 'claude-skill') return { file: 'SKILL.md', content: renderers.renderClaudeWorkflowSkill(workflow) };
  if (platform === 'codex-skill') return { file: 'SKILL.md', content: renderers.renderCodexWorkflowSkill(workflow) };
  if (platform === 'copilot-prompt') return { file: workflow.id + '.prompt.md', content: renderers.renderCopilotPrompt(workflow) };
  if (platform === 'copilot-issue-template') return { file: workflow.id + '.yml', content: renderers.renderIssueTemplate(workflow) };
  console.error('error: unsupported export platform: ' + platform);
  process.exit(1);
}

function exportCommand(args) {
  const platform = args[0];
  const id = args[1];
  if (!platform || !id) {
    console.error('error: export requires <platform> <workflow-id>');
    process.exit(1);
  }
  const workflow = findWorkflow(id);
  if (!workflow) {
    console.error('error: unknown workflow: ' + id);
    process.exit(1);
  }
  const output = exportContent(platform, workflow);
  const outputDir = readOption(args, '--output');
  if (outputDir) {
    fs.mkdirSync(outputDir, { recursive: true });
    const file = path.join(outputDir, output.file);
    fs.writeFileSync(file, output.content);
    console.log(file);
    return;
  }
  console.log(output.content);
}

function internalRender(args) {
  const surface = args[0];
  const key = args[1];
  const workflows = loadWorkflows();
  if (surface === 'codex-agents') {
    console.log(renderers.renderCodexAgentsMd());
    return;
  }
  if (surface === 'copilot-repo') {
    console.log(renderers.renderCopilotRepoInstructions(workflows));
    return;
  }
  if (surface === 'copilot-path') {
    const group = COPILOT_PATH_GROUPS.find(item => item.slug === key);
    if (!group) process.exit(2);
    console.log(renderers.renderCopilotPathInstruction(group));
    return;
  }
  if (surface === 'copilot-agent') {
    const agent = COPILOT_AGENTS.find(item => item.name === key);
    if (!agent) process.exit(2);
    console.log(renderers.renderCopilotAgent(agent));
    return;
  }
  const workflow = findWorkflow(key);
  if (!workflow) process.exit(2);
  console.log(exportContent(surface, workflow).content);
}

function resolveToolPath(tool) {
  const config = TOOL_CONFIG[tool];
  return path.join(config.home ? os.homedir() : process.cwd(), config.rel);
}

function countInstalled(tool, slugs) {
  const config = TOOL_CONFIG[tool];
  const target = resolveToolPath(tool);
  if (config.type === 'aider') {
    if (!fs.existsSync(target)) return 0;
    const text = fs.readFileSync(target, 'utf8');
    return slugs.filter(slug => text.includes(slug + '.md')).length;
  }
  if (config.type === 'skills') {
    return slugs.filter(slug => fs.existsSync(path.join(target, slug, 'SKILL.md'))).length;
  }
  return slugs.filter(slug => fs.existsSync(path.join(target, slug + '.md'))).length;
}

function toolDetected(tool) {
  const target = resolveToolPath(tool);
  if (tool === 'aider') return fs.existsSync(target) || commandExists('aider');
  if (tool === 'opencode') return fs.existsSync(target) || commandExists('opencode');
  if (tool === 'continue') return fs.existsSync(target) || fs.existsSync(path.dirname(target));
  return fs.existsSync(target);
}

function commandExists(command) {
  try {
    execFileSync('bash', ['-lc', `command -v ${command}`], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function doctor(args) {
  const registry = loadRegistry();
  const slugs = registry.agents.map(agent => agent.slug);
  const rows = TOOL_ORDER.map(tool => {
    const target = resolveToolPath(tool);
    const installed = countInstalled(tool, slugs);
    return {
      tool,
      display: TOOL_CONFIG[tool].display,
      path: target,
      detected: toolDetected(tool),
      path_exists: fs.existsSync(target),
      installed_files: installed,
      collision: installed > 0
    };
  });
  const detected = rows.filter(row => row.detected);
  const recommended = detected.length
    ? `healthcare-agents install --${detected[0].tool} --dry-run`
    : 'healthcare-agents install --all --dry-run';
  const result = {
    package_root: ROOT,
    registry: REGISTRY_PATH,
    agent_count: registry.agent_count,
    tools: rows,
    recommended_next_command: recommended
  };
  if (hasFlag(args, '--json')) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  console.log('Healthcare Agents doctor');
  console.log(`Package root: ${ROOT}`);
  console.log(`Registry: ${REGISTRY_PATH} (${registry.agent_count} agents)`);
  console.log('');
  console.log(formatTable(rows.map(row => ({
    tool: row.display,
    detected: row.detected ? 'yes' : 'no',
    path: row.path,
    installed: row.installed_files,
    collisions: row.collision ? 'yes' : 'no'
  })), [
    { key: 'tool', header: 'Tool' },
    { key: 'detected', header: 'Detected' },
    { key: 'installed', header: 'Installed' },
    { key: 'collisions', header: 'Collisions' },
    { key: 'path', header: 'Target path' }
  ]));
  console.log('');
  console.log(`Recommended next command: ${recommended}`);
}

function runInstaller(command, args) {
  const registry = loadRegistry();
  const forwarded = [];
  if (command === 'uninstall') forwarded.push('--uninstall');

  if (command === 'install' && args[0] && !args[0].startsWith('-')) {
    const agent = findAgent(registry, args[0]);
    if (!agent) failUnknownAgent(registry, args[0]);
    forwarded.push(agent.slug);
    forwarded.push(...args.slice(1));
  } else {
    forwarded.push(...args);
  }

  const scriptPath = path.join(ROOT, 'install.sh');
  try {
    execFileSync('bash', [scriptPath, ...forwarded], {
      stdio: 'inherit',
      env: { ...process.env, HEALTHCARE_AGENTS_ROOT: ROOT }
    });
  } catch (e) {
    process.exit(e.status || 1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || hasFlag(args, '--help') || hasFlag(args, '-h')) {
    printHelp();
    return;
  }
  const command = args[0];
  const rest = args.slice(1);
  if (command === 'list') return listAgents(rest);
  if (command === 'show') return showAgent(rest);
  if (command === 'choose') return chooseAgent(rest);
  if (command === 'workflows') return listWorkflows(rest);
  if (command === 'workflow') return showWorkflow(rest);
  if (command === 'operator-os') return operatorOsCommand(rest);
  if (command === 'evidence-pack') return evidencePackCommand(rest);
  if (command === 'workup') return workupCommand(rest);
  if (command === 'export') return exportCommand(rest);
  if (command === 'internal-render') return internalRender(rest);
  if (command === 'prompt') return promptAgent(rest);
  if (command === 'doctor') return doctor(rest);
  if (command === 'install' || command === 'uninstall') return runInstaller(command, rest);
  runInstaller('install', args);
}

main().catch(error => {
  console.error('error: ' + error.message);
  process.exit(1);
});
