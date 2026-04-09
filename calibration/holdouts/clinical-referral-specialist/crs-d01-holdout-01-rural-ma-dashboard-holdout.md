---
holdout_id: crs-d01-holdout-01-rural-ma-dashboard-holdout
agent_slug: clinical-referral-specialist
agents_relevant:
- clinical-referral-specialist
deliverable_id: crs-d01
deliverable_title: Referral Management Dashboard
seed_ref: clinical-referral-specialist/crs-d01-seed-01-rural-ma-dashboard-holdout.yaml
scenario_summary: Build a rural Medicare Advantage dashboard where access delays and
  OON use are concentrated in neurology and dermatology across distant counties.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 422.116 Medicare Advantage network adequacy
- 42 CFR 422.112 access to services
- CMS Medicare Advantage Network Adequacy guidance
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Populate all dashboard sections with coherent month, prior month, and YTD values
  tied to one synthetic organization and one reporting month.
- Show at least one specialty with wait time pressure that aligns with elevated OON
  referrals and weaker loop closure.
- Use realistic targets from the prompt and keep the narrative centered on patient
  access, scheduling, and loop closure.
- Include concise operating notes or action statements grounded in the completed metrics.
---

# Referral Management Dashboard

**Organization**: Silver Fen Community Health Alliance
**Reporting Period**: February 2026

## Volume & Conversion
| Metric | This Month | Prior Month | YTD | Target |
|--------|-----------:|------------:|----:|--------|
| Total referrals generated | 3,186 | 3,104 | 6,290 |  |
| Referrals scheduled | 2,761 | 2,734 | 5,495 |  |
| Referral-to-appointment rate | 86.7% | 88.1% | 87.4% | >90% |
| Appointments completed | 2,351 | 2,379 | 4,730 |  |
| Completion rate | 73.8% | 76.6% | 75.2% | >85% |
| Median days referral-to-appointment | 18 | 17 | 18 | <14 days |

## Loop Closure
| Metric | This Month | Prior Month | YTD | Target |
|--------|-----------:|------------:|----:|--------|
| Specialist notes received | 1,782 | 1,851 | 3,633 |  |
| Notes received within 14 days | 69.4% | 71.8% | 70.6% | >80% |
| Notes reviewed by referring MD | 70.2% | 72.1% | 71.1% | >75% |
| Loop closure rate (end-to-end) | 68.5% | 70.7% | 69.6% | >80% |

## Network Utilization
| Metric | This Month | Prior Month | YTD | Target |
|--------|-----------:|------------:|----:|--------|
| In-network referrals | 2,718 | 2,691 | 5,409 | >90% |
| In-system referrals | 2,235 | 2,208 | 4,443 | 72% |
| OON referrals | 468 | 431 | 899 |  |
| OON reason: clinical necessity | 83 | 79 | 162 |  |
| OON reason: patient preference | 96 | 104 | 200 |  |
| OON reason: access/wait time | 289 | 248 | 537 |  |

## Top Referral Specialties
| Specialty | Volume | Avg Wait (days) | Loop Closure Rate |
|----------|-------:|----------------:|------------------:|
| Neurology | 402 | 36 | 58% |
| Dermatology | 356 | 31 | 63% |
| Cardiology | 341 | 14 | 79% |
| Orthopedics | 318 | 16 | 76% |
| Behavioral Health | 289 | 27 | 61% |

## Operating Notes
- Pine Marsh and Elk Run counties continue to show the largest travel burden for in-network neurology and dermatology appointments.
- OON use is being driven mostly by access delay and distance, not by patient preference.
- Neurology note return remains the biggest loop-closure weakness and is delaying PCP follow-up on headache, seizure, and neuropathy referrals.
- Cardiology performance is near target after referral coordinators moved urgent slots into a centralized scheduling pool.

## Immediate Actions
1. Escalate unscheduled neurology referrals at day 5 for urgent and day 10 for routine.
2. Re-verify high-volume rural specialty directory entries before next referral roster refresh.
3. Confirm MA enrollment on the new dermatology locum before adding auto-match rules.
4. Review current CMS network adequacy updates before the quarterly access committee meeting.

## Public Standards Referenced
- 42 CFR 422.112 and 42 CFR 422.116 for access and network adequacy context.
