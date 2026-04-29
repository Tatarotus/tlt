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

describe('Timer API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    unauthorize();
  });

  describe('POST /api/timer/start', () => {
    it('rejects unauthenticated requests', async () => {
      const { POST } = await import('@/app/api/timer/start/route');
      const result = await POST(createMockRequest() as unknown as Request);
      expect(result.status).toBe(401);
    });

    it('returns 400 when category is missing', async () => {
      authorize();
      const { POST } = await import('@/app/api/timer/start/route');
      const result = await POST(createMockRequest({ cardId: 'card-1' }) as unknown as Request);
      expect(result.status).toBe(400);
    });

    it('returns 409 when timer already running', async () => {
      authorize();
      const where = jest.fn().mockReturnValue({ limit: () => Promise.resolve([{ id: 1, category: 'work', startTime: new Date() }]) });
      const from = jest.fn().mockReturnValue({ where });
      db.select.mockReturnValue({ from });
      const { POST } = await import('@/app/api/timer/start/route');
      const result = await POST(createMockRequest({ category: 'work' }) as unknown as Request);
      expect(result.status).toBe(409);
    });

    it('creates new timer session for authenticated user', async () => {
      authorize();
      const where = jest.fn().mockReturnValue({ limit: () => Promise.resolve([]) });
      const from = jest.fn().mockReturnValue({ where });
      db.select.mockReturnValue({ from });
      const returning = jest.fn().mockResolvedValue([{ id: 1, category: 'work', startTime: new Date() }]);
      const values = jest.fn().mockReturnValue({ returning });
      db.insert.mockReturnValue({ values });
      const { POST } = await import('@/app/api/timer/start/route');
      const result = await POST(createMockRequest({ category: 'work', notes: 'test' }) as unknown as Request);
      expect(result.status).toBe(200);
    });

    it('returns 500 on database error', async () => {
      authorize();
      const where = jest.fn().mockReturnValue({ limit: () => Promise.resolve([]) });
      const from = jest.fn().mockReturnValue({ where });
      db.select.mockReturnValue({ from });
      db.insert.mockImplementation(() => {
        throw new Error('DB error');
      });
      const { POST } = await import('@/app/api/timer/start/route');
      const result = await POST(createMockRequest({ category: 'work' }) as unknown as Request);
      expect(result.status).toBe(500);
    });
  });

  describe('POST /api/timer/stop', () => {
    it('rejects unauthenticated requests', async () => {
      const { POST } = await import('@/app/api/timer/stop/route');
      const result = await POST(createMockRequest() as unknown as Request);
      expect(result.status).toBe(401);
    });

    it('returns 404 when no active timer found', async () => {
      authorize();
      const where = jest.fn().mockReturnValue({ limit: () => Promise.resolve([]) });
      const from = jest.fn().mockReturnValue({ where });
      db.select.mockReturnValue({ from });
      const { POST } = await import('@/app/api/timer/stop/route');
      const result = await POST(createMockRequest({ cardId: 'card-1' }) as unknown as Request);
      expect(result.status).toBe(404);
    });

    it('stops active timer and returns session', async () => {
      authorize();
      const activeTimer = { id: 1, category: 'work', startTime: new Date() };
      const where = jest.fn().mockReturnValue({ limit: () => Promise.resolve([activeTimer]) });
      const from = jest.fn().mockReturnValue({ where });
      db.select.mockReturnValue({ from });
      const returning = jest.fn().mockResolvedValue([{ ...activeTimer, endTime: new Date() }]);
      const whereUpdate = jest.fn().mockReturnValue({ returning });
      const set = jest.fn().mockReturnValue({ where: whereUpdate });
      db.update.mockReturnValue({ set });
      const { POST } = await import('@/app/api/timer/stop/route');
      const result = await POST(createMockRequest({ cardId: 'card-1' }) as unknown as Request);
      expect(result.status).toBe(200);
    });

    it('returns 500 on database error', async () => {
      authorize();
      const where = jest.fn().mockReturnValue({ limit: () => Promise.resolve([{ id: 1, startTime: new Date() }]) });
      const from = jest.fn().mockReturnValue({ where });
      db.select.mockReturnValue({ from });
      db.update.mockImplementation(() => {
        throw new Error('DB error');
      });
      const { POST } = await import('@/app/api/timer/stop/route');
      const result = await POST(createMockRequest({ cardId: 'card-1' }) as unknown as Request);
      expect(result.status).toBe(500);
    });
  });

  describe('GET /api/timer/active', () => {
    it('rejects unauthenticated requests', async () => {
      const { GET } = await import('@/app/api/timer/active/route');
      const result = await GET();
      expect(result.status).toBe(401);
    });

    it('returns { active: null } when no active timer', async () => {
      authorize();
      const where = jest.fn().mockReturnValue({ limit: () => Promise.resolve([]) });
      const from = jest.fn().mockReturnValue({ where });
      db.select.mockReturnValue({ from });
      const { GET } = await import('@/app/api/timer/active/route');
      const result = await GET();
      expect(result.status).toBe(200);
    });

    it('returns active timer when exists', async () => {
      authorize();
      const activeTimer = { id: 1, category: 'work', startTime: new Date(), notes: 'test', cardId: 'card-1', source: 'kanban' };
      const where = jest.fn().mockReturnValue({ limit: () => Promise.resolve([activeTimer]) });
      const from = jest.fn().mockReturnValue({ where });
      db.select.mockReturnValue({ from });
      const { GET } = await import('@/app/api/timer/active/route');
      const result = await GET();
      expect(result.status).toBe(200);
    });

    it('returns 500 on database error', async () => {
      authorize();
      db.select.mockImplementation(() => {
        throw new Error('DB error');
      });
      const { GET } = await import('@/app/api/timer/active/route');
      const result = await GET();
      expect(result.status).toBe(500);
    });
  });
});
