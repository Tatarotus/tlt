import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { calendarHighlights, workspaces } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { safeToISOString } from '@/lib/date-utils';
import { isValidColor } from '@/lib/highlight-colors';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const searchParams = request.nextUrl.searchParams;
  const workspaceSlug = searchParams.get('workspaceSlug');

  if (!workspaceSlug) {
    return NextResponse.json({ error: 'workspaceSlug is required' }, { status: 400 });
  }

  try {
    const workspace = await db.query.workspaces.findFirst({
      where: and(
        eq(workspaces.slug, workspaceSlug),
        eq(workspaces.userId, session.userId)
      ),
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const highlights = await db.query.calendarHighlights.findMany({
      where: eq(calendarHighlights.workspaceId, workspace.id),
    });

const formattedHighlights = highlights.map(h => {
const finalStartDate = h.startDate;
const finalEndDate = h.endDate;

return {
...h,
startDate: safeToISOString(finalStartDate),
endDate: safeToISOString(finalEndDate),
};
});

    return NextResponse.json({ success: true, highlights: formattedHighlights });
  } catch (error) {
    console.error('Error fetching calendar highlights:', error);
    return NextResponse.json({ error: 'Failed to fetch highlights' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { workspaceSlug, title, color, startDate, endDate } = body;

if (!workspaceSlug || !title || !color || !startDate || !endDate) {
return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
}

if (title.length > 60) {
return NextResponse.json({ error: 'Title must be 60 characters or less' }, { status: 400 });
}

// Validate color against curated palette
if (!isValidColor(color)) {
return NextResponse.json({ 
error: 'Invalid color. Use colors from the highlight palette.',
validColors: ['crimson', 'sunset', 'amber', 'emerald', 'ocean', 'indigo', 'violet', 'fuchsia', 'rose', 'teal', 'sky', 'slate']
}, { status: 400 });
}

    const workspace = await db.query.workspaces.findFirst({
      where: and(
        eq(workspaces.slug, workspaceSlug),
        eq(workspaces.userId, session.userId)
      ),
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const startValid = new Date(startDate);
    const endValid = new Date(endDate);

    if (isNaN(startValid.getTime()) || isNaN(endValid.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    if (startValid > endValid) {
      return NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 });
    }

const [newHighlight] = await db.insert(calendarHighlights).values({
id: crypto.randomUUID(),
workspaceId: workspace.id,
title,
color,
startDate: startDate,
endDate: endDate,
}).returning();

// Use property names if they exist
const finalStartDate = newHighlight.startDate;
const finalEndDate = newHighlight.endDate;

    return NextResponse.json({ 
      success: true, 
      highlight: {
        ...newHighlight,
        startDate: safeToISOString(finalStartDate),
        endDate: safeToISOString(finalEndDate),
      } 
    });
  } catch (error) {
    console.error('Error creating calendar highlight:', error);
    return NextResponse.json({ error: 'Failed to create highlight' }, { status: 500 });
  }
}