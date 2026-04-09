---
holdout_id: cip-d02-holdout-01-nicu-rsv-cluster-report
agent_slug: clinical-infection-prevention-specialist
agents_relevant:
- clinical-infection-prevention-specialist
deliverable_id: cip-d02
deliverable_title: Outbreak Investigation Report
seed_ref: clinical-infection-prevention-specialist/cip-d02-seed-01-nicu-rsv-cluster-report.yaml
scenario_summary: Investigation report for a synthetic RSV cluster in a NICU with
  staff, visitor, and cohorting implications.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- CDC respiratory virus infection prevention guidance for healthcare settings
- CDC outbreak investigation framework
- CMS Conditions of Participation at 42 CFR 482.42
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Use the exact outbreak report structure and complete every section with outbreak-specific
  content.
- Build a plausible NICU respiratory virus epidemiology narrative with person-place-time
  analysis.
- Include control measures spanning transmission-based precautions, visitation, staffing,
  and environmental cleaning.
- Declare the outbreak over only with explicit criteria tied to the organism and surveillance
  interval.
---

# Outbreak Investigation Report

**Facility**: Alder Crest Children's Hospital
**Organism/Condition**: Respiratory syncytial virus cluster in NICU
**Investigation Dates**: 2026-01-07 to 2026-02-04
**Lead Investigator**: Naomi Fen, CIC

## Alert Trigger
- Date identified: 2026-01-07
- Method of detection: Clinical report and lab confirmation
- Baseline rate: 0 NICU RSV cases in prior 12 months | Current rate: 5 NICU cases in 9 days

## Case Summary
| Case # | Patient | Unit | Onset Date | Specimen | Organism/Resistance | Outcome |
|--------|---------|------|-----------|----------|-------------------|---------|
| 1 | Mira Sloan, MRN AC-900411 | NICU Pod B | 2026-01-05 | Nasopharyngeal PCR | RSV A detected | Weaned from high-flow, remained inpatient |
| 2 | Kellan Hart, MRN AC-900438 | NICU Pod B | 2026-01-07 | Nasopharyngeal PCR | RSV A detected | Required CPAP escalation, recovered |
| 3 | Esme Corin, MRN AC-900455 | NICU Pod C | 2026-01-09 | Nasopharyngeal PCR | RSV A detected | Mild course, recovered |
| 4 | Theo Marin, MRN AC-900471 | NICU Pod C | 2026-01-11 | Nasopharyngeal PCR | RSV A detected | Required brief intubation, recovered |
| 5 | Juno Vale, MRN AC-900489 | NICU Pod B | 2026-01-14 | Nasopharyngeal PCR | RSV A detected | Discharged after symptom resolution |

## Epidemiologic Analysis
- Total cases: 5
- Attack rate: 13.9%
- Epidemic period: 2026-01-05 to 2026-01-14
- Units affected: Level III NICU pods B and C
- Common exposures identified: shared respiratory therapy team, sibling visitation during winter surge, bedside procedures in semi-open pod design

## Hypothesis & Testing
- Suspected mode of transmission: Droplet and contact
- Environmental cultures performed: No — Results: Surface culturing not pursued because control strategy centered on respiratory virus transmission precautions and exposure mapping
- Molecular typing performed: No — Results: All cases were RSV A by PCR; sequencing was not available during the active response window

## Control Measures Implemented
| Measure | Date Implemented | Responsible |
|---------|-----------------|------------|
| Enhanced contact precautions | 2026-01-07 | NICU nursing leadership |
| Environmental cleaning upgrade | 2026-01-07 | Environmental Services |
| Staff cohorting | 2026-01-08 | NICU medical director |
| Screening cultures | 2026-01-08 | Infection Prevention |
| Antibiotic review | 2026-01-09 | Antimicrobial Stewardship Program |

## Outcome
- Outbreak declared over: 2026-02-04
- Criteria for resolution: Fourteen days without new healthcare-associated RSV cases after last infant symptom onset plus completion of enhanced surveillance
- Total cases: 5 | Total affected units: 2

## Lessons Learned & Recommendations
1. Limit symptomatic visitors and tighten sibling visitation controls during community RSV surges in the NICU.
2. Assign dedicated respiratory therapy equipment and staff cohorting earlier when the first healthcare-associated case is suspected.
3. Preserve line lists, exposure maps, and pod-level staffing assignments in real time to accelerate outbreak reconstruction.
4. Continue droplet and contact precaution drills for semi-open neonatal care environments where spatial separation can be misleading.
5. Review live regulatory guidance if this report is reused for operational policy decisions after the next quarterly refresh.
