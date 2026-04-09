# Time Logger – Engineering Roadmap (Revised)

## ⚠️ Guiding Principle

Do not add features on top of weak foundations.
Stabilize architecture and data integrity first.

---

## ✅ Phase 0 — Service Layer Refactor (COMPLETED)

* Introduce `TimeLoggerService`
* Move all business logic out of `main.rs`:
  * time calculations
  * overlap detection
  * chaining logic
* CLI only parses input and calls service methods

---

## ✅ Phase 1 — Data Integrity (COMPLETED)

### Database Improvements
* Add constraint or index to prevent multiple active sessions
* Ensure `id` is primary key

### Transactions
* Wrap all writes in transactions

### Validation
* Create centralized validation:
  * `validate_overlap(start, end, ignore_id)`
* Reuse across all commands

---

## ✅ Phase 2 — Time Handling (COMPLETED)

* Define clear HH:MM behavior
* Document rules
* Ensure consistent UTC conversion
* Added "Smart Yesterday" heuristic with user confirmation

---

## ✅ Phase 3 — Editing (COMPLETED)

* Implement:
  * `edit <id> --start`
  * `edit <id> --end`
  * `edit <id> --category`
* Reuses validation logic
* Checks overlaps

---

## ✅ Phase 4 — Session Safety (COMPLETED)

* Detect active session on startup
* Add:
  * `resume` (starts "now" with last category)
  * `abort`
* Warn for long-running sessions (in `status`)

---

## ✅ Phase 5 — CLI UX (COMPLETED)

* Add aliases (`s`, `x`, `ls`, `a`, `m`, `r`, `rm`, `ed`, `res`)
* Improve help messages
* Simple and idiomatic API with `&mut self` (removed `RefCell` from storage)

---

## ✅ Phase 6 — Reports (COMPLETED)

* `report --today` (default)
* `report --week`
* `report --month`
* Aggregations per category (sorted by duration)

## ✅ Phase 7 — Daily Log (COMPLETED)

* `log` command
* Open editor (`$EDITOR` or `nvim`)
* Parse batch entries (`<category> <duration> [notes]`)
* Support custom dates (`--date`)
* Auto-chaining from existing sessions of the day
* Reuse of existing service logic for validation and overlap detection

---

## ✅ Phase 8 — Export (COMPLETED)

* `export --format csv`
* `export --format json`
* Support for `--today`, `--week`, `--month`
* Support for `--include-active`
* Support for `--output` file saving

---

## ✅ Phase 9 — Obsidian Integration (COMPLETED)

* `obsidian` command
* Generate daily Markdown report with Summary and Details
* Support for `--date` and `--output`
* Direct vault integration via file paths

---

## ✅ Phase 10 — Insights (COMPLETED)

* `report --top N` to show top categories
* `compare --week` for week-over-week analysis with deltas
* Automated aggregation and sorting in service layer

---

## ✅ Phase 11 — Daily & Weekly Review (COMPLETED)

* `review` (daily) and `review --week`
* Total time tracking and category breakdown
* Reflection prompts and delta comparisons

---

## ✅ Phase 12 — Tags (COMPLETED)

* Hierarchical categories (e.g. `coding:rust`)
* Grouping by main category in high-level reports
* Filtering by tag in `report`, `compare`, and `review`
* SQLite indexes on `start_time`, `end_time`, and `category` for performance

## ✅ Phase 13 — Backup System (COMPLETED)

* `tl backup` to copy DB to archive path
* `--json` for snapshots
* `--auto` flag for background backups (cron friendly)

## ✅ Phase 14 — Insight Layer (COMPLETED)

* Streaks tracking (`tl streak <category>`)
* Goal setting (`tl goal set <cat> <dur>`)
* Progress visualization in reviews (daily review shows % against goals)
* Category deltas in `tl compare --week`

## 🚀 Development Rules

* No duplicated logic
* All validation must be centralized
* CLI = thin layer
* Service = brain
* Storage = dumb persistence

