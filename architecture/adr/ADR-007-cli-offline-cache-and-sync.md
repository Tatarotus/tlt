# ADR 007: Defer CLI Offline Redesign and Keep `tl` Behavior Simple in v1

**Status:** Proposed

## Context

The earlier architecture proposed a new offline cache, sync worker, and replay model for the CLI. That adds substantial complexity and is not required by the clarified scope, which prioritizes keeping `tl` mostly unchanged while moving it to remote PostgreSQL.

## Decision

Do not introduce a new offline cache-and-sync architecture in v1. Keep `tl` behavior as close as possible to today, with the primary required change being PostgreSQL-backed persistence. If offline support becomes necessary later, it should be designed as a separate follow-up after the shared PostgreSQL integration is stable.

## Alternatives Considered

1. Introduce cache, queue, and replay logic immediately
2. Keep `tl` online-first against remote PostgreSQL
3. Build a separate sync daemon in the first iteration

## Pros

- preserves a minimal-change path for `tl`
- avoids introducing a large new sync subsystem
- keeps initial delivery focused on real Kanban-to-`tl` integration
- leaves room for a later offline design if real usage requires it

## Cons

- `tl` becomes dependent on database connectivity in this phase
- offline-first behavior is explicitly out of scope for v1
- future offline design may require additional refactoring later

## Consequences

- no new sync states are required in v1
- PostgreSQL connectivity and migration replace sync design as the immediate priority
- any future offline mode should be documented in a separate ADR
