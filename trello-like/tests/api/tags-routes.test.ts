// Suppress console.error in tests to avoid noise from intentional error tests
globalThis.console.error = () => {};

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { db } from '@/db';
import { authorize, unauthorize, mockInsertReturning } from './__helpers__/mocks';

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

function createMockRequest(body: unknown = {}, searchParams?: URLSearchParams) {
  return {
    json: () => Promise.resolve(body),
    nextUrl: {
      searchParams: searchParams || new URLSearchParams(),
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

describe('Tags API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    unauthorize();
    (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue(null);
    (db.query.tags.findMany as jest.Mock).mockResolvedValue([]);
  });

  describe('GET /api/tags', () => {
    it('rejects unauthenticated requests', async () => {
      const { GET } = await import('@/app/api/tags/route');
      const req = createMockRequest({}, { get: () => 'ws-1' } as unknown as URLSearchParams);
      const result = await GET(req);
      expect(result.status).toBe(401);
    });

    it('returns 400 when workspaceSlug is missing', async () => {
      authorize();
      const { GET } = await import('@/app/api/tags/route');
      const req = createMockRequest({}, new URLSearchParams());
      const result = await GET(req);
      expect(result.status).toBe(400);
    });

    it('returns 404 when workspace not found', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue(null);
      const { GET } = await import('@/app/api/tags/route');
      const req = createMockRequest({}, { get: () => 'ws-1' } as unknown as URLSearchParams);
      const result = await GET(req);
      expect(result.status).toBe(404);
    });

    it('returns tags for authenticated user', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue({ id: 'ws-1', slug: 'ws-1', userId: 'user-1' });
      const tags = [{ id: 'tag-1', name: 'Important', color: 'red', workspaceId: 'ws-1' }];
      (db.query.tags.findMany as jest.Mock).mockResolvedValue(tags);
      const { GET } = await import('@/app/api/tags/route');
      const req = createMockRequest({}, { get: () => 'ws-1' } as unknown as URLSearchParams);
      const result = await GET(req);
      expect(result.status).toBe(200);
    });

    it('returns 500 on database error', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockImplementation(() => {
        throw new Error('DB error');
      });
      const { GET } = await import('@/app/api/tags/route');
      const req = createMockRequest({}, { get: () => 'ws-1' } as unknown as URLSearchParams);
      const result = await GET(req);
      expect(result.status).toBe(500);
    });
  });

  describe('POST /api/tags', () => {
    it('rejects unauthenticated requests', async () => {
      const { POST } = await import('@/app/api/tags/route');
      const result = await POST(createMockRequest({ workspaceSlug: 'ws-1', name: 'Tag', color: 'red' }));
      expect(result.status).toBe(401);
    });

    it('returns 400 when workspaceSlug is missing', async () => {
      authorize();
      const { POST } = await import('@/app/api/tags/route');
      const result = await POST(createMockRequest({ name: 'Tag', color: 'red' }));
      expect(result.status).toBe(400);
    });

    it('returns 400 when name is missing', async () => {
      authorize();
      const { POST } = await import('@/app/api/tags/route');
      const result = await POST(createMockRequest({ workspaceSlug: 'ws-1', color: 'red' }));
      expect(result.status).toBe(400);
    });

    it('returns 400 when color is missing', async () => {
      authorize();
      const { POST } = await import('@/app/api/tags/route');
      const result = await POST(createMockRequest({ workspaceSlug: 'ws-1', name: 'Tag' }));
      expect(result.status).toBe(400);
    });

    it('returns 400 when name exceeds 60 characters', async () => {
      authorize();
      const { POST } = await import('@/app/api/tags/route');
      const result = await POST(createMockRequest({ workspaceSlug: 'ws-1', name: 'a'.repeat(61), color: 'red' }));
      expect(result.status).toBe(400);
    });

    it('returns 400 when color is invalid', async () => {
      authorize();
      const { POST } = await import('@/app/api/tags/route');
      const result = await POST(createMockRequest({ workspaceSlug: 'ws-1', name: 'Tag', color: 'invalid' }));
      expect(result.status).toBe(400);
    });

    it('returns 404 when workspace not found', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue(null);
      const { POST } = await import('@/app/api/tags/route');
      const result = await POST(createMockRequest({ workspaceSlug: 'ws-1', name: 'Tag', color: 'red' }));
      expect(result.status).toBe(404);
    });

    it('creates tag for authenticated user', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue({ id: 'ws-1', slug: 'ws-1', userId: 'user-1' });
      const newTag = { id: 'tag-1', name: 'Tag', color: 'red', workspaceId: 'ws-1' };
      mockInsertReturning([newTag]);
      const { POST } = await import('@/app/api/tags/route');
      const result = await POST(createMockRequest({ workspaceSlug: 'ws-1', name: 'Tag', color: 'red' }));
      expect(result.status).toBe(200);
    });

    it('returns 500 on database error', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue({ id: 'ws-1', slug: 'ws-1', userId: 'user-1' });
      db.insert.mockImplementation(() => {
        throw new Error('DB error');
      });
      const { POST } = await import('@/app/api/tags/route');
      const result = await POST(createMockRequest({ workspaceSlug: 'ws-1', name: 'Tag', color: 'red' }));
      expect(result.status).toBe(500);
    });
  });
});
