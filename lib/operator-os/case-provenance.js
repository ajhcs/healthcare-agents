const PROVENANCE_TYPES = Object.freeze({
  SOURCE_DERIVED: 'source_derived',
  SYNTHETIC: 'synthetic',
  USER_SUPPLIED: 'user_supplied'
});

const VALID_TYPES = new Set(Object.values(PROVENANCE_TYPES));

function makeProvenance(type, source) {
  if (!VALID_TYPES.has(type)) throw new Error('invalid provenance type: ' + type);
  if (type === PROVENANCE_TYPES.SOURCE_DERIVED && !source) {
    throw new Error('source_derived provenance requires a source or citation card id');
  }
  if (type === PROVENANCE_TYPES.USER_SUPPLIED && !source) {
    throw new Error('user_supplied provenance requires a field source');
  }
  return { type, source: source || null };
}

function labelField(value, provenance) {
  makeProvenance(provenance && provenance.type, provenance && provenance.source);
  return { value, provenance };
}

function labelObjectFields(object, provenanceByField) {
  const labeled = {};
  for (const [field, value] of Object.entries(object || {})) {
    const provenance = provenanceByField[field];
    if (!provenance) throw new Error('missing provenance for field: ' + field);
    labeled[field] = labelField(value, provenance);
  }
  return labeled;
}

function isLabeledField(value) {
  return Boolean(value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'value') && value.provenance);
}

function assertAllFieldsProvenanced(object, prefix = '') {
  for (const [field, value] of Object.entries(object || {})) {
    const name = prefix ? prefix + '.' + field : field;
    if (!isLabeledField(value)) throw new Error('field lacks provenance: ' + name);
    makeProvenance(value.provenance.type, value.provenance.source);
  }
  return true;
}

function summarizeProvenance(labeledObject) {
  const counts = {};
  const sources = {};
  for (const [field, item] of Object.entries(labeledObject || {})) {
    if (!isLabeledField(item)) continue;
    const type = item.provenance.type;
    counts[type] = (counts[type] || 0) + 1;
    if (!sources[type]) sources[type] = [];
    sources[type].push({ field, source: item.provenance.source });
  }
  return { counts, sources };
}

function stripProvenance(labeledObject) {
  const plain = {};
  for (const [field, item] of Object.entries(labeledObject || {})) {
    plain[field] = isLabeledField(item) ? item.value : item;
  }
  return plain;
}

module.exports = {
  PROVENANCE_TYPES,
  makeProvenance,
  labelField,
  labelObjectFields,
  assertAllFieldsProvenanced,
  summarizeProvenance,
  stripProvenance
};
