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

  const handleStatusUpdateGenerated = (_update: string) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-xl shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-100">
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-2 flex items-center justify-between overflow-x-auto whitespace-nowrap">
            <div className="flex items-center gap-2">
              {taskStack.length > 1 && (
                <button onClick={goBack} className="p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
              )}
              {taskStack.map((t, i) => (
                <div key={t.id} className="flex items-center gap-2">
                  {i > 0 && <span className="text-gray-300">/</span>}
                  <button
                    onClick={() => setTaskStack(prev => prev.slice(0, i + 1))}
                    className={`text-xs font-medium px-2 py-1 rounded transition-colors cursor-pointer ${
                      i === taskStack.length - 1
                        ? 'bg-white shadow-sm text-gray-900 border border-gray-200'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {t.title}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-b border-gray-100 flex justify-between items-start">
            <div className="flex-1 mr-4">
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
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <TaskAIActions
              task={currentTask}
              selectedLabels={selectedLabels}
              dueDate={dueDate}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
              onLabelsChange={setSelectedLabels}
              onDueDateChange={setDueDate}
              onStatusUpdateGenerated={handleStatusUpdateGenerated}
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
            />
          </div>

          <div className="p-6 border-t border-gray-100">
            <TaskActions
              task={currentTask}
              isSaving={isSaving}
              onSave={handleSave}
              onDelete={handleDelete}
              onCancel={onClose}
              proposedSubtaskTitles={proposedSubtaskTitles}
              onProposedSubtasksSave={handleProposedSubtasksSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailModal;
