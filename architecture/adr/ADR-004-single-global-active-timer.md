# ADR 004: Exactly One Global Active Timer

**Status:** Proposed

## Context

The desired product behavior is explicit: the user should focus on one task at a time, and the UI should always make the single running timer obvious.

## Decision

Allow exactly one active timer globally across the entire product.

## Alternatives Considered

1. One active timer per card
2. One active timer per board or workspace
3. Multiple concurrent active timers

## Pros

- simple and clear mental model
- unambiguous active timer UI
- easier integrity and reconciliation rules
- consistent across GUI and CLI

## Cons

- less flexible for users who multitask heavily
- switching tasks always requires explicit transition logic
- replay conflicts may be more visible in offline CLI mode

## Consequences

- the platform must enforce a single active session rule
- timer start must fail or offer explicit replacement when another timer exists
- the active timer bar becomes a central product element
