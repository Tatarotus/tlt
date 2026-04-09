# ADR 003: Single-User v1 with Minimal Auth Changes

**Status:** Proposed

## Context

The target v1 scope is explicitly single-user only. The clarified architecture keeps both applications close to their current shape and does not require a new product-wide PAT system just to deliver Kanban-to-`tl` timer integration.

## Decision

Use the smallest viable auth model in v1:

- browser session auth for the GUI
- one logical user account in v1
- database credentials or environment-based secrets for `tl` connectivity
- optional bridge authentication may use a simple shared secret if a bridge is added

## Alternatives Considered

1. No authentication because the product is single-user
2. Introduce PAT issuance and management in v1
3. Full multi-user role-based access control in v1

## Pros

- keeps v1 delivery simple
- avoids building token-management features before they are needed
- matches the clarified goal of minimal `tl` changes
- remains extensible for future multi-user support

## Cons

- not suitable for shared workspaces in v1
- direct database connectivity requires careful secret handling
- future auth expansion will still require work

## Consequences

- no collaborator or team flows in v1
- PAT issuance and revocation are not required product features for this phase
- any future bridge should add only minimal authentication, not a full identity platform
