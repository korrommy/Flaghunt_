import { LogOut } from "lucide-react";
import type { Profile } from "@/lib/types";

interface TopBarProps {
  profile: Profile;
}

export function TopBar({ profile }: TopBarProps) {
  return (
    <header className="flex min-h-16 items-center justify-end gap-4 border-b border-[#30291b] bg-[#0a0a0a]/90 px-5 md:px-8">
      <div className="text-right"><p className="font-mono text-xs text-[#d4a84b]">LEVEL {profile.level}</p><p className="text-sm text-gray-200">{profile.display_name}</p></div>
      <form action="/auth/signout" method="post"><button aria-label="ออกจากระบบ" className="rounded-md border border-[#30291b] p-2 text-gray-400 transition-colors hover:border-[#d4a84b] hover:text-[#d4a84b]" type="submit"><LogOut className="h-4 w-4" /></button></form>
    </header>
  );
}
