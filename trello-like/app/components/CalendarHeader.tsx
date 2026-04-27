"use client";
import { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { HIGHLIGHT_COLORS, getColorByName } from '@/lib/highlight-colors';
import { toLocalMidnight, toISOLocalDate, parseISOLocal, isDateInRange } from '@/lib/date-utils';

interface Highlight {
  id: string;
  title: string;
  color: string;
  startDate: string;
  endDate: string;
}

interface CalendarHeaderProps {
  currentYear: number;
  selectedColor: string;
  highlightName: string;
  selectionStart: Date | null;
  selectionEnd: Date | null;
  isCreatingHighlight: boolean;
  createError: string | null;
  isColorPickerOpen: boolean;
  onSelectedColorChange: (color: string) => void;
  onHighlightNameChange: (name: string) => void;
  onIsCreatingHighlightChange: (value: boolean) => void;
  onCreateHighlight: () => void;
  onIsColorPickerOpenChange: (value: boolean) => void;
}

export function CalendarHeader({
  currentYear,
  selectedColor,
  highlightName,
  selectionStart,
  selectionEnd,
  isCreatingHighlight,
  createError,
  isColorPickerOpen,
  onSelectedColorChange,
  onHighlightNameChange,
  onIsCreatingHighlightChange,
  onCreateHighlight,
  onIsColorPickerOpenChange,
}: CalendarHeaderProps) {
  const getColorClasses = (colorName: string) => {
    const color = getColorByName(colorName);
    return color || HIGHLIGHT_COLORS[0];
  };

  return (
    <div className="w-72 border-l border-gray-200 bg-white p-4 flex flex-col h-full">
      <h3 className="text-sm font-bold text-gray-900 mb-4">New Highlight</h3>

      <div className="space-y-3 mb-6">
        <div className="flex flex-wrap gap-1.5 items-center">
          {HIGHLIGHT_COLORS.slice(0, 5).map((c) => (
            <button
              key={c.name}
              onClick={() => onSelectedColorChange(c.name)}
              className={`w-6 h-6 rounded-full ${c.dot} transition-all ${
                selectedColor === c.name ? 'ring-2 ring-offset-2 ' + c.ring : 'opacity-50 hover:opacity-100'
              }`}
              title={c.name}
            />
          ))}

          {HIGHLIGHT_COLORS.slice(5).find((c) => c.name === selectedColor) && (
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
            className={`w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center transition-all hover:bg-gray-50 active:scale-95 ${
              isColorPickerOpen ? 'bg-gray-100 opacity-100' : 'opacity-50 hover:opacity-100'
            }`}
            title="add-new-color"
            onClick={() => onIsColorPickerOpenChange(!isColorPickerOpen)}
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
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  onSelectedColorChange(c.name);
                  onIsColorPickerOpenChange(false);
                }}
                className={`w-full aspect-square rounded-full ${c.dot} transition-all hover:scale-110 active:scale-90 ${
                  selectedColor === c.name ? 'ring-2 ring-offset-1 ' + c.ring : ''
                }`}
                title={c.name}
              />
            ))}
          </div>
        )}

        {selectionStart && selectionEnd && (
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <Input
              value={highlightName}
              onChange={(e) => onHighlightNameChange(e.target.value)}
              placeholder="Highlight name (max 60 chars)"
              maxLength={60}
              onKeyDown={(e) => e.key === 'Enter' && onCreateHighlight()}
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
              onClick={onCreateHighlight}
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
      </div>
    </div>
  );
}

export default CalendarHeader;
