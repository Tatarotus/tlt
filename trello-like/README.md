# Trello-like Kanban App

A full-stack Kanban board application with integrated time tracking, built with Next.js 16, Drizzle ORM, and PostgreSQL.

## Features

- **Drag and Drop**: Reorder tasks within lists or move them between lists with smooth animations using @dnd-kit
- **Task Details**: Click a card to open a full detail modal with comprehensive task management
- **Rich Task Properties**:
  - Editable titles and descriptions
  - Due date tracking
  - Color-coded labels (Green, Yellow, Red, Blue, Purple)
  - Subtasks support
- **Time Tracking Integration**: Start timers directly from task cards
- **Workspaces & Boards**: Organize your projects into workspaces and multiple boards
- **Calendar Highlights**: Mark important dates and deadlines
- **Dashboard**: View time analytics and reports
- **Optimistic Updates**: Immediate UI feedback for all actions
- **Responsive Design**: Modern UI that works on all screen sizes

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom JWT-based session management
- **Drag & Drop**: @dnd-kit
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or bun

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database URL and secrets
```

3. **Push the database schema**
```bash
npm run db:push
```

4. **Run the development server**
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Management

```bash
# Update database schema
npm run db:push

# Seed initial data (if available)
npm run db:seed
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run tests

## Time Tracking Integration

This application integrates with the `time-logger` (tl) Rust CLI for time tracking:

- Start timers from task cards
- Stop timers from the active timer bar
- View time analytics in the dashboard
- All time data is stored in PostgreSQL and accessible via both the web app and CLI

## Authentication

The app uses JWT-based authentication:
- Sessions are stored in HTTP-only cookies
- Passwords are hashed with bcrypt
- All API routes require authentication

## Project Structure

```
trello-like/
├── app/                  # Next.js App Router
│   ├── [workspaceSlug]/  # Workspace pages
│   ├── api/              # API routes
│   ├── components/       # React components
│   └── actions/          # Server actions
├── db/                   # Database schema and migrations
├── lib/                  # Utilities and helpers
└── tests/                # Test files
```

## License

MIT
