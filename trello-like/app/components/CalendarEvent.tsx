"use client";
import { parseISOLocal } from '@/lib/date-utils';
import { getColorByName, HIGHLIGHT_COLORS } from '@/lib/highlight-colors';

interface Highlight {
  id: string;
  title: string;
  color: string;
  startDate: string;
  endDate: string;
}

interface CalendarEventProps {
  highlight: Highlight;
  onDelete: (id: string) => void;
  onClick: (highlight: Highlight) => void;
}

export function CalendarEvent({ highlight, onDelete, onClick }: CalendarEventProps) {
  const getColorClasses = (colorName: string) => {
    const color = getColorByName(colorName);
    return color || HIGHLIGHT_COLORS[0];
  };

  const colorClasses = getColorClasses(highlight.color);

  return (
    <div
      className={`p-2 rounded-lg ${colorClasses.bg} border ${colorClasses.border} cursor-pointer hover:opacity-80 transition-opacity`}
      onClick={() => onClick(highlight)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-semibold ${colorClasses.text} truncate`}>
            {highlight.title}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {parseISOLocal(highlight.startDate).toLocaleDateString()} - {parseISOLocal(highlight.endDate).toLocaleDateString()}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(highlight.id);
          }}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default CalendarEvent;
