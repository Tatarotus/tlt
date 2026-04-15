Project Improvement Plan

## Recommended Direction

Keep `time-logger` as the authority for timer and session semantics.
Keep `trello-like` as the UI and workflow layer for boards, tasks, calendar, and timer controls.
Stop duplicating the time domain in two incompatible ways. The current mixed approach is the biggest st
         ructural problem in the repo.
Commit to real user ownership in the web app. The code already has registration, sessions, and per-user
          workspaces, so the app should not keep acting like timer data is global.

## Current Baseline

`time-logger`: `cargo test` passes, but only one CLI smoke test exists.
`trello-like`: `npm run build` passes.
`trello-like`: `npm run lint` fails with 31 errors and 37 warnings.
`trello-like`: direct `tsc` usage is misconfigured because the `tsc` package shadows the TypeScript com
         piler.

## What “Good Overall” Should Mean For This Project

A fresh setup works without undocumented manual fixes.
The Rust CLI and Next app share one clear time-tracking contract.
No user can read or mutate another user’s data.
Docs match the code.
The repo has reliable quality gates: lint, typecheck, tests, build.
The product feels ambitious because it is solid, not because it has many half-finished surfaces.

## Phase 0: Lock The Product And Architecture

### Goals

Remove ambiguity before more code is added.
Decide which parts are core and which parts are optional.

### Tasks

Write and accept one short ADR that answers:
- Is the app truly single-user, or is it user-scoped multi-user?
answer: single-user
- Is `time-logger` the time authority, or is the web app now the authority?
answer: `time-logger`
- Does the web app write directly to the time store, or does it call a dedicated timer service/API?
answer: calls directly to the time store (check)
Freeze one canonical `sessions` model and one canonical `categories` model.
Audit every major doc and mark it as `current`, `outdated`, or `aspirational`.
Remove or rewrite docs that now describe the wrong storage model or backup model.

### Acceptance Criteria

One architecture document describes the current truth.
One schema contract exists for time tracking.
No README claims SQLite/local-first if the implementation is PostgreSQL-first.

## Phase 1: Fix Correctness And Security Blockers

### Workstream A: Align The Time Domain

Fix `time-logger/src/storage.rs` schema initialization so it creates the tables and columns the Rust co
         de actually uses.
Add migrations for `sessions`, `categories`, and any ownership columns instead of relying on ad hoc sch
         ema creation.
Remove the schema drift between:
- `time-logger/src/storage.rs`
- `trello-like/db/schema.ts`
Decide one of these implementations and delete the other:
- Recommended: Next timer routes call a small server-side time service that enforces `tl` rules.
- Alternative: collapse the Rust time domain into the Next app and retire the Rust authority model.
Make timer start/stop semantics identical in both interfaces.

### Workstream B: Enforce Ownership Everywhere

Add `userId` or an equivalent ownership key to `sessions`.
Require authentication in all timer routes.
Filter timer reads and writes by the authenticated owner.
Filter dashboard queries by owner.
Add ownership validation to all task/list mutations, not just workspace and board mutations.
Review every server action for “authenticated” vs “authorized”; today many are only authenticated.

### Workstream C: Fix Dangerous UX Semantics

Stop silently ending an existing timer on `start`; require an explicit replace action server-side.
Return structured timer conflict errors to the client.
Add visible failure states for timer start/stop and drag-and-drop persistence failures.
Render the global active timer bar consistently or remove the dead component until it is wired in.

### Acceptance Criteria

A fresh database can be initialized and used successfully by `tl`.
Timer routes cannot be called anonymously.
One user cannot see or mutate another user’s timer data.
Starting a second timer never silently changes data.

## Phase 2: Clean Up Tooling, Docs, And Repo Hygiene

### Goals

Make the repository trustworthy for development.
Remove “works on my machine” setup problems.

### Tasks

Remove the `tsc` package from `trello-like/package.json`; rely on `typescript`.
Add explicit scripts:
- `typecheck`
- `test`
- `check`
Convert the current `tests/*.ts` scripts into either:
- real test files run by a test runner, or
- clearly named maintenance scripts in a different directory.
Add a root `README.md` with:
- project overview
- architecture summary
- setup steps for both apps
- environment variables
- validation commands
Align `README.md`, `.env.example`, Docker config, and architecture docs with the real storage and auth
         story.
Remove stale comments and dead imports across the web app.
Add environment validation on startup so missing AI config fails gracefully and clearly.

### Acceptance Criteria

A new contributor can clone the repo and understand how to run both apps.
`npm run lint`, `npm run typecheck`, `npm run build`, and `cargo test` all work from a clean checkout.
No file named `test` is actually a one-off script.

## Phase 3: Build A Real Test Strategy

### Rust App

Add storage tests against ephemeral PostgreSQL.
Add tests for:
- schema initialization
- active timer uniqueness
- overlap detection
- category creation
- manual session creation
- stop/resume flows
Add regression tests for any migration logic.

### Next App

Add unit/integration tests for:
- auth actions
- task/list/workspace authorization
- timer routes
- dashboard aggregation
- date utilities
Add end-to-end tests for:
- register/login
- create workspace and board
- create and move tasks
- start and stop timer
- auto-stop when moving a timed task to done
- calendar highlight creation and navigation

### Cross-App Contract

Add contract tests that assert the web timer flow and the Rust timer flow operate on the same schema an
         d semantics.
Add at least one smoke test that creates a session from one interface and reads it from the other.

### Acceptance Criteria

The Rust app has meaningful behavior tests, not just CLI parsing.
The Next app has tests that cover authorization and timer correctness.
Cross-app integration is proven automatically, not assumed.

## Phase 4: Finish Or De-Scope Product Surfaces

### Goals

Convert ambitious features into coherent features.
Stop shipping partially integrated experiences.

### Tasks

Decide whether infinite nesting is truly a v1 feature.
- If yes, implement recursive drag/drop, recursive deletes, and better hierarchy navigation.
- If no, cap nesting depth for now and simplify the UI.
Make AI functionality optional instead of a hard startup dependency.
Add clearer AI failure states and rate-limit handling.
Make timer UX consistent between task card, modal, dashboard, and global bar.
Add task history or session links so time tracking feels attached to work, not bolted on.
Improve empty states and error states across workspace, board, calendar, and dashboard views.
Fix small but trust-eroding polish issues:
- incorrect page copy
- generic metadata
- dead components
- inconsistent labels like `Todo` vs `To Do`

### Acceptance Criteria

Every major feature in the UI is either complete enough to trust or intentionally de-scoped.
Optional services like AI do not destabilize the core product.
The timer system feels native to the task workflow.

## Phase 5: Production Readiness

### Goals

Make deployment and maintenance boring.

### Tasks

Introduce migration/versioning discipline for both apps.
Add CI that runs:
- Rust tests
- web lint
- web typecheck
- web build
- selected integration tests
Add structured logging and request-level error reporting.
Add health checks for database connectivity and timer service availability.
Define backup and restore procedures for PostgreSQL.
Document deployment for local, VPS, and containerized environments.
Add a release checklist for schema changes and cutovers.

### Acceptance Criteria

Production deploys are repeatable.
Schema changes are reversible.
Failures are observable.
Backup and restore are documented and tested.

## Suggested Execution Order

1. Phase 0 architecture lock.
2. Phase 1 correctness and ownership fixes.
3. Phase 2 tooling and documentation cleanup.
4. Phase 3 tests and integration coverage.
5. Phase 4 product completion and UX consistency.
6. Phase 5 release and operations work.

## Immediate Top 10 Tasks

1. Unify the `sessions` schema between Rust and Next.
2. Fix `time-logger` schema bootstrap so fresh Postgres setup actually works.
3. Add authentication and ownership filtering to all timer routes.
4. Add ownership checks to task and list server actions.
5. Scope dashboard data to the authenticated user.
6. Replace silent timer replacement with explicit conflict handling.
7. Remove the `tsc` package and add a real `typecheck` script.
8. Turn pseudo-tests into real automated tests.
9. Update outdated READMEs and environment docs.
10. Add CI and require it before future feature work.

## What Not To Do Yet

Do not add more AI features before the current AI integration is resilient and optional.
Do not add more views or command palette work before the timer and authorization model is correct.
Do not keep both direct web-side timer writes and a separate Rust authority model long term.
Do not market the app as production-ready until ownership, schema consistency, and tests are in place.

## Final Exit Criteria

The repo builds and passes checks from a clean machine.
`tl` and the web app operate on one agreed time model.
Authorization is enforced everywhere data can change.
Documentation matches implementation.
The project feels like a strong product foundation instead of a strong prototype.

