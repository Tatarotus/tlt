"use client"
import { useState, useEffect, useCallback } from 'react';
import { 
  DndContext, 
  closestCorners, 
  DragEndEvent, 
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Task, List } from '@/lib/types';
import { BoardColumn } from './BoardColumn';
import { TaskCard } from './TaskCard';
import { TaskDetailModal } from './TaskDetailModal';
import { useKanbanBoard } from './useKanbanBoard';
import { findTask, findContainer, handleDragOver } from './dragUtils';
import { taskManagement } from './taskManagement';
import { listManagement } from './listManagement';
import { useTimer } from '@/lib/timer-context';
import { 
  createTask, 
  deleteTask, 
  updateTask, 
  updateListTitle, 
  createList, 
  deleteList,
  reorderTasks 
} from '@/app/actions/task-actions';

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

function syncListOrder(listId: string, listTasks: Task[]) {
  const updatedTasks = listTasks.map((task, index) => ({
    id: task.id,
    order: index,
    listId
  }));
  return reorderTasks(updatedTasks);
}

async function handleDragEnd(
  event: DragEndEvent,
  lists: List[],
  setLists: React.Dispatch<React.SetStateAction<List[]>>,
  stopTimer: (_cardId: string) => Promise<unknown>
) {
  const { active, over } = event;
  const activeId = String(active.id);
  const overId = over ? String(over.id) : null;

  if (!overId) {
    return;
  }

  const activeContainer = findContainer(activeId, lists);
  const overContainer = findContainer(overId, lists);

  if (!activeContainer || !overContainer) {
    return;
  }

  const activeListIndex = lists.findIndex((l) => l.id === activeContainer);
  const overListIndex = lists.findIndex((l) => l.id === overContainer);

  if (activeListIndex === -1 || overListIndex === -1) {
    return;
  }

  const activeIndex = lists[activeListIndex].tasks.findIndex((t) => t.id === activeId);
  const overIndex = lists[overListIndex].tasks.findIndex((t) => t.id === overId);

  const newLists = [...lists];

  if (activeContainer === overContainer) {
    if (activeIndex !== overIndex) {
      newLists[activeListIndex] = {
        ...newLists[activeListIndex],
        tasks: arrayMove(newLists[activeListIndex].tasks, activeIndex, overIndex)
      };
      setLists(newLists);
      await syncListOrder(activeContainer, newLists[activeListIndex].tasks);
    }
  } else {
    const destList = lists.find((l) => l.id === overContainer);
    if (destList) {
      await syncListOrder(overContainer, destList.tasks);

      const normalizedTitle = destList.title.toLowerCase();
      if (normalizedTitle === "done") {
        await stopTimer(activeId);
      }
    }
  }
}

export default function KanbanBoard({ initialLists, boardId }: { initialLists: List[], boardId: string }) {
  const [lists, setLists] = useState<List[]>(initialLists);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const { sensors, setIsAddingList, isAddingList, newListTitle, setNewListTitle } = useKanbanBoard();

  const { stopTimer } = useTimer();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setLists(initialLists);
  }, [initialLists]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = findTask(String(active.id), lists);
    if (task) setActiveTask(task);
  }, [lists]);

  const handleDragOverEvent = useCallback((event: DragOverEvent) => {
    handleDragOver(event.active, event.over, lists, setLists);
  }, [lists]);

  const handleDragEndEvent = useCallback(async (event: DragEndEvent) => {
    await handleDragEnd(event, lists, setLists, stopTimer);
    setActiveTask(null);
  }, [lists, stopTimer]);

  const handleAddTask = useCallback((listId: string, title: string) => {
    taskManagement.handleAddTask(listId, title, lists, setLists, createTask);
  }, [lists]);

  const handleRenameList = useCallback((listId: string, newTitle: string) => {
    listManagement.handleRenameList(listId, newTitle, lists, setLists, updateListTitle);
  }, [lists]);

  const handleDeleteList = useCallback((listId: string) => {
    listManagement.handleDeleteList(listId, lists, setLists, deleteList);
  }, [lists]);

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTask(null);
  }, []);

  const handleSaveTask = useCallback((taskId: string, updates: Partial<Task>) => (
    taskManagement.handleUpdateTask(taskId, updates, lists, setLists, updateTask)
  ), [lists]);

  const handleDeleteTask = useCallback((taskId: string) => (
    taskManagement.handleDeleteTask(taskId, lists, setLists, selectedTask, setSelectedTask, deleteTask)
  ), [lists, selectedTask]);

  const handleSubtasksChange = useCallback((parentId: string, newSubtasks: Task[]) => {
    taskManagement.handleSubtasksChange(parentId, newSubtasks, lists, setLists);
  }, [lists]);

  if (!isMounted) return null;

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart} 
      onDragOver={handleDragOverEvent} 
      onDragEnd={handleDragEndEvent}
    >
      <div className="flex gap-6 items-start overflow-x-auto h-full px-8 py-8 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        {lists.map((list) => (
          <BoardColumn 
            key={list.id} 
            list={list} 
            tasks={list.tasks}
            onAddTask={handleAddTask}
            onRenameList={handleRenameList}
            onDeleteList={handleDeleteList}
            onTaskClick={handleTaskClick}
          />
        ))}

        <div className="w-80 flex-shrink-0">
          {isAddingList ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              listManagement.handleAddList(
                newListTitle, lists, setLists, setIsAddingList, setNewListTitle, boardId,
                createList
              );
            }} className="bg-gray-100/50 border border-gray-200 rounded-xl p-3 flex flex-col gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
              <input
                autoFocus
                className="w-full p-2 rounded-md border border-gray-200 focus:border-gray-500 outline-none text-sm text-gray-900 placeholder:text-gray-400 bg-white"
                placeholder="Enter list title..."
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') setIsAddingList(false); }}
              />
              <div className="flex gap-2 items-center">
                <button type="submit" className="bg-gray-900 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
                  Add List
                </button>
                <button type="button" onClick={() => setIsAddingList(false)} className="text-gray-500 hover:text-gray-700 px-2 py-1.5 text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button 
              onClick={() => setIsAddingList(true)}
              className="w-full text-left px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100/80 bg-gray-100/40 rounded-xl transition-all flex items-center gap-2 border border-dashed border-gray-300 hover:border-gray-400 group"
            >
              <span className="p-1 rounded bg-gray-200 group-hover:bg-gray-300 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14"/></svg>
              </span>
              Add another list
            </button>
          )}
        </div>
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask ? (
          <div className="rotate-2 cursor-grabbing">
             <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>

      {selectedTask && (
          <TaskDetailModal 
            task={selectedTask}
            isOpen={!!selectedTask}
            onClose={handleCloseModal}
            onSave={handleSaveTask}
            onDelete={handleDeleteTask}
            onSubtasksChange={handleSubtasksChange}
          />
      )}
    </DndContext>
  );
}
