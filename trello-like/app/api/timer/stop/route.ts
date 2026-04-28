import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/index';
import { sessions } from '@/db/schema';
import { isNull, eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/session';

async function stopActiveSession(sessionId: string) {
  const [stopped] = await db.update(sessions).set({ endTime: new Date() }).where(eq(sessions.id, sessionId)).returning();
  const duration = stopped.startTime ? Math.floor((new Date().getTime() - new Date(stopped.startTime).getTime()) / 1000) : 0;
  return { ...stopped, duration };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { cardId } = await request.json();

    const active = await db.select().from(sessions).where(and(cardId ? eq(sessions.cardId, cardId) : isNull(sessions.endTime), isNull(sessions.endTime), eq(sessions.userId, session.userId))).limit(1);
    if (!active.length) return NextResponse.json({ error: 'No active timer found' }, { status: 404 });

    const stopped = await stopActiveSession(active[0].id);
    return NextResponse.json({ success: true, session: stopped });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to stop timer' }, { status: 500 });
  }
}