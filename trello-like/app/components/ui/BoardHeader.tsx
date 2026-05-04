"use client"
import { useState, memo } from "react";
import Link from "next/link";
import { updateBoard, deleteBoard } from "@/app/actions/board-actions";
import { useRouter } from "next/navigation";
import { SettingsModal } from "./SettingsModal";

interface BoardHeaderProps {
  userId?: string;
  boardId: string;
  boardName: string;
  boardSlug: string;
  workspaceName: string;
  workspaceSlug: string;
}

function BoardHeaderComponent({ boardId, boardName, boardSlug, workspaceName, workspaceSlug, userId }: BoardHeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleUpdate = async (data: { name: string; slug: string }) => {
    setIsSaving(true);
    const result = await updateBoard(boardId, { 
      name: data.name, 
      slug: data.slug 
    });
    
    if (result.success && result.board) {
      setIsSettingsOpen(false);
      // Gentle redirect to the new URL if the slug changed
      if (result.board.slug !== boardSlug) {
        router.push(`/${workspaceSlug}/${result.board.slug}`);
      } else {
        router.refresh();
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this board? This action cannot be undone.")) return;
    setIsDeleting(true);
    const result = await deleteBoard(boardId);
    if (result.success) {
      router.push(`/${workspaceSlug}`);
    }
    setIsDeleting(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between z-10 shrink-0">
      <div className="flex items-center gap-2.5">
        <Link 
          href={`/${workspaceSlug}`} 
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          {workspaceName}
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-sm font-semibold text-gray-900">{boardName}</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
          title="Board Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Board Settings"
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        initialData={{ name: boardName, slug: boardSlug }}
        userId={userId}
        isSaving={isSaving}
        isDeleting={isDeleting}
        type="board"
      />
    </header>
  );
}

export const BoardHeader = memo(BoardHeaderComponent);
