"use server";

import { db } from '@/db';
import { sessions } from '@/db/schema';
import { desc, gte, and, eq } from 'drizzle-orm';
import { getSession } from '@/lib/session';

export type CategoryRange = 'today' | 'week' | 'month' | 'all';

export interface SessionData {
  id: number;
  category: string;
  startTime: Date;
  endTime: Date | null;
  duration: number;
  userId: number;
  categoryId: number | null;
  cardId: string | null;
  notes: string | null;
  source: string;
}

export interface CategoryData {
  id: number;
  name: string;
  parentId: number | null;
  children?: CategoryData[];
  totalDuration: number;
  sessionCount: number;
  sessions?: SessionData[];
}

interface InternalCategory {
  id: number;
  name: string;
  parentId: number | null;
  children: Map<string, InternalCategory>;
  totalDuration: number;
  sessionCount: number;
  sessions: unknown[];
}

function getStartDate(range: CategoryRange): Date {
  const now = new Date();
  const startDate = new Date();
  if (range === 'today') startDate.setHours(0, 0, 0, 0);
  else if (range === 'week') { startDate.setDate(now.getDate() - 7); startDate.setHours(0, 0, 0, 0); }
  else if (range === 'month') { startDate.setMonth(now.getMonth() - 1); startDate.setHours(0, 0, 0, 0); }
  else return new Date(0);
  return startDate;
}

interface SessionWithDuration { category: string; duration: number; startTime: Date; endTime?: Date | null; [key: string]: unknown; }
function groupCategories(sessionsWithDuration: SessionWithDuration[]) {
  const categoryMap = new Map<string, InternalCategory>();
  sessionsWithDuration.forEach(s => {
    const [mainCategory, subCategory] = s.category.split(':').map((p: string) => p.trim());
    if (!categoryMap.has(mainCategory)) {
      categoryMap.set(mainCategory, { id: 0, name: mainCategory, parentId: null, children: new Map(), totalDuration: 0, sessionCount: 0, sessions: [] });
    }
    const mainCat = categoryMap.get(mainCategory)!;
    mainCat.totalDuration += s.duration;
    mainCat.sessionCount += 1;
    mainCat.sessions.push(s);

    if (subCategory) {
      if (!mainCat.children.has(subCategory)) {
        mainCat.children.set(subCategory, { id: 0, name: subCategory, parentId: 0, children: new Map(), totalDuration: 0, sessionCount: 0, sessions: [] });
      }
      const subCat = mainCat.children.get(subCategory)!;
      subCat.totalDuration += s.duration;
      subCat.sessionCount += 1;
      subCat.sessions.push(s);
    }
  });
  return categoryMap;
}

export async function getCategoryData(range: CategoryRange = 'week') {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const startDate = getStartDate(range);
    const allSessions = await db.select().from(sessions)
      .where(and(gte(sessions.startTime, startDate), eq(sessions.userId, session.userId)))
      .orderBy(desc(sessions.startTime));

    const sessionsWithDuration = allSessions.map(s => {
      const end = s.endTime ? new Date(s.endTime) : new Date();
      return { ...s, duration: Math.max(0, end.getTime() - new Date(s.startTime).getTime()) };
    });

    const categoryMap = groupCategories(sessionsWithDuration);
    const categories = Array.from(categoryMap.values()).map(cat => ({
      ...cat, children: Array.from(cat.children.values()).sort((a, b) => b.totalDuration - a.totalDuration)
    })).sort((a, b) => b.totalDuration - a.totalDuration);

    return { success: true, categories, totalDuration: sessionsWithDuration.reduce((sum, s) => sum + s.duration, 0), totalSessions: sessionsWithDuration.length };
  } catch (_error) {
    return { success: false, error: "Failed to fetch category data" };
  }
}