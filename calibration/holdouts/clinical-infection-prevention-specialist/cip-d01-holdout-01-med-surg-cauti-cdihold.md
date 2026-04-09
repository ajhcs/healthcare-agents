---
holdout_id: cip-d01-holdout-01-med-surg-cauti-cdihold
agent_slug: clinical-infection-prevention-specialist
agents_relevant:
- clinical-infection-prevention-specialist
deliverable_id: cip-d01
deliverable_title: HAI Surveillance Dashboard
seed_ref: clinical-infection-prevention-specialist/cip-d01-seed-01-med-surg-cauti-cdihold.yaml
scenario_summary: Monthly dashboard for a synthetic community hospital where CAUTI
  and CDI signals intersect with elevated urinary catheter use on a medical-surgical
  unit.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- CDC NHSN Urinary Tract Infection Event protocol
- CDC NHSN MDRO and CDI Module
- CMS Conditions of Participation at 42 CFR 482.42
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Present a completed dashboard using the exact HAI Surveillance Dashboard structure
  from the prompt.
- Show at least one device-associated SIR above goal and connect it to bundle or utilization
  data in the narrative.
- Include concise interpretation that distinguishes numerator trends from denominator
  trends.
- Include a targeted action plan tied to CAUTI prevention and diagnostic or antimicrobial
  stewardship.
---

# HAI Surveillance Dashboard

**Facility**: Larkspur Ridge Hospital
**Reporting Period**: February 2026
**Prepared By**: Rowan Pike, CIC

## Device-Associated Infections
| Measure | Events | Device Days | Rate (per 1,000) | SIR | Target SIR |
|---------|--------|------------|-----------------|-----|-----------|
| CLABSI (ICU) | 0 | 688 | 0.00 | 0.00 | <1.0 |
| CLABSI (non-ICU) | 1 | 514 | 1.95 | 0.96 | <1.0 |
| CAUTI (ICU) | 1 | 812 | 1.23 | 0.98 | <1.0 |
| CAUTI (non-ICU) | 3 | 1,204 | 2.49 | 1.42 | <1.0 |

## Procedure-Associated Infections
| Procedure | SSIs | Procedures | Rate (%) | SIR | Target SIR |
|-----------|------|-----------|---------|-----|-----------|
| Colon surgery | 0 | 19 | 0.00 | 0.00 | <1.0 |
| Abdominal hysterectomy | 0 | 8 | 0.00 | 0.00 | <1.0 |
| CABG | 0 | 0 | 0.00 | 0.00 | <1.0 |
| Hip prosthesis | 1 | 14 | 7.14 | 0.93 | <1.0 |
| Knee prosthesis | 0 | 22 | 0.00 | 0.00 | <1.0 |

## CDI & MDRO
| Measure | Events | Patient Days | Rate (per 10,000) | SIR |
|---------|--------|-------------|-------------------|-----|
| CDI (HO-LabID) | 4 | 6,418 | 6.23 | 1.18 |
| MRSA bacteremia (HO) | 0 | 6,418 | 0.00 | 0.00 |

## Device Utilization (SUR)
| Device | Device Days | Patient Days | Utilization Ratio | SUR |
|--------|-----------|-------------|-------------------|-----|
| Central line (ICU) | 688 | 1,096 | 0.63 | 0.91 |
| Urinary catheter (ICU) | 812 | 1,096 | 0.74 | 1.09 |

## Bundle Compliance
| Bundle | Observations | Compliant | Rate | Target |
|--------|-------------|-----------|------|--------|
| CLABSI insertion bundle | 11 | 11 | 100% | >95% |
| CLABSI maintenance bundle | 76 | 74 | 97.4% | >95% |
| CAUTI insertion appropriateness | 17 | 15 | 88.2% | >95% |
| CAUTI daily necessity review | 104 | 91 | 87.5% | >95% |
| SSI prophylactic abx timing | 41 | 40 | 97.6% | >95% |
| Hand hygiene compliance | 286 | 261 | 91.3% | >90% |
