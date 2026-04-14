import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { calendarHighlights } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { workspaces } from '@/db/schema';
import { and, gte, lte } from 'drizzle-orm';
import { safeToISOString, toISOLocalDate } from '@/lib/date-utils';

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
      const finalStartDate = h.startDate || (h as any).start_date;
      const finalEndDate = h.endDate || (h as any).end_date;
      
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

    const validColors = [
      'green', 'yellow', 'red', 'blue', 'purple', 
      'pink', 'orange', 'cyan', 'indigo', 'gray',
      'emerald', 'rose', 'amber', 'sky', 'violet',
      'lime', 'teal', 'fuchsia', 'slate', 'brown'
    ];
    if (!validColors.includes(color)) {
      return NextResponse.json({ error: 'Invalid color' }, { status: 400 });
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
      workspaceId: workspace.id,
      title,
      color,
      startDate: startDate,
      endDate: endDate,
    }).returning();

    // Use property names if they exist, otherwise fallback to column names
    const finalStartDate = newHighlight.startDate || (newHighlight as any).start_date;
    const finalEndDate = newHighlight.endDate || (newHighlight as any).end_date;

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