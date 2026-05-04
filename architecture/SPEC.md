# TLT v1 Specification

## Overview

TLT (Time Logger & Task Manager) is a unified time-tracking and task management system consisting of:

1. **Rust CLI (`tl`)** - Command-line time tracking tool
2. **Next.js Web App** - Kanban board with timer integration

This document describes the v1 specification and current implementation status.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                      │
│  (Single source of truth for all time tracking data)        │
└─────────────────────────────────────────────────────────────┘
                              ▲            ▲
                              │            │
                    ┌─────────┴──────┐    │
                    │                │    │
            ┌───────┴──────┐  ┌──────┴────┐
            │  Rust CLI    │  │ Next.js   │
            │    (tl)      │  │ Web App   │
            │              │  │           │
            │ - Start/stop │  │ - Kanban  │
            │ - Reports    │  │ - Timer   │
            │ - Goals      │  │ - Dashboard
            └──────────────┘  └───────────┘
```

## Core Features

### 1. Time Tracking

#### Timer Sessions
- **Single Global Active Timer**: Only one timer can be active at any time
- **Session Model**: Each session has:
  - `id`: Unique identifier
  - `userId`: Owner of the session
  - `category`: Time category (work, personal, etc.)
  - `startTime`: When the timer started
  - `endTime`: When the timer stopped (null if active)
  - `cardId`: Optional link to task card
  - `notes`: Optional notes
  - `source`: Origin (cli, kanban)

**Status**: ✅ Implemented in web app, pending in CLI

#### Timer API Endpoints
- `POST /api/timer/start` - Start a new timer
- `POST /api/timer/stop` - Stop the active timer
- `GET /api/timer/active` - Get current active timer

**Status**: ✅ Fully implemented

### 2. Task Management (Kanban)

#### Workspaces
- Users can create multiple workspaces
- Each workspace contains boards
- Workspace isolation via `userId`

**Status**: ✅ Implemented

#### Boards
- Kanban-style boards with customizable columns
- Drag-and-drop task movement
- Board backgrounds (patterns and images)
- Board-level settings

**Status**: ✅ Implemented

#### Tasks (Cards)
- Create, edit, delete tasks
- Move tasks between lists via drag-and-drop
- Task details: title, description, category, labels
- Link timer sessions to tasks

**Status**: ✅ Implemented

### 3. Categories and Labels

#### Categories
- Hierarchical time categories
- Used for reporting and filtering
- Can be assigned to tasks and timer sessions

**Status**: 🔄 Partially implemented (schema ready, UI pending)

#### Labels
- Visual color-coded labels for tasks
- Can suggest category mappings
- Independent from categories

**Status**: ✅ Implemented

### 4. Dashboard and Analytics

#### Time Analytics
- Daily/weekly time breakdown by category
- Bar charts showing time distribution
- Session history view

**Status**: ✅ Implemented

#### Calendar Highlights
- Visual calendar showing time tracking
- Color-coded by category
- Click to view session details

**Status**: ✅ Implemented

### 5. Authentication

#### Single-User Mode
- Email/password authentication
- JWT-based session management
- Password hashing with bcrypt
- User data isolation

**Status**: ✅ Implemented

## Database Schema

### Core Tables

```sql
users
├── id (UUID, PK)
├── email (VARCHAR, UNIQUE)
├── password (VARCHAR)
└── created_at (TIMESTAMP)

workspaces
├── id (UUID, PK)
├── name (VARCHAR)
├── slug (VARCHAR, UNIQUE)
├── user_id (UUID, FK → users)
└── created_at (TIMESTAMP)

boards
├── id (UUID, PK)
├── name (VARCHAR)
├── slug (VARCHAR)
├── workspace_id (UUID, FK → workspaces)
├── background_pattern (VARCHAR)
├── background_image_url (VARCHAR)
└── created_at (TIMESTAMP)

lists
├── id (UUID, PK)
├── title (VARCHAR)
├── board_id (UUID, FK → boards)
├── position (INTEGER)
└── created_at (TIMESTAMP)

tasks
├── id (UUID, PK)
├── title (VARCHAR)
├── description (TEXT)
├── list_id (UUID, FK → lists)
├── category (VARCHAR)
├── position (INTEGER)
└── created_at (TIMESTAMP)

sessions (time tracking)
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── category (VARCHAR)
├── card_id (UUID, FK → tasks, nullable)
├── start_time (TIMESTAMP)
├── end_time (TIMESTAMP, nullable)
├── notes (TEXT)
├── source (VARCHAR)
└── created_at (TIMESTAMP)

categories
├── id (UUID, PK)
├── name (VARCHAR)
├── user_id (UUID, FK → users)
└── created_at (TIMESTAMP)

tags (labels)
├── id (UUID, PK)
├── name (VARCHAR)
├── color (VARCHAR)
├── workspace_id (UUID, FK → workspaces)
└── created_at (TIMESTAMP)

calendar_highlights
├── id (UUID, PK)
├── title (VARCHAR)
├── color (VARCHAR)
├── start_date (DATE)
├── end_date (DATE)
├── workspace_id (UUID, FK → workspaces)
└── created_at (TIMESTAMP)
```

## API Reference

### Timer Routes

#### Start Timer
```
POST /api/timer/start
Body: { category: string, cardId?: string, notes?: string }
Response: { success: true, session: Session }
Errors: 401 (unauthorized), 400 (missing category), 409 (timer already running)
```

#### Stop Timer
```
POST /api/timer/stop
Body: { notes?: string }
Response: { success: true, session: Session }
Errors: 401 (unauthorized), 404 (no active timer)
```

#### Get Active Timer
```
GET /api/timer/active
Response: Session | null
Errors: 401 (unauthorized)
```

### Board Routes

#### Navigate to Board
```
POST /api/boards/navigate
Body: { workspaceSlug: string, boardName: string }
Response: { success: true, board: Board, created: boolean }
```

### Tags Routes

#### Get Tags
```
GET /api/tags?workspaceSlug=string
Response: Tag[]
Errors: 401 (unauthorized), 404 (workspace not found)
```

#### Create Tag
```
POST /api/tags
Body: { workspaceSlug: string, name: string, color: string }
Response: { success: true, tag: Tag }
```

### Calendar Routes

#### Get Highlights
```
GET /api/calendar/highlights?workspaceSlug=string&start=ISODate&end=ISODate
Response: CalendarHighlight[]
```

#### Update Highlight
```
PUT /api/calendar/highlights/[id]
Body: { title?: string, color?: string, startDate?: string, endDate?: string }
Response: { success: true, highlight: CalendarHighlight }
```

## Quality Gates

### Testing
- **Unit Tests**: 229 tests passing
- **Coverage**: 64% line coverage (target: 80%)
- **Mutation Testing**: 93.75% mutation score (target: 60%)

### Code Quality
- **Linting**: ESLint with TypeScript
- **Type Checking**: TypeScript strict mode
- **Complexity**: Maximum cyclomatic complexity of 4
- **File Size**: Maximum 500 lines per file (warning at 300)

### CI/CD Pipeline
```yaml
- Install dependencies
- Run linting
- Run type checking
- Run complexity check
- Run file size check
- Run test coverage
- Run mutation testing
```

## Implementation Status

### Completed ✅
- [x] PostgreSQL database schema
- [x] User authentication (single-user)
- [x] Workspace and board management
- [x] Task (card) CRUD operations
- [x] Drag-and-drop task reordering
- [x] Timer start/stop API
- [x] Active timer enforcement
- [x] Dashboard with time analytics
- [x] Calendar highlights view
- [x] Tag/label management
- [x] Board customization (backgrounds)
- [x] Comprehensive test suite
- [x] Quality gate automation

### In Progress 🔄
- [ ] Category-label mapping UI
- [ ] Auto-stop timer on card completion
- [ ] Rust CLI PostgreSQL support
- [ ] Migration from SQLite to PostgreSQL

### Deferred ⏸️
- [ ] Offline mode for CLI
- [ ] Multi-user support
- [ ] PAT (Personal Access Token) system
- [ ] Real-time collaboration
- [ ] Advanced reporting features

## Technical Stack

### Web Application
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **State Management**: React Context + localStorage
- **Testing**: Jest + Bun test runner
- **Linting**: ESLint
- **Type Checking**: TypeScript

### CLI (Rust)
- **Language**: Rust
- **Database**: PostgreSQL (via sqlx or diesel)
- **CLI Framework**: clap
- **Testing**: cargo test

### Infrastructure
- **Database**: PostgreSQL 15+
- **Deployment**: VPS (manual or Docker)
- **CI/CD**: GitHub Actions

## Security Considerations

1. **Authentication**: All timer routes require authentication
2. **Data Isolation**: User data isolated by `userId` foreign keys
3. **Password Security**: bcrypt hashing with salt
4. **Session Management**: JWT cookies with httpOnly flag
5. **Input Validation**: All API endpoints validate input
6. **SQL Injection**: Prevented via Drizzle ORM parameterized queries

## Future Considerations

### Potential ADRs
- ADR-009: Offline-first CLI architecture
- ADR-010: Multi-user support and collaboration
- ADR-011: PAT system for third-party integrations
- ADR-012: Real-time updates with WebSockets/SSE
- ADR-013: Advanced reporting and analytics

### Scalability
- Current design supports single user
- Database schema can be extended for multi-user
- Consider connection pooling for production
- Consider caching layer for frequently accessed data

## Changelog

### v1.0.0 (Current)
- Initial v1 implementation
- Single-user mode
- Direct PostgreSQL integration
- 229 passing tests
- 93.75% mutation score

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-05-04  
**Maintainer**: TLT Team
