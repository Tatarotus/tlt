"use client";

import { motion } from "framer-motion";
import { Zap, AlertCircle, TrendingUp } from "lucide-react";
import { aiInsights } from "../data";

const iconMap = {
  zap: Zap,
  alert: AlertCircle,
  trend: TrendingUp,
};

const colorMap = {
  zap: { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", ring: "ring-amber-100" },
  alert: { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", ring: "ring-rose-100" },
  trend: { text: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", ring: "ring-indigo-100" },
};

export function AIInsights() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-sm">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">AI Insights</h3>
          <p className="text-xs text-slate-500">Analyzed from your tracked time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
        {aiInsights.map((insight, i) => {
          const Icon = iconMap[insight.icon as keyof typeof iconMap];
          const colors = colorMap[insight.icon as keyof typeof colorMap];

          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
              key={insight.id}
              className={`p-4 rounded-xl border ${colors.border} ${colors.bg} hover:shadow-sm transition-all duration-200`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.bg} ring-1 ${colors.ring}`}>
                <Icon className={`w-4 h-4 ${colors.text}`} />
              </div>
              <div className="mt-3">
                <h4 className="font-semibold text-slate-900 text-xs mb-1">{insight.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{insight.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
