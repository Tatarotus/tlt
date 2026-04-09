# Architecture Documents

This folder contains the repo-ready architecture package for the merged Kanban + Time Intelligence product.

## Contents

- `docs/architecture/spec.md` — unified product architecture and functional specification
- `docs/architecture/tickets.md` — implementation backlog with acceptance criteria
- `docs/architecture/adr/ADR-001-postgres-source-of-truth.md`
- `docs/architecture/adr/ADR-002-rust-time-api-authority.md`
- `docs/architecture/adr/ADR-003-single-user-auth-and-pats.md`
- `docs/architecture/adr/ADR-004-single-global-active-timer.md`
- `docs/architecture/adr/ADR-005-card-completion-auto-stop.md`
- `docs/architecture/adr/ADR-006-hybrid-label-category-mapping.md`
- `docs/architecture/adr/ADR-007-cli-offline-cache-and-sync.md`
- `docs/architecture/adr/ADR-008-optimistic-gui-and-sse.md`

## Scope

These documents define the v1 target architecture:

- single-user only
- Next.js Kanban GUI as the primary interface
- Rust HTTP API as the authoritative time domain
- PostgreSQL as the central system of record
- `tl` CLI with local cache and background sync

## Notes

- This package intentionally contains no migration SQL and no implementation code.
- ADRs use `Proposed` status until explicitly accepted.

the link connection to the postgress db is postgresql://sam:strongpassword@smre.run.place:5432/mydb
feel free to change or create a new db anytime
