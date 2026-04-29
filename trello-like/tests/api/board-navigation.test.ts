// Suppress console.error in tests to avoid noise from intentional error tests
globalThis.console.error = () => {};

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { db } from '@/db';
import { authorize, unauthorize } from './__helpers__/mocks';

jest.mock('@/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    query: {
      workspaces: { findFirst: jest.fn() },
      tasks: { findMany: jest.fn() },
      tags: { findMany: jest.fn() },
      calendarHighlights: { findMany: jest.fn(), findFirst: jest.fn() },
    },
  },
}));

jest.mock('@/lib/session', () => ({
  getSession: jest.fn(),
}));

jest.mock('@/app/actions/board-actions', () => ({
  findOrCreateBoardByName: jest.fn(),
}));

import { findOrCreateBoardByName } from '@/app/actions/board-actions';

function createMockRequest(body: unknown = {}) {
  return {
    json: () => Promise.resolve(body),
    nextUrl: {
      searchParams: new URLSearchParams(),
    },
    cookies: {
      get: () => undefined,
      getAll: () => [],
      has: () => false,
      set: () => {},
      delete: () => {},
    },
    page: {},
    ua: null,
  } as unknown as Request;
}

describe('Board Navigation API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    unauthorize();
    (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue(null);
  });

  describe('POST /api/boards/navigate', () => {
    it('rejects unauthenticated requests', async () => {
      const { POST } = await import('@/app/api/boards/navigate/route');
      const result = await POST(createMockRequest() as unknown as Request);
      expect(result.status).toBe(401);
    });

    it('returns 400 when boardName is missing', async () => {
      authorize();
      const { POST } = await import('@/app/api/boards/navigate/route');
      const result = await POST(createMockRequest({ workspaceSlug: 'ws-1' }) as unknown as Request);
      expect(result.status).toBe(400);
    });

    it('returns 400 when workspaceSlug is missing', async () => {
      authorize();
      const { POST } = await import('@/app/api/boards/navigate/route');
      const result = await POST(createMockRequest({ boardName: 'Board 1' }) as unknown as Request);
      expect(result.status).toBe(400);
    });

    it('returns 404 when workspace not found', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue(null);
      const { POST } = await import('@/app/api/boards/navigate/route');
      const result = await POST(createMockRequest({ boardName: 'Board 1', workspaceSlug: 'ws-1' }) as unknown as Request);
      expect(result.status).toBe(404);
    });

    it('returns 500 when findOrCreateBoard fails', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue({ id: 'ws-1', slug: 'ws-1', userId: 'user-1' });
      (findOrCreateBoardByName as jest.Mock).mockResolvedValue({ success: false, error: 'Failed' });
      const { POST } = await import('@/app/api/boards/navigate/route');
      const result = await POST(createMockRequest({ boardName: 'Board 1', workspaceSlug: 'ws-1' }) as unknown as Request);
      expect(result.status).toBe(500);
    });

    it('returns board when findOrCreateBoard succeeds (board exists)', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue({ id: 'ws-1', slug: 'ws-1', userId: 'user-1' });
      (findOrCreateBoardByName as jest.Mock).mockResolvedValue({
        success: true,
        board: { id: 'board-1', name: 'Board 1' },
        created: false,
      });
      const { POST } = await import('@/app/api/boards/navigate/route');
      const result = await POST(createMockRequest({ boardName: 'Board 1', workspaceSlug: 'ws-1' }) as unknown as Request);
      expect(result.status).toBe(200);
    });

    it('returns board when findOrCreateBoard succeeds (board created)', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue({ id: 'ws-1', slug: 'ws-1', userId: 'user-1' });
      (findOrCreateBoardByName as jest.Mock).mockResolvedValue({
        success: true,
        board: { id: 'board-1', name: 'Board 1' },
        created: true,
      });
      const { POST } = await import('@/app/api/boards/navigate/route');
      const result = await POST(createMockRequest({ boardName: 'Board 1', workspaceSlug: 'ws-1' }) as unknown as Request);
      expect(result.status).toBe(200);
    });

    it('returns 500 on unexpected error', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockImplementation(() => {
        throw new Error('DB error');
      });
      const { POST } = await import('@/app/api/boards/navigate/route');
      const result = await POST(createMockRequest({ boardName: 'Board 1', workspaceSlug: 'ws-1' }) as unknown as Request);
      expect(result.status).toBe(500);
    });
  });
});
