import { describe, expect, it, jest } from '@jest/globals';
import { listManagement } from '@/app/components/listManagement';
import { List, Task } from '@/lib/types';

describe('listManagement', () => {
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

  describe('handleRenameList', () => {
    it('updates list title', async () => {
      const { setLists, getLists } = createSetLists([createList('list-1', 'Old Title')]);
      const updateListTitle = jest.fn().mockResolvedValue({ success: true });
      const lists: List[] = [createList('list-1', 'Old Title')];
      
      await listManagement.handleRenameList('list-1', 'New Title', lists, setLists, updateListTitle);
      
      expect(setLists).toHaveBeenCalled();
      expect(getLists()[0].title).toBe('New Title');
    });

    it('calls updateListTitle with correct params', async () => {
      const setLists = jest.fn();
      const updateListTitle = jest.fn().mockResolvedValue({ success: true });
      const lists: List[] = [createList('list-1', 'Old Title')];
      
      await listManagement.handleRenameList('list-1', 'New Title', lists, setLists, updateListTitle);
      
      expect(updateListTitle).toHaveBeenCalledWith('list-1', 'New Title');
    });
  });

  describe('handleAddList', () => {
    it('does nothing if title is empty', async () => {
      const setLists = jest.fn();
      const setIsAddingList = jest.fn();
      const setNewListTitle = jest.fn();
      const createList = jest.fn();
      const lists: List[] = [createList('list-1')];
      
      await listManagement.handleAddList('', lists, setLists, setIsAddingList, setNewListTitle, 'board-1', createList);
      
      expect(setIsAddingList).toHaveBeenCalledWith(false);
      expect(setLists).not.toHaveBeenCalled();
    });

    it('adds list optimistically and updates id on success', async () => {
      const { setLists, getLists } = createSetLists([createList('list-1')]);
      const setIsAddingList = jest.fn();
      const setNewListTitle = jest.fn();
      const createListMock = jest.fn().mockResolvedValue({ success: true, list: { id: 'real-id' } });
      const lists: List[] = [createList('list-1')];
      
      await listManagement.handleAddList('New List', lists, setLists, setIsAddingList, setNewListTitle, 'board-1', createListMock);
      
      expect(setLists).toHaveBeenCalledTimes(2);
      expect(setNewListTitle).toHaveBeenCalledWith('');
      expect(setIsAddingList).toHaveBeenCalledWith(false);
      expect(getLists().map((list) => list.id)).toEqual(['list-1', 'real-id']);
    });

    it('reverts on failure', async () => {
      const { setLists, getLists } = createSetLists([createList('list-1')]);
      const setIsAddingList = jest.fn();
      const setNewListTitle = jest.fn();
      const createListMock = jest.fn().mockResolvedValue({ success: false });
      const lists: List[] = [createList('list-1')];
      
      await listManagement.handleAddList('New List', lists, setLists, setIsAddingList, setNewListTitle, 'board-1', createListMock);
      
      expect(setLists).toHaveBeenCalledTimes(2);
      expect(getLists()).toHaveLength(1);
    });
  });

  describe('handleDeleteList', () => {
    it('removes list and reverts on failure', async () => {
      const lists: List[] = [createList('list-1')];
      const { setLists, getLists } = createSetLists(lists);
      const deleteList = jest.fn().mockResolvedValue({ success: false });
      
      await listManagement.handleDeleteList('list-1', lists, setLists, deleteList);
      
      expect(setLists).toHaveBeenCalledTimes(2);
      expect(getLists()).toEqual(lists);
    });

    it('deletes list successfully', async () => {
      const { setLists, getLists } = createSetLists([createList('list-1')]);
      const deleteList = jest.fn().mockResolvedValue({ success: true });
      const lists: List[] = [createList('list-1')];
      
      await listManagement.handleDeleteList('list-1', lists, setLists, deleteList);
      
      expect(setLists).toHaveBeenCalled();
      expect(getLists()).toEqual([]);
    });
  });
});
