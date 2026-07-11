import React from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { MissionView } from "@/lib/queries/game";

interface DailyQuestProps { challenge: MissionView | null; }

export function DailyQuest({ challenge }: DailyQuestProps) {
  if (!challenge) return <section className="rounded-xl border border-[#30291b] bg-[#111111] p-5"><p className="font-mono text-xs text-[#d4a84b]">DAILY MISSION</p><p className="mt-2 text-sm text-gray-400">วันนี้คุณพิชิตทุกภารกิจแล้ว กลับมารับโจทย์ใหม่พรุ่งนี้!</p></section>;
  return <section className="rounded-xl border border-[#d4a84b]/50 bg-[#16120b] p-5 shadow-[0_0_20px_rgba(212,168,75,0.08)]"><div className="flex items-center gap-2 font-mono text-xs text-[#d4a84b]"><CalendarDays className="h-4 w-4" />DAILY MISSION</div><h2 className="mt-3 font-mono text-lg text-gray-100">{challenge.title}</h2><p className="mt-1 text-sm text-gray-400">รับ {challenge.xp_reward} XP เมื่อทำสำเร็จ</p><Link aria-label={`เริ่มภารกิจรายวัน ${challenge.title}`} href={`/challenge/${challenge.id}`} className="mt-4 inline-flex rounded-md bg-[#d4a84b] px-3 py-2 text-sm font-semibold text-black hover:bg-[#edc66f]">เริ่มภารกิจ</Link></section>;
}
