#!/usr/bin/env node
const assert = require('assert');
const { createWorkupAsync, formatWorkupMarkdown } = require('../lib/workflows');
const {
  buildDenialSpikeGoldenArtifact,
  scoreDenialSpikeArtifact,
  assertDenialSpikeGoldenArtifact
} = require('../lib/operator-os/golden-artifacts');

function expectGoldenFailure(markdown, pattern) {
  assert.throws(() => assertDenialSpikeGoldenArtifact(markdown), pattern);
}

(async () => {
  const workup = await createWorkupAsync('Commercial payer denial rate jumped and AR days are climbing', {
    dataMode: 'hybrid_synthetic_public'
  });
  const artifact = buildDenialSpikeGoldenArtifact(workup);
  const score = scoreDenialSpikeArtifact(artifact);
  assert.strictEqual(score.pass, true, JSON.stringify(score, null, 2));
  assertDenialSpikeGoldenArtifact(artifact);
  assert.match(artifact, /X12 Claim Adjustment Reason Code/);
  assert.match(artifact, /offline locator:/);
  assert.match(artifact, /required fields:/);

  const userFacingMarkdown = formatWorkupMarkdown(workup);
  const userFacingScore = scoreDenialSpikeArtifact(userFacingMarkdown);
  assert.strictEqual(userFacingScore.pass, true, JSON.stringify(userFacingScore, null, 2));
  assert.match(userFacingMarkdown, /\[provenance: synthetic; source: operator-os\.synthetic\.denial-spike\.v1\]/);

  expectGoldenFailure(artifact.replace(/CARC\/RARC/gi, 'reason codes').replace(/CARC/gi, 'reason').replace(/RARC/gi, 'remark'), /carc_rarc_specificity/);
  expectGoldenFailure(
    artifact
      .replace(/Evidence pack/gi, 'Source packet')
      .replace(/Citation card/gi, 'Source note')
      .replace(/source-family-not-pinpoint/gi, 'lookup-needed')
      .replace(/local-policy-required/gi, 'owner-needed'),
    /citation_support/
  );
  expectGoldenFailure(
    artifact
      .replace(/Monitoring/gi, 'Followup')
      .replace(/new denials stopped/gi, 'the queue improved')
      .replace(/prevention proof/gi, 'cleanup evidence')
      .replace(/leading indicators daily/gi, 'metrics periodically')
      .replace(/weekly/gi, 'periodic')
      .replace(/cadence/gi, 'rhythm'),
    /monitoring_prevention/
  );
  expectGoldenFailure(artifact + '\nPatient Name: Test Example\nMRN: 123456', /phi_like_content/);

  console.log('denial spike golden artifact ok: pass and omission failures');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
