import { redirect } from "next/navigation";
import { Leaderboard } from "@/components/game/Leaderboard";
import { getLeaderboardData } from "@/lib/queries/game";
import { createServerClient } from "@/lib/supabase/server";

export default async function LeaderboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const result = await getLeaderboardData(user.id, 100);
  if (result.status === "unavailable") return <section className="mx-auto max-w-3xl rounded-xl border border-red-500/40 bg-[#111111] p-6"><h1 className="font-mono text-xl text-gray-100">ไม่สามารถโหลดอันดับได้</h1><p className="mt-2 text-sm text-gray-400">กรุณาลองใหม่อีกครั้ง</p></section>;
  const leaderboard = result.data;
  return <div className="mx-auto max-w-3xl space-y-5"><header><p className="font-mono text-xs text-[#d4a84b]">GLOBAL ONLY</p><h1 className="mt-2 font-mono text-3xl text-gray-100">LEADERBOARD</h1><p className="mt-2 text-sm text-gray-500">จัดอันดับจาก XP รวม และวันสร้างบัญชีเมื่อคะแนนเท่ากัน</p></header><Leaderboard entries={leaderboard.entries.slice(0, 10)} currentUser={leaderboard.currentUser} /></div>;
}
