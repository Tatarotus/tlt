import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/index';
import { sessions } from '@/db/schema';
import { isNull, eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { cardId, category, notes } = await request.json();
    if (!category) return NextResponse.json({ error: 'Category is required' }, { status: 400 });

    const active = await db.select().from(sessions).where(and(isNull(sessions.endTime), eq(sessions.userId, session.userId))).limit(1);
    if (active.length > 0) return NextResponse.json({ error: 'Timer already running', activeTimer: { id: active[0].id, category: active[0].category, startTime: active[0].startTime } }, { status: 409 });

    const [newS] = await db.insert(sessions).values({ category, categoryId: null, userId: session.userId, startTime: new Date(), notes: notes || null, cardId: cardId || null, source: 'kanban' }).returning();
    return NextResponse.json({ success: true, session: newS });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to start timer' }, { status: 500 });
  }
}