import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/index';
import { sessions } from '@/db/schema';
import { isNull, eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardId, category, notes } = body;

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    const activeSessions = await db
      .select()
      .from(sessions)
      .where(isNull(sessions.endTime))
      .limit(1);

    if (activeSessions.length > 0) {
      const active = activeSessions[0];
      await db
        .update(sessions)
        .set({ endTime: new Date() })
        .where(eq(sessions.id, active.id));
    }

    const [newSession] = await db
      .insert(sessions)
      .values({
        category,
        startTime: new Date(),
        notes: notes || null,
        cardId: cardId || null,
        source: 'kanban',
      })
      .returning();

    return NextResponse.json({
      success: true,
      session: {
        id: newSession.id,
        category: newSession.category,
        startTime: newSession.startTime,
        notes: newSession.notes,
        cardId: newSession.cardId,
        source: newSession.source,
      },
    });
  } catch (error) {
    console.error('Error starting timer:', error);
    return NextResponse.json(
      { error: 'Failed to start timer' },
      { status: 500 }
    );
  }
}