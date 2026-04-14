"use client";

import { useState, useEffect, useRef } from "react";
import { useTimer } from "@/lib/timer-context";
import { Button } from "./ui/Button";

interface TimerButtonProps {
  cardId: string;
  cardTitle?: string;
  className?: string;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function TimerButton({ cardId, cardTitle, className }: TimerButtonProps) {
  const { activeTimer, loading, startTimer, stopTimer } = useTimer();
  const [showPopover, setShowPopover] = useState(false);
  const [category, setCategory] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [showConfirmSwitch, setShowConfirmSwitch] = useState(false);
  const [confirmTimerCardTitle, setConfirmTimerCardTitle] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  const isTimerRunningForCard = activeTimer?.cardId === cardId;
  const isTimerRunningElsewhere = activeTimer && !isTimerRunningForCard;

  useEffect(() => {
    if (!activeTimer?.startTime) return;

    const startTime = new Date(activeTimer.startTime).getTime();
    const updateElapsed = () => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeTimer?.startTime]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowPopover(false);
      }
    };

    if (showPopover) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPopover]);

  const handleStartClick = async () => {
    const currentCategory = category.trim() || cardTitle?.trim();
    
    if (isTimerRunningElsewhere && currentCategory) {
      setConfirmTimerCardTitle(activeTimer?.category || "another task");
      setShowConfirmSwitch(true);
      return;
    }
    
    if (!currentCategory) {
      setShowPopover(true);
      return;
    }
    
    await startTimer(currentCategory, cardId);
    setCategory("");
    setShowPopover(false);
    setShowConfirmSwitch(false);
  };

  const handleStart = async () => {
    const currentCategory = category.trim() || cardTitle?.trim();
    if (!currentCategory) return;
    await startTimer(currentCategory, cardId);
    setCategory("");
    setShowPopover(false);
    setShowConfirmSwitch(false);
  };

  const handleStop = async () => {
    await stopTimer(cardId);
    setElapsed(0);
  };

  const handleConfirmSwitch = async () => {
    await stopTimer();
    const currentCategory = category.trim() || cardTitle?.trim();
    if (currentCategory) {
      await startTimer(currentCategory, cardId);
      setCategory("");
    } else {
      setShowPopover(true);
    }
    setShowConfirmSwitch(false);
  };

  if (isTimerRunningForCard) {
    return (
      <Button
        variant="primary"
        size="sm"
        onClick={handleStop}
        isLoading={loading}
        className={`bg-red-500 hover:bg-red-600 text-white border-none shadow-sm ${className}`}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Stop • {formatDuration(elapsed)}
        </span>
      </Button>
    );
  }

  if (showPopover) {
    return (
      <div ref={popoverRef} className={`relative ${className}`}>
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. coding, study, gym"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && category.trim()) handleStart();
              if (e.key === "Escape") setShowPopover(false);
            }}
            autoFocus
          />
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleStart} isLoading={loading} disabled={!category.trim()}>
              Start Timer
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowPopover(false); setCategory(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showConfirmSwitch) {
    return (
      <div className={`${className}`}>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800 mb-3">
            Timer is running on <strong>{confirmTimerCardTitle}</strong>. Stop it and start here?
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="danger" onClick={handleConfirmSwitch} isLoading={loading}>
              Stop & Start Here
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowConfirmSwitch(false); setCategory(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleStartClick}
      className={className}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="mr-1"
      >
        <polygon points="5,3 19,12 5,21" fill="currentColor" />
      </svg>
      Start Timer
    </Button>
  );
}