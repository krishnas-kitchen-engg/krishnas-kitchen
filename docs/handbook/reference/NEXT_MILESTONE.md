---
title: Next Milestone
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: when candidate implementation milestones change, are approved, are rejected, or are replaced
last_reviewed: null
related:
  - ./README.md
  - ./CURRENT_MILESTONE.md
  - ./PROJECT_MEMORY.md
  - ./IMPLEMENTATION_PATTERNS.md
  - ./COMMON_FAILURES.md
  - ./OPEN_DECISIONS.md
  - ./TECH_DEBT.md
  - ../governance/AI_ENGINEERING_OPERATING_MODEL.md
  - ../process/MILESTONE_LIFECYCLE.md
  - ../process/QUALITY_GATES.md
  - ../adrs/0010-security-review-before-commit.md
  - ../architecture/README.md
---

# Next Milestone

## Purpose

This document records the top three candidate implementation micro-milestones and the single recommended candidate for human approval.

## Current Guidance

Do not use this page as a broad roadmap. It should contain three candidates when enough repository evidence exists.

Each candidate should include recommendation, rationale, confidence, estimated effort, dependencies, risk, expected value, architecture impact, security impact, and testing strategy. The recommended candidate must also include assumptions, uncertainties, and why alternatives were not recommended.

Implementation must not begin until the human approves one candidate. Commit approval remains a separate later gate.

## Status

Implemented for the approved candidate. Pending human review and separate commit approval.

## Approval

Candidate 1, Canonicalize Undo/Reversal Terminology, was approved for implementation.

## Recommended Candidate

Candidate 1: Canonicalize Undo/Reversal Terminology.

Recommendation: Implemented.

Implementation Note: Canonical terminology now defines `undo` as the user-facing action and service operation, `reversal` as the domain event and current persisted correction transaction type, `reversal_of_transaction_id` as the original-transaction link, and legacy persisted `undo` rows as read-compatible history only.

Confidence: 66%.

Rationale: Undo/reversal terminology drift affected inventory correction semantics, documentation, and future UI wording. The implementation was the smallest high-value slice because source behavior already created current reversal transactions.

Estimated Effort: Small to Medium.

Assumptions:

- Current inventory code behavior is correct: undo requests create `transactionType: "reversal"` drafts.
- Legacy `undo` enum values and rows remain compatibility history and should not be removed in this milestone.
- Feature docs can use "undo" for the user action when they explicitly describe the persisted event as `reversal`.

Uncertainties:

- Whether a future data cleanup or migration should retire legacy `undo` values. That is intentionally outside this milestone.

Reasons Alternatives Were Not Recommended:

- Candidate 2 is important, but return semantics may require broader domain and migration review than this terminology slice.
- Candidate 3 is important, but offline queue architecture has higher design uncertainty and should follow a dedicated architecture milestone.

## Candidate 1: Canonicalize Undo/Reversal Terminology

Recommendation: Implemented.

Rationale: The repository already had reversal validation, transaction helpers, mapper compatibility, and migrations, but living docs and older feature docs mixed user-action language with current `reversal` persistence semantics.

Confidence: 66%.

Estimated Effort: Small to Medium.

Dependencies:

- Review [ADR-0009](../adrs/0009-auditability-and-reversibility.md), inventory architecture, transaction compatibility migrations, reversal validation, transaction helpers, mapper compatibility, and affected feature docs.

Risk:

- Medium inventory-correctness risk if terminology cleanup accidentally changes semantics.
- Low implementation risk because the completed slice is documentation/reference-only.

Expected Value: High. Future correction workflows now have one vocabulary across user action, domain event, persisted transaction type, and legacy compatibility.

Architecture Impact: Medium. Inventory architecture and ADR-0009 now contain canonical correction terminology.

Security Impact: Low. Main concern is auditability and inventory integrity rather than authorization.

Testing Strategy:

- Documentation/reference validation.
- Full format, typecheck, lint, test, and build before human review.

Expected Deliverables:

- Canonical distinction between user-facing undo action, domain reversal event, database transaction type, and legacy compatibility.
- Updated affected docs without changing immutable ledger semantics.

Validation Plan:

- Confirm references no longer conflict on `undo` versus `reversal`.
- Confirm no historical transaction mutation or signed-quantity behavior is introduced.

## Candidate 2: Canonicalize Return Transaction Semantics

Recommendation: Defer.

Rationale: Return transaction behavior is implemented, but documentation still mixes transfer-style return movement and migration compatibility that permits increase semantics.

Confidence: 62%.

Estimated Effort: Medium.

Dependencies:

- Review [ADR-0002](../adrs/0002-positive-quantities-and-quantity-effects.md), return validation, return workflow services, transaction constraint migration, and return feature docs.

Risk:

- Medium correctness risk because return semantics affect balances and reversal behavior.

Expected Value: High. Resolves DD-003 and prevents future return workflow ambiguity.

Architecture Impact: Medium.

Security Impact: Low.

Testing Strategy:

- Documentation/reference validation first.
- Run targeted return validation/service tests if the milestone discovers source or test contradictions.

## Candidate 3: Define Offline Queue Architecture

Recommendation: Defer.

Rationale: Offline capability is an architectural requirement, but detailed queue storage, replay, idempotency, conflict, and authorization behavior are not yet captured in a living architecture document.

Confidence: 60%.

Estimated Effort: Medium.

Dependencies:

- Review [ADR-0005](../adrs/0005-mobile-first-offline-pwa.md), inventory repository contracts, transaction audit metadata, current PWA behavior, and Supabase/RPC boundaries.

Risk:

- Medium-to-high architecture risk if offline writes proceed without canonical replay and authorization rules.
- Medium security risk because offline replay must not bypass server authorization or auditability.

Expected Value: High for future offline implementation.

Architecture Impact: High.

Security Impact: Medium.

Testing Strategy:

- Architecture-only validation first.
- Future implementation should include queue unit tests, replay/idempotency tests, and integration coverage where feasible.

## Owner

Engineering owns this document.

## Update Cadence

Update when candidate implementation milestones change, are approved, are rejected, or are replaced.

## Lifecycle

This is living documentation.

## Related Documents

- [Current Milestone](./CURRENT_MILESTONE.md)
- [Project Memory](./PROJECT_MEMORY.md)
- [Implementation Patterns](./IMPLEMENTATION_PATTERNS.md)
- [Common Failures and Engineering Lessons](./COMMON_FAILURES.md)
- [Open Decisions](./OPEN_DECISIONS.md)
- [Technical Debt](./TECH_DEBT.md)
- [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md)
- [Milestone Lifecycle](../process/MILESTONE_LIFECYCLE.md)
- [Quality Gates](../process/QUALITY_GATES.md)
