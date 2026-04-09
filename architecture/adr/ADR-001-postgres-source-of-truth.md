# ADR 001: PostgreSQL as the Central Source of Truth

**Status:** Proposed

## Context

The current Kanban application and the `tl` CLI each use local SQLite storage. The merged product requires one central store for boards, cards, time sessions, goals, reports, and exports.

## Decision

Use PostgreSQL on the VPS as the single canonical datastore for the merged product. Existing local SQLite databases remain migration sources only.

## Alternatives Considered

1. Keep both applications on separate SQLite databases
2. Sync SQLite databases between devices and services
3. Let the CLI write directly to Postgres while the GUI uses a different backend path

## Pros

- one authoritative dataset
- stronger integrity and reporting capabilities
- better fit for VPS-hosted cloud workflows
- simpler long-term operations and analytics

## Cons

- migration effort from both SQLite sources
- operational overhead compared with local-only storage
- requires explicit CLI sync behavior for offline support

## Consequences

- all canonical reads and writes converge on PostgreSQL
- local CLI storage becomes cache, not truth
- schema design must support both Kanban and time domains cleanly
