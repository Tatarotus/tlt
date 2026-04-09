# Implementation Backlog

This backlog is structured as epics and implementation tickets for the merged Kanban + Time Intelligence product.

## Phase 1 — Foundation

### EPIC P1: Architecture Foundation

- **P1-T1 — Finalize canonical domain glossary**
  - **Points:** 3
  - **Description:** Define the final vocabulary for cards, sessions, categories, goals, PATs, audit events, sync queue items, and export jobs.
  - **Acceptance Criteria:**
    - single-user v1 scope explicitly documented
    - all core entities defined without ambiguity
    - future multi-user extension points noted

- **P1-T2 — Finalize service ownership matrix**
  - **Points:** 2
  - **Description:** Lock the ownership split between Next.js and the Rust Time API.
  - **Acceptance Criteria:**
    - timer/report/export ownership unambiguous
    - Kanban CRUD ownership unambiguous
    - CLI sync responsibility documented

- **P1-T3 — Define browser auth and PAT lifecycle**
  - **Points:** 3
  - **Description:** Specify browser session rules and PAT generation, rotation, revocation, and audit behavior.
  - **Acceptance Criteria:**
    - PAT issuance flow documented
    - revocation flow documented
    - browser vs CLI auth boundary clear

- **P1-T4 — Define CLI local cache and sync contract**
  - **Points:** 5
  - **Description:** Specify the local cache behavior, queued operations, replay ordering, and sync states.
  - **Acceptance Criteria:**
    - pending sync semantics defined
    - idempotency approach defined
    - conflict states enumerated

## Phase 2 — Card-Level Timing

### EPIC P2: Kanban Timing UX

- **P2-T1 — Specify Create & Start Timer flow**
  - **Points:** 3
  - **Description:** Define UI, copy, and failure handling for immediate timer start when creating a card.
  - **Acceptance Criteria:**
    - desktop and mobile patterns documented
    - recovery behavior specified when timer start fails

- **P2-T2 — Specify global active timer bar**
  - **Points:** 3
  - **Description:** Define the persistent active timer UI across routes.
  - **Acceptance Criteria:**
    - desktop and mobile placement documented
    - stop/open-card actions defined
    - syncing/conflict states defined

- **P2-T3 — Specify card tile timing indicators**
  - **Points:** 2
  - **Description:** Define how active timing and tracked totals appear on card tiles.
  - **Acceptance Criteria:**
    - running state and non-running state documented
    - density and truncation rules documented

- **P2-T4 — Specify card modal Time tab**
  - **Points:** 5
  - **Description:** Define history, controls, manual logging, and notes behavior inside the card detail modal.
  - **Acceptance Criteria:**
    - `Stop Timer` is the main control when appropriate
    - session history and totals included
    - manual add flow defined

- **P2-T5 — Specify completion-triggered auto-stop**
  - **Points:** 3
  - **Description:** Define exact behavior when cards are completed or moved to terminal lists.
  - **Acceptance Criteria:**
    - only same-card timers auto-stop
    - unrelated timers remain active
    - user feedback copy defined

## Phase 3 — Categories and Insights

### EPIC P3: Semantic Time Intelligence

- **P3-T1 — Define hybrid label-to-category mapping**
  - **Points:** 5
  - **Description:** Specify automatic mapping rules and user override behavior.
  - **Acceptance Criteria:**
    - visual labels preserved
    - hierarchical categories supported
    - mapping settings documented

- **P3-T2 — Specify category picker UX**
  - **Points:** 3
  - **Description:** Define the explicit category selection and override flow on cards.
  - **Acceptance Criteria:**
    - suggestions shown but not forced
    - hierarchical category selection supported

- **P3-T3 — Define Time Management / Progress & Feedback IA**
  - **Points:** 5
  - **Description:** Design the navigation and page layout for the time dashboard.
  - **Acceptance Criteria:**
    - Today, Progress, Feedback, History, Exports, Batch Log included
    - mobile and desktop structure documented

- **P3-T4 — Define GUI equivalents for report/compare/review**
  - **Points:** 5
  - **Description:** Translate core `tl` insights into GUI modules and filters.
  - **Acceptance Criteria:**
    - each targeted CLI insight has a GUI equivalent
    - date presets and filters documented

- **P3-T5 — Define goals and streak widgets**
  - **Points:** 3
  - **Description:** Specify setup and display patterns for goals and streaks.
  - **Acceptance Criteria:**
    - goal editing flow documented
    - streak display and dashboard placement documented

## Phase 4 — Rust API and CLI

### EPIC P4: Shared Time Domain

- **P4-T1 — Define Rust Time API contract**
  - **Points:** 5
  - **Description:** Specify endpoints, auth, idempotency, and error semantics.
  - **Acceptance Criteria:**
    - start/stop/manual/report/export endpoints defined
    - PAT auth requirements defined
    - idempotency behavior explicit

- **P4-T2 — Define Rust module split**
  - **Points:** 3
  - **Description:** Specify the split between core domain logic, HTTP service, and CLI client layers.
  - **Acceptance Criteria:**
    - ownership per module documented
    - no duplicated time logic planned in TypeScript

- **P4-T3 — Define CLI online behavior**
  - **Points:** 2
  - **Description:** Specify online command semantics and expected outputs.
  - **Acceptance Criteria:**
    - command parity list approved
    - expected success/error outputs documented

- **P4-T4 — Define CLI offline behavior**
  - **Points:** 5
  - **Description:** Specify local command behavior and queued replay semantics.
  - **Acceptance Criteria:**
    - pending sync behavior defined
    - offline `status` semantics defined
    - replay ordering defined

- **P4-T5 — Define sync conflict resolution UX**
  - **Points:** 5
  - **Description:** Specify conflict classes and operator guidance when replay fails.
  - **Acceptance Criteria:**
    - conflict classes enumerated
    - terminal output guidance defined
    - no silent destructive resolution

## Phase 5 — Migration Planning

### EPIC P5: Legacy Consolidation

- **P5-T1 — Define Kanban migration mapping**
  - **Points:** 3
  - **Description:** Specify mapping from current workspaces, boards, lists, tasks, and labels into the new model.
  - **Acceptance Criteria:**
    - field mapping complete
    - label handling defined

- **P5-T2 — Define `tl` migration mapping**
  - **Points:** 5
  - **Description:** Specify mapping from sessions, goals, and local config into the new model.
  - **Acceptance Criteria:**
    - category mapping rules defined
    - active session import policy defined
    - unsupported cases documented

- **P5-T3 — Define migration validation checklist**
  - **Points:** 3
  - **Description:** Specify counts, integrity checks, and reconciliation outputs for migration.
  - **Acceptance Criteria:**
    - go/no-go checks documented
    - overlap validation included

- **P5-T4 — Define cutover runbook**
  - **Points:** 3
  - **Description:** Specify freeze, final import, smoke checks, and rollback decision points.
  - **Acceptance Criteria:**
    - cutover steps sequenced
    - rollback triggers defined

## Phase 6 — Operability and Exports

### EPIC P6: Production Readiness

- **P6-T1 — Define export product behavior**
  - **Points:** 3
  - **Description:** Specify CSV, JSON, and Obsidian export entry points and user flows.
  - **Acceptance Criteria:**
    - GUI and CLI export paths documented
    - expected outputs defined

- **P6-T2 — Define audit event taxonomy**
  - **Points:** 3
  - **Description:** Specify which actions create audit events and what metadata must be captured.
  - **Acceptance Criteria:**
    - timer and PAT actions audited
    - export actions audited

- **P6-T3 — Define monitoring and alerting requirements**
  - **Points:** 3
  - **Description:** Specify service health checks, metrics, and alerts.
  - **Acceptance Criteria:**
    - Next.js and Rust API health checks defined
    - sync and conflict metrics defined

- **P6-T4 — Define backup and recovery behavior**
  - **Points:** 2
  - **Description:** Distinguish system backups from user-facing exports and define recovery expectations.
  - **Acceptance Criteria:**
    - backup vs export separation documented
    - restore testing requirement documented
