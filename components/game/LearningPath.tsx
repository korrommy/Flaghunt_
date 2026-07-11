import React from "react";
import Link from "next/link";
import { CheckCircle2, LockKeyhole, Play } from "lucide-react";
import type { ChapterProgressView } from "@/lib/queries/game";

interface LearningPathProps { chapters: ChapterProgressView[]; }

export function LearningPath({ chapters }: LearningPathProps) {
  if (!chapters.length) return <p className="rounded-lg border border-dashed border-[#30291b] p-5 text-sm text-gray-500">ยังไม่มีบทเรียนพร้อมใช้งาน</p>;
  return <ol aria-label="เส้นทางการเรียนรู้" className="space-y-3">{chapters.map((chapter) => <li key={chapter.id} className={`flex gap-4 rounded-xl border p-4 ${chapter.isLocked ? "border-[#282115] bg-[#0d0d0d] text-gray-600" : "border-[#30291b] bg-[#111111]"}`}><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1b1710] text-xl">{chapter.isLocked ? <LockKeyhole aria-label="บทเรียนถูกล็อก" className="h-4 w-4" /> : chapter.isComplete ? <CheckCircle2 aria-label="เรียนจบแล้ว" className="h-5 w-5 text-[#d4a84b]" /> : chapter.icon}</div><div className="min-w-0 flex-1"><p className="font-mono text-xs text-[#d4a84b]">CH.{chapter.order_num.toString().padStart(2, "0")}</p><h3 className="truncate font-semibold text-gray-200">{chapter.title}</h3><p className="mt-1 text-xs text-gray-500">{chapter.solvedCount} / {chapter.totalChallenges} ภารกิจ</p></div>{!chapter.isLocked && <Link aria-label={`เปิดบทเรียน ${chapter.title}`} href={`/chapter/${chapter.id}`} className="self-center rounded-md border border-[#d4a84b]/50 p-2 text-[#d4a84b] hover:bg-[#d4a84b]/10"><Play className="h-4 w-4" /></Link>}</li>)}</ol>;
}
