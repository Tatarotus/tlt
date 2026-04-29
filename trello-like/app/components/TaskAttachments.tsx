"use client";
import { useState } from 'react';
import { Task } from '@/lib/types';
import { TimerButton } from './TimerButton';
import { createColoredLabel, LABEL_COLOR_OPTIONS, LabelColorName, parseLabel } from '@/lib/labels';

interface TaskAttachmentsProps {
  task: Task;
  selectedLabels: string[];
  subtasks: Task[];
  proposedSubtaskTitles: string[];
  onLabelsChange: (_labels: string[]) => void;
  onSubtasksChange: (_subtasks: Task[]) => void;
  onProposedSubtasksChange: (_titles: string[]) => void;
  onDrillDown: (_task: Task) => void;
  onToggleSubtaskCompleted: (_subtaskId: string, _e: React.MouseEvent) => Promise<void>;
  onDeleteSubtask: (_subtaskId: string, _e: React.MouseEvent) => Promise<void>;
  onAddSubtask: (_e: React.FormEvent) => Promise<void>;
  onNewSubtaskTitleChange: (_title: string) => void;
  newSubtaskTitle: string;
  isAddingSubtask: boolean;
  setIsAddingSubtask: (_value: boolean) => void;
  layout?: 'subtasks-only' | 'labels-timer';
}

export function TaskAttachments({
  task,
  selectedLabels,
  subtasks,
  proposedSubtaskTitles,
  onLabelsChange,
  onProposedSubtasksChange,
  onDrillDown,
  onToggleSubtaskCompleted,
  onDeleteSubtask,
  onAddSubtask,
  onNewSubtaskTitleChange,
  newSubtaskTitle,
  isAddingSubtask,
  setIsAddingSubtask,
  layout = 'subtasks-only',
}: TaskAttachmentsProps) {
  const [newLabelText, setNewLabelText] = useState('');
  const [newLabelColor, setNewLabelColor] = useState<LabelColorName>(LABEL_COLOR_OPTIONS[0].name);

  const removeLabel = (labelName: string) => {
    onLabelsChange(selectedLabels.filter((l) => l !== labelName));
  };

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newLabelText.trim();
    if (!trimmed) return;

    const nextLabel = createColoredLabel(newLabelColor, trimmed);
    const labelExists = selectedLabels.some((label) => {
      const parsed = parseLabel(label);
      return parsed.text.toLowerCase() === trimmed.toLowerCase() && parsed.colorName === newLabelColor;
    });

    if (!labelExists) {
      onLabelsChange([...selectedLabels, nextLabel]);
    }
    setNewLabelText('');
  };

  if (layout === 'labels-timer') {
    return (
      <div className="space-y-8">
        <section className="space-y-4">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Labels</h4>
          <div className="space-y-4">
            <form onSubmit={handleAddLabel} className="space-y-3 p-4 rounded-2xl border-2 border-gray-100 bg-white/50 backdrop-blur-sm">
              <input
                className="w-full rounded-xl border-2 border-gray-100 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 transition-all"
                placeholder="New label..."
                value={newLabelText}
                onChange={(e) => setNewLabelText(e.target.value)}
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {LABEL_COLOR_OPTIONS.map((label) => {
                    const isSelected = newLabelColor === label.name;
                    return (
                      <button
                        key={label.name}
                        type="button"
                        onClick={() => setNewLabelColor(label.name)}
                        className={`${label.className} h-6 w-6 rounded-lg transition-all hover:scale-110 cursor-pointer ${
                          isSelected ? 'ring-2 ring-offset-2 ring-blue-500 scale-110 shadow-md' : 'opacity-60 hover:opacity-100'
                        }`}
                      />
                    );
                  })}
                </div>
                <button 
                  type="submit" 
                  disabled={!newLabelText.trim()}
                  className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
            </form>

            {selectedLabels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedLabels.map((label) => {
                  const parsed = parseLabel(label);
                  return (
                    <div
                      key={label}
                      className="group h-8 max-w-full overflow-hidden rounded-lg border-2 border-gray-100 bg-white text-xs font-bold text-gray-700 flex items-center transition-all hover:border-gray-200"
                    >
                      <span className={`${parsed.colorClass} h-full w-2 shrink-0`} />
                      <span className="truncate px-2.5 py-1">{parsed.text}</span>
                      <button
                        onClick={() => removeLabel(label)}
                        className="h-full px-2 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer border-l border-gray-50"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Tracking</h4>
          <TimerButton cardId={task.id} cardTitle={task.title} className="w-full !rounded-2xl !py-4 !shadow-none !border-2 !border-gray-100 !bg-white hover:!bg-gray-50 !text-gray-700 !font-bold" />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subtasks.map((st) => (
        <div
          key={st.id}
          onClick={() => onDrillDown(st)}
          className="group flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-50 hover:border-blue-100 hover:bg-blue-50/30 cursor-pointer transition-all animate-in fade-in slide-in-from-left-2 duration-300"
        >
          <button
            onClick={(e) => onToggleSubtaskCompleted(st.id, e)}
            className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
              st.completed
                ? 'bg-green-500 border-green-500 text-white shadow-sm shadow-green-200'
                : 'border-gray-200 hover:border-blue-400 bg-white'
            }`}
          >
            {st.completed && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              {st.labels && st.labels.length > 0 &&
                st.labels.map((l) => {
                  const parsed = parseLabel(l);
                  return <div key={l} title={parsed.text} className={`${parsed.colorClass} h-1.5 w-8 rounded-full shadow-sm`} />;
                })}
            </div>
            <span
              className={`text-base block truncate transition-all ${st.completed ? 'line-through text-gray-400 opacity-60' : 'text-gray-700 font-bold'}`}
            >
              {st.title}
            </span>
          </div>

          <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
            {st.dueDate && (
              <span className="text-[11px] font-black text-blue-600 uppercase bg-blue-100 px-2 py-1 rounded-lg">
                {new Date(st.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
            <button
              onClick={(e) => onDeleteSubtask(st.id, e)}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
            <svg className="text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      ))}

      {proposedSubtaskTitles.map((title, i) => (
        <div
          key={`proposed-${i}`}
          className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/20 animate-in fade-in slide-in-from-left-2"
        >
          <div className="w-6 h-6 rounded-lg border-2 border-blue-300 bg-white flex items-center justify-center text-blue-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span className="text-base text-blue-700 font-bold flex-1 italic">{title} (Proposed)</span>
          <button
            onClick={() => onProposedSubtasksChange(proposedSubtaskTitles.filter((_, idx) => idx !== i))}
            className="p-2 text-blue-300 hover:text-red-500 transition-all cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      {isAddingSubtask ? (
        <form
          onSubmit={onAddSubtask}
          className="mt-4 flex flex-col gap-3 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 animate-in zoom-in-95 duration-200"
        >
          <input
            autoFocus
            className="w-full p-3 rounded-xl border-2 border-gray-100 text-base font-semibold outline-none focus:border-blue-500 transition-all"
            placeholder="What needs to be done?"
            value={newSubtaskTitle}
            onChange={(e) => onNewSubtaskTitleChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setIsAddingSubtask(false)}
          />
          <div className="flex justify-end gap-2.5">
            <button 
              type="button" 
              onClick={() => setIsAddingSubtask(false)}
              className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-500/10 transition-all cursor-pointer"
            >
              Add Sub-task
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAddingSubtask(true)}
          className="mt-4 w-full flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-base font-bold cursor-pointer group"
        >
          <div className="p-1 bg-gray-100 group-hover:bg-blue-100 rounded-lg transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          Add a sub-task
        </button>
      )}
    </div>
  );
}

export default TaskAttachments;
