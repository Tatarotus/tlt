"use server"

import { db } from '@/db';
import { sessions } from '@/db/schema';
import { desc, gte, and, eq } from 'drizzle-orm';
import { getSession } from '@/lib/session';

export type DashboardRange = 'today' | 'week' | 'month' | 'all';

// eslint-disable-next-line max-statements
export async function getDashboardData(range: DashboardRange = 'week') {
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

// Fetch all sessions within range for charts and metrics
const allSessions = await db.select().from(sessions)
.where(
and(
gte(sessions.startTime, startDate),
eq(sessions.userId, session.userId)
)
)
.orderBy(desc(sessions.startTime));

    // Calculate Metrics
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date();
    weekStart.setDate(now.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    let todayDuration = 0;
    let weekDuration = 0;
    const categoryCounts: Record<string, number> = {};
    const categoryDurations: Record<string, number> = {};

    allSessions.forEach(s => {
      const start = new Date(s.startTime);
      const end = s.endTime ? new Date(s.endTime) : new Date();
      const duration = Math.max(0, end.getTime() - start.getTime());

      if (start >= todayStart) todayDuration += duration;
      if (start >= weekStart) weekDuration += duration;

      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
      categoryDurations[s.category] = (categoryDurations[s.category] || 0) + duration;
    });

    const mostUsedCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    const donutData = Object.entries(categoryDurations)
      .map(([name, value]) => ({ 
        name, 
        value: Math.round(value / (1000 * 60 * 60) * 10) / 10
      }))
      .sort((a, b) => b.value - a.value);

    // DAILY BAR DATA
    const dailyData: Record<string, Record<string, number | string>> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    last7Days.forEach(date => { dailyData[date] = { date }; });

    allSessions.forEach(s => {
      const dateStr = new Date(s.startTime).toISOString().split('T')[0];
      if (dailyData[dateStr]) {
        const start = new Date(s.startTime);
        const end = s.endTime ? new Date(s.endTime) : new Date();
        const duration = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
        dailyData[dateStr][s.category] = (Number(dailyData[dateStr][s.category] || 0)) + duration;
      }
    });

    return {
      success: true,
      metrics: {
        today: formatDuration(todayDuration),
        week: formatDuration(weekDuration),
        mostUsed: mostUsedCategory,
        entries: allSessions.length
      },
      donutData,
      barData: Object.values(dailyData),
      recentLogs: allSessions.slice(0, 8).map(s => ({
        id: s.id,
        category: s.category,
        startTime: s.startTime,
        duration: s.endTime ? Math.floor((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 1000) : 0,
        notes: s.notes
      })),
      categories: Object.keys(categoryDurations)
    };
  } catch (_error) {
    return { success: false, error: "Failed to fetch dashboard data" };
  }
}

function formatDuration(ms: number) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}
// Quality fixed
