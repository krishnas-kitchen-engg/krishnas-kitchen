# TESTING_STRATEGY.md

# Testing Philosophy

Krishna's Kitchen is operational infrastructure software.

Testing must prioritize:

* inventory correctness
* auditability
* reversibility
* offline resilience
* operational reliability
* mobile usability

The goal is not maximum test count.

The goal is operational trust.

---

# Testing Priorities

Priority order:

1. Inventory correctness
2. Permission enforcement
3. Offline integrity
4. Transaction immutability
5. Mobile operational usability
6. UI polish

---

# Required Testing Layers

## 1. Type Safety

Every commit must pass:

```bash
pnpm typecheck
```

---

## 2. Linting

Every commit must pass:

```bash
pnpm lint
```

---

## 3. Production Build Verification

Every major feature must pass:

```bash
pnpm build
```

---

# Unit Testing

Unit tests are required for:

* inventory aggregation
* transaction validation
* transfer semantics
* undo logic
* permission helpers
* temporary session validation
* offline queue logic

Unit tests should avoid unnecessary mocking.

Prefer pure deterministic logic.

---

# Integration Testing

Integration tests are required for:

* Supabase integration boundaries
* auth/session hydration
* inventory transaction persistence
* permission enforcement
* inventory aggregation correctness

---

# Permission Testing

Every protected workflow must verify:

* authorized access succeeds
* unauthorized access fails
* temporary volunteer restrictions hold
* cross-organization access is blocked

---

# Inventory Integrity Testing

The following scenarios must always be tested:

* duplicate transactions
* reversal correctness
* transfer correctness
* partial failures
* invalid quantities
* concurrent operations
* offline replay
* stale sessions

---

# Offline Testing

Offline support is a core requirement.

Test scenarios:

* no internet during scan
* reconnect sync
* duplicate replay prevention
* stale queue handling
* interrupted synchronization

---

# Mobile Device Testing

All operational workflows must be tested on:

## iPhone Safari

Required because:

* camera permissions differ
* PWA behavior differs
* storage behavior differs

---

## Android Chrome

Required because:

* scanning behavior differs
* installability differs
* permission handling differs

---

# Real Workflow Testing

The most important testing layer.

Test with real volunteers performing:

* receiving inventory
* transferring inventory
* picking ingredients
* correcting mistakes
* temporary volunteer onboarding

Observe:

* hesitation
* confusion
* operational delays
* accidental flows

---

# Barcode Testing

Test:

* damaged barcodes
* duplicate scans
* invalid scans
* low-light scanning
* camera permission denial
* rapid repeated scans

---

# Undo/Reversal Testing

Critical operational requirement.

Verify:

* reversals never mutate history
* inventory balances remain correct
* audit logs remain attributable
* reversal chains remain understandable

---

# Regression Testing

Before every deployment:

* inventory aggregation
* permissions
* session handling
* offline queue
* transaction validation

must be re-verified.

---

# Release Blocking Rules

Do NOT deploy if:

* inventory balances are inconsistent
* typecheck fails
* lint fails
* permission checks fail
* offline queue corruption exists
* reversals fail integrity checks

---

# Testing Philosophy Summary

Operational correctness is more important than feature velocity.

Inventory trust is the highest testing priority.
