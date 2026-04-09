---
holdout_id: hcd-d01-holdout-01-sts-cabg-semiannual-preview
agent_slug: healthit-clinical-data-analyst
agents_relevant:
- healthit-clinical-data-analyst
deliverable_id: hcd-d01
deliverable_title: Quality Measure Performance Dashboard Specification
seed_ref: healthit-clinical-data-analyst/hcd-d01-seed-01-sts-cabg-semiannual-preview.yaml
scenario_summary: A synthetic cardiac surgery program wants a dashboard specification
  for semiannual STS adult cardiac surgery outcomes and documentation quality monitoring.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- STS National Database public overview and adult cardiac surgery program resources
- CMS Hospital Value-Based Purchasing and Hospital Readmissions Reduction Program
  public program materials
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Dashboard should blend registry outcomes with internal operational leading indicators
  rather than only listing STS composites.
- Measures section should include at least one risk-adjusted outcome, one process
  or documentation quality metric, and one readmissions-related metric.
- Drill-down hierarchy should respect PHI restrictions while still supporting surgeon
  and case-review workflows.
- Validation notes should call out source-to-registry mapping and risk-model version
  control.
---

# Quality Measure Dashboard Specification

**Dashboard Name**: Alder Ridge Heart Institute STS Outcomes Scorecard
**Owner**: Cardiovascular Service Line Quality Office
**Data Source**: EDW cardiac surgery mart with Clarity operative note reconciliation
**Refresh Frequency**: Monthly with semiannual benchmark freeze
**Audience**: Cardiac surgery leadership, perioperative nursing, finance, quality committee

## Measures
| Measure ID | Measure Name | Numerator Definition | Denominator Definition | Target | Benchmark Source |
|-----------|-------------|---------------------|----------------------|--------|-----------------|
| STS-ACSD- | Operative mortality |  |  |  | STS Adult Cardiac Surgery Database |
| STS-ACSD- | Major morbidity or mortality composite |  |  |  | STS Adult Cardiac Surgery Database |
| INT-CV-01 | Completeness of operative urgency and status fields |  |  |  | Internal data quality target |
| HRRP-CABG | 30-day all-cause readmission after CABG |  |  |  | CMS HRRP public materials |

## Data Pipeline
| Step | Source | Transformation | Output | Validation |
|------|--------|---------------|--------|-----------|
| Extract |  |  |  |  |
| Transform |  |  |  |  |
| Present |  |  |  |  |

## Drill-Down Hierarchy
- 
- 
- 

## Alert Thresholds
| Measure | Green | Yellow | Red | Action Required |
|---------|-------|--------|-----|-----------------|
| | | | | |
| | | | | |
| | | | | |

## Access Control
| Role | Access Level | PHI Visible |
|------|-------------|------------|
|  |  |  |
|  |  |  |
|  |  |  |

## Validation Notes
- 
- 
- 
-
