"use client"
import { CSSProperties, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Settings, Trash2, X } from "lucide-react";
import { updateBoard } from "@/app/actions/board-actions";
import { BOARD_BACKGROUND_PATTERNS, getBoardBackgroundPattern } from "@/lib/board-backgrounds";

interface BoardCardProps {
  id: string;
  name: string;
  count?: number;
  countLabel?: string;
  href: string;
  deleteAction?: (_formData: FormData) => void;
  variant?: 'board' | 'workspace';
  backgroundPattern?: string | null;
  backgroundImageUrl?: string | null;
}

function cssUrl(url: string) {
  return `url("${url.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}")`;
}

export function BoardCard({
  id,
  name,
  count,
  countLabel,
  href,
  deleteAction,
  variant = 'board',
  backgroundPattern,
  backgroundImageUrl,
}: BoardCardProps) {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState(backgroundPattern || "none");
  const [imageUrl, setImageUrl] = useState(backgroundImageUrl || "");
  const [appliedPattern, setAppliedPattern] = useState(backgroundPattern || "none");
  const [appliedImageUrl, setAppliedImageUrl] = useState(backgroundImageUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const selectedBackground = getBoardBackgroundPattern(appliedPattern);
  const hasImage = Boolean(appliedImageUrl);
  const canCustomize = variant === "board";
  const tileBackgroundStyle: CSSProperties = {
    backgroundColor: "#ffffff",
    backgroundImage: hasImage ? cssUrl(appliedImageUrl) : selectedBackground.backgroundImage,
    backgroundPosition: "center",
    backgroundSize: hasImage ? "cover" : selectedBackground.backgroundSize,
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    const result = await updateBoard(id, {
      backgroundPattern: selectedPattern,
      backgroundImageUrl: imageUrl,
    });

    if (result.success) {
      setAppliedPattern(result.board?.backgroundPattern || "none");
      setAppliedImageUrl(result.board?.backgroundImageUrl || "");
      setSelectedPattern(result.board?.backgroundPattern || "none");
      setImageUrl(result.board?.backgroundImageUrl || "");
      setIsSettingsOpen(false);
      router.refresh();
    } else {
      setError(result.error || "Failed to update tile background");
    }

    setIsSaving(false);
  };

  return (
    <div className="group relative h-full">
      <Link 
        href={href}
        className="relative flex min-h-[140px] flex-col overflow-hidden rounded-md border border-gray-200 bg-white p-5 transition-colors h-full hover:border-gray-300"
      >
        <div className="absolute inset-0" style={tileBackgroundStyle} aria-hidden="true" />
        <div className="absolute inset-0 bg-white/75 transition-colors group-hover:bg-white/65" aria-hidden="true" />
        <div className="relative z-10 flex flex-1 flex-col">
          <h3 className="pr-16 text-base font-semibold text-gray-950 drop-shadow-sm transition [overflow-wrap:anywhere]">
            {name}
          </h3>
        {count !== undefined && (
          <p className="text-gray-600 text-sm mt-2 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
            {count} {countLabel || (count === 1 ? 'item' : 'items')}
          </p>
        )}
        </div>
      </Link>

      {canCustomize && (
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="absolute top-3 right-3 z-20 rounded-md bg-white/90 p-1.5 text-gray-500 opacity-0 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-white hover:text-gray-900 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30"
          aria-label={`Customize ${name} tile background`}
          title="Tile background settings"
        >
          <Settings size={14} aria-hidden="true" />
        </button>
      )}
      
      {deleteAction && (
        <form 
          action={deleteAction} 
          className={`absolute top-3 z-20 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 ${canCustomize ? "right-12" : "right-3"}`}
        >
          <button 
            type="submit"
            className="rounded-md bg-white/90 p-1.5 text-gray-500 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
            aria-label={`Delete ${variant}`}
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </form>
      )}

      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setIsSettingsOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`tile-background-title-${id}`}
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 id={`tile-background-title-${id}`} className="text-lg font-semibold text-gray-900">
                  Tile Background
                </h2>
                <p className="mt-1 text-sm text-gray-500">{name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30"
                aria-label="Close tile background settings"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <fieldset className="space-y-3">
                <legend className="text-xs font-bold uppercase tracking-wider text-gray-500">Pattern</legend>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {BOARD_BACKGROUND_PATTERNS.map((pattern) => (
                    <label
                      key={pattern.id}
                      className={`cursor-pointer rounded-md border p-2 transition-colors ${selectedPattern === pattern.id ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <input
                        type="radio"
                        name={`background-pattern-${id}`}
                        value={pattern.id}
                        checked={selectedPattern === pattern.id}
                        onChange={() => setSelectedPattern(pattern.id)}
                        className="sr-only"
                      />
                      <span
                        className="block h-12 rounded border border-gray-200 bg-white"
                        style={{
                          backgroundImage: pattern.backgroundImage,
                          backgroundSize: pattern.backgroundSize,
                        }}
                        aria-hidden="true"
                      />
                      <span className="mt-2 block text-sm font-medium text-gray-700">{pattern.name}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="space-y-2">
                <label htmlFor={`background-image-${id}`} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <ImageIcon size={14} aria-hidden="true" />
                  Image URL
                </label>
                <input
                  id={`background-image-${id}`}
                  type="url"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="https://example.com/background.jpg"
                  className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm transition-colors placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
                <p className="text-xs text-gray-500">Leave blank to use the selected CSS pattern.</p>
              </div>

              {error && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 p-5">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="inline-flex h-9 items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex h-9 items-center justify-center rounded-md border border-transparent bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
