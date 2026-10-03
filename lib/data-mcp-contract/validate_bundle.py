"""Bounded producer-contract validator. No acquisition or filesystem lookup."""
import json
import sys
from public_evidence import PublicEvidenceBundle

LIMIT = 2 * 1024 * 1024
def unique_pairs(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("duplicate JSON key")
        result[key] = value
    return result
def reject_constant(value):
    raise ValueError("non-finite JSON constant")
try:
    raw = sys.stdin.buffer.read(LIMIT + 1)
    if len(raw) > LIMIT:
        raise ValueError("input too large")
    packet = json.loads(raw, object_pairs_hook=unique_pairs, parse_constant=reject_constant)
    if set(packet) != {"bundle_json", "mapping_json"}:
        raise ValueError("invalid packet")
    value = json.loads(packet["bundle_json"], object_pairs_hook=unique_pairs, parse_constant=reject_constant)
    mapping = json.loads(packet["mapping_json"], object_pairs_hook=unique_pairs, parse_constant=reject_constant)
    if not isinstance(mapping, dict):
        raise ValueError("invalid mapping")
    bundle = PublicEvidenceBundle.model_validate(value)
    encoded = json.dumps({"bundle": bundle.model_dump(mode="json"), "mapping": mapping}, ensure_ascii=False, allow_nan=False, separators=(",", ":")).encode("utf-8")
    if len(encoded) + 1 > LIMIT:
        raise ValueError("output too large")
    sys.stdout.buffer.write(encoded + b"\n")
except Exception:
    # Never echo source values, paths or validation excerpts into host errors.
    sys.stderr.write("PUBLIC_EVIDENCE_CONTRACT_INVALID\n")
    sys.exit(1)
