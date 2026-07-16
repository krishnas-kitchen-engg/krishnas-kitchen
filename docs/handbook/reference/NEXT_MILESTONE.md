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

Implemented for the approved candidate. Human review and commit approval received.

## Approval

Candidate 1, Canonicalize Return Transaction Semantics, was approved for implementation.

## Recommended Candidate

Candidate 1: Canonicalize Return Transaction Semantics.

Recommendation: Implemented.

Implementation Note: Current return semantics now define new application-created returns as `transaction_type = "returned"` with `quantity_effect = "transfer"`, source and destination locations, and positive quantity. Migration support for `returned` plus `increase` is compatibility only.

Confidence: 70%.

Rationale: Return semantics drift affected inventory balance expectations. The implementation was a documentation/reference slice because source behavior and tests already create and verify transfer-style return movement.

Estimated Effort: Medium.

Assumptions:

- Current inventory code behavior is correct: return requests create `transactionType: "returned"` and `quantityEffect: "transfer"` drafts.
- Migration compatibility for `returned` plus `increase` should remain intact.
- Future data cleanup or migration work requires separate approval.

Uncertainties:

- Whether any legacy production data uses `returned` plus `increase`; no data inspection was performed in this documentation milestone.

Reasons Alternatives Were Not Recommended:

- Candidate 2 is important, but offline queue architecture has more design surface and should follow canonical inventory transaction semantics.
- Candidate 3 is valuable, but security architecture consolidation is less directly tied to the resolved inventory correctness drift.

## Candidate 1: Canonicalize Return Transaction Semantics

Recommendation: Implemented.

Rationale: Return transaction behavior is implemented as transfer movement, but documentation and migration compatibility previously made current behavior ambiguous.

Confidence: 70%.

Estimated Effort: Medium.

Dependencies:

- Review [ADR-0002](../adrs/0002-positive-quantities-and-quantity-effects.md), inventory architecture, return validation/tests, transaction helpers, aggregation tests, return scan workflow docs, and transaction constraint migration.

Risk:

- Medium correctness risk because return semantics affect balances and reversal behavior.
- Low implementation risk because the completed slice is documentation/reference-only.

Expected Value: High. Future return workflow work now has one current creation model and an explicit compatibility boundary.

Architecture Impact: Medium. Inventory architecture and ADR-0002 now state canonical return semantics.

Security Impact: Low. Main concern is inventory integrity rather than authorization.

Testing Strategy:

- Documentation/reference validation.
- Full format, typecheck, lint, test, and build before human review.

Expected Deliverables:

- Canonical return transaction semantics.
- Updated affected docs without changing ledger behavior or migration compatibility.

Validation Plan:

- Confirm references no longer describe return semantics ambiguously.
- Confirm no source, migration, or runtime behavior changed.

## Candidate 2: Define Offline Queue Architecture

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

## Candidate 3: Consolidate Security Architecture Ownership

Recommendation: Defer.

Rationale: Security status is distributed across auth architecture, permissions, Supabase docs, ADRs, migrations, and status references. A living security architecture page would reduce future authorization and RLS drift.

Confidence: 58%.

Estimated Effort: Medium.

Dependencies:

- Review [Security Status](./SECURITY_STATUS.md), [Auth Architecture](../../AUTH_ARCHITECTURE.md), [Permissions Matrix](../../PERMISSIONS_MATRIX.md), [Supabase README](../../../infra/supabase/README.md), ADR-0003, ADR-0004, ADR-0007, ADR-0010, and current migrations.

Risk:

- Medium documentation/security risk if the page overstates implemented guarantees.

Expected Value: High before future volunteer write capability or offline replay work.

Architecture Impact: Medium.

Security Impact: Medium.

Testing Strategy:

- Documentation/reference validation.
- No code verification unless implementation scope changes.

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
