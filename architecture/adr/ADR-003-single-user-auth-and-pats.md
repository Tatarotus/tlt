# ADR 003: Single-User v1 with Browser Sessions and PATs

**Status:** Proposed

## Context

The target v1 scope is explicitly single-user only. The system still needs secure browser access for the GUI and secure programmatic access for the CLI across one or more machines.

## Decision

Use a simplified auth model in v1:

- browser session auth for the GUI
- Personal Access Tokens for the CLI
- one logical user account in v1
- future-compatible schema for later multi-user expansion

## Alternatives Considered

1. No authentication because the product is single-user
2. PAT-only authentication for both GUI and CLI
3. Full multi-user role-based access control in v1

## Pros

- keeps v1 delivery simple
- supports secure CLI access cleanly
- avoids premature team/RBAC complexity
- remains extensible for future multi-user support

## Cons

- not suitable for shared workspaces in v1
- future auth expansion will still require work
- product documentation must be clear about single-user scope

## Consequences

- no collaborator or team flows in v1
- browser and CLI auth paths differ intentionally
- PAT issuance and revocation become required product features
