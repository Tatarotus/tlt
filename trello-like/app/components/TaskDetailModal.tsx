"use client";
import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/lib/types';
import { createTask, getSubTasks, updateTask, deleteTask } from '../actions/task-actions';
import { createBatchSubtasks } from '../actions/ai-actions';
import { TaskBasicInfo } from './TaskBasicInfo';
import { TaskAIActions } from './TaskAIActions';
import { TaskAttachments } from './TaskAttachments';
import { TaskActions } from './TaskActions';

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (_taskId: string, _updates: Partial<Task>) => Promise<void>;
  onDelete: (_taskId: string) => Promise<void>;
  onSubtasksChange?: (_parentId: string, _subtasks: Task[]) => void;
}

export function TaskDetailModal({ task: initialTask, isOpen, onClose, onSave, onDelete, onSubtasksChange }: TaskDetailModalProps) {
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
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

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

  if (!isOpen) return null;

  const handleSave = async () => {
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
  };

  const handleToggleCompleted = (_e: React.MouseEvent) => {
    const newCompletedState = !completed;
    setCompleted(newCompletedState);
  };

  const handleToggleSubtaskCompleted = async (stId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const st = subtasks.find(s => s.id === stId);
    if (!st) return;
    const newCompleted = !st.completed;
    const newSubtasks = subtasks.map(s => s.id === stId ? { ...s, completed: newCompleted } : s);
    setSubtasks(newSubtasks);
    onSubtasksChange?.(currentTask.id, newSubtasks);
    await updateTask(stId, { completed: newCompleted });
  };

  const handleDeleteSubtask = async (stId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this sub-task?')) return;
    const newSubtasks = subtasks.filter(s => s.id !== stId);
    setSubtasks(newSubtasks);
    onSubtasksChange?.(currentTask.id, newSubtasks);
    await deleteTask(stId);
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
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
  };

  const handleProposedSubtasksSave = async () => {
    if (proposedSubtaskTitles.length > 0) {
      const res = await createBatchSubtasks(currentTask.id, currentTask.listId, proposedSubtaskTitles);
      if (res.success && res.subtasks) {
        const updatedSubtasks = [...subtasks, ...res.subtasks as Task[]];
        setSubtasks(updatedSubtasks);
        onSubtasksChange?.(currentTask.id, updatedSubtasks);
        setProposedSubtaskTitles([]);
      }
    }
  };

  const handleDelete = () => {
    onDelete(currentTask.id);
    if (taskStack.length > 1) {
      setTaskStack(prev => prev.slice(0, -1));
    }
  };

  const drillDown = (task: Task) => setTaskStack(prev => [...prev, task]);
  const goBack = () => taskStack.length > 1 && setTaskStack(prev => prev.slice(0, -1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-300">
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 transition-all w-full max-w-5xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Breadcrumbs */}
        <div className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {taskStack.length > 1 && (
              <button onClick={goBack} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer text-gray-500">
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
                    onClick={() => setTaskStack(prev => prev.slice(0, i + 1))}
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
          <button
            onClick={onClose}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-200 transition-all cursor-pointer shrink-0"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

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
        <div className="bg-white border-t border-gray-100 px-8 py-5 flex justify-end items-center gap-4 shrink-0">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailModal;
