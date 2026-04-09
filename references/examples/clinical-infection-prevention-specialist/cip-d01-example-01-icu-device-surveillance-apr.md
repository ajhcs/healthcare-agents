---
exemplar_id: cip-d01-example-01-icu-device-surveillance-apr
agent_slug: clinical-infection-prevention-specialist
agents_relevant:
- clinical-infection-prevention-specialist
deliverable_id: cip-d01
deliverable_title: HAI Surveillance Dashboard
scenario_summary: Monthly dashboard for a midsize acute care hospital with stable
  ICU device-associated infection performance and one CDI signal requiring stewardship
  follow-up.
complexity: routine
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- CDC NHSN Patient Safety Component Manual
- CMS Hospital Inpatient Quality Reporting Program requirements
- CDC Core Elements of Hospital Antibiotic Stewardship Programs
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# HAI Surveillance Dashboard

**Facility**: Juniper Vale Medical Center
**Reporting Period**: March 2026
**Prepared By**: Mara Ellison, CIC

## Device-Associated Infections
| Measure | Events | Device Days | Rate (per 1,000) | SIR | Target SIR |
|---------|--------|------------|-----------------|-----|-----------|
| CLABSI (ICU) | 1 | 1,264 | 0.79 | 0.68 | <1.0 |
| CLABSI (non-ICU) | 0 | 842 | 0.00 | 0.00 | <1.0 |
| CAUTI (ICU) | 1 | 1,538 | 0.65 | 0.74 | <1.0 |
| CAUTI (non-ICU) | 1 | 1,106 | 0.90 | 0.88 | <1.0 |

## Procedure-Associated Infections
| Procedure | SSIs | Procedures | Rate (%) | SIR | Target SIR |
|-----------|------|-----------|---------|-----|-----------|
| Colon surgery | 1 | 52 | 1.92 | 0.91 | <1.0 |
| Abdominal hysterectomy | 0 | 21 | 0.00 | 0.00 | <1.0 |
| CABG | 0 | 18 | 0.00 | 0.00 | <1.0 |
| Hip prosthesis | 0 | 33 | 0.00 | 0.00 | <1.0 |
| Knee prosthesis | 1 | 61 | 1.64 | 0.97 | <1.0 |

## CDI & MDRO
| Measure | Events | Patient Days | Rate (per 10,000) | SIR |
|---------|--------|-------------|-------------------|-----|
| CDI (HO-LabID) | 5 | 9,842 | 5.08 | 1.11 |
| MRSA bacteremia (HO) | 1 | 9,842 | 1.02 | 0.83 |

## Device Utilization (SUR)
| Device | Device Days | Patient Days | Utilization Ratio | SUR |
|--------|-----------|-------------|-------------------|-----|
| Central line (ICU) | 1,264 | 1,886 | 0.67 | 0.94 |
| Urinary catheter (ICU) | 1,538 | 1,886 | 0.82 | 1.02 |

## Bundle Compliance
| Bundle | Observations | Compliant | Rate | Target |
|--------|-------------|-----------|------|--------|
| CLABSI insertion bundle | 18 | 18 | 100% | >95% |
| CLABSI maintenance bundle | 146 | 141 | 96.6% | >95% |
| CAUTI insertion appropriateness | 24 | 23 | 95.8% | >95% |
| CAUTI daily necessity review | 132 | 123 | 93.2% | >95% |
| SSI prophylactic abx timing | 84 | 82 | 97.6% | >95% |
| Hand hygiene compliance | 418 | 382 | 91.4% | >90% |

March surveillance remained below target for all device-associated and procedure-associated SIRs. The only metric above target was CDI HO-LabID SIR at 1.11, driven by three medical-surgical unit events and two oncology events within a 16-day span.

ICU central line utilization remained lower than predicted, supporting current line-rounding practices. Urinary catheter SUR in ICU rose slightly above target range, and CAUTI daily necessity review compliance fell to 93.2%; unit leaders were asked to revalidate nurse-driven removal protocol use on every shift.

Colon and knee SSI performance remained within target, but both cases had bundle review findings. The colon SSI involved missed intraoperative redosing after extended operative time; the knee SSI followed perioperative glucose values above the service goal in PACU.

CDI prevention actions for April 2026:
- Expand prospective audit-and-feedback on fluoroquinolone and third-generation cephalosporin starts on 3 West and Oncology.
- Re-audit soap-and-water hand hygiene on CDI rooms during evening shift.
- Review EVS sporicidal dwell-time compliance using fluorescent marker validation in affected units.

Stewardship note:
- Fluoroquinolone DOT on adult inpatient units was 41.6 per 1,000 patient days, up from 33.9 in February 2026.
- Unit-specific feedback will be presented to the Antimicrobial Stewardship Committee on 2026-04-15.

ICC reporting note:
- Dashboard prepared for Infection Control Committee review on 2026-04-22.
- Numerator and denominator validation completed against microbiology, ADT, and device-day extracts on 2026-04-05.
