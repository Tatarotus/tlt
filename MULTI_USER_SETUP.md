# Multi-User Setup Guide

## Overview

The TLT (Time Logger) system now supports multiple users. The Rust CLI reads the `user_id` from a configuration file, allowing you to switch between different users or set up the CLI for a specific user.

## How It Works

1. **Trello-like App**: Users are created through the web interface
2. **Rust CLI**: Reads the `user_id` from `~/.config/time-logger/config.json`
3. **Database**: All sessions are attributed to the configured `user_id`

## Setup for New Users

### Step 1: Create a User in Trello-like App

1. Open the web app at `http://localhost:3000`
2. Go to `/register` to create a new user account
3. Note the user's email and name

### Step 2: Get the User ID

You can find the user ID in two ways:

**Option A: From PostgreSQL directly**
```bash
PGPASSWORD='strongpassword' psql -h smre.run.place -U sam -d mydb -c "SELECT id, email, name FROM users;"
```

**Option B: From the application**
- User IDs are UUIDs stored in the database
- Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Step 3: Update CLI Configuration

Edit the configuration file at `~/.config/time-logger/config.json`:

```json
{
  "user_id": "NEW_USER_ID_HERE",
  "goals": [
    { "category": "coding", "duration_minutes": 120 },
    { "category": "gym", "duration_minutes": 60 }
  ]
}
```

Replace `NEW_USER_ID_HERE` with the actual user ID from Step 2.

### Step 4: Verify Configuration

Test that the CLI is using the correct user:

```bash
cd time-logger
export DATABASE_URL="postgresql://sam:strongpassword@smre.run.place:5432/mydb"
cargo run -- start "Test:session"
# Wait a few seconds
cargo run -- stop
```

Verify in the database:
```bash
PGPASSWORD='strongpassword' psql -h smre.run.place -U sam -d mydb -c "SELECT category, user_id FROM sessions ORDER BY start_time DESC LIMIT 1;"
```

The `user_id` should match the one you configured.

## Switching Between Users

To switch the CLI to a different user:

1. Edit `~/.config/time-logger/config.json`
2. Change the `user_id` field to the new user's ID
3. All future CLI sessions will be attributed to that user

Example:
```bash
# Switch to User A
cat > ~/.config/time-logger/config.json << 'EOF'
{
  "user_id": "user-a-id-here",
  "goals": []
}
EOF

# Use CLI as User A
cargo run -- add "Coding" 2h

# Switch to User B
cat > ~/.config/time-logger/config.json << 'EOF'
{
  "user_id": "user-b-id-here",
  "goals": []
}
EOF

# Use CLI as User B
cargo run -- add "Gym" 1h
```

## Default Configuration

If no config file exists, the CLI uses a default user ID:
```
cde3cbc1-f6bf-4cdc-b17c-3317293ed115
```

This is useful for single-user setups or testing.

## Configuration File Location

The configuration file is located at:
- **Linux/Mac**: `~/.config/time-logger/config.json`
- **Windows**: `%APPDATA%\time-logger\config.json` (may vary)

## Example Configurations

### Single User (Default)
```json
{
  "user_id": "cde3cbc1-f6bf-4cdc-b17c-3317293ed115",
  "goals": [
    { "category": "coding", "duration_minutes": 120 }
  ]
}
```

### Multiple Goals
```json
{
  "user_id": "your-user-id-here",
  "goals": [
    { "category": "coding", "duration_minutes": 240 },
    { "category": "gym", "duration_minutes": 60 },
    { "category": "learning", "duration_minutes": 90 },
    { "category": "food", "duration_minutes": 60 }
  ]
}
```

## Troubleshooting

### CLI sessions not appearing in dashboard

1. Verify the `user_id` in config matches the user in the database
2. Check that the CLI is using the correct database
3. Ensure the web app is logged in as the same user

### Config file not found

If the config file doesn't exist, create it:
```bash
mkdir -p ~/.config/time-logger
cat > ~/.config/time-logger/config.json << 'EOF'
{
  "user_id": "your-user-id-here",
  "goals": []
}
EOF
```

### Invalid user_id format

The `user_id` must be a valid UUID:
- ✅ Valid: `cde3cbc1-f6bf-4cdc-b17c-3317293ed115`
- ❌ Invalid: `not-a-uuid`

## Database Schema

Sessions table structure:
```sql
CREATE TABLE sessions (
    id BIGSERIAL PRIMARY KEY,
    category TEXT NOT NULL,
    category_id INTEGER,
    user_id UUID NOT NULL REFERENCES users(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    notes TEXT,
    card_id TEXT,
    source TEXT DEFAULT 'cli' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

All sessions must have a valid `user_id` that references the `users` table.

## Security Notes

- The `user_id` in the config file should match an actual user in the database
- There's no authentication between CLI and database - anyone with config access can set any user_id
- For production use, consider implementing proper authentication
- Keep the config file secure and don't commit it to version control

## Future Enhancements

Potential improvements for multi-user support:
- CLI command to switch users: `tl user switch <user-id>`
- CLI command to list available users: `tl user list`
- Environment variable override: `TL_USER_ID`
- Named user profiles: `tl user profile work`
