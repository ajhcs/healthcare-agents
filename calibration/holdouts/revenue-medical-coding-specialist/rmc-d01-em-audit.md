---
holdout_id: rmc-ho-003
agent_slug: revenue-medical-coding-specialist
agents_relevant:
  - revenue-medical-coding-specialist
deliverable_id: rmc-d01
deliverable_title: Coding Audit Report
seed_ref: calibration/seeds/revenue-medical-coding-specialist/rmc-d01-em-audit.yaml
scenario_summary: Office and outpatient E/M audit for a multispecialty group with possible 99214/99215 inflation and modifier 25 issues
complexity: moderate
mcp_servers_relevant:
  - current_regulatory_policy
  - coding_edit_policy
regulatory_as_of: 2026-04-01
source_basis:
  - CMS MLN E/M Evaluation and Management Services guidance
  - CPT 2026 Professional Edition
  - CMS NCCI Policy Manual
generated_by: sonnet-4.6
reviewed_by: maintainer
review_status: reviewed
review_date: 2026-04-09
frozen: true
superseded_by: null
retirement_trigger: Retire when CMS updates office/outpatient E/M rules or modifier 25 policy in a future rulemaking cycle.
expectations:
  - Audit findings distinguish MDM, time, and modifier 25 errors.
  - The report includes provider-level accuracy and financial impact.
  - Education recommendations target high-risk E/M leveling patterns.
---

# Coding Audit Report

**Facility**: Summit Internal Medicine Group
**Audit Period**: January 1, 2026 - March 31, 2026
**Sample Size**: 40 encounters
**Audit Type**: Focused professional E/M audit
**Auditor**: Elena Novak, CCS-P, CPC

## Methodology
- Selection criteria: established patient visits, same-day injection encounters, and high-level E/M claims
- Stratification: by provider, visit type, and billed CPT code
- Review standard: CPT 2026 E/M rules, CMS MLN guidance, and CMS NCCI modifier logic

## Summary Results
| Metric | Result | Benchmark | Status |
|--------|--------|-----------|--------|
| Overall accuracy rate | 87.5% | >95% | 🟡 |
| Principal diagnosis accuracy | Not applicable | >97% | Not applicable |
| Secondary diagnosis capture | Not applicable | >90% | Not applicable |
| CC/MCC capture rate | Not applicable | >85% | Not applicable |
| Procedure code accuracy | Not applicable | >95% | Not applicable |
| DRG change rate | Not applicable | <10% | Not applicable |
| E/M accuracy (outpatient) | 82.5% | >90% | 🟡 |
| Modifier accuracy | 75.0% | >95% | 🔴 |

## DRG Impact Analysis
| Category | Volume | Net DRG Change | Estimated $ Impact |
|----------|--------|---------------|-------------------|
| Overcoded (DRG decreased) | Not applicable | Not applicable | Not applicable |
| Undercoded (DRG increased) | Not applicable | Not applicable | Not applicable |
| Correct DRG | Not applicable | Not applicable | Not applicable |
| **Net impact** | Not applicable | Not applicable | **$6,180 at risk** |

## Top Findings
| # | Finding | Guideline Reference | Frequency | Impact | Recommendation |
|---|---------|-------------------|-----------|--------|---------------|
| 1 | Time was documented, but the billed level was clearly driven by MDM in several notes, creating mixed-method selection risk | CMS MLN E/M guidance | 8/40 | Leveling inconsistency | Standardize the note template to force a single code selection method per encounter |
| 2 | Modifier 25 was used on same-day procedure claims without a distinct, separately identifiable E/M problem in the assessment | CPT 2026 and CMS NCCI guidance | 6/40 | Denial risk | Require an explicit separate problem statement before billing modifier 25 |
| 3 | Data counting was overstated when the same document or result was counted twice | CMS MLN E/M guidance | 5/40 | Overcoding risk | Use a worksheet that counts each unique data element once |

## Coder-Specific Results
| Coder | Records | Accuracy | Modifier Accuracy | Key Finding |
|-------|---------|----------|-------------------|-------------|
| P. Lewis | 14 | 85.7% | 71.4% | High-level E/M inflation |
| K. Rao | 13 | 84.6% | 76.9% | Modifier 25 used without distinct reason |
| N. Brooks | 13 | 92.3% | 76.9% | Strong MDM review, weak data counting |

## Education Plan
| Topic | Target Audience | Format | Due Date |
|-------|----------------|--------|----------|
| MDM versus time selection | Providers and coders | 30-minute live review | 2026-04-17 |
| Modifier 25 documentation standard | Providers | Template language update | 2026-04-19 |
| Unique data element counting | Coding staff | One-page reference sheet | 2026-04-22 |

## Regulatory Notes
- The audit followed CPT 2026 and CMS MLN rules for selecting office/outpatient E/M by MDM or time, not both.
- Modifier 25 risk was highest where the note described a routine injection visit but did not support a separate problem worthy of a second service.
- CMS NCCI guidance reinforced that the billing issue was documentation discipline rather than a coverage question.
