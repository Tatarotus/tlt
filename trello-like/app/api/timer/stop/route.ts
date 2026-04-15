import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/index';
import { sessions } from '@/db/schema';
import { isNull, eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
try {
const session = await getSession();
if (!session?.userId) {
return NextResponse.json(
{ error: 'Unauthorized' },
{ status: 401 }
);
}

const body = await request.json();
const { cardId } = body;

const activeForCard = cardId
? await db
.select()
.from(sessions)
.where(
and(
eq(sessions.cardId, cardId),
isNull(sessions.endTime),
eq(sessions.userId, session.userId)
)
)
.limit(1)
: null;

if (activeForCard && activeForCard.length > 0) {
const [stopped] = await db
.update(sessions)
.set({ endTime: new Date() })
.where(eq(sessions.id, activeForCard[0].id))
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

const activeSessions = await db
.select()
.from(sessions)
.where(
and(
isNull(sessions.endTime),
eq(sessions.userId, session.userId)
)
)
.limit(1);

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