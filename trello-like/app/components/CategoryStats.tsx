"use client";
import { Clock, Calendar, Zap, ListOrdered } from 'lucide-react';

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

interface CategoryStatsProps {
  totalDuration: number;
  totalSessions: number;
  categoryCount: number;
}

export function CategoryStats({ totalDuration, totalSessions, categoryCount }: CategoryStatsProps) {
  const formatDuration = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
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
        value={categoryCount || 0}
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
  );
}

export default CategoryStats;
