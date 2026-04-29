"use client";
import { Button } from './ui/Button';
import { Task } from '@/lib/types';

interface TaskActionsProps {
  task: Task;
  isSaving: boolean;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
  proposedSubtaskTitles: string[];
  onProposedSubtasksSave: () => void;
  layout?: 'sidebar' | 'footer';
}

export function TaskActions({
  onDelete,
  proposedSubtaskTitles,
  onProposedSubtasksSave,
}: TaskActionsProps) {
  return (
    <div className="flex flex-col gap-6">
      {proposedSubtaskTitles.length > 0 && (
        <section className="space-y-3">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">AI Suggestions</h4>
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer"
            onClick={onProposedSubtasksSave}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add {proposedSubtaskTitles.length} Suggested Tasks
          </button>
        </section>
      )}

      <section className="space-y-3">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Danger Zone</h4>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl border-2 border-transparent hover:border-red-100 font-bold text-sm transition-all cursor-pointer group"
          onClick={onDelete}
        >
          <div className="p-1.5 bg-red-50 group-hover:bg-red-100 rounded-lg transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </div>
          Delete Task
        </button>
      </section>
    </div>
  );
}

export default TaskActions;
