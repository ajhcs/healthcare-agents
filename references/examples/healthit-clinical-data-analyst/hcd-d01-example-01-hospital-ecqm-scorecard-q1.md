---
exemplar_id: hcd-d01-example-01-hospital-ecqm-scorecard-q1
agent_slug: healthit-clinical-data-analyst
agents_relevant:
- healthit-clinical-data-analyst
deliverable_id: hcd-d01
deliverable_title: Quality Measure Performance Dashboard Specification
scenario_summary: Executive-facing inpatient quality dashboard specification for a
  synthetic community hospital covering eCQMs, safety, and patient experience.
complexity: routine
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- CMS Hospital Inpatient Quality Reporting Program overview, QualityNet
- eCQI Resource Center eCQM specifications and annual update materials
- 42 CFR 412.140
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Quality Measure Dashboard Specification

**Dashboard Name**: Northlake Medical Center Inpatient Quality Scorecard
**Owner**: Quality Analytics and CMO Office
**Data Source**: Caboodle Quality Mart with Clarity reconciliation views
**Refresh Frequency**: Weekly each Tuesday at 06:00 UTC
**Audience**: Executive, service line, unit leadership

## Measures
| Measure ID | Measure Name | Numerator Definition | Denominator Definition | Target | Benchmark Source |
|-----------|-------------|---------------------|----------------------|--------|-----------------|
| CMS-190v14 | Intensive Care Unit VTE Prophylaxis | ICU patients who received VTE prophylaxis on the day of or day after ICU admission or surgery end time | ICU patients age 18 and older with qualifying inpatient stay and no denominator exclusion | 96.0% | CMS Hospital IQR eCQM benchmark |
| CMS-2v14 | Cesarean Birth | Nulliparous term singleton vertex deliveries delivered by cesarean birth | Nulliparous term singleton vertex deliveries | 23.0% or lower | CMS public reporting benchmark |
| CMS-506v7 | Safe Use of Opioids Concurrent Prescribing | Inpatient encounters without an opioid and benzodiazepine or opioid and barbiturate overlap at discharge | Inpatient encounters age 18 and older with at least two opioid days at discharge window | 98.5% | CMS Hospital IQR eCQM benchmark |
| PSI-90 | Patient Safety and Adverse Events Composite | Composite based on weighted component patient safety indicators | All qualifying discharges in AHRQ PSI software population | 0.70 or lower | CMS HAC Reduction Program methodology |
| HCAHPS-COMM | Nurse Communication Top Box | Surveys scoring always on nurse communication questions | All eligible completed HCAHPS surveys | 79.0% | CMS Care Compare |

## Data Pipeline
| Step | Source | Transformation | Output | Validation |
|------|--------|---------------|--------|-----------|
| Extract | Clarity PAT_ENC_HSP, CLARITY_ADT, ORDER_MED, MAR_ADMIN_INFO, HNO_INFO | Encounter eligibility by discharge date and encounter class; medication and order joins for prophylaxis logic | StgInpatientQualityEncounter | Weekly row count vs prior 13 weeks and discharge census reconciliation |
| Transform | StgInpatientQualityEncounter plus VSAC-aligned code sets in DimValueSetMember | Measure-specific denominator, exclusion, and numerator logic by measure version | MartQualityMeasurePatient | Boundary tests on age, ICU transfer timing, discharge dates, and duplicate encounter checks |
| Present | MartQualityMeasurePatient plus MartQualitySurvey and MartPSIComposite | Aggregate rates, rolling 13-week trends, service line drill-downs, and red-yellow-green status | Power BI executive dashboard | Sample patient trace-back, benchmark comparison, and executive totals tie-out |

## Drill-Down Hierarchy
- Health system
- Hospital
- Service line
- Nursing unit
- Attending provider
- Patient list with PHI restricted to analyst and quality reviewer roles

## Alert Thresholds
| Measure | Green | Yellow | Red | Action Required |
|---------|-------|--------|-----|-----------------|
| CMS-190v14 | 96.0% and above | 93.0% to 95.9% | Below 93.0% | Send ICU variance report to ICU director and pharmacy lead within 2 business days |
| CMS-2v14 | 23.0% or lower | 23.1% to 26.0% | Above 26.0% | Escalate to women’s services quality council for chart review |
| CMS-506v7 | 98.5% and above | 97.0% to 98.4% | Below 97.0% | Review discharge medication workflow with hospitalists and pharmacy |
| PSI-90 | 0.70 or lower | 0.71 to 0.85 | Above 0.85 | Open patient safety review with quality and coding integrity |
| HCAHPS-COMM | 79.0% and above | 75.0% to 78.9% | Below 75.0% | Unit coaching plan and leader rounding review |

## Access Control
| Role | Access Level | PHI Visible |
|------|-------------|------------|
| Chief executive and finance leaders | Organization summary and trend only | No |
| Service line vice presidents | Hospital and service line detail | No |
| Nursing directors | Unit detail and provider rollups for assigned departments | No |
| Quality analysts | Full detail including patient trace list and logic notes | Yes |
| Clinical documentation integrity reviewers | Patient trace list for assigned validation workqueues | Yes |

## Refresh and Retention Rules
- Weekly refresh covers rolling 18 months for trending and current reporting year for official status tiles.
- Measure version is fixed per reporting year and displayed in each measure tooltip.
- Patient-level trace tables retained for 24 months in the analytics workspace and 6 years in validated archive storage.

## Validation Notes
- CMS-190v14 denominator must reconcile within 2.0% of vendor eCQM output before publication.
- Observation-to-inpatient conversions are validated separately because encounter class drift previously suppressed ICU cases.
- PSI-90 refresh is monthly because source indicators depend on coded final-billed discharges rather than concurrent data.
- HCAHPS tiles display a suppression notice when survey volume is below public reporting display thresholds.

## Known Limits
- Current dashboard excludes transferred-in newborn encounters from obstetric stratification because those encounters are not in scope for the selected measure set.
- Public benchmark tiles use the most recently released CMS benchmark file and may lag internal performance by one reporting cycle.

## Sources
- CMS QualityNet Hospital Inpatient Quality Reporting Program
- eCQI Resource Center measure specifications for CMS-190v14, CMS-2v14, and CMS-506v7
- AHRQ PSI 90 composite methodology used in CMS HAC Reduction Program
