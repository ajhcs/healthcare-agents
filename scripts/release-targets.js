#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const REPOSITORY = 'ajhcs/healthcare-agents';
const REGISTRY = 'https://registry.npmjs.org';
function targets(pkg) {
  if (pkg.name !== 'healthcare-agents') throw new Error('unexpected package name');
  // This release policy intentionally accepts stable versions and beta.N only.
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-beta\.(0|[1-9]\d*))?$/.test(pkg.version))
    throw new Error('release version must be stable semver or beta.N');
  const prerelease = pkg.version.includes('-beta.');
  const tag = prerelease ? 'next' : 'latest';
  if (pkg.repository?.type !== 'git' || pkg.repository.url !== 'git+https://github.com/' + REPOSITORY + '.git')
    throw new Error('repository metadata mismatch');
  if (pkg.homepage !== 'https://github.com/' + REPOSITORY) throw new Error('homepage metadata mismatch');
  if (pkg.publishConfig?.tag !== tag || pkg.publishConfig.access !== 'public' || pkg.publishConfig.registry !== REGISTRY)
    throw new Error('publishConfig must explicitly select ' + tag + ', public access and the npm registry');
  return { name: pkg.name, version: pkg.version, npm_tag: tag, registry: REGISTRY, repository: REPOSITORY,
    github_tag: 'v' + pkg.version, github_prerelease: prerelease };
}
function assertRequested(t, env, head) {
  if (env.EXPECTED_VERSION !== t.version) throw new Error('expected version must exactly match package.json');
  if (!/^[a-f0-9]{40}$/.test(env.EXPECTED_COMMIT || '') || env.EXPECTED_COMMIT !== head)
    throw new Error('expected commit must be the exact full checked-out SHA');
  if (env.GITHUB_SHA !== head) throw new Error('workflow ref must be the same approved commit');
  if (env.GITHUB_REPOSITORY !== t.repository) throw new Error('publishing repository mismatch');
}
function assertRegistry(t, doc, before) {
  const entry = doc.versions?.[t.version];
  if (!entry || entry.name !== t.name || entry.version !== t.version || !entry.dist?.tarball || !entry.dist?.integrity)
    throw new Error('exact npm package/version and tarball integrity are missing');
  if (entry.repository?.url !== 'git+https://github.com/' + t.repository + '.git')
    throw new Error('published repository metadata mismatch');
  if (doc['dist-tags']?.[t.npm_tag] !== t.version) throw new Error('expected npm dist-tag does not point at the candidate');
  if (t.github_prerelease && before && doc['dist-tags']?.latest !== before.latest)
    throw new Error('npm latest changed during prerelease publication; stop, do not mutate tags automatically');
}
function assertGithub(t, release) {
  if (release.tag_name !== t.github_tag || release.draft || release.prerelease !== t.github_prerelease)
    throw new Error('GitHub exact tag, published state or prerelease flag mismatch');
}
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'healthcare-agents-release-check' } }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) return reject(new Error(url + ' returned ' + response.statusCode));
        try { resolve(JSON.parse(body)); } catch (error) { reject(error); }
      });
    });
    req.setTimeout(15000, () => req.destroy(new Error('release lookup timeout')));
    req.on('error', reject);
  });
}
async function cli() {
  const t = targets(JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')));
  const mode = process.argv[2] || 'local';
  if (mode === 'ci') {
    const git = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' });
    if (git.status !== 0) throw new Error('cannot resolve checked-out commit');
    assertRequested(t, process.env, git.stdout.trim());
    if (!process.env.GITHUB_OUTPUT) throw new Error('GITHUB_OUTPUT is required');
    fs.appendFileSync(process.env.GITHUB_OUTPUT, 'npm_tag=' + t.npm_tag + '\ngithub_tag=' + t.github_tag + '\n');
  } else if (mode === 'before') {
    const file = process.argv[3];
    if (!file || fs.existsSync(file)) throw new Error('supply a new registry snapshot path');
    const doc = await fetchJson(t.registry + '/' + t.name);
    if (doc.versions?.[t.version]) throw new Error('npm version already exists; never overwrite or reuse it');
    const latest = doc['dist-tags']?.latest;
    if (typeof latest !== 'string' || !latest) throw new Error('cannot establish current npm latest');
    assertGithub(t, await fetchJson('https://api.github.com/repos/' + t.repository + '/releases/tags/' + t.github_tag));
    fs.writeFileSync(file, JSON.stringify({ latest, target: t, observed_at: new Date().toISOString() }, null, 2) + '\n', { flag: 'wx' });
  } else if (mode === 'after') {
    const before = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
    if (JSON.stringify(before.target) !== JSON.stringify(t)) throw new Error('registry snapshot targets mismatch');
    assertRegistry(t, await fetchJson(t.registry + '/' + t.name), before);
  } else if (mode !== 'local') throw new Error('unknown release target mode');
  console.log(JSON.stringify(t, null, 2));
}
if (require.main === module) cli().catch(error => { console.error('release targets: ' + error.message); process.exitCode = 1; });
module.exports = { targets, assertRequested, assertRegistry, assertGithub, fetchJson };
