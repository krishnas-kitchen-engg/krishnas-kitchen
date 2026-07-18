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
- [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md) is the single workflow contract for AI-assisted engineering sessions. Its Session Controller is the canonical execution workflow.
- Session resume is repository-evidence based. Do not create persistent session files; reconstruct first, then continue from the appropriate controller state when evidence shows an interrupted workflow.
- Evidence Capture belongs inside the Verification to Ready For Human Review transition, not in a separate workflow state.
- [Product Horizons](../../PRODUCT_HORIZONS.md) is the canonical long-term product roadmap. Horizon 1 is active; milestone recommendations must come from the active horizon.
- [Engineering Principles](../governance/ENGINEERING_PRINCIPLES.md) records timeless philosophy; workflow belongs in the operating model.
- Existing project documentation remains useful source material; do not duplicate it into the handbook without a focused milestone.
- The inventory model is an immutable event ledger. Balances are derived from transactions.
- Browser clients are not authoritative for protected authorization decisions.
- Temporary volunteer browser permissions are read/session-only: `locations.read`, `items.read`, `inventory.read`, and `volunteer_sessions.create`.
- Undo/reversal terminology is canonical: `undo` is the user-facing action and service operation, `reversal` is the current persisted correction transaction type, and legacy persisted `undo` rows are read-compatible history only.
- Return semantics are canonical: new application-created `returned` transactions use `quantityEffect: "transfer"` and move positive quantity from source location to destination location.
- Offline capability is an architectural requirement. Offline queue architecture is canonicalized in [Offline Sync Architecture](../architecture/offline-sync.md), while local queue storage and replay implementation remain future work.
- Security architecture is canonicalized in [Security Architecture](../architecture/security.md). It owns durable Horizon 1 auth, permission, RLS, RPC, temporary volunteer, and offline replay security boundaries; [Security Status](./SECURITY_STATUS.md) remains posture and review tracking.
- The latest Horizon 1 security review baseline is recorded in [Security Status](./SECURITY_STATUS.md). It is evidence for planning and review, not production security approval.
- Temporary volunteer login diagnostic instrumentation was resolved and should not be reintroduced as permanent behavior.
- Living planning/status references must be refreshed after completed milestones so `CURRENT_MILESTONE.md`, `NEXT_MILESTONE.md`, scorecard, and limitations do not keep pointing future sessions at completed work.
- After commit `c8a4f5c`, living milestone state was refreshed so the security architecture milestone is treated as committed history rather than pending review.
- Temporary volunteer permission drift was reconciled by aligning docs, permission helpers, and workflow tests to the read/session-only browser permission policy.
- Permission-sensitive tests should set exact permission arrays instead of relying on broad auth fixture defaults.

## Lessons Learned

| Situation | Discovery | Why It Mattered | Recommended Future Behavior |
|---|---|---|---|
| The handbook originally treated an approved next milestone as a prerequisite for implementation planning | Engineering stalled when `NEXT_MILESTONE.md` had no approved milestone | The intended flow was candidate proposal, human approval, then implementation | Always propose ranked candidate micro-milestones after repository refresh; wait for human approval before implementation |
| EOS documents began accumulating workflow guidance in multiple places | Duplicate process language made drift likely | Future AI sessions could follow the wrong page or miss the canonical contract | Keep operating behavior in [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md); supporting docs should point to it |
| Documentation infrastructure kept expanding after the handbook became usable | New docs can become maintenance burden if they do not reduce future work | The project needs to return to application delivery after governance stabilizes | Prefer simplifying existing docs; create new handbook pages only for durable gaps |
| Temporary volunteer auth/routing diagnostics remained in the dirty worktree | Documentation-only milestones can coexist with unfinished app work | Future implementation could accidentally mix unrelated changes | Repository audit must identify dirty worktree ownership, isolate the approved milestone before editing, and verify temporary diagnostics are removed before commit readiness |
| Completed milestones remained active in living planning docs | Current milestone, next milestone, scorecard, and limitations can drift after a successful commit | Future EOS sessions may recommend completed work or understate current verification evidence | After each completed milestone, refresh planning/status docs before recommending the next candidate |
| Temporary volunteer permissions and undo/reversal terminology remained inconsistent across older docs | Historical documents preserve useful context but may not represent current authority | Silent reconciliation would hide product/security decisions | Record drift, propose focused milestones, and stop when product or security authority is needed |
| Repository reconstruction found stale milestone state outside the main candidate page | `PROJECT_RECONSTRUCTION.md` still carried an older ranked table after `NEXT_MILESTONE.md` was refreshed | Future sessions could restart from completed work despite the current candidate page being correct | Validate reconstruction docs against current milestone and next milestone during every resume |
| Temporary volunteer workflow tests relied on default operational permissions in auth fixtures | Fixture defaults made temporary-session tests pass as though temporary volunteers had write permissions | The permission drift could persist without a helper-level test | In permission-sensitive tests, pass the exact permissions being asserted and add a direct helper test near the permission source |
| Undo/reversal drift was resolved without source changes | Current code already creates `reversal` transactions and keeps legacy `undo` compatibility at the mapper/database boundary | Documentation could be fixed safely as a terminology milestone instead of a behavior change | For inventory correction work, preserve `undo` as UI/service language and `reversal` as persisted event language unless a new ADR supersedes ADR-0009 |
| Return semantics drift was resolved without source changes | Current code already creates return transactions as `returned` plus `transfer`, while migrations allow an older compatibility shape | Documentation could clarify current behavior without changing ledger semantics | Treat `returned` plus `transfer` as the current creation path; preserve migration compatibility unless a future data migration is separately approved |
| Offline architecture drift was resolved without source changes | PWA tooling, offline-safe transaction IDs, audit metadata, and repository boundaries already existed, but no living queue/replay architecture page existed | Future offline implementation could otherwise bypass inventory integrity or server authorization constraints | Treat offline writes as future queued, validated drafts replayed through authoritative server/database boundaries; implement storage, replay, and idempotency only in separate approved milestones |
| Product horizons were added as the canonical long-term roadmap | Future horizons can tempt implementation scope expansion during milestone selection | Architecture can account for future horizons, but implementation must stay inside the active horizon | Read Product Horizons during reconstruction; reject out-of-horizon implementation candidates and explain why |
| Security ownership was consolidated without source changes | Existing ADRs, security status, auth docs, permissions docs, Supabase docs, and migrations already described the boundary, but no living architecture page owned it | Future security-sensitive work needs one durable source before permission, write-path, or offline replay expansion | Use Security Architecture as the canonical boundary; update Security Status for posture/review evidence |
| Security architecture commit left planning docs stale | Current/next milestone, reconstruction, state, and scorecard references still described committed work as pending | Future EOS sessions could restart completed work or misread repository health | Treat post-commit milestone-state refresh as a focused Horizon 1 documentation milestone when planning docs drift after commit |
| Security review baseline was missing after architecture consolidation | Security boundaries were documented, but the latest full security review result still appeared as an unrecorded risk | Security-sensitive follow-up work needs explicit findings, risks, and approval status | Record security review baselines in Security Status and keep production approval separate from review evidence |
| Session Controller freeze simplified the EOS | Resume behavior, verification repeat behavior, evidence capture, and commit approval needed one canonical controller instead of scattered workflow language | Future sessions need deterministic continuation without extra session files or competing workflow states | Use repository evidence to resume, keep Repository Refresh Protocol as scan authority, and keep Evidence Capture inside verification completion |

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
