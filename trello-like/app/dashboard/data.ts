export const timeData = {
  totalStr: "50h 34m",
  totalDec: 50.56,
  thisWeekStr: "42h 12m",
  focusScore: 92,
  totalSessions: 142,
  avgLength: "21m",
};

export const categories = [
  { id: "1", name: "Learning", hours: 25.8, sessions: 45, color: "#3B82F6", percent: 50.8, history: [2, 4, 3, 5, 4, 6, 2] },
  { id: "2", name: "Code", hours: 10.2, sessions: 32, color: "#8B5CF6", percent: 20.1, history: [1, 2, 1, 3, 2, 0, 1] },
  { id: "3", name: "Rest", hours: 4.5, sessions: 20, color: "#10B981", percent: 8.9, history: [0.5, 1, 1, 0.5, 0.5, 1, 0] },
  { id: "4", name: "Food", hours: 3.1, sessions: 15, color: "#F59E0B", percent: 6.1, history: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.1] },
  { id: "5", name: "Sleep", hours: 2.5, sessions: 5, color: "#6366F1", percent: 4.9, history: [0, 0, 1, 0, 1, 0, 0.5] },
  { id: "6", name: "Plants", hours: 1.2, sessions: 8, color: "#22C55E", percent: 2.4, history: [0.2, 0.1, 0.3, 0.2, 0.1, 0.1, 0.2] },
  { id: "7", name: "Weight", hours: 1.0, sessions: 4, color: "#EF4444", percent: 2.0, history: [0.2, 0.2, 0.2, 0.2, 0, 0.2, 0] },
  { id: "8", name: "Feedback", hours: 1.0, sessions: 6, color: "#EC4899", percent: 2.0, history: [0, 0.2, 0.3, 0.1, 0.1, 0.2, 0.1] },
  { id: "9", name: "House", hours: 0.8, sessions: 4, color: "#64748B", percent: 1.6, history: [0, 0, 0.2, 0.3, 0.1, 0.2, 0] },
  { id: "10", name: "Test", hours: 0.3, sessions: 3, color: "#06B6D4", percent: 0.6, history: [0.1, 0, 0, 0.1, 0.1, 0, 0] },
];

export const recentActivity = [
  { id: "1", task: "Next.js 15 Deep Dive", category: "Learning", duration: "45m", time: "10:30 AM", color: "#3B82F6" },
  { id: "2", task: "Database Migrations", category: "Code", duration: "1h 20m", time: "09:00 AM", color: "#8B5CF6" },
  { id: "3", task: "Morning Walk", category: "Rest", duration: "30m", time: "08:15 AM", color: "#10B981" },
  { id: "4", task: "Breakfast", category: "Food", duration: "25m", time: "07:45 AM", color: "#F59E0B" },
];

export const aiInsights = [
  { id: "1", title: "Peak Focus Pattern", desc: "You maintain 95% focus during 9am - 11am.", icon: "zap" },
  { id: "2", title: "Burnout Risk", desc: "Code sessions often exceed 2 hours without breaks.", icon: "alert" },
  { id: "3", title: "Optimal Schedule", desc: "Switching to 'Learning' after 'Rest' yields best results.", icon: "trend" },
];
