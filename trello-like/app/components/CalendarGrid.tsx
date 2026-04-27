"use client";
import { CalendarDay } from './CalendarDay';
import { CalendarHeader } from './CalendarHeader';

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

export function CalendarGrid({
  currentYear,
  highlights,
  selectionStart,
  selectionEnd,
  taskDots,
  isDragging,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onHighlightClick,
}: CalendarGridProps) {
  const renderMonth = (monthIndex: number) => {
    const year = currentYear;
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, monthIndex, i));

    return (
      <div key={monthIndex} className="flex-1 min-w-[200px]">
        <div className="text-xs font-semibold text-gray-600 mb-2 px-1">
          {MONTHS[monthIndex]}
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-[10px]">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-gray-400 font-medium py-1">
              {d}
            </div>
          ))}
          {days.map((date, i) => (
            <CalendarDay
              key={date ? date.toISOString() : `empty-${i}`}
              date={date}
              highlights={highlights}
              selectionStart={selectionStart}
              selectionEnd={selectionEnd}
              taskDots={taskDots}
              isDragging={isDragging}
              onMouseDown={onMouseDown}
              onMouseEnter={onMouseEnter}
              onMouseUp={onMouseUp}
              onHighlightClick={onHighlightClick}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MONTHS.map((_, i) => renderMonth(i))}
      </div>
    </div>
  );
}

export default CalendarGrid;
