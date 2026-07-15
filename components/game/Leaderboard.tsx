import React from "react";
import { Crown } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/types";

interface LeaderboardProps { entries: LeaderboardEntry[]; currentUser?: LeaderboardEntry; }
const rankTone = (rank: number): string => rank === 1 ? "text-[#d4a84b]" : rank === 2 ? "text-gray-300" : rank === 3 ? "text-amber-700" : "text-gray-500";

export function Leaderboard({ entries, currentUser }: LeaderboardProps) {
  const includesCurrent = currentUser ? entries.some((entry) => entry.username === currentUser.username) : true;
  const row = (entry: LeaderboardEntry, highlighted = false) => <li key={entry.username} className={`grid grid-cols-[3rem_1fr_auto] items-center gap-3 px-4 py-3 ${highlighted ? "border-y border-[#d4a84b]/50 bg-[#1b1710]" : "border-b border-[#282115]"}`}><span className={`font-mono text-sm ${rankTone(entry.rank)}`}>{entry.rank <= 3 ? <Crown aria-label={`อันดับ ${entry.rank}`} className="h-4 w-4" /> : `#${entry.rank}`}</span><span><span className="block text-sm text-gray-200">{entry.display_name}</span><span className="font-mono text-xs text-gray-500">LV.{entry.level}</span></span><span className="font-mono text-sm text-[#d4a84b]">{entry.total_xp} XP</span></li>;
  return <section className="overflow-hidden rounded-xl border border-[#30291b] bg-[#111111]"><div className="border-b border-[#30291b] px-4 py-3"><h2 className="font-mono text-sm text-[#d4a84b]">GLOBAL RANKING</h2></div>{entries.length ? <ol>{entries.map((entry) => row(entry))}{currentUser && !includesCurrent && <><li className="px-4 py-1 text-center text-xs text-gray-600">•••</li>{row(currentUser, true)}<li className="px-4 pb-3 text-center text-xs text-[#d4a84b]">ผู้เล่นของคุณ</li></>}</ol> : <p className="p-5 text-sm text-gray-500">ยังไม่มีข้อมูลอันดับ</p>}</section>;
}
