import React from 'react';
import { Task } from '@/lib/types';
import { TaskBreadcrumbs } from './TaskBreadcrumbs';

interface TaskDetailHeaderProps {
  taskStack: Task[];
  goBack: () => void;
  handleBreadcrumbNavigate: (_index: number) => void;
  onClose: () => void;
}

export function TaskDetailHeader({
  taskStack,
  goBack,
  handleBreadcrumbNavigate,
  onClose,
}: TaskDetailHeaderProps) {
  return (
    <div className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0">
      <TaskBreadcrumbs 
        taskStack={taskStack} 
        onBack={goBack} 
        onNavigate={handleBreadcrumbNavigate} 
      />
      <button
        onClick={onClose}
        className="ml-4 p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-200 transition-all cursor-pointer shrink-0"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
