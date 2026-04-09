# MCP Capabilities

This repository uses capability classes rather than tool product names.

## Capability Classes

- `provider_directory`: Look up NPI, taxonomy, and practice address.
- `provider_enrollment_status`: Verify whether a provider or organization is enrolled with a specific payer or program.
- `coverage_determination`: Check Medicare coverage policy for a service, procedure, or item.
- `coding_edit_policy`: Check NCCI edits, modifier indicators, and similar coding policy rules.
- `trial_registry`: Search clinical trials by condition, phase, eligibility, or location.
- `literature_search`: Search biomedical literature by topic or citation.
- `current_regulatory_policy`: Check current CMS, Federal Register, or similar regulatory updates.
- `drug_coverage_exclusion`: Check Part B drug exclusion logic and related lists.

## Validation Rule

Tool recommendations in `registry.yaml` must reference one of these capability classes. A recommendation is invalid if it asks a class to do something listed under its `does_not_do` boundary.
