# Project Memory

## 1. Project Overview
A high-quality, production-ready time logging and habit tracking CLI tool (`time-logger`) built in Rust. It supports real-time stopwatch tracking, manual duration-based logging, batch logging via a "daily log" workflow, and detailed reporting with exports to CSV, JSON, and Obsidian.

**Goals:**
- Reliable and safe time tracking.
- Low-friction manual entry.
- Data ownership and portability.
- Actionable insights through daily/weekly reviews.

**Tech Stack:**
- **Language:** Rust (edition 2024)
- **Database:** SQLite (via `rusqlite`)
- **CLI:** `clap` (derive API)
- **Time:** `chrono`
- **Serialization:** `serde`, `serde_json`, `csv`
- **Formatting:** `comfy-table`
- **Error Handling:** `anyhow`, `thiserror`

**Current Status:**
Phase 11 (Daily & Weekly Review) is complete. The system is fully functional and stable.

## 2. Environment & Setup
- **OS:** Linux
- **Rust Version:** 1.94.1 (as seen in cargo check)
- **Dependencies:** anyhow, chrono, clap, comfy-table, csv, directories, duration-str, rusqlite, serde, serde_json, thiserror.

## 3. Project Structure
```text
/home/sam/PARA/1.Projects/Code/time-logger/
├── Cargo.lock
├── Cargo.toml
├── GOAL.md
├── memory.md (SINGLE SOURCE OF TRUTH)
├── src
│   ├── cli.rs     (CLI Command Definitions)
│   ├── lib.rs     (Library Entry Point)
│   ├── main.rs    (CLI implementation/wiring)
│   ├── models.rs  (Data structures)
│   ├── service.rs (Business logic/Validation)
│   └── storage.rs (Persistence/Transactions)
├── target
└── TODO.md        (Roadmap tracking)
```

## 4. Commands Executed
- [2026-03-31 20:15] `cargo add serde_json csv` → Added dependencies for Phase 8.
- [2026-03-31 20:30] `cargo build` → Successful compilation of Phase 8 & 9.
- [2026-03-31 20:45] `cargo test` → 3 tests passed (cli, storage).
- [2026-03-31 21:00] `cargo build` → Final build for Phases 10-11.
- [2026-03-31 21:10] `git add . && git commit -m "..."` → Committed all changes.
- [2026-04-01 11:45] `cargo build` → Completed Phase 12 (Hierarchical Categories/Tags).
- [2026-04-01 12:10] `cargo build` → Completed Phase 13 (Backup System) & Phase 14 (Insight Layer).

## 5. Test Runs
- [2026-03-31 21:05] `cargo test` → 3 passed; 0 failed.
- [2026-03-31 21:07] Manual verification of `tl obsidian`, `tl export`, `tl review`, and `tl compare`. All outputs correct.
- [2026-04-01 11:40] `cargo test` → 3 passed.
- [2026-04-01 11:42] Manual verification of Phase 12: `tl report --tag`, `tl compare --tag`, and hierarchical grouping in default `tl report`. All functional.
- [2026-04-01 12:05] Manual verification of Phase 13: `tl backup --json` creates both `.db` and `.json` in `~/PARA/4.Archives/backups/time-logger/`.
- [2026-04-01 12:08] Manual verification of Phase 14: `tl streak coding`, `tl goal set`, and goal progress visualization in `tl review`.

## 6. Key Decisions & Architecture Notes
- **&mut self Refactor:** Moved away from `RefCell` in the storage/service layer to favor idiomatic Rust ownership and compile-time safety.
- **Dynamic Duration:** Durations are never stored; they are always calculated as `end - start`. For active sessions, `now - start` is used. This prevents data inconsistency during edits.
- **Centralized Validation:** All session logic (overlaps, chaining, date shifting) is handled in `TimeLoggerService`. The CLI and Storage layers are intentionally "thin".
- **Transactions:** Every write operation is wrapped in a SQLite transaction to ensure atomicity.
- **"Smart Yesterday" Heuristic:** Times entered that are in the "future" (e.g., logging 23:00 when it's 08:00) are shifted to yesterday but *require user confirmation* to prevent silent errors.
- **Hierarchical Categories (Phase 12):** Categories are stored as simple strings (e.g., "coding:rust"). Business logic parses these into a `Category` struct for grouping (by main category) and filtering (by main or sub-category).
- **Performance Optimization:** Added SQLite indexes on `start_time`, `end_time`, `category`, and a composite index on `(start_time, end_time)`.
- **Backup Strategy (Phase 13):** Local file copy to `~/PARA/4.Archives/backups/time-logger/` with optional JSON snapshot for portability.
- **Goal & Streak Engine (Phase 14):** Goals stored in a separate `config.json` file. Streaks calculated dynamically from session history.

## 7. Issues & Resolutions
...
- **Issue:** Hierarchical reports not showing future-dated sessions. **Fix:** Re-logged manual sessions in the past to verify grouping/filtering.
- **Issue:** `comfy_table` private fields error when checking unmet goals. **Fix:** Refactored to track logged categories in a `HashSet` during table generation.

## 8. Current Status & Next Steps
- **Done:** Phases 0-14. Core system is complete, hardened, and feature-rich.
- **Status:** Final hand-off. The tool is production-ready for personal use.
