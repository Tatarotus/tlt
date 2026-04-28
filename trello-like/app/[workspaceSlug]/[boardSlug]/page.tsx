import { db } from "@/db";
import { boards, workspaces } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import KanbanBoard from "@/app/components/KanbanBoard";

function BoardHeader({ boardName, workspaceName }: { boardName: string; workspaceName: string }) {
  return (
    <div className="p-4 border-b flex items-center justify-between bg-background/50 backdrop-blur-sm sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{boardName}</h1>
        <p className="text-sm text-muted-foreground">{workspaceName} / {boardName}</p>
      </div>
    </div>
  );
}

export default async function BoardPage({ params }: { params: Promise<{ workspaceSlug: string; boardSlug: string }>; }) {
  const { workspaceSlug, boardSlug } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const workspace = await db.query.workspaces.findFirst({ where: eq(workspaces.slug, workspaceSlug) });
  if (!workspace || workspace.userId !== session.userId) notFound();

  const board = await db.query.boards.findFirst({
    where: and(eq(boards.slug, boardSlug), eq(boards.workspaceId, workspace.id)),
    with: {
      lists: {
        with: { tasks: { where: (t: any, { isNull }: any) => isNull(t.parentId), with: { children: true }, orderBy: (t: any, { asc }: any) => [asc(t.order)] } },
        orderBy: (l: any, { asc }: any) => [asc(l.order)]
      },
    },
  });
  if (!board) notFound();

  return (
    <div className="flex-1 flex flex-col h-full">
      <BoardHeader boardName={board.name} workspaceName={workspace.name} />
      <div className="flex-1 overflow-hidden">
        <KanbanBoard initialLists={board.lists as any} boardId={board.id} />
      </div>
    </div>
  );
}
