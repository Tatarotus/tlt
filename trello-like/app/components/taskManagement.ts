import { Task, List } from '@/lib/types';

export const taskManagement = {
  handleAddTask: async (
    listId: string, 
    title: string, 
    lists: List[], 
    setLists: (_updater: (_prev: List[]) => List[]) => void, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createTask: (_title: string, _listId: string, _order: number) => Promise<any>
  ) => {
    const tempId = `temp-${Date.now()}`;
    const targetListIndex = lists.findIndex((l: List) => l.id === listId);
    if (targetListIndex === -1) return;
    
    const newOrder = lists[targetListIndex].tasks.length;
    const optimisticTask: Task = { 
        id: tempId, 
        title, 
        listId, 
        order: newOrder,
        description: '',
        dueDate: null,
        labels: [],
        completed: false,
        parentId: null,
        children: []
    };

    setLists((prev: List[]) => prev.map((list: List) => 
      list.id === listId ? { ...list, tasks: [...list.tasks, optimisticTask] } : list
    ));
    
    const result = await createTask(title, listId, newOrder);
    if (result.success && result.task) {
      setLists((prev: List[]) => prev.map((list: List) => 
        list.id === listId ? { ...list, tasks: list.tasks.map((task: Task) => 
          task.id === tempId ? result.task! : task
        )} : list
      ));
      return result.task; // Return the real task
    } else {
        // Revert on failure
        setLists((prev: List[]) => prev.map((list: List) => 
          list.id === listId ? { ...list, tasks: list.tasks.filter((t: Task) => t.id !== tempId) } : list
        ));
    }
  },

  handleDeleteTask: async (
    taskId: string,
    lists: List[],
    setLists: (_updater: (_prev: List[]) => List[]) => void,
    selectedTask: Task | null,
    setSelectedTask: (_task: Task | null) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deleteTask: (_id: string) => Promise<any>
  ) => {
    const oldLists = [...lists];
    
    setLists((prev: List[]) => prev.map((list: List) => ({
      ...list,
      tasks: list.tasks.filter((t: Task) => {
        if (t.id === taskId) return false;
        if (t.children) {
          t.children = t.children.filter((c: Task) => c.id !== taskId);
        }
        return true;
      })
    })));

    const result = await deleteTask(taskId);
    if (!result.success) setLists((_prev: List[]) => oldLists); 
    if (selectedTask?.id === taskId) setSelectedTask(null);
  },

  handleUpdateTask: async (
    taskId: string,
    updates: Partial<Task>,
    lists: List[],
    setLists: (_updater: (_prev: List[]) => List[]) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateTask: (_id: string, _updates: Partial<Task>) => Promise<any>
  ) => {
    const oldLists = [...lists];
    
    setLists((prev: List[]) => prev.map((list: List) => ({
        ...list,
        tasks: list.tasks.map((task: Task) => {
            if (task.id === taskId) return { ...task, ...updates };
            if (task.children) {
                const newChildren: Task[] = task.children?.map((c: Task) => c.id === taskId ? { ...c, ...updates } : c) || [];
                return { ...task, children: newChildren };
            }
            return task;
        })
    })));

    const result = await updateTask(taskId, updates);
    if (!result.success) {
        setLists((_prev: List[]) => oldLists);
    }
  },

  handleSubtasksChange: (
    parentId: string,
    newSubtasks: Task[],
    _lists: List[],
    setLists: (_updater: (_prev: List[]) => List[]) => void
  ) => {
    setLists((prev: List[]) => prev.map((list: List) => ({
        ...list,
        tasks: list.tasks.map((task: Task) => {
            if (task.id === parentId) {
                return { ...task, children: newSubtasks };
            }
            return task;
        })
    })));
  }
};