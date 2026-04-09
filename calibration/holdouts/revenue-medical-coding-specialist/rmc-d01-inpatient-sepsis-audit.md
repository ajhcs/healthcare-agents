---
holdout_id: rmc-ho-001
agent_slug: revenue-medical-coding-specialist
agents_relevant:
  - revenue-medical-coding-specialist
deliverable_id: rmc-d01
deliverable_title: Coding Audit Report
seed_ref: calibration/seeds/revenue-medical-coding-specialist/rmc-d01-inpatient-sepsis-audit.yaml
scenario_summary: Inpatient sepsis coding audit for a community hospital with respiratory failure, AKI, and POA timing questions
complexity: high
mcp_servers_relevant:
  - coding_edit_policy
  - current_regulatory_policy
regulatory_as_of: 2026-04-01
source_basis:
  - CMS ICD-10-CM Official Guidelines for Coding and Reporting FY 2026
  - CMS MS-DRG Definitions Manual v43.0
  - 42 CFR 412
generated_by: sonnet-4.6
reviewed_by: maintainer
review_status: reviewed
review_date: 2026-04-09
frozen: true
superseded_by: null
retirement_trigger: Retire when FY2027 ICD-10-CM or MS-DRG v44.0 materially changes sepsis or respiratory failure coding.
expectations:
  - Audit findings quantify principal diagnosis accuracy, secondary diagnosis capture, CC/MCC capture, and DRG shift impact.
  - The report names the exact guideline and DRG references driving the findings.
  - The education plan targets the sepsis, respiratory failure, and POA error pattern.
---

# Coding Audit Report

**Facility**: Riverside Regional Hospital
**Audit Period**: January 1, 2026 - March 31, 2026
**Sample Size**: 48 records
**Audit Type**: Retrospective focused inpatient audit
**Auditor**: Marisol Vega, CCS, CPC

## Methodology
- Selection criteria: targeted review of sepsis, respiratory failure, and AKI discharges
- Stratification: by MS-DRG, attending physician, and admitting service
- Review standard: ICD-10-CM/PCS FY 2026 Guidelines, CMS MS-DRG v43.0, and 42 CFR 412

## Summary Results
| Metric | Result | Benchmark | Status |
|--------|--------|-----------|--------|
| Overall accuracy rate | 91.7% | >95% | 🟡 |
| Principal diagnosis accuracy | 97.9% | >97% | 🟢 |
| Secondary diagnosis capture | 84.4% | >90% | 🟡 |
| CC/MCC capture rate | 79.2% | >85% | 🟡 |
| Procedure code accuracy | 100.0% | >95% | 🟢 |
| DRG change rate | 12.5% | <10% | 🔴 |
| E/M accuracy (outpatient) | Not applicable | >90% | Not applicable |
| Modifier accuracy | Not applicable | >95% | Not applicable |

## DRG Impact Analysis
| Category | Volume | Net DRG Change | Estimated $ Impact |
|----------|--------|---------------|-------------------|
| Overcoded (DRG decreased) | 2 | -0.14 | ($9,800) |
| Undercoded (DRG increased) | 4 | +0.31 | $21,450 |
| Correct DRG | 42 | Not applicable | Not applicable |
| **Net impact** | 48 | **+0.17** | **$11,650** |

## Top Findings
| # | Finding | Guideline Reference | Frequency | Impact | Recommendation |
|---|---------|-------------------|-----------|--------|---------------|
| 1 | Acute respiratory failure documented in progress notes was not always captured as a secondary diagnosis | ICD-10-CM FY 2026 Section III and Chapter 10 | 6/48 | MCC loss | Build a respiratory failure query trigger whenever oxygen escalation and ABG review are documented |
| 2 | Sepsis sequencing was inconsistent when the systemic infection was the admission reason | ICD-10-CM FY 2026 Chapter 1 | 4/48 | DRG shift | Sequence A41.- or A40.- first when the admission supports sepsis as principal diagnosis |
| 3 | POA indicators were omitted for AKI and hypotension in several charts | 42 CFR 412 HAC/POA reporting | 3/48 | HAC risk | Require POA completion before final coding submission |

## Coder-Specific Results
| Coder | Records | Accuracy | DRG Accuracy | Key Finding |
|-------|---------|----------|-------------|-------------|
| A. Patel | 16 | 93.8% | 87.5% | Missed respiratory failure MCC capture |
| J. Romero | 15 | 86.7% | 80.0% | Sepsis sequencing and POA gaps |
| L. Chen | 17 | 94.1% | 88.2% | Strong accuracy with two modifier review misses |

## Education Plan
| Topic | Target Audience | Format | Due Date |
|-------|----------------|--------|----------|
| Respiratory failure as a coded secondary diagnosis | Inpatient coders and CDI | 20-minute huddle with chart examples | 2026-04-18 |
| Sepsis sequencing and principal diagnosis logic | Inpatient coders | One-page decision aid | 2026-04-20 |
| POA completion before code finalization | Coders and unit clerks | EHR workflow reminder | 2026-04-22 |

## Regulatory Notes
- The audit was scored against ICD-10-CM FY 2026 conventions for reportable diagnoses and sepsis sequencing, with DRG impact tested against CMS MS-DRG v43.0.
- Acute respiratory failure remained the highest-value missed secondary diagnosis because it changes severity assignment under CMS payment logic in 42 CFR 412.
- No NCCI modifier issue altered the inpatient findings in this sample, so the core risk was documentation capture rather than bundling.
