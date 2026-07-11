import { redirect } from "next/navigation";
import { BadgeGrid } from "@/components/game/BadgeGrid";
import { XPBar } from "@/components/game/XPBar";
import { CommandPanel } from "@/components/ui/CommandPanel";
import { getProfileData } from "@/lib/queries/game";
import { createServerClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const profile = await getProfileData(user.id);
  return <div className="mx-auto max-w-5xl space-y-6"><header><p className="font-mono text-xs text-[#d4a84b]">OPERATOR PROFILE</p><h1 className="mt-2 font-mono text-3xl text-gray-100">{profile.profile.display_name}</h1><p className="mt-1 font-mono text-sm text-gray-500">@{profile.profile.username}</p></header><div className="grid gap-4 md:grid-cols-3"><CommandPanel className="p-5 md:col-span-2"><p className="font-mono text-xs text-[#d4a84b]">XP LEVEL</p><div className="mt-4"><XPBar totalXP={profile.profile.total_xp} /></div></CommandPanel><CommandPanel className="grid grid-cols-2 gap-4 p-5"><div><p className="font-mono text-2xl text-gray-100">{profile.solvedCount}</p><p className="text-xs text-gray-500">โจทย์ที่ผ่าน</p></div><div><p className="font-mono text-2xl text-gray-100">{profile.hintsUsed}</p><p className="text-xs text-gray-500">Hint ที่ใช้</p></div></CommandPanel></div><CommandPanel className="p-5"><div className="mb-4"><h2 className="font-mono text-base text-gray-100">BADGE COLLECTION</h2><p className="mt-1 text-sm text-gray-500">เหรียญที่ได้รับและเป้าหมายถัดไป</p></div><BadgeGrid badges={profile.badges} /></CommandPanel></div>;
}
