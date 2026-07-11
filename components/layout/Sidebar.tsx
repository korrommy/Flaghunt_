"use client";

import { Menu, Trophy, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useState } from "react";

interface SidebarProps {
  pathname?: string;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: typeof Trophy;
}

const navigationItems: NavigationItem[] = [
  { href: "/dashboard", label: "ภาพรวม", icon: Menu },
  { href: "/challenge/1", label: "ภารกิจ", icon: Trophy },
  { href: "/leaderboard", label: "อันดับ", icon: Trophy },
  { href: "/profile", label: "โปรไฟล์", icon: UserRound },
];

export function Sidebar({ pathname }: SidebarProps) {
  const currentPathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const activePath = pathname ?? currentPathname;

  return (
    <>
      <button aria-label="เปิดเมนูนำทาง" className="fixed left-4 top-4 z-50 rounded-md border border-[#30291b] bg-[#111111] p-2 text-[#e5e5e5] md:hidden" onClick={() => setIsOpen(true)} type="button">
        <Menu className="h-5 w-5" />
      </button>
      {isOpen ? <button aria-label="ปิดเมนูนำทาง" className="fixed inset-0 z-40 bg-black/70 md:hidden" onClick={() => setIsOpen(false)} type="button" /> : null}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#30291b] bg-[#0a0a0a] p-5 transition-transform duration-200 motion-reduce:transition-none md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-10 flex items-center justify-between font-mono text-lg font-bold tracking-[0.18em] text-[#d4a84b]">
          <Link aria-label="FlagHunt หน้าภาพรวม" href="/dashboard">FLAGHUNT</Link>
          <button aria-label="ปิดเมนูนำทาง" className="p-1 text-[#e5e5e5] md:hidden" onClick={() => setIsOpen(false)} type="button"><X className="h-5 w-5" /></button>
        </div>
        <nav aria-label="เมนูหลัก" className="space-y-2">
          {navigationItems.map(({ href, label, icon: Icon }) => {
            const isActive = activePath === href || (href === "/challenge/1" && activePath.startsWith("/challenge"));
            return <Link aria-current={isActive ? "page" : undefined} className={`flex items-center gap-3 rounded-md px-3 py-2.5 font-sans text-sm transition-colors ${isActive ? "bg-[#15261e] text-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.15)]" : "text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-100"}`} href={href} key={href} onClick={() => setIsOpen(false)}><Icon className="h-4 w-4" />{label}</Link>;
          })}
        </nav>
      </aside>
    </>
  );
}
