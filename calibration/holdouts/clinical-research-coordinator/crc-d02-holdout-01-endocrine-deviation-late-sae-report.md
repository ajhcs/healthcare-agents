---
holdout_id: crc-d02-holdout-01-endocrine-deviation-late-sae-report
agent_slug: clinical-research-coordinator
agents_relevant:
- clinical-research-coordinator
deliverable_id: crc-d02
deliverable_title: Protocol Deviation Report
seed_ref: clinical-research-coordinator/crc-d02-seed-01-endocrine-deviation-late-sae-report.yaml
scenario_summary: A diabetes device trial site must document a major deviation after
  delayed SAE awareness and sponsor notification.
complexity: high
regulatory_as_of: '2026-04-09'
source_basis:
- 21 CFR 312.64 and 21 CFR 312.66
- ICH E6(R3) Section 4.5 and Section 4.8
- 21 CFR 56.108 and 21 CFR 56.109
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
frozen: false
retirement_trigger: Supersede when the underlying regulation, coding guidance, or
  workflow standard materially changes
expectations:
- Clearly classify the event as a major deviation tied to delayed reporting workflow
  failure.
- Distinguish what happened at the site from what remains sponsor reporting responsibility.
- Describe root cause, immediate correction, preventive CAPA, and reporting dates
  with operational specificity.
---

# Protocol Deviation Report

**Study**: GLIDE-SENSE / Pivotal Study of the SensePatch Closed-Loop Insulin Delivery System
**Subject ID**: GS-0189
**Deviation Date**: 2026-01-22
**Reported By**: Piper Quill, RN, Clinical Research Coordinator
**Report Date**: 2026-01-27

## Deviation Description
- Protocol section violated: Protocol Section 9.3 Serious Adverse Event Reporting and Site Manual Section 5.2
- Description: Subject GS-0189 was hospitalized for severe hypoglycemia on 2026-01-22. The site received a parent voicemail on 2026-01-23 at 06:40 describing the admission and device suspension. The research team therefore had documented awareness on 2026-01-23, but the sponsor was not notified until 2026-01-27 because the message remained in a general inbox during a weather-related closure and was not escalated under backup coverage procedures.
- Category: Major
- Participant safety impact: Yes
- Data integrity impact: Yes

## Root Cause
The study's SAE escalation pathway depended on a primary coordinator monitoring a shared inbox that did not forward urgent voicemails to the on-call backup. During the closure, the covering staff reviewed clinic scheduling and direct PI messages but did not review the research voicemail queue. The site's emergency closure checklist also lacked a step confirming active surveillance of subject safety communication channels.

## Corrective Action Taken
The PI, Levon Hart, MD, reviewed the hospitalization details on 2026-01-27 immediately after the voicemail was discovered.
The sponsor was notified the same day through the electronic safety portal and by follow-up email to the clinical trial manager.
Source documentation was updated with a dated note describing first site awareness, delay reason, and subsequent escalation.
EDC adverse event and SAE modules were reconciled on 2026-01-27.
The subject's parent was contacted for clinical follow-up and discharge summary collection.
The IRB report package was prepared once the delay was confirmed as a reportable major deviation.

## Preventive Action Planned
All subject-facing safety voicemail lines now auto-forward to the on-call CRC and PI simultaneously.
The weather closure and after-hours coverage SOP was revised to require daily review of voicemail, shared inbox, portal alerts, and hospital ADT notifications for active trial subjects.
The site implemented an SAE awareness log documenting time of awareness, reviewer, escalation time, sponsor notification time, and follow-up completion.
Cross-training for all diabetes program coordinators was completed on 2026-02-03 with competency sign-off.
CAPA effectiveness will be checked after 60 days by auditing all urgent messages and safety escalations.

## Reporting
- Sponsor notified: 2026-01-27
- IRB notified: 2026-01-29 under local reportable event submission pathway
- PI signature: Levon Hart, MD Date: 2026-01-27

## Impact Assessment
- Subject rights impact: Limited direct rights impact, but delayed safety communication impaired prompt oversight
- Subject safety impact: Delay reduced sponsor awareness of a serious event involving hospitalization and potential device performance concerns
- Data impact: SAE onset, awareness, and reporting timestamps required reconciliation across source, EDC, and sponsor safety records
- Broader program risk: Similar delay could recur during closures without redundant escalation pathways

## Follow-Up Actions Logged
- 2026-01-28: Backup coverage matrix distributed to all endocrine research staff
- 2026-01-29: IRB submission completed with CAPA summary
- 2026-02-03: Staff retraining completed and filed
- 2026-02-18: Internal QA spot check found no additional missed urgent messages
