---
exemplar_id: pph-d02-example-01-medicaid-col-screening-campaign
agent_slug: pophealth-population-health-manager
agents_relevant:
- pophealth-population-health-manager
deliverable_id: pph-d02
deliverable_title: Care Gap Closure Campaign Plan
scenario_summary: Twelve-week colorectal cancer screening campaign for a synthetic
  Medicaid managed care population with transportation and language barriers.
complexity: moderate
mcp_servers_relevant:
- current_regulatory_policy
regulatory_as_of: '2026-04-09'
source_basis:
- NCQA HEDIS measure information at ncqa.org/hedis/measures
- US Preventive Services Task Force colorectal cancer screening recommendation at
  uspreventiveservicestaskforce.org
- CDC colorectal cancer screening resources at cdc.gov/cancer/colorectal/basic_info/screening
generated_by: gpt-5.4-medium
reviewed_by: draft-pending-review
review_status: draft
review_date: '2026-04-09'
---

# Care Gap Closure Campaign Plan

**Measure**: COL Colorectal Cancer Screening
**Measurement Year**: MY2026
**Campaign Period**: 2026-05-04 - 2026-07-31
**Target Population**: 3,420 members with open gaps

## Gap Analysis
- Current rate: 66.8%
- Goal rate: 71.0% with a stretch target of 76.0%
- Members needed to close: 486 to reach the 4-Star threshold
- Estimated closure rate per outreach attempt: 18.5% for mailed FIT outreach, 9.0% for live-call scheduling, 28.0% for point-of-care conversion
- Required outreach volume: 6,100 multichannel attempts across 12 weeks

## Outreach Strategy
| Wave | Channel | Audience | Timing | Expected Yield |
|------|---------|----------|--------|---------------|
| 1 | Mail plus text | All open gaps with valid address or mobile | Weeks 1-2 | 11% |
| 2 | Live call | Members without returned FIT or scheduled colonoscopy | Weeks 3-6 | 8% |
| 3 | Provider office | Members with PCP or GI visit already booked | Ongoing | 12% |
| 4 | CHW and mobile outreach | Members with prior no-show, transportation barrier, or limited English proficiency | Weeks 7-12 | 6% |

## Messaging Script
**IVR/Text**: Riverbend Community Health Plan is reminding you that colorectal cancer screening can prevent cancer or find it early. A no-cost home FIT kit or colonoscopy scheduling support is available. Reply FIT for a mailed kit, CALL for live scheduling support, or STOP to opt out.

**Live Call**: Hello, this is Mara from Riverbend Community Health Plan calling about an important preventive screening that is covered at no cost. You are due for colorectal cancer screening this year. We can mail a home FIT kit, help schedule a colonoscopy, arrange interpreter support, and review transportation options. Would you like to complete the kit by mail or schedule a visit?

**Provider Talking Points**: Emphasize that screening is due this measurement year, confirm whether any outside screening was completed, offer same-visit FIT kit distribution for appropriate members, and route transportation or language barriers to the CHW queue before checkout.

## Barriers and Mitigation
| Barrier | Mitigation Strategy |
|---------|-------------------|
| Transportation | Non-emergency medical transport scheduling and rideshare voucher for colonoscopy visits |
| Language | Spanish, Somali, and Vietnamese outreach scripts plus interpreter-assisted calls |
| Cost or insurance confusion | Scripted explanation that screening is covered and prior authorization is not required for standard outreach pathways |
| Health literacy | Plain-language FIT instructions with pictorial insert and outbound reminder call after kit delivery |
| Fear or distrust | CHW follow-up using culturally concordant staff and brief education about prevention versus diagnosis |

## Tracking & Reporting
- Daily: FIT kits mailed, texts delivered, live-call reach rate, opt-outs, appointments scheduled
- Weekly: FIT return rate, colonoscopy completion rate, external screening attestation follow-up, barrier log review
- Monthly: Numerator-eligible closures validated against source data, campaign cost per closure, subgroup performance by language and county

## Budget
| Item | Unit Cost | Volume | Total |
|------|-----------|--------|-------|
| Outreach staff time | $36/hr | 420 hrs | $15,120 |
| Mailing and printing | $6.40/piece | 2,700 pieces | $17,280 |
| Patient incentives | $15/each | 320 each | $4,800 |
| Transportation assistance | $42/trip | 85 trips | $3,570 |
| **Total campaign cost** |  |  | **$40,770** |
| **Cost per gap closed** |  |  | **$83.89** |

Execution notes:
- Prioritize members aged 52-64 with no claim, lab, or supplemental evidence of screening in the current lookback window.
- Suppress members with documented recent colonoscopy pending file validation to avoid duplicate outreach.
- Route members with positive FIT results into a navigator queue within one business day to protect downstream diagnostic follow-up.
- If current regulatory policy capability is available, confirm current CMS and state contract guidance before finalizing incentive language and outreach automation rules.
