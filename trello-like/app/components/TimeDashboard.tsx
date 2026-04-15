"use client"

import { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { 
  Clock, Calendar, Zap, ListOrdered, ChevronDown, 
  LayoutDashboard, MoreHorizontal 
} from 'lucide-react';
import { getDashboardData, DashboardRange } from '@/app/actions/dashboard-actions';

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

export function TimeDashboard() {
const [range, setRange] = useState<DashboardRange>('week');
const [data, setData] = useState<any>(null);
const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getDashboardData(range);
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

  const { metrics, donutData, barData, recentLogs, categories } = data || {};

  return (
    <div className="space-y-6 mb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gray-900">Time Dashboard</h1>
        <div className="relative group">
          <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm capitalize">
            {range === 'all' ? 'All Time' : range} <ChevronDown size={16} className="text-gray-400" />
          </button>
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
            {['today', 'week', 'month', 'all'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r as DashboardRange)}
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
          title="Today" 
          value={metrics?.today || '0h 0m'} 
          icon={<Clock size={14} className="text-red-600" />} 
          colorClass="bg-red-50"
        />
        <MetricCard 
          title="This Week" 
          value={metrics?.week || '0h 0m'} 
          icon={<Calendar size={14} className="text-green-600" />} 
          colorClass="bg-green-50"
        />
        <MetricCard 
          title="Most Used" 
          value={metrics?.mostUsed || 'None'} 
          icon={<Zap size={14} className="text-blue-600" />} 
          colorClass="bg-blue-50"
        />
        <MetricCard 
          title="Entries" 
          value={metrics?.entries || 0} 
          icon={<ListOrdered size={14} className="text-indigo-600" />} 
          colorClass="bg-indigo-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart Box */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-[450px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-gray-800">Time by Category ({range === 'week' ? 'Last 7 Days' : range})</h3>
            <span className="text-xs font-medium text-gray-400 capitalize">{range === 'week' ? 'Last 7 days' : range} <ChevronDown size={12} className="inline ml-1" /></span>
          </div>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4 min-h-0">
             <div className="relative w-full h-full max-w-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                    >
{donutData?.map((entry: { name: string; value: number }, index: number) => (
<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
))}
                    </Pie>
                    <RechartsTooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold text-gray-900">{metrics?.week}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total</span>
                </div>
             </div>
             
             {/* Custom Legend */}
             <div className="flex flex-col gap-2 overflow-y-auto max-h-full pr-2 scrollbar-thin scrollbar-thumb-gray-200">
{donutData?.map((entry: { name: string; value: number }, index: number) => (
<div key={entry.name} className="flex items-center justify-between gap-6 min-w-[120px]">
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
<span className="text-xs font-medium text-gray-600 truncate max-w-[80px]">{entry.name}</span>
</div>
<span className="text-xs font-bold text-gray-400">
{Math.round((entry.value / donutData.reduce((acc: number, cur: { value: number }) => acc + cur.value, 0)) * 100)}%
</span>
</div>
))}
             </div>
          </div>
        </div>

        {/* Stacked Bar Chart & Table Box */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-[450px]">
           <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-800">Daily Time (Last 7 Days)</h3>
           </div>
           
           <div className="flex-1 min-h-0 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  {categories?.map((cat: string, index: number) => (
                    <Bar 
                      key={cat} 
                      dataKey={cat} 
                      stackId="a" 
                      fill={COLORS[index % COLORS.length]} 
                      radius={[0, 0, 0, 0]} 
                      barSize={32}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
           </div>

           {/* Recent Logs Table */}
           <div className="border-t border-gray-100 pt-4 overflow-hidden">
             <table className="w-full text-left">
               <thead>
                 <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                   <th className="pb-2">Category Logs</th>
                   <th className="pb-2">Start</th>
                   <th className="pb-2">Duration</th>
                   <th className="pb-2">Notes</th>
                 </tr>
               </thead>
<tbody className="divide-y divide-gray-50">
{recentLogs?.map((log: { id: number; category: string; startTime: string; duration: number; notes?: string | null }) => (
<tr key={log.id} className="text-xs text-gray-600 hover:bg-gray-50/50 transition-colors">
<td className="py-2 font-medium text-gray-800">{log.category}</td>
<td className="py-2">{new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
<td className="py-2">{Math.floor(log.duration / 3600)}h {Math.floor((log.duration % 3600) / 60)}m</td>
                     <td className="py-2 text-gray-400 truncate max-w-[120px]">{log.notes || '-'}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
}
