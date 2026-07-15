import Link from "next/link";
import { redirect } from "next/navigation";
import { DailyQuest } from "@/components/game/DailyQuest";
import { LearningPath } from "@/components/game/LearningPath";
import { XPBar } from "@/components/game/XPBar";
import { CommandPanel } from "@/components/ui/CommandPanel";
import { getDashboardData } from "@/lib/queries/game";
import { createServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const result = await getDashboardData(user.id);
  if (result.status === "unavailable") return <section className="mx-auto max-w-3xl rounded-xl border border-red-500/40 bg-[#111111] p-6"><h1 className="font-mono text-xl text-gray-100">ไม่พร้อมใช้งาน</h1><p className="mt-2 text-sm text-gray-400">ไม่สามารถโหลดข้อมูลภารกิจได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง</p></section>;
  const dashboard = result.data;
  return <div className="mx-auto max-w-6xl space-y-6"><header><p className="font-mono text-xs text-[#d4a84b]">COMMAND CENTER / {dashboard.profile.username}</p><h1 className="mt-2 font-mono text-3xl text-gray-100">ภารกิจของคุณ</h1><p className="mt-2 text-sm text-gray-500">สะสมทักษะ Cybersecurity ทีละโจทย์</p></header><div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"><CommandPanel className="p-5"><p className="font-mono text-xs text-[#d4a84b]">XP STATUS</p><div className="mt-4"><XPBar totalXP={dashboard.profile.total_xp} /></div></CommandPanel><DailyQuest challenge={dashboard.dailyChallenge} /></div><div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]"><CommandPanel className="p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-mono text-base text-gray-100">LEARNING PATH</h2>{dashboard.currentMission && <Link aria-label={`ไปยังภารกิจ ${dashboard.currentMission.title}`} href={`/challenge/${dashboard.currentMission.id}`} className="text-sm text-[#d4a84b] hover:underline">ภารกิจถัดไป</Link>}</div><LearningPath chapters={dashboard.chapters} /></CommandPanel><CommandPanel className="p-5"><h2 className="font-mono text-base text-gray-100">RECENT SOLVES</h2>{dashboard.recentSolves.length ? <ol className="mt-4 space-y-3">{dashboard.recentSolves.map((solve) => <li key={`${solve.challengeTitle}-${solve.solvedAt}`} className="border-l border-[#d4a84b] pl-3"><p className="text-sm text-gray-200">{solve.challengeTitle}</p><time className="text-xs text-gray-500" dateTime={solve.solvedAt}>{new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(solve.solvedAt))}</time></li>)}</ol> : <p className="mt-4 text-sm text-gray-500">ยังไม่มีภารกิจที่พิชิตได้ เริ่มจากภารกิจแรกเลย</p>}</CommandPanel></div></div>;
}
