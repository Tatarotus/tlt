import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { calendarHighlights, workspaces } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { toISOLocalDate } from '@/lib/date-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const highlight = await db.query.calendarHighlights.findFirst({
      where: eq(calendarHighlights.id, id),
      with: {
        workspace: true,
      },
    });

    if (!highlight) {
      return NextResponse.json({ error: 'Highlight not found' }, { status: 404 });
    }

    if (highlight.workspace.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ success: true, highlight });
  } catch (error) {
    console.error('Error fetching highlight:', error);
    return NextResponse.json({ error: 'Failed to fetch highlight' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const { title, color, startDate, endDate } = body;

    const existingHighlight = await db.query.calendarHighlights.findFirst({
      where: eq(calendarHighlights.id, id),
      with: {
        workspace: true,
      },
    });

    if (!existingHighlight) {
      return NextResponse.json({ error: 'Highlight not found' }, { status: 404 });
    }

    if (existingHighlight.workspace.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updates: Partial<{
      title: string;
      color: string;
      startDate: string;
      endDate: string;
      updatedAt: Date;
    }> = { updatedAt: new Date() };

    if (title !== undefined) {
      if (title.length > 60) {
        return NextResponse.json({ error: 'Title must be 60 characters or less' }, { status: 400 });
      }
      updates.title = title;
    }

    if (color !== undefined) {
      const validColors = [
        'green', 'yellow', 'red', 'blue', 'purple', 
        'pink', 'orange', 'cyan', 'indigo', 'gray',
        'emerald', 'rose', 'amber', 'sky', 'violet',
        'lime', 'teal', 'fuchsia', 'slate', 'brown'
      ];
      if (!validColors.includes(color)) {
        return NextResponse.json({ error: 'Invalid color' }, { status: 400 });
      }
      updates.color = color;
    }

    if (startDate !== undefined) {
      if (isNaN(new Date(startDate).getTime())) {
        return NextResponse.json({ error: 'Invalid start date' }, { status: 400 });
      }
      updates.startDate = startDate;
    }

    if (endDate !== undefined) {
      if (isNaN(new Date(endDate).getTime())) {
        return NextResponse.json({ error: 'Invalid end date' }, { status: 400 });
      }
      updates.endDate = endDate;
    }

    if (updates.startDate && updates.endDate && updates.startDate > updates.endDate) {
      return NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 });
    }

    const [updatedHighlight] = await db.update(calendarHighlights)
      .set(updates)
      .where(eq(calendarHighlights.id, id))
      .returning();

    return NextResponse.json({ success: true, highlight: updatedHighlight });
  } catch (error) {
    console.error('Error updating highlight:', error);
    return NextResponse.json({ error: 'Failed to update highlight' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const existingHighlight = await db.query.calendarHighlights.findFirst({
      where: eq(calendarHighlights.id, id),
      with: {
        workspace: true,
      },
    });

    if (!existingHighlight) {
      return NextResponse.json({ error: 'Highlight not found' }, { status: 404 });
    }

    if (existingHighlight.workspace.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await db.delete(calendarHighlights).where(eq(calendarHighlights.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting highlight:', error);
    return NextResponse.json({ error: 'Failed to delete highlight' }, { status: 500 });
  }
}