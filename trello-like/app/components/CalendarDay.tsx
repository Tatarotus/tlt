"use client";
import { toLocalMidnight, parseISOLocal, isDateInRange } from '@/lib/date-utils';
import { getColorByName, HIGHLIGHT_COLORS } from '@/lib/highlight-colors';
import { CalendarEvent } from './CalendarEvent';

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
  isDragging: boolean;
  onMouseDown: (date: Date) => void;
  onMouseEnter: (date: Date) => void;
  onMouseUp: () => void;
  onHighlightClick: (highlight: Highlight) => void;
}

export function CalendarDay({
  date,
  highlights,
  selectionStart,
  selectionEnd,
  taskDots,
  isDragging,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onHighlightClick,
}: CalendarDayProps) {
  if (!date) return <div />;

  const getColorClasses = (colorName: string) => {
    const color = getColorByName(colorName);
    return color || HIGHLIGHT_COLORS[0];
  };

  const isSameDay = (d1: Date, d2: Date): boolean => {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  };

  const dayHighlights = highlights.filter((h) => {
    const d = toLocalMidnight(date);
    const start = parseISOLocal(h.startDate);
    const end = parseISOLocal(h.endDate);
    return isDateInRange(d, start, end);
  });

  const isInSelection = (): boolean => {
    if (!selectionStart || !selectionEnd) return false;
    const s = selectionStart.getTime() < selectionEnd.getTime() ? selectionStart : selectionEnd;
    const e = selectionStart.getTime() < selectionEnd.getTime() ? selectionEnd : selectionStart;
    return isDateInRange(date, s, e);
  };

  const taskDotsForDay = taskDots.filter((t) => {
    const d = new Date(t.dueDate);
    return isSameDay(d, date);
  });

  const hasHighlight = dayHighlights.length > 0;
  const primaryHighlight = dayHighlights[0];
  const colorClasses = hasHighlight ? getColorClasses(primaryHighlight.color) : null;
  const inSelection = isInSelection();
  const isToday = isSameDay(date, new Date());

  return (
    <div
      className={`
        relative h-7 flex items-center justify-center cursor-pointer
        rounded-sm transition-all duration-100
        ${colorClasses ? `${colorClasses.bg} ${inSelection ? 'ring-2 ring-offset-1 ' + colorClasses.ring : ''}` : 'hover:bg-gray-50'}
        ${inSelection && !colorClasses ? 'bg-blue-50 ring-2 ring-blue-400' : ''}
        ${isToday && !colorClasses && !inSelection ? 'ring-1 ring-gray-300' : ''}
      `}
      onMouseDown={() => onMouseDown(date)}
      onMouseEnter={() => onMouseEnter(date)}
      onMouseUp={onMouseUp}
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
}

export default CalendarDay;
