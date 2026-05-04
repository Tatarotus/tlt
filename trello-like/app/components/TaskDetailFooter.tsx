import React from 'react';

interface TaskDetailFooterProps {
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export function TaskDetailFooter({ onClose, onSave, isSaving }: TaskDetailFooterProps) {
  return (
    <div className="bg-white border-t border-gray-100 px-8 py-5 flex justify-end items-center gap-4 shrink-0">
      <button 
        onClick={onClose}
        className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
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
  );
}
