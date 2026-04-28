"use server"

import { db } from '@/db';
import { sessions } from '@/db/schema';
import { desc, gte, and, eq } from 'drizzle-orm';
import { getSession } from '@/lib/session';

interface SessionWithId {
	id: number;
	category: string;
	categoryId: number | null;
	userId: string;
	startTime: Date;
	endTime: Date | null;
	notes: string | null;
	cardId: string | null;
	source: string;
	createdAt: Date | null;
}

export type DashboardRange = 'today' | 'week' | 'month' | 'all';

function getStartDate(range: DashboardRange): Date {
  const now = new Date();
  const startDate = new Date();
  if (range === 'today') {
    startDate.setHours(0, 0, 0, 0);
  } else if (range === 'week') {
    startDate.setDate(now.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);
  } else if (range === 'month') {
    startDate.setMonth(now.getMonth() - 1);
    startDate.setHours(0, 0, 0, 0);
  } else {
    return new Date(0);
  }
  return startDate;
}

function calculateMetrics(allSessions: SessionWithId[]) {
  const now = new Date();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date();
  weekStart.setDate(now.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  let todayDuration = 0, weekDuration = 0;
  const categoryCounts: Record<string, number> = {};
  const categoryDurations: Record<string, number> = {};

  allSessions.forEach(s => {
    const start = new Date(s.startTime);
    const end = s.endTime ? new Date(s.endTime) : now;
    const duration = Math.max(0, end.getTime() - start.getTime());

    if (start >= todayStart) todayDuration += duration;
    if (start >= weekStart) weekDuration += duration;

    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    categoryDurations[s.category] = (categoryDurations[s.category] || 0) + duration;
  });

  const mostUsed = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
  return { todayDuration, weekDuration, mostUsed, categoryDurations };
}

export async function getDashboardData(range: DashboardRange = 'week') {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const startDate = getStartDate(range);
    const allSessions = await db.select().from(sessions)
      .where(and(gte(sessions.startTime, startDate), eq(sessions.userId, session.userId)))
      .orderBy(desc(sessions.startTime));

    const { todayDuration, weekDuration, mostUsed, categoryDurations } = calculateMetrics(allSessions);

    const donutData = Object.entries(categoryDurations)
      .map(([name, value]) => ({ name, value: Math.round(value / (1000 * 60 * 60) * 10) / 10 }))
      .sort((a, b) => b.value - a.value);

    return {
      success: true,
      metrics: { today: formatDuration(todayDuration), week: formatDuration(weekDuration), mostUsed, entries: allSessions.length },
      donutData,
      barData: getBarData(allSessions),
      recentLogs: allSessions.slice(0, 8).map(s => ({
        id: s.id, category: s.category, startTime: s.startTime,
        duration: s.endTime ? Math.floor((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 1000) : 0,
        notes: s.notes
      })),
      categories: Object.keys(categoryDurations)
    };
  } catch (_error) {
    return { success: false, error: "Failed to fetch dashboard data" };
  }
}

function getBarData(allSessions: SessionWithId[]) {
	const now = new Date();
	const dailyData: Record<string, Record<string, number>> = {};
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

	last7Days.forEach(date => { dailyData[date] = { date: 0 }; });
  allSessions.forEach(s => {
    const dateStr = new Date(s.startTime).toISOString().split('T')[0];
    if (dailyData[dateStr]) {
      const end = s.endTime ? new Date(s.endTime) : now;
      const duration = Math.max(0, (end.getTime() - new Date(s.startTime).getTime()) / (1000 * 60 * 60));
      dailyData[dateStr][s.category] = (Number(dailyData[dateStr][s.category] || 0)) + duration;
    }
  });
  return Object.values(dailyData);
}

function formatDuration(ms: number) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}
// Quality fixed
