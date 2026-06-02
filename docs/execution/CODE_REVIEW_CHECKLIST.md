# CODE_REVIEW_CHECKLIST.md

# Core Philosophy

Code review exists to protect:

* operational integrity
* maintainability
* inventory correctness
* architectural consistency

Not to pursue perfectionism.

---

# Architecture Checks

Verify:

* feature matches documented architecture
* no unnecessary abstractions introduced
* no enterprise-pattern overengineering
* inventory remains event-driven
* immutable transaction principles preserved

---

# Type Safety Checks

Verify:

* strict typing maintained
* no unsafe any usage
* no weakly typed permission logic
* domain models remain explicit

---

# Permission Checks

Verify:

* permission enforcement exists
* temporary volunteers remain restricted
* cross-organization access blocked
* no admin bypasses introduced

---

# Inventory Integrity Checks

Verify:

* inventory transactions remain immutable
* reversals create new transactions
* balances derive from transactions
* transfer semantics remain consistent
* quantities remain positive

---

# UI/UX Checks

Verify:

* mobile-first usability
* minimal typing
* operational speed
* clear validation feedback
* reversible actions where appropriate

---

# Offline Checks

Verify:

* offline queue safety
* retry behavior
* duplicate replay prevention
* reconnect handling

---

# Complexity Checks

Reject:

* premature abstractions
* generic repository frameworks
* enterprise DDD complexity
* unnecessary libraries
* deeply nested state systems

Prefer:

* readability
* explicitness
* simplicity

---

# Performance Checks

Verify:

* no excessive re-renders
* no expensive aggregation loops
* no unbounded queries
* barcode workflows remain fast

---

# Migration Checks

Verify:

* migrations are safe
* inventory history preserved
* RLS remains enabled
* indexes remain appropriate

---

# Testing Checks

Verify:

* required tests exist
* edge cases covered
* operational scenarios tested
* mobile testing completed

---

# Final Question

Ask before approval:

> Does this improve operational trust without introducing unnecessary complexity?
