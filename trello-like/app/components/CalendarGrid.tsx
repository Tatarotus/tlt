"use client";
import { CalendarDay } from './CalendarDay';

interface Highlight {
  id: string;
  title: string;
  color: string;
  startDate: string;
  endDate: string;
}

interface CalendarGridProps {
  currentYear: number;
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

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function MonthView({ monthIndex, currentYear, highlights, selectionStart, selectionEnd, taskDots, isDragging, onMouseDown, onMouseEnter, onMouseUp, onHighlightClick }: any) {
  const firstDay = new Date(currentYear, monthIndex, 1), lastDay = new Date(currentYear, monthIndex + 1, 0);
  const days: (Date | null)[] = Array(firstDay.getDay()).fill(null);
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(currentYear, monthIndex, i));
  return (
    <div className="flex-1 min-w-[200px]">
      <div className="text-xs font-semibold text-gray-600 mb-2 px-1">{MONTHS[monthIndex]}</div>
      <div className="grid grid-cols-7 gap-0.5 text-[10px]">
        {DAYS.map((d) => <div key={d} className="text-center text-gray-400 font-medium py-1">{d}</div>)}
        {days.map((date, i) => (
          <CalendarDay key={date ? date.toISOString() : `empty-${i}`} date={date} highlights={highlights} selectionStart={selectionStart} selectionEnd={selectionEnd} taskDots={taskDots} _isDragging={isDragging} onMouseDown={onMouseDown} onMouseEnter={onMouseEnter} onMouseUp={onMouseUp} onHighlightClick={onHighlightClick} />
        ))}
      </div>
    </div>
  );
}

export function CalendarGrid({ currentYear, highlights, selectionStart, selectionEnd, taskDots, isDragging, onMouseDown, onMouseEnter, onMouseUp, onHighlightClick }: CalendarGridProps) {
  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MONTHS.map((_, i) => (
          <MonthView key={i} monthIndex={i} currentYear={currentYear} highlights={highlights} selectionStart={selectionStart} selectionEnd={selectionEnd} taskDots={taskDots} isDragging={isDragging} onMouseDown={onMouseDown} onMouseEnter={onMouseEnter} onMouseUp={onMouseUp} onHighlightClick={onHighlightClick} />
        ))}
      </div>
    </div>
  );
}

export default CalendarGrid;
