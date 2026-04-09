---
exemplar_id: crc-d02-example-01-neurology-deviation-missed-consent-version
agent_slug: clinical-research-coordinator
agents_relevant:
- clinical-research-coordinator
deliverable_id: crc-d02
deliverable_title: Protocol Deviation Report
scenario_summary: A neurology site reports a major deviation when a participant completed
  a study visit under a superseded consent version before re-consent.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 21 CFR 50.20 and 21 CFR 50.27
- 21 CFR 312.60 and 21 CFR 312.62
- ICH E6(R3) Section 4.5 and Section 4.7
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Protocol Deviation Report

**Study**: NMI-117 / CLEAR-MIND
**Subject ID**: CM-0047
**Deviation Date**: 2026-02-16
**Reported By**: Eliana Voss, CCRP, Clinical Research Coordinator
**Report Date**: 2026-02-18

## Deviation Description
- Protocol section violated: Section 10.4 Informed Consent Process and Section 7.1 Visit 3 Procedures
- Description: Subject CM-0047 completed the Month 3 in-person study visit, including cognitive testing, vitals, PK blood draw, and investigational product dispensing review, using consent Version 2.0 dated 2025-08-01 after IRB approval of consent Version 3.0 dated 2026-02-05. The participant had not yet signed the newly approved consent before visit procedures began.
- Category: Major
- Participant safety impact: Yes
- Data integrity impact: Yes

## Root Cause
Site staff relied on a printed visit packet generated before the IRB approval notice was uploaded to the CTMS consent-version tracker. The scheduler confirmed the visit on 2026-02-13 using the prior packet, and the covering coordinator on 2026-02-16 did not perform the same-day consent version verification required by site SOP CRC-07. The outdated consent remained in the visit folder because the re-consent task did not route to the covering coordinator after the primary CRC was out sick.

## Corrective Action Taken
The visit was stopped immediately after the discrepancy was identified during same-day source QC at 15:40 local time.
The PI, Rowan Dey, MD, was notified the same day and reviewed subject risk.
No additional investigational product was dispensed after the discrepancy was identified.
The subject returned on 2026-02-17, received re-consent discussion with Version 3.0, had all new-risk language reviewed, signed the current IRB-approved consent, and was offered time for questions.
The sponsor medical monitor was notified in writing on 2026-02-17.
The IRB report package was prepared with protocol deviation narrative, impact assessment, and CAPA summary.
Source documentation includes a dated late entry explaining the sequence of events and the reason re-consent did not occur before procedures.

## Preventive Action Planned
CTMS now requires a hard-stop consent version verification step on the day of every study visit before any procedure can be documented.
Consent packets are generated centrally each morning from the live IRB-approved document library rather than from saved local folders.
Coverage staff receive cross-training on protocol-specific re-consent triggers and must complete a two-person check for any visit occurring within 30 days of a consent revision.
The site added a weekly deviation trend review to identify process failures involving handoffs and consent control.
Study-specific CAPA effectiveness check is scheduled for the next sponsor monitoring visit and internal QA review on 2026-04-10.

## Reporting
- Sponsor notified: 2026-02-17 at 08:12 via sponsor portal and confirmation email to trial manager
- IRB notified: 2026-02-19 under reportable new information workflow
- PI signature: Rowan Dey, MD Date: 2026-02-18

## Impact Assessment
- Subject rights impact: The subject underwent trial-related procedures before documentation of legally effective consent to the updated risk language
- Subject safety impact: Updated consent included new dizziness and syncope risk wording related to concomitant antihypertensive use
- Data impact: Month 3 assessments remain flagged in EDC pending sponsor determination on evaluability
- Recurrence risk before CAPA: Moderate due to cross-coverage workflow gap
- Immediate enrollment hold: Not required by sponsor; re-consent verification audit ordered for all active subjects

## Follow-Up Actions Logged
- 2026-02-18: Site audited all active participant binders for current consent version alignment
- 2026-02-18: No additional outdated consent use identified
- 2026-02-20: EDC note-to-file entered referencing deviation number CM-PD-2026-004
- 2026-02-24: Retraining completed for five delegated coordinators and one scheduler
- 2026-03-06: Sponsor acknowledged CAPA as acceptable pending monitoring verification
