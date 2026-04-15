import Link from "next/link";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { workspaces, calendarHighlights } from "@/db/schema";
import { WorkspaceCalendar } from "./WorkspaceCalendar";

import { safeToISOString } from "@/lib/date-utils";

export default async function WorkspacePage({ params }: { params: Promise<{ workspaceSlug: string }> }) {
  const session = await getSession();
  const { workspaceSlug } = await params;

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-xl font-medium text-gray-900">Unauthorized</h1>
        <Link href="/login" className="text-gray-500 hover:text-gray-900 mt-2 text-sm">Login to continue</Link>
      </div>
    );
  }

  const workspace = await db.query.workspaces.findFirst({
    where: and(eq(workspaces.slug, workspaceSlug), eq(workspaces.userId, session.userId)),
  });

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-xl font-medium text-gray-900">Workspace not found</h1>
        <Link href="/" className="text-gray-500 hover:text-gray-900 mt-2 text-sm">Go back to Workspaces</Link>
      </div>
    );
  }

const highlights = await db.query.calendarHighlights.findMany({
where: eq(calendarHighlights.workspaceId, workspace.id),
});

return (
<WorkspaceCalendar
workspace={workspace}
initialHighlights={highlights.map(h => {
const finalStartDate = h.startDate;
const finalEndDate = h.endDate;
        
        return {
          id: h.id,
          title: h.title,
          color: h.color,
          startDate: safeToISOString(finalStartDate),
          endDate: safeToISOString(finalEndDate),
        };
      })}
    />
  );
}