import { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <div className={`max-w-[1600px] mx-auto px-6 py-10 ${className}`}>
      {children}
    </div>
  );
}
