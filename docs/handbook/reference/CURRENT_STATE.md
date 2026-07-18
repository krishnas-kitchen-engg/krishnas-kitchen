---
title: Current State
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: after every implementation milestone or major documentation milestone
last_reviewed: null
related:
  - ./README.md
  - ./CURRENT_MILESTONE.md
  - ./PROJECT_RECONSTRUCTION.md
  - ./PROJECT_MEMORY.md
  - ./IMPLEMENTATION_PATTERNS.md
  - ./COMMON_FAILURES.md
  - ./PROJECT_SCORECARD.md
  - ./KNOWN_LIMITATIONS.md
  - ./OPEN_DECISIONS.md
  - ../governance/AI_ENGINEERING_OPERATING_MODEL.md
  - ../../PRODUCT_HORIZONS.md
  - ../adrs/0001-immutable-inventory-ledger.md
  - ../adrs/0003-supabase-auth-and-rls-boundary.md
  - ../adrs/0005-mobile-first-offline-pwa.md
  - ../adrs/0006-repository-pattern.md
  - ../adrs/0008-domain-driven-package-organization.md
  - ../architecture/README.md
  - ../architecture/offline-sync.md
  - ../architecture/security.md
  - ../../SYSTEM_ARCHITECTURE.md
  - ../../INVENTORY_ARCHITECTURE.md
  - ../../AUTH_ARCHITECTURE.md
  - ../../../README.md
---

# Current State

## Purpose

This document summarizes the current state of Krishna's Kitchen from repository evidence.

## Current Guidance

Use this document as the first factual project snapshot before planning new implementation work. Update it when code, migrations, tests, security posture, or canonical documentation changes.

## Overall Maturity

Krishna's Kitchen is in active development. The repository contains a React/Vite/TypeScript PWA, Supabase integration boundaries, inventory domain implementation, authentication and temporary volunteer session work, mobile inventory workflow screens, Supabase migrations, test coverage, and an Engineering Handbook foundation.

The project is not documented as production-ready.

## Completed Milestones

- Foundational project structure and PWA stack are present.
- Auth architecture and role/permission documentation exist.
- Inventory architecture is documented around immutable transactions.
- Supabase foundational schema and later additive migrations exist.
- Inventory domain services, repository adapters, visibility, barcode, scan, receive, transfer, return, unknown barcode, and low-stock work are present in source and tests.
- Engineering Handbook foundation, governance, operating model, process, template, and ADR layers exist in `docs/handbook`.
- Temporary volunteer login diagnostic instrumentation has been removed from the auth/routing worktree, returning those application files to repository behavior.
- Living planning/status references have been refreshed so the next candidate set no longer points to completed diagnostic cleanup work.
- Temporary volunteer permission drift was reconciled by restricting temporary volunteer browser permissions to read/session capabilities.
- Undo/reversal terminology was canonicalized across inventory architecture, ADR-0009, affected feature docs, and living drift/debt/decision references.
- Return transaction semantics were canonicalized across inventory architecture, affected feature docs, and living drift references after reviewing ADR-0002.
- Offline queue architecture was defined in a living architecture page without implementing queue storage, replay, or runtime sync behavior.
- Security architecture ownership was consolidated and committed in `c8a4f5c`.
- The Horizon 1 security review baseline was recorded in [Security Status](./SECURITY_STATUS.md) without changing runtime behavior.
- The Engineering Operating System Session Controller was frozen for production use without changing application behavior.
- Recipe definition domain foundation is implemented with pure domain types, validation, normalization, exports, and tests.
- Engineering Operating System completion reporting now separates Residual Risks from Future Approved Work without changing workflow behavior.
- Recipe scaling domain foundation is implemented with pure domain scaling logic and tests.
- Recipe availability domain foundation is implemented with pure domain availability evaluation logic and tests.
- Recipe shopping-list domain foundation is implemented with pure domain shortage-output logic and tests.
- Recipe repository contract foundation is implemented with an application-layer list/read contract and tests.

## Implemented Domains

- `auth`: authentication provider, auth screens, temporary volunteer session storage, volunteer session repository/RPC integration.
- `inventory`: inventory domain, validation, aggregation, visibility, barcode lookup/catalog, unknown barcode, repository adapters, scan workflows, receive/transfer/return workflows.
- `recipes`: recipe definition domain inputs, ingredient validation, serving/yield validation, normalization, recipe-specific validation errors, ingredient quantity scaling, exact item/unit availability evaluation, exact item/unit shopping-list shortage output, and a recipe application repository contract.
- `home`: volunteer home summary and shell integration.
- `tasks`: task screen and inventory-related task summaries.

## Authentication Status

Supabase Auth is documented as the browser session source. `SupabaseAuthProvider`, `AuthProvider`, and `RouteGuard` exist in the app structure. Temporary volunteer session storage and Supabase volunteer session repository tests exist.

Temporary volunteer login/navigation diagnostic logging has been resolved. No `KK_LOGIN_DEBUG` or `console.info` instrumentation remains in `apps/web/src`.

Temporary volunteer browser permissions are restricted to `locations.read`, `items.read`, `inventory.read`, and `volunteer_sessions.create`. Temporary volunteers do not receive receive, transfer, consume, return, adjust, or undo permissions.

## Inventory Status

Inventory is implemented around immutable transaction drafts, aggregation, visibility projections, receiving, transfer, return, reversal, barcode scanning, catalog queries, unknown barcode handling, and low stock thresholds.

Inventory architecture and ADRs establish that balances are derived from immutable transaction history.

Canonical correction terminology: `undo` is the user-facing action and service operation, `reversal` is the domain event and current persisted correction transaction type, `reversal_of_transaction_id` links to the original transaction, and legacy persisted `undo` rows remain read-compatible history only.

Canonical return semantics: current application-created return transactions use `transaction_type = "returned"` with `quantity_effect = "transfer"`. Returns move positive quantity from source location to destination location; migration support for `returned` plus `increase` is compatibility only.

Canonical offline architecture: offline writes must preserve domain validation, immutable inventory semantics, audit/client request metadata, repository boundaries, idempotent replay, fail-closed authorization, and server/database authority. Local queue storage and replay are not implemented yet.

## Recipe Status

Recipe definition, scaling, availability, shopping-list, and repository-contract work has started inside Horizon 1. The current slices validate recipe names, servings/yield, inventory item references, supported item units, and positive finite ingredient quantities; normalize user-entered recipe text; scale ingredient quantities to a target serving count; evaluate ingredient availability against projected inventory item balances by exact item/unit match; generate shortage-only shopping-list item groups from availability results; and define a scoped recipe repository contract for future application integration.

No recipe UI, routes, persistence implementation, Supabase adapter, migrations, RLS/RPC changes, unit conversion, procurement, vendor management, approval workflow, menu planning, or higher-horizon kitchen planning behavior is implemented.

## Database Status

Supabase migrations exist for:

- Foundational schema.
- Reversal transaction type and transaction constraint reconciliation.
- Barcode catalog schema reconciliation.
- Unknown barcodes.
- Low stock thresholds.
- Volunteer session runtime fields.
- RLS helper functions.
- Volunteer session RPCs.
- Authenticated inventory read policies.
- Temporary volunteer inventory read RPCs.
- Temporary volunteer barcode catalog RPC.

## Security Status

RLS is enabled on foundational tables. Authenticated read policies exist for inventory-facing tables. Security-definer helper functions and controlled volunteer RPCs exist. Browser trust boundaries are documented in ADRs and consolidated in [Security Architecture](../architecture/security.md).

The latest Horizon 1 security review baseline is recorded in [Security Status](./SECURITY_STATUS.md). This baseline does not grant production security approval.

Offline architecture is now documented in [Offline Sync Architecture](../architecture/offline-sync.md). Offline queue implementation remains future work.

## Testing Status

Vitest is configured. Tests exist for inventory domain logic, repository adapters, migrations, auth volunteer sessions, UI reducers/screens, shell navigation, and shared utilities.

Latest implementation verification is recorded in [Evidence Report](./EVIDENCE_REPORT.md) for the Recipe Repository Contract Foundation.

- `corepack pnpm@9.15.4 format`
- `corepack pnpm@9.15.4 typecheck`
- `corepack pnpm@9.15.4 lint`
- `corepack pnpm@9.15.4 test`
- `corepack pnpm@9.15.4 build`
- `git diff --check`

## Documentation Status

Existing project docs cover product vision, MVP scope, system architecture, inventory architecture, auth architecture, permissions, execution process, feature specs, Supabase notes, and validation seed data.

[Product Horizons](../../PRODUCT_HORIZONS.md) is the canonical long-term product roadmap. Horizon 1, Core Kitchen Inventory Platform, is active. Future horizons may influence architecture, but implementation milestone recommendations must remain inside the active horizon.

The handbook now contains governance, the canonical AI Engineering Operating Model, engineering principles, process, templates, ADR framework, initial ADRs, living reference documents, project reconstruction, project memory, implementation patterns, common failures and engineering lessons, document index, drift register, and health report.

Temporary volunteer permission drift, undo/reversal terminology drift, return semantics drift, offline architecture drift, and security architecture ownership drift have been resolved.

The Engineering Operating System is stable for production use. [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md) owns the Session Controller, including session resume, active-horizon milestone selection, verification repeat behavior, Evidence Capture, commit approval gates, and completion-report terminology. Future EOS changes require implementation-driven justification rather than speculative improvement.

## Known Gaps

- Offline queue implementation is not present; the living architecture defines the future queue and replay boundary.
- Production security approval is not granted; the current security review baseline records posture and findings only.
- Existing docs still contain duplication and some encoding artifacts.
- Older docs are classified in the document index, but content has not been physically migrated.

## Owner

Engineering owns this document.

## Update Cadence

Update after every implementation milestone or major documentation milestone.

## Lifecycle

This is living documentation.

## Related Documents

- [Current Milestone](./CURRENT_MILESTONE.md)
- [Project Reconstruction](./PROJECT_RECONSTRUCTION.md)
- [Project Memory](./PROJECT_MEMORY.md)
- [Implementation Patterns](./IMPLEMENTATION_PATTERNS.md)
- [Common Failures and Engineering Lessons](./COMMON_FAILURES.md)
- [Project Scorecard](./PROJECT_SCORECARD.md)
- [Known Limitations](./KNOWN_LIMITATIONS.md)
- [Open Decisions](./OPEN_DECISIONS.md)
- [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md)
- [Document Index](./DOCUMENT_INDEX.md)
- [Documentation Drift](./DOCUMENTATION_DRIFT.md)
- [Handbook Health Report](./HANDBOOK_HEALTH_REPORT.md)
- [Architecture](../architecture/README.md)
- [Security Architecture](../architecture/security.md)
- [ADR Index](../adrs/README.md)
- [Project README](../../../README.md)
- [System Architecture](../../SYSTEM_ARCHITECTURE.md)
- [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md)
- [Auth Architecture](../../AUTH_ARCHITECTURE.md)
