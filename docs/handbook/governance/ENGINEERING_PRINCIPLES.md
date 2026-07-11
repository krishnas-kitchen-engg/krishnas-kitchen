---
title: Engineering Principles
status: active
doc_type: governance
lifecycle: living
owner: engineering
update_cadence: rarely; only when enduring engineering philosophy changes
last_reviewed: null
related:
  - ./README.md
  - ./PROJECT_CONSTITUTION.md
  - ./AI_ENGINEERING_OPERATING_MODEL.md
  - ./ENGINEERING_SYSTEM.md
  - ../README.md
  - ../reading-paths.md
  - ../roadmap.md
---

# Engineering Principles

## Purpose

This document records the timeless engineering philosophy for Krishna's Kitchen. It explains how to think, not the step-by-step workflow.

Use [AI Engineering Operating Model](./AI_ENGINEERING_OPERATING_MODEL.md) for the operating loop, approvals, scoring, stop conditions, and review requirements.

## Principles

- Product first: engineering decisions should make kitchen operations more reliable, auditable, volunteer-friendly, and simple.
- Simplicity wins: choose the smallest design that preserves correctness, security, and future change.
- Optimize for change: keep boundaries explicit, changes reversible, and decisions discoverable.
- Security before convenience: never trade authorization, tenant isolation, auditability, or secret safety for speed.
- Preserve history: inventory and audit history must remain trustworthy; correction workflows should add history rather than erase it.
- Build vertically: prefer complete, thin milestones that can be used, tested, reviewed, and reversed.
- Keep milestones small: every implementation milestone should fit one engineering session and have clear verification.
- Repository is truth: reconstruct from current files, docs, tests, migrations, and git status before acting.
- Documentation reduces future work: write or update docs only when they help future contributors avoid confusion or drift.
- Avoid framework building: do not create new governance, process, abstraction, or tooling unless it reduces real future effort.
- Humans decide product: product intent, priority, and acceptance remain human decisions.
- AI decides implementation details: AI may choose local implementation tactics inside the approved milestone and existing architecture.
- Maintainability beats cleverness: prefer code and docs that future contributors can quickly understand and safely change.

## Living Or Historical

This is living documentation, but it should change very rarely.

## Who Updates It

Engineering owns this document. Changes should receive human review because the principles guide long-term engineering decisions.

## When To Update It

Update this document only when repeated project experience shows that an enduring principle is missing, misleading, or obsolete.

## Related Documents

- [Governance Overview](./README.md)
- [Project Constitution](./PROJECT_CONSTITUTION.md)
- [AI Engineering Operating Model](./AI_ENGINEERING_OPERATING_MODEL.md)
- [Engineering System](./ENGINEERING_SYSTEM.md)
- [Engineering Handbook](../README.md)
- [Reading Paths](../reading-paths.md)
- [Handbook Stewardship](../roadmap.md)
