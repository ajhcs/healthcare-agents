#!/usr/bin/env node
const fs = require('fs');
const { run } = require('./_release-utils');
const { targets } = require('./release-targets');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const lock = fs.existsSync('package-lock.json') ? JSON.parse(fs.readFileSync('package-lock.json', 'utf8')) : null;
const versionFile = fs.readFileSync('VERSION', 'utf8').trim();
const installText = fs.readFileSync('install.sh', 'utf8');
const plugin = JSON.parse(fs.readFileSync('.codex-plugin/plugin.json', 'utf8'));
const failures = [];

if (!lock && process.argv.includes('--require-lockfile')) failures.push('source release requires package-lock.json');
if (lock && (lock.version !== pkg.version || lock.packages[''].version !== pkg.version)) failures.push('lockfile version does not match package.json');
if (pkg.version !== versionFile) failures.push('package.json version ' + pkg.version + ' does not match VERSION ' + versionFile);
if (!installText.includes('VERSION="' + pkg.version + '"')) failures.push('install.sh VERSION does not match package.json');
if (plugin.version !== pkg.version) failures.push('Codex plugin version ' + plugin.version + ' does not match package.json ' + pkg.version);

let target;
try { target = targets(pkg); } catch (error) { failures.push(error.message); }

if (process.argv.includes('--network') && target) {
  const npm = run('npm', ['view', pkg.name + '@' + target.npm_tag, 'version', '--registry', target.registry]);
  if (npm.status !== 0 || !npm.stdout.trim()) failures.push('npm version lookup failed or returned empty data');
  if (npm.status === 0 && npm.stdout.trim() && npm.stdout.trim() !== pkg.version) {
    failures.push('npm ' + target.npm_tag + ' ' + npm.stdout.trim() + ' does not match package.json ' + pkg.version);
  }
  const gh = run('gh', ['release', 'view', target.github_tag, '--repo', target.repository, '--json', 'tagName,isDraft,isPrerelease']);
  if (gh.status !== 0 || !gh.stdout.trim()) failures.push('GitHub release lookup failed or returned empty data');
  if (gh.status === 0 && gh.stdout.trim()) {
    try {
      const release = JSON.parse(gh.stdout);
      if (release.tagName !== target.github_tag || release.isDraft !== false || release.isPrerelease !== target.github_prerelease)
        failures.push('GitHub exact release tag or prerelease state mismatch');
    } catch { failures.push('GitHub release lookup returned invalid JSON'); }
  }
}

if (failures.length) {
  for (const failure of failures) console.error('version sync: ' + failure);
  process.exit(1);
}

console.log('release version consistency ok: ' + pkg.version + (process.argv.includes('--network') ? ' with network checks' : ' local checks'));
