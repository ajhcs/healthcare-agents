#!/usr/bin/env node
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const {
  verifyAncestryEdges,
  verifyPinnedDataEvidence,
  verifyPinnedGitObjects
} = require('../lib/scale-input-fitness-upstream-verifier');
const { stablePrettyJson } = require('../lib/scale-input-fitness-kernel');

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'agents-scale-verifier-test-'));
try {
  const repo = path.join(temporary, 'data-repo');
  const upstream = path.join(temporary, 'upstream');
  fs.mkdirSync(repo);
  fs.mkdirSync(upstream);
  write(path.join(repo, 'shared', '__init__.py'), '');
  write(path.join(repo, 'shared', 'contracts', '__init__.py'), '');
  write(path.join(repo, 'shared', 'contracts', 'cli.py'), `
import argparse
import hashlib
import json

parser = argparse.ArgumentParser()
subparsers = parser.add_subparsers(dest="command", required=True)
builder = subparsers.add_parser("build-public-evidence")
builder.add_argument("--input", required=True)
builder.add_argument("--output", required=True)
builder.add_argument("--producer-commit", required=True)
args = parser.parse_args()
with open(args.input, encoding="utf-8") as source:
    body = json.load(source)
body["producer"]["commit"] = args.producer_commit
body["schema_version"] = "ushso.public-evidence-bundle.v1"
canonical = json.dumps(body, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
body["bundle_sha256"] = "sha256:" + hashlib.sha256(canonical.encode()).hexdigest()
with open(args.output, "w", encoding="utf-8") as target:
    json.dump(body, target, ensure_ascii=False, indent=2, sort_keys=True)
    target.write("\\n")
`.trimStart());
  const normalized = {
    bundle_id: 'hermetic-scale-evidence',
    payload: { count: 6, family: 'test_family' },
    producer: { repo: 'test-data', version: 'v1', commit: '0'.repeat(40) }
  };
  write(path.join(repo, 'contracts', 'input.json'), stablePrettyJson(normalized));
  write(path.join(repo, 'object.txt'), 'pinned object\n');
  git(repo, ['init', '-b', 'main']);
  git(repo, ['config', 'user.email', 'test@example.com']);
  git(repo, ['config', 'user.name', 'Verifier Test']);
  git(repo, ['add', '.']);
  git(repo, ['commit', '-m', 'feature']);
  const feature = git(repo, ['rev-parse', 'HEAD']).trim();
  write(path.join(repo, 'producer-marker.txt'), 'producer\n');
  git(repo, ['add', '.']);
  git(repo, ['commit', '-m', 'producer']);
  const producer = git(repo, ['rev-parse', 'HEAD']).trim();
  write(path.join(repo, 'tracker-marker.txt'), 'tracker\n');
  git(repo, ['add', '.']);
  git(repo, ['commit', '-m', 'tracker']);
  const tracker = git(repo, ['rev-parse', 'HEAD']).trim();

  write(path.join(upstream, 'normalized-input.json'), stablePrettyJson(normalized));
  fs.copyFileSync(path.join(repo, 'object.txt'), path.join(upstream, 'object.txt'));
  const bundlePath = path.join(upstream, 'public-evidence-bundle.json');
  runRequired('python3', [
    '-m', 'shared.contracts.cli', 'build-public-evidence', '--input', path.join(repo, 'contracts', 'input.json'),
    '--output', bundlePath, '--producer-commit', producer
  ], repo);
  const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
  const manifest = {
    producer_pins: { healthcare_data_mcp: producer },
    evidence_lineage: {
      committed_input_ref: `git:${producer}:contracts/input.json`,
      normalized_input_raw_hash: rawHash(fs.readFileSync(path.join(upstream, 'normalized-input.json'))),
      bundle_raw_hash: rawHash(fs.readFileSync(bundlePath)),
      bundle_semantic_hash: bundle.bundle_sha256
    }
  };
  const evidencePaths = { normalized_input: 'normalized-input.json', public_evidence_bundle: 'public-evidence-bundle.json' };

  const ancestryMessages = [];
  verifyAncestryEdges([
    { repo, before: feature, after: producer, label: 'feature-to-producer' },
    { repo, before: producer, after: tracker, label: 'producer-to-tracker' }
  ], ancestryMessages);
  assert.deepStrictEqual(ancestryMessages, []);
  verifyAncestryEdges([{ repo, before: tracker, after: feature, label: 'reversed' }], ancestryMessages);
  assert.match(ancestryMessages.join('; '), /reversed ancestry drift/);

  const objectMessages = [];
  verifyPinnedGitObjects({ repo, commit: producer, paths: { object: 'object.txt' }, fixturePaths: { object: 'object.txt' }, upstreamDir: upstream, messages: objectMessages });
  assert.deepStrictEqual(objectMessages, []);
  const missingObjectMessages = [];
  verifyPinnedGitObjects({ repo, commit: 'f'.repeat(40), paths: { object: 'object.txt' }, fixturePaths: { object: 'object.txt' }, upstreamDir: upstream, messages: missingObjectMessages });
  assert.match(missingObjectMessages.join('; '), /pinned object did not resolve/);
  write(path.join(upstream, 'object.txt'), 'mutated object\n');
  verifyPinnedGitObjects({ repo, commit: producer, paths: { object: 'object.txt' }, fixturePaths: { object: 'object.txt' }, upstreamDir: upstream, messages: objectMessages });
  assert.match(objectMessages.join('; '), /stored object differs/);
  fs.copyFileSync(path.join(repo, 'object.txt'), path.join(upstream, 'object.txt'));

  let rebuildCalls = 0;
  assert.deepStrictEqual(verifyData({
    repo, manifest, upstream, evidencePaths,
    canonicalizeBundle: value => { rebuildCalls += 1; return value; }
  }), []);
  assert.strictEqual(rebuildCalls, 2, 'verifier must perform exactly two isolated rebuilds');
  assert.match(verifyData({ repo, manifest, upstream, evidencePaths, rebuildCount: 1 }).join('; '), /exactly two isolated rebuilds/);
  assert.match(verifyData({ repo, manifest, upstream, evidencePaths, rebuildCount: 3 }).join('; '), /exactly two isolated rebuilds/);
  assert.match(verifyData({ repo, manifest, upstream, evidencePaths, canonicalizeBundle: () => ({}) }).join('; '), /canonicalizer must return a Buffer|did not both complete/);

  const wrongCommit = clone(manifest);
  wrongCommit.producer_pins.healthcare_data_mcp = 'f'.repeat(40);
  assert.match(verifyData({ repo, manifest: wrongCommit, upstream, evidencePaths }).join('; '), /did not resolve|could not be exported/);
  const wrongInputRaw = clone(manifest);
  wrongInputRaw.evidence_lineage.normalized_input_raw_hash = 'sha256:' + 'a'.repeat(64);
  assert.match(verifyData({ repo, manifest: wrongInputRaw, upstream, evidencePaths }).join('; '), /committed evidence input bytes drift/);
  const originalNormalized = fs.readFileSync(path.join(upstream, 'normalized-input.json'));
  write(path.join(upstream, 'normalized-input.json'), originalNormalized.toString('utf8').replace('"count": 6', '"count": 7'));
  assert.match(verifyData({ repo, manifest, upstream, evidencePaths }).join('; '), /stored normalized input differs/);
  fs.writeFileSync(path.join(upstream, 'normalized-input.json'), originalNormalized);
  const wrongBundleRaw = clone(manifest);
  wrongBundleRaw.evidence_lineage.bundle_raw_hash = 'sha256:' + 'b'.repeat(64);
  assert.match(verifyData({ repo, manifest: wrongBundleRaw, upstream, evidencePaths }).join('; '), /bundle raw hash drift/);
  const wrongBundleSemantic = clone(manifest);
  wrongBundleSemantic.evidence_lineage.bundle_semantic_hash = 'sha256:' + 'c'.repeat(64);
  assert.match(verifyData({ repo, manifest: wrongBundleSemantic, upstream, evidencePaths }).join('; '), /bundle semantic hash drift/);
  assert.match(verifyData({
    repo, manifest, upstream, evidencePaths,
    canonicalizeBundle: value => Buffer.concat([value, Buffer.from(' ')])
  }).join('; '), /bundle raw hash drift|not valid JSON|stored bundle differs/);
  const originalBundle = fs.readFileSync(bundlePath);
  write(bundlePath, originalBundle.toString('utf8').replace('"count": 6', '"count": 7'));
  assert.match(verifyData({ repo, manifest, upstream, evidencePaths }).join('; '), /stored bundle differs/);
  fs.writeFileSync(bundlePath, originalBundle);

  console.log('Shared Scale upstream verifier ancestry, pinned-object, two-build, raw, semantic, and mutation gates validated.');
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

function verifyData(options) {
  const messages = [];
  verifyPinnedDataEvidence({ ...options, upstreamDir: options.upstream, messages });
  return messages;
}

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
}

function git(repo, args) {
  return runRequired('git', ['-C', repo, ...args], repo);
}

function runRequired(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, `${command} ${args.join(' ')} failed: ${result.stderr}`);
  return result.stdout;
}

function rawHash(value) {
  return 'sha256:' + crypto.createHash('sha256').update(value).digest('hex');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
