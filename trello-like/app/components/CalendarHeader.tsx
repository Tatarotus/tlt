"use client";
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { HIGHLIGHT_COLORS, getColorByName } from '@/lib/highlight-colors';
import { toLocalMidnight } from '@/lib/date-utils';

interface CalendarHeaderProps {
  currentYear: number;
  selectedColor: string;
  highlightName: string;
  selectionStart: Date | null;
  selectionEnd: Date | null;
  isCreatingHighlight: boolean;
  createError: string | null;
  isColorPickerOpen: boolean;
  onSelectedColorChange: (_color: string) => void;
  onHighlightNameChange: (_name: string) => void;
  onIsCreatingHighlightChange: (_value: boolean) => void;
  onCreateHighlight: () => void;
  onIsColorPickerOpenChange: (_value: boolean) => void;
}

interface ColorSelectorProps {
  selectedColor: string;
  onSelectedColorChange: (_color: string) => void;
  isColorPickerOpen: boolean;
  onIsColorPickerOpenChange: (_value: boolean) => void;
}

function ColorSelector({ selectedColor, onSelectedColorChange, isColorPickerOpen, onIsColorPickerOpenChange }: ColorSelectorProps) {
  const getColorClasses = (colorName: string) => getColorByName(colorName) || HIGHLIGHT_COLORS[0];
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {HIGHLIGHT_COLORS.slice(0, 5).map((c) => (
        <button key={c.name} onClick={() => onSelectedColorChange(c.name)} className={`w-6 h-6 rounded-full ${c.dot} transition-all ${selectedColor === c.name ? 'ring-2 ring-offset-2 ' + c.ring : 'opacity-50 hover:opacity-100'}`} title={c.name} />
      ))}
      {HIGHLIGHT_COLORS.slice(5).find((c) => c.name === selectedColor) && (
        <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
          <div className="w-px h-4 bg-gray-200 mx-0.5" /><button onClick={() => {}} className={`w-6 h-6 rounded-full ${getColorClasses(selectedColor).dot} ring-2 ring-offset-2 ${getColorClasses(selectedColor).ring}`} title={selectedColor} />
        </div>
      )}
      <button className={`w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center transition-all hover:bg-gray-50 active:scale-95 ${isColorPickerOpen ? 'bg-gray-100 opacity-100' : 'opacity-50 hover:opacity-100'}`} title="add-new-color" onClick={() => onIsColorPickerOpenChange(!isColorPickerOpen)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">{isColorPickerOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M12 5v14M5 12h14" />}</svg>
      </button>
    </div>
  );
}

interface DateSelectionFormProps {
  selectionStart: Date | null;
  selectionEnd: Date | null;
  highlightName: string;
  onHighlightNameChange: (_name: string) => void;
  onCreateHighlight: () => void;
  createError: string | null;
  isCreatingHighlight: boolean;
}

function DateSelectionForm({ selectionStart, selectionEnd, highlightName, onHighlightNameChange, onCreateHighlight, createError, isCreatingHighlight }: DateSelectionFormProps) {
  if (!selectionStart || !selectionEnd) return null;
  const s = selectionStart.getTime() < selectionEnd.getTime() ? selectionStart : selectionEnd;
  const e = selectionStart.getTime() < selectionEnd.getTime() ? selectionEnd : selectionStart;
  return (
    <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <Input value={highlightName} onChange={(e) => onHighlightNameChange(e.target.value)} placeholder="Highlight name (max 60 chars)" maxLength={60} onKeyDown={(ev) => ev.key === 'Enter' && onCreateHighlight()} />
      <div className="text-xs text-gray-500">{toLocalMidnight(s).toLocaleDateString()} - {toLocalMidnight(e).toLocaleDateString()}</div>
      {createError && <p className="text-xs text-red-500">{createError}</p>}
      <Button onClick={onCreateHighlight} isLoading={isCreatingHighlight} disabled={!highlightName.trim()} size="sm" fullWidth>Add Highlight</Button>
    </div>
  );
}

export function CalendarHeader({
  selectedColor, highlightName, selectionStart, selectionEnd, isCreatingHighlight, createError, isColorPickerOpen, onSelectedColorChange, onHighlightNameChange, onCreateHighlight, onIsColorPickerOpenChange,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col shrink-0">
      <h3 className="text-sm font-bold text-gray-900 mb-4">New Highlight</h3>
      <div className="space-y-3 mb-6">
        <ColorSelector selectedColor={selectedColor} onSelectedColorChange={onSelectedColorChange} isColorPickerOpen={isColorPickerOpen} onIsColorPickerOpenChange={onIsColorPickerOpenChange} />
        {isColorPickerOpen && (
          <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-5 gap-2 animate-in fade-in zoom-in-95 duration-200">
            {HIGHLIGHT_COLORS.map((c) => (
              <button key={c.name} onClick={() => { onSelectedColorChange(c.name); onIsColorPickerOpenChange(false); }} className={`w-full aspect-square rounded-full ${c.dot} transition-all hover:scale-110 active:scale-90 ${selectedColor === c.name ? 'ring-2 ring-offset-1 ' + c.ring : ''}`} title={c.name} />
            ))}
          </div>
        )}
        {selectionStart && selectionEnd ? (
          <DateSelectionForm selectionStart={selectionStart} selectionEnd={selectionEnd} highlightName={highlightName} onHighlightNameChange={onHighlightNameChange} onCreateHighlight={onCreateHighlight} createError={createError} isCreatingHighlight={isCreatingHighlight} />
        ) : <div className="text-xs text-gray-500 text-center py-4">Drag on the calendar to select dates</div>}
      </div>
      <div className="pb-2"><h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Highlights</h4></div>
    </div>
  );
}

export default CalendarHeader;
