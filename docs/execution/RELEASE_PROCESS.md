# RELEASE_PROCESS.md

# Release Philosophy

Deploy small, reversible, operationally safe changes.

Avoid large releases.

Operational integrity is more important than deployment speed.

---

# Release Types

## Patch Release

Examples:

* validation fix
* permission fix
* UI bug fix
* barcode fix

Low operational risk.

---

## Minor Release

Examples:

* new workflow
* inventory receiving
* transfer flow
* volunteer session improvements

Moderate operational risk.

---

## Major Release

Examples:

* inventory architecture changes
* schema redesign
* sync engine changes
* permission model changes

High operational risk.

Requires careful review.

---

# Pre-Release Checklist

Required before deployment:

* [ ] typecheck passes
* [ ] lint passes
* [ ] build passes
* [ ] migrations reviewed
* [ ] permissions reviewed
* [ ] inventory aggregation verified
* [ ] mobile testing completed
* [ ] offline testing completed
* [ ] rollback plan documented

---

# Migration Rules

Never deploy destructive migrations casually.

Avoid:

* dropping columns
* destructive enum changes
* irreversible inventory mutations

All migrations must be:

* reviewable
* reversible where possible
* operationally safe

---

# Deployment Sequence

1. Review migrations
2. Deploy backend/schema changes
3. Verify schema integrity
4. Deploy frontend
5. Validate auth
6. Validate inventory operations
7. Validate mobile workflows
8. Monitor logs/errors

---

# Rollback Philosophy

Every release should assume rollback may become necessary.

Critical rollback priorities:

1. preserve inventory integrity
2. preserve auditability
3. preserve transaction history

Never rollback by mutating inventory history.

---

# Post-Release Verification

After deployment verify:

* login flow
* inventory balances
* transaction creation
* transfer behavior
* temporary volunteer flow
* barcode scanning
* offline queue behavior

---

# Release Cadence

Prefer:

* small frequent releases
  over:
* large unstable releases

---

# Production Safety Rule

Never deploy unreviewed inventory logic.
