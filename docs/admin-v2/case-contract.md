# Aggregate case contract

Run `healthcare-agents admin run case.json`. The strict envelope is `healthcare-admin.case.v2`, with one supported workflow ID, `data_mode` (synthetic_only or aggregate), `human_owner`, `evidence` and `data`. Unexpected fields fail. The CLI refuses inputs larger than 2 MiB.

Each evidence entry names an ID, origin, real calendar as-of date, description and the data fields it supports. All data fields must be covered. Synthetic mode requires synthetic evidence; aggregate mode requires user_supplied or source_derived evidence. This attribution is a declared provenance contract, not independent authentication of a source or a PHI detector.

Counts are nonnegative integers up to one billion. Amounts are nonnegative USD values up to one billion per input; underpayment lines require cent precision. Dates use YYYY-MM-DD and must exist in the calendar. Repeated finding, line, category or evidence identities are rejected.

| Workflow | Required data | Calculation and limits |
| --- | --- | --- |
| denial-spike-workup | baseline_claims, baseline_denied, current_claims, current_denied, denied_dollars | denied/claims, rate difference × 100, relative rate change; positive denominators and denied ≤ claims. Zero baseline gives null relative change. Recovery is unknown. |
| ambulatory-access-backlog | weekly_requests, weekly_slots, backlog, additional_weekly_slots | Net = slots + additional slots − requests. Ceiling(backlog/net) only for positive net; zero backlog is zero weeks. This assumes stable demand and usable slots. |
| survey-readiness-gap-review | findings with id, standard_ref, evidence_present, owner, due_date | Count absent evidence and retain finding records; presence never establishes compliance. |
| prior-authorization-appeal-workup | decision_date, appeal_deadline, rule_reference, available_documents, required_documents | Calendar-day difference between supplied dates and exact document-name difference. No program deadline, timezone or receipt convention is inferred. |
| payer-contract-underpayment-review | lines with id, expected, paid, currency=USD, contract_ref | Per-line expected−paid, signed net and positive-only exposure in integer cents. Expected payment remains a supplied assumption. |
| discharge-barrier-workplan | barriers with category, cases, avoidable_days, owner | Sum category counts/days; categories and cases must be disjoint before interpreting totals. Local avoidable-day definitions remain unverified. |

The result `healthcare-admin.result.v2` binds a SHA256 of the parsed input serialization, preserves declared evidence, names the human owner and returns interpretation checks and a completion gate. It is always a review draft and records no external action performed. The hash identifies the parsed input, not the exact original file bytes or a signed source.

Survey results include every original finding in `finding_records`, including records with evidence present, and a separate missing-evidence `gaps` list. Owners and retest work survive tool-only handoffs.

Custom workflow IDs are at most 53 characters, reserving the `healthcare-` prefix within the 64-character skill name limit. Custom builder contracts use `healthcare-admin.workflow.v2`. Input keys, specialist IDs and the shapes of steps and acceptance fields are validated; no arbitrary code or formulas execute. Step and acceptance prose are user-supplied instructions, not semantically certified action scopes. The named qualified owner must review their meaning and authorization before use. The generated custom-case template is for a host model to fill and review; it is not accepted by the six built-in calculation tools.
