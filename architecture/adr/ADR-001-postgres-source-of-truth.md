# ADR 001: PostgreSQL as the Time Logger Source of Truth

**Status:** Proposed

## Context

The current `tl` application uses local SQLite storage. The clarified integration keeps `tl` mostly unchanged, but its persisted data must move to a remote PostgreSQL database hosted on the VPS so both the CLI and the Kanban app can record against the same time dataset.

## Decision

Use PostgreSQL on the VPS as the canonical datastore for the `tl` domain. The local `tl` SQLite database becomes a migration source only. The Kanban application may keep its current persistence model in v1, but all timer sessions written from Kanban must land in the `tl` PostgreSQL schema.

## Alternatives Considered

1. Keep `tl` on local SQLite and build a sync layer later
2. Move both applications into one brand-new shared schema immediately
3. Build a full intermediary service before moving `tl` storage

## Pros

- one authoritative time-tracking dataset
- Kanban can log directly into the same `tl` data store
- stronger integrity and reporting capabilities
- minimal conceptual change for the existing `tl` app

## Cons

- requires PostgreSQL support in `tl`
- operational overhead compared with local-only storage
- direct Kanban-to-DB integration needs careful timer rules

## Consequences

- all canonical `tl` reads and writes converge on PostgreSQL
- `tl` reports, goals, and exports operate from remote PostgreSQL
- Kanban timer writes must follow `tl` session rules
