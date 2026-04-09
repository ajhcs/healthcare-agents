---
holdout_id: crs-d02-holdout-01-medicaid-behavioral-leakage-holdout
agent_slug: clinical-referral-specialist
agents_relevant:
- clinical-referral-specialist
deliverable_id: crs-d02
deliverable_title: Referral Leakage Analysis
seed_ref: clinical-referral-specialist/crs-d02-seed-01-medicaid-behavioral-leakage-holdout.yaml
scenario_summary: Analyze leakage in a synthetic Medicaid-heavy delivery system where
  behavioral health and pediatric neurology referrals leave network because panel
  status and enrollment data are unstable.
complexity: moderate
regulatory_as_of: '2026-04-09'
source_basis:
- 42 CFR 438.68 Medicaid managed care network adequacy
- 42 CFR 438.10 beneficiary information requirements
- CMS Behavioral Health Strategy materials
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Produce a complete leakage analysis with summary table, top leakage destinations,
  root causes, and recommendations.
- Make behavioral health the largest leakage category and connect the pattern to panel
  closures or directory instability.
- Include operationally credible remediation steps tied to access, network accuracy,
  or contracting.
- Quantify leakage rates and revenue impact using internally consistent synthetic
  values.
---

# Referral Leakage Analysis

**System**: Northlight River Integrated Care
**Period**: Q2 2026

## Leakage Summary
| Specialty | Total Referrals | In-System | Out-of-System | Leakage Rate |
|----------|----------------:|----------:|--------------:|-------------:|
| Behavioral Health | 1,148 | 736 | 412 | 35.9% |
| Pediatric Neurology | 286 | 176 | 110 | 38.5% |
| Dermatology | 604 | 496 | 108 | 17.9% |
| Orthopedics | 528 | 459 | 69 | 13.1% |
| Cardiology | 477 | 434 | 43 | 9.0% |
| GI/Endoscopy | 341 | 304 | 37 | 10.9% |

## Top Leakage Destinations
| External Provider/Group | Specialty | Volume | Est. Revenue Lost |
|------------------------|----------|-------:|------------------:|
| Brook Lantern Counseling Collective | Behavioral Health | 133 | $122,000 |
| Willow Trace Child Psychiatry | Behavioral Health | 101 | $96,000 |
| Summit Harbor Pediatric Neurology | Pediatric Neurology | 74 | $181,000 |
| Heather Lane Neurodevelopment Center | Pediatric Neurology | 22 | $41,000 |
| Open Coast Dermatology | Dermatology | 37 | $52,000 |

## Leakage Root Causes
| Cause | Volume | % | Remediation |
|-------|-------:|--:|-------------|
| Wait time / capacity | 291 | 37% | Expand intake blocks, deploy telehealth triage, and hold urgent referral slots for pediatric cases |
| Geographic gap | 154 | 20% | Add community clinic sessions in Drift Hollow and East Lark; support transport coordination |
| Subspecialty not available | 119 | 15% | Build affiliate coverage for pediatric headache and neurodevelopment follow-up |
| Patient preference | 97 | 12% | Strengthen option counseling and document informed choice with network implications |
| Referring MD preference | 63 | 8% | Refresh specialist rosters and coach high-leakage referrers |
| Directory or enrollment mismatch | 68 | 8% | Re-verify panel status and Medicaid enrollment before routing |

## Recommendations
1. Create a weekly behavioral health panel-status refresh and suppress referral routing to groups without same-month verification.
2. Execute an affiliate agreement for pediatric neurology coverage while internal recruitment continues for Drift Hollow.
3. Add language-access and travel-distance fields to the referral routing view so coordinators can match families to reachable sites.
4. Require plan-enrollment verification before preferred-routing logic is applied to behavioral health and pediatric neurology.
5. Review current Medicaid managed care policy updates before presenting the final corrective-action plan to network governance.

## Executive Interpretation
- Behavioral health is the largest leakage category by volume and is being driven by unstable panel availability more than by patient preference.
- Pediatric neurology has the highest leakage rate because internal supply does not meet demand in the eastern service area.
- Drift Hollow and East Lark show the strongest overlap of access delay, travel burden, and language-access friction.
- Directory instability is worsening scheduler rework and failed handoffs.

## Public Standards Referenced
- 42 CFR 438.68 for Medicaid managed care network adequacy.
- 42 CFR 438.10 for beneficiary information and provider-directory expectations.
