"use client";

import { motion } from "framer-motion";
import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer } from "recharts";
import { categories } from "../data";

export function PremiumChart() {
  const sortedData = [...categories].sort((a, b) => a.hours - b.hours);

  const chartData = sortedData.map(c => ({
    name: c.name,
    value: c.hours,
    fill: c.color,
  }));

  const totalHours = chartData.reduce((acc, curr) => acc + curr.value, 0);
  const topCategory = sortedData[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden h-[580px]"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Time Distribution</h3>
          <p className="text-xs text-slate-500">Your focus allocation this week</p>
        </div>
        <div className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-full">
          Last 7 days
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col items-center justify-center bg-white rounded-2xl w-36 h-36 shadow-xl border border-slate-100"
          >
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-0.5">Total Time</span>
            <span className="text-4xl font-black text-slate-900 tracking-tighter">
              {totalHours.toFixed(1)}h
            </span>
            <div 
              className="flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full border"
              style={{ 
                backgroundColor: `${topCategory.color}15`,
                borderColor: `${topCategory.color}30`,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: topCategory.color }} />
              <span className="text-[10px] font-semibold" style={{ color: topCategory.color }}>
                {topCategory.name}
              </span>
              <span className="text-[9px] opacity-60">{topCategory.percent}%</span>
            </div>
          </motion.div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="25%"
            outerRadius="95%"
            barSize={20}
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              background={{ fill: '#F8FAFC' }}
              dataKey="value"
              cornerRadius={8}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-3 rounded-xl shadow-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.fill }} />
                        <span className="font-semibold text-slate-900 text-sm">{data.name}</span>
                      </div>
                      <p className="text-slate-600 text-xs">{data.value} hours</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
