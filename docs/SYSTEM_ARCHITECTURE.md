# SYSTEM_ARCHITECTURE.md

# Architecture Overview

Krishna's Kitchen is a multi-tenant mobile-first Progressive Web App (PWA) for temple kitchen operational management.

The architecture prioritizes:

- reliability
- offline capability
- fast operational workflows
- auditability
- low operational friction

---

# High-Level Architecture

Frontend (PWA)
↓
Supabase API Layer
↓
PostgreSQL Database

---

# Frontend Stack

## Framework

- React
- Vite
- TypeScript

---

## UI

- Tailwind CSS
- shadcn/ui

---

## State Management

- Zustand

---

## PWA Features

- installable
- offline caching
- local queueing
- service workers

---

# Backend Stack

## Backend Platform

- Supabase

---

## Database

- PostgreSQL

---

## Authentication

- Supabase Auth

---

## Authorization

- Row-level security policies

---

# Multi-Tenant Design

All domain entities must include:

- organization_id

Data isolation must be enforced at the database layer.

---

# Inventory Architecture

Inventory must be transaction-based.

Inventory counts are derived from immutable inventory events.

Inventory must never be directly mutated.

---

# Inventory Transaction Types

- RECEIVE
- TRANSFER
- CONSUME
- RETURN
- ADJUSTMENT
- REVERSAL

Undo is the user-facing correction action. Reversal is the persisted inventory
transaction type created by that action.

---

# Offline Architecture

Offline support is mandatory.

Offline actions must:

1. queue locally
2. sync automatically later
3. retry safely
4. avoid data corruption

---

# Security Requirements

- Server-side authorization mandatory
- Client-side permissions are not trusted
- All inventory actions must be auditable
- Temporary volunteer sessions must remain restricted

---

# Temporary Volunteer Architecture

Temporary volunteers must:

- use restricted sessions
- have scoped permissions
- expire automatically
- remain attributable in audit logs

---

# Performance Goals

Critical workflows should complete within 5 seconds.

Barcode scanning latency should remain minimal.

---

# Design Philosophy

Operational simplicity is more important than feature richness.

Reliability is more important than complexity.
