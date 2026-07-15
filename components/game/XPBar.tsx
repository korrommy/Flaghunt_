import React from "react";
import { getXPProgress } from "@/lib/xp";

interface XPBarProps { totalXP: number; compact?: boolean; }

export function XPBar({ totalXP, compact = false }: XPBarProps) {
  const progress = getXPProgress(totalXP);
  return <div className="space-y-2"><div className="flex items-baseline justify-between font-mono"><span className="text-sm text-[#d4a84b]">LEVEL {progress.level}</span>{!compact && <span className="text-xs text-gray-400">{progress.current} / {progress.needed} XP</span>}</div><progress aria-label={`ความคืบหน้าเลเวล ${progress.level}`} className="h-2 w-full accent-[#d4a84b]" max={100} value={progress.percent}>{progress.percent}%</progress></div>;
}
