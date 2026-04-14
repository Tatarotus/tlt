"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarView } from "../components/CalendarView";
import { ViewTabs } from "../components/ViewTabs";
import { WorkspaceHeader } from "../components/ui/WorkspaceHeader";

interface Highlight {
  id: string;
  title: string;
  color: string;
  startDate: string;
  endDate: string;
}

interface WorkspaceData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface WorkspaceCalendarProps {
  workspace: WorkspaceData;
  initialHighlights: Highlight[];
}

export function WorkspaceCalendar({ workspace, initialHighlights }: WorkspaceCalendarProps) {
  const [highlights, setHighlights] = useState<Highlight[]>(initialHighlights);
  const router = useRouter();

  const refreshHighlights = useCallback(async () => {
    try {
      const res = await fetch(`/api/calendar/highlights?workspaceSlug=${workspace.slug}`);
      const data = await res.json();
      if (data.success) {
        setHighlights(data.highlights);
      }
    } catch (err) {
      console.error("Failed to refresh highlights:", err);
    }
  }, [workspace.slug]);

  const onHighlightClick = async (highlight: Highlight) => {
    try {
      const res = await fetch("/api/boards/navigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardName: highlight.title,
          workspaceSlug: workspace.slug,
        }),
      });
      const data = await res.json();
      if (data.success && data.board) {
        router.push(`/${workspace.slug}/${data.board.slug}`);
      }
    } catch (err) {
      console.error("Failed to navigate to board:", err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-24 font-sans">
      <WorkspaceHeader
        id={workspace.id}
        name={workspace.name}
        slug={workspace.slug}
        description={workspace.description || ""}
        backHref="/"
        backLabel="All Workspaces"
      >
        <ViewTabs workspaceSlug={workspace.slug} currentView="calendar" />
      </WorkspaceHeader>

      <CalendarView
        highlights={highlights}
        workspaceSlug={workspace.slug}
        onHighlightsChange={refreshHighlights}
        onHighlightClick={onHighlightClick}
      />
    </main>
  );
}