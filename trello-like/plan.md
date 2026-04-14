# Calendar Highlight & Kanban Integration - Technical Implementation Plan

## Overview

This document outlines the technical implementation for:
1. Displaying color-coded highlights on the calendar view (BUGGY - NEEDS FIX)
2. Auto-creating Kanban boards with default lists (Todo, Progress, Done) when clicking highlights

---

## Part 1: Calendar Highlight Display - NEEDS IMPLEMENTATION

### Current State (BUGGY)
- Highlights are stored in PostgreSQL with `startDate` and `endDate`
- `CalendarView.tsx` attempts to render colored backgrounds on calendar days
- **BUG**: Highlights are NOT visible on the calendar - colors not showing

### Root Cause
The timezone mismatch occurs because:
- PostgreSQL returns dates as UTC strings (e.g., `"2026-04-14T00:00:00.000Z"`)
- JavaScript's `new Date(string)` interprets as UTC
- But `new Date(year, month, day)` creates date in local timezone
- Comparison fails when UTC date falls on previous day in local time

### Implementation Required

#### 1.1 Create Date Utility (NEW FILE)
Create `app/lib/date-utils.ts`:

```typescript
// app/lib/date-utils.ts

export function toLocalMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseISOLocal(dateString: string): Date {
  const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const d = toLocalMidnight(date);
  const s = toLocalMidnight(start);
  const e = toLocalMidnight(end);
  return d >= s && d <= e;
}

export function safeToISOString(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? new Date().toISOString() : value.toISOString();
  }
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}
```

#### 1.2 Fix CalendarView.tsx
The file already exists at `app/components/CalendarView.tsx`. The fix requires:

1. **Import the date utilities**:
```typescript
import { toLocalMidnight, isDateInRange, parseISOLocal } from "@/lib/date-utils";
```

2. **Fix the `getHighlightsForDate` function** - Currently broken:
```typescript
// Current buggy code:
function getHighlightsForDate(date: Date, highlights: Highlight[]): Highlight[] {
  const d = toLocalDate(date);  // BUGGY - uses UTC internally
  return highlights.filter(h => {
    const start = toLocalDate(new Date(h.startDate));  // BUGGY
    const end = toLocalDate(new Date(h.endDate));      // BUGGY
    return isDateInRange(d, start, end);
  });
}

// Replace with:
function getHighlightsForDate(date: Date, highlights: Highlight[]): Highlight[] {
  const d = toLocalMidnight(date);
  return highlights.filter(h => {
    const start = parseISOLocal(h.startDate);
    const end = parseISOLocal(h.endDate);
    return isDateInRange(d, start, end);
  });
}
```

3. **Remove the old buggy functions** from CalendarView.tsx:
   - Remove `toLocalDate()` function (lines ~58-60)
   - Remove `isDateInRange()` function (lines ~68-72)  
   - Remove `getHighlightForDate()` function (lines ~75-85)
   - Remove `getHighlightsForDate()` function

4. **Keep existing color rendering logic** - the CSS classes already exist:
```typescript
// This logic is correct, just needs the date functions to work:
const dayHighlights = getHighlightsForDay(date);
const colorClasses = hasHighlight ? getColorClasses(primaryHighlight.color) : null;
// Applied via: ${colorClasses ? colorClasses.bg : 'hover:bg-gray-50'}
```

#### 1.3 CSS Color Mapping (Already exists in CalendarView.tsx)
```typescript
const COLORS = [
  { name: "green", bg: "bg-green-100", border: "border-green-300", text: "text-green-700", ring: "ring-green-400", dot: "bg-green-500" },
  { name: "yellow", bg: "bg-yellow-100", border: "border-yellow-300", text: "text-yellow-700", ring: "ring-yellow-400", dot: "bg-yellow-500" },
  { name: "red", bg: "bg-red-100", border: "border-red-300", text: "text-red-700", ring: "ring-red-400", dot: "bg-red-500" },
  { name: "blue", bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-700", ring: "ring-blue-400", dot: "bg-blue-500" },
  { name: "purple", bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-700", ring: "ring-purple-400", dot: "bg-purple-500" },
];
```

### Expected Behavior After Fix
- User drags on calendar to select date range
- User picks color and enters name
- User clicks "Add Highlight"
- Calendar days within the date range should show colored background
- Clicking highlighted day navigates to/create Kanban board

---

## Part 2: Auto-Create Kanban with Default Lists

### Current State
- `findOrCreateBoardByName()` in `board-actions.ts` creates a board but NO lists
- Need to add logic to create 3 default lists: "Todo", "In Progress", "Done"

### Implementation Plan

#### 2.1 Update board-actions.ts

Modify `findOrCreateBoardByName` to create default lists after board creation:

```typescript
// app/actions/board-actions.ts

const DEFAULT_LISTS = [
  { title: "Todo", order: 0 },
  { title: "In Progress", order: 1 },
  { title: "Done", order: 2 },
];

export async function findOrCreateBoardByName(boardName: string, workspaceId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const workspace = await db.query.workspaces.findFirst({
      where: and(eq(workspaces.id, workspaceId), eq(workspaces.userId, session.userId))
    });

    if (!workspace) return { success: false, error: "Unauthorized" };

    // Check if board already exists
    const existingBoard = await db.query.boards.findFirst({
      where: and(eq(boards.workspaceId, workspaceId), eq(boards.name, boardName))
    });

    if (existingBoard) {
      return { success: true, board: existingBoard, created: false };
    }

    // Create new board
    const result = await createBoard(boardName, workspaceId);

    if (!result.success || !result.board) {
      return { success: false, error: result.error };
    }

    // Create default lists for the new board
    for (const listConfig of DEFAULT_LISTS) {
      await db.insert(lists).values({
        title: listConfig.title,
        order: listConfig.order,
        boardId: result.board.id,
      });
    }

    return { success: true, board: result.board, created: true };
  } catch (error) {
    console.error("Failed to find or create board:", error);
    return { success: false, error: "Failed to find or create board" };
  }
}
```

#### 2.2 Database Schema (Already Complete)
The `lists` table already exists:
```sql
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE
);
```

---

## File Changes Summary

| File | Change |
|------|--------|
| `app/lib/date-utils.ts` | **NEW** - Date handling utilities (ALREADY CREATED) |
| `app/components/CalendarView.tsx` | Import date utils, remove buggy functions, use new `parseISOLocal` |
| `app/actions/board-actions.ts` | Add default lists creation in `findOrCreateBoardByName` |

---

## Testing Checklist

- [ ] Create highlight with color on calendar
- [ ] Verify colored background appears on calendar days within range
- [ ] Click highlight to navigate to board
- [ ] Verify new board has 3 lists: Todo, In Progress, Done
- [ ] Click same highlight again (existing board) - should navigate without creating duplicate lists
- [ ] Test timezone edge cases (dates near midnight)

---

## Migration Notes

- No database migration needed - schema already supports required tables
- The `tags` table created earlier can remain unused or be removed
- Existing highlights in database will work with fix