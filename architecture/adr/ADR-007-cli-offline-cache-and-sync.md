# ADR 007: CLI Offline Cache with Background Sync Through the API

**Status:** Proposed

## Context

The web application is cloud-first, but the CLI should remain resilient and usable even when offline. At the same time, the Rust API should remain the authoritative time domain and mutation gateway.

## Decision

The CLI maintains a local SQLite cache and operation queue for offline use. When connectivity returns, a sync worker replays queued operations to the Rust Time API using idempotent requests.

## Alternatives Considered

1. Online-only CLI
2. Direct Postgres access from the CLI
3. Full peer-style replication of central data

## Pros

- preserves CLI usefulness in unreliable network conditions
- keeps API as the single authoritative mutation path
- supports a clear future path for local-first enhancements
- avoids exposing Postgres directly to every CLI environment

## Cons

- requires sync and conflict handling logic
- introduces a local cache that can become stale
- needs visible UX for pending and conflict states

## Consequences

- CLI output must distinguish synced, pending, and conflicted state
- queued operations require idempotency keys
- replay order and conflict behavior must be explicitly designed
