# TLT - Time Logger & Task Manager

A unified time-tracking and task management system combining a Rust CLI (`tl`) with a Next.js web application.

## Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd tlt

# Setup web app
cd trello-like
npm install
npm run db:push
npm run dev

# In another terminal, setup CLI
cd time-logger
cargo install --path .
```

## Documentation

- **[Architecture Specification](architecture/SPEC.md)** - Complete v1 specification and API reference
- **[Architecture Decision Records](architecture/adr/)** - Rationale behind architectural choices
- **[Web App README](trello-like/README.md)** - Next.js application documentation
- **[CLI README](time-logger/README.md)** - Rust CLI documentation

## Architecture Overview

TLT consists of two integrated components:

1. **`tl` CLI** (Rust) - Command-line time tracking
   - Start/stop timers: `tl start`, `tl stop`
   - Manual logging: `tl add`
   - Reports: `tl report`
   - Categories, goals, and streaks

2. **Web App** (Next.js) - Kanban board with timer integration
   - Drag-and-drop task boards
   - Workspaces and boards organization
   - Timer controls from task cards
   - Dashboard with time analytics
   - Calendar highlights view

Both components share a **PostgreSQL database** as the single source of truth.

## Current Status

### ✅ Implemented
- PostgreSQL database schema
- User authentication (single-user mode)
- Workspace and board management
- Task CRUD with drag-and-drop
- Timer start/stop API
- Dashboard analytics
- Calendar highlights
- Tag/label management
- Comprehensive test suite (229 tests)

### 🔄 In Progress
- Category-label mapping UI
- Auto-stop timer on card completion
- Rust CLI PostgreSQL support

### ⏸️ Deferred
- Offline mode for CLI
- Multi-user support
- PAT system

## Quality Metrics

- **Tests**: 229 passing
- **Coverage**: 64% (target: 80%)
- **Mutation Score**: 93.75% (target: 60%)
- **Linting**: ✅ Pass
- **Type Checking**: ✅ Pass
- **Complexity**: ✅ All functions within limits

## Validation Commands

```bash
# Rust CLI
cd time-logger
cargo test
cargo build

# Next.js app
cd trello-like
npm run lint
npm run typecheck
npm run build
npm test
```

## Database Schema

Key tables:
- `users` - User accounts
- `workspaces` - User workspaces
- `boards` - Kanban boards
- `lists` - Board lists
- `tasks` - Task cards
- `sessions` - Time tracking sessions
- `categories` - Time categories
- `tags` - Visual labels
- `calendar_highlights` - Calendar events

See [SPEC.md](architecture/SPEC.md) for complete schema documentation.

## Security

- All timer routes require authentication
- User data isolated by `userId`
- Sessions use JWT cookies
- Passwords hashed with bcrypt

## Development

### Quality Gates
```bash
# Run all quality checks
npm run lint
npm run typecheck
npm run quality:complexity
npm run quality:filesize
npm run quality:coverage
npm run quality:mutation
```

### Architecture Documents
See `architecture/` folder for:
- **SPEC.md** - Complete v1 specification
- **adr/** - Architecture Decision Records (8 documents)

## License

MIT
