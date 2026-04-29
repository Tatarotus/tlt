import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  createList,
  createTask,
  deleteList,
  deleteTask,
  getSubTasks,
  reorderTasks,
  updateListTitle,
  updateTask,
  updateTaskPosition,
} from '../app/actions/task-actions';
import { db } from '@/db';
import { getSession } from '@/lib/session';

jest.mock('@/db', () => ({
  db: {
    update: jest.fn(),
    insert: jest.fn(),
    delete: jest.fn(),
    transaction: jest.fn(),
    query: {
      tasks: {
        findMany: jest.fn(),
      },
    },
  },
}));

jest.mock('@/lib/session', () => ({
  getSession: jest.fn(),
}));

type DbMock = typeof db & {
  update: MockControl;
  insert: MockControl;
  delete: MockControl;
  transaction: MockControl;
  query: {
    tasks: {
      findMany: MockControl;
    };
  };
};

type MockControl = {
  mockResolvedValue: (_value: unknown) => void;
  mockRejectedValue: (_value: unknown) => void;
  mockReturnValue: (_value: unknown) => void;
  mockImplementation: (_implementation: (..._args: unknown[]) => unknown) => void;
  mockClear: () => void;
};

const mockedDb = db as DbMock;
const mockedGetSession = getSession as unknown as MockControl;

function authorize() {
  mockedGetSession.mockResolvedValue({ userId: 'user-1' });
}

function mockUpdateReturning(result: unknown[] = [{ id: 'updated-id' }]) {
  const returning = jest.fn<() => Promise<unknown[]>>().mockResolvedValue(result);
  const where = jest.fn<(_condition: unknown) => { returning: typeof returning }>(() => ({ returning }));
  const set = jest.fn<(_values: unknown) => { where: typeof where }>(() => ({ where }));
  mockedDb.update.mockReturnValue({ set });
  return { set, where, returning };
}

function mockUpdateNoReturning() {
  const where = jest.fn<(_condition: unknown) => Promise<void>>().mockResolvedValue(undefined);
  const set = jest.fn<(_values: unknown) => { where: typeof where }>(() => ({ where }));
  mockedDb.update.mockReturnValue({ set });
  return { set, where };
}

function mockInsertReturning(result: unknown[] = [{ id: 'inserted-id' }]) {
  const returning = jest.fn<() => Promise<unknown[]>>().mockResolvedValue(result);
  const values = jest.fn<(_values: unknown) => { returning: typeof returning }>(() => ({ returning }));
  mockedDb.insert.mockReturnValue({ values });
  return { values, returning };
}

function mockDeleteWhere() {
  const where = jest.fn<(_condition: unknown) => Promise<void>>().mockResolvedValue(undefined);
  mockedDb.delete.mockReturnValue({ where });
  return { where };
}

describe('task server actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetSession.mockResolvedValue(null);
  });

  it('rejects unauthenticated task creation before touching the database', async () => {
    const result = await createTask('Task', 'list-1', 0);

    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(mockedDb.insert).not.toHaveBeenCalled();
  });

  it('creates a task for an authenticated user', async () => {
    authorize();
    const { values } = mockInsertReturning([{ id: 'task-1', title: 'Task' }]);

    const result = await createTask('Task', 'list-1', 2, 'parent-1');

    expect(values).toHaveBeenCalledWith({
      id: expect.any(String),
      title: 'Task',
      listId: 'list-1',
      order: 2,
      parentId: 'parent-1',
    });
    expect(result).toEqual({ success: true, task: { id: 'task-1', title: 'Task' } });
  });

  it('returns a database error when task position update fails', async () => {
    authorize();
    const returning = jest.fn<() => Promise<unknown[]>>().mockRejectedValue(new Error('db failed'));
    const where = jest.fn<(_condition: unknown) => { returning: typeof returning }>(() => ({
      returning,
    }));
    const set = jest.fn<(_values: unknown) => { where: typeof where }>(() => ({ where }));
    mockedDb.update.mockReturnValue({ set });

    const result = await updateTaskPosition('task-1', 'list-2', 1);

    expect(set).toHaveBeenCalledWith({ listId: 'list-2', order: 1 });
    expect(result).toEqual({ success: false, error: 'Database update failed' });
  });

  it('updates task fields and returns the updated task', async () => {
    authorize();
    const updatedTask = { id: 'task-1', completed: true };
    const { set } = mockUpdateReturning([updatedTask]);

    const result = await updateTask('task-1', { completed: true });

    expect(set).toHaveBeenCalledWith({ completed: true });
    expect(result).toEqual({ success: true, task: updatedTask });
  });

  it('fetches subtasks ordered by task order', async () => {
    authorize();
    const subtasks = [{ id: 'subtask-1' }, { id: 'subtask-2' }];
    mockedDb.query.tasks.findMany.mockResolvedValue(subtasks);

    const result = await getSubTasks('task-1');

    expect(mockedDb.query.tasks.findMany).toHaveBeenCalledWith({
      where: expect.anything(),
      orderBy: expect.any(Function),
    });
    expect(result).toEqual({ success: true, tasks: subtasks });
  });

  it('updates list titles', async () => {
    authorize();
    const { set } = mockUpdateNoReturning();

    const result = await updateListTitle('list-1', 'Done');

    expect(set).toHaveBeenCalledWith({ title: 'Done' });
    expect(result).toEqual({ success: true });
  });

  it('creates lists for an authenticated user', async () => {
    authorize();
    const { values } = mockInsertReturning([{ id: 'list-1', title: 'Todo' }]);

    const result = await createList('Todo', 0, 'board-1');

    expect(values).toHaveBeenCalledWith({
      id: expect.any(String),
      title: 'Todo',
      order: 0,
      boardId: 'board-1',
    });
    expect(result).toEqual({ success: true, list: { id: 'list-1', title: 'Todo' } });
  });

  it('deletes a task by id', async () => {
    authorize();
    mockDeleteWhere();

    const result = await deleteTask('task-1');

    expect(mockedDb.delete).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true });
  });

  it('deletes tasks before deleting their list', async () => {
    authorize();
    mockDeleteWhere();

    const result = await deleteList('list-1');

    expect(mockedDb.delete).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ success: true });
  });

  it('reorders tasks inside a transaction', async () => {
    authorize();
    const txUpdate = jest.fn<(_table: unknown) => { set: (_values: unknown) => { where: (_condition: unknown) => Promise<void> } }>(() => ({
      set: jest.fn<(_values: unknown) => { where: (_condition: unknown) => Promise<void> }>(() => ({
        where: jest.fn<(_condition: unknown) => Promise<void>>().mockResolvedValue(undefined),
      })),
    }));
    mockedDb.transaction.mockImplementation(async (callback) => {
      await (callback as (_tx: { update: typeof txUpdate }) => Promise<void>)({ update: txUpdate });
    });

    const result = await reorderTasks([
      { id: 'task-1', order: 0, listId: 'list-1' },
      { id: 'task-2', order: 1, listId: 'list-1' },
    ]);

    expect(txUpdate).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ success: true });
  });
});
