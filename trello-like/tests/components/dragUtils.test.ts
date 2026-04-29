import { describe, expect, it, jest } from '@jest/globals';
import { findTask, findContainer, handleDragOver } from '@/app/components/dragUtils';
import { List, Task } from '@/lib/types';

describe('dragUtils', () => {
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

  describe('findTask', () => {
    it('returns null when task not found', () => {
      const lists: List[] = [createList('list-1', 'List', [createTask('task-1')])];
      expect(findTask('nonexistent', lists)).toBeNull();
    });

    it('finds task in first list', () => {
      const task = createTask('task-1', 'Find Me');
      const lists: List[] = [createList('list-1', 'List', [task])];
      expect(findTask('task-1', lists)).toEqual(task);
    });

    it('finds task in nested lists', () => {
      const task1 = createTask('task-1');
      const task2 = createTask('task-2', 'Target');
      const task3 = createTask('task-3');
      const lists: List[] = [
        createList('list-1', 'List 1', [task1]),
        createList('list-2', 'List 2', [task2, task3])
      ];
      expect(findTask('task-2', lists)).toEqual(task2);
    });
  });

  describe('findContainer', () => {
    it('returns list id when searching for a list', () => {
      const lists: List[] = [createList('list-1'), createList('list-2')];
      expect(findContainer('list-1', lists)).toBe('list-1');
    });

    it('returns list id when task is found in that list', () => {
      const task = createTask('task-1');
      const lists: List[] = [createList('list-1', 'List', [task])];
      expect(findContainer('task-1', lists)).toBe('list-1');
    });

    it('returns undefined when not found', () => {
      const lists: List[] = [createList('list-1')];
      expect(findContainer('nonexistent', lists)).toBeUndefined();
    });
  });

  describe('handleDragOver', () => {
    it('does nothing when overId is missing', () => {
      const setLists = jest.fn();
      const lists: List[] = [createList('list-1')];
      handleDragOver({ id: 'task-1' }, {}, lists, setLists);
      expect(setLists).not.toHaveBeenCalled();
    });

    it('does nothing when active and over are the same', () => {
      const setLists = jest.fn();
      const lists: List[] = [createList('list-1')];
      handleDragOver({ id: 'task-1' }, { id: 'task-1' }, lists, setLists);
      expect(setLists).not.toHaveBeenCalled();
    });

    it('does nothing when containers are the same', () => {
      const setLists = jest.fn();
      const task1 = createTask('task-1');
      const task2 = createTask('task-2');
      const lists: List[] = [createList('list-1', 'List', [task1, task2])];
      handleDragOver({ id: 'task-1' }, { id: 'task-2' }, lists, setLists);
      expect(setLists).not.toHaveBeenCalled();
    });

    it('moves task between different containers', () => {
      const task1 = createTask('task-1');
      const task2 = createTask('task-2');
      const lists: List[] = [
        createList('list-1', 'List 1', [task1]),
        createList('list-2', 'List 2', [task2])
      ];
      const { setLists, getLists } = createSetLists(lists);

      handleDragOver(
        { id: 'task-1', rect: { current: { translated: { top: 100 } } } },
        { id: 'task-2', rect: { top: 0, height: 10 } },
        lists,
        setLists
      );

      expect(setLists).toHaveBeenCalled();
      expect(getLists()[0].tasks).toEqual([]);
      expect(getLists()[1].tasks.map((task) => task.id)).toEqual(['task-2', 'task-1']);
    });

    it('moves task to the end when hovering over a list container', () => {
      const task1 = createTask('task-1');
      const task2 = createTask('task-2');
      const lists: List[] = [
        createList('list-1', 'List 1', [task1]),
        createList('list-2', 'List 2', [task2])
      ];
      const { setLists, getLists } = createSetLists(lists);

      handleDragOver(
        { id: 'task-1', rect: { current: { translated: null } } },
        { id: 'list-2', rect: { top: 0, height: 10 } },
        lists,
        setLists
      );

      expect(getLists()[1].tasks.map((task) => task.id)).toEqual(['task-2', 'task-1']);
    });
  });
});
