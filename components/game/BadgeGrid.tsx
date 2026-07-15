import React from "react";
import { LockKeyhole } from "lucide-react";
import type { BadgeView } from "@/lib/queries/game";

interface BadgeGridProps { badges: BadgeView[]; }

export function BadgeGrid({ badges }: BadgeGridProps) {
  if (!badges.length) return <p className="text-sm text-gray-500">ยังไม่มีเหรียญรางวัลในระบบ</p>;
  return <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">{badges.map((badge) => <li key={badge.id} className={`rounded-xl border p-4 ${badge.earned ? "border-[#d4a84b]/50 bg-[#1b1710]" : "border-[#282115] bg-[#0d0d0d] grayscale"}`}><div className="flex items-center justify-between"><span className="font-mono text-xs text-[#d4a84b]">{badge.earned ? "EARNED" : "LOCKED"}</span>{badge.isLocked ? <LockKeyhole aria-label="เหรียญถูกล็อก" className="h-4 w-4 text-gray-600" /> : <span aria-hidden="true" className="text-xl">✦</span>}</div><h3 className="mt-4 text-sm font-semibold text-gray-200">{badge.name}</h3><p className="mt-1 text-xs text-gray-500">{badge.description}</p></li>)}</ul>;
}
