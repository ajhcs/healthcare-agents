const {
  PROVENANCE_TYPES,
  makeProvenance,
  labelObjectFields,
  assertAllFieldsProvenanced
} = require('./case-provenance');

function buildSyntheticDenialSpikeCase(options = {}) {
  const prompt = String(options.prompt || '');
  const promptText = prompt.toLowerCase();
  const promptProvenance = makeProvenance(PROVENANCE_TYPES.USER_SUPPLIED, 'cli.problem');
  const syntheticProvenance = makeProvenance(PROVENANCE_TYPES.SYNTHETIC, 'operator-os.synthetic.denial-spike.v1');
  const payerFromPrompt = promptText.includes('medicare advantage') || promptText.includes('commercial');
  const payer = promptText.includes('medicare advantage') ? 'Medicare Advantage payer' : 'Commercial payer';
  const product = promptText.includes('medicare advantage') ? 'MA plan' : 'Commercial PPO';
  const carcMatch = prompt.match(/\bCARC\s*[-:]?\s*([A-Z0-9]+)/i);
  const rarcMatch = prompt.match(/\bRARC\s*[-:]?\s*([A-Z0-9]+)/i);
  const dominantCode = carcMatch
    ? 'CARC ' + carcMatch[1].toUpperCase() + (rarcMatch ? '; RARC ' + rarcMatch[1].toUpperCase() : '; verify RARC from remit before appeal drafting')
    : 'CARC/RARC missing from prompt; verify remit before appeal drafting';
  const values = {
    payer,
    product,
    timeframe: 'current 14-day remit window compared with prior 8-week baseline',
    baseline_denial_rate: '6.2%',
    current_denial_rate: '14.8%',
    claim_count: 184,
    gross_charges_at_risk: '$428,000',
    dominant_carc_rarc: dominantCode,
    service_lines: ['Cardiology', 'Imaging'],
    suspected_root_causes: ['authorization workflow change', 'payer processing or policy interpretation', 'coding/modifier review needed'],
    evidence_available: ['835 remit sample', '837 claim extract', 'authorization tracker', 'eligibility response archive'],
    appeal_deadline_basis: 'local payer policy or denial-letter date required before calculating deadline',
    recommended_owners: ['Revenue Cycle Denials', 'Patient Access/Auth', 'Coding/CDI', 'Payer Relations', 'Compliance']
  };
  const provenanceByField = Object.fromEntries(Object.keys(values).map(field => [field, syntheticProvenance]));
  if (payerFromPrompt) {
    provenanceByField.payer = promptProvenance;
    provenanceByField.product = promptProvenance;
  }
  if (carcMatch || rarcMatch) provenanceByField.dominant_carc_rarc = promptProvenance;
  const labeled = labelObjectFields(values, provenanceByField);
  assertAllFieldsProvenanced(labeled);
  return labeled;
}

module.exports = {
  buildSyntheticDenialSpikeCase
};
