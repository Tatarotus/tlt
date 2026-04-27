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
}

export function TaskActions({
  task,
  isSaving,
  onSave,
  onDelete,
  onCancel,
  proposedSubtaskTitles,
  onProposedSubtasksSave,
}: TaskActionsProps) {
  return (
    <div className="flex flex-col gap-3">
      <section className="space-y-2">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Actions</h4>
        <Button
          variant="danger"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onDelete}
        >
          <svg className="mr-2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
          Delete Task
        </Button>
      </section>

      {proposedSubtaskTitles.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Pending AI Suggestions</h4>
          <Button
            size="sm"
            className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onProposedSubtasksSave}
          >
            <svg className="mr-2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add {proposedSubtaskTitles.length} Proposed Sub-tasks
          </Button>
        </section>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} isLoading={isSaving} className="px-8 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-md">
          Save changes
        </Button>
      </div>
    </div>
  );
}

export default TaskActions;
