# ADR 002: Preserve the Existing `tl` Domain with Minimal Integration Surface

**Status:** Proposed

## Context

The `tl` codebase already contains the most mature time-tracking logic in the system: timer lifecycle, overlap detection, manual logging, goals, streaks, reports, reviews, and exports. The clarified requirement is to keep `tl` mostly unchanged instead of turning it into a broad new platform rewrite.

## Decision

The existing Rust `tl` domain remains authoritative for time-tracking semantics. In v1, integration should prefer the smallest possible surface area:

- switch `tl` persistence from local SQLite to remote PostgreSQL
- let the Kanban app create and stop `tl`-compatible sessions
- add only a lightweight VPS-side listener/service if direct database integration is not reliable enough

A full standalone Rust HTTP API is optional, not required by this architecture.

## Alternatives Considered

1. Reimplement all time logic in TypeScript
2. Build a full Rust microservice before basic integration works
3. Let the Kanban app invent separate timer semantics from `tl`

## Pros

- preserves existing domain strength from `tl`
- avoids a large rewrite of working Rust functionality
- keeps GUI and CLI semantics aligned around the same session model
- allows an incremental path from direct DB integration to a small bridge service if needed

## Cons

- direct database integration requires discipline around schema compatibility
- some `tl` logic may need extraction if Kanban cannot safely reproduce it
- an optional bridge still adds deployment surface if adopted

## Consequences

- `tl` continues to define the canonical timer and reporting behavior
- Next.js should write sessions in a way that stays compatible with `tl`
- any added bridge service must stay thin and avoid reimplementing the whole product
