---
holdout_id: htp-d01-holdout-02-harborview-behavioral-health-rpm-pro-forma
agent_slug: healthit-telehealth-program-manager
agents_relevant:
  - healthit-telehealth-program-manager
deliverable_id: htp-d01
deliverable_title: Telehealth Program Financial Pro Forma
seed_ref: healthit-telehealth-program-manager/htp-d01-seed-02-harborview-behavioral-health-rpm-pro-forma.yaml
scenario_summary: Build a telehealth pro forma for a community behavioral health program adding psychiatry, psychotherapy, and RTM support.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
  - CMS Telehealth, https://www.cms.gov/medicare/coverage/telehealth
  - 42 CFR 410.78, https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-B/part-410/section-410.78
  - HHS Telehealth and HIPAA guidance, https://www.hhs.gov/hipaa/for-professionals/special-topics/telehealth/index.html
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or workflow standard materially changes
expectations:
  - Distinguish psychiatry, psychotherapy, and RTM revenue lines.
  - Show a staffing plan that reflects licensed clinician coverage and care navigation.
  - Include a margin estimate and note the break-even timing.
---

# Telehealth Program Financial Pro Forma

**Organization**: Harborview Behavioral Health  
**Launch Date**: 2026-10-01  
**Prepared By**: Leah Ortiz, MPH  
**Scope**: Psychiatry follow-up, psychotherapy, and RTM-enabled depression care.

## Revenue Projections
| Service | Avg Monthly Encounters | Allowed Amount | Annual Revenue |
|---|---:|---:|---:|
| Psychiatry follow-up | 240 | $142 | $408,960 |
| Psychotherapy | 300 | $110 | $396,000 |
| RTM management | 160 | $58 | $111,360 |
| **Total** |  |  | **$916,320** |

## Expense Projections
| Expense | Monthly | Annual |
|---|---:|---:|
| Platform subscription | $3,100 | $37,200 |
| Licensed clinician coverage | $8,200 | $98,400 |
| Care navigation and outreach | $4,600 | $55,200 |
| Device and patient support | $2,300 | $27,600 |
| **Total** |  | **$218,400** |

## Net Margin
- Revenue: $916,320
- Expense: $218,400
- Net margin: $697,920
- Break-even: Month 4

## Key Assumptions
- Behavioral health volume ramps over three quarters
- Audio-only is used only where permitted and documented
- RTM patients require monthly management and active device transmission
- No-show reduction from reminder workflows is assumed at 10 percent
