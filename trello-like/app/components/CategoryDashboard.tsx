"use client";
import { useState, useEffect } from 'react';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { getCategoryData, CategoryRange, CategoryData as CategoryDataType, SessionData } from '@/app/actions/category-actions';
import { CategoryStats } from './CategoryStats';
import { CategoryChart } from './CategoryChart';
import { CategoryList } from './CategoryList';

interface CategoryWithChildren extends CategoryDataType {
  children?: CategoryWithChildren[];
  sessions?: SessionData[];
}

interface CategoryDashboardData {
  categories: CategoryWithChildren[];
  totalDuration: number;
  totalSessions: number;
}

export function CategoryDashboard() {
  const [range, setRange] = useState<CategoryRange>('week');
  const [data, setData] = useState<CategoryDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getCategoryData(range);
      if (res.success && res.categories) {
        setData({
          categories: res.categories as unknown as CategoryWithChildren[],
          totalDuration: res.totalDuration,
          totalSessions: res.totalSessions,
        });
      }
      setLoading(false);
    }
    loadData();
  }, [range]);

  const { categories, totalDuration, totalSessions } = data || {};

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

      <CategoryStats
        totalDuration={totalDuration || 0}
        totalSessions={totalSessions || 0}
        categoryCount={categories?.length || 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <CategoryList categories={categories || null} />
        </div>

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

          <CategoryChart categories={categories || null} range={range} />
        </div>
      </div>
    </div>
  );
}

export default CategoryDashboard;
