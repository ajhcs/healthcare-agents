---
holdout_id: pph-d02-holdout-01-medicaid-hypertension-campaign-with-consent-controls
agent_slug: pophealth-population-health-manager
agents_relevant:
- pophealth-population-health-manager
deliverable_id: pph-d02
deliverable_title: Care Gap Closure Campaign Plan
seed_ref: pophealth-population-health-manager/pph-d02-seed-01-medicaid-hypertension-campaign-with-consent-controls.yaml
scenario_summary: Hypertension control campaign for a synthetic Medicaid ACO that
  must combine outreach, home monitoring, and strict communication consent controls.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- NCQA HEDIS measure information at ncqa.org/hedis/measures
- CDC Million Hearts hypertension control resources at cdc.gov/millionhearts
- FCC TCPA consumer guidance at fcc.gov/consumers/guides/stop-unwanted-robocalls-and-texts
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Use the care gap campaign format rather than a generic project plan.
- Address that CBP is an outcome measure influenced by medication titration, follow-up
  access, and repeat blood pressure capture rather than outreach alone.
- Include channel strategy and scripts that preserve informational health-care messaging
  and opt-out handling.
- Show pragmatic mitigation for transportation, language, trust, and home BP device
  barriers.
---

# Care Gap Closure Campaign Plan

**Measure**: CBP Controlling High Blood Pressure
**Measurement Year**: MY2026
**Campaign Period**: 2026-06-01 - 2026-09-30
**Target Population**: 1,860 members with open gaps

## Gap Analysis
- Current rate: 71.2%
- Goal rate: 75.0% with a stretch target of 81.0%
- Members needed to close: 168
- Estimated closure rate per outreach attempt: 7.5% for text or phone re-engagement, 16.0% for pharmacist titration pathway, 22.0% for home BP plus nurse follow-up pathway
- Required outreach volume: 3,400 multichannel attempts with a heavy focus on repeat blood pressure capture and medication optimization

## Outreach Strategy
| Wave | Channel | Audience | Timing | Expected Yield |
|------|---------|----------|--------|---------------|
| 1 | Informational text or live call | Members with recent primary care contact and documented communication permission | Weeks 1-2 | 6% |
| 2 | Pharmacist scheduling | Members with elevated prior BP and active antihypertensive therapy | Weeks 2-6 | 9% |
| 3 | Provider office | Members already scheduled for PCP follow-up or chronic disease visit | Ongoing | 11% |
| 4 | CHW and nurse home support | Members with repeated missed visits, device gaps, or language barriers | Weeks 5-16 | 8% |

## Messaging Script
**IVR/Text**: Flint Harbor Medicaid ACO is reaching out because your blood pressure follow-up is due. A nurse, pharmacist, or clinic visit can help you complete the needed blood pressure check and review your medications. Reply HELP for scheduling support or STOP to opt out of text messages.

**Live Call**: Hello, this is Talia with Flint Harbor Medicaid ACO. We are calling about your blood pressure follow-up. We can help schedule a clinic visit, arrange a pharmacist medication review, or deliver a home blood pressure cuff if travel is difficult. We also offer Spanish-language support and evening appointments. Which option would work best for you?

**Provider Talking Points**: Confirm the most recent valid blood pressure result, repeat elevated readings using office workflow standards, intensify therapy when clinically appropriate, document home BP review when measure-creditable, and route cuff access or transportation barriers before the patient leaves.

## Barriers and Mitigation
| Barrier | Mitigation Strategy |
|---------|-------------------|
| Transportation | Evening nurse visits and ride scheduling for members who cannot reach clinic during work hours |
| Language | Spanish-language outbound campaigns, interpreter-assisted pharmacist visits, bilingual CHW follow-up |
| Cost or insurance confusion | Scripted explanation that visits, cuffs, and care management support are covered through the program |
| Health literacy | Hands-on cuff teaching, simple medication calendars, and teach-back during every contact |
| Fear or distrust | CHW accompaniment, continuity with the same outreach staff member, and PCP-endorsed follow-up messaging |

## Tracking & Reporting
- Daily: Contact attempts, successful reaches, visits scheduled, cuffs deployed, opt-outs processed
- Weekly: Valid blood pressure captures, medication titration completions, closures by practice and outreach wave
- Monthly: Measure rerun using governed denominator logic, closure audit on a sample of numerator records, campaign ROI and disparity review by language and zip cluster

## Budget
| Item | Unit Cost | Volume | Total |
|------|-----------|--------|-------|
| Outreach staff time | $34/hr | 360 hrs | $12,240 |
| Mailing and printing | $2.10/piece | 900 pieces | $1,890 |
| Patient incentives | $10/each | 140 each | $1,400 |
| Transportation assistance | $31/trip | 120 trips | $3,720 |
| **Total campaign cost** |  |  | **$19,250** |
| **Cost per gap closed** |  |  | **$114.58** |

Program guardrails:
- Text outreach stays limited to informational health-care messaging with documented suppression and opt-out controls.
- Closure only counts from a valid controlled blood pressure result captured within the measure rules, not from scheduling activity.
- Pharmacist and nurse workflows are prioritized because outcome movement depends on follow-up and treatment adjustment, not reminders alone.
