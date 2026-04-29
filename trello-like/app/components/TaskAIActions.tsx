"use client";
import { useState } from 'react';
import { Task } from '@/lib/types';
import { aiMakeTaskPerfect, aiRewriteTask } from '../actions/ai-actions';

interface TaskAIActionsProps {
  task: Task;
  selectedLabels: string[];
  dueDate: string;
  onTitleChange: (_title: string) => void;
  onDescriptionChange: (_description: string) => void;
  onLabelsChange: (_labels: string[]) => void;
  onDueDateChange: (_dueDate: string) => void;
}

export function TaskAIActions({
  task,
  selectedLabels,
  dueDate,
  onTitleChange,
  onDescriptionChange,
  onLabelsChange,
  onDueDateChange,
}: TaskAIActionsProps) {
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleMakePerfect = async () => {
    setIsAiThinking(true);
    setAiError(null);
    try {
      const result = await aiMakeTaskPerfect(task.id);
      if (result.success && result.data) {
        const d = result.data;
        onTitleChange(d.title);
        onDescriptionChange(d.description || '');
        if (d.labels) {
          const lowerExisting = selectedLabels.map((l) => l.toLowerCase());
          const newLabels = d.labels.filter((l: string) => !lowerExisting.includes(l.toLowerCase()));
          onLabelsChange([...selectedLabels, ...newLabels]);
        }
        if (d.suggestedDueDate && !dueDate) {
          onDueDateChange(d.suggestedDueDate);
        }
      } else {
        setAiError(result.error || 'Failed to optimize task.');
      }
    } catch (_err) {
      setAiError('AI error.');
    }
    setIsAiThinking(false);
  };

  const handleRewrite = async (tone: 'professional' | 'concise' | 'friendly') => {
    setIsAiThinking(true);
    setAiError(null);
    try {
      const result = await aiRewriteTask(task.id, tone);
      if (result.success && result.data) {
        onTitleChange(result.data.title);
        onDescriptionChange(result.data.description);
      } else {
        setAiError(result.error || 'Rewrite failed.');
      }
    } catch (_err) {
      setAiError('AI error.');
    }
    setIsAiThinking(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleMakePerfect}
          disabled={isAiThinking}
          className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {isAiThinking ? (
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <span className="text-base">✨</span>
          )}
          Optimize Task
        </button>
        <button
          onClick={() => handleRewrite('professional')}
          disabled={isAiThinking}
          className="flex items-center justify-center px-3 py-2.5 bg-white border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 text-gray-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
        >
          💼 Pro
        </button>
        <button
          onClick={() => handleRewrite('concise')}
          disabled={isAiThinking}
          className="flex items-center justify-center px-3 py-2.5 bg-white border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 text-gray-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
        >
          📝 Brief
        </button>
      </div>
      {aiError && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <span className="text-sm">⚠️</span>
          <p className="text-[11px] text-red-600 font-bold uppercase tracking-wider">{aiError}</p>
        </div>
      )}
    </div>
  );
}

export default TaskAIActions;
