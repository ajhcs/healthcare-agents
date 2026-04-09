---
exemplar_id: crs-d01-example-02-pediatric-screening-dashboard-april
agent_slug: clinical-referral-specialist
agents_relevant:
- clinical-referral-specialist
deliverable_id: crs-d01
deliverable_title: Referral Management Dashboard
scenario_summary: Monthly dashboard for a synthetic pediatric-heavy primary care network
  focused on screening referrals and behavioral health follow-through.
complexity: routine
mcp_servers_relevant:
- provider_directory
- provider_enrollment_status
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 422.112 access to services
- CMS Medicare Advantage Network Adequacy guidance
- CDC colorectal, breast, and cervical cancer screening program resources
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Referral Management Dashboard

**Organization**: Maple Harbor Primary Care Network
**Reporting Period**: April 2026

## Volume & Conversion
| Metric | This Month | Prior Month | YTD | Target |
|--------|-----------:|------------:|----:|--------|
| Total referrals generated | 2,944 | 2,877 | 11,508 |  |
| Referrals scheduled | 2,672 | 2,589 | 10,441 |  |
| Referral-to-appointment rate | 90.8% | 90.0% | 90.7% | >90% |
| Appointments completed | 2,446 | 2,361 | 9,556 |  |
| Completion rate | 83.1% | 82.1% | 83.0% | >85% |
| Median days referral-to-appointment | 11 | 12 | 11 | <14 days |

## Loop Closure
| Metric | This Month | Prior Month | YTD | Target |
|--------|-----------:|------------:|----:|--------|
| Specialist notes received | 2,097 | 2,006 | 8,234 |  |
| Notes received within 14 days | 80.8% | 79.6% | 80.2% | >80% |
| Notes reviewed by referring MD | 76.4% | 74.9% | 75.8% | >75% |
| Loop closure rate (end-to-end) | 80.3% | 78.8% | 79.9% | >80% |

## Network Utilization
| Metric | This Month | Prior Month | YTD | Target |
|--------|-----------:|------------:|----:|--------|
| In-network referrals | 2,731 | 2,659 | 10,682 | >90% |
| In-system referrals | 2,196 | 2,121 | 8,604 | 74% |
| OON referrals | 213 | 218 | 826 |  |
| OON reason: clinical necessity | 41 | 39 | 155 |  |
| OON reason: patient preference | 92 | 97 | 362 |  |
| OON reason: access/wait time | 80 | 82 | 309 |  |

## Top Referral Specialties
| Specialty | Volume | Avg Wait (days) | Loop Closure Rate |
|----------|-------:|----------------:|------------------:|
| GI/Endoscopy | 354 | 14 | 83% |
| Behavioral Health | 332 | 20 | 66% |
| Dermatology | 301 | 17 | 74% |
| Cardiology | 244 | 9 | 88% |
| Orthopedics | 229 | 10 | 81% |

## Operating Notes
- Screening-driven GI referrals rose after outreach for overdue colonoscopy and positive FIT follow-up.
- Behavioral health remains the main loop-closure risk because two community therapists send consult documentation only after repeated outreach.
- Cardiology access is stable after provider roster cleanup and centralized scheduling handoff.
- OON use tied to patient preference remains concentrated in adolescent dermatology and child counseling.

## Immediate Actions
1. Add weekly note-chase workqueue for behavioral health referrals at day 10 after completed visits.
2. Re-verify directory records for child counseling practices, including address, language services, and panel status.
3. Confirm payer enrollment for the newly added pediatric dermatologist before routing all HMO referrals there.

## Public Standards Referenced
- 42 CFR 422.112 for access-to-services framing.
- CMS network adequacy guidance for specialty access monitoring.
