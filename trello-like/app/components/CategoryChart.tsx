"use client";
import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CategoryData as CategoryDataType, SessionData } from '@/app/actions/category-actions';

interface PieDataEntry { name: string; value: number; color: string; }
interface ActivityDataEntry { name: string; hours: number; }

const COLORS = [
  '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
  '#8b5cf6', '#f43f5e', '#0ea5e9', '#f97316'
];

interface CategoryWithChildren extends CategoryDataType {
  children?: CategoryWithChildren[];
  sessions?: SessionData[];
}

interface CategoryChartProps {
  categories: CategoryWithChildren[] | null;
  range: string;
}

function getPieData(categories: CategoryWithChildren[]): PieDataEntry[] {
  return categories.map((cat, i) => ({
    name: cat.name,
    value: Math.round(cat.totalDuration / (1000 * 60 * 60) * 10) / 10,
    color: COLORS[i % COLORS.length],
  }));
}

function getActivityData(categories: CategoryWithChildren[], range: string): ActivityDataEntry[] {
  if (categories.length === 0) return [];

  const dayMap = new Map<string, number>();
  const dates: string[] = [];

  let daysToLookBack = 7;
  if (range === 'today') daysToLookBack = 1;
  else if (range === 'month' || range === 'all') daysToLookBack = 30;

  for (let i = daysToLookBack - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dayMap.set(dateStr, 0);
    dates.push(dateStr);
  }

  categories.forEach((cat) => {
    cat.sessions?.forEach((s) => {
      const dateStr = new Date(s.startTime).toISOString().split('T')[0];
      if (dayMap.has(dateStr)) {
        dayMap.set(dateStr, dayMap.get(dateStr)! + s.duration);
      }
    });
  });

  return dates.map(date => ({
    name: new Date(date).toLocaleDateString([], {
      weekday: range === 'week' ? 'short' : undefined,
      day: 'numeric',
      month: range === 'month' ? 'short' : undefined
    }),
    hours: Math.round(dayMap.get(date)! / (1000 * 60 * 60) * 10) / 10,
  }));
}

export function CategoryChart({ categories, range }: CategoryChartProps) {
  const pieData = useMemo(() => categories ? getPieData(categories) : [], [categories]);
  const activityData = useMemo(() => getActivityData(categories || [], range), [categories, range]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Weekly Activity</h4>
          <span className="text-xs font-medium text-gray-500">Hours per day</span>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(val) => `${val}h`}
              />
      <RechartsTooltip
        cursor={{ fill: '#f8fafc' }}
        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
        formatter={(value: unknown) => [`${value} hours`, 'Time']}
      />
              <Bar
                dataKey="hours"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                barSize={range === 'month' ? 12 : 32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time Distribution</h4>
          <span className="text-xs font-medium text-gray-500">By category</span>
        </div>
        <div className="h-[240px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
              >
      {pieData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
              </Pie>
      <RechartsTooltip
        formatter={(value: unknown) => `${value}h`}
        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
      />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-gray-900">
              {pieData.reduce((acc, cur) => acc + cur.value, 0).toFixed(1)}h
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 max-h-[100px] overflow-y-auto scrollbar-thin pr-1">
      {pieData.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600 truncate">{entry.name}</span>
          </div>
          <span className="font-semibold text-gray-900 ml-1">{entry.value}h</span>
        </div>
      ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryChart;
