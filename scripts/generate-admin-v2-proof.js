#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { runCase } = require('../lib/admin-workflows');
const root = path.join(__dirname, '..');
const bytes = fs.readFileSync(path.join(root, 'examples/admin-v2/denial-spike-workup.json'));
const input = JSON.parse(bytes);
const result = runCase(input);
const v = result.values;
const pct = value => (value * 100).toFixed(0) + '%';
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="520" viewBox="0 0 1200 520" role="img" aria-labelledby="title desc">' +
'<title id="title">Synthetic denial investigation, calculated by Healthcare Agents v2</title>' +
'<desc id="desc">100 denied of 1000 baseline claims and 180 of 1000 current claims. Rates are 10 and 18 percent. Difference is 8 percentage points and 80 percent relative. Recovery is unknown.</desc>' +
'<rect width="1200" height="520" fill="#f5f4ef"/><g font-family="Arial,sans-serif" fill="#163b36">' +
'<text x="54" y="58" font-size="17" letter-spacing="2">HEALTHCARE AGENTS / SYNTHETIC WORKFLOW PROOF</text>' +
'<text x="54" y="112" font-size="38" font-weight="bold">Denial rate: show the denominator.</text>' +
'<text x="54" y="174" font-size="21">Baseline: ' + input.data.baseline_denied + ' / ' + input.data.baseline_claims + ' claims</text>' +
'<rect x="54" y="196" width="' + (v.baseline_rate * 2400) + '" height="47" fill="#8daea3"/><text x="320" y="229" font-size="30">' + pct(v.baseline_rate) + '</text>' +
'<text x="54" y="296" font-size="21">Current: ' + input.data.current_denied + ' / ' + input.data.current_claims + ' claims</text>' +
'<rect x="54" y="317" width="' + (v.current_rate * 2400) + '" height="47" fill="#1d695a"/><text x="511" y="351" font-size="30">' + pct(v.current_rate) + '</text>' +
'<path d="M660 160V388" stroke="#c5cec8"/><text x="707" y="216" font-size="58" font-weight="bold">+' + v.percentage_point_change + ' pp</text>' +
'<text x="707" y="260" font-size="23">' + pct(v.relative_change) + ' relative increase</text>' +
'<text x="707" y="319" font-size="19">Denied dollars: $' + v.denied_dollars.toLocaleString('en-US') + '</text>' +
'<text x="707" y="352" font-size="19">Recoverable cash: unknown</text>' +
'<text x="54" y="432" font-size="18">Draft for human review / aligned cohorts and dated policy still required</text>' +
'<text x="54" y="476" font-size="14">Fixture SHA256: ' + crypto.createHash('sha256').update(bytes).digest('hex') + '</text>' +
'</g></svg>\n';
fs.writeFileSync(path.join(root, 'docs/assets/admin-v2-denial-proof.svg'), svg);
console.log('Generated visual from executed synthetic case');
