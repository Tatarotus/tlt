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

describe('Calendar Highlights By ID API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    unauthorize();
    (db.query.calendarHighlights.findFirst as jest.Mock).mockResolvedValue(null);
  });

  describe('GET /api/calendar/highlights/[id]', () => {
    it('rejects unauthenticated requests', async () => {
      const { GET } = await import('@/app/api/calendar/highlights/[id]/route');
      const result = await GET({} as Request, { params: Promise.resolve({ id: 'h1' }) });
      expect(result.status).toBe(401);
    });

    it('returns 404 when highlight not found', async () => {
      authorize();
      (db.query.calendarHighlights.findFirst as jest.Mock).mockResolvedValue(null);
      const { GET } = await import('@/app/api/calendar/highlights/[id]/route');
      const result = await GET({} as Request, { params: Promise.resolve({ id: 'h1' }) });
      expect(result.status).toBe(404);
    });

    it('returns 403 when user is not workspace owner', async () => {
      authorize();
      const highlight = { id: 'h1', workspaceId: 'ws-1', workspace: { userId: 'other-user' } };
      (db.query.calendarHighlights.findFirst as jest.Mock).mockResolvedValue(highlight);
      const { GET } = await import('@/app/api/calendar/highlights/[id]/route');
      const result = await GET({} as Request, { params: Promise.resolve({ id: 'h1' }) });
      expect(result.status).toBe(403);
    });

    it('returns highlight for authorized user', async () => {
      authorize();
      const highlight = { id: 'h1', workspaceId: 'ws-1', workspace: { userId: 'user-1' } };
      (db.query.calendarHighlights.findFirst as jest.Mock).mockResolvedValue(highlight);
      const { GET } = await import('@/app/api/calendar/highlights/[id]/route');
      const result = await GET({} as Request, { params: Promise.resolve({ id: 'h1' }) });
      expect(result.status).toBe(200);
    });
  });

  describe('PUT /api/calendar/highlights/[id]', () => {
    it('rejects unauthenticated requests', async () => {
      const { PUT } = await import('@/app/api/calendar/highlights/[id]/route');
      const result = await PUT(createMockRequest({ title: 'Updated' }), { params: Promise.resolve({ id: 'h1' }) });
      expect(result.status).toBe(401);
    });

    it('returns 404 when highlight not found', async () => {
      authorize();
      (db.query.calendarHighlights.findFirst as jest.Mock).mockResolvedValue(null);
      const { PUT } = await import('@/app/api/calendar/highlights/[id]/route');
      const result = await PUT(createMockRequest({ title: 'Updated' }), { params: Promise.resolve({ id: 'h1' }) });
      expect(result.status).toBe(404);
    });

    it('returns 403 when user is not workspace owner', async () => {
      authorize();
      const highlight = { id: 'h1', workspaceId: 'ws-1', workspace: { userId: 'other-user' } };
      (db.query.calendarHighlights.findFirst as jest.Mock).mockResolvedValue(highlight);
      const { PUT } = await import('@/app/api/calendar/highlights/[id]/route');
      const result = await PUT(createMockRequest({ title: 'Updated' }), { params: Promise.resolve({ id: 'h1' }) });
      expect(result.status).toBe(403);
    });

    it('returns 400 when title exceeds 60 characters', async () => {
      authorize();
      const highlight = { id: 'h1', workspaceId: 'ws-1', workspace: { userId: 'user-1' } };
      (db.query.calendarHighlights.findFirst as jest.Mock).mockResolvedValue(highlight);
      const returning = jest.fn().mockResolvedValue([]);
      const where = jest.fn().mockReturnValue({ returning });
      const set = jest.fn().mockReturnValue({ where });
      db.update.mockReturnValue({ set });
      const { PUT } = await import('@/app/api/calendar/highlights/[id]/route');
      const result = await PUT(createMockRequest({ title: 'a'.repeat(61) }), { params: Promise.resolve({ id: 'h1' }) });
      expect(result.status).toBe(400);
    });

    it('returns 400 when color is invalid', async () => {
      authorize();
      const highlight = { id: 'h1', workspaceId: 'ws-1', workspace: { userId: 'user-1' } };
      (db.query.calendarHighlights.findFirst as jest.Mock).mockResolvedValue(highlight);
      const returning = jest.fn().mockResolvedValue([]);
      const where = jest.fn().mockReturnValue({ returning });
      const set = jest.fn().mockReturnValue({ where });
      db.update.mockReturnValue({ set });
      const { PUT } = await import('@/app/api/calendar/highlights/[id]/route');
      const result = await PUT(createMockRequest({ color: 'invalid' }), { params: Promise.resolve({ id: 'h1' }) });
      expect(result.status).toBe(400);
    });

    it('returns 400 when dates are invalid', async () => {
      authorize();
      const highlight = { id: 'h1', workspaceId: 'ws-1', workspace: { userId: 'user-1' } };
      (db.query.calendarHighlights.findFirst as jest.Mock).mockResolvedValue(highlight);
      const returning = jest.fn().mockResolvedValue([]);
      const where = jest.fn().mockReturnValue({ returning });
      const set = jest.fn().mockReturnValue({ where });
      db.update.mockReturnValue({ set });
      const { PUT } = await import('@/app/api/calendar/highlights/[id]/route');
      const result = await PUT(createMockRequest({ startDate: 'invalid' }), { params: Promise.resolve({ id: 'h1' }) });
      expect(result.status).toBe(400);
    });

    it('returns 400 when start date is after end date', async () => {
      authorize();
      const highlight = { id: 'h1', workspaceId: 'ws-1', workspace: { userId: 'user-1' } };
      (db.query.calendarHighlights.findFirst as jest.Mock).mockResolvedValue(highlight);
      const returning = jest.fn().mockResolvedValue([]);
      const where = jest.fn().mockReturnValue({ returning });
      const set = jest.fn().mockReturnValue({ where });
      db.update.mockReturnValue({ set });
      const { PUT } = await import('@/app/api/calendar/highlights/[id]/route');
      const result = await PUT(createMockRequest({ startDate: '2024-01-02', endDate: '2024-01-01' }), { params: Promise.resolve({ id: 'h1' }) });
      expect(result.status).toBe(400);
    });

    it('updates highlight for authorized user', async () => {
      authorize();
      const highlight = { id: 'h1', workspaceId: 'ws-1', workspace: { userId: 'user-1' } };
      (db.query.calendarHighlights.findFirst as jest.Mock).mockResolvedValue(highlight);
      const updatedHighlight = { ...highlight, title: 'Updated' };
      const returning = jest.fn().mockResolvedValue([updatedHighlight]);
      const where = jest.fn().mockReturnValue({ returning });
      const set = jest.fn().mockReturnValue({ where });
      db.update.mockReturnValue({ set });
      const { PUT } = await import('@/app/api/calendar/highlights/[id]/route');
      const result = await PUT(createMockRequest({ title: 'Updated' }), { params: Promise.resolve({ id: 'h1' }) });
      expect(result.status).toBe(200);
    });
  });

  describe('DELETE /api/calendar/highlights/[id]', () => {
    it('rejects unauthenticated requests', async () => {
      const { DELETE } = await import('@/app/api/calendar/highlights/[id]/route');
      const result = await DELETE({} as Request, { params: Promise.resolve({ id: 'h1' }) });
      expect(result.status).toBe(401);
    });

    it('returns 404 when highlight not found', async () => {
      authorize();
      (db.query.calendarHighlights.findFirst as jest.Mock).mockResolvedValue(null);
      const { DELETE } = await import('@/app/api/calendar/highlights/[id]/route');
      const result = await DELETE({} as Request, { params: Promise.resolve({ id: 'h1' }) });
      expect(result.status).toBe(404);
    });

    it('returns 403 when user is not workspace owner', async () => {
      authorize();
      const highlight = { id: 'h1', workspaceId: 'ws-1', workspace: { userId: 'other-user' } };
      (db.query.calendarHighlights.findFirst as jest.Mock).mockResolvedValue(highlight);
      const { DELETE } = await import('@/app/api/calendar/highlights/[id]/route');
      const result = await DELETE({} as Request, { params: Promise.resolve({ id: 'h1' }) });
      expect(result.status).toBe(403);
    });

    it('deletes highlight for authorized user', async () => {
      authorize();
      const highlight = { id: 'h1', workspaceId: 'ws-1', workspace: { userId: 'user-1' } };
      (db.query.calendarHighlights.findFirst as jest.Mock).mockResolvedValue(highlight);
      const where = jest.fn().mockResolvedValue(undefined);
      db.delete.mockReturnValue({ where });
      const { DELETE } = await import('@/app/api/calendar/highlights/[id]/route');
      const result = await DELETE({} as Request, { params: Promise.resolve({ id: 'h1' }) });
      expect(result.status).toBe(200);
    });

    it('returns 500 on database error', async () => {
      authorize();
      const highlight = { id: 'h1', workspaceId: 'ws-1', workspace: { userId: 'user-1' } };
      (db.query.calendarHighlights.findFirst as jest.Mock).mockResolvedValue(highlight);
      db.delete.mockImplementation(() => {
        throw new Error('DB error');
      });
      const { DELETE } = await import('@/app/api/calendar/highlights/[id]/route');
      const result = await DELETE({} as Request, { params: Promise.resolve({ id: 'h1' }) });
      expect(result.status).toBe(500);
    });
  });
});
