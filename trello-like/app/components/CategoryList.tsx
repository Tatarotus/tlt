"use client";
import { useState } from 'react';
import { ChevronRight, ChevronDown, Clock } from 'lucide-react';
import { CategoryData as CategoryDataType, SessionData } from '@/app/actions/category-actions';

const COLORS = [
  '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
  '#8b5cf6', '#f43f5e', '#0ea5e9', '#f97316'
];

interface CategoryWithChildren extends CategoryDataType {
  children?: CategoryWithChildren[];
  sessions?: SessionData[];
}

interface CategoryItemProps {
  category: CategoryWithChildren;
  index: number;
}

function CategoryItem({ category, index }: CategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const color = COLORS[index % COLORS.length];

  const formatDuration = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
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

interface CategoryListProps {
  categories: CategoryWithChildren[] | null;
}

export function CategoryList({ categories }: CategoryListProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full flex flex-col">
      <h3 className="text-base font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Clock size={18} className="text-gray-500" />
        Categories ({categories?.length || 0})
      </h3>
      {categories && categories.length > 0 ? (
        <div className="space-y-3 flex-1 overflow-y-auto scrollbar-thin pr-2 max-h-[600px]">
          {categories.map((category: CategoryWithChildren, index: number) => (
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
  );
}

export default CategoryList;
