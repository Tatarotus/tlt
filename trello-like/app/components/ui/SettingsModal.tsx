"use client"
import { useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onUpdate: (_data: any) => Promise<void>;
  onDelete: () => Promise<void>;
  initialData: {
    name: string;
    slug: string;
    description?: string;
  };
  userId?: string;
  isSaving: boolean;
  isDeleting: boolean;
  type: 'workspace' | 'board';
}

export function SettingsModal({
  isOpen,
  onClose,
  title,
  onUpdate,
  onDelete,
  initialData,
  userId,
  isSaving,
  isDeleting,
  type
}: SettingsModalProps) {
  const [newName, setNewName] = useState(initialData.name);
  const [newSlug, setNewSlug] = useState(initialData.slug);
  const [newDescription, setNewDescription] = useState(initialData.description || "");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <div className="space-y-1 bg-blue-50/50 p-3 rounded-lg border border-blue-100 mb-4">
              <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">Your CLI User ID</label>
              <code className="text-[10px] font-mono text-blue-800 break-all bg-white/80 p-1.5 rounded border border-blue-200 block">
                {userId || "Not logged in"}
              </code>
              <p className="text-[9px] text-blue-500 mt-1">Copy this into your ~/.config/time-logger/config.json</p>
            </div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{type === 'workspace' ? 'Workspace' : 'Board'} Name</label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{type === 'workspace' ? 'Workspace' : 'Board'} Slug</label>
            <Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="slug" />
            <p className="text-[10px] text-gray-400">Used in URLs (alphanumeric and hyphens only)</p>
          </div>

          {type === 'workspace' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Description</label>
              <textarea 
                className="w-full min-h-[100px] p-3 rounded-lg border border-gray-200 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none text-sm text-gray-900 resize-none bg-gray-50/50" 
                placeholder="Describe your workspace..." 
                value={newDescription} 
                onChange={(e) => setNewDescription(e.target.value)} 
              />
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <Button 
              variant="danger" 
              fullWidth 
              onClick={onDelete} 
              isLoading={isDeleting}
            >
              Delete {type === 'workspace' ? 'Workspace' : 'Board'}
            </Button>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/30">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => onUpdate({ name: newName, slug: newSlug, description: newDescription })} 
            isLoading={isSaving} 
            className="px-8 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-md"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
