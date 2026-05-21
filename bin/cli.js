#!/usr/bin/env node
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'agents', 'registry.json');
const AGENTS_DIR = path.join(ROOT, 'agents');
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
  healthcare-agents prompt <agent> --mode <mode>
  healthcare-agents doctor [--json]
  healthcare-agents install [agent] [target/options]
  healthcare-agents uninstall [target/options]

Installer targets:
  --claude, --claude-code, --codex, --codex-app, --opencode,
  --cursor, --copilot, --gemini, --windsurf, --cline,
  --amazonq, --aider, --continue, --agent-skills, --skills, --all

Installer options:
  --path <dir>  Install to a custom directory
  --force       Overwrite existing files
  --dry-run     Show exact planned writes

Output modes:
  quick triage | workplan | audit/checklist | artifact/template

Examples:
  healthcare-agents list --domain revenue
  healthcare-agents show revenue-cycle-specialist
  healthcare-agents choose "clean claim rate dropped after an EHR update"
  healthcare-agents prompt quality-compliance-officer --mode audit/checklist
  healthcare-agents install revenue-cycle-specialist --codex --dry-run`);
}

function hasFlag(args, flag) {
  return args.includes(flag);
}

function readOption(args, name) {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
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
  const domain = readOption(args, '--domain');
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
  return `Use the ${agent.slug} healthcare administration agent in ${mode} mode for this problem: ${problem}. Start by stating assumptions, missing inputs, immediate risks, and the human owner for final decisions. Keep the response within this role boundary: ${agent.role_boundaries}${handoffText}`;
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
  const mode = readOption(args, '--mode');
  if (!mode) {
    console.error('error: prompt requires --mode <mode>');
    process.exit(1);
  }
  if (!VALID_MODES.includes(mode)) {
    console.error(`error: invalid mode: ${mode}`);
    console.error(`valid modes: ${VALID_MODES.join(', ')}`);
    process.exit(1);
  }
  console.log(buildStarterPrompt(agent, mode, '[describe the healthcare administration problem, setting, data, constraints, and deadline]', agent.handoffs.slice(0, 3)));
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

function main() {
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
  if (command === 'prompt') return promptAgent(rest);
  if (command === 'doctor') return doctor(rest);
  if (command === 'install' || command === 'uninstall') return runInstaller(command, rest);
  runInstaller('install', args);
}

main();
