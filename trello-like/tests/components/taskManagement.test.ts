import { describe, expect, it, jest } from '@jest/globals';
import { taskManagement } from '@/app/components/taskManagement';
import { List, Task } from '@/lib/types';

describe('taskManagement', () => {
  const createTask = (id: string, title = 'Task'): Task => ({
    id,
    title,
    listId: 'list-1',
    order: 0,
    description: '',
    dueDate: null,
    labels: [],
    completed: false,
    parentId: null,
    children: []
  });

  const createList = (id: string, title = 'List', tasks: Task[] = []): List => ({
    id,
    title,
    order: 0,
    tasks
  });

  const createSetLists = (initialLists: List[]) => {
    let currentLists = initialLists;
    const setLists = jest.fn((_updater: (_prev: List[]) => List[]) => {
      currentLists = _updater(currentLists);
    });
    return { setLists, getLists: () => currentLists };
  };

  describe('handleAddTask', () => {
    it('does nothing if list not found', async () => {
      const setLists = jest.fn();
      const createTask = jest.fn().mockResolvedValue({ success: true, task: { id: 'new-task' } });
      const lists: List[] = [createList('list-1')];
      
      await taskManagement.handleAddTask('nonexistent', 'New Task', lists, setLists, createTask);
      
      expect(setLists).not.toHaveBeenCalled();
    });

    it('adds task optimistically and updates on success', async () => {
      const { setLists, getLists } = createSetLists([createList('list-1', 'List', [createTask('task-1')])]);
      const createTaskMock = jest.fn().mockResolvedValue({ success: true, task: { id: 'real-id', title: 'New Task' } });
      const lists: List[] = [createList('list-1', 'List', [createTask('task-1')])];
      
      await taskManagement.handleAddTask('list-1', 'New Task', lists, setLists, createTaskMock);
      
      expect(setLists).toHaveBeenCalledTimes(2);
      expect(getLists()[0].tasks.map((task) => task.id)).toEqual(['task-1', 'real-id']);
    });

    it('reverts on failure', async () => {
      const { setLists, getLists } = createSetLists([createList('list-1', 'List', [])]);
      const createTaskMock = jest.fn<() => Promise<{ success: boolean }>>().mockResolvedValue({ success: false });
      const lists: List[] = [createList('list-1', 'List', [])];
      
      await taskManagement.handleAddTask('list-1', 'New Task', lists, setLists, createTaskMock);
      
      expect(setLists).toHaveBeenCalledTimes(2);
      expect(getLists()[0].tasks).toEqual([]);
    });
  });

  describe('handleDeleteTask', () => {
    it('removes task and reverts on failure', async () => {
      const deleteTask = jest.fn<() => Promise<{ success: boolean }>>().mockResolvedValue({ success: false });
      const task = createTask('task-1');
      const lists: List[] = [createList('list-1', 'List', [task])];
      const { setLists, getLists } = createSetLists(lists);
      
      await taskManagement.handleDeleteTask('task-1', lists, setLists, null, jest.fn(), deleteTask);
      
      expect(setLists).toHaveBeenCalledTimes(2);
      expect(getLists()).toEqual(lists);
    });

    it('clears selected task if deleted', async () => {
      const setSelectedTask = jest.fn();
      const deleteTask = jest.fn<() => Promise<{ success: boolean }>>().mockResolvedValue({ success: true });
      const task = createTask('task-1');
      const lists: List[] = [createList('list-1', 'List', [task])];
      const { setLists, getLists } = createSetLists(lists);
      
      await taskManagement.handleDeleteTask('task-1', lists, setLists, task, setSelectedTask, deleteTask);
      
      expect(setSelectedTask).toHaveBeenCalledWith(null);
      expect(getLists()[0].tasks).toEqual([]);
    });
  });

  describe('handleUpdateTask', () => {
    it('updates task and reverts on failure', async () => {
      const updateTask = jest.fn<() => Promise<{ success: boolean }>>().mockResolvedValue({ success: false });
      const task = createTask('task-1', 'Old Title');
      const lists: List[] = [createList('list-1', 'List', [task])];
      const { setLists, getLists } = createSetLists(lists);
      
      await taskManagement.handleUpdateTask('task-1', { title: 'New Title' }, lists, setLists, updateTask);
      
      expect(setLists).toHaveBeenCalledTimes(2);
      expect(getLists()).toEqual(lists);
    });

    it('updates task successfully', async () => {
      const updateTask = jest.fn<() => Promise<{ success: boolean }>>().mockResolvedValue({ success: true });
      const task = createTask('task-1', 'Old Title');
      const lists: List[] = [createList('list-1', 'List', [task])];
      const { setLists, getLists } = createSetLists(lists);
      
      await taskManagement.handleUpdateTask('task-1', { title: 'New Title' }, lists, setLists, updateTask);
      
      expect(setLists).toHaveBeenCalled();
      expect(getLists()[0].tasks[0].title).toBe('New Title');
    });
  });

  describe('handleSubtasksChange', () => {
    it('updates subtasks for parent', () => {
      const parentTask = createTask('parent');
      const newSubtasks: Task[] = [createTask('sub1'), createTask('sub2')];
      const lists: List[] = [createList('list-1', 'List', [parentTask])];
      const { setLists, getLists } = createSetLists(lists);
      
      taskManagement.handleSubtasksChange('parent', newSubtasks, lists, setLists);
      
      expect(setLists).toHaveBeenCalled();
      expect(getLists()[0].tasks[0].children).toEqual(newSubtasks);
    });
  });
});
