# Changelog

## 2026-03-28

### Added
- Cross-tool self-improvement kit for Claude Code and Codex via [AGENTS.md](AGENTS.md), [.claude/commands/eval.md](.claude/commands/eval.md), [eval/rubric.md](eval/rubric.md), [eval/results.tsv](eval/results.tsv), and [scripts/install-self-improvement-kit.sh](scripts/install-self-improvement-kit.sh).
- Prompt-quality audit script at [scripts/audit-agents.py](scripts/audit-agents.py) to rank the weakest agents and measure improvement passes.
- Initial role baseline for the medical coding specialist at [eval/role-baselines/revenue-medical-coding-specialist.md](eval/role-baselines/revenue-medical-coding-specialist.md).

### Changed
- Updated [README.md](README.md) and [INSTALL.md](INSTALL.md) to document the simple self-improving setup for Claude Code and Codex.
- Tightened [scripts/lint-agents.sh](scripts/lint-agents.sh) so it validates canonical agent headings and treats the exam architect as a utility prompt.
- Strengthened prompt coverage in:
  - [agents/healthit-epic-applications-analyst.md](agents/healthit-epic-applications-analyst.md)
  - [agents/operations-workforce-manager.md](agents/operations-workforce-manager.md)
  - [agents/payer-medicare-outreach-coordinator.md](agents/payer-medicare-outreach-coordinator.md)
  - [agents/quality-patient-experience-coordinator.md](agents/quality-patient-experience-coordinator.md)
  - [agents/quality-process-improvement-analyst.md](agents/quality-process-improvement-analyst.md)
  - [agents/quality-risk-manager.md](agents/quality-risk-manager.md)
  - [agents/revenue-340b-program-manager.md](agents/revenue-340b-program-manager.md)
  - [agents/strategy-operations-consultant.md](agents/strategy-operations-consultant.md)
  - [agents/strategy-structural-improvement-consultant.md](agents/strategy-structural-improvement-consultant.md)

### Verification
- `bash scripts/lint-agents.sh`
- `python3 -m py_compile scripts/audit-agents.py`
- `python3 scripts/audit-agents.py --top 5`
