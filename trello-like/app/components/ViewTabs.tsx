"use client";

import Link from "next/link";

interface ViewTabsProps {
  workspaceSlug: string;
  currentView: "calendar" | "kanban";
}

export function ViewTabs({ workspaceSlug, currentView }: ViewTabsProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
      <Link
        href={`/${workspaceSlug}`}
        className={`
          px-4 py-1.5 text-sm font-medium rounded-md transition-all
          ${currentView === "calendar" 
            ? "bg-white text-gray-900 shadow-sm" 
            : "text-gray-500 hover:text-gray-900"}
        `}
      >
        <span className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Calendar
        </span>
      </Link>
      <Link
        href={`/${workspaceSlug}/boards`}
        className={`
          px-4 py-1.5 text-sm font-medium rounded-md transition-all
          ${currentView === "kanban" 
            ? "bg-white text-gray-900 shadow-sm" 
            : "text-gray-500 hover:text-gray-900"}
        `}
      >
        <span className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="9"/>
            <rect x="14" y="3" width="7" height="5"/>
            <rect x="14" y="12" width="7" height="9"/>
            <rect x="3" y="16" width="7" height="5"/>
          </svg>
          Kanban
        </span>
      </Link>
    </div>
  );
}