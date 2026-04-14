"use client";

import { TimerProvider } from "@/lib/timer-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TimerProvider>
      {children}
    </TimerProvider>
  );
}