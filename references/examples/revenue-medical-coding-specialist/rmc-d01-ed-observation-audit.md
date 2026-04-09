---
exemplar_id: rmc-ex-001
agent_slug: revenue-medical-coding-specialist
agents_relevant:
  - revenue-medical-coding-specialist
deliverable_id: rmc-d01
deliverable_title: Coding Audit Report
scenario_summary: Emergency department observation audit for chest pain visits with telemetry, troponin workups, and E/M leveling questions
complexity: moderate
mcp_servers_relevant:
  - current_regulatory_policy
  - coding_edit_policy
regulatory_as_of: 2026-04-01
source_basis:
  - ICD-10-CM Official Guidelines for Coding and Reporting FY 2026
  - CPT 2026 Professional Edition
  - CMS MLN E/M Evaluation and Management Services guidance
generated_by: sonnet-4.6
reviewed_by: maintainer
review_status: reviewed
review_date: 2026-04-09
---

# Coding Audit Report

**Facility**: Cedar Point Medical Center
**Audit Period**: February 2026
**Sample Size**: 30 encounters
**Audit Type**: Focused ED observation audit
**Auditor**: Priya Shah, CCS-P

## Methodology
- Selection criteria: chest pain, palpitations, and observation status encounters
- Stratification: by attending physician and billed E/M level
- Review standard: ICD-10-CM FY 2026, CPT 2026, and CMS MLN E/M guidance

## Summary Results
| Metric | Result | Benchmark | Status |
|--------|--------|-----------|--------|
| Overall accuracy rate | 94.0% | >95% | 🟡 |
| Principal diagnosis accuracy | 96.7% | >97% | 🟡 |
| Secondary diagnosis capture | 90.0% | >90% | 🟡 |
| CC/MCC capture rate | Not applicable | >85% | Not applicable |
| Procedure code accuracy | 96.7% | >95% | 🟢 |
| DRG change rate | Not applicable | <10% | Not applicable |
| E/M accuracy (outpatient) | 90.0% | >90% | 🟢 |
| Modifier accuracy | 96.0% | >95% | 🟢 |

## DRG Impact Analysis
| Category | Volume | Net DRG Change | Estimated $ Impact |
|----------|--------|---------------|-------------------|
| Overcoded (DRG decreased) | Not applicable | Not applicable | Not applicable |
| Undercoded (DRG increased) | Not applicable | Not applicable | Not applicable |
| Correct DRG | Not applicable | Not applicable | Not applicable |
| **Net impact** | Not applicable | Not applicable | **$3,240** |

## Top Findings
| # | Finding | Guideline Reference | Frequency | Impact | Recommendation |
|---|---------|-------------------|-----------|--------|---------------|
| 1 | Chest pain workups were coded correctly, but a small number of notes lacked a separate observation status diagnosis | ICD-10-CM FY 2026 | 3/30 | Claim cleanup | Require the observation diagnosis to appear in the final assessment |
| 2 | Troponin review and telemetry monitoring were described consistently, but the audit found one visit with duplicated data counting | CMS MLN E/M guidance | 2/30 | E/M inflation risk | Count each unique data element once |
| 3 | One encounter used a modifier where the documentation already supported a single bundled service | CPT 2026 and CMS NCCI | 1/30 | Denial risk | Remove the modifier unless the record shows a distinct service |

## Coder-Specific Results
| Coder | Records | Accuracy | DRG Accuracy | Key Finding |
|-------|---------|----------|-------------|-------------|
| H. Diaz | 10 | 90.0% | Not applicable | Observation status omission |
| L. Park | 10 | 100.0% | Not applicable | Clean coding with one modifier review issue |
| T. Evans | 10 | 93.3% | Not applicable | Minor data counting error |

## Education Plan
| Topic | Target Audience | Format | Due Date |
|-------|----------------|--------|----------|
| Observation status documentation | ED coders | Quick-reference huddle | 2026-04-14 |
| Unique data counting | E/M coders | Worksheet review | 2026-04-16 |
| Modifier discipline on chest pain workups | Billing team | Claim edit walk-through | 2026-04-18 |

## Regulatory Notes
- The audit aligned to ICD-10-CM FY 2026 and CPT 2026 E/M principles, with CMS MLN guidance used for the outpatient leveling review.
- The main risk was not medical necessity; it was completeness and a small amount of duplicated data counting.
- CMS NCCI confirmed that the single modifier issue was a documentation problem rather than a coverage dispute.
