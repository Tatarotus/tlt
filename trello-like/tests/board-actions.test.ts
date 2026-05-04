import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createBoard, updateBoard } from '../app/actions/board-actions';
import { db } from '@/db';
import { getSession } from '@/lib/session';

jest.mock('@/db', () => ({
  db: {
    query: {
      workspaces: { findFirst: jest.fn() },
      boards: { findFirst: jest.fn() },
    },
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    select: jest.fn(),
  },
}));

jest.mock('@/lib/session', () => ({
  getSession: jest.fn(),
}));

describe('board actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const authorize = () => {
    (getSession as jest.Mock).mockResolvedValue({ userId: 'user-1' });
  };

  describe('createBoard', () => {
    it('returns error if unauthenticated', async () => {
      (getSession as jest.Mock).mockResolvedValue(null);
      const result = await createBoard('Test', 'ws-1');
      expect(result).toEqual({ success: false, error: 'Unauthorized' });
    });

    it('returns error if workspace not found', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue(null);
      const result = await createBoard('Test', 'ws-1');
      expect(result).toEqual({ success: false, error: 'Unauthorized' });
    });

    it('creates board successfully', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue({ id: 'ws-1' });
      const returning = jest.fn().mockResolvedValue([{ id: 'board-1' }]);
      const values = jest.fn().mockReturnValue({ returning });
      (db.insert as jest.Mock).mockReturnValue({ values });
      
      const result = await createBoard('Test Board', 'ws-1');
      expect(result).toEqual({ success: true, board: { id: 'board-1' } });
    });
  });

  describe('updateBoard', () => {
    it('returns error if unauthenticated', async () => {
      (getSession as jest.Mock).mockResolvedValue(null);
      const result = await updateBoard('board-1', { name: 'Test' });
      expect(result).toEqual({ success: false, error: 'Unauthorized' });
    });

    it('returns error if board not found', async () => {
      authorize();
      (db.query.boards.findFirst as jest.Mock).mockResolvedValue(null);
      const result = await updateBoard('board-1', { name: 'Test' });
      expect(result).toEqual({ success: false, error: 'Unauthorized or not found' });
    });
  });
});
