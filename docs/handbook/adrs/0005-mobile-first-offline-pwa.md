---
title: ADR-0005 Mobile-First Offline PWA
status: active
doc_type: adr
lifecycle: historical
owner: engineering
update_cadence: update only supersession metadata or links
last_reviewed: null
related:
  - ./README.md
  - ./ADR_GUIDE.md
  - ../../../README.md
  - ../../SYSTEM_ARCHITECTURE.md
  - ../../MVP_SCOPE.md
  - ../../INVENTORY_ARCHITECTURE.md
---

# ADR-0005: Mobile-First Offline PWA

## Status

Accepted

## Context

The project README describes Krishna's Kitchen as a mobile-first Progressive Web App for temple kitchen operations and inventory management.

The system architecture describes a mobile-first PWA, installable app behavior, offline caching, local queueing, and service workers. The MVP scope requires mobile-first UX, offline-first architecture, and support for iPhone Safari and Android Chrome.

## Decision

The primary application form is a mobile-first Progressive Web App.

Core operational workflows must be designed for phone use and must preserve a path toward offline operation through queueing, retry, and sync safety.

## Consequences

- Mobile usability is an architectural constraint, not a late polish step.
- Offline impact must be considered for operational workflows.
- Browser and PWA behavior must be validated on target mobile environments.
- Future feature designs must avoid desktop-first operational assumptions.

## Alternatives Considered

No alternative primary application form is documented in the current source material.

## Implementation Notes

- The README documents the React, Vite, TypeScript, Tailwind, and Vite PWA stack.
- The system architecture documents PWA features and offline architecture requirements.
- Existing docs describe offline queueing as required architecture even where individual feature implementations are staged.

## Related Documents

- [Project README](../../../README.md)
- [System Architecture](../../SYSTEM_ARCHITECTURE.md)
- [MVP Scope](../../MVP_SCOPE.md)
- [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md)

## Supersession

None.
