# Candidate Role Gaps

This file tracks role-shaped gaps that the current 51-agent catalog does not cleanly cover.

These are not automatic requests to add new agents. They are candidate expansion areas to review when orchestrator routing repeatedly hits `no_covering_agent`, when scenarios require awkward cross-agent handoffs, or when maintainer review keeps forcing one agent to stretch outside its core deliverables.

## Method

- Review orchestrator scenarios that end in `no_covering_agent`
- Review calibration and maintainer notes for repeated "missing capability" findings
- Prefer new agents only when the missing work product is durable and role-shaped
- Do not create a new agent just because one workflow has an edge case

## Current Candidate Gaps

### 1. Healthcare Legal Counsel

- Why this looks missing:
  - The catalog has a strong [Compliance Officer](../agents/quality-compliance-officer.md), but it does not have a role dedicated to transaction counsel, corporate practice of medicine analysis, litigation hold advice, or contract/legal interpretation outside compliance operations.
- Typical queries that expose the gap:
  - physician practice acquisition structure
  - management services agreement legal review
  - business associate agreement negotiation fallback terms
  - transaction document risk allocation
- Why this should remain separate:
  - Legal advice is not the same as compliance operations. Routing those requests to compliance overstates the current product surface.

### 2. Healthcare Cybersecurity and Privacy Operations

- Why this looks missing:
  - The catalog covers interoperability, information management, and compliance, but it does not have a role focused on HIPAA Security Rule implementation, breach containment operations, identity/access governance, or incident response.
- Typical queries that expose the gap:
  - ransomware response playbooks
  - access-review remediation
  - technical safeguard gap assessment
  - cyber tabletop and recovery planning
- Why this should remain separate:
  - Privacy/compliance review and security operations are adjacent but distinct. A true security role would produce different deliverables and use different evidence.

### 3. Facilities and Capital Planning

- Why this looks missing:
  - The catalog includes hospital administration and emergency preparedness, but not a role focused on plant condition, capital renewal planning, life-safety remediation, or facilities due diligence.
- Typical queries that expose the gap:
  - deferred maintenance prioritization
  - physical plant risk register
  - capital replacement roadmap
  - post-acquisition facilities diligence
- Why this should remain separate:
  - These deliverables are operationally important and recur across acute, ambulatory, and long-term-care settings, but they do not fit cleanly inside existing operations prompts.

### 4. Patient Access and Contact Center Operations

- Why this looks missing:
  - The current operations and payer roles cover downstream workflow, enrollment, contracting, and utilization, but not the front-end patient access layer: registration integrity, scheduling optimization, authorizations intake orchestration, and call-center operations.
- Typical queries that expose the gap:
  - registration error reduction
  - scheduling template governance
  - patient access KPI design
  - pre-service clearance workflow redesign
- Why this should remain separate:
  - The work product is distinct from revenue cycle back-end operations and from ambulatory management.

## Trigger to Promote a Gap Into a New Agent

Promote a candidate gap into a new agent only when at least one of the following is true:

- The orchestrator hits `no_covering_agent` for the same role-shaped work in 3 or more independent scenarios
- A single existing agent would need a new core deliverable section, not just a stronger workflow step
- Maintainer review shows repeated scope-stretching across multiple agents for the same work product

## Current Status

- No new agent is approved yet
- These gaps are tracked so the catalog can expand from real routing evidence rather than intuition
