import React, { type ReactNode } from "react";

interface CommandPanelProps {
  children: ReactNode;
  className?: string;
}

export function CommandPanel({ children, className = "" }: CommandPanelProps) {
  return (
    <section className={`command-panel rounded-xl border border-[#30291b] bg-[#111111] ${className}`}>
      {children}
    </section>
  );
}
