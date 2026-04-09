# ADR 005: Auto-Stop Only for Timers Originating from the Completed Card

**Status:** Proposed

## Context

Completing a card does not always mean the currently active timer is related to that card. Automatically stopping any active timer on any completion event would be surprising and often wrong.

## Decision

When a card is moved to a terminal list or explicitly marked complete, auto-stop the timer only if the active timer is linked to that exact card. The card detail modal always exposes a manual `Stop Timer` button as the main explicit control.

## Alternatives Considered

1. Stop any active timer whenever any card is completed
2. Never auto-stop on card completion
3. Prompt on every completion event regardless of linkage

## Pros

- prevents incorrect automatic timer stops
- preserves useful automation when it is clearly valid
- aligns timer provenance with card context
- keeps manual stopping simple and reliable

## Cons

- some users may expect completion to always stop timing
- requires linked-card provenance to be stored reliably
- edge cases must be documented for archived or deleted cards

## Consequences

- timer sessions need linked-card metadata
- completion flows must query active timer ownership before stopping
- manual stop remains the fallback universal control
