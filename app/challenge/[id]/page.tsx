import { notFound, redirect } from "next/navigation";
import { FlagInput } from "@/components/game/FlagInput";
import { HintPanel } from "@/components/game/HintPanel";
import { TerminalEmulator } from "@/components/game/TerminalEmulator";
import { WriteupPanel } from "@/components/game/WriteupPanel";
import { CommandPanel } from "@/components/ui/CommandPanel";
import { getTerminalScript } from "@/lib/terminal-scripts";
import type { Progress, PublicChallenge } from "@/lib/types";
import { createServerClient } from "@/lib/supabase/server";

interface ChallengePageProps { params: { id: string }; }

export default async function ChallengePage({ params }: ChallengePageProps) {
  const challengeId = Number(params.id);
  if (!Number.isInteger(challengeId) || challengeId < 1) notFound();
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: challenge }, { data: progress }] = await Promise.all([
    supabase.from("challenges_public").select("id, chapter_id, title, description, xp_reward, difficulty, max_hints, file_url, order_num").eq("id", challengeId).maybeSingle(),
    supabase.from("user_progress").select("id, user_id, challenge_id, is_solved, hints_used, attempts, solved_at").eq("user_id", user.id).eq("challenge_id", challengeId).maybeSingle(),
  ]);
  if (!challenge) notFound();
  const mission = challenge as PublicChallenge;
  const currentProgress = progress as Progress | null;
  const isSolved = currentProgress?.is_solved ?? false;
  const hintsUsed = currentProgress?.hints_used ?? 0;
  return <div className="mx-auto max-w-6xl space-y-6"><header><p className="font-mono text-xs text-[#d4a84b]">CHALLENGE / {mission.difficulty.toUpperCase()}</p><h1 className="mt-2 font-mono text-3xl text-gray-100">{mission.title}</h1></header><div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><aside className="space-y-4"><CommandPanel className="p-5"><h2 className="font-mono text-sm text-[#00ff88]">MISSION BRIEF</h2><p className="mt-3 text-sm leading-6 text-gray-300">{mission.description}</p><dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-gray-500">รางวัล</dt><dd className="font-mono text-[#d4a84b]">{mission.xp_reward} XP</dd></div><div><dt className="text-gray-500">สถานะ</dt><dd className="font-mono text-[#00ff88]">{isSolved ? "ผ่านแล้ว" : "กำลังทำ"}</dd></div></dl></CommandPanel><HintPanel hintsUsed={hintsUsed} maxHints={mission.max_hints} /><WriteupPanel isSolved={isSolved} /></aside><section className="space-y-4"><CommandPanel className="p-3"><TerminalEmulator script={getTerminalScript(mission.id)} /></CommandPanel><CommandPanel className="p-5"><FlagInput challengeId={mission.id} disabled={isSolved} onSubmitted={async () => undefined} /></CommandPanel></section></div></div>;
}
