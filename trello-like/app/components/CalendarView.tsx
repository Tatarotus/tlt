"use client";
import { useState, useEffect, useRef } from "react";
import { toISOLocalDate, toLocalMidnight } from "@/lib/date-utils";
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { CalendarEvent } from './CalendarEvent';

interface Highlight {
  id: string;
  title: string;
  color: string;
  startDate: string;
  endDate: string;
}

interface CalendarHighlightProps {
  highlights: Highlight[];
  workspaceSlug: string;
  onHighlightsChange: () => void;
  onHighlightClick: (highlight: Highlight) => void;
  taskDots?: { taskId: string; title: string; dueDate: string }[];
}

export function CalendarView({
  highlights,
  workspaceSlug,
  onHighlightsChange,
  onHighlightClick,
  taskDots = []
}: CalendarHighlightProps) {
  const [currentYear] = useState(new Date().getFullYear());
  const [selectedColor, setSelectedColor] = useState<string>("Crimson");
  const [highlightName, setHighlightName] = useState("");
  const [isCreatingHighlight, setIsCreatingHighlight] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const handleCreateHighlight = async () => {
    if (!selectionStart || !selectionEnd || !highlightName.trim()) return;

    setCreateError(null);
    setIsCreatingHighlight(true);

    const s = selectionStart.getTime() < selectionEnd.getTime() ? selectionStart : selectionEnd;
    const e = selectionStart.getTime() < selectionEnd.getTime() ? selectionEnd : selectionStart;

    try {
      const res = await fetch("/api/calendar/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceSlug,
          title: highlightName.trim(),
          color: selectedColor,
          startDate: toISOLocalDate(s),
          endDate: toISOLocalDate(e),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setHighlightName("");
        setSelectionStart(null);
        setSelectionEnd(null);
        onHighlightsChange();
      } else {
        setCreateError(data.error);
      }
    } catch (_err) {
      setCreateError("Failed to create highlight");
    } finally {
      setIsCreatingHighlight(false);
    }
  };

  const handleDeleteHighlight = async (id: string) => {
    if (!confirm("Delete this highlight?")) return;

    try {
      const res = await fetch(`/api/calendar/highlights/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        onHighlightsChange();
      }
    } catch (_err) {
      console.error("Failed to delete highlight:", _err);
    }
  };

  const handleMouseDown = (date: Date) => {
    const d = new Date(date.getTime());
    setSelectionStart(d);
    setSelectionEnd(d);
    setIsDragging(true);
  };

  const handleMouseEnter = (date: Date) => {
    if (isDragging && selectionStart) {
      setSelectionEnd(new Date(date.getTime()));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  const renderRightPanel = () => (
    <div className="w-72 border-l border-gray-200 bg-white p-4 flex flex-col h-full">
      <CalendarHeader
        currentYear={currentYear}
        selectedColor={selectedColor}
        highlightName={highlightName}
        selectionStart={selectionStart}
        selectionEnd={selectionEnd}
        isCreatingHighlight={isCreatingHighlight}
        createError={createError}
        isColorPickerOpen={isColorPickerOpen}
        onSelectedColorChange={setSelectedColor}
        onHighlightNameChange={setHighlightName}
        onIsCreatingHighlightChange={setIsCreatingHighlight}
        onCreateHighlight={handleCreateHighlight}
        onIsColorPickerOpenChange={setIsColorPickerOpen}
      />

      <div className="flex-1 overflow-y-auto space-y-2">
        {highlights
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .map((h) => (
            <CalendarEvent
              key={h.id}
              highlight={h}
              onDelete={handleDeleteHighlight}
              onClick={onHighlightClick}
            />
          ))}
        {highlights.length === 0 && (
          <div className="text-xs text-gray-400 text-center py-8">
            No highlights yet.<br />Drag on the calendar to create one.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-140px)]">
      <CalendarGrid
        currentYear={currentYear}
        highlights={highlights}
        selectionStart={selectionStart}
        selectionEnd={selectionEnd}
        taskDots={taskDots}
        isDragging={isDragging}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseUp={handleMouseUp}
        onHighlightClick={onHighlightClick}
      />
      {renderRightPanel()}
    </div>
  );
}

export default CalendarView;
