---
exemplar_id: cip-d01-example-02-colorectal-ssi-quarterly-review
agent_slug: clinical-infection-prevention-specialist
agents_relevant:
- clinical-infection-prevention-specialist
deliverable_id: cip-d01
deliverable_title: HAI Surveillance Dashboard
scenario_summary: Quarterly dashboard centered on elevated colorectal SSI performance
  and perioperative bundle gaps across a regional referral hospital.
complexity: moderate
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- CDC NHSN Surgical Site Infection Event protocol
- SHEA/IDSA/APIC Practice Recommendations for SSI Prevention
- CMS HAC Reduction Program overview
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# HAI Surveillance Dashboard

**Facility**: Harbor Pines Regional Hospital
**Reporting Period**: Q1 2026
**Prepared By**: Selene Mora, CIC

## Device-Associated Infections
| Measure | Events | Device Days | Rate (per 1,000) | SIR | Target SIR |
|---------|--------|------------|-----------------|-----|-----------|
| CLABSI (ICU) | 2 | 3,442 | 0.58 | 0.72 | <1.0 |
| CLABSI (non-ICU) | 1 | 2,416 | 0.41 | 0.63 | <1.0 |
| CAUTI (ICU) | 3 | 4,108 | 0.73 | 0.81 | <1.0 |
| CAUTI (non-ICU) | 2 | 2,982 | 0.67 | 0.77 | <1.0 |

## Procedure-Associated Infections
| Procedure | SSIs | Procedures | Rate (%) | SIR | Target SIR |
|-----------|------|-----------|---------|-----|-----------|
| Colon surgery | 6 | 143 | 4.20 | 1.34 | <1.0 |
| Abdominal hysterectomy | 1 | 54 | 1.85 | 0.88 | <1.0 |
| CABG | 0 | 46 | 0.00 | 0.00 | <1.0 |
| Hip prosthesis | 1 | 77 | 1.30 | 0.79 | <1.0 |
| Knee prosthesis | 0 | 96 | 0.00 | 0.00 | <1.0 |

## CDI & MDRO
| Measure | Events | Patient Days | Rate (per 10,000) | SIR |
|---------|--------|-------------|-------------------|-----|
| CDI (HO-LabID) | 9 | 27,614 | 3.26 | 0.97 |
| MRSA bacteremia (HO) | 3 | 27,614 | 1.09 | 0.92 |

## Device Utilization (SUR)
| Device | Device Days | Patient Days | Utilization Ratio | SUR |
|--------|-----------|-------------|-------------------|-----|
| Central line (ICU) | 3,442 | 4,920 | 0.70 | 0.98 |
| Urinary catheter (ICU) | 4,108 | 4,920 | 0.83 | 1.04 |

## Bundle Compliance
| Bundle | Observations | Compliant | Rate | Target |
|--------|-------------|-----------|------|--------|
| CLABSI insertion bundle | 42 | 40 | 95.2% | >95% |
| CLABSI maintenance bundle | 388 | 377 | 97.2% | >95% |
| CAUTI insertion appropriateness | 56 | 53 | 94.6% | >95% |
| CAUTI daily necessity review | 355 | 337 | 94.9% | >95% |
| SSI prophylactic abx timing | 243 | 225 | 92.6% | >95% |
| Hand hygiene compliance | 1,084 | 1,003 | 92.5% | >90% |

Q1 2026 surveillance shows stable device-associated infection performance and a focused SSI problem in colorectal surgery. Colon surgery SIR rose to 1.34 with six SSIs across 143 procedures, including three organ/space infections and two cases with documented prolonged case duration beyond the 75th percentile.

Review of the six colorectal SSIs found repeated process failures:
- Four cases had antibiotic prophylaxis initiated after the 60-minute pre-incision window.
- Two prolonged cases lacked required intraoperative redosing.
- Three patients had postoperative glucose values above 180 mg/dL in the first 24 hours.
- Two procedures documented clipper availability delays that led to workflow deviation in pre-op holding.

Device prevention metrics remained within target, though ICU urinary catheter SUR stayed above 1.0 for the second consecutive quarter. The ICU leadership team will review catheter indication documentation during twice-weekly device rounds.

Corrective actions initiated on 2026-04-03:
- Standardized colorectal pre-op antibiotic order set with weight-based defaults and automated redosing prompts.
- Surgeon-anesthesia-nursing case review of all six colorectal SSI events.
- Weekly colorectal bundle audit for timing, prep, temperature, and glucose control through 2026-06-30.
- Monthly feedback of surgeon-specific aggregate compliance to Perioperative Quality Council.

HAC program impact note:
- Elevated colon SSI performance materially affects the CDC HAI domain used in HAC Reduction Program scoring.
- Coding and CDI teams confirmed all six events were postoperative and not present on admission.

Committee follow-up:
- Findings will be presented to Surgical Quality Committee on 2026-04-18.
- Reforecast of colon SSI SIR will be included in the May 2026 dashboard.
