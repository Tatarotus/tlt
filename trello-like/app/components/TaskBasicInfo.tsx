"use client";
import { memo } from 'react';
import { Input } from './ui/Input';
import { Task } from '@/lib/types';

interface TaskBasicInfoProps {
  task: Task;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  onTitleChange: (_title: string) => void;
  onDescriptionChange: (_description: string) => void;
  onDueDateChange: (_dueDate: string) => void;
  onCompletedChange: (_e: React.MouseEvent) => void;
  layout?: 'main' | 'sidebar';
}

function TaskBasicInfoComponent({
  title,
  description,
  dueDate,
  completed,
  onTitleChange,
  onDescriptionChange,
  onDueDateChange,
  onCompletedChange,
  layout = 'main',
}: TaskBasicInfoProps) {
  if (layout === 'sidebar') {
    return (
      <div className="space-y-6">
        <section className="space-y-3">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Status</h4>
          <button
            onClick={onCompletedChange}
            className={`w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer font-bold text-sm ${
              completed
                ? 'bg-green-50 border-green-200 text-green-700 shadow-sm shadow-green-100'
                : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
            }`}>
              {completed && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            {completed ? 'Task Completed' : 'Mark as Complete'}
          </button>
        </section>

        <section className="space-y-3">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Due Date</h4>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <input
              type="date"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-semibold text-gray-700 bg-white transition-all cursor-pointer"
              value={dueDate}
              onChange={(e) => onDueDateChange(e.target.value)}
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-1">
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] ml-1">Title</label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Task title..."
          className={`text-3xl font-black text-gray-900 border-none px-0 focus:ring-0 h-auto py-1 placeholder:text-gray-200 tracking-tight transition-all ${completed ? 'line-through text-gray-400 opacity-60' : ''}`}
        />
      </section>

      <section className="space-y-4">
        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2.5">
          <div className="p-1.5 bg-gray-100 text-gray-600 rounded-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          Description
        </h4>
        <div className="relative group">
          <textarea
            className="w-full min-h-[160px] p-4 rounded-2xl border-2 border-gray-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-base text-gray-700 leading-relaxed resize-none bg-gray-50/50 hover:bg-gray-50 focus:bg-white transition-all"
            placeholder="Add a more detailed description..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
      </section>
    </div>
  );
}

function areTaskBasicInfoPropsEqual(prev: TaskBasicInfoProps, next: TaskBasicInfoProps) {
  if (prev.layout !== next.layout) return false;

  if (next.layout === 'sidebar') {
    return (
      prev.dueDate === next.dueDate &&
      prev.completed === next.completed &&
      prev.onDueDateChange === next.onDueDateChange &&
      prev.onCompletedChange === next.onCompletedChange
    );
  }

  return (
    prev.title === next.title &&
    prev.description === next.description &&
    prev.completed === next.completed &&
    prev.onTitleChange === next.onTitleChange &&
    prev.onDescriptionChange === next.onDescriptionChange
  );
}

export const TaskBasicInfo = memo(TaskBasicInfoComponent, areTaskBasicInfoPropsEqual);
TaskBasicInfo.displayName = 'TaskBasicInfo';

export default TaskBasicInfo;
