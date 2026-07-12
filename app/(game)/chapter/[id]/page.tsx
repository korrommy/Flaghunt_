import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, LockKeyhole, Play } from "lucide-react";
import { CommandPanel } from "@/components/ui/CommandPanel";
import { getDashboardData } from "@/lib/queries/game";
import { createServerClient } from "@/lib/supabase/server";

interface ChapterChallenge {
  id: number;
  title: string;
  description: string;
  xp_reward: number;
  difficulty: string;
  order_num: number;
}

interface ChapterPageProps {
  params: { id: string };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const chapterId = Number(params.id);
  if (!Number.isInteger(chapterId) || chapterId < 1) notFound();

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = await getDashboardData(user.id);
  if (result.status === "unavailable") {
    return <section className="mx-auto max-w-4xl rounded-xl border border-red-500/40 bg-[#111111] p-6"><h1 className="font-mono text-xl text-gray-100">ไม่สามารถโหลดบทเรียนได้</h1><p className="mt-2 text-sm text-gray-400">กรุณาลองใหม่อีกครั้งในภายหลัง</p></section>;
  }

  const chapter = result.data.chapters.find((item) => item.id === chapterId);
  if (!chapter) notFound();
  if (chapter.isLocked) redirect("/dashboard");

  const solvedIds = new Set<number>();
  const { data: progress, error: progressError } = await supabase.from("user_progress").select("challenge_id, is_solved").eq("user_id", user.id).eq("is_solved", true);
  for (const item of progress ?? []) solvedIds.add(item.challenge_id as number);
  const { data: challenges, error: challengesError } = await supabase.from("challenges_public").select("id, chapter_id, title, description, xp_reward, difficulty, order_num").eq("chapter_id", chapterId).order("order_num");
  if (progressError || challengesError) return <section className="mx-auto max-w-4xl rounded-xl border border-red-500/40 bg-[#111111] p-6"><h1 className="font-mono text-xl text-gray-100">ไม่สามารถโหลดบทเรียนได้</h1><p className="mt-2 text-sm text-gray-400">กรุณาลองใหม่อีกครั้งในภายหลัง</p></section>;
  const chapterChallenges = (challenges ?? []) as ChapterChallenge[];

  return <div className="mx-auto max-w-4xl space-y-6">
    <header className="border-l-2 border-[#d4a84b] pl-4">
      <p className="font-mono text-xs text-[#d4a84b]">CHAPTER {chapter.order_num.toString().padStart(2, "0")} / {chapter.domain.toUpperCase()}</p>
      <h1 className="mt-2 font-mono text-3xl text-gray-100">{chapter.icon} {chapter.title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">{chapter.description}</p>
    </header>
    <CommandPanel className="p-5"><div className="flex items-center justify-between"><div><p className="font-mono text-xs text-[#d4a84b]">MISSION QUEUE</p><p className="mt-1 text-sm text-gray-500">ผ่านแล้ว {chapter.solvedCount} / {chapter.totalChallenges} ภารกิจ</p></div><span className="font-mono text-sm text-[#00ff88]">{chapter.isComplete ? "CHAPTER CLEARED" : "IN PROGRESS"}</span></div></CommandPanel>
    <ol className="space-y-3">{chapterChallenges.map((challenge) => {
      const isSolved = solvedIds.has(challenge.id);
      return <li key={challenge.id} className="rounded-xl border border-[#30291b] bg-[#111111] p-5"><div className="flex items-start gap-4"><div className="mt-1 text-[#d4a84b]">{isSolved ? <CheckCircle2 aria-label="ผ่านแล้ว" className="h-5 w-5" /> : <LockKeyhole aria-label="ภารกิจรอทำ" className="h-5 w-5" />}</div><div className="min-w-0 flex-1"><p className="font-mono text-xs text-[#d4a84b]">MISSION {challenge.order_num.toString().padStart(2, "0")} / {challenge.difficulty.toUpperCase()}</p><h2 className="mt-1 font-mono text-lg text-gray-100">{challenge.title}</h2><p className="mt-2 text-sm text-gray-400">{challenge.description}</p><p className="mt-3 font-mono text-xs text-[#00ff88]">+{challenge.xp_reward} XP</p></div><Link aria-label={`เปิดภารกิจ ${challenge.title}`} href={`/challenge/${challenge.id}`} className="rounded-md border border-[#d4a84b]/50 p-2 text-[#d4a84b] hover:bg-[#d4a84b]/10"><Play className="h-4 w-4" /></Link></div></li>;
    })}</ol>
  </div>;
}
