---
exemplar_id: hea-d02-example-01-qu4-analytics-interop-upgrade-review
agent_slug: healthit-epic-applications-analyst
agents_relevant:
- healthit-epic-applications-analyst
deliverable_id: hea-d02
deliverable_title: Upgrade Impact Assessment
scenario_summary: Reviews a quarterly update affecting Bridges FHIR integrations,
  MyChart release behavior, and Caboodle reporting dependencies.
complexity: high
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- 'ONC information blocking regulation resources: https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-D/part-171'
- 'CMS Interoperability and Prior Authorization Final Rule fact sheet: https://www.cms.gov/newsroom/fact-sheets/cms-interoperability-and-prior-authorization-final-rule-cms-0057-f'
- 'Epic on FHIR public implementation overview: https://fhir.epic.com/'
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Epic Upgrade Impact Assessment

**Current Version**: August 2025
**Target Version**: QU2 2026
**Assessment Date**: 2026-04-09
**Lead Analyst**: Corin Vale

## Breaking Changes
| Nova Article | Module | Description | Custom Build Affected | Remediation Plan |
|-------------|--------|-------------|----------------------|-----------------|
| Public release notes review package item 01 | MyChart | Updated patient-access release logic requires review of manual delay rules tied to sensitive result classes | Yes — custom delay logic on selected result classes | Reconcile release criteria with compliance, retire blanket holds not tied to documented exception logic |
| Public release notes review package item 02 | Bridges / FHIR | OAuth application registration workflow tightened for external SMART on FHIR consumers | Yes — two research apps use older registration assumptions | Update app registry metadata, retest token scope behavior, confirm audit logging |
| Public release notes review package item 03 | Cogito / Caboodle | Dimension refresh timing adjusted for selected ambulatory access subject areas | Yes — custom dashboard depends on prior load window | Shift ETL validation queries and dashboard extract timing before production cutover |

## New Features for Adoption
| Feature | Module | Clinical Value | Build Effort | Adopt? |
|---------|--------|---------------|-------------|--------|
| Expanded scheduling audit detail exposed to analytics feeds | Cadence / Caboodle | Improves access reporting for self-scheduling and reschedule behavior | 2 days | Yes |
| Updated portal messaging controls for result-release communications | MyChart | Reduces patient confusion during phased release of sensitive results | 3 days | Yes |
| FHIR app monitoring enhancements for failed launch attempts | Bridges / Interoperability | Strengthens operational visibility and supports compliance review | 4 days | Yes |
| Optional revised dashboard content from standard analytics catalog | Cogito | Replaces one custom executive dashboard tile with supported content | 2 days | Defer |

## INI Changes Required
| INI | Current Value | New Default | Action Required |
|-----|-------------|-------------|-----------------|
| INI MYC 221 | Organization override for selected delayed result notifications | Revised default notification behavior | Review with compliance and retain only justified overrides |
| INI FHIR 088 | Legacy SMART launch audit flag disabled | Audit flag enabled | Accept default after nonproduction validation |
| INI COG 034 | Current ETL dependency window aligned to prior release | New load sequencing expectation | Override temporarily during first update cycle, then reassess |

## Interface Impact
| Interface | Type | Change Required | Risk Level |
|-----------|------|-----------------|------------|
| OrchardCare Companion App | FHIR | Revalidate SMART launch scopes, token refresh, audit event capture | High |
| PayerAuth Connect | FHIR | Confirm prior authorization status payload handling and denial-code persistence | High |
| Relay Reminder Hub | HL7v2 | No message spec change expected; regression test scheduling event content | Low |
| Finance Claims Gateway | X12 | Confirm no downstream effect from access and encounter metadata updates | Medium |

## Testing Timeline
| Phase | Start | End | Responsible Team |
|-------|-------|-----|-----------------|
| POC build reconciliation | 2026-04-20 | 2026-05-01 | Epic applications analysts |
| MST clinical validation | 2026-05-04 | 2026-05-20 | Ambulatory operations and physician champions |
| Interface regression testing | 2026-05-11 | 2026-05-22 | Bridges and interoperability team |
| Caboodle ETL validation | 2026-05-18 | 2026-05-27 | Cogito data and reporting team |
| Go-live | 2026-06-06 | 2026-06-07 | Enterprise change management and application leads |

## Risk Register
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Legacy portal result-delay rules conflict with current information-blocking policy interpretation | Med | High | Review each suppression rule with compliance and map every retained restriction to explicit policy basis |
| External SMART apps fail post-update due to tightened registration metadata requirements | High | High | Complete end-to-end launch validation in SUP and maintain rollback package for app registry settings |
| Caboodle ambulatory access dashboard shows incomplete weekly counts after ETL timing change | Med | Med | Run parallel extracts for two cycles and compare against Clarity source totals |
| Prior authorization integration logs lose denial-reason detail after FHIR update | Low | High | Validate retained request and response artifacts against test cases covering approval, denial, and timeout |
| Training gap on revised patient-result communication settings increases help desk volume | Med | Med | Publish targeted tip sheet for portal support and ambulatory nursing triage staff |
