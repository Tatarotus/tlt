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

interface ValidateHighlightBody { workspaceSlug: string; title: string; color: string; startDate: string; endDate: string; }
async function validateHighlight(body: ValidateHighlightBody) {
  const { workspaceSlug, title, color, startDate, endDate } = body;
  if (!workspaceSlug || !title || !color || !startDate || !endDate) return 'Missing required fields';
  if (title.length > 60) return 'Title must be 60 characters or less';
  if (!isValidColor(color)) return 'Invalid color.';
  const s = new Date(startDate), e = new Date(endDate);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 'Invalid date format';
  return s > e ? 'Start date must be before end date' : null;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const error = await validateHighlight(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const workspace = await db.query.workspaces.findFirst({
      where: and(eq(workspaces.slug, body.workspaceSlug), eq(workspaces.userId, session.userId)),
    });
    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

    const [newHighlight] = await db.insert(calendarHighlights).values({
      id: crypto.randomUUID(), workspaceId: workspace.id, title: body.title, color: body.color, startDate: body.startDate, endDate: body.endDate,
    }).returning();

    return NextResponse.json({ 
      success: true, 
      highlight: { ...newHighlight, startDate: safeToISOString(newHighlight.startDate), endDate: safeToISOString(newHighlight.endDate) } 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create highlight' }, { status: 500 });
  }
}