#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { ROOT, runRequired } = require('./_release-utils');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'healthcare-agents-tarball-'));
try {
  const packOutput = JSON.parse(runRequired('npm', ['pack', '--json', '--pack-destination', tmp]).stdout)[0];
  const tarball = path.join(tmp, packOutput.filename);
  assert.ok(fs.existsSync(tarball), 'tarball exists');

  const project = path.join(tmp, 'consumer');
  const home = path.join(tmp, 'home');
  fs.mkdirSync(project);
  fs.mkdirSync(home);
  fs.writeFileSync(path.join(project, 'package.json'), '{"private":true,"type":"commonjs"}\n');
  runRequired('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball], { cwd: project });

  const bin = path.join(project, 'node_modules', '.bin', process.platform === 'win32' ? 'healthcare-agents.cmd' : 'healthcare-agents');
  const env = { HOME: home, NO_COLOR: '1' };
  const help = runRequired(bin, ['--help'], { cwd: project, env }).stdout;
  assert.match(help, /Healthcare Agents/);
  const list = JSON.parse(runRequired(bin, ['list', '--json'], { cwd: project, env }).stdout);
  assert.strictEqual(list.count, 51);
  const show = JSON.parse(runRequired(bin, ['show', 'revenue-cycle-specialist', '--json'], { cwd: project, env }).stdout);
  assert.strictEqual(show.slug, 'revenue-cycle-specialist');
  const choose = JSON.parse(runRequired(bin, ['choose', 'clean claim denial spike', '--json'], { cwd: project, env }).stdout);
  assert.strictEqual(choose.primary_agent, 'revenue-cycle-specialist');
  const doctor = JSON.parse(runRequired(bin, ['doctor', '--json'], { cwd: project, env }).stdout);
  assert.strictEqual(doctor.agent_count, 51);
  runRequired(bin, ['install', 'revenue-cycle-specialist', '--codex', '--dry-run'], { cwd: project, env });
  const installedPackage = path.join(project, 'node_modules', 'healthcare-agents');
  runRequired(process.execPath, ['scripts/test-scale-roster-bed-review.js'], { cwd: installedPackage, env });
  runRequired(process.execPath, ['scripts/test-scale-input-fitness-review.js'], { cwd: installedPackage, env });
  runRequired(process.execPath, ['scripts/test-scale-input-fitness-kernel.js'], { cwd: installedPackage, env });
  runRequired(process.execPath, ['scripts/test-scale-input-fitness-upstream-verifier.js'], { cwd: installedPackage, env });
  runRequired(process.execPath, ['scripts/test-scale-annual-discharges-review.js'], { cwd: installedPackage, env });
  runRequired(process.execPath, ['scripts/test-scale-physician-count-review.js'], { cwd: installedPackage, env });
  runRequired(process.execPath, ['scripts/test-scale-service-line-count-review.js'], { cwd: installedPackage, env });
  runRequired(process.execPath, ['scripts/test-scale-safety-net-patient-mix-review.js'], { cwd: installedPackage, env });
  runRequired(process.execPath, ['scripts/test-scale-emergency-department-count-review.js'], { cwd: installedPackage, env });

  for (const file of [
    'node_modules/healthcare-agents/bin/cli.js',
    'node_modules/healthcare-agents/install.sh',
    'node_modules/healthcare-agents/agents/registry.json',
    'node_modules/healthcare-agents/docs/eval/scorecard.json'
  ]) {
    assert.ok(fs.existsSync(path.join(project, file)), `required artifact missing: ${file}`);
  }
  console.log(`tarball smoke ok: ${packOutput.filename} from ${ROOT}`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
