---
holdout_id: crs-d01-holdout-02-surgical-referral-dashboard-holdout
agent_slug: clinical-referral-specialist
agents_relevant:
- clinical-referral-specialist
deliverable_id: crs-d01
deliverable_title: Referral Management Dashboard
seed_ref: clinical-referral-specialist/crs-d01-seed-02-surgical-referral-dashboard-holdout.yaml
scenario_summary: Draft a monthly dashboard for a synthetic community system after
  a new surgery affiliate joins, with strong conversion but note-receipt gaps and
  enrollment uncertainty.
complexity: routine
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 422.112 access to services
- HHS OIG report on Medicare Advantage prior authorization denials
- CMS No Surprises Act overview
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Complete the dashboard in the exact deliverable shape with values that show solid
  front-end scheduling and weaker downstream loop closure.
- Reflect the effect of a new surgery affiliate by improving appointment conversion
  while preserving some enrollment and note-return risk.
- Keep the work product concise and operational, with at least three concrete action
  statements.
- Use synthetic metrics that remain internally consistent across the dashboard.
---

# Referral Management Dashboard

**Organization**: Cinder Brook Medical Partners
**Reporting Period**: May 2026

## Volume & Conversion
| Metric | This Month | Prior Month | YTD | Target |
|--------|-----------:|------------:|----:|--------|
| Total referrals generated | 2,518 | 2,447 | 12,291 |  |
| Referrals scheduled | 2,307 | 2,210 | 11,132 |  |
| Referral-to-appointment rate | 91.6% | 90.4% | 90.6% | >90% |
| Appointments completed | 2,109 | 2,041 | 10,168 |  |
| Completion rate | 83.8% | 83.4% | 82.7% | >85% |
| Median days referral-to-appointment | 9 | 11 | 10 | <14 days |

## Loop Closure
| Metric | This Month | Prior Month | YTD | Target |
|--------|-----------:|------------:|----:|--------|
| Specialist notes received | 1,676 | 1,652 | 8,054 |  |
| Notes received within 14 days | 74.8% | 75.6% | 74.2% | >80% |
| Notes reviewed by referring MD | 73.1% | 72.4% | 72.9% | >75% |
| Loop closure rate (end-to-end) | 76.5% | 75.8% | 75.4% | >80% |

## Network Utilization
| Metric | This Month | Prior Month | YTD | Target |
|--------|-----------:|------------:|----:|--------|
| In-network referrals | 2,292 | 2,220 | 11,079 | >90% |
| In-system referrals | 1,894 | 1,812 | 9,116 | 76% |
| OON referrals | 226 | 227 | 1,212 |  |
| OON reason: clinical necessity | 48 | 46 | 241 |  |
| OON reason: patient preference | 79 | 84 | 427 |  |
| OON reason: access/wait time | 99 | 97 | 544 |  |

## Top Referral Specialties
| Specialty | Volume | Avg Wait (days) | Loop Closure Rate |
|----------|-------:|----------------:|------------------:|
| General Surgery | 388 | 7 | 69% |
| Cardiology | 341 | 9 | 84% |
| GI/Endoscopy | 307 | 13 | 78% |
| Orthopedics | 296 | 10 | 80% |
| Dermatology | 244 | 18 | 67% |

## Operating Notes
- The new south-market general surgery affiliate improved scheduling speed, especially for gallbladder and hernia referrals.
- Loop closure remains below target because operative consult notes from the new affiliate are reaching PCPs after the expected follow-up window.
- HMO routing should remain limited until enrollment is confirmed for two surgeons added in April.
- Dermatology still drives most access-delay OON use.

## Immediate Actions
1. Keep HMO referrals off the two pending-enrollment surgeons until enrollment is confirmed.
2. Add day-7 and day-12 note-chase steps for general surgery consults.
3. Re-verify south-market directory entries, including surgeon NPIs and final suite location.

## Public Standards Referenced
- 42 CFR 422.112 for access-to-services context.
- HHS OIG reporting on prior authorization mismatches as a reminder to verify routing and approval alignment.
