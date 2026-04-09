# ADR 008: Optional Lightweight Timer Bridge for Reliable Kanban Integration

**Status:** Proposed

## Context

The Kanban application needs to start and stop `tl` timers from cards. Direct database writes from Next.js may be enough for v1, but timer orchestration becomes more reliable if a very small VPS-side listener or service can enforce invariants such as one active timer and completion-triggered stopping.

## Decision

Prefer direct integration first. If reliability or coupling becomes a concern, add a lightweight timer bridge on the VPS that exposes only the minimum commands needed by the Kanban app, such as:

- start timer for card
- stop active timer
- stop timer when card is marked done
- fetch active timer state

This bridge should write into the same PostgreSQL-backed `tl` schema and remain intentionally narrow.

## Alternatives Considered

1. Direct PostgreSQL integration only
2. A full new Rust/TypeScript platform service
3. Heavy real-time infrastructure from day one

## Pros

- improves reliability if direct DB writes are too fragile
- centralizes the few timer transitions Kanban needs
- avoids a full platform rewrite while still allowing clean boundaries
- can be deployed only if needed

## Cons

- adds a small deployment surface on the VPS if used
- requires a clearly defined contract between Kanban and the bridge
- should not grow into an unrelated general-purpose backend

## Consequences

- Kanban timer actions may start with direct DB integration and later move behind the bridge without changing the user workflow
- the bridge, if added, should enforce single-active-timer rules consistently
- real-time updates can begin with simple refresh or polling and evolve later if needed
