import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createWorkspace, updateWorkspace, deleteWorkspace } from '../app/actions/workspace-actions';
import { db } from '@/db';
import { getSession } from '@/lib/session';

jest.mock('@/db', () => ({
  db: {
    query: {
      workspaces: { findFirst: jest.fn(), findMany: jest.fn() },
      boards: { findMany: jest.fn() },
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

describe('workspace actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const authorize = () => {
    (getSession as jest.Mock).mockResolvedValue({ userId: 'user-1' });
  };

  describe('createWorkspace', () => {
    it('returns error if unauthenticated', async () => {
      (getSession as jest.Mock).mockResolvedValue(null);
      const result = await createWorkspace('Test');
      expect(result).toEqual({ success: false, error: 'Unauthorized' });
    });

    it('creates workspace successfully', async () => {
      authorize();
      const returning = jest.fn().mockResolvedValue([{ id: 'ws-1' }]);
      const values = jest.fn().mockReturnValue({ returning });
      (db.insert as jest.Mock).mockReturnValue({ values });
      
      const result = await createWorkspace('Test Workspace');
      expect(result).toEqual({ success: true, workspace: { id: 'ws-1' } });
    });
  });

  describe('updateWorkspace', () => {
    it('returns error if unauthenticated', async () => {
      (getSession as jest.Mock).mockResolvedValue(null);
      const result = await updateWorkspace('ws-1', { name: 'Test' });
      expect(result).toEqual({ success: false, error: 'Unauthorized' });
    });

    it('returns error if workspace not found', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue(null);
      const result = await updateWorkspace('ws-1', { name: 'Test' });
      expect(result).toEqual({ success: false, error: 'Unauthorized or not found' });
    });

    it('updates workspace successfully', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue({ id: 'ws-1' });
      const returning = jest.fn().mockResolvedValue([{ id: 'ws-1', name: 'Updated' }]);
      const where = jest.fn().mockReturnValue({ returning });
      const set = jest.fn().mockReturnValue({ where });
      (db.update as jest.Mock).mockReturnValue({ set });
      
      const result = await updateWorkspace('ws-1', { name: 'Updated', slug: 'new-slug' });
      expect(result).toEqual({ success: true, workspace: { id: 'ws-1', name: 'Updated' } });
      expect(set).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated', slug: 'new-slug' }));
    });
  });
  
  describe('deleteWorkspace', () => {
    it('returns error if unauthenticated', async () => {
      (getSession as jest.Mock).mockResolvedValue(null);
      const result = await deleteWorkspace('ws-1');
      expect(result).toEqual({ success: false, error: 'Unauthorized' });
    });

    it('returns error if workspace not found', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue(null);
      const result = await deleteWorkspace('ws-1');
      expect(result).toEqual({ success: false, error: 'Unauthorized or not found' });
    });
  });
});
