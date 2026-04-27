import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tags, workspaces } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/session';

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

    const workspaceTags = await db.query.tags.findMany({
      where: eq(tags.workspaceId, workspace.id),
    });

    return NextResponse.json({ success: true, tags: workspaceTags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { workspaceSlug, name, color } = body;

    if (!workspaceSlug || !name || !color) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (name.length > 60) {
      return NextResponse.json({ error: 'Name must be 60 characters or less' }, { status: 400 });
    }

    const validColors = [
      'green', 'yellow', 'red', 'blue', 'purple', 
      'pink', 'orange', 'cyan', 'indigo', 'gray',
      'emerald', 'rose', 'amber', 'sky', 'violet',
      'lime', 'teal', 'fuchsia', 'slate', 'brown'
    ];
    if (!validColors.includes(color)) {
      return NextResponse.json({ error: 'Invalid color' }, { status: 400 });
    }

    const workspace = await db.query.workspaces.findFirst({
      where: and(
        eq(workspaces.slug, workspaceSlug),
        eq(workspaces.userId, session.userId)
      ),
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

const [newTag] = await db.insert(tags).values({
id: crypto.randomUUID(),
workspaceId: workspace.id,
name,
color,
}).returning();

    return NextResponse.json({ success: true, tag: newTag });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}