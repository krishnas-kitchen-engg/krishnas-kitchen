---
title: Project Memory
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: after milestones that change durable project understanding
last_reviewed: null
related:
  - ./README.md
  - ./CURRENT_STATE.md
  - ./CHANGELOG_SUMMARY.md
  - ./PROJECT_SCORECARD.md
  - ./IMPLEMENTATION_PATTERNS.md
  - ./COMMON_FAILURES.md
  - ../governance/AI_ENGINEERING_OPERATING_MODEL.md
---

# Project Memory

## Purpose

This document captures durable project knowledge that future sessions should remember without relying on conversation history.

Use it for institutional memory, not detailed architecture, feature specs, or process rules.

## Current Memory

- The Engineering Handbook is the canonical engineering operating system.
- [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md) is the single workflow contract for AI-assisted engineering sessions.
- [Engineering Principles](../governance/ENGINEERING_PRINCIPLES.md) records timeless philosophy; workflow belongs in the operating model.
- Existing project documentation remains useful source material; do not duplicate it into the handbook without a focused milestone.
- The inventory model is an immutable event ledger. Balances are derived from transactions.
- Browser clients are not authoritative for protected authorization decisions.
- Temporary volunteer permissions remain a known documentation and product-intent drift area.
- Undo and reversal terminology remains a known drift area.
- Offline capability is an architectural requirement, but detailed offline queue architecture remains incomplete.
- Current dirty worktree app changes around temporary volunteer login diagnostics must be reviewed before application development resumes.

## Lessons Learned

| Situation | Discovery | Why It Mattered | Recommended Future Behavior |
|---|---|---|---|
| The handbook originally treated an approved next milestone as a prerequisite for implementation planning | Engineering stalled when `NEXT_MILESTONE.md` had no approved milestone | The intended flow was candidate proposal, human approval, then implementation | Always propose ranked candidate micro-milestones after repository refresh; wait for human approval before implementation |
| EOS documents began accumulating workflow guidance in multiple places | Duplicate process language made drift likely | Future AI sessions could follow the wrong page or miss the canonical contract | Keep operating behavior in [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md); supporting docs should point to it |
| Documentation infrastructure kept expanding after the handbook became usable | New docs can become maintenance burden if they do not reduce future work | The project needs to return to application delivery after governance stabilizes | Prefer simplifying existing docs; create new handbook pages only for durable gaps |
| Temporary volunteer auth/routing diagnostics remained in the dirty worktree | Documentation-only milestones can coexist with unfinished app work | Future implementation could accidentally mix unrelated changes | Repository audit must identify dirty worktree ownership and isolate the approved milestone before editing |
| Temporary volunteer permissions and undo/reversal terminology remained inconsistent across older docs | Historical documents preserve useful context but may not represent current authority | Silent reconciliation would hide product/security decisions | Record drift, propose focused milestones, and stop when product or security authority is needed |

## Memory Update Rules

- Add memory only when it is durable across future sessions.
- Prefer links to canonical docs over restating details.
- Remove or revise memory when implementation, ADRs, or living reference docs supersede it.
- Do not use this page as a backlog.

## Owner

Engineering owns this document.

## Update Cadence

Update after milestones that change durable project understanding.

## Lifecycle

This is living documentation.

## Related Documents

- [Current State](./CURRENT_STATE.md)
- [Changelog Summary](./CHANGELOG_SUMMARY.md)
- [Project Scorecard](./PROJECT_SCORECARD.md)
- [Implementation Patterns](./IMPLEMENTATION_PATTERNS.md)
- [Common Failures and Engineering Lessons](./COMMON_FAILURES.md)
- [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md)
