"use client";
import { Input } from './ui/Input';
import { Task } from '@/lib/types';

interface TaskBasicInfoProps {
  task: Task;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onDueDateChange: (dueDate: string) => void;
  onCompletedChange: (e: React.MouseEvent) => void;
}

export function TaskBasicInfo({
  task,
  title,
  description,
  dueDate,
  completed,
  onTitleChange,
  onDescriptionChange,
  onDueDateChange,
  onCompletedChange,
}: TaskBasicInfoProps) {
  return (
    <div className="space-y-6">
      <section>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Title</label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={`text-xl font-bold text-gray-900 border-none px-0 focus:ring-0 h-auto py-0 ${completed ? 'line-through text-gray-400' : ''}`}
        />
      </section>

      <section>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Description
        </h4>
        <textarea
          className="w-full min-h-[120px] p-3 rounded-lg border border-gray-200 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none text-sm text-gray-900 resize-none bg-gray-50/50"
          placeholder="Add a more detailed description..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </section>

      <section>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Due Date
        </h4>
        <input
          type="date"
          className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none text-sm text-gray-900 bg-gray-50/50"
          value={dueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
        />
      </section>

      <section className="pt-4">
        <button
          onClick={onCompletedChange}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
            completed
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {completed ? 'Completed' : 'Mark as Complete'}
        </button>
      </section>
    </div>
  );
}

export default TaskBasicInfo;
