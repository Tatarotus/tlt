# Implementation Backlog

This backlog is structured as epics and implementation tickets for the clarified Kanban + Time Logger integration.

## Phase 1 — Shared Time Storage

### EPIC P1: Architecture Foundation

- **P1-T1 — Define remote PostgreSQL contract for `tl`**
  - **Points:** 3
  - **Description:** Lock the target PostgreSQL connection model, schema expectations, and migration boundary for the existing `tl` app.
  - **Acceptance Criteria:**
    - remote connection string is documented via `DATABASE_URL`
    - SQLite-to-PostgreSQL migration boundary is defined
    - `tl` tables required for start/stop logging are enumerated

- **P1-T2 — Switch `tl` persistence from SQLite to PostgreSQL**
  - **Points:** 5
  - **Description:** Replace the local SQLite storage implementation with a PostgreSQL-backed one while preserving current CLI behavior as closely as possible.
  - **Acceptance Criteria:**
    - `tl start`, `tl stop`, and reporting read from PostgreSQL
    - existing single-active-session behavior still works
    - local-only SQLite is no longer the canonical path

- **P1-T3 — Document Kanban-to-`tl` write contract**
  - **Points:** 3
  - **Description:** Specify exactly how the Kanban app starts and stops `tl` sessions.
  - **Acceptance Criteria:**
    - card title to session description mapping is documented
    - active-session ownership rule is documented
    - done/completion auto-stop behavior is documented

## Phase 2 — Card-Level Timing

### EPIC P2: Kanban Timing UX

- **P2-T1 — Add `Start Timer` to each card**
  - **Points:** 3
  - **Description:** Add a visible `Start Timer` control on card tiles and in the task modal.
  - **Acceptance Criteria:**
    - each card exposes a `Start Timer` action
    - modal and board views stay consistent
    - failure state is visible when timer creation fails

- **P2-T2 — Show active timer state in Kanban UI**
  - **Points:** 3
  - **Description:** Surface the currently active timer clearly so the user knows which card owns it.
  - **Acceptance Criteria:**
    - active card is visually identifiable
    - stop/open-card actions are available
    - replace-flow copy is defined when another timer is already active

- **P2-T3 — Stop timer from modal or card completion**
  - **Points:** 2
  - **Description:** Finish the session when the user clicks stop or marks the same card done.
  - **Acceptance Criteria:**
    - stop action closes the active `tl` session
    - card completion auto-stops only matching timers
    - unrelated active timers remain untouched

- **P2-T4 — Persist card title as session description**
  - **Points:** 2
  - **Description:** Ensure the logged session stores the Trello card title as its description value.
  - **Acceptance Criteria:**
    - card title lands in the `tl` description field or `notes` fallback
    - session remains readable from the CLI
    - description value matches the card title at start time

## Phase 3 — Categories and Follow-Ups

### EPIC P3: Semantic Time Intelligence

- **P3-T1 — Define hybrid label-to-category mapping**
  - **Points:** 5
  - **Description:** Specify how Kanban labels can later suggest `tl` categories without blocking the basic timer flow.
  - **Acceptance Criteria:**
    - visual labels preserved
    - default category behavior documented
    - mapping settings documented for a later phase

- **P3-T2 — Define read-only reporting touchpoints in Kanban**
  - **Points:** 3
  - **Description:** Decide whether the Kanban app needs minimal visibility into recent `tl` sessions before building full dashboards.
  - **Acceptance Criteria:**
    - required read-only widgets are listed
    - explicit non-goals are documented for v1

## Phase 4 — Integration Reliability

### EPIC P4: Shared Time Domain

- **P4-T1 — Implement direct Kanban-to-PostgreSQL timer writes**
  - **Points:** 5
  - **Description:** Add the minimal server-side integration in the Kanban app to start and stop `tl` sessions in PostgreSQL.
  - **Acceptance Criteria:**
    - start and stop writes succeed against the remote database
    - single-active-timer rule is respected
    - card title is persisted as session description

- **P4-T2 — Evaluate need for a lightweight VPS timer bridge**
  - **Points:** 3
  - **Description:** Decide whether direct database integration is sufficient or whether a very small service should mediate timer writes.
  - **Acceptance Criteria:**
    - direct-vs-bridge tradeoff is documented
    - if a bridge is chosen, its commands stay intentionally small
    - no full platform rewrite is introduced accidentally

## Phase 5 — Migration Planning

### EPIC P5: Legacy Consolidation

- **P5-T1 — Define `tl` SQLite-to-PostgreSQL migration mapping**
  - **Points:** 5
  - **Description:** Specify how existing `tl` sessions, goals, and configuration move from SQLite into PostgreSQL.
  - **Acceptance Criteria:**
    - category mapping rules defined
    - active session import policy defined
    - unsupported cases documented

- **P5-T2 — Define migration validation checklist**
  - **Points:** 3
  - **Description:** Specify counts, integrity checks, and reconciliation outputs for migration.
  - **Acceptance Criteria:**
    - go/no-go checks documented
    - overlap validation included

- **P5-T3 — Define cutover runbook**
  - **Points:** 3
  - **Description:** Specify freeze, final import, smoke checks, and rollback decision points.
  - **Acceptance Criteria:**
    - cutover steps sequenced
    - rollback triggers defined

## Phase 6 — Operability

### EPIC P6: Production Readiness

- **P6-T1 — Define monitoring for remote PostgreSQL and timer writes**
  - **Points:** 3
  - **Description:** Specify how to detect failed timer writes, broken connectivity, and stuck active sessions.
  - **Acceptance Criteria:**
    - health checks for database connectivity defined
    - timer write failures are observable
    - orphan active-session detection is defined

- **P6-T2 — Define backup and recovery behavior**
  - **Points:** 2
  - **Description:** Define recovery expectations for the shared `tl` PostgreSQL database.
  - **Acceptance Criteria:**
    - backup vs export separation documented
    - restore testing requirement documented
