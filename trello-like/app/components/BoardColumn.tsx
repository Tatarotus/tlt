import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { TaskCard } from './TaskCard';
import { Task } from '@/lib/types';

type List = { 
  id: string; 
  title: string; 
  order: number; 
  tasks: Task[] 
};

type BoardColumnProps = {
  list: List;
  tasks: Task[];
  onAddTask: (_listId: string, _title: string) => void;
  onRenameList: (_listId: string, _newTitle: string) => void;
  onDeleteList: (_listId: string) => void;
  onTaskClick: (_task: Task) => void;
};

export function BoardColumn({ 
  list, 
  tasks, 
  onAddTask, 
  onRenameList, 
  onDeleteList, 
  onTaskClick 
}: BoardColumnProps) {
  const { setNodeRef } = useDroppable({ id: list.id });
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);

  const handleRenameSubmit = () => {
    setIsEditingTitle(false);
    const trimmedTitle = listTitle.trim();
    if (trimmedTitle === "") onDeleteList(list.id);
    else if (trimmedTitle !== list.title) onRenameList(list.id, trimmedTitle);
    else setListTitle(list.title); 
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      setIsAdding(false);
      return;
    }
    onAddTask(list.id, newTaskTitle);
    setNewTaskTitle(""); 
  };

  return (
    <div className="bg-gray-100/50 border border-gray-200/60 rounded-xl w-80 flex-shrink-0 flex flex-col h-full max-h-full shadow-sm">
      <div className="px-3 py-3 flex justify-between items-center border-b border-gray-200/50 group bg-white rounded-t-xl">
        {isEditingTitle ? (
          <input
            autoFocus
            className="font-semibold text-gray-900 bg-white border border-gray-300 px-2 py-1 rounded text-sm w-full outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
          />
        ) : (
          <h3 
            onClick={() => setIsEditingTitle(true)}
            className="text-sm font-semibold text-gray-800 cursor-pointer hover:text-gray-600 flex-1 px-2 py-1 truncate transition-colors"
          >
            {list.title}
          </h3>
        )}
        <div className="flex items-center gap-1">
            <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full flex items-center justify-center shrink-0 min-w-[20px]">
              {tasks.length}
            </span>
            <button 
                onClick={() => onDeleteList(list.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition-all"
                title="Delete list"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
        </div>
      </div>
      
      <div ref={setNodeRef} className="flex-1 flex flex-col gap-2 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>
      
      <div className="p-2 pt-0">
        {isAdding ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <textarea
              autoFocus
              className="w-full p-2 rounded-md border border-gray-200 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none text-sm text-gray-900 resize-none placeholder:text-gray-400 min-h-[60px]"
              placeholder="Enter a title for this card..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
                if (e.key === 'Escape') setIsAdding(false);
              }}
            />
            <div className="flex gap-2 items-center justify-end">
               <button type="button" onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-gray-700 px-3 py-1.5 text-xs font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" className="bg-gray-900 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-800 transition-colors shadow-sm">
                Add Card
              </button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full text-left px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 rounded-lg transition-colors flex items-center gap-2 group"
          >
            <span className="p-0.5 rounded bg-gray-200 group-hover:bg-gray-300 transition-colors">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14m-7-7h14"/></svg>
            </span>
            Add a card
          </button>
        )}
      </div>
    </div>
  );
}