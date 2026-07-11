import { redirect } from "next/navigation";
import { ActivityFeed } from "@/components/layout/ActivityFeed";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { createServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

interface GameLayoutProps { children: React.ReactNode; }

export default async function GameLayout({ children }: GameLayoutProps) {
  const supabase = await createServerClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("id, username, display_name, total_xp, level, created_at").eq("id", userId).single<Profile>();
  if (!profile) redirect("/login");
  return <div className="min-h-screen bg-[#0a0a0a] md:pl-64"><Sidebar /><div className="flex min-h-screen flex-col"><TopBar profile={profile} /><main className="flex-1 px-5 py-8 md:px-8">{children}</main><ActivityFeed /></div></div>;
}
