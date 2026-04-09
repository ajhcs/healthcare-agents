---
holdout_id: cm-ho-001
agent_slug: clinical-care-management-specialist
agents_relevant:
  - clinical-care-management-specialist
deliverable_id: ccm-d02
deliverable_title: Readmission Risk Assessment
seed_ref: cm-seed-001
scenario_summary: 68-year-old female with COPD exacerbation, no PCP, Medicaid dual eligible
complexity: high
regulatory_as_of: 2026-04-01
source_basis:
  - 42 CFR 482.43
  - CMS MLN SE1345
  - OIG Work Plan 2025
generated_by: opus-4.6
reviewed_by: human
review_status: reviewed
review_date: 2026-04-09
frozen: true
superseded_by: null
retirement_trigger: Annual regulatory update or new HRRP guidance
expectations:
  - Compute the patient's specific readmission risk score.
  - Identify the missing PCP and housing instability as discharge barriers.
  - Recommend follow-up within 48 hours and summarize handoff data.
---

# Readmission Risk Assessment

Risk score: 15/19 (high)

## Barriers
- No PCP established.
- Housing instability.
- Dual-eligible coverage complicates post-acute placement.

## Plan
- Schedule a discharge call within 48 hours.
- Verify receiving provider credentials before warm handoff.
