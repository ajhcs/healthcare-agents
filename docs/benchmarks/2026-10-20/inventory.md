# Early inventory and scope — October 20, 2026

Status: READY WITH LIMITATIONS for public source investigation and isolated documentation. No benchmark, dependency installation, container build, model call, or clinical validation has run here.

## Identity, route, and preservation

The integration owner runs as Unix `builderbob` (uid 1000). Both connected GitHub `get_user_login` and existing `gh api user --jq .login` returned `ajhcs`; connected repository metadata confirmed admin/push permission on `ajhcs/healthcare-agents`. This identifies an account, not a human identity. No credentials were extracted or printed.

Read before mutation: the supplied operating contract; `/home/builderbob/.codex/AGENTS.md`; `/workspace/repos/builderbob/AGENTS.md`; canonical project `AGENTS.md`, README, INSTALL, CONTRIBUTING and package scripts; `/usr/local/share/doc/bob-admin/RUNBOOK.md`; applicable approval rules; bob-migration AGENTS, ENVIRONMENTS and current maintenance records. The isolated branch has an older project AGENTS; the task-specific supplied contract takes precedence. Its routine merge instruction is limited here by the explicit scope to source/document work and commits/PRs; review remains visible in a draft PR. No merge or release approval is inferred.

Canonical checkout: `/workspace/repos/builderbob/healthcare-agents`, branch `codex/healthcare-toolkit-2rr9.5-reusable-contracts`, HEAD `caf532efba23389d3bc8bc8121ee4d4c62292337`.

Existing changes preserved:

| Path | Initial status |
|---|---|
| `.beads/issues.jsonl` | staged modification |
| `AGENTS.md` | unstaged modification |
| `.claude/settings.local.json` | untracked |
| `eval/AGENTS.md` | untracked |

Initial `git worktree list --porcelain` recorded 32 registered worktrees. None was pruned, reset, stashed, switched or reused. No named benchmark checkout was found by a bounded depth-three search of `/workspace/repos/builderbob` and `/workspace/worktrees/builderbob`; this does not establish absence elsewhere. Connected GitHub search (`user:ajhcs fork:true bench`) returned no matches, then exact `ajhcs/<benchmark>` GETs returned 404 before creation. A 404 alone is not universal proof of absence; authenticated account and fork parent readback complete the bounded deduplication evidence.

Remote `main` was checked with `git ls-remote origin refs/heads/main`: `b057d5ab0b4b965d5f66026beec018c88651498d`. `git fetch --no-tags origin main` updated tracking metadata only. New branch `codex/healthcare-benchmark-investigation-20261020` starts there in `/workspace/worktrees/builderbob/healthcare-agents/benchmark-investigation-20261020`. This worktree and `docs/benchmarks/2026-10-20/` have one integration writer; benchmark reviewers have read-only source/report scope. No tracker, prompt, registry, runtime, release claim or Kernspan file is owned by this task. No new Beads ledger or remote worker was started.

## Storage admission and holds

`bob-admin capabilities` listed the existing fixed operations. Sandbox `workspace-status` returned `DEVICE_ALIAS_MISSING`; sandbox `findmnt` showed `/workspace` read-only. The ancestor AGENTS explicitly instructs repeating these read-only checks through approved host escalation. The host read then returned `outcome:ok`, `reason:OK`, Samsung SSD 990 PRO 2TB, UUID `dcb87552-b22f-411c-bd86-4e2da80f1c6f`, `/dev/nvme1n1p1`, ext4, `rw,nodev,nosuid,relatime`. This resolved a sandbox visibility limit; no remount/repair was attempted.

Initial `df -h /workspace`: 1.8T total, 1.6T used, 223G available, 88% used (rounded observations). `free -h`: 30Gi RAM, about 27Gi available; `nproc`: 24 logical CPUs. These are observations, not reserved capacity. Default Node is 18.19.1; an existing Node 22.23.2 binary is available. Python3 and docker launcher paths exist; Docker daemon access, image storage placement, GPU, port availability, dependency compatibility and runtime capacity remain unverified. No heavy inventory/recursive disk scan or installation was performed.

Retained boundaries: SAS/SnapRAID incident media hold; no fsck, mount repair, archive deletion, `apt autoremove`, held kernel removal or firmware action; deferred LittleBob BIOS; protected persistent services and databases; project-specific Directus/Next.js gates; no Plumbob administration; no cleanup/prune or held data retirement. Historical maintenance success does not release those holds. No conflicting active healthcare writer appeared in the bounded app thread listing; this is not an OS-wide writer proof. Fresh admission and exact target ownership are required for every later install/run batch.

## Fork results

The GitHub connector has no fork operation, so the existing `gh` CLI was used. One initial `gh repo fork ... --clone=false --remote=false` failed argument validation before execution; it was corrected using documented REST fork endpoints, not a permission workaround. Four sequential `gh api repos/<upstream>/forks -X POST` calls returned `fork:true`, correct parents and these URLs. Subsequent connected GETs of fork `commits/main` matched each reviewed SHA:

| Fork | Parent | Verified fork HEAD |
|---|---|---|
| [ajhcs/PhysicianBench](https://github.com/ajhcs/PhysicianBench) | HealthRex/PhysicianBench | `c7efa8fd5b1e4744ada50668efe4b7e84023cbb0` |
| [ajhcs/K-NHIB](https://github.com/ajhcs/K-NHIB) | seo-see/K-NHIB | `2e27fa354101e572984b74ef74d4602392dfa32c` |
| [ajhcs/chi-bench](https://github.com/ajhcs/chi-bench) | actava-ai/chi-bench | `4444a07fa68a4f1623f841a292a54e284fc8e7f7` |
| [ajhcs/health-admin-bench](https://github.com/ajhcs/health-admin-bench) | som-shahlab/health-admin-bench | `b88844c8c3e42af717742d795b2c100e646b9b2b` |

No benchmark was cloned locally. Forking retains upstream source/license history but does not authorize restricted data, handbook access, execution, service exposure, publication of derived restricted outputs or API spending. No force push was used. Fork deletion is a separate destructive decision; rollback of this investigation means stop, retain evidence, and close its draft PR if requested.

Later tool-path verification found the existing uv 0.12.17 executable at `/workspace/cache/builderbob/runtimes/uv-0.12.17-x86_64-unknown-linux-gnu/uv`; invoking `--version` succeeded. It is absent from the default PATH. System Python has no pip module. No manager was installed.
