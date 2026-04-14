"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarView } from "../components/CalendarView";
import { ViewTabs } from "../components/ViewTabs";

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
      <div className="bg-white border-b border-gray-200 py-10 mb-0">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors w-fit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              All Workspaces
            </Link>
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-4">
                <div className="space-y-1">
                  <h1 className="text-3xl font-semibold text-gray-900">
                    {workspace.name}
                  </h1>
                  {workspace.description && (
                    <p className="text-base text-gray-500 max-w-2xl">
                      {workspace.description}
                    </p>
                  )}
                </div>
                <ViewTabs workspaceSlug={workspace.slug} currentView="calendar" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <CalendarView
        highlights={highlights}
        workspaceSlug={workspace.slug}
        onHighlightsChange={refreshHighlights}
        onHighlightClick={onHighlightClick}
      />
    </main>
  );
}