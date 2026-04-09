I want to build a high-quality, production-ready time logging and habit tracking application using Rust.

## Goal

Create a system that allows me to track activities using a stopwatch-based workflow, then store and analyze that data to improve habits and performance over time.

## Core Workflow

1. I start a stopwatch when I begin an activity.
2. I stop it when I finish.
3. I categorize the activity (e.g., studying, coding, exercise).
4. The session is saved with duration, timestamp, and category.
5. Over time, I can review logs and analyze patterns.

## Requirements

### Core Features

* CLI-first interface (primary), optional GUI later
* Start/stop stopwatch from terminal
* Manual log entry support
* Activity categorization (tags or predefined categories)
* Persistent storage (suggest best option: SQLite, JSON, or similar)
* Ability to list, filter, and search logs
* Daily/weekly summaries (time spent per category)

### Technical Constraints

* Language: Rust
* Focus on clean architecture and maintainability
* Use idiomatic Rust patterns
* Prefer minimal but powerful dependencies

### Architecture Expectations

* Modular design (separate concerns: CLI, logic, storage)
* Clear data models (sessions, categories, stats)
* Scalable for future features (GUI, sync, analytics)

### Nice-to-Have Features (optional suggestions)

* Export data (CSV/JSON)
* Visualization (charts or summaries)
* Goal tracking (e.g., target hours per activity)
* Integration with tools like Obsidian or markdown logs

## What I Want From You

* Help design the architecture first (don’t jump straight into code)
* Suggest crate choices and explain why
* Provide a step-by-step implementation plan
* Then generate clean, well-structured code
* Explain decisions briefly but clearly

## Output Style

* Be concise but structured
* Prioritize clarity over verbosity
* Think like a senior Rust developer mentoring a mid-level engineer

