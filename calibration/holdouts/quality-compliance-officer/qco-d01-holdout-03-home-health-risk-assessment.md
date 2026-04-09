---
holdout_id: qco-d01-holdout-03
agent_slug: quality-compliance-officer
agents_relevant:
  - quality-compliance-officer
deliverable_id: qco-d01
deliverable_title: Annual Compliance Risk Assessment
seed_ref: calibration/seeds/quality-compliance-officer/qco-d01-seed-03-home-health-overpayment-exclusion.yaml
scenario_summary: Medicare-certified home health agency with documentation defects, a delayed overpayment return, and incomplete screening for contractors.
complexity: moderate
mcp_servers_relevant:
  - provider_directory
  - current_regulatory_policy
source_basis:
  - OIG General Compliance Program Guidance (November 2023)
  - 42 CFR Part 484
  - 42 U.S.C. 1320a-7k(d)
  - 45 CFR Parts 160 and 164
expectations:
  - Address the open overpayment as a time-sensitive repayment issue.
  - Distinguish documentation defects from billing workflow defects.
  - Expand exclusion screening to contractors and per diem clinicians.
  - Include monitoring steps that are feasible within one quarter.
generated_by: sonnet-4.6
reviewed_by: opus-4.6
review_status: reviewed
review_date: 2026-04-09
regulatory_as_of: 2026-04-09
frozen: true
retirement_trigger: Replace if Medicare home health conditions of participation or overpayment rules materially change.
---

# Annual Compliance Risk Assessment

**Organization**: Riverbend Home Health Services  
**Assessment Period**: Fiscal Year 2026  
**Compliance Officer**: Maya Chen, CHC  
**Date Completed**: 2026-04-09  
**Approved By**: Compliance Committee on 2026-04-09

## Methodology
This review used audit findings, visit-note completion rates, contractor screening logs, complaint intake data, and finance reports on unresolved overpayments. The assessment was grounded in Medicare home health requirements at 42 CFR Part 484, the 60-day overpayment return rule at 42 U.S.C. 1320a-7k(d), and the OIG General Compliance Program Guidance issued in November 2023.

## Risk Universe
| # | Risk Area | Description | Likelihood | Impact | Risk Score | Existing Controls | Residual Risk | Priority |
|---|---|---|---:|---:|---:|---|---|---|
| 1 | Visit-note documentation gaps | Clinician signatures and required visit elements are missing on a recurring subset of charts. | 4 | 4 | 16 | EMR signature reminder | Medium | High |
| 2 | Delayed overpayment return | An identified overpayment remains open beyond the expected repayment workflow window. | 4 | 5 | 20 | Finance review queue | High | High |
| 3 | Screening gaps for contractors | Temporary clinicians and contractors are not always captured in the monthly exclusion-screening log. | 3 | 5 | 15 | Employee screening list | Medium | High |

## Top Priority Risks
- Delayed overpayment return is the highest priority because the 60-day rule creates escalation risk once the agency has identified and quantified the overpayment.
- Documentation gaps remain high risk because the agency cannot prove that visit requirements were satisfied on all billed encounters.
- Screening gaps must be addressed before the next contractor onboarding cycle to avoid preventable exclusion exposure.

## Planned Response
- Assign the open overpayment to finance and compliance with a hard 30-day deadline for quantification and repayment.
- Add a second-level chart audit for high-volume clinicians until signature completion exceeds 98 percent.
- Require every contractor, per diem nurse, and therapist to be added to the monthly screening roster before the first visit.
- Report progress to the board with a simple dashboard that tracks open overpayments, audit defect rate, and screening completion.

## Risk Sources Consulted
- OIG General Compliance Program Guidance (November 2023)
- 42 CFR Part 484
- 42 U.S.C. 1320a-7k(d)
- 45 CFR Parts 160 and 164
- Audit workpapers
- Finance overpayment log
- Monthly screening log
