"use client";
import { toLocalMidnight, parseISOLocal, isDateInRange } from '@/lib/date-utils';
import { getColorByName, HIGHLIGHT_COLORS } from '@/lib/highlight-colors';

interface Highlight {
  id: string;
  title: string;
  color: string;
  startDate: string;
  endDate: string;
}

interface CalendarDayProps {
  date: Date | null;
  highlights: Highlight[];
  selectionStart: Date | null;
  selectionEnd: Date | null;
  taskDots: { taskId: string; title: string; dueDate: string }[];
  _isDragging: boolean;
  onMouseDown: (_date: Date) => void;
  onMouseEnter: (_date: Date) => void;
  onMouseUp: () => void;
  onHighlightClick: (_highlight: Highlight) => void;
}

function getSelectionRange(start: Date | null, end: Date | null) {
  if (!start || !end) return null;
  return { s: start.getTime() < end.getTime() ? start : end, e: start.getTime() < end.getTime() ? end : start };
}

export function CalendarDay({
  date, highlights, selectionStart, selectionEnd, taskDots, onMouseDown, onMouseEnter, onMouseUp, onHighlightClick,
}: CalendarDayProps) {
  if (!date) return <div />;
  const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  const d = toLocalMidnight(date);
  const range = getSelectionRange(selectionStart, selectionEnd);
  const dayHighlights = highlights.filter((h) => isDateInRange(d, parseISOLocal(h.startDate), parseISOLocal(h.endDate)));
  const inSelection = range ? isDateInRange(date, range.s, range.e) : false;
  const taskDotsForDay = taskDots.filter((t) => isSameDay(parseISOLocal(t.dueDate), date));
  const hasHighlight = dayHighlights.length > 0;
  const primary = dayHighlights[0];
  const isToday = isSameDay(date, new Date());
  const color = hasHighlight ? (getColorByName(primary.color) || HIGHLIGHT_COLORS[0]) : null;
  const highlightClasses = color ? `${color.bg} ${inSelection ? 'ring-2 ring-offset-1 ' + color.ring : ''}` : 'hover:bg-gray-50';
  const selectionClasses = inSelection && !color ? 'bg-blue-50 ring-2 ring-blue-400' : '';
  const todayClasses = isToday && !color && !inSelection ? 'ring-1 ring-gray-300' : '';
  const textClasses = color ? color.text : 'text-gray-600';
  const fontWeight = isToday ? 'font-bold' : '';

  return (
    <div
      className={`relative h-7 flex items-center justify-center cursor-pointer rounded-sm transition-all duration-100 ${highlightClasses} ${selectionClasses} ${todayClasses}`}
      onMouseDown={() => onMouseDown(date)} onMouseEnter={() => onMouseEnter(date)} onMouseUp={onMouseUp} onClick={() => hasHighlight && onHighlightClick(primary)}
    >
      <span className={`${textClasses} ${fontWeight}`}>{date.getDate()}</span>
      {taskDotsForDay.length > 0 && (
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
          {taskDotsForDay.slice(0, 3).map((t, i) => <div key={i} className="w-1 h-1 rounded-full bg-gray-500" title={t.title} />)}
        </div>
      )}
    </div>
  );
}

export default CalendarDay;
