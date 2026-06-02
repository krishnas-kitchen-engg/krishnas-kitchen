# DEVELOPMENT_WORKFLOW.md

# Development Philosophy

Development should proceed through small, reviewable, operationally safe iterations.

Avoid large unreviewed implementation bursts.

---

# Standard Development Loop

## Step 1 — Clarify Feature

Define:

* problem
* workflow
* permissions
* edge cases
* offline implications

Use FEATURE_TEMPLATE.md.

---

## Step 2 — Review Architecture Impact

Determine:

* schema impact
* auth impact
* offline impact
* aggregation impact
* deployment risk

---

## Step 3 — Create Focused Codex Prompt

Prompts must be:

* bounded
* explicit
* architecture-aware

Avoid vague prompts.

---

## Step 4 — Review Generated Code

Review for:

* simplicity
* correctness
* inventory integrity
* maintainability

Reject overengineering.

---

## Step 5 — Run Verification

Always run:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

---

## Step 6 — Manual Testing

Required:

* mobile testing
* operational workflow testing
* permission testing

---

## Step 7 — Atomic Commit

Use focused commits.

Examples:

```bash
git commit -m "feat(inventory): add transfer validation"
```

```bash
git commit -m "fix(auth): enforce temp session expiration"
```

---

# Branching Strategy

Use short-lived feature branches.

Avoid long-running divergence.

---

# Commit Philosophy

Commits should be:

* focused
* reviewable
* reversible
* understandable

Avoid giant mixed-purpose commits.

---

# Codex Usage Rules

Codex should:

* implement bounded tasks
* follow architecture docs
* avoid introducing frameworks

Never ask Codex to:

* redesign the app globally
* rewrite architecture wholesale
* add major dependencies casually

---

# Documentation Rules

Architecture docs are source-of-truth artifacts.

Documentation drift must be corrected quickly.

---

# Operational Rule

Operational correctness is more important than development speed.
