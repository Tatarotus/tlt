# Architecture Documents

This folder contains the repo-ready architecture package for the Kanban + Time Logger integration.

## Contents

- `architecture/spec.md` — integration architecture and functional specification
- `architecture/tickets.md` — implementation backlog with acceptance criteria
- `architecture/adr/ADR-001-postgres-source-of-truth.md`
- `architecture/adr/ADR-002-rust-time-api-authority.md`
- `architecture/adr/ADR-003-single-user-auth-and-pats.md`
- `architecture/adr/ADR-004-single-global-active-timer.md`
- `architecture/adr/ADR-005-card-completion-auto-stop.md`
- `architecture/adr/ADR-006-hybrid-label-category-mapping.md`
- `architecture/adr/ADR-007-cli-offline-cache-and-sync.md`
- `architecture/adr/ADR-008-optimistic-gui-and-sse.md`

## Scope

These documents define the clarified v1 target architecture:

- single-user only
- Next.js Kanban GUI remains the primary interface for boards and cards
- `tl` remains mostly unchanged and continues to own time-tracking behavior
- remote PostgreSQL becomes the canonical datastore for `tl`
- Kanban integrates with `tl` through direct PostgreSQL writes or a very small VPS-side timer bridge

## Notes

- This package intentionally contains no migration SQL and no implementation code.
- ADRs use `Proposed` status until explicitly accepted.
- The current remote PostgreSQL connection string provided for planning is `postgresql://sam:strongpassword@smre.run.place:5432/mydb`.

Feel free to rename the database or create a new one during implementation.
