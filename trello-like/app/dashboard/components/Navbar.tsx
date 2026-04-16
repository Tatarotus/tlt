import Link from "next/link";
import { Flame, UserCircle, Clock, CalendarDays, BarChart2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-black text-white flex items-center justify-center rounded-xl shadow-sm">
          <Clock className="w-5 h-5" />
        </div>
        <span className="font-semibold text-slate-900 text-lg tracking-tight">Opus Track</span>
      </div>

      <div className="hidden md:flex items-center bg-slate-50 p-1 rounded-full border border-slate-100 shadow-sm">
        {['This Week', 'This Month', 'All Time', 'Custom'].map((tab, i) => (
          <button
            key={tab}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300",
              i === 0 ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm font-semibold border border-orange-100/50">
          <Flame className="w-4 h-4" />
          <span>12</span>
        </div>
        <button className="h-9 w-9 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
          <UserCircle className="w-6 h-6 text-slate-600" />
        </button>
      </div>
    </nav>
  );
}
