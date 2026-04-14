"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { toLocalMidnight, isDateInRange, parseISOLocal, toISOLocalDate } from "@/lib/date-utils";

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

const COLORS = [
  { name: "green", hex: "#22c55e", bg: "bg-green-100", border: "border-green-300", text: "text-green-700", ring: "ring-green-400", dot: "bg-green-500" },
  { name: "yellow", hex: "#eab308", bg: "bg-yellow-100", border: "border-yellow-300", text: "text-yellow-700", ring: "ring-yellow-400", dot: "bg-yellow-500" },
  { name: "red", hex: "#ef4444", bg: "bg-red-100", border: "border-red-300", text: "text-red-700", ring: "ring-red-400", dot: "bg-red-500" },
  { name: "blue", hex: "#3b82f6", bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-700", ring: "ring-blue-400", dot: "bg-blue-500" },
  { name: "purple", hex: "#a855f7", bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-700", ring: "ring-purple-400", dot: "bg-purple-500" },
  { name: "pink", hex: "#ec4899", bg: "bg-pink-100", border: "border-pink-300", text: "text-pink-700", ring: "ring-pink-400", dot: "bg-pink-500" },
  { name: "orange", hex: "#f97316", bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-700", ring: "ring-orange-400", dot: "bg-orange-500" },
  { name: "cyan", hex: "#06b6d4", bg: "bg-cyan-100", border: "border-cyan-300", text: "text-cyan-700", ring: "ring-cyan-400", dot: "bg-cyan-500" },
  { name: "indigo", hex: "#6366f1", bg: "bg-indigo-100", border: "border-indigo-300", text: "text-indigo-700", ring: "ring-indigo-400", dot: "bg-indigo-500" },
  { name: "gray", hex: "#71717a", bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-700", ring: "ring-gray-400", dot: "bg-gray-500" },
  { name: "emerald", hex: "#10b981", bg: "bg-emerald-100", border: "border-emerald-300", text: "text-emerald-700", ring: "ring-emerald-400", dot: "bg-emerald-500" },
  { name: "rose", hex: "#f43f5e", bg: "bg-rose-100", border: "border-rose-300", text: "text-rose-700", ring: "ring-rose-400", dot: "bg-rose-500" },
  { name: "amber", hex: "#f59e0b", bg: "bg-amber-100", border: "border-amber-300", text: "text-amber-700", ring: "ring-amber-400", dot: "bg-amber-500" },
  { name: "sky", hex: "#0ea5e9", bg: "bg-sky-100", border: "border-sky-300", text: "text-sky-700", ring: "ring-sky-400", dot: "bg-sky-500" },
  { name: "violet", hex: "#8b5cf6", bg: "bg-violet-100", border: "border-violet-300", text: "text-violet-700", ring: "ring-violet-400", dot: "bg-violet-500" },
  { name: "lime", hex: "#84cc16", bg: "bg-lime-100", border: "border-lime-300", text: "text-lime-700", ring: "ring-lime-400", dot: "bg-lime-500" },
  { name: "teal", hex: "#14b8a6", bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-700", ring: "ring-teal-400", dot: "bg-teal-500" },
  { name: "fuchsia", hex: "#d946ef", bg: "bg-fuchsia-100", border: "border-fuchsia-300", text: "text-fuchsia-700", ring: "ring-fuchsia-400", dot: "bg-fuchsia-500" },
  { name: "slate", hex: "#64748b", bg: "bg-slate-100", border: "border-slate-300", text: "text-slate-700", ring: "ring-slate-400", dot: "bg-slate-500" },
  { name: "brown", hex: "#78350f", bg: "bg-stone-100", border: "border-stone-300", text: "text-stone-700", ring: "ring-stone-400", dot: "bg-stone-500" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getColorClasses(colorName: string) {
  return COLORS.find(c => c.name === colorName) || COLORS[0];
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function getHighlightsForDate(date: Date, highlights: Highlight[]): Highlight[] {
  const d = toLocalMidnight(date);
  return highlights.filter(h => {
    const start = parseISOLocal(h.startDate);
    const end = parseISOLocal(h.endDate);
    return isDateInRange(d, start, end);
  });
}

export function CalendarView({
  highlights,
  workspaceSlug,
  onHighlightsChange,
  onHighlightClick,
  taskDots = []
}: CalendarHighlightProps) {
  const [currentYear] = useState(new Date().getFullYear());
  const [selectedColor, setSelectedColor] = useState<string>("green");
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
    } catch (err) {
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
    } catch (err) {
      console.error("Failed to delete highlight:", err);
    }
  };

  const handleMouseDown = (date: Date) => {
    // Create a new Date object to avoid reference issues
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

  const renderMonth = (monthIndex: number) => {
    const year = currentYear;
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, monthIndex, i));

    const getHighlightsForDay = (date: Date) => getHighlightsForDate(date, highlights);
    const isInSelection = (date: Date) => {
      if (!selectionStart || !selectionEnd) return false;
      const s = selectionStart.getTime() < selectionEnd.getTime() ? selectionStart : selectionEnd;
      const e = selectionStart.getTime() < selectionEnd.getTime() ? selectionEnd : selectionStart;
      return isDateInRange(date, s, e);
    };

    const getTaskDotsForDate = (date: Date) => {
      return taskDots.filter(t => {
        const d = new Date(t.dueDate);
        return isSameDay(d, date);
      });
    };

    return (
      <div key={monthIndex} className="flex-1 min-w-[200px]">
        <div className="text-xs font-semibold text-gray-600 mb-2 px-1">
          {MONTHS[monthIndex]}
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-[10px]">
          {DAYS.map(d => (
            <div key={d} className="text-center text-gray-400 font-medium py-1">
              {d}
            </div>
          ))}
          {days.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} />;

            const dayHighlights = getHighlightsForDay(date);
            const inSelection = isInSelection(date);
            const taskDotsForDay = getTaskDotsForDate(date);
            const isToday = isSameDay(date, new Date());

            const hasHighlight = dayHighlights.length > 0;
            const primaryHighlight = dayHighlights[0];
            const colorClasses = hasHighlight ? getColorClasses(primaryHighlight.color) : null;

            const isSelectedDayWithHighlight = inSelection && hasHighlight;

            return (
              <div
                key={date.toISOString()}
                className={`
                  relative h-7 flex items-center justify-center cursor-pointer
                  rounded-sm transition-all duration-100
                  ${colorClasses ? `${colorClasses.bg} ${inSelection ? 'ring-2 ring-offset-1 ' + colorClasses.ring : ''}` : 'hover:bg-gray-50'}
                  ${inSelection && !colorClasses ? 'bg-blue-50 ring-2 ring-blue-400' : ''}
                  ${isToday && !colorClasses && !inSelection ? 'ring-1 ring-gray-300' : ''}
                `}
                onMouseDown={() => handleMouseDown(date)}
                onMouseEnter={() => handleMouseEnter(date)}
                onMouseUp={handleMouseUp}
                onClick={() => hasHighlight && onHighlightClick(primaryHighlight)}
              >
                <span className={`${colorClasses ? colorClasses.text : 'text-gray-600'} ${isToday ? 'font-bold' : ''}`}>
                  {date.getDate()}
                </span>
                {taskDotsForDay.length > 0 && (
                  <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {taskDotsForDay.slice(0, 3).map((t, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-gray-500" title={t.title} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderRightPanel = () => (
    <div className="w-72 border-l border-gray-200 bg-white p-4 flex flex-col h-full">
      <h3 className="text-sm font-bold text-gray-900 mb-4">New Highlight</h3>

      <div className="space-y-3 mb-6">
        <div className="flex flex-wrap gap-1.5 items-center">
          {COLORS.slice(0, 5).map(c => (
            <button
              key={c.name}
              onClick={() => setSelectedColor(c.name)}
              className={`w-6 h-6 rounded-full ${c.dot} transition-all ${selectedColor === c.name ? 'ring-2 ring-offset-2 ' + c.ring : 'opacity-50 hover:opacity-100'}`}
              title={c.name}
            />
          ))}
          
          {/* Show the selected color if it's NOT in the first 5 */}
          {COLORS.slice(5).find(c => c.name === selectedColor) && (
            <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
              <div className="w-px h-4 bg-gray-200 mx-0.5" />
              <button
                onClick={() => {}}
                className={`w-6 h-6 rounded-full ${getColorClasses(selectedColor).dot} ring-2 ring-offset-2 ${getColorClasses(selectedColor).ring}`}
                title={selectedColor}
              />
            </div>
          )}

          <button 
            className={`w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center transition-all hover:bg-gray-50 active:scale-95 ${isColorPickerOpen ? 'bg-gray-100 opacity-100' : 'opacity-50 hover:opacity-100'}`}
            title="add-new-color"
            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              {isColorPickerOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M12 5v14M5 12h14" />
              )}
            </svg>
          </button>
        </div>

        {isColorPickerOpen && (
          <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-5 gap-2 animate-in fade-in zoom-in-95 duration-200">
            {COLORS.map(c => (
              <button
                key={c.name}
                onClick={() => {
                  setSelectedColor(c.name);
                  setIsColorPickerOpen(false);
                }}
                className={`w-full aspect-square rounded-full ${c.dot} transition-all hover:scale-110 active:scale-90 ${selectedColor === c.name ? 'ring-2 ring-offset-1 ' + c.ring : ''}`}
                title={c.name}
              />
            ))}
          </div>
        )}

        {selectionStart && selectionEnd && (
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <Input
              value={highlightName}
              onChange={e => setHighlightName(e.target.value)}
              placeholder="Highlight name (max 60 chars)"
              maxLength={60}
              onKeyDown={e => e.key === 'Enter' && handleCreateHighlight()}
            />
            <div className="text-xs text-gray-500">
              {(() => {
                const s = selectionStart.getTime() < selectionEnd.getTime() ? selectionStart : selectionEnd;
                const e = selectionStart.getTime() < selectionEnd.getTime() ? selectionEnd : selectionStart;
                return `${toLocalMidnight(s).toLocaleDateString()} - ${toLocalMidnight(e).toLocaleDateString()}`;
              })()}
            </div>
            {createError && <p className="text-xs text-red-500">{createError}</p>}
            <Button
              onClick={handleCreateHighlight}
              isLoading={isCreatingHighlight}
              disabled={!highlightName.trim()}
              size="sm"
              fullWidth
            >
              Add Highlight
            </Button>
          </div>
        )}

        {!selectionStart && (
          <div className="text-xs text-gray-500 text-center py-4">
            Drag on the calendar to select dates
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Highlights</h4>
        {highlights
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .map(h => {
            const colorClasses = getColorClasses(h.color);
            return (
              <div
                key={h.id}
                className={`p-2 rounded-lg ${colorClasses.bg} border ${colorClasses.border} cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={() => onHighlightClick(h)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold ${colorClasses.text} truncate`}>
                      {h.title}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {parseISOLocal(h.startDate).toLocaleDateString()} - {parseISOLocal(h.endDate).toLocaleDateString() }
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteHighlight(h.id); }}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
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
      <div ref={calendarRef} className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {MONTHS.map((_, i) => renderMonth(i))}
        </div>
      </div>
      {renderRightPanel()}
    </div>
  );
}