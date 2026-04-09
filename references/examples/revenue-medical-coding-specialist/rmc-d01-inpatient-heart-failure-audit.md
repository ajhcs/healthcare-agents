---
exemplar_id: rmc-ex-002
agent_slug: revenue-medical-coding-specialist
agents_relevant:
  - revenue-medical-coding-specialist
deliverable_id: rmc-d01
deliverable_title: Coding Audit Report
scenario_summary: Inpatient heart failure audit for a teaching hospital with encephalopathy, AKI, and principal diagnosis sequencing questions
complexity: high
mcp_servers_relevant:
  - current_regulatory_policy
  - coding_edit_policy
regulatory_as_of: 2026-04-01
source_basis:
  - CMS ICD-10-CM Official Guidelines for Coding and Reporting FY 2026
  - CMS MS-DRG Definitions Manual v43.0
  - 42 CFR 412
generated_by: sonnet-4.6
reviewed_by: maintainer
review_status: reviewed
review_date: 2026-04-09
---

# Coding Audit Report

**Facility**: Harborview Teaching Hospital
**Audit Period**: March 2026
**Sample Size**: 28 records
**Audit Type**: Focused inpatient medical audit
**Auditor**: Simone Lee, CCS

## Methodology
- Selection criteria: heart failure, encephalopathy, and AKI discharges
- Stratification: by attending team and DRG family
- Review standard: ICD-10-CM FY 2026, MS-DRG v43.0, and 42 CFR 412

## Summary Results
| Metric | Result | Benchmark | Status |
|--------|--------|-----------|--------|
| Overall accuracy rate | 92.9% | >95% | 🟡 |
| Principal diagnosis accuracy | 100.0% | >97% | 🟢 |
| Secondary diagnosis capture | 85.7% | >90% | 🟡 |
| CC/MCC capture rate | 82.1% | >85% | 🟡 |
| Procedure code accuracy | 100.0% | >95% | 🟢 |
| DRG change rate | 10.7% | <10% | 🟡 |
| E/M accuracy (outpatient) | Not applicable | >90% | Not applicable |
| Modifier accuracy | Not applicable | >95% | Not applicable |

## DRG Impact Analysis
| Category | Volume | Net DRG Change | Estimated $ Impact |
|----------|--------|---------------|-------------------|
| Overcoded (DRG decreased) | 1 | -0.09 | ($5,100) |
| Undercoded (DRG increased) | 2 | +0.18 | $13,700 |
| Correct DRG | 25 | Not applicable | Not applicable |
| **Net impact** | 28 | **+0.09** | **$8,600** |

## Top Findings
| # | Finding | Guideline Reference | Frequency | Impact | Recommendation |
|---|---------|-------------------|-----------|--------|---------------|
| 1 | Acute encephalopathy was documented in the progress note but not always captured as a secondary diagnosis | ICD-10-CM FY 2026 Chapter 18 | 4/28 | MCC loss | Trigger a query when mental status change is clearly treated |
| 2 | Heart failure acuity was present in the chart, but the code often stopped at an unspecified chronic HF label | ICD-10-CM FY 2026 Chapter 9 | 3/28 | CC/MCC loss | Code the acute-on-chronic or acute specification when the record supports it |
| 3 | AKI was clinically treated but not consistently reflected in the final coded set | ICD-10-CM FY 2026 Chapter 14 | 2/28 | DRG shift | Add a renal dysfunction query when creatinine trend and treatment support AKI |

## Coder-Specific Results
| Coder | Records | Accuracy | DRG Accuracy | Key Finding |
|-------|---------|----------|-------------|-------------|
| M. Grant | 9 | 88.9% | 88.9% | Missed encephalopathy capture |
| A. Nguyen | 9 | 100.0% | 88.9% | Strong coding with one HF acuity omission |
| R. Bell | 10 | 90.0% | 90.0% | AKI capture improvement needed |

## Education Plan
| Topic | Target Audience | Format | Due Date |
|-------|----------------|--------|----------|
| Encephalopathy versus confusion | Inpatient coders | Case study review | 2026-04-15 |
| Acute-on-chronic heart failure coding | CDI and coders | Physician note examples | 2026-04-17 |
| AKI query triggers | CDI specialists | Trigger checklist | 2026-04-21 |

## Regulatory Notes
- The audit used ICD-10-CM FY 2026 and CMS MS-DRG v43.0 to validate severity capture and sequencing.
- Acute encephalopathy and AKI changed payment only when they were documented clearly enough to survive coding review.
- 42 CFR 412 framing mattered because the missed diagnoses directly changed the hospital payment profile.
