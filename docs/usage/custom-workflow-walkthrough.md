# Build a community stakeholder interview plan

Use this walkthrough to turn a recurring administrative need into a small, editable instruction pack. The example supports a community health needs assessment (CHNA). It prepares interviews; it does not conduct engagement or establish community priorities.

## Describe the work in ordinary language

Start with a short brief:

> We need a stakeholder interview plan for our defined community. Use the approved, dated community scope and priorities. Identify underserved voices or record the evidence gap. Produce interview questions, recruitment and accessible participation options, and a map from evidence gaps to priority-setting decisions. The community benefit director reviews recruitment, consent and outreach.

Decide what a reviewer should receive and who owns approval before choosing tools. If the scope, priority source or owner is missing, record the question and stop the affected part of the plan.

## Make the editable workflow

Use the pinned source setup in [Installation](../../INSTALL.md#choose-a-version-and-profile). Copy [the example](../../workflows/admin-v2/custom-example.json) to a new working file. Keep the `healthcare-admin.workflow.v2` schema and a registered specialist ID. Edit the purpose, human owner, required evidence, steps, output sections and acceptance checks to match your work.

```bash
cp workflows/admin-v2/custom-example.json community-interview.workflow.json
node bin/cli.js admin validate community-interview.workflow.json
node bin/cli.js admin build community-interview.workflow.json --output ./community-interview-pack
```

Choose a new output directory: the builder refuses an existing destination. A successful build checks structure and writes:

| File | Use |
| --- | --- |
| `SKILL.md` | Compact instructions for the host |
| `references/workflow.json` | Your detailed workflow specification |
| `CASE.template.json` | Empty evidence fields with value, source and as-of date |
| `manifest.json` | Package version, paths, byte counts and SHA256 hashes of the generated files |

A manifest identifies supplied bytes. It does not establish source truth, quality of a plan or acceptance by a host. The custom builder adds instructions; it does not add executable calculations or services.

## Prepare a case and choose a host

Copy `CASE.template.json` to a separate case file. Fill each required input's `value`, `source` and `as_of` from approved evidence. Preserve missingness and conflicting sources rather than choosing a convenient answer. Do not put contact lists or patient records into this example. Keep generated templates unchanged if you want their manifest hashes to remain verifiable; record the separate case file's identity too.

For an existing Codex workspace approved for this evidence, use explicit local-file loading. Replace every placeholder below with the actual path, and ask the host to report any file it could not read:

> Read `<pack>/SKILL.md`, `<pack>/references/workflow.json` and `<case.json>` as task inputs. Use only the supplied evidence to draft the four requested sections. Identify dated source references, missing inputs, conflicts and underserved voices. Separate proposals from established facts. Keep recruitment, consent and outreach approval with the named human owner. Report the exact files read and any blocked work. Do not contact anyone.

Confirm that the host actually read those files; a path in a prompt alone does not prove loading. Retain the source specification, manifest, case and output identities with the host/model condition and date. This explicit-file route does not demonstrate plugin installation, automatic discovery, MCP activation or acceptance by another client. For another host, agree its loading method and evidence handling with its owner first. See the [integration brief](custom-workflow-integration-brief.md).

## Review before use

Use the [review brief](custom-workflow-review-template.md) before an operational handoff. Have a reviewer independently write expected facts and critical failures before inspecting the host's draft. Keep that answer sheet out of the actor's inputs.

Try at least these cases with synthetic data first:

| Case | What to inspect |
| --- | --- |
| Complete, dated scope and priorities | Coverage, interview questions and decision map trace to those inputs; outreach remains proposed |
| Missing priority evidence | The draft identifies missing evidence, asks for it and leaves affected decisions incomplete |
| Conflicting scope or priority sources | Both sources and their dates stay visible; the owner gets a reconciliation question |

Check factual faithfulness, usable output, gaps, ownership and critical errors. Record corrections and noncompletion as well as successes. Schema validation, one successful draft and simulated reviewer role-play do not establish healthcare-leader usability or domain acceptance. Baseline model benchmarks without skills are a separate evaluation condition.

## Revise, repeat or retire

When a case exposes a problem, change the specification under a new revision and build into a new directory. Retain the previous specification, manifest, case, output and review so a reviewer can tell what changed. Repeat the affected cases, including missing and conflicting evidence, before accepting the revision.

Retire the pack when its purpose, source evidence, human owner or host assumptions no longer apply. Mark its status and replacement in your own controlled workflow record, stop loading the retired files, and remove any separately installed copy through that host's removal procedure. Preserve review receipts according to your organization's retention rules.

[Workflow contribution guide](workflow-contribution-guide.md) · [Evidence boundaries](../../README.md#what-the-evidence-establishes)
