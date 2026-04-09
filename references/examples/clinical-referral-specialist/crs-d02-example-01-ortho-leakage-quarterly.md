---
exemplar_id: crs-d02-example-01-ortho-leakage-quarterly
agent_slug: clinical-referral-specialist
agents_relevant:
- clinical-referral-specialist
deliverable_id: crs-d02
deliverable_title: Referral Leakage Analysis
scenario_summary: Quarterly leakage analysis for a synthetic regional health system
  showing orthopedic and dermatology leakage driven by capacity, geography, and subspecialty
  gaps.
complexity: high
mcp_servers_relevant:
- provider_directory
- provider_enrollment_status
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 422.116 Medicare Advantage network adequacy
- 42 CFR 438.68 Medicaid managed care network adequacy
- CMS No Surprises Act overview
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Referral Leakage Analysis

**System**: Alder Ridge Health System
**Period**: Q1 2026

## Leakage Summary
| Specialty | Total Referrals | In-System | Out-of-System | Leakage Rate |
|----------|----------------:|----------:|--------------:|-------------:|
| Orthopedics | 1,284 | 1,008 | 276 | 21.5% |
| Dermatology | 932 | 704 | 228 | 24.5% |
| Cardiology | 1,106 | 1,005 | 101 | 9.1% |
| GI/Endoscopy | 864 | 741 | 123 | 14.2% |
| Behavioral Health | 788 | 602 | 186 | 23.6% |
| Neurology | 514 | 402 | 112 | 21.8% |

## Top Leakage Destinations
| External Provider/Group | Specialty | Volume | Est. Revenue Lost |
|------------------------|----------|-------:|------------------:|
| North Basin Orthopedic Institute | Orthopedics | 118 | $684,000 |
| Harbor Skin Partners | Dermatology | 93 | $146,000 |
| Lake Circuit Neurology | Neurology | 52 | $119,000 |
| Cedar Point Behavioral Associates | Behavioral Health | 48 | $61,000 |
| Crescent Digestive Center | GI/Endoscopy | 39 | $88,000 |

## Leakage Root Causes
| Cause | Volume | % | Remediation |
|-------|-------:|--:|-------------|
| Wait time / capacity | 382 | 37% | Add protected access slots, expand referral scheduling authority, publish first-available metrics by site |
| Geographic gap | 211 | 20% | Launch satellite clinics in North Basin and Pine Crossing; add telehealth triage where clinically appropriate |
| Subspecialty not available | 174 | 17% | Recruit hand surgeon and headache neurologist; build affiliate coverage agreement until recruited |
| Patient preference | 162 | 16% | Standardize option presentation and document informed patient choice with cost-sharing discussion |
| Referring MD preference | 105 | 10% | Review referral patterns with service-line leadership and refresh preferred in-network specialist roster |

## Recommendations
1. Stand up a 90-day orthopedic rapid-access program at Alder Ridge South with daily fracture, sports, and spine intake blocks to reduce leakage from PCP referrals waiting longer than 14 days.
2. Contract for two half-day dermatology sessions per week in Pine Crossing while credentialing employed coverage; current travel burden is driving avoidable OON use.
3. Add referral-routing hard stops for network verification and accepting-new-patients status so schedulers do not rely on stale directory entries.
4. Reconcile payer enrollment on all high-volume orthopedic, dermatology, and neurology destinations before renewing referral preference rules.
5. Review current CMS and Medicaid policy updates during the next quarterly governance cycle to confirm time-and-distance assumptions still match plan obligations.

## Executive Interpretation
- Orthopedics and dermatology account for 49% of all out-of-system referrals this quarter.
- Capacity pressure, not patient preference, is the dominant operational driver; 37% of leakage tied directly to delayed in-network appointments.
- Pine Crossing and North Basin remain the two geography hot spots where network presence on paper does not translate to reachable care.
- Behavioral health leakage is rising because two community partners closed adult new-patient panels mid-quarter.

## Public Standards Referenced
- 42 CFR 422.116 for Medicare Advantage network adequacy.
- 42 CFR 438.68 for Medicaid managed care network adequacy.
- CMS No Surprises Act materials for network and OON exposure context.
