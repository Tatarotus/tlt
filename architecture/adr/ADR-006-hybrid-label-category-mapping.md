# ADR 006: Hybrid Mapping Between Kanban Labels and Hierarchical Categories

**Status:** Proposed

## Context

Kanban labels are lightweight and visual, while `tl` categories are semantic and hierarchical. The target product needs both low-friction suggestions and precise reporting.

## Decision

Keep visual labels and semantic categories as distinct concepts. Allow labels to suggest categories through configurable mappings, while still allowing explicit hierarchical category assignment on each card.

## Alternatives Considered

1. Use Kanban labels as the only category model
2. Ignore labels entirely for time tracking
3. Derive categories only from board or list context

## Pros

- preserves current Kanban UX
- supports precise reporting and analysis
- reduces friction through auto-suggestions
- avoids forcing semantics onto color labels

## Cons

- adds mapping and settings complexity
- requires user education on labels vs categories
- some suggested mappings may be ambiguous

## Consequences

- settings must support label-to-category mappings
- card edit flows must support explicit category override
- sessions should capture category snapshots for historical stability
