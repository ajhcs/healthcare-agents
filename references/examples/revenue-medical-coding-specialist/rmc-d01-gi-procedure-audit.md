---
exemplar_id: rmc-ex-003
agent_slug: revenue-medical-coding-specialist
agents_relevant:
  - revenue-medical-coding-specialist
deliverable_id: rmc-d01
deliverable_title: Coding Audit Report
scenario_summary: Gastroenterology procedure audit for colonoscopy claims with biopsy, polypectomy, and bundling logic questions
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
---

# Coding Audit Report

**Facility**: Meridian GI Center
**Audit Period**: March 2026
**Sample Size**: 24 cases
**Audit Type**: Focused outpatient procedure audit
**Auditor**: Jorge Morales, CPC

## Methodology
- Selection criteria: colonoscopy, biopsy, and polypectomy claims
- Stratification: by physician and same-day add-on service pattern
- Review standard: CPT 2026, CMS NCCI Policy Manual, and CMS OPPS Addenda

## Summary Results
| Metric | Result | Benchmark | Status |
|--------|--------|-----------|--------|
| Overall accuracy rate | 95.8% | >95% | 🟢 |
| Principal diagnosis accuracy | Not applicable | >97% | Not applicable |
| Secondary diagnosis capture | Not applicable | >90% | Not applicable |
| CC/MCC capture rate | Not applicable | >85% | Not applicable |
| Procedure code accuracy | 95.8% | >95% | 🟢 |
| DRG change rate | Not applicable | <10% | Not applicable |
| E/M accuracy (outpatient) | Not applicable | >90% | Not applicable |
| Modifier accuracy | 91.7% | >95% | 🟡 |

## DRG Impact Analysis
| Category | Volume | Net DRG Change | Estimated $ Impact |
|----------|--------|---------------|-------------------|
| Overcoded (DRG decreased) | Not applicable | Not applicable | Not applicable |
| Undercoded (DRG increased) | Not applicable | Not applicable | Not applicable |
| Correct DRG | Not applicable | Not applicable | Not applicable |
| **Net impact** | Not applicable | Not applicable | **$2,940 denied** |

## Top Findings
| # | Finding | Guideline Reference | Frequency | Impact | Recommendation |
|---|---------|-------------------|-----------|--------|---------------|
| 1 | Biopsy and polypectomy were both reported correctly only when the operative note documented separate lesions | CPT 2026 and CMS NCCI | 2/24 | Denial risk | Require lesion-level documentation before separate billing |
| 2 | A distinct encounter modifier was appended without a clear separate-session rationale | CMS NCCI Policy Manual | 3/24 | Claim rework | Use the precise modifier only when the session truly differs |
| 3 | Coverage language for the screening-to-diagnostic transition was inconsistent in the charge notes | CMS OPPS and coverage policy | 1/24 | Administrative delay | Add a charge-entry prompt for screening versus diagnostic intent |

## Coder-Specific Results
| Coder | Records | Accuracy | DRG Accuracy | Key Finding |
|-------|---------|----------|-------------|-------------|
| E. Price | 8 | 100.0% | Not applicable | Clean coding |
| L. Romero | 8 | 87.5% | Not applicable | Distinct-session modifier miss |
| J. Patel | 8 | 100.0% | Not applicable | Strong bundle awareness |

## Education Plan
| Topic | Target Audience | Format | Due Date |
|-------|----------------|--------|----------|
| Lesion-level reporting | GI coders | Op note examples | 2026-04-14 |
| Distinct-session modifiers | Billing team | Modifier cheat sheet | 2026-04-16 |
| Screening versus diagnostic intent | Front-end staff | Charge entry prompt update | 2026-04-18 |

## Regulatory Notes
- The audit used CPT 2026 and CMS NCCI to distinguish separately reportable GI services from bundled components.
- Coverage questions were operational, not clinical, so the fix belonged in front-end charge capture.
- CMS OPPS Addenda reinforced the need to distinguish screening intent from diagnostic follow-up when billing the same-day sequence.
