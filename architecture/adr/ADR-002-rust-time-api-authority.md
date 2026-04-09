# ADR 002: Rust Time API as the Authoritative Time Domain

**Status:** Proposed

## Context

The `tl` codebase already contains the most mature domain logic in the merged system: timer lifecycle, overlap detection, manual logging, goals, streaks, reports, reviews, and exports.

## Decision

The Rust Time API is the authoritative owner of all time-tracking and reporting behavior. Next.js remains the main GUI and calls the Rust API for time-domain actions.

## Alternatives Considered

1. Reimplement all time logic in TypeScript
2. Split timer ownership between GUI and CLI
3. Let the GUI own timing and use Rust only for CLI commands

## Pros

- preserves existing domain strength from `tl`
- avoids duplicated logic in two stacks
- ensures GUI and CLI parity
- keeps timer semantics centralized

## Cons

- adds another deployed service
- requires stable API contracts
- increases cross-service orchestration in some workflows

## Consequences

- timer, report, review, and export logic live in Rust
- Next.js cannot be the source of truth for timer state
- API idempotency and validation become critical platform behavior
