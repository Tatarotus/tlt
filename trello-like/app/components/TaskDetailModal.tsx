"use client";
import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/lib/types';
import { createTask, getSubTasks, updateTask, deleteTask } from '../actions/task-actions';
import { createBatchSubtasks } from '../actions/ai-actions';
import { TaskBasicInfo } from './TaskBasicInfo';
import { TaskAIActions } from './TaskAIActions';
import { TaskAttachments } from './TaskAttachments';
import { TaskActions } from './TaskActions';
import { TaskDetailHeader } from './TaskDetailHeader';
import { TaskDetailFooter } from './TaskDetailFooter';

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (_taskId: string, _updates: Partial<Task>) => Promise<void>;
  onDelete: (_taskId: string) => Promise<void>;
  onSubtasksChange?: (_parentId: string, _subtasks: Task[]) => void;
  calendarHighlightId?: string;
}

export function TaskDetailModal({ task: initialTask, isOpen, onClose, onSave, onDelete, onSubtasksChange, calendarHighlightId }: TaskDetailModalProps) {
  const [taskStack, setTaskStack] = useState<Task[]>([initialTask]);
  const currentTask = taskStack[taskStack.length - 1];

  const [title, setTitle] = useState(currentTask.title);
  const [description, setDescription] = useState(currentTask.description || '');
  const [dueDate, setDueDate] = useState(currentTask.dueDate || '');
  const [selectedLabels, setSelectedLabels] = useState<string[]>(currentTask.labels || []);
  const [completed, setCompleted] = useState(currentTask.completed || false);
  const [isSaving, setIsSaving] = useState(false);
  const [subtasks, setSubtasks] = useState<Task[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [proposedSubtaskTitles, setProposedSubtaskTitles] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const fetchSubtasks = useCallback(async (taskId: string) => {
    const result = await getSubTasks(taskId);
    if (result.success && result.tasks) {
      setSubtasks(result.tasks as Task[]);
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setTitle(currentTask.title);
    setDescription(currentTask.description || '');
    setDueDate(currentTask.dueDate || '');
    setSelectedLabels(currentTask.labels || []);
    setCompleted(currentTask.completed || false);
    fetchSubtasks(currentTask.id);
  }, [currentTask, fetchSubtasks]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const updates = { title, description, dueDate: dueDate || null, labels: selectedLabels, completed };

    await onSave(currentTask.id, updates);

    if (proposedSubtaskTitles.length > 0) {
      const res = await createBatchSubtasks(currentTask.id, currentTask.listId, proposedSubtaskTitles);
      if (res.success && res.subtasks) {
        const updatedSubtasks = [...subtasks, ...res.subtasks as Task[]];
        setSubtasks(updatedSubtasks);
        onSubtasksChange?.(currentTask.id, updatedSubtasks);
        setProposedSubtaskTitles([]);
      }
    }

    setTaskStack(prev => prev.map(t => t.id === currentTask.id ? { ...t, ...updates } : t));
    setIsSaving(false);
  }, [
    completed,
    currentTask.id,
    currentTask.listId,
    description,
    dueDate,
    onSave,
    onSubtasksChange,
    proposedSubtaskTitles,
    selectedLabels,
    subtasks,
    title,
  ]);

  const handleToggleCompleted = useCallback((_e: React.MouseEvent) => {
    const newCompletedState = !completed;
    setCompleted(newCompletedState);
  }, [completed]);

  const handleToggleSubtaskCompleted = useCallback(async (stId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const st = subtasks.find(s => s.id === stId);
    if (!st) return;
    const newCompleted = !st.completed;
    const newSubtasks = subtasks.map(s => s.id === stId ? { ...s, completed: newCompleted } : s);
    setSubtasks(newSubtasks);
    onSubtasksChange?.(currentTask.id, newSubtasks);
    await updateTask(stId, { completed: newCompleted });
  }, [currentTask.id, onSubtasksChange, subtasks]);

  const handleDeleteSubtask = useCallback(async (stId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this sub-task?')) return;
    const newSubtasks = subtasks.filter(s => s.id !== stId);
    setSubtasks(newSubtasks);
    onSubtasksChange?.(currentTask.id, newSubtasks);
    await deleteTask(stId);
  }, [currentTask.id, onSubtasksChange, subtasks]);

  const handleAddSubtask = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const result = await createTask(newSubtaskTitle, currentTask.listId, subtasks.length, currentTask.id);
    if (result.success && result.task) {
      const newSubtasks = [...subtasks, result.task as Task];
      setSubtasks(newSubtasks);
      onSubtasksChange?.(currentTask.id, newSubtasks);
      setNewSubtaskTitle('');
      setIsAddingSubtask(false);
    }
  }, [currentTask.id, currentTask.listId, newSubtaskTitle, onSubtasksChange, subtasks]);

  const handleProposedSubtasksSave = useCallback(async () => {
    if (proposedSubtaskTitles.length > 0) {
      const res = await createBatchSubtasks(currentTask.id, currentTask.listId, proposedSubtaskTitles);
      if (res.success && res.subtasks) {
        const updatedSubtasks = [...subtasks, ...res.subtasks as Task[]];
        setSubtasks(updatedSubtasks);
        onSubtasksChange?.(currentTask.id, updatedSubtasks);
        setProposedSubtaskTitles([]);
      }
    }
  }, [currentTask.id, currentTask.listId, onSubtasksChange, proposedSubtaskTitles, subtasks]);

  const handleDelete = useCallback(() => {
    onDelete(currentTask.id);
    if (taskStack.length > 1) {
      setTaskStack(prev => prev.slice(0, -1));
    }
  }, [currentTask.id, onDelete, taskStack.length]);

  const drillDown = useCallback((task: Task) => setTaskStack(prev => [...prev, task]), []);
  const goBack = useCallback(() => taskStack.length > 1 && setTaskStack(prev => prev.slice(0, -1)), [taskStack.length]);
  const handleBreadcrumbNavigate = useCallback((index: number) => {
    setTaskStack(prev => prev.slice(0, index + 1));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-2 sm:p-4 animate-in fade-in duration-300">
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 transition-all w-full max-w-5xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Breadcrumbs */}
        <TaskDetailHeader 
          taskStack={taskStack}
          goBack={goBack}
          handleBreadcrumbNavigate={handleBreadcrumbNavigate}
          onClose={onClose}
        />

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px]">
            {/* Main Column */}
            <div className="p-6 lg:p-8 space-y-8 border-r border-gray-50">
              <TaskBasicInfo
                task={currentTask}
                title={title}
                description={description}
                dueDate={dueDate}
                completed={completed}
                onTitleChange={setTitle}
                onDescriptionChange={setDescription}
                onDueDateChange={setDueDate}
                onCompletedChange={handleToggleCompleted}
                layout="main"
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M3 12h18M3 6h18M3 18h12" />
                      </svg>
                    </div>
                    Sub-tasks
                  </h4>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full ring-1 ring-blue-100">
                    {subtasks.length + proposedSubtaskTitles.length}
                  </span>
                </div>
                
                <TaskAttachments
                  task={currentTask}
                  selectedLabels={selectedLabels}
                  subtasks={subtasks}
                  proposedSubtaskTitles={proposedSubtaskTitles}
                  onLabelsChange={setSelectedLabels}
                  onSubtasksChange={setSubtasks}
                  onProposedSubtasksChange={setProposedSubtaskTitles}
                  onDrillDown={drillDown}
                  onToggleSubtaskCompleted={handleToggleSubtaskCompleted}
                  onDeleteSubtask={handleDeleteSubtask}
                  onAddSubtask={handleAddSubtask}
                  onNewSubtaskTitleChange={setNewSubtaskTitle}
                  newSubtaskTitle={newSubtaskTitle}
                  isAddingSubtask={isAddingSubtask}
                  setIsAddingSubtask={setIsAddingSubtask}
                  layout="subtasks-only"
                />
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="bg-gray-50/50 p-6 lg:p-8 space-y-8 h-full border-t lg:border-t-0">
              <div className="space-y-6">
                <TaskBasicInfo
                  task={currentTask}
                  title={title}
                  description={description}
                  dueDate={dueDate}
                  completed={completed}
                  onTitleChange={setTitle}
                  onDescriptionChange={setDescription}
                  onDueDateChange={setDueDate}
                  onCompletedChange={handleToggleCompleted}
                  layout="sidebar"
                />

                <TaskAttachments
                  task={currentTask}
                  selectedLabels={selectedLabels}
                  subtasks={subtasks}
                  proposedSubtaskTitles={proposedSubtaskTitles}
                  onLabelsChange={setSelectedLabels}
                  onSubtasksChange={setSubtasks}
                  onProposedSubtasksChange={setProposedSubtaskTitles}
                  onDrillDown={drillDown}
                  onToggleSubtaskCompleted={handleToggleSubtaskCompleted}
                  onDeleteSubtask={handleDeleteSubtask}
                  onAddSubtask={handleAddSubtask}
                  onNewSubtaskTitleChange={setNewSubtaskTitle}
                  newSubtaskTitle={newSubtaskTitle}
                  isAddingSubtask={isAddingSubtask}
                  setIsAddingSubtask={setIsAddingSubtask}
                  layout="labels-timer"
                />

                <div className="space-y-4 pt-2">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">AI Optimization</h4>
                  <TaskAIActions
                    task={currentTask}
                    selectedLabels={selectedLabels}
                    dueDate={dueDate}
                    calendarHighlightId={calendarHighlightId}
                    onTitleChange={setTitle}
                    onDescriptionChange={setDescription}
                    onLabelsChange={setSelectedLabels}
                    onDueDateChange={setDueDate}
                  />
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <TaskActions
                    task={currentTask}
                    isSaving={isSaving}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onCancel={onClose}
                    proposedSubtaskTitles={proposedSubtaskTitles}
                    onProposedSubtasksSave={handleProposedSubtasksSave}
                    layout="sidebar"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <TaskDetailFooter onClose={onClose} onSave={handleSave} isSaving={isSaving} />
      </div>
    </div>
  );
}

export default TaskDetailModal;
