"use client";

import { useState, useEffect, useMemo } from 'react';
import { Clock, ChevronRight, ChevronDown, Calendar, Zap, ListOrdered, TrendingUp } from 'lucide-react';
import { getCategoryData, CategoryRange, CategoryData as CategoryDataType, SessionData } from '@/app/actions/category-actions';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

const COLORS = [
  '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
  '#8b5cf6', '#f43f5e', '#0ea5e9', '#f97316'
];

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
}

function MetricCard({ title, value, icon, colorClass }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[100px]">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-md ${colorClass}`}>
          {icon}
        </div>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
      </div>
      <div className="text-xl font-bold text-gray-900 truncate">
        {value}
      </div>
    </div>
  );
}

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface CategoryWithChildren extends CategoryDataType {
  children?: CategoryWithChildren[];
  sessions?: SessionData[];
}

function CategoryItem({ category, index }: { category: CategoryWithChildren, index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const color = COLORS[index % COLORS.length];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
      {/* Category Header */}
      <div
        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="font-semibold text-gray-900">{category.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-bold text-gray-900">{formatDuration(category.totalDuration)}</div>
            <div className="text-xs text-gray-500">{category.sessionCount} sessions</div>
          </div>
          {category.children && category.children.length > 0 && (
            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          )}
        </div>
      </div>

      {/* Sessions List */}
      {isExpanded && category.sessions && (
        <div className="divide-y divide-gray-100 bg-white">
          {category.sessions.map((session) => (
            <div key={session.id} className="p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {session.category}
                  </div>
                  {session.notes && (
                    <div className="text-xs text-gray-500 truncate max-w-md">
                      {session.notes}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{formatTime(session.startTime)}</span>
                  <span className="font-medium text-gray-700">
                    {formatDuration(session.duration)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryDashboard() {
  const [range, setRange] = useState<CategoryRange>('week');
  const [data, setData] = useState<{
    categories: CategoryWithChildren[];
    totalDuration: number;
    totalSessions: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getCategoryData(range);
      if (res.success && res.categories) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setData(res as any);
      }
      setLoading(false);
    }
    loadData();
  }, [range]);

  const { categories: categoryList, totalDuration, totalSessions } = data || {};

  const pieData = useMemo(() => {
    return categoryList ? categoryList.map((cat, i: number) => ({
      name: cat.name,
      value: Math.round(cat.totalDuration / (1000 * 60 * 60) * 10) / 10,
      color: COLORS[i % COLORS.length],
    })) : [];
  }, [categoryList]);

  const activityData = useMemo(() => {
    if (!categoryList || categoryList.length === 0) return [];
    
    const dayMap = new Map<string, number>();
    const dates = [];
    
    // Determine days to show based on range
    let daysToLookBack = 7;
    if (range === 'today') daysToLookBack = 1;
    else if (range === 'month') daysToLookBack = 30;
    else if (range === 'all') daysToLookBack = 30;

    for (let i = daysToLookBack - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dayMap.set(dateStr, 0);
      dates.push(dateStr);
    }

    categoryList.forEach((cat) => {
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
  }, [categoryList, range]);

  if (loading && !data) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-500">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gray-900">Time by Category</h1>
        <div className="relative group">
          <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm capitalize">
            {range === 'all' ? 'All Time' : range} <ChevronRight size={16} className="text-gray-400 rotate-90" />
          </button>
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
            {['today', 'week', 'month', 'all'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r as CategoryRange)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors capitalize border-b border-gray-50 last:border-0"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Time"
          value={formatDuration(totalDuration || 0)}
          icon={<Clock size={14} className="text-blue-600" />}
          colorClass="bg-blue-50"
        />
        <MetricCard
          title="This Week"
          value={formatDuration(totalDuration || 0)}
          icon={<Calendar size={14} className="text-green-600" />}
          colorClass="bg-green-50"
        />
        <MetricCard
          title="Categories"
          value={categoryList?.length || 0}
          icon={<Zap size={14} className="text-indigo-600" />}
          colorClass="bg-indigo-50"
        />
        <MetricCard
          title="Total Sessions"
          value={totalSessions || 0}
          icon={<ListOrdered size={14} className="text-red-600" />}
          colorClass="bg-red-50"
        />
      </div>

      {/* Main Content Grid: 35% Categories | 65% Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Categories List (4/12 = 33.3%, close to 35%) */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full flex flex-col">
          <h3 className="text-base font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <ListOrdered size={18} className="text-gray-500" />
            Categories ({categoryList?.length || 0})
          </h3>
          {categoryList && categoryList.length > 0 ? (
            <div className="space-y-3 flex-1 overflow-y-auto scrollbar-thin pr-2 max-h-[600px]">
              {categoryList.map((category: CategoryWithChildren, index: number) => (
                <CategoryItem
                  key={category.name}
                  category={category}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <Clock size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No time entries yet</p>
            </div>
          )}
        </div>

        {/* Right: Insights Card (8/12 = 66.6%, close to 65%) */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" />
              Productivity Insights
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Daily Activity
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                Distribution
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {/* Activity Chart */}
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
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [`${value} hours`, 'Time']}
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

            {/* Distribution Pie Chart */}
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
                      {pieData.map((entry: { name: string; value: number; color: string }, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => `${value}h`}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-gray-900">{pieData.reduce((acc: number, cur: { value: number }) => acc + cur.value, 0).toFixed(1)}h</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total</span>
                </div>
              </div>
              
              {/* Compact Legend */}
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 max-h-[100px] overflow-y-auto scrollbar-thin pr-1">
                {pieData.map((entry: { name: string; value: number; color: string }) => (
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
        </div>
      </div>
    </div>
  );
}
