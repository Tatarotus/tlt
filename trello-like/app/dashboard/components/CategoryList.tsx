"use client";

import { motion } from "framer-motion";
import { categories } from "../data";

export function CategoryList() {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm h-[580px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Categories</h3>
          <p className="text-xs text-slate-500">{categories.length} tracking labels</p>
        </div>
        <div className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-md">
          Sorted by time
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
        {categories.map((cat, i) => (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            key={cat.id}
            className="group relative p-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 flex flex-col gap-1.5 cursor-default"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2 h-2 rounded-full shadow-sm"
                  style={{ backgroundColor: cat.color }}
                />
                <div>
                  <h4 className="font-medium text-slate-900 text-xs">{cat.name}</h4>
                  <p className="text-[10px] text-slate-400">{cat.sessions} sessions</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-900 text-xs">{cat.hours}h</span>
                <span className="text-[10px] text-slate-400 ml-1.5">
                  {cat.percent}%
                </span>
              </div>
            </div>

            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cat.percent}%` }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: cat.color }}
              />
            </div>

            <div className="absolute inset-0 bg-white/98 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center p-3 transition-opacity duration-200 pointer-events-none shadow-sm border border-slate-200/50">
              <div className="flex items-end gap-1 h-full w-full justify-center">
                {cat.history.map((val, idx) => (
                  <motion.div
                    key={idx}
                    className="w-3 rounded-t-sm"
                    style={{
                      height: `${Math.max((val / Math.max(...cat.history)) * 100, 10)}%`,
                      backgroundColor: cat.color,
                      opacity: 0.6 + (idx * 0.05)
                    }}
                  />
                ))}
              </div>
              <span className="absolute top-1.5 left-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">7-Day</span>
            </div>
          </motion.div>
        ))}
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 3px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #CBD5E1;
        }
      `}</style>
    </div>
  );
}
