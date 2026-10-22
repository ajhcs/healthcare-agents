# Healthcare benchmark investigation — October 20, 2026

The four authorized forks exist under `ajhcs`. Public source investigation is complete within the evidence limits below; benchmark execution and the Luna comparison are NOT READY. No benchmark task, dependency installation, image build, patient-data download or billed model call ran here. This package proposes setup and later bounded checks; it does not approve them.

| Benchmark / pinned report | What it measures | Main readiness gate |
|---|---|---|
| [PhysicianBench](physicianbench.md) | Clinical FHIR workflows: 100 task definitions, 670 taxonomy checkpoints | Separate patient-image terms/digest, host-tool isolation, Responses/scorer changes |
| [K-NHIB](k-nhib.md) | 222 synthetic Korean oncology reimbursement cases; three labels | Luna effort/selection and scorer/result identity repairs; locked environment |
| [CHI-Bench](chi-bench.md) | Published 75 base / 23 coupled / 3 marathon workflows | Immutable fixture payload unresolved; gated handbook; max/budget adapter |
| [HealthAdminBench](health-admin-bench.md) | Synthetic browser administration | V3 inspected grid: 135 tasks / 1,694 checks, versus V2 1,698; adapter and install/browser gates |

Read [early inventory and fork receipts](inventory.md), [machine-readable source manifest](sources.json), [Luna Medium/Max protocol](luna-protocol.md) and [bounded action proposal](approval-batch.md). The manifest records source evidence, not model results. [Verification](verification.md) records actual document checks and limitations.

Recommended order is K-NHIB synthetic plumbing first because it needs no EHR/browser/container or external judge, then CHI mocked layout/adapter checks, HAB local portal state checks, and PhysicianBench invented harness. This is an engineering proposal based on the inspected dependencies/access, not an observed runtime ranking. Native tasks need their own subsequent admission and access/cost approval.

The integration owner alone writes this documentation worktree. Three read-only reviewers inspected PhysicianBench, CHI and HAB; the integrator reviewed K-NHIB and checked critical source findings independently. All source pins are full commits; external CHI fixtures and PhysicianBench image are not pinned or approved. No prompt/router/registry, tracker, lockfile, model score, service or Kernspan source changed.

Detailed runbook commands are marked proposed and have prerequisites. CPU/memory/storage limits described there require an approved enforcement mechanism; the shown timeout commands alone enforce only elapsed time. Missing tools, dependencies, gated assets and unresolved outputs are explicit gates, not instructions to install globally or use an alternate route.
