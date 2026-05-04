# TLT Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the TLT (Time Logger & Task Manager) project.

## Current Status

All ADRs are currently in **Proposed** status as they represent the target architecture for v1. The implementation is ongoing with the following components:

- ✅ **trello-like** (Next.js Web App): Fully implemented with timer integration
- 🔄 **time-logger** (Rust CLI): PostgreSQL migration in progress
- 🔄 **Integration**: Direct database integration approach adopted for v1

## ADR Index

| Number | Title | Status | Summary |
|--------|-------|--------|---------|
| 001 | PostgreSQL as the Time Logger Source of Truth | Proposed | Move from SQLite to PostgreSQL for unified data store |
| 002 | Preserve the Existing `tl` Domain with Minimal Integration | Proposed | Keep Rust `tl` as authoritative for time-tracking semantics |
| 003 | Single-User v1 with Minimal Auth Changes | Proposed | Browser session auth, one logical user in v1 |
| 004 | Exactly One Global Active Timer | Proposed | Single active timer globally across the product |
| 005 | Auto-Stop Only for Timers Originating from Completed Card | Proposed | Smart auto-stop based on card-timer linkage |
| 006 | Hybrid Mapping Between Labels and Categories | Proposed | Labels suggest categories, explicit hierarchy maintained |
| 007 | Defer CLI Offline Redesign | Proposed | Keep `tl` simple, defer offline cache-and-sync |
| 008 | Optional Lightweight Timer Bridge | Proposed | Direct DB integration first, bridge if needed |

## Implementation Progress

### Completed Features
- Next.js web application with Kanban boards
- Drag-and-drop task management
- Workspace and board organization
- Timer start/stop integration from task cards
- Dashboard with time analytics
- Calendar highlights view
- User authentication (single-user mode)
- PostgreSQL database schema
- Comprehensive test suite (229 tests)
- Quality gates: linting, type checking, complexity analysis

### In Progress
- PostgreSQL migration for Rust CLI
- Timer session management across both applications
- Category-label mapping system

### Planned
- Offline support for CLI (future ADR)
- Multi-user support (future ADR)
- PAT (Personal Access Token) system (future ADR)

## Decision Process

All architectural decisions follow this process:
1. Identify the problem or opportunity
2. Document context and constraints
3. Consider alternatives
4. Make a decision
5. Record consequences
6. Review periodically

## Updating ADRs

When updating an ADR:
1. Change the **Status** field appropriately (Proposed → Accepted → Deprecated → Superseded)
2. Add implementation notes if relevant
3. Update the index table above
4. Reference related ADRs

## Related Documentation

- [README.md](../../README.md) - Project overview and setup
- [trello-like/README.md](../../trello-like/README.md) - Web app documentation
- [time-logger/README.md](../../time-logger/README.md) - CLI documentation
