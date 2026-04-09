#!/usr/bin/env bash
set -euo pipefail

python3 - <<'PY'
from __future__ import annotations

CAPABILITY_CLASSES = {
    "provider_directory": {
        "allow": ["NPI", "taxonomy", "practice address"],
        "deny": ["board certification", "payer enrollment status"],
    },
    "provider_enrollment_status": {
        "allow": ["payer enrollment", "program enrollment"],
        "deny": ["board certification", "taxonom", "NPI issuance"],
    },
    "coding_edit_policy": {
        "allow": ["NCCI", "modifier", "MUE"],
        "deny": ["DRG grouping"],
    },
}


def validate(capability: str, query: str) -> None:
    rules = CAPABILITY_CLASSES[capability]
    lowered = query.lower()
    for token in rules["deny"]:
        assert token.lower() not in lowered, (capability, query, token)
    for token in rules["allow"]:
        if token.lower() in lowered:
            return
    raise AssertionError((capability, query))


validate("provider_directory", "Look up NPI, taxonomy, and practice address before referral.")
validate("provider_enrollment_status", "Verify payer enrollment status before onboarding.")
validate("coding_edit_policy", "Check NCCI and modifier edits for the procedure set.")

for capability, query in [
    ("provider_directory", "Verify board certification before referral."),
    ("provider_directory", "Confirm payer enrollment status for the specialist."),
    ("coding_edit_policy", "Use this to determine DRG grouping."),
]:
    try:
        validate(capability, query)
    except AssertionError:
        continue
    raise SystemExit(f"expected {capability!r} / {query!r} to fail")

print("test-capability-mapping.sh: ok")
PY
