import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workspaces } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { findOrCreateBoardByName } from '@/app/actions/board-actions';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { boardName, workspaceSlug } = body;

    if (!boardName || !workspaceSlug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const workspace = await db.query.workspaces.findFirst({
      where: and(eq(workspaces.slug, workspaceSlug), eq(workspaces.userId, session.userId)),
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const result = await findOrCreateBoardByName(boardName, workspace.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, board: result.board, created: result.created });
  } catch (error) {
    console.error('Failed to navigate to board:', error);
    return NextResponse.json({ error: 'Failed to navigate to board' }, { status: 500 });
  }
}