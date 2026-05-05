# Agent Selection Guide

Use this guide when you know the healthcare operations problem but do not know
which specialist agent to invoke. Start with the task, pick one primary agent,
then add supporting agents only when the work clearly crosses role boundaries.

These agents provide healthcare administration support. They do not provide final
clinical, legal, coding, billing, audit, or compliance determinations, and they
do not make an AI tool safe for PHI by themselves.

## Output Modes

Use one of these phrases in your prompt when you want a specific shape:

| Mode | Use when you need |
|---|---|
| Quick triage | Likely root causes, missing data, immediate checks, and escalation triggers |
| Workplan | Owners, sequence, dependencies, KPIs, timelines, and validation checkpoints |
| Audit/checklist | Evidence requests, pass/fail criteria, source references, remediation owners |
| Artifact/template | A draft deliverable with assumptions, placeholders, and review notes |

## Fast Routing

| Task or symptom | Primary agent | Useful handoffs |
|---|---|---|
| Clean claim rate dropped, denial volume changed, A/R aged unexpectedly | `revenue-cycle-specialist` | `revenue-medical-coding-specialist`, `revenue-contract-analyst`, `clinical-prior-authorization-specialist` |
| Coding audit, DRG/HCC question, modifier/NCCI issue, medical necessity edit | `revenue-medical-coding-specialist` | `clinical-documentation-improvement-specialist`, `revenue-chargemaster-analyst`, `revenue-cycle-specialist` |
| Payer contract underpayment or reimbursement variance | `revenue-contract-analyst` | `payer-relations-specialist`, `payer-managed-care-analyst`, `revenue-finance-manager` |
| CDM maintenance, charge capture, price transparency | `revenue-chargemaster-analyst` | `revenue-medical-coding-specialist`, `revenue-cycle-specialist`, `operations-supply-chain-manager` |
| 340B compliance, split billing, contract pharmacy, duplicate discounts | `revenue-340b-program-manager` | `pharmacy-benefits-specialist`, `revenue-chargemaster-analyst`, `quality-compliance-officer` |
| Budget, cost report, margin, service-line finance, reserves | `revenue-finance-manager` | `revenue-contract-analyst`, `strategy-actuarial-advisor`, `operations-hospital-administrator` |
| Prior authorization delays, payer criteria, peer-to-peer prep, PA appeals | `clinical-prior-authorization-specialist` | `clinical-utilization-management-specialist`, `payer-relations-specialist`, `healthit-interoperability-engineer` |
| Admission status, observation, medical necessity, denial prevention | `clinical-utilization-management-specialist` | `clinical-case-manager`, `clinical-prior-authorization-specialist`, `revenue-cycle-specialist` |
| Discharge barriers, post-acute placement, avoidable days, patient choice | `clinical-case-manager` | `clinical-utilization-management-specialist`, `clinical-care-management-specialist`, `clinical-referral-specialist` |
| Care coordination, TCM/CCM, readmission prevention, SDOH workflows | `clinical-care-management-specialist` | `clinical-case-manager`, `pophealth-population-health-manager`, `payer-value-based-care-manager` |
| Referral leakage, loop closure, specialty access, network navigation | `clinical-referral-specialist` | `clinical-prior-authorization-specialist`, `operations-ambulatory-manager`, `pophealth-population-health-manager` |
| CDI query, CC/MCC capture, clinical validation denial | `clinical-documentation-improvement-specialist` | `revenue-medical-coding-specialist`, `revenue-cycle-specialist`, `healthit-information-manager` |
| HAI surveillance, NHSN attribution, outbreak or infection-control readiness | `clinical-infection-prevention-specialist` | `quality-patient-safety-officer`, `pophealth-surveillance-coordinator`, `pharmacy-medication-safety-specialist` |
| IRB, consent, protocol deviation, SAE, regulatory binder | `clinical-research-coordinator` | `quality-compliance-officer`, `healthit-information-manager`, `healthit-clinical-data-analyst` |
| Survey readiness, accreditation evidence, tracer prep | `quality-accreditation-specialist` | `quality-compliance-officer`, `quality-patient-safety-officer`, `operations-hospital-administrator` |
| HIPAA, Stark, AKS, FCA, EMTALA, OIG, overpayment or exclusion concern | `quality-compliance-officer` | `healthit-information-manager`, `quality-risk-manager`, `revenue-cycle-specialist` |
| RCA, sentinel event, Just Culture, PSO boundary, safety trend | `quality-patient-safety-officer` | `quality-risk-manager`, `quality-process-improvement-analyst`, `pharmacy-medication-safety-specialist` |
| Grievance, CAHPS/HCAHPS, patient relations, service recovery | `quality-patient-experience-coordinator` | `quality-risk-manager`, `quality-compliance-officer`, `operations-ambulatory-manager` |
| Quality measures, HEDIS/MIPS/Stars/eCQMs, SPC, reporting improvement | `quality-improvement-specialist` | `quality-process-improvement-analyst`, `quality-patient-experience-coordinator`, `pophealth-population-health-manager` |
| A3, PDSA, Lean/Six Sigma, value stream map, CAPA | `quality-process-improvement-analyst` | `quality-improvement-specialist`, `operations-hospital-administrator`, `quality-patient-safety-officer` |
| Risk register, malpractice exposure, disclosure, claims, insurance | `quality-risk-manager` | `quality-compliance-officer`, `quality-patient-safety-officer`, `healthit-information-manager` |
| Bed capacity, ED boarding, transfer center, throughput command center | `operations-hospital-administrator` | `strategy-clinical-operations-consultant`, `operations-workforce-manager`, `clinical-case-manager` |
| Clinic access, templates, rooming, no-shows, multi-site ambulatory ops | `operations-ambulatory-manager` | `operations-physician-practice-manager`, `quality-patient-experience-coordinator`, `clinical-referral-specialist` |
| Practice productivity, wRVUs, provider templates, practice P&L | `operations-physician-practice-manager` | `operations-ambulatory-manager`, `revenue-cycle-specialist`, `payer-relations-specialist` |
| Home health OASIS, PDGM, LUPA, HHVBP, survey readiness | `operations-home-health-administrator` | `clinical-care-management-specialist`, `revenue-finance-manager`, `quality-compliance-officer` |
| SNF/LTC MDS, PDPM, PBJ, Five-Star, resident rights, survey process | `operations-long-term-care-administrator` | `quality-accreditation-specialist`, `clinical-infection-prevention-specialist`, `operations-workforce-manager` |
| Staffing, scheduling, agency labor, float pool, retention | `operations-workforce-manager` | `operations-hospital-administrator`, `strategy-clinical-operations-consultant`, `operations-long-term-care-administrator` |
| GPO, value analysis, inventory, recall, OR supplies, supply resilience | `operations-supply-chain-manager` | `revenue-finance-manager`, `revenue-340b-program-manager`, `emergency-preparedness-coordinator` |
| Epic build, upgrade, workflow configuration, EHR change request | `healthit-epic-applications-analyst` | `healthit-informatics-manager`, `healthit-interoperability-engineer`, `healthit-clinical-data-analyst` |
| HL7v2, FHIR, C-CDA, X12, HIE, patient matching, interface errors | `healthit-interoperability-engineer` | `healthit-informatics-manager`, `healthit-clinical-data-analyst`, `healthit-epic-applications-analyst` |
| Clinical dashboard, registry, eCQM logic, SQL/Python analytics | `healthit-clinical-data-analyst` | `quality-improvement-specialist`, `healthit-informatics-manager`, `healthit-interoperability-engineer` |
| Informatics governance, CDS, USCDI/TEFCA, data governance | `healthit-informatics-manager` | `healthit-epic-applications-analyst`, `healthit-interoperability-engineer`, `healthit-clinical-data-analyst` |
| HIM, ROI, retention, legal health record, chart integrity | `healthit-information-manager` | `quality-compliance-officer`, `revenue-medical-coding-specialist`, `clinical-documentation-improvement-specialist` |
| Telehealth program, licensure, RPM/RTM, virtual care reimbursement | `healthit-telehealth-program-manager` | `strategy-clinical-operations-consultant`, `payer-medicare-medicaid-specialist`, `revenue-cycle-specialist` |
| ACO/VBC, attribution, shared savings, quality gates, downside risk | `payer-value-based-care-manager` | `pophealth-population-health-manager`, `strategy-actuarial-advisor`, `clinical-care-management-specialist` |
| Credentialing, enrollment, CAQH, PECOS/CMS-855, revalidation | `payer-credentialing-enrollment-coordinator` | `payer-relations-specialist`, `payer-medicare-medicaid-specialist`, `quality-compliance-officer` |
| Medicare/Medicaid rules, MAC process, CoPs, dual-eligible workflows | `payer-medicare-medicaid-specialist` | `quality-compliance-officer`, `payer-credentialing-enrollment-coordinator`, `revenue-cycle-specialist` |
| Medicare outreach, plan comparison, LIS/Extra Help, enrollment periods | `payer-medicare-outreach-coordinator` | `payer-medicare-medicaid-specialist`, `pophealth-community-health-coordinator`, `quality-compliance-officer` |
| Managed-care financial analysis, PMPM, MLR, network adequacy | `payer-managed-care-analyst` | `strategy-actuarial-advisor`, `revenue-finance-manager`, `payer-value-based-care-manager` |
| Payer contracting, network participation, NSA, single-case agreements | `payer-relations-specialist` | `revenue-contract-analyst`, `payer-managed-care-analyst`, `revenue-cycle-specialist` |
| Population health risk stratification, care gaps, SDOH outreach | `pophealth-population-health-manager` | `clinical-care-management-specialist`, `payer-value-based-care-manager`, `healthit-clinical-data-analyst` |
| CHNA, community benefit, Schedule H, grants, CBO partnerships | `pophealth-community-health-coordinator` | `pophealth-population-health-manager`, `pophealth-surveillance-coordinator`, `quality-patient-experience-coordinator` |
| Reportable disease, outbreak investigation, syndromic surveillance | `pophealth-surveillance-coordinator` | `clinical-infection-prevention-specialist`, `healthit-interoperability-engineer`, `emergency-preparedness-coordinator` |
| Formulary, PBM, specialty pharmacy, rebates, biosimilars | `pharmacy-benefits-specialist` | `revenue-contract-analyst`, `payer-managed-care-analyst`, `pharmacy-medication-safety-specialist` |
| Medication safety event, CPOE/BCMA, smart pump, USP 797/800 | `pharmacy-medication-safety-specialist` | `quality-patient-safety-officer`, `clinical-infection-prevention-specialist`, `pharmacy-benefits-specialist` |
| HVA, emergency operations plan, HICS, surge, evacuation, exercise | `emergency-preparedness-coordinator` | `operations-hospital-administrator`, `operations-workforce-manager`, `operations-supply-chain-manager` |
| Market strategy, service line, M&A, CON, physician alignment | `strategy-healthcare-consultant` | `revenue-finance-manager`, `strategy-operations-consultant`, `payer-relations-specialist` |
| Clinical workflow, ED/OR throughput, staffing model, care redesign | `strategy-clinical-operations-consultant` | `operations-hospital-administrator`, `operations-workforce-manager`, `clinical-case-manager` |
| Lean/Six Sigma deployment, capacity, benchmarking, predictive ops | `strategy-operations-consultant` | `quality-process-improvement-analyst`, `operations-hospital-administrator`, `operations-workforce-manager` |
| Organizational redesign, governance, change, merger integration | `strategy-structural-improvement-consultant` | `strategy-healthcare-consultant`, `strategy-operations-consultant`, `operations-workforce-manager` |
| Capitation, IBNR, MLR, risk adjustment, actuarial caveats | `strategy-actuarial-advisor` | `payer-managed-care-analyst`, `payer-value-based-care-manager`, `revenue-finance-manager` |

## If The Request Is Ambiguous

1. Pick the operational owner closest to the immediate problem.
2. Ask for the missing inputs listed in that agent's `Best Inputs` section.
3. Use `quick triage` first when the user has symptoms but not data.
4. Name handoffs explicitly instead of blending agents into a generic answer.
5. Escalate final decisions to the appropriate human owner when the task touches clinical care, legal interpretation, coding of record, billing authority, contracting, employment, or compliance sign-off.
