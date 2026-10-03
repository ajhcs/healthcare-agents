# Import a Data MCP receipt bundle into an administrative case

The local importer consumes **ushso.public-evidence-bundle.v1**, the portable Healthcare Data MCP producer contract. It does not start Data MCP servers, fetch source URLs, read caches, infer a join or provision a customer host.

The operator chooses the workflow, exact entity, named human owner, evidence mode and explicit field mappings. A valid result remains a draft for human review. Public discovery does not establish that denial, access, survey, appeal, payment or discharge data are available in Data MCP. Missing source coverage stays missing.

## Install the optional validator

The existing six calculations and eight MCP tools still require Node alone. Receipt import additionally requires Python **3.11+** and the pinned Pydantic dependency:

~~~bash
python3 -m venv .receipt-venv
.receipt-venv/bin/python -m pip install -r lib/data-mcp-contract/requirements.txt
node bin/cli.js admin import-evidence examples/admin-v2/data-mcp/denial-spike-workup.bundle.json \
  --mapping examples/admin-v2/data-mcp/denial-spike-workup.mapping.json \
  --output ./imported-denials --python .receipt-venv/bin/python
node bin/cli.js admin run ./imported-denials/case.json
~~~

On Windows, select the environment's `Scripts/python.exe`. Python and Pydantic are not silently installed by the CLI. Use `--python` only as an operator runtime setting; it is not an MCP model argument.

A new output directory contains the original `public-evidence-bundle.json`, the complete `evidence-map.json`, a hash/size manifest and, when ready, `case.json`. Existing directories are refused. A blocked mapping writes its custody bundle and typed blockers, with `case: null` and no case file. Malformed contracts or unavailable runtimes fail before writing.

## Mapping contract

Use the [denial mapping example](../../examples/admin-v2/data-mcp/denial-spike-workup.mapping.json) or the examples for the [other five workflows](../../examples/admin-v2/data-mcp/). The JSON schema is exported as `mappingSchema` from [lib/public-evidence.js](../../lib/public-evidence.js).

| Field | Explicit operator decision |
| --- | --- |
| `workflow_id` / `human_owner` | One existing deep workflow and accountable owner |
| `data_mode` / `source_origin` | `synthetic_only` with `synthetic`, or authorized `aggregate` with `source_derived` |
| `as_of` | Operator-declared case evidence date, independently retained from receipt retrieval dates |
| `bundle_sha256` / `entity_id` / `scope` | Pinned producer bundle, exact entity ID and exact declared scope |
| `data` | Case data structure with null scalar leaves; empty arrays require an explicit owner input |
| `bindings` | Exact JSON pointer, coverage ID, observation ID and expected source measure, type, unit, period, denominator scope and derivation class |
| `owner_inputs` | Explicit administrative labels/owners or other supplied values, each with a date and description; preserved as synthetic or user-supplied evidence |
| `accepted_conflict_ids` | Explicit acknowledgement of relevant producer conflicts marked `accepted_with_rationale`; open conflicts still block |

Array-based workflows are assembled field by field from scalar observations and explicit owner inputs. The producer contract does not support array-valued observations. No literal template values, implicit lookup, zero filling, unit conversion or field repair occurs.

Target units are fixed: claims, USD, visits per week, visits, cases, days, evidence presence, calendar date, document label or label. Baseline denial numerator/denominator periods must match; current numerator/denominator/dollars must match; compared denial populations must match. Access weekly values, payment expected/paid pairs and summed discharge values require matching declared cohorts and periods. These checks cannot prove the truth or fitness of a declared population, that discharge categories are disjoint, or that an expected payment is contractually correct.

## Custody and blockers

Strict transport JSON Schema validation runs before the unmodified upstream producer validator, which checks scalar types, unique IDs, reference relationships, receipt/artifact consistency, ordered periods and its Python canonical bundle hash. Python validation preserves producer float/date serialization semantics; JavaScript does not approximate the producer hash. Duplicate JSON keys, non-finite constants and integers outside JavaScript's safe range are refused rather than losing values in the sidecar.

The complete normalized public bundle remains in the sidecar, including **every entity, observation, source receipt, coverage status, conflict, parent receipt, artifact, caveat and dependency cluster**, even when not selected. The original file is preserved separately with its raw byte hash; the sidecar also records the mapping hash, mapping, leaf-level citations and owner inputs. No source artifact bytes are opened or authenticated. The nested upstream MIT license and [source pin](../../lib/data-mcp-contract/UPSTREAM.json) accompany the vendored contract.

| Condition | Result |
| --- | --- |
| Selected coverage absent, not researched, unavailable, not applicable or conflicted | Typed field-level blocker; no case |
| Wrong entity, source scope, units, period or denominator | Typed scope/fitness blocker; no case |
| Entity conflicts, unresolved identifiers or no declared match decision | Identity review blocker |
| Relevant open conflict, including parent receipts | Conflict review blocker |
| Accepted conflict without explicit acknowledgement | Conflict review blocker |
| Unknown/restricted rights, unsafe citation locator or cyclic/deep parent lineage | Source review blocker |
| Bad producer hash, graph or unsupported observation value | Contract rejection |
| Invalid final case, such as denials exceeding claims | Case blocker |

Only selected evidence and its ancestor receipts affect source rights/conflict checks; unselected missingness and conflicts remain visible in the sidecar. Identity-wide or unscoped open conflicts block conservatively. Restricted/unknown rights cannot be overridden in this importer. Mode declarations are not a PHI detector or an authorization grant. Explicit producer synthetic markers cannot be promoted to aggregate mode.

The pure JS API is `mapPublicEvidence(bundleJson, mappingJson, { python })`. Prefer original JSON text to preserve Python float representation; a parsed JS object may lose a producer's `1.0` representation and therefore fail its checksum. `importEvidence` adds the atomic output bundle. Each encoded validator input/output and each artifact is bounded to 2 MiB; the Python subprocess has a five-second deadline. Transport nesting is limited to 64 levels and case templates to 16 levels. Large inputs must be reduced by the producer/operator without silently discarding relevant evidence.

## Execution and qualification

Mapping does not enable aggregate execution in the default MCP runtime. The operator must explicitly launch its aggregate policy or inject `ToolRuntime({ allowAggregate: true })` in its own JS host loop. Claude/Azure/Databricks Python callbacks still use the default synthetic-only runtime. The eight existing model tools and their definitions remain unchanged; receipt import is an operator-side preprocessing step.

~~~bash
HAG_EVIDENCE_PYTHON=.receipt-venv/bin/python npm run test:public-evidence
~~~

The suite checks all six synthetic mappings against independently specified arithmetic, missingness, conflict/identity/rights failures, producer graph/hash tampering, target units, cohort alignment, source custody, actual CLI output and aggregate policy. The examples were generated by the real pinned Data MCP producer CLI using invented inputs. They do not demonstrate acquisition of public administrative metrics, native model quality, actual clinical records, live Claude/Azure/Databricks SDK operation or customer deployment.

The base release suite runs this optional feature test only when `HAG_EVIDENCE_PYTHON` is supplied and prints an explicit unqualified-feature notice otherwise. Public publication and live-host qualification remain separate gates.

The importer accepts one leading UTF-8 BOM in either JSON input and retains it in the original bundle bytes and raw input hashes. Multiple BOMs are rejected. Access backlog and weekly capacity observations must declare the same population; a backlog snapshot can have its own period. Appeal dates and document observations must share the declared payer/product/decision context in denominator_scope. Source observations are compared even when other fields are operator inputs. Operator inputs carry no machine-verifiable population metadata: the named owner must verify their context, the relevance of snapshots, and the supplied payer rule. These checks establish internal consistency, not factual truth or policy validity.
