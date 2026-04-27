import { Task, List } from '@/lib/types';

export function findTask(id: string, lists: List[]) {
  for (const list of lists) {
    const task = list.tasks.find((t: Task) => t.id === id);
    if (task) return task;
  }
  return null;
};

export function findContainer(id: string, lists: List[]) {
  if (lists.find((l: List) => l.id === id)) return id;
  return lists.find((l: List) => l.tasks.some((t: Task) => t.id === id))?.id;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handleDragOver(active: any, over: any, lists: List[], setLists: (_updater: (_prev: List[]) => List[]) => void) {
  const overId = over?.id;
  if (!overId || active.id === overId) return;

  const activeContainer = findContainer(String(active.id), lists);
  const overContainer = findContainer(String(overId), lists);

  if (!activeContainer || !overContainer || activeContainer === overContainer) return;

  setLists((prev: List[]) => {
    const activeItems = prev.find((l: List) => l.id === activeContainer)?.tasks || [];
    const overItems = prev.find((l: List) => l.id === overContainer)?.tasks || [];
    const activeIndex = activeItems.findIndex((t: Task) => t.id === active.id);
    const overIndex = overItems.findIndex((t: Task) => t.id === overId);

    let newIndex;
    if (prev.some((l: List) => l.id === overId)) {
      newIndex = overItems.length + 1;
    } else {
      const isBelowOverItem = over &&
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;
      const modifier = isBelowOverItem ? 1 : 0;
      newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
    }

    return prev.map((l: List) => {
      if (l.id === activeContainer) {
        return { ...l, tasks: l.tasks.filter((t: Task) => t.id !== active.id) };
      } else if (l.id === overContainer) {
        const newTasks = [...l.tasks];
        // Determine the task to insert
        const taskToMove = activeItems[activeIndex];
        if(taskToMove) {
           // Update its listId immediately for local state consistency
           const updatedTask = { ...taskToMove, listId: overContainer };
           newTasks.splice(newIndex, 0, updatedTask);
        }
        return { ...l, tasks: newTasks };
      }
      return l;
    });
  });
};