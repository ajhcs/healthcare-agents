const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

function verifyAncestryEdges(edges, messages) {
  for (const { repo, before, after, label } of edges) {
    const result = spawnSync('git', ['-C', repo, 'merge-base', '--is-ancestor', before, after]);
    if (result.status !== 0) messages.push(`${label} ancestry drift`);
  }
}

function verifyPinnedGitObjects({ repo, commit, paths, fixturePaths, upstreamDir, messages }) {
  for (const [role, sourcePath] of Object.entries(paths)) {
    const resolved = spawnSync('git', ['-C', repo, 'show', `${commit}:${sourcePath}`], { encoding: null });
    if (resolved.status !== 0) messages.push(`pinned object did not resolve: ${role}`);
    else if (!resolved.stdout.equals(fs.readFileSync(path.join(upstreamDir, fixturePaths[role])))) messages.push(`stored object differs from exact producer: ${role}`);
  }
}

function verifyPinnedDataEvidence({ repo, manifest, upstreamDir, evidencePaths, messages, canonicalizeBundle = value => value, rebuildCount = 2 }) {
  const committedPath = manifest.evidence_lineage?.committed_input_ref?.split(':').slice(2).join(':');
  const producer = manifest.producer_pins.healthcare_data_mcp;
  if (!committedPath) {
    messages.push('committed evidence input path is missing');
    return;
  }
  const resolved = spawnSync('git', ['-C', repo, 'show', `${producer}:${committedPath}`], { encoding: null });
  if (resolved.status !== 0) messages.push(`committed evidence input did not resolve at Data pin: ${String(resolved.stderr)}`);
  else {
    if (rawHash(resolved.stdout) !== manifest.evidence_lineage.normalized_input_raw_hash) messages.push('resolved committed evidence input bytes drift');
    if (!resolved.stdout.equals(fs.readFileSync(path.join(upstreamDir, evidencePaths.normalized_input)))) messages.push('stored normalized input differs from exact committed Git input');
  }

  const rebuiltOutputs = [];
  for (let buildIndex = 0; buildIndex < rebuildCount; buildIndex += 1) {
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'agents-scale-lineage-'));
    try {
      const checkout = path.join(temporary, 'data-mcp');
      fs.mkdirSync(checkout);
      const archive = spawnSync('git', ['-C', repo, 'archive', '--format=tar', producer], { encoding: null, maxBuffer: 128 * 1024 * 1024 });
      if (archive.status !== 0) {
        messages.push(`Data producer commit could not be exported: ${String(archive.stderr)}`);
        continue;
      }
      const extract = spawnSync('tar', ['-x', '-C', checkout], { input: archive.stdout, encoding: null });
      if (extract.status !== 0) {
        messages.push(`Data producer export could not be extracted: ${String(extract.stderr)}`);
        continue;
      }
      const rebuilt = path.join(temporary, 'public-evidence-bundle.json');
      const build = spawnSync('python3', [
        '-m', 'shared.contracts.cli', 'build-public-evidence',
        '--input', path.join(checkout, committedPath),
        '--output', rebuilt,
        '--producer-commit', producer
      ], { cwd: checkout, encoding: null });
      if (build.status !== 0) {
        messages.push(`pinned Data bundle rebuild failed: ${String(build.stderr)}`);
        continue;
      }
      const rebuiltBytes = canonicalizeBundle(fs.readFileSync(rebuilt));
      rebuiltOutputs.push(rebuiltBytes);
      if (rawHash(rebuiltBytes) !== manifest.evidence_lineage.bundle_raw_hash) messages.push('pinned Data rebuild bundle raw hash drift');
      if (!rebuiltBytes.equals(fs.readFileSync(path.join(upstreamDir, evidencePaths.public_evidence_bundle)))) messages.push('stored bundle differs from exact pinned Data rebuild');
    } finally {
      fs.rmSync(temporary, { recursive: true, force: true });
    }
  }
  if (rebuiltOutputs.length === rebuildCount && rebuiltOutputs.some(value => !value.equals(rebuiltOutputs[0]))) messages.push('isolated pinned Data rebuilds are not byte-identical');
}

function rawHash(value) {
  return 'sha256:' + crypto.createHash('sha256').update(value).digest('hex');
}

module.exports = { verifyAncestryEdges, verifyPinnedDataEvidence, verifyPinnedGitObjects };
