import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { sessions } from '@/db/schema';
import { eq, isNull } from 'drizzle-orm';

export async function GET() {
  try {
    const activeSessions = await db
      .select()
      .from(sessions)
      .where(isNull(sessions.endTime))
      .limit(1);

    if (activeSessions.length === 0) {
      return NextResponse.json({ active: null });
    }

    const active = activeSessions[0];
    const duration = active.startTime
      ? Math.floor((Date.now() - new Date(active.startTime).getTime()) / 1000)
      : 0;

    return NextResponse.json({
      active: {
        id: active.id,
        category: active.category,
        startTime: active.startTime,
        notes: active.notes,
        cardId: active.cardId,
        source: active.source,
        duration,
      },
    });
  } catch (error) {
    console.error('Error fetching active timer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active timer' },
      { status: 500 }
    );
  }
}