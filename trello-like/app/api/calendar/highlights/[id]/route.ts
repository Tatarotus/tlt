import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { calendarHighlights, workspaces } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/session';

interface GetUpdatesBody {
	title?: string;
	color?: string;
	startDate?: string;
	endDate?: string;
}

interface Updates {
	updatedAt: Date;
	title?: string;
	color?: string;
	startDate?: string;
	endDate?: string;
}

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

	if ((highlight.workspace as typeof workspaces.$inferSelect).userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ success: true, highlight });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch highlight' }, { status: 500 });
  }
}

function getUpdates(body: GetUpdatesBody) {
	const { title, color, startDate, endDate } = body;
	const updates: Updates = { updatedAt: new Date() };
  if (title !== undefined) {
    if (title.length > 60) throw new Error('Title must be 60 characters or less');
    updates.title = title;
  }
  if (color !== undefined) {
    const validColors = ['green', 'yellow', 'red', 'blue', 'purple', 'pink', 'orange', 'cyan', 'indigo', 'gray', 'emerald', 'rose', 'amber', 'sky', 'violet', 'lime', 'teal', 'fuchsia', 'slate', 'brown'];
    if (!validColors.includes(color)) throw new Error('Invalid color');
    updates.color = color;
  }
  if (startDate !== undefined) {
    if (isNaN(new Date(startDate).getTime())) throw new Error('Invalid start date');
    updates.startDate = startDate;
  }
  if (endDate !== undefined) {
    if (isNaN(new Date(endDate).getTime())) throw new Error('Invalid end date');
    updates.endDate = endDate;
  }
  if (updates.startDate && updates.endDate && updates.startDate > updates.endDate) throw new Error('Start date must be before end date');
  return updates;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    const existingHighlight = await db.query.calendarHighlights.findFirst({ where: eq(calendarHighlights.id, id), with: { workspace: true } });
    if (!existingHighlight) return NextResponse.json({ error: 'Highlight not found' }, { status: 404 });
	if ((existingHighlight.workspace as typeof workspaces.$inferSelect).userId !== session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const updates = getUpdates(await request.json());
    const [updatedHighlight] = await db.update(calendarHighlights).set(updates).where(eq(calendarHighlights.id, id)).returning();
    return NextResponse.json({ success: true, highlight: updatedHighlight });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to update highlight';
		return NextResponse.json({ error: message }, { status: 400 });
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

	if ((existingHighlight.workspace as typeof workspaces.$inferSelect).userId !== session.userId) {
return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}

    await db.delete(calendarHighlights).where(eq(calendarHighlights.id, id));

    return NextResponse.json({ success: true });
    } catch (_error) {
    return NextResponse.json({ error: 'Failed to delete highlight' }, { status: 500 });
    }
    }