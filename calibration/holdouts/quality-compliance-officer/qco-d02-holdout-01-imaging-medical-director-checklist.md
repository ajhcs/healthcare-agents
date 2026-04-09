---
holdout_id: qco-d02-holdout-01
agent_slug: quality-compliance-officer
agents_relevant:
  - quality-compliance-officer
deliverable_id: qco-d02
deliverable_title: Arrangement Review Checklist
seed_ref: calibration/seeds/quality-compliance-officer/qco-d02-seed-01-medical-director-imaging.yaml
scenario_summary: Imaging center renewing a medical director agreement and needing a Stark and AKS review before execution.
complexity: high
mcp_servers_relevant:
  - provider_directory
  - current_regulatory_policy
source_basis:
  - OIG General Compliance Program Guidance (November 2023)
  - 42 U.S.C. 1395nn
  - 42 U.S.C. 1320a-7b(b)
  - 42 CFR 411.357(d)
  - 42 CFR 1001.952(d)
expectations:
  - Identify the personal-services exception and safe harbor correctly.
  - Flag the missing FMV support and duty-performance evidence.
  - Treat the arrangement as modifiable rather than automatically compliant.
  - Specify an ongoing monitoring cadence before renewal.
generated_by: sonnet-4.6
reviewed_by: opus-4.6
review_status: reviewed
review_date: 2026-04-09
regulatory_as_of: 2026-04-09
frozen: true
retirement_trigger: Replace if Stark personal-services or AKS safe harbor guidance materially changes.
---

# Financial Arrangement Compliance Review

**Arrangement Type**: Medical director services agreement  
**Parties**: Westbrook Imaging Partners and Dr. Maya Desai  
**Referral Relationship**: Yes. The practice bills Medicare for imaging services and Dr. Desai refers patients into the imaging workflow.  
**Date Reviewed**: 2026-04-09  
**Reviewed By**: Maya Chen, CHC

## Stark Law Analysis
Applicable exception: personal services arrangements under 42 CFR 411.357(d).

The arrangement is written for one year, identifies oversight duties, and sets a monthly flat fee. The missing control is contemporaneous evidence that the duties are actually performed and that the compensation remains fixed regardless of referral volume. The agreement is moderately risky under Stark until the file contains a duty log, FMV support, and a clear statement that the compensation does not vary with the volume or value of referrals.

## Anti-Kickback Statute Analysis
Closest safe harbor: personal services and management contracts under 42 CFR 1001.952(d).

The arrangement is close to the safe harbor but not fully documented. The file needs:
- A current FMV opinion
- A duty description that matches actual work performed
- Meeting minutes or attestations showing the director role is active and not referral-linked
- Confirmation that the monthly fee is not tied to imaging volume or referral counts

Without those items, the structure may still be defensible, but the organization should treat it as a moderate compliance risk and route the final file to counsel before execution.

## Conclusion
- Arrangement compliant as structured: not yet
- Arrangement requires modification: yes
- Arrangement not recommended: no
- Referred to counsel for further analysis: yes

## Ongoing Monitoring
- Added to the arrangement tracking system: yes
- FMV reassessment date: 2027-04-01
- Contract term expiration: 2027-04-09
- Next review date: 2026-10-09

## Monitoring Notes
The compliance office should verify the director's identity through the provider directory, retain quarterly duty attestations, and review any policy changes that affect personal-services arrangements before renewal.
