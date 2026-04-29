"use client";

import { useEffect, useState } from "react";
import { useTimer } from "@/lib/timer-context";
import { Button } from "./ui/Button";

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

interface TimerDisplayProps {
  activeTimer: { category: string; notes?: string | null; startTime: string };
  elapsed: number;
  loading: boolean;
  onStop: () => Promise<unknown>;
}

function TimerDisplay({ activeTimer, elapsed, loading, onStop }: TimerDisplayProps) {
  return (
    <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /><span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Active Timer</span></div>
        <div className="h-6 w-px bg-blue-400/50" /><span className="text-lg font-semibold">{activeTimer.category}</span>
        {activeTimer.notes && <span className="text-sm text-blue-200 truncate max-w-[200px]">{activeTimer.notes}</span>}
      </div>
      <div className="flex items-center gap-6">
        <div className="font-mono text-2xl font-bold tabular-nums">{formatDuration(elapsed)}</div>
        <Button variant="secondary" size="sm" onClick={onStop} isLoading={loading} className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="mr-1.5"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>Stop
        </Button>
      </div>
    </div>
  );
}

export function ActiveTimerBar() {
  const { activeTimer, loading, stopTimer } = useTimer();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!activeTimer?.startTime) return;
    const startTime = new Date(activeTimer.startTime).getTime();
    const update = () => setElapsed(Math.floor((Date.now() - startTime) / 1000));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeTimer?.startTime]);

  if (!activeTimer) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl border-t border-blue-500 z-50 animate-in slide-in-from-bottom duration-300">
      <TimerDisplay activeTimer={activeTimer} elapsed={elapsed} loading={loading} onStop={stopTimer} />
    </div>
  );
}