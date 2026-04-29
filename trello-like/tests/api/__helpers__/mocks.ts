import { jest } from '@jest/globals';
import { db } from '@/db';
import { getSession } from '@/lib/session';

export type MockControl = {
  mockResolvedValue: (_value: unknown) => void;
  mockRejectedValue: (_value: unknown) => void;
  mockReturnValue: (_value: unknown) => void;
  mockImplementation: (_implementation: (..._args: unknown[]) => unknown) => void;
  mockClear: () => void;
};

export type DbMock = typeof db & {
  update: MockControl;
  insert: MockControl;
  delete: MockControl;
  select: MockControl;
  transaction: MockControl;
  query: {
    workspaces: {
      findFirst: MockControl;
    };
    tasks: {
      findMany: MockControl;
    };
    tags: {
      findMany: MockControl;
    };
    calendarHighlights: {
      findMany: MockControl;
      findFirst: MockControl;
    };
  };
};

export const mockedDb = db as DbMock;
export const mockedGetSession = getSession as unknown as MockControl;

export function authorize() {
  mockedGetSession.mockResolvedValue({ userId: 'user-1' });
}

export function unauthorize() {
  mockedGetSession.mockResolvedValue(null);
}

export function mockInsertReturning(result: unknown[] = [{ id: 'inserted-id' }]) {
  const returning = jest.fn<() => Promise<unknown[]>>().mockResolvedValue(result);
  const values = jest.fn<(_values: unknown) => { returning: typeof returning }>(() => ({ returning }));
  mockedDb.insert.mockReturnValue({ values });
  return { values, returning };
}

export function mockUpdateReturning(result: unknown[] = [{ id: 'updated-id' }]) {
  const returning = jest.fn<() => Promise<unknown[]>>().mockResolvedValue(result);
  const where = jest.fn<(_condition: unknown) => { returning: typeof returning }>(() => ({ returning }));
  const set = jest.fn<(_values: unknown) => { where: typeof where }>(() => ({ where }));
  mockedDb.update.mockReturnValue({ set });
  return { set, where, returning };
}

export function mockUpdateNoReturning() {
  const where = jest.fn<(_condition: unknown) => Promise<void>>().mockResolvedValue(undefined);
  const set = jest.fn<(_values: unknown) => { where: typeof where }>(() => ({ where }));
  mockedDb.update.mockReturnValue({ set });
  return { set, where };
}

export function mockDeleteWhere() {
  const where = jest.fn<(_condition: unknown) => Promise<void>>().mockResolvedValue(undefined);
  mockedDb.delete.mockReturnValue({ where });
  return { where };
}

export function mockSelect(result: unknown[] = []) {
  const where = jest.fn<(_condition: unknown) => Promise<unknown[]>>(
    () => Promise.resolve(result)
  );
  const from = jest.fn<(_table: unknown) => { where: typeof where }>(() => ({ where }));
  mockedDb.select.mockReturnValue({ from });
  return { from, where };
}

export function setupDbQueryMocks() {
  mockedDb.query.workspaces.findFirst.mockResolvedValue(null);
  mockedDb.query.tags.findMany.mockResolvedValue([]);
  mockedDb.query.calendarHighlights.findMany.mockResolvedValue([]);
  mockedDb.query.calendarHighlights.findFirst.mockResolvedValue(null);
}

export function clearAllMocks() {
  jest.clearAllMocks();
  mockedGetSession.mockResolvedValue(null);
  mockedDb.select.mockClear?.();
  mockedDb.insert.mockClear?.();
  mockedDb.update.mockClear?.();
  mockedDb.delete.mockClear?.();
  mockedDb.query.workspaces.findFirst.mockClear?.();
  mockedDb.query.tags.findMany.mockClear?.();
  mockedDb.query.calendarHighlights.findMany.mockClear?.();
  mockedDb.query.calendarHighlights.findFirst.mockClear?.();
}
