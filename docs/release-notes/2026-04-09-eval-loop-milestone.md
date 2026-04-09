# Release Notes: 10-Agent Eval Loop Milestone

**Date**: 2026-04-09

## Headline

10 of 51 healthcare administration agents now score 80+ on a rigorous 0--100 automated eval, up from zero. This is the first known automated improvement loop for healthcare admin AI agents -- iterative exam generation, rubric-locked scoring, targeted prompt edits, and git-ratcheted commits, all running without human intervention.

## What Changed

We shipped a complete `/eval` improvement loop. Each iteration works like this:

1. **Generate** a 25-question domain exam from the agent's system prompt.
2. **Score** answers against a frozen rubric weighted Accuracy 0.40, Completeness 0.35, Specificity 0.25.
3. **Identify** the weakest areas and propose targeted prompt edits (with explicit identity-preservation constraints so prompts get sharper, not flatter).
4. **Edit** the agent prompt -- additive, high-leverage changes only, respecting a fixed line cap.
5. **Re-score** using the same frozen question set.
6. **Commit or revert** automatically. If the score improved, the edit stays and a row is appended to `eval/results.tsv`. If not, the file is restored. No regressions ship.

The loop uses a split-role architecture: a strong scorer/judge model generates exams and critiques, a faster editor model patches prompts, and a parent orchestrator owns git writes and the append-only log. This avoids the identity drift that comes from letting a single model optimize itself.

## Agents Improved

All 10 agents crossed the 80-point threshold. Best post-edit scores:

| Agent | Best Score | Key Improvements |
|-------|-----------|------------------|
| Revenue Medical Coding Specialist | 82.15 | LCD/NCD medical necessity, charge capture workflows, global-period and anesthesia coding |
| Revenue Finance Manager | 81.55 | Multi-campus cost reports, capital post-implementation review, zero-based budgeting |
| Revenue 340B Program Manager | 81.20 | Orphan-drug exclusion, Medicare Part B modifier mechanics, ADR/CMP dispute workflow |
| Quality Compliance Officer | 81.15 | HIPAA breach exceptions, Stark failure modes, exclusion reinstatement controls |
| Healthcare Interoperability Engineer | 81.10 | SMART on FHIR auth/PKCE/JWT, HL7 ACK idempotency, TEFCA patient-matching governance |
| Quality Process Improvement Analyst | 80.85 | Managed-care QAPI (42 CFR 438.330), sentinel event RCA/CAPA, risk-adjusted outcomes |
| Revenue Cycle Specialist | 80.65 | 835/ERA posting controls, credit balance workflow, denial-type-specific appeal assembly |
| Revenue Contract Analyst | 80.45 | Contract build hierarchy, outpatient edit logic, prompt-pay and offset economics |
| Payer Managed Care Analyst | 80.30 | Medicaid directed payments, settlement reconciliation, MA bid-to-revenue bridge |
| Health Informatics Manager | 80.30 | FHIR/SMART production ops, public-health reporting controls, identity and downtime governance |

The Medical Coding Specialist saw the largest single-iteration gain at +11.00 points. The Compliance Officer improved +9.05 in one pass. Most agents required 1--3 iterations to cross 80.

## What Was Added to Prompts

The eval loop does not add generic advice. It adds the specific knowledge that domain practitioners would expect and that the rubric penalizes when absent:

- **CFR citations**: 42 CFR 412.106(b) (DSH qualification), 42 CFR Part 419 (OPPS), 42 CFR 412.4(f) (transfer DRGs), 42 CFR 438.330 (managed-care QAPI), 45 CFR 164 (HIPAA Security Rule controls)
- **Worked calculation examples**: IME and DGME formulas with FTE rules, DSH patient-percentage calculations, OPPS APC payment formulas, transfer DRG per diem calculations
- **Regulatory formulas**: IRC 141/148 bond compliance, payer mix shift methodology, outlier payment reconciliation mechanics
- **Audit process details**: MAC audit lifecycle with PRRB appeal paths, reasonable collection effort criteria per CMS Pub 15-1 Section 310, HRSA ADR/CMP dispute-file requirements
- **Debt covenant structures**: Specific threshold structures, credit-balance and overpayment workflows, prompt-pay and offset modeling
- **Payment mechanics**: 835/ERA control points, Medicaid supplemental payment modeling, observation-status and 340B outpatient economics, Medicare Advantage bid/rebate/RAF revenue bridges

## Infrastructure Shipped

Three pull requests delivered the full stack:

| PR | Title | Scope |
|----|-------|-------|
| [#4](https://github.com/ajhcs/healthcare-agents/pull/4) | Enrich all 51 agent prompts with examples and seeds | 53 files -- baseline prompt enrichment across every agent |
| [#5](https://github.com/ajhcs/healthcare-agents/pull/5) | Add eval calibration infrastructure and provider framework | 709 files -- rubric, scoring harness, provider framework, calibration tooling |
| [#6](https://github.com/ajhcs/healthcare-agents/pull/6) | Add orchestrator agent and lifecycle documentation | 11 files -- orchestrator design, lifecycle docs, design specs |

Merged separately: [#7](https://github.com/ajhcs/healthcare-agents/pull/7) landed the 10-agent improvements themselves (18 files, 759 additions).

## Calibration Results

A pilot calibration run validated the scoring infrastructure before the improvement loop began:

- **Mean calibration delta**: +0.198 (scorer alignment improved significantly after rubric tuning)
- **Lint pass rate**: 0.48 to 0.88 (prompt structural quality nearly doubled)

The frozen rubric at `eval/rubric.md` locks the scoring weights so improvements are comparable across iterations and agents. Scores from different iterations of the same agent are not directly compared -- the same-question pre/post design within each iteration is the unit of measurement.

## Design Decisions Worth Noting

**Split-role architecture.** A single model optimizing its own prompt tends to drift toward generic executive tone and lose domain edge. Separating the scorer (which identifies gaps and specifies what to preserve) from the editor (which patches the file) keeps prompts sharp.

**Identity preservation.** The scorer returns `identity_to_preserve` and `anti_patterns_to_avoid` alongside `weak_areas`. The editor is constrained to make the prompt more capable, not more average. This is why prompts gained specific CFR citations and payment formulas instead of broad best-practice boilerplate.

**Line cap enforcement.** Each agent file has a fixed line cap based on its baseline. Edits must fit within the cap. This forces compression and prioritization rather than unbounded growth.

**Git ratchet.** Every improvement is committed atomically. Every failed edit is reverted. The append-only `eval/results.tsv` log provides a complete audit trail. No regressions ship.

## What Is Next

- **41 agents remaining.** The loop is proven and repeatable. Target cadence is roughly 5 agents per week.
- **30+ agents at 80+ by mid-May.** That threshold gives publishable coverage across all 10 agent categories (Revenue, Clinical, Quality, Payer, Operations, Health IT, Population Health, Pharmacy, Strategy, Emergency Preparedness).
- **Second-pass depth.** Agents already at 80 can run additional iterations targeting 85+ as the rubric surface area becomes well-understood.
- **Cross-agent consistency.** As more agents pass through the loop, patterns in weak areas will inform batch improvements to prompt architecture across the full set.
