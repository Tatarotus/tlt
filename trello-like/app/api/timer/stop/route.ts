import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/index';
import { sessions } from '@/db/schema';
import { isNull, eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardId } = body;

    let query = db
      .select()
      .from(sessions)
      .where(isNull(sessions.endTime))
      .limit(1);

    if (cardId) {
      const [activeForCard] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.cardId, cardId))
        .limit(1);

      if (activeForCard && activeForCard.endTime === null) {
        const [stopped] = await db
          .update(sessions)
          .set({ endTime: new Date() })
          .where(eq(sessions.id, activeForCard.id))
          .returning();

        const duration = stopped.startTime
          ? Math.floor(
              (new Date().getTime() - new Date(stopped.startTime).getTime()) / 1000
            )
          : 0;

        return NextResponse.json({
          success: true,
          session: {
            id: stopped.id,
            category: stopped.category,
            startTime: stopped.startTime,
            endTime: stopped.endTime,
            notes: stopped.notes,
            cardId: stopped.cardId,
            source: stopped.source,
            duration,
          },
        });
      }
    }

    const activeSessions = await query;

    if (activeSessions.length === 0) {
      return NextResponse.json(
        { error: 'No active timer found' },
        { status: 404 }
      );
    }

    const active = activeSessions[0];
    const [stopped] = await db
      .update(sessions)
      .set({ endTime: new Date() })
      .where(eq(sessions.id, active.id))
      .returning();

    const duration = stopped.startTime
      ? Math.floor(
          (new Date().getTime() - new Date(stopped.startTime).getTime()) / 1000
        )
      : 0;

    return NextResponse.json({
      success: true,
      session: {
        id: stopped.id,
        category: stopped.category,
        startTime: stopped.startTime,
        endTime: stopped.endTime,
        notes: stopped.notes,
        cardId: stopped.cardId,
        source: stopped.source,
        duration,
      },
    });
  } catch (error) {
    console.error('Error stopping timer:', error);
    return NextResponse.json(
      { error: 'Failed to stop timer' },
      { status: 500 }
    );
  }
}