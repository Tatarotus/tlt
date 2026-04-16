"use server";

import { db } from '@/db';
import { sessions, categories } from '@/db/schema';
import { desc, gte, and, eq, sql } from 'drizzle-orm';
import { getSession } from '@/lib/session';

export type CategoryRange = 'today' | 'week' | 'month' | 'all';

export interface CategoryData {
  id: number;
  name: string;
  parentId: number | null;
  children?: CategoryData[];
  totalDuration: number; // in milliseconds
  sessionCount: number;
  sessions?: SessionData[];
}

export interface SessionData {
  id: number;
  category: string;
  startTime: Date;
  endTime: Date | null;
  duration: number;
  notes: string | null;
}

export async function getCategoryData(range: CategoryRange = 'week') {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const now = new Date();
    let startDate = new Date();

    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'week') {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'month') {
      startDate.setMonth(now.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date(0); // All time
    }

    // Fetch all sessions within range
    const allSessions = await db
      .select()
      .from(sessions)
      .where(
        and(
          gte(sessions.startTime, startDate),
          eq(sessions.userId, session.userId)
        )
      )
      .orderBy(desc(sessions.startTime));

    // Calculate duration for each session
    const sessionsWithDuration = allSessions.map(s => {
      const start = new Date(s.startTime);
      const end = s.endTime ? new Date(s.endTime) : new Date();
      const duration = Math.max(0, end.getTime() - start.getTime());
      return {
        id: s.id,
        category: s.category,
        startTime: s.startTime,
        endTime: s.endTime,
        duration,
        notes: s.notes,
      };
    });

    // Group by main category (before colon)
    const categoryMap = new Map<string, any>();

    sessionsWithDuration.forEach(s => {
      const parts = s.category.split(':');
      const mainCategory = parts[0].trim();
      const subCategory = parts.length > 1 ? parts[1].trim() : null;

      // Create or get main category
      if (!categoryMap.has(mainCategory)) {
        categoryMap.set(mainCategory, {
          id: 0,
          name: mainCategory,
          parentId: null,
          children: new Map<string, any>(),
          totalDuration: 0,
          sessionCount: 0,
          sessions: [],
        });
      }

      const mainCat = categoryMap.get(mainCategory);
      mainCat.totalDuration += s.duration;
      mainCat.sessionCount += 1;
      mainCat.sessions.push(s);

      // Handle subcategory if exists
      if (subCategory) {
        if (!mainCat.children.has(subCategory)) {
          mainCat.children.set(subCategory, {
            id: 0,
            name: subCategory,
            parentId: 0,
            totalDuration: 0,
            sessionCount: 0,
            sessions: [],
          });
        }
        const subCat = mainCat.children.get(subCategory);
        subCat.totalDuration += s.duration;
        subCat.sessionCount += 1;
        subCat.sessions.push(s);
      }
    });

    // Convert to array and sort by duration
    const categoryArray = Array.from(categoryMap.values()).map((cat: any) => ({
      ...cat,
      children: Array.from(cat.children.values()).sort((a: any, b: any) => b.totalDuration - a.totalDuration),
    })).sort((a: any, b: any) => b.totalDuration - a.totalDuration);

    return {
      success: true,
      categories: categoryArray,
      totalDuration: sessionsWithDuration.reduce((sum, s) => sum + s.duration, 0),
      totalSessions: sessionsWithDuration.length,
    };

  } catch (error) {
    console.error("Category data error:", error);
    return { success: false, error: "Failed to fetch category data" };
  }
}

function formatDuration(ms: number) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}