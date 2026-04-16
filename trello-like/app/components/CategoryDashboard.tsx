"use client";

import { useState, useEffect } from 'react';
import { Clock, ChevronRight, ChevronDown, Calendar, Zap, ListOrdered } from 'lucide-react';
import { getCategoryData, CategoryRange, CategoryData as CategoryDataType } from '@/app/actions/category-actions';

const COLORS = [
  '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6'
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

function CategoryItem({ category, index }: { category: CategoryDataType & { children?: CategoryDataType[] }, index: number }) {
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
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getCategoryData(range);
      if (res.success) {
        setData(res);
      }
      setLoading(false);
    }
    loadData();
  }, [range]);

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

  const { categories: categoryList, totalDuration, totalSessions } = data || {};

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

      {/* Categories List */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Categories ({categoryList?.length || 0})
        </h3>
        {categoryList && categoryList.length > 0 ? (
          <div>
            {categoryList.map((category: CategoryDataType & { children?: CategoryDataType[] }, index: number) => (
              <CategoryItem
                key={category.name}
                category={category}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Clock size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No time entries yet</p>
            <p className="text-sm">Start tracking time to see your categories here</p>
          </div>
        )}
      </div>
    </div>
  );
}
