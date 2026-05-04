"use client"
import { useState, memo } from "react";
import Link from "next/link";
import { Container } from "./Container";
import { updateWorkspace, deleteWorkspace } from "@/app/actions/workspace-actions";
import { useRouter } from "next/navigation";
import { SettingsModal } from "./SettingsModal";

interface WorkspaceHeaderProps {
  userId?: string;
  id: string;
  name: string;
  slug: string | null;
  description?: string;
  backHref?: string;
  backLabel?: string;
  children?: React.ReactNode;
}

function WorkspaceHeaderComponent({ id, name, slug, description, backHref, backLabel = "Back", userId, children }: WorkspaceHeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleUpdate = async (data: { name: string; slug: string; description: string }) => {
    setIsSaving(true);
    const result = await updateWorkspace(id, data);
    if (result.success && result.workspace) {
      setIsSettingsOpen(false);
      if (result.workspace.slug !== slug) {
        router.push(`/${result.workspace.slug}`);
      } else {
        router.refresh();
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this workspace? All boards and tasks will be permanently removed.")) return;
    setIsDeleting(true);
    try {
      const result = await deleteWorkspace(id);
      if (result.success) {
        router.push("/");
      } else {
        alert("Failed to delete workspace: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      alert("An unexpected error occurred while deleting the workspace.");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 mb-8 relative">
      <Container>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-4">
              {backHref && (
                <Link 
                  href={backHref}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors w-fit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  {backLabel}
                </Link>
              )}
              <div className="space-y-1">
                <h1 className="text-3xl font-semibold text-gray-900">
                  {name}
                </h1>
                {description && (
                  <p className="text-base text-gray-500 max-w-2xl">
                    {description}
                  </p>
                )}
              </div>
              {children}
            </div>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              title="Workspace Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
      </Container>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Workspace Settings"
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        initialData={{ name, slug: slug || "", description }}
        userId={userId}
        isSaving={isSaving}
        isDeleting={isDeleting}
        type="workspace"
      />
    </div>
  );
}

export const WorkspaceHeader = memo(WorkspaceHeaderComponent);
