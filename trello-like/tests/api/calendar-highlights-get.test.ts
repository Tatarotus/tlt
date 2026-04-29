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

jest.mock('@/lib/date-utils', () => ({
  safeToISOString: (date: unknown) => date ? new Date(date).toISOString() : null,
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

const validHighlight = {
  workspaceSlug: 'ws-1',
  title: 'Event',
  color: 'crimson',
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-01-02T00:00:00Z',
};

describe('Calendar Highlights API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    unauthorize();
    (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue(null);
    (db.query.calendarHighlights.findMany as jest.Mock).mockResolvedValue([]);
    (db.query.calendarHighlights.findFirst as jest.Mock).mockResolvedValue(null);
  });

  describe('GET /api/calendar/highlights', () => {
    it('rejects unauthenticated requests', async () => {
      const { GET } = await import('@/app/api/calendar/highlights/route');
      const req = createMockRequest({}, { get: () => 'ws-1' } as unknown as URLSearchParams);
      const result = await GET(req);
      expect(result.status).toBe(401);
    });

    it('returns 400 when workspaceSlug is missing', async () => {
      authorize();
      const { GET } = await import('@/app/api/calendar/highlights/route');
      const req = createMockRequest({}, new URLSearchParams());
      const result = await GET(req);
      expect(result.status).toBe(400);
    });

    it('returns 404 when workspace not found', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue(null);
      const { GET } = await import('@/app/api/calendar/highlights/route');
      const req = createMockRequest({}, { get: () => 'ws-1' } as unknown as URLSearchParams);
      const result = await GET(req);
      expect(result.status).toBe(404);
    });

    it('returns highlights for authenticated user', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue({ id: 'ws-1', slug: 'ws-1', userId: 'user-1' });
      const highlights = [{ id: 'h1', title: 'Event', color: 'crimson', startDate: '2024-01-01', endDate: '2024-01-02', workspaceId: 'ws-1' }];
      (db.query.calendarHighlights.findMany as jest.Mock).mockResolvedValue(highlights);
      const { GET } = await import('@/app/api/calendar/highlights/route');
      const req = createMockRequest({}, { get: () => 'ws-1' } as unknown as URLSearchParams);
      const result = await GET(req);
      expect(result.status).toBe(200);
    });

    it('returns 500 on database error', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockImplementation(() => {
        throw new Error('DB error');
      });
      const { GET } = await import('@/app/api/calendar/highlights/route');
      const req = createMockRequest({}, { get: () => 'ws-1' } as unknown as URLSearchParams);
      const result = await GET(req);
      expect(result.status).toBe(500);
    });
  });

  describe('POST /api/calendar/highlights', () => {
    it('rejects unauthenticated requests', async () => {
      const { POST } = await import('@/app/api/calendar/highlights/route');
      const result = await POST(createMockRequest(validHighlight));
      expect(result.status).toBe(401);
    });

    it('returns 400 when required fields are missing', async () => {
      authorize();
      const { POST } = await import('@/app/api/calendar/highlights/route');
      const result = await POST(createMockRequest({ workspaceSlug: 'ws-1' }));
      expect(result.status).toBe(400);
    });

    it('returns 400 when title exceeds 60 characters', async () => {
      authorize();
      const { POST } = await import('@/app/api/calendar/highlights/route');
      const result = await POST(createMockRequest({ ...validHighlight, title: 'a'.repeat(61) }));
      expect(result.status).toBe(400);
    });

    it('returns 400 when color is invalid', async () => {
      authorize();
      const { POST } = await import('@/app/api/calendar/highlights/route');
      const result = await POST(createMockRequest({ ...validHighlight, color: 'invalid' }));
      expect(result.status).toBe(400);
    });

    it('returns 400 when start date is invalid', async () => {
      authorize();
      const { POST } = await import('@/app/api/calendar/highlights/route');
      const result = await POST(createMockRequest({ ...validHighlight, startDate: 'invalid' }));
      expect(result.status).toBe(400);
    });

    it('returns 400 when end date is invalid', async () => {
      authorize();
      const { POST } = await import('@/app/api/calendar/highlights/route');
      const result = await POST(createMockRequest({ ...validHighlight, endDate: 'invalid' }));
      expect(result.status).toBe(400);
    });

    it('returns 400 when start date is after end date', async () => {
      authorize();
      const { POST } = await import('@/app/api/calendar/highlights/route');
      const result = await POST(createMockRequest({
        ...validHighlight,
        startDate: '2024-01-02T00:00:00Z',
        endDate: '2024-01-01T00:00:00Z',
      }));
      expect(result.status).toBe(400);
    });

    it('returns 404 when workspace not found', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue(null);
      const { POST } = await import('@/app/api/calendar/highlights/route');
      const result = await POST(createMockRequest(validHighlight));
      expect(result.status).toBe(404);
    });

    it('creates highlight for authenticated user', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue({ id: 'ws-1', slug: 'ws-1', userId: 'user-1' });
      const newHighlight = { id: 'h1', ...validHighlight, workspaceId: 'ws-1' };
      const returning = jest.fn().mockResolvedValue([newHighlight]);
      const values = jest.fn().mockReturnValue({ returning });
      db.insert.mockReturnValue({ values });
      const { POST } = await import('@/app/api/calendar/highlights/route');
      const result = await POST(createMockRequest(validHighlight));
      expect(result.status).toBe(200);
    });

    it('returns 500 on database error', async () => {
      authorize();
      (db.query.workspaces.findFirst as jest.Mock).mockResolvedValue({ id: 'ws-1', slug: 'ws-1', userId: 'user-1' });
      db.insert.mockImplementation(() => {
        throw new Error('DB error');
      });
      const { POST } = await import('@/app/api/calendar/highlights/route');
      const result = await POST(createMockRequest(validHighlight));
      expect(result.status).toBe(500);
    });
  });
});
