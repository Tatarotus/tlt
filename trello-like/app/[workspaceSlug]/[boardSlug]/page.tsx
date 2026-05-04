import { db } from "@/db";
import { boards, workspaces, tasks, lists as listsTable } from "@/db/schema";
import { eq, and, isNull, asc } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import KanbanBoard from "@/app/components/KanbanBoard";
import { BoardHeader } from "@/app/components/ui/BoardHeader";
import type { List } from "@/lib/types";

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string; boardSlug: string }>;
  searchParams: Promise<{ calendarHighlightId?: string }>;
}) {
  const { workspaceSlug, boardSlug } = await params;
  const { calendarHighlightId } = await searchParams;
  const session = await getSession();
  if (!session) redirect("/login");

  const workspace = await db.query.workspaces.findFirst({ where: eq(workspaces.slug, workspaceSlug) });
  if (!workspace || workspace.userId !== session.userId) notFound();

  const board = await db.query.boards.findFirst({
    where: and(eq(boards.slug, boardSlug), eq(boards.workspaceId, workspace.id)),
    with: {
      lists: {
        with: {
          tasks: {
            where: isNull(tasks.parentId),
            with: { children: true },
            orderBy: [asc(tasks.order)]
          }
        },
        orderBy: [asc(listsTable.order)]
      },
    },
  });
  if (!board) notFound();

  return (
    <div className="flex-1 flex flex-col h-full">
      <BoardHeader
        userId={session.userId}
        boardId={board.id}
        boardName={board.name}
        boardSlug={board.slug}
        workspaceName={workspace.name}
        workspaceSlug={workspace.slug}
      />
		<div className="flex-1 overflow-hidden">
			<KanbanBoard initialLists={board.lists as List[]} boardId={board.id} calendarHighlightId={calendarHighlightId} />
		</div>
    </div>
  );
}
