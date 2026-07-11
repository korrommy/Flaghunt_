import { redirect } from "next/navigation";
import { Leaderboard } from "@/components/game/Leaderboard";
import { getLeaderboard, getProfileData } from "@/lib/queries/game";
import { createServerClient } from "@/lib/supabase/server";

export default async function LeaderboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const leaderboard = await getLeaderboard(100);
  const profile = await getProfileData(user.id);
  const currentUser = leaderboard.find((entry) => entry.username === profile.profile.username);
  return <div className="mx-auto max-w-3xl space-y-5"><header><p className="font-mono text-xs text-[#d4a84b]">GLOBAL ONLY</p><h1 className="mt-2 font-mono text-3xl text-gray-100">LEADERBOARD</h1><p className="mt-2 text-sm text-gray-500">จัดอันดับจาก XP รวม และวันสร้างบัญชีเมื่อคะแนนเท่ากัน</p></header><Leaderboard entries={leaderboard.slice(0, 10)} currentUser={currentUser} /></div>;
}
