# DELIVERY_PROCESS.md

# Engineering Philosophy

Krishna's Kitchen is operational infrastructure software.

Reliability, auditability, simplicity, and reversibility are more important than feature velocity.

The system must remain understandable, maintainable, and trustworthy under operational stress.

---

# Core Delivery Principles

1. Build incrementally
2. Ship vertically sliced features
3. Validate operational workflows early
4. Keep architecture simple
5. Avoid premature abstraction
6. Test operational edge cases aggressively
7. Preserve inventory integrity at all costs

---

# Feature Delivery Lifecycle

Every feature must follow this sequence:

1. Product clarification
2. Architecture review
3. Domain modeling
4. Service layer implementation
5. Validation rules
6. Testing
7. UI implementation
8. Mobile testing
9. Operational testing
10. Deployment
11. Production validation

UI should never precede domain logic.

---

# Feature Development Order

The correct order is:

1. Domain models
2. Validation logic
3. Service layer
4. Persistence layer
5. Tests
6. UI flows
7. UI polish

Never reverse this order.

---

# Required Feature Artifacts

Every feature must include:

* Problem statement
* User story
* Acceptance criteria
* Edge cases
* Permission requirements
* Offline behavior
* Error handling
* Testing plan
* Rollback considerations

---

# Required Testing Layers

Every operational feature must include:

1. Unit tests
2. Validation tests
3. Permission tests
4. Offline behavior tests
5. Mobile device testing
6. Real workflow testing

---

# Operational Testing Philosophy

The system must be tested against realistic operational chaos:

* duplicate scans
* interrupted internet
* accidental actions
* volunteer confusion
* concurrent inventory changes
* expired sessions
* invalid quantities
* transfer mistakes

---

# Deployment Philosophy

Deploy small, reversible changes.

Avoid giant releases.

Every deployment must:

* preserve inventory integrity
* preserve auditability
* avoid destructive migrations

---

# Codex Usage Rules

Codex should implement:

* isolated features
* bounded changes
* explicit requirements
* strongly scoped tasks

Never ask Codex to:

* build the whole app
* redesign architecture globally
* introduce new frameworks without review

---

# Code Review Philosophy

Reject:

* premature abstraction
* generic ERP complexity
* enterprise architecture patterns
* overengineered state management
* unclear inventory semantics

Prefer:

* readability
* explicitness
* operational correctness
* strong typing
* maintainability

---

# Definition of Success

The product succeeds if volunteers trust operational workflows.

Not if the system contains the most features.