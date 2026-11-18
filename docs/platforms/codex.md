# Codex

For **2.0.0-beta.3**, start with [version and profile selection](../../INSTALL.md#choose-a-version-and-profile). The [package-owned local profile](admin-v2-stdio-bridge.md) documents the exact tested POSIX host, preparation, activation and removal. Follow its dependency preflight; host/client versions outside that record need separate acceptance.

The beta `healthcare-agents` router matches the request against a compact workflow index and opens each selected workflow’s detail file. For each deliverable without a matching workflow, it opens the selected specialist’s compact brief. Full specialist prompts supply detailed methods and templates when needed. Free-text CLI calls offer discovery candidates. Use `--selection` with a rationale for host-inferred IDs, preserving the order of all requested workups. Use `--workflow` or `--agent` when the user explicitly selected the ID. [Routing authority](../admin-v2/routing-authority.md)

Describe the artifact as you would to a colleague. Include the evidence they
can use and the checks you will run when you review it.

```text
Use Healthcare Agents to draft an appeal evidence map from the supplied notice and policy. Show the deadline source, missing documents, and what the treating clinician needs to verify.

Use Healthcare Agents to investigate the increase in denied claims. Reconcile both cohorts, test whether the change follows a policy or an intake issue, and show what the revenue cycle owner can verify.

Draft a clinic access dashboard specification using our current report as the reference. Define the denominators, site and visit-type filters, and the sample cases to verify at the intended screen size.
```

Medium reasoning effort suits bounded triage. Use High when evidence must be
traced across systems, and Extra High when several causes could interact.
Reserve Ultra for investigations with substantial independent questions.
The router supports delegation of those questions using approved aggregate or
synthetic evidence, with the parent reconciling source versions and findings.
For visual work, ask to render at the intended size and try the interactions
you expect to use. [GPT‑6.2 prompting guide](https://learn.chatgpt.com/guides/prompting-gpt-6-2-astra)

## Custom instruction packs

The [CHNA walkthrough](../usage/custom-workflow-walkthrough.md) uses explicit local-file loading in an existing approved workspace. Building a pack alone does not install a plugin, register a tool or prove automatic discovery. Record exactly which files the host read and review its output before operational use.

## Legacy prompt-copy profile

From the pinned source checkout described in the installation guide:

```bash
node bin/cli.js install --codex --dry-run
node bin/cli.js install --codex
```

This older profile writes specialist prompts and a managed block in `~/.codex/AGENTS.md`, preserving other user content. The managed block points Codex to the relevant workflow skill or local specialist prompt. Workflow skills can be copied separately with `node bin/cli.js install --codex-skills`.
