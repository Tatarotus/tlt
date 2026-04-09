# ⏱️ tl — Time Logger

**tl** (Time Logger) is a high-signal, local-first feedback engine for your life. Built in Rust for maximum reliability and speed, it moves beyond simple time tracking into deep habit insights and data-driven reflection.

It follows a strict philosophy: **Service is the brain, data is sacred, and friction is the enemy.**

---

## 🚀 Key Features

- **Real-time Stopwatch:** Start and stop sessions as you work.
- **Frictionless Manual Logging:** Log durations (e.g., `90m`, `2h`) with a single command.
- **Batch "Log" Workflow:** Open your `$EDITOR` to bulk-log your entire day in seconds.
- **Hierarchical Categories:** Use `category:sub-category` (e.g., `coding:rust`) for granular tracking with aggregated reporting.
- **Insight Layer:** Track streaks, set daily goals, and perform week-over-week comparisons.
- **Obsidian Integration:** Export your logs directly into your second brain as beautifully formatted daily notes.
- **Production-Grade Storage:** Powered by SQLite with optimized indexes for lightning-fast range queries and data integrity.
- **Local-First & Private:** Your data stays in `~/.local/share/time-logger/`, always under your control.

---

## 🛠️ Installation

Ensure you have [Rust](https://www.rust-lang.org/) installed, then clone and build:

```bash
git clone https://github.com/youruser/time-logger.git
cd time-logger
cargo install --path .
```

---

## 💡 The "tl" Workflow

### 1. Real-time Tracking
```bash
tl start coding -n "Refactoring storage"
tl status
tl stop
```

### 2. Manual/Batch Logging (Frictionless)
```bash
# Add a 45m gym session that ended 10 minutes ago
tl add gym 45m

# Start a session exactly where the last one ended
tl add study 1h --chain

# Batch log in your editor (opens $EDITOR)
tl log
```

### 3. Analyze & Improve
```bash
# High-level daily summary
tl report

# Filtered granular view
tl report --tag coding

# Compare this week vs last week
tl compare --week

# Perform a daily or weekly reflection
tl review --today
tl review --week
```

---

## 🎯 Insights & Goals

Stay consistent with built-in habit mechanics:

```bash
# Set a 2h daily goal for coding
tl goal set coding 2h

# Check your streak
tl streak coding

# See progress in your daily review
tl review
```

---

## 📂 Export & Backups

Your data is portable and safe.

- **Obsidian:** `tl obsidian --output ~/vault/Daily/2026-04-01.md`
- **CSV/JSON:** `tl export --format csv --week --output my_data.csv`
- **Backup:** `tl backup --json` (Copies DB and creates a JSON snapshot in `~/PARA/4.Archives/backups/time-logger/`)

---

## 🧠 Engineering Philosophy

`tl` is built on 8 core mandates:

1.  **Service is the brain:** All business logic lives in `TimeLoggerService`.
2.  **Time is derived, never stored:** Duration is always calculated as `end - start`.
3.  **Validate everything:** Overlap detection and "Smart Yesterday" heuristics prevent data corruption.
4.  **No silent behavior:** Surprising actions (like logging in the past) require confirmation.
5.  **Data integrity first:** Every write is wrapped in a SQLite transaction.
6.  **Low friction is king:** Commands are designed for speed and minimal typing.
7.  **Idiomatic Rust:** Type-safe, ownership-heavy, and safe.
8.  **Memory as Truth:** The system state is strictly documented and maintained.

---

## ⌨️ Command Reference

| Command | Alias | Description |
| :--- | :--- | :--- |
| `start` | `s` | Start a stopwatch session |
| `stop` | `x` | Stop active session |
| `status` | `st` | Show active session and daily total |
| `add` | `a` | Add session by duration (e.g. 90m) |
| `log` | - | Batch log sessions via editor |
| `report` | `r` | Summary of time per category |
| `compare` | - | Week-over-week comparison |
| `review` | - | Daily/Weekly reflection with goal tracking |
| `streak` | - | Show current category streak |
| `goal` | - | Set and list daily targets |
| `backup` | - | Secure the database and export snapshots |
| `pop` | `rm` | Delete the most recent session |

---

## ⚙️ Configuration

The database is stored at `~/.local/share/time-logger/timelog.db`.  
Your goals and preferences are stored at `~/.config/time-logger/config.json`.

---

*Built with ❤️ in Rust for people who value their time.*
