# ADR 008: Optimistic GUI with SSE, Explicit CLI Sync States

**Status:** Proposed

## Context

The current Kanban application already relies on optimistic updates for a responsive UX. The merged product also needs a live active timer display and a clear story for offline CLI behavior.

## Decision

Use optimistic updates for board and timer interactions in the GUI, reconcile state with SSE-driven updates, and surface explicit sync states in the CLI for pending or conflicted offline actions.

## Alternatives Considered

1. Strict request/response with no optimism
2. Polling-only UI
3. WebSockets for every real-time interaction

## Pros

- preserves a fast, modern Kanban feel
- supports a clear single-active-timer interface
- avoids unnecessary real-time infrastructure complexity
- keeps CLI offline semantics explicit

## Cons

- requires careful reconciliation after optimistic failures
- SSE is one-way only
- CLI and GUI state transitions are not identical by design

## Consequences

- GUI timer commands must support rollback or refresh reconciliation
- active timer and dashboard refreshes should be SSE-driven
- CLI commands need visible pending/conflict messaging when offline replay is involved
