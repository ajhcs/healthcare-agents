---
holdout_id: qpe-d02-holdout-01-harborfront-service-recovery-log
agent_slug: quality-patient-experience-coordinator
agents_relevant:
- quality-patient-experience-coordinator
deliverable_id: qpe-d02
deliverable_title: Service Recovery Event Log
seed_ref: quality-patient-experience-coordinator/qpe-d02-seed-01-harborfront-service-recovery-log.yaml
scenario_summary: An ED used service recovery logging to manage repeated concerns
  about long waits, noise, and lack of clear updates.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- 'CMS HCAHPS: https://hcahpsonline.org/'
- 'CMS Hospital Compare / Care Compare: https://www.medicare.gov/care-compare/'
- 'AHRQ CAHPS methodology: https://www.ahrq.gov/cahps/index.html'
generated_by: gpt-5.4-mini-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when service-recovery expectations, HCAHPS rules, or
  patient-experience process standards materially change
expectations:
- The log should contain completed event entries with severity, resolution, time to resolution,
  and patient satisfaction status.
- The summary should aggregate the period's events and identify the recurring issue categories.
- The file should read like a working log, not a blank template.
---

# Service Recovery Event Log

**Facility**: Harborfront Medical Center  
**Reporting Period**: January 2026

| Date | Unit | Issue Category | Severity | Identified By | Resolved By | Resolution | Time to Resolution | Patient Satisfied? | Escalated? |
|------|------|---------------|----------|--------------|------------|------------|-------------------|-------------------|-----------|
| Jan 3 | ED | Wait time update | Tier 2 | charge nurse | ED supervisor | Gave ETA, meal voucher, and provider update | 18 min | Y | N |
| Jan 8 | ED | Noise at night | Tier 1 | patient | charge nurse | Moved bed and delivered quiet kit | 12 min | Y | N |
| Jan 14 | 3 South | Discharge confusion | Tier 3 | bedside RN | patient advocate | Reissued instructions and scheduled callback | 1 hr 20 min | Y | N |
| Jan 19 | Imaging | Family communication | Tier 2 | front desk | department lead | Called family and documented updates | 16 min | Y | N |
| Jan 27 | 5 West | Medication explanation | Tier 3 | pharmacist | nurse manager | Bedside teach-back and follow-up call | 56 min | Y | N |

## Summary Statistics
- Total events: 5
- Events resolved at Tier 1: 20% | Tier 2: 40% | Tier 3: 40% | Tier 4: 0%
- Average time to resolution: 36 minutes
- Patient satisfied with resolution: 100%
- Events escalated to grievance: 0%
- Top 3 issue categories: wait time updates, discharge confusion, medication explanation
- Units with highest volume: ED and 3 South

