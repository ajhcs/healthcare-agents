const DATA_MODES = Object.freeze({
  PROMPT_ONLY: 'prompt_only',
  SYNTHETIC_ONLY: 'synthetic_only',
  PUBLIC_EVIDENCE: 'public_evidence',
  PUBLIC_SEARCH: 'public_search',
  HYBRID_SYNTHETIC_PUBLIC: 'hybrid_synthetic_public',
  INTERNAL_PRIVATE: 'internal_private'
});

const DEFAULT_DATA_MODE = DATA_MODES.PROMPT_ONLY;
const MODE_VALUES = new Set(Object.values(DATA_MODES));
const VALID_DATA_MODE_VALUES = Object.values(DATA_MODES);

function normalizeDataMode(value) {
  const mode = String(value || DEFAULT_DATA_MODE).trim().toLowerCase().replace(/-/g, '_');
  if (!MODE_VALUES.has(mode)) {
    throw new Error('unsupported data mode: ' + value + '; valid modes: ' + VALID_DATA_MODE_VALUES.join(', '));
  }
  return mode;
}

function isNetworkMode(mode) {
  return normalizeDataMode(mode) === DATA_MODES.PUBLIC_SEARCH;
}

function requiresExplicitInput(mode) {
  return normalizeDataMode(mode) === DATA_MODES.INTERNAL_PRIVATE;
}

module.exports = {
  DATA_MODES,
  DEFAULT_DATA_MODE,
  VALID_DATA_MODE_VALUES,
  normalizeDataMode,
  isNetworkMode,
  requiresExplicitInput
};
