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
  - ../adrs/0001-immutable-inventory-ledger.md
  - ../adrs/0003-supabase-auth-and-rls-boundary.md
  - ../adrs/0005-mobile-first-offline-pwa.md
  - ../adrs/0006-repository-pattern.md
  - ../adrs/0008-domain-driven-package-organization.md
  - ../architecture/README.md
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
- Repository reconstruction identified the temporary volunteer permission drift milestone as the next approved implementation milestone.

## Implemented Domains

- `auth`: authentication provider, auth screens, temporary volunteer session storage, volunteer session repository/RPC integration.
- `inventory`: inventory domain, validation, aggregation, visibility, barcode lookup/catalog, unknown barcode, repository adapters, scan workflows, receive/transfer/return workflows.
- `home`: volunteer home summary and shell integration.
- `tasks`: task screen and inventory-related task summaries.

## Authentication Status

Supabase Auth is documented as the browser session source. `SupabaseAuthProvider`, `AuthProvider`, and `RouteGuard` exist in the app structure. Temporary volunteer session storage and Supabase volunteer session repository tests exist.

Temporary volunteer login/navigation diagnostic logging has been resolved. No `KK_LOGIN_DEBUG` or `console.info` instrumentation remains in `apps/web/src`.

Known gap: temporary volunteer permission documentation and implementation expectations are inconsistent across current source documents. The next approved milestone is to reconcile this drift without broadening authorization scope.

## Inventory Status

Inventory is implemented around immutable transaction drafts, aggregation, visibility projections, receiving, transfer, return, reversal, barcode scanning, catalog queries, unknown barcode handling, and low stock thresholds.

Inventory architecture and ADRs establish that balances are derived from immutable transaction history.

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

RLS is enabled on foundational tables. Authenticated read policies exist for inventory-facing tables. Security-definer helper functions and controlled volunteer RPCs exist. Browser trust boundaries are documented in ADRs.

Known gaps remain in documentation synchronization and explicit security status tracking.

## Testing Status

Vitest is configured. Tests exist for inventory domain logic, repository adapters, migrations, auth volunteer sessions, UI reducers/screens, shell navigation, and shared utilities.

Latest verification for the temporary volunteer permission milestone documentation handoff passed:

- `corepack pnpm@9.15.4 format`
- `corepack pnpm@9.15.4 typecheck`
- `corepack pnpm@9.15.4 lint`
- `corepack pnpm@9.15.4 test` with 59 test files and 295 tests passing
- `corepack pnpm@9.15.4 build`

The production build emitted the existing Vite chunk-size warning, but completed successfully.

## Documentation Status

Existing project docs cover product vision, MVP scope, system architecture, inventory architecture, auth architecture, permissions, execution process, feature specs, Supabase notes, and validation seed data.

The handbook now contains governance, the canonical AI Engineering Operating Model, engineering principles, process, templates, ADR framework, initial ADRs, living reference documents, project reconstruction, project memory, implementation patterns, common failures and engineering lessons, document index, drift register, and health report.

The current candidate set in [Next Milestone](./NEXT_MILESTONE.md) has approved resolving temporary volunteer permission drift as the next implementation milestone.

The Engineering Operating System is Stable at v1.2. Future EOS changes require implementation-driven justification rather than speculative improvement.

## Known Gaps

- Temporary volunteer permissions need reconciliation.
- Undo versus reversal terminology needs canonicalization.
- Offline queue architecture is required but not fully described as a living architecture document.
- RLS/security architecture should be consolidated into a living architecture page.
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
- [ADR Index](../adrs/README.md)
- [Project README](../../../README.md)
- [System Architecture](../../SYSTEM_ARCHITECTURE.md)
- [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md)
- [Auth Architecture](../../AUTH_ARCHITECTURE.md)
