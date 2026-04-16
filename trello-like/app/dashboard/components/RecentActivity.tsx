"use client";

import { motion } from "framer-motion";
import { recentActivity } from "../data";

export function RecentActivity() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
        <p className="text-xs text-slate-500">Your latest sessions</p>
      </div>

      <div className="relative border-l-2 border-slate-100 ml-2 space-y-4 flex-1">
        {recentActivity.map((activity, i) => (
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
            key={activity.id}
            className="relative pl-5"
          >
            <div
              className="absolute -left-[5px] top-1 w-2 h-2 rounded-full ring-2 ring-white shadow-sm"
              style={{ backgroundColor: activity.color }}
            />
            <div className="flex flex-col">
              <h4 className="font-medium text-slate-900 text-xs">{activity.task}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span 
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                  style={{ backgroundColor: `${activity.color}15`, color: activity.color }}
                >
                  {activity.category}
                </span>
                <span className="text-[10px] text-slate-400">{activity.duration}</span>
              </div>
            </div>
            <span className="absolute right-0 top-1 text-[10px] font-medium text-slate-400">{activity.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
