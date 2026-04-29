"use client";
import { useState as _useState } from 'react';
import { Button } from './ui/Button';
import { Task } from '@/lib/types';
import { TimerButton } from './TimerButton';

const AVAILABLE_LABELS = [
  { name: 'Green', color: 'bg-green-500' },
  { name: 'Yellow', color: 'bg-yellow-500' },
  { name: 'Red', color: 'bg-red-500' },
  { name: 'Blue', color: 'bg-blue-500' },
  { name: 'Purple', color: 'bg-purple-500' },
];

const LABEL_COLOR_MAP: Record<string, string> = {
  'Green': 'bg-green-500',
  'Yellow': 'bg-yellow-500',
  'Red': 'bg-red-500',
  'Blue': 'bg-blue-500',
  'Purple': 'bg-purple-500',
};

interface TaskAttachmentsProps {
  task: Task;
  selectedLabels: string[];
  subtasks: Task[];
  proposedSubtaskTitles: string[];
  onLabelsChange: (_labels: string[]) => void;
  _onSubtasksChange: (_subtasks: Task[]) => void;
  onProposedSubtasksChange: (_titles: string[]) => void;
  onDrillDown: (_task: Task) => void;
  onToggleSubtaskCompleted: (_subtaskId: string, _e: React.MouseEvent) => Promise<void>;
  onDeleteSubtask: (_subtaskId: string, _e: React.MouseEvent) => Promise<void>;
  onAddSubtask: (_e: React.FormEvent) => Promise<void>;
  onNewSubtaskTitleChange: (_title: string) => void;
  newSubtaskTitle: string;
  isAddingSubtask: boolean;
  setIsAddingSubtask: (_value: boolean) => void;
}

export function TaskAttachments({
  task,
  selectedLabels,
  subtasks,
  proposedSubtaskTitles,
  onLabelsChange,
  _onSubtasksChange,
  onProposedSubtasksChange,
  onDrillDown,
  onToggleSubtaskCompleted,
  onDeleteSubtask,
  onAddSubtask,
  onNewSubtaskTitleChange,
  newSubtaskTitle,
  isAddingSubtask,
  setIsAddingSubtask,
}: TaskAttachmentsProps) {
  const toggleLabel = (labelName: string) => {
    const newLabels = selectedLabels.includes(labelName)
      ? selectedLabels.filter((l) => l !== labelName)
      : [...selectedLabels, labelName];
    onLabelsChange(newLabels);
  };

  return (
    <div className="space-y-8">
      <section>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" />
          </svg>
          Labels
        </h4>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_LABELS.map((label) => {
            const isSelected = selectedLabels.includes(label.name);
            return (
              <button
                key={label.name}
                onClick={() => toggleLabel(label.name)}
                className={`${label.color} h-8 px-3 rounded-md text-xs font-bold text-white transition-all flex items-center gap-2 hover:brightness-90 cursor-pointer ${
                  isSelected ? 'ring-2 ring-offset-2 ring-gray-400' : 'opacity-60 hover:opacity-100'
                }`}
              >
                {label.name}
                {isSelected && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
            );
          })}
          {selectedLabels.filter((l) => !LABEL_COLOR_MAP[l]).map((label) => (
            <div
              key={label}
              className="bg-gray-100 text-gray-700 h-8 px-3 rounded-md text-xs font-bold flex items-center gap-2 border border-gray-200"
            >
              {label}
              <button
                onClick={() => toggleLabel(label)}
                className="hover:text-red-500 cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h12" />
            </svg>
            Sub-tasks
          </h4>
          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {subtasks.length + proposedSubtaskTitles.length}
          </span>
        </div>
        <div className="space-y-1">
          {subtasks.map((st) => (
            <div
              key={st.id}
              onClick={() => onDrillDown(st)}
              className="group flex items-center gap-3 p-2 rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 cursor-pointer transition-all"
            >
              <button
                onClick={(e) => onToggleSubtaskCompleted(st.id, e)}
                className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                  st.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              >
                {st.completed && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  {st.labels && st.labels.length > 0 &&
                    st.labels.map((l) => (
                      <div key={l} className={`${LABEL_COLOR_MAP[l] || 'bg-gray-300'} h-1 w-6 rounded-full`} />
                    ))}
                </div>
                <span
                  className={`text-sm block truncate ${st.completed ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}
                >
                  {st.title}
                </span>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {st.dueDate && (
                  <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
                    {new Date(st.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                )}
                <button
                  onClick={(e) => onDeleteSubtask(st.id, e)}
                  className="p-1 text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
                <svg className="text-gray-300" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
          ))}

          {proposedSubtaskTitles.map((title, i) => (
            <div
              key={`proposed-${i}`}
              className="flex items-center gap-3 p-2 rounded-lg border border-blue-50 bg-blue-50/30 animate-in fade-in slide-in-from-left-1"
            >
              <div className="w-5 h-5 rounded border border-blue-200 bg-white flex items-center justify-center text-blue-400">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <span className="text-sm text-blue-700 font-medium flex-1 italic">{title} (Proposed)</span>
              <button
                onClick={() => onProposedSubtasksChange(proposedSubtaskTitles.filter((_, idx) => idx !== i))}
                className="p-1 text-blue-300 hover:text-red-500 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {isAddingSubtask ? (
            <form
              onSubmit={onAddSubtask}
              className="mt-2 flex flex-col gap-2 p-2 bg-gray-50 rounded-lg border border-dashed border-gray-300"
            >
              <input
                autoFocus
                className="w-full p-2 rounded border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-gray-900/5"
                placeholder="What needs to be done?"
                value={newSubtaskTitle}
                onChange={(e) => onNewSubtaskTitleChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setIsAddingSubtask(false)}
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" type="button" onClick={() => setIsAddingSubtask(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit">
                  Add Sub-task
                </Button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingSubtask(true)}
              className="mt-2 w-full flex items-center gap-2 p-2 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all text-sm font-medium cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add a sub-task
            </button>
          )}
        </div>
      </section>

      <section className="pt-4 space-y-2">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Timer</h4>
        <TimerButton cardId={task.id} cardTitle={task.title} className="w-full" />
      </section>
    </div>
  );
}

export default TaskAttachments;
