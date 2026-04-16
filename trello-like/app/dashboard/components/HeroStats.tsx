"use client";

import { motion } from "framer-motion";
import { Clock, TrendingUp, Target, Activity } from "lucide-react";
import { timeData } from "../data";

const stats = [
  { label: "Total Time", value: timeData.totalStr, sub: "+12% vs last week", icon: Clock, color: "text-blue-600", bg: "bg-blue-50", ring: "bg-blue-100" },
  { label: "This Week", value: timeData.thisWeekStr, sub: "On track for 50h", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", ring: "bg-emerald-100" },
  { label: "Focus Score", value: `${timeData.focusScore}%`, sub: "Top 10% of users", icon: Target, color: "text-purple-600", bg: "bg-purple-50", ring: "bg-purple-100" },
  { label: "Sessions", value: timeData.totalSessions, sub: `Avg ${timeData.avgLength} per session`, icon: Activity, color: "text-orange-600", bg: "bg-orange-50", ring: "bg-orange-100" },
];

export function HeroStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, i) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
          key={stat.label}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">{stat.label}</span>
            <div className={`p-1.5 rounded-lg ${stat.bg} ring-1 ring-inset ${stat.ring}`}>
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">{stat.sub}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
