import { db } from "@/db";
import { boards, workspaces } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import KanbanBoard from "@/app/components/KanbanBoard";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; boardSlug: string }>;
}) {
  const { workspaceSlug, boardSlug } = await params;
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.slug, workspaceSlug),
  });

  if (!workspace || workspace.userId !== session.userId) {
    notFound();
  }

  const board = await db.query.boards.findFirst({
    where: and(eq(boards.slug, boardSlug), eq(boards.workspaceId, workspace.id)),
    with: {
      lists: {
        with: {
          tasks: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            where: (t: any, { isNull }: any) => isNull(t.parentId),
            with: {
              children: true
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            orderBy: (t: any, { asc }: any) => [asc(t.order)]
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        orderBy: (l: any, { asc }: any) => [asc(l.order)]
      },
    },
  });

  if (!board) {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{board.name}</h1>
          <p className="text-sm text-muted-foreground">
            {workspace.name} / {board.name}
          </p>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <KanbanBoard initialLists={board.lists as any} boardId={board.id} />
      </div>
    </div>
  );
}
