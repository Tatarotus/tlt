"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface Timer {
  id: number;
  category: string;
  startTime: string;
  notes: string | null;
  cardId: string | null;
  source: string;
  duration: number;
}

interface TimerContextType {
  activeTimer: Timer | null;
  loading: boolean;
  error: string | null;
  startTimer: (category: string, cardId?: string, notes?: string) => Promise<void>;
  stopTimer: (cardId?: string) => Promise<void>;
  refreshTimer: () => Promise<void>;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [activeTimer, setActiveTimer] = useState<Timer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTimer = useCallback(async () => {
    try {
      const res = await fetch("/api/timer/active");
      const data = await res.json();
      if (data.active) {
        setActiveTimer(data.active);
      } else {
        setActiveTimer(null);
      }
      setError(null);
    } catch (err) {
      setError("Failed to fetch timer");
      console.error("Timer fetch error:", err);
    }
  }, []);

  useEffect(() => {
    refreshTimer();
    const interval = setInterval(refreshTimer, 10000);
    return () => clearInterval(interval);
  }, [refreshTimer]);

  const startTimer = useCallback(
    async (category: string, cardId?: string, notes?: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/timer/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category, cardId, notes }),
        });
        const data = await res.json();
        if (data.success) {
          setActiveTimer(data.session);
        } else {
          setError(data.error || "Failed to start timer");
        }
      } catch (err) {
        setError("Failed to start timer");
        console.error("Timer start error:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const stopTimer = useCallback(async (cardId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/timer/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveTimer(null);
      } else {
        setError(data.error || "Failed to stop timer");
      }
    } catch (err) {
      setError("Failed to stop timer");
      console.error("Timer stop error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <TimerContext.Provider
      value={{ activeTimer, loading, error, startTimer, stopTimer, refreshTimer }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}