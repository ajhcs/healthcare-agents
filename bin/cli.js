#!/usr/bin/env node
const { execFileSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
Healthcare Agents -- 51 AI agents for healthcare administration

Usage:
  npx healthcare-agents install          Auto-detect tools and install
  npx healthcare-agents install --claude  Install to Claude Code only
  npx healthcare-agents install --all     Install to all known tool paths
  npx healthcare-agents install --force   Overwrite existing files
  npx healthcare-agents install --dry-run Preview without installing
  npx healthcare-agents uninstall        Remove installed agents

Options:
  --claude, --cursor, --copilot, --codex, --gemini,
  --windsurf, --cline, --amazonq, --aider, --continue
  --path <dir>  Install to a custom directory
  --force       Overwrite existing files
  --dry-run     Show what would be installed
`);
  process.exit(0);
}

const scriptPath = path.join(__dirname, '..', 'install.sh');
const installArgs = [];

if (args[0] === 'uninstall') {
  installArgs.push('--uninstall');
  installArgs.push(...args.slice(1));
} else if (args[0] === 'install') {
  installArgs.push(...args.slice(1));
} else {
  installArgs.push(...args);
}

try {
  execFileSync('bash', [scriptPath, ...installArgs], {
    stdio: 'inherit',
    env: { ...process.env, HEALTHCARE_AGENTS_ROOT: path.join(__dirname, '..') }
  });
} catch (e) {
  process.exit(e.status || 1);
}
