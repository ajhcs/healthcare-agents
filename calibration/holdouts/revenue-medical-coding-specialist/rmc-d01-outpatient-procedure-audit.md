---
holdout_id: rmc-ho-002
agent_slug: revenue-medical-coding-specialist
agents_relevant:
  - revenue-medical-coding-specialist
deliverable_id: rmc-d01
deliverable_title: Coding Audit Report
seed_ref: calibration/seeds/revenue-medical-coding-specialist/rmc-d01-outpatient-procedure-audit.yaml
scenario_summary: Ambulatory surgery coding audit for bilateral hand procedures with modifier and bundling questions
complexity: moderate
mcp_servers_relevant:
  - coding_edit_policy
  - coverage_determination
regulatory_as_of: 2026-04-01
source_basis:
  - CMS NCCI Policy Manual
  - CPT 2026 Professional Edition
  - CMS OPPS Addenda
generated_by: sonnet-4.6
reviewed_by: maintainer
review_status: reviewed
review_date: 2026-04-09
frozen: true
superseded_by: null
retirement_trigger: Retire when CPT 2027 or a CMS OPPS update changes the modifier logic for the audited procedures.
expectations:
  - Audit findings explain modifier misuse, bundling risk, and laterality accuracy.
  - The report quantifies how often a separate service was incorrectly billed.
  - The education plan targets NCCI and laterality discipline.
---

# Coding Audit Report

**Facility**: Lakeside Ambulatory Surgery Center
**Audit Period**: January 1, 2026 - March 31, 2026
**Sample Size**: 32 cases
**Audit Type**: Retrospective outpatient surgery audit
**Auditor**: Dana Holt, CPC, CPMA

## Methodology
- Selection criteria: bilateral hand procedures, same-day add-on services, and modifier-heavy claims
- Stratification: by surgeon, procedure family, and modifier pattern
- Review standard: CPT 2026, CMS NCCI Policy Manual, and CMS OPPS Addenda

## Summary Results
| Metric | Result | Benchmark | Status |
|--------|--------|-----------|--------|
| Overall accuracy rate | 90.6% | >95% | 🟡 |
| Principal diagnosis accuracy | Not applicable | >97% | Not applicable |
| Secondary diagnosis capture | Not applicable | >90% | Not applicable |
| CC/MCC capture rate | Not applicable | >85% | Not applicable |
| Procedure code accuracy | 93.8% | >95% | 🟡 |
| DRG change rate | Not applicable | <10% | Not applicable |
| E/M accuracy (outpatient) | Not applicable | >90% | Not applicable |
| Modifier accuracy | 78.1% | >95% | 🔴 |

## DRG Impact Analysis
| Category | Volume | Net DRG Change | Estimated $ Impact |
|----------|--------|---------------|-------------------|
| Overcoded (DRG decreased) | Not applicable | Not applicable | Not applicable |
| Undercoded (DRG increased) | Not applicable | Not applicable | Not applicable |
| Correct DRG | Not applicable | Not applicable | Not applicable |
| **Net impact** | Not applicable | Not applicable | **$8,240 denied or delayed** |

## Top Findings
| # | Finding | Guideline Reference | Frequency | Impact | Recommendation |
|---|---------|-------------------|-----------|--------|---------------|
| 1 | Modifier 59 was appended in place of XS/XP where the record supported separate structures or separate encounters | CMS NCCI Policy Manual | 7/32 | Denial exposure | Replace generic 59 usage with the most specific modifier that matches the documentation |
| 2 | Laterality was omitted on one-sided hand procedures even when the op note clearly identified the operative side | CPT 2026 and CMS OPPS coding practice | 5/32 | Claim rework | Force RT/LT capture at the charge entry step |
| 3 | A component service was billed separately despite a column 1/column 2 edit that required bundling | CMS NCCI edit tables | 4/32 | Preventable denial | Add an NCCI edit scrub before claim drop |

## Coder-Specific Results
| Coder | Records | Accuracy | Modifier Accuracy | Key Finding |
|-------|---------|----------|-------------------|-------------|
| M. Torres | 10 | 90.0% | 70.0% | Overuse of modifier 59 |
| R. Singh | 11 | 90.9% | 81.8% | Laterality miss on bilateral cases |
| S. Kim | 11 | 90.9% | 81.8% | Good procedure selection, weak bundling review |

## Education Plan
| Topic | Target Audience | Format | Due Date |
|-------|----------------|--------|----------|
| Specific modifier selection | ASC coders | Modifier decision tree | 2026-04-16 |
| Laterality capture at charge entry | Charge capture team | Workflow checklist | 2026-04-18 |
| NCCI pre-bill scrub | Coding and billing supervisors | Claim edit review session | 2026-04-21 |

## Regulatory Notes
- The audit used CPT 2026 and the CMS NCCI Policy Manual to test whether same-session services were separately reportable.
- Laterality errors were the most common preventable defect because they were visible in the op note but missed in charge capture.
- CMS OPPS Addenda confirmed that the outpatient issue was coding logic, not facility coverage, so the fix belongs in claim edits and coder education.
