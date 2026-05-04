"use client";
import { memo } from 'react';
import { Task } from '@/lib/types';

interface TaskBreadcrumbsProps {
  taskStack: Task[];
  onBack: () => void;
  onNavigate: (_index: number) => void;
}

function TaskBreadcrumbsComponent({ taskStack, onBack, onNavigate }: TaskBreadcrumbsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      {taskStack.length > 1 && (
        <button 
          onClick={onBack} 
          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer text-gray-500"
          title="Go back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      <div className="flex items-center gap-1.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mr-1">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <path d="M9 3v18" />
        </svg>
        {taskStack.map((t, i) => (
          <div key={t.id} className="flex items-center gap-1.5 shrink-0">
            {i > 0 && <span className="text-gray-300 text-sm">/</span>}
            <button
              onClick={() => onNavigate(i)}
              className={`text-sm font-semibold px-2 py-1 rounded-md transition-all cursor-pointer ${
                i === taskStack.length - 1
                  ? 'bg-white shadow-sm text-blue-600 border border-gray-200'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              {t.title}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function areTaskBreadcrumbsPropsEqual(prev: TaskBreadcrumbsProps, next: TaskBreadcrumbsProps) {
  return (
    prev.taskStack === next.taskStack &&
    prev.onBack === next.onBack &&
    prev.onNavigate === next.onNavigate
  );
}

export const TaskBreadcrumbs = memo(TaskBreadcrumbsComponent, areTaskBreadcrumbsPropsEqual);
TaskBreadcrumbs.displayName = 'TaskBreadcrumbs';
