# TLT - Time Logger & Task Manager

A unified time-tracking and task management system combining a Rust CLI (`tl`) with a Next.js web application.

## Architecture

The project consists of two main components:

1. **time-logger** (`tl` CLI) - Rust-based time tracking authority
   - Real-time stopwatch functionality
   - Manual time logging
   - Category-based time organization
   - Reports, streaks, and goals
   - PostgreSQL storage

2. **trello-like** (Web App) - Next.js Kanban board with timer integration
   - Task boards with drag-and-drop
   - Workspaces and boards organization
   - Calendar highlights
   - Integrated timer controls
   - Dashboard with time analytics

## Setup

### Prerequisites

- Rust (for `tl` CLI)
- Node.js 18+ and npm (for web app)
- PostgreSQL database

### Environment Variables

Create `.env` files based on `.env.example` in both directories:

**Root `.env`:**
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/tlt
JWT_SECRET=your-secret-key
AI_API_KEY=your-ai-key (optional)
AI_API_URLS=your-ai-endpoint (optional)
AI_MODELS=your-models (optional)
```

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd tlt
```

2. **Setup time-logger (Rust CLI)**
```bash
cd time-logger
cargo install --path .
```

3. **Setup trello-like (Next.js app)**
```bash
cd trello-like
npm install
npm run db:push
npm run dev
```

4. **Run the CLI**
```bash
cd time-logger
tl --help
```

## Validation Commands

Run these commands to verify the setup:

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
```

## Key Features

### Time Logger CLI
- Start/stop timers with `tl start` and `tl stop`
- Manual logging with `tl add`
- Reports with `tl report`
- Category management
- Goals and streaks tracking

### Web App
- Kanban boards with drag-and-drop
- Timer integration from task cards
- Dashboard with time analytics
- Calendar highlights
- Workspace organization

## Database Schema

The application uses PostgreSQL with the following key tables:
- `users` - User accounts
- `workspaces` - User workspaces
- `boards` - Kanban boards
- `lists` - Board lists
- `tasks` - Task cards
- `sessions` - Time tracking sessions
- `categories` - Time categories
- `calendar_highlights` - Calendar events

## Security

- All timer routes require authentication
- User data is isolated by `userId`
- Sessions use JWT cookies
- Passwords are hashed with bcrypt

## Development

### Quality Gates
- `cargo test` - Rust tests
- `npm run lint` - ESLint
- `npm run typecheck` - TypeScript type checking
- `npm run build` - Production build

### Architecture Documents
See `architecture/` folder for detailed ADRs and specifications.

## License

MIT
