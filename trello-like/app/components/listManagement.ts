import { List } from '@/lib/types';

export const listManagement = {
  handleRenameList: async (
    listId: string,
    newTitle: string,
    _lists: List[],
    setLists: (_updater: (_prev: List[]) => List[]) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateListTitle: (_id: string, _title: string) => Promise<any>
  ) => {
    setLists((prev: List[]) => prev.map((list: List) => list.id === listId ? { ...list, title: newTitle } : list));
    await updateListTitle(listId, newTitle);
  },

  handleAddList: async (
    newListTitle: string,
    lists: List[],
    setLists: (_updater: (_prev: List[]) => List[]) => void,
    setIsAddingList: (_val: boolean) => void,
    setNewListTitle: (_val: string) => void,
    boardId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createList: (_title: string, _order: number, _boardId: string) => Promise<any>
  ) => {
    if (!newListTitle.trim()) { 
      setIsAddingList(false); 
      return; 
    }
    
    const tempId = `temp-list-${Date.now()}`;
    const newOrder = lists.length;
    const optimisticList: List = { id: tempId, title: newListTitle, order: newOrder, tasks: [] };
    
    setLists((prev: List[]) => [...prev, optimisticList]);
    setNewListTitle("");
    setIsAddingList(false);

    const result = await createList(newListTitle, newOrder, boardId);
    if (result.success && result.list) {
        setLists((prev: List[]) => prev.map((l: List) => l.id === tempId ? { ...l, id: result.list!.id } : l));
    } else {
        setLists((prev: List[]) => prev.filter((l: List) => l.id !== tempId));
    }
  },

  handleDeleteList: async (
    listId: string,
    lists: List[],
    setLists: (_updater: (_prev: List[]) => List[]) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deleteList: (_id: string) => Promise<any>
  ) => {
    const oldLists = [...lists];
    setLists((prev: List[]) => prev.filter((list: List) => list.id !== listId));
    const result = await deleteList(listId);
    if (!result.success) setLists((_prev: List[]) => oldLists); 
  }
};