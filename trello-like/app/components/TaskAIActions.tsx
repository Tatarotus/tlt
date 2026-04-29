"use client";
import { useState } from 'react';
import { Button } from './ui/Button';
import { Task } from '@/lib/types';
import { aiMakeTaskPerfect, aiRewriteTask, aiWriteStatusUpdate } from '../actions/ai-actions';

interface TaskAIActionsProps {
  task: Task;
  selectedLabels: string[];
  dueDate: string;
  onTitleChange: (_title: string) => void;
  onDescriptionChange: (_description: string) => void;
  onLabelsChange: (_labels: string[]) => void;
  onDueDateChange: (_dueDate: string) => void;
  onStatusUpdateGenerated: (_update: string) => void;
}

export function TaskAIActions({
  task,
  selectedLabels,
  dueDate,
  onTitleChange,
  onDescriptionChange,
  onLabelsChange,
  onDueDateChange,
  onStatusUpdateGenerated,
}: TaskAIActionsProps) {
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiStatusUpdate, _setAiStatusUpdate] = useState<string | null>(null);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleStatusUpdate = async () => {
    setIsAiThinking(true);
    setAiError(null);
    try {
      const result = await aiWriteStatusUpdate(task.id);
      if (result.success && result.update) {
        setIsAiPanelOpen(true);
        onStatusUpdateGenerated(result.update);
      } else {
        setAiError(result.error || 'Failed to generate status update.');
      }
    } catch (_err) {
      setAiError('AI error.');
    }
    setIsAiThinking(false);
  };

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
if (!task.dueDate) {
        const statusRes = await aiWriteStatusUpdate(task.id);
        if (statusRes.success && statusRes.update) {
          setIsAiPanelOpen(true);
        }
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

  const copyToClipboard = () => {
    if (aiStatusUpdate) {
      navigator.clipboard.writeText(aiStatusUpdate);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleMakePerfect}
            disabled={isAiThinking}
            className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"
          >
            ✨ Make This Task Perfect
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleRewrite('professional')}
            disabled={isAiThinking}
            className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
          >
            Professional
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleRewrite('concise')}
            disabled={isAiThinking}
            className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
          >
            Concise
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleRewrite('friendly')}
            disabled={isAiThinking}
            className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
          >
            Friendly
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleStatusUpdate}
            disabled={isAiThinking}
            className="bg-green-50 text-green-700 border-green-100 hover:bg-green-100"
          >
            📝 Write Status Update
          </Button>
        </div>
        {aiError && <p className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">⚠️ {aiError}</p>}
      </div>

      {isAiPanelOpen && aiStatusUpdate && (
        <div className="w-80 flex flex-col bg-gray-50 border-l border-gray-100 animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
            <h4 className="text-sm font-bold text-green-900 flex items-center gap-2">✦ AI Status Update</h4>
            <button
              onClick={() => setIsAiPanelOpen(false)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
              <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {aiStatusUpdate}
              </div>
              <button
                onClick={copyToClipboard}
                className={`mt-4 w-full py-2 text-white text-xs font-medium rounded-lg transition-all ${
                  isCopied ? 'bg-green-600' : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                {isCopied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TaskAIActions;
