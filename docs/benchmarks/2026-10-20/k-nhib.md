# K-NHIB pinned engineering review

Reviewed commit: [`2e27fa354101e572984b74ef74d4602392dfa32c`](https://github.com/seo-see/K-NHIB/tree/2e27fa354101e572984b74ef74d4602392dfa32c). Fork: [ajhcs/K-NHIB](https://github.com/ajhcs/K-NHIB). Status: source and synthetic workbook inspected; NOT READY for a valid Luna comparison. No upstream Python code was imported/executed, installed, or called against an API.

## Scope and fixtures

[README](https://github.com/seo-see/K-NHIB/blob/2e27fa354101e572984b74ef74d4602392dfa32c/README.md) and [data dictionary](https://github.com/seo-see/K-NHIB/blob/2e27fa354101e572984b74ef74d4602392dfa32c/data/DATA_DICTIONARY.md) describe synthetic/processed Korean gynecologic oncology reimbursement cases. `undeterminable` means no criterion is explicitly violated but at least one required fact cannot be evaluated; it must remain separate from `ineligible`. This measures a narrow Korean National Health Insurance task, not US billing competence or patient-care validity.

The integrator independently fetched the pinned public `data/benchmark/K-NHIB_GY.xlsx` through the GitHub contents JSON API, decoded base64 in memory, and counted standard-library ZIP/XML rows and label cells. No file was saved and no benchmark code was used. Result:

| Sheet | Nonempty case IDs | eligible | ineligible | undeterminable |
|---|---:|---:|---:|---:|
| cervical | 45 | 15 | 15 | 15 |
| uterine | 51 | 17 | 17 | 17 |
| ovarian | 126 | 42 | 42 | 42 |
| Total | 222 | 74 | 74 | 74 |

Workbook: 21,041 bytes, Git blob `99e8b6f03981f8c0927968bf59dabb4aace688ea`, SHA256 `76fcad20a7fd18aa63b2e6da252db684aa06ca4642508f9ec70e861449effffa`. First cervical IDs: `FW-C-R1-pos`, `FW-C-R1-neg`, `FW-C-R1-unk`. Workbook counts agree with documentation's 74 regimens × three construction classes; counts do not independently validate reimbursement labels or anonymity. Korean cancer labels are derived from English sheet names by `FORWARD_SHEET_MAP`.

## Execution, tools, and scoring

[`code/benchmark_pipeline.py`](https://github.com/seo-see/K-NHIB/blob/2e27fa354101e572984b74ef74d4602392dfa32c/code/benchmark_pipeline.py) owns prompt text and runtime. `load_benchmark` loads workbook rows; `build_forward_user_prompt` supplies cancer, regimen and attributes, not expected labels. `get_system_prompt` switches only `pdf_structure` to the structured prompt. `call_claude`, `call_gpt`, and `call_gemini` implement provider adapters. It is independent classification, not a stateful EHR simulator; reset means a fresh request and empty isolated output directory, without previous answers in context.

The CLI defaults to three model aliases × three conditions × 222 cases  = 1,998 logical requests per run before retries. Calling `run_evaluation` without explicit conditions uses six conditions  = 3,996. Six supported exact study models exist, but default aliases select only three. Never run the bare quick start as a smoke. `--n-runs` multiplies the count. `API_MAX_RETRIES` defaults 2, yielding up to three attempts for retryable failures; httpx timeout is 120 seconds per OpenAI request.

Conditions: `pdf` main analysis; `pdf_websearch`; `pdf_structure`; `text_md`; and development `websearch`/`text_md_websearch`. PDF input attaches per-cancer guideline bytes natively; `code/pdf_parser.py` uses pdfplumber for text conditions in adapters that implement them. Web search adds provider-managed tools and mutable external content, cost and network. Initial paired testing should use `pdf`, web search off, same guideline hash and same prompt. Structured prompting and healthcare skill injection are separate interventions.

`parse_model_output` parses JSON/fenced JSON or normalizes textual labels with `parse_answer`. Grading is deterministic equality against `expected`; no LLM judge is required. `aggregate_results.py` calculates accuracy/macro metrics and per-class metrics with sklearn, error count, cancer/class breakdowns. Invalid and API-error rows must remain in the denominator. Report false eligibility and undeterminable-to-eligible transitions separately, rather than hiding them in overall accuracy. Reason text is recorded but is not validated by a judge. No reference model response/results bundle ships: `results/` is gitignored, and manuscript figure/error-taxonomy/bootstrap scripts are absent.

## Source defects and comparison blockers

1. Generator `OUTPUT_DIR=REPO_DIR/'results'`, while [`aggregate_results.py`](https://github.com/seo-see/K-NHIB/blob/2e27fa354101e572984b74ef74d4602392dfa32c/code/aggregate_results.py) sets `RESULTS_DIR=Path(__file__).resolve().parent/'results'` (under `code/`). Running both root commands unchanged will not score generator output. An empty glob also reaches `pd.concat([])`. Align paths and reject zero/missing expected rows before execution.
2. Scorer `CANONICAL_MODELS` recognizes older study names only and `is_main_analysis` additionally filters to `run_id==0`. Luna and repeated runs would disappear from main summaries. Parameterize model/effort/replicate identity and keep every planned row.
3. Pipeline `RESULT_KEY_COLUMNS=['id','model','condition']` and retry merge keys omit `run_id` and effort. Repeated runs can collapse during retry/merge; both arms would collide if called the same model. Use immutable episode IDs with model, effective effort, condition, replicate, fixture hash, skill condition and attempt. Preserve original attempts rather than overwriting failures.
4. `call_gpt` recognizes native-PDF conditions but its non-PDF branch passes only `build_user_prompt(row)`. It never calls `get_pdf_text` for `text_md`, and `uses_websearch` omits `text_md_websearch`. Its results therefore do not implement the described OpenAI text conditions. Avoid those cells until corrected and request assembly is tested offline.
5. Luna is absent from `SUPPORTED_MODEL_CODES`, model-provider mapping and argparse choices. The Responses endpoint is appropriate, but `call_gpt` omits explicit `reasoning.effort`; upstream cannot compare medium/max by a flag. Add exact model plus explicit medium/max, preserve response ID/status/incomplete details, usage breakdown, and returned model. `extract_openai_response_text` alone does not establish a complete response.
6. `load_local_env` looks under `code/.env` and `code/.env.local`, while README copies `.env` to repository root. Use explicit environment injection later; do not copy credentials for this investigation.
7. Requirements use lower bounds rather than a lock; `pandas>=2.0.0` does not guarantee support for `groupby.apply(include_groups=False)` used by scorer, and Markdown report generation needs a compatible `tabulate` dependency which is not listed. Resolve and hash a complete tested environment separately; a historical Python 3.10 guide is not a lock.
8. Import itself locates PDFs, reads local env and creates `results/`; importing is execution with side effects. Source/AST review is safer before action-specific approval.

## Licenses and access

[`LICENSE`](https://github.com/seo-see/K-NHIB/blob/2e27fa354101e572984b74ef74d4602392dfa32c/LICENSE) assigns MIT to code/scripts, CC BY 4.0 to benchmark dataset, prompts and original documentation, with separate `LICENSE-CODE`/`LICENSE-DATA`. Retain authors, copyright, source/DOI and attribution plus modifications. Upstream characterizes HIRA guideline PDFs as official public notices outside copyright under Korean law; this is an upstream rights statement, not an independently issued legal conclusion. Preserve notices and dated guideline identity. No login or purchased resource is required for the public workbook; no credentials/terms were provisioned or accepted.

## BuilderBob setup proposal, resources, and rollback

Lightest candidate of these four for a first synthetic readiness test: no browser/server/container is inherently needed for classification. Public tree is small (approximately4.1MB of PDF guideline assets plus workbook/source); GitHub repository size metadata was2,755KB, not an installed size. Propose a2 GiB aggregate source/venv/wheel/output cap, one process, two CPU threads,2 GiB RAM,15-minute batch wall clock; these are proposed admission ceilings, not measured requirements. Reject if fresh disk free falls below150GiB or another owner needs the capacity. Python 3.10+ syntax is used; installed 3.12 is not yet qualified. No listener/port is needed. Installation permits approved package-index egress only; offline synthetic smoke requires zero egress and no credentials. Later model execution permits only the exact approved API endpoint, with tools/search disabled initially.

A later reviewed patch must add bounded `--case-id`/`--limit` selection, an explicit output path, model/effort configuration, complete usage/response capture and isolated scorer keys. No such patch or command is represented as already implemented. Do not substitute an unsupported command line for this missing functionality.

First executable candidate after separate approval: isolated pinned source checkout, reviewed/hash-locked environment with wheel-only installation, then `env -u OPENAI_API_KEY -u ANTHROPIC_API_KEY -u GEMINI_API_KEY API_MAX_RETRIES=0 python -B code/benchmark_pipeline.py --dry-run --models gpt --conditions pdf --cancer 자궁경부암 --delay 0 --n-runs 1` under an externally enforced no-network sandbox and60-second timeout. This is45 placeholder rows, not model performance; dry-run always predicts eligible. It can test workbook plumbing only. Do not aggregate these with real results. Prefer a reviewed three-case wrapper (first cervical pos/neg/unk) for subsequent offline request-construction tests and, only later, paid classification.

Keep environment/cache/TMPDIR/output entirely within the newly approved Samsung run root. Rollback is stop the one run, retain immutable manifest/logs, remove only that run's approved disposable environment/cache after exact owner review. No global Python changes, broad cache prune or old-worktree removal. Installation and this dry-run have not been approved or executed.
