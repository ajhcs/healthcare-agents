---
exemplar_id: crs-d01-example-01-metro-ma-dashboard-q1
agent_slug: clinical-referral-specialist
agents_relevant:
- clinical-referral-specialist
deliverable_id: crs-d01
deliverable_title: Referral Management Dashboard
scenario_summary: Monthly dashboard for a synthetic Medicare Advantage-focused multispecialty
  network showing strong referral conversion with a dermatology access bottleneck.
complexity: moderate
mcp_servers_relevant:
- provider_directory
- provider_enrollment_status
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 422.116 Medicare Advantage network adequacy
- CMS Medicare Advantage Network Adequacy guidance
- 42 CFR 422.112 access to services
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Referral Management Dashboard

**Organization**: Juniper Vale Medical Group
**Reporting Period**: March 2026

## Volume & Conversion
| Metric | This Month | Prior Month | YTD | Target |
|--------|-----------:|------------:|----:|--------|
| Total referrals generated | 4,862 | 4,711 | 14,038 |  |
| Referrals scheduled | 4,386 | 4,221 | 12,631 |  |
| Referral-to-appointment rate | 90.2% | 89.6% | 90.0% | >90% |
| Appointments completed | 4,049 | 3,962 | 11,654 |  |
| Completion rate | 83.3% | 84.1% | 83.0% | >85% |
| Median days referral-to-appointment | 12 | 13 | 12 | <14 days |

## Loop Closure
| Metric | This Month | Prior Month | YTD | Target |
|--------|-----------:|------------:|----:|--------|
| Specialist notes received | 3,514 | 3,401 | 10,109 |  |
| Notes received within 14 days | 81.5% | 79.8% | 80.7% | >80% |
| Notes reviewed by referring MD | 77.2% | 75.1% | 76.6% | >75% |
| Loop closure rate (end-to-end) | 81.1% | 78.9% | 80.4% | >80% |

## Network Utilization
| Metric | This Month | Prior Month | YTD | Target |
|--------|-----------:|------------:|----:|--------|
| In-network referrals | 4,451 | 4,295 | 12,882 | >90% |
| In-system referrals | 3,724 | 3,633 | 10,801 | 78% |
| OON referrals | 411 | 416 | 1,156 |  |
| OON reason: clinical necessity | 94 | 87 | 259 |  |
| OON reason: patient preference | 138 | 149 | 397 |  |
| OON reason: access/wait time | 179 | 180 | 500 |  |

## Top Referral Specialties
| Specialty | Volume | Avg Wait (days) | Loop Closure Rate |
|----------|-------:|----------------:|------------------:|
| Cardiology | 712 | 10 | 86% |
| Orthopedics | 648 | 11 | 82% |
| GI/Endoscopy | 533 | 16 | 79% |
| Dermatology | 421 | 29 | 61% |
| Behavioral Health | 397 | 24 | 68% |

## Operating Notes
- Dermatology remains the main leakage driver: 112 March referrals left network after patients were offered first available in-network dates beyond 21 days.
- GI/Endoscopy access improved after adding Saturday block time at Juniper Vale West Endoscopy Suite on 2026-03-10.
- Cardiology loop closure improved after auto-fax backup routing was enabled for outside consult notes on 2026-02-24.
- Behavioral health conversion remains constrained by panel closure at two employed psychiatry sites and a higher no-show rate in evening slots.

## Immediate Actions
1. Open four protected new-patient dermatology slots per weekday for PCP-origin referrals through 2026-05-31.
2. Re-verify high-volume dermatology and behavioral health directory entries, including accepting-new-patients status and service addresses, before April roster refresh.
3. Audit payer enrollment for two recently onboarded GI physicians before expanding automated referral matching rules.
4. Review current CMS policy updates at the next quarterly regulatory refresh to confirm no changes affecting MA access monitoring.

## Public Standards Referenced
- 42 CFR 422.112 and 42 CFR 422.116 for Medicare Advantage access and network adequacy framing.
- CMS Medicare Advantage Network Adequacy guidance for specialty access oversight.
