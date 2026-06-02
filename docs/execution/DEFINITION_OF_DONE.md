# DEFINITION_OF_DONE.md

A feature is NOT complete when the code compiles.

A feature is complete only when it is operationally trustworthy.

---

# Required Completion Criteria

A feature is considered done only if:

* [ ] requirements implemented
* [ ] architecture reviewed
* [ ] permissions enforced
* [ ] inventory integrity preserved
* [ ] offline behavior considered
* [ ] tests added
* [ ] typecheck passes
* [ ] lint passes
* [ ] production build passes
* [ ] mobile testing completed
* [ ] real workflow validated
* [ ] documentation updated
* [ ] edge cases reviewed
* [ ] rollback considerations reviewed

---

# Inventory-Specific Requirements

Inventory-related features additionally require:

* [ ] immutable transactions preserved
* [ ] reversal behavior validated
* [ ] aggregation correctness verified
* [ ] auditability preserved

---

# Permission Requirements

Protected workflows require:

* [ ] authorized access verified
* [ ] unauthorized access rejected
* [ ] temporary volunteer restrictions verified

---

# Operational Validation

Features should be tested against realistic volunteer workflows.

Observe:

* confusion
* friction
* accidental behavior
* reversibility

---

# Deployment Requirements

Features are not complete until:

* [ ] deployable safely
* [ ] migration reviewed
* [ ] rollback considerations documented

---

# Final Rule

“Works on my machine” is not considered done.
