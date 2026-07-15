import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, TerminalSquare } from "lucide-react";

import { CommandPanel } from "@/components/ui/CommandPanel";
import { GoldAccent } from "@/components/ui/GoldAccent";

interface HeroConsoleProps {}

const beginnerBenefits = [
  "เริ่มจากพื้นฐาน ไม่ต้องมีประสบการณ์มาก่อน",
  "ฝึกผ่านภารกิจจำลองที่ปลอดภัยในเบราว์เซอร์",
  "ค่อย ๆ สร้างทักษะด้วยเส้นทางการเรียนรู้ที่ชัดเจน",
];

export function HeroConsole({}: HeroConsoleProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#1f1f1f] py-16 sm:py-20 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute right-[-6rem] top-8 h-72 w-72 rounded-full bg-[#d4a84b]/10 blur-3xl" />
      <div className="container relative grid items-center gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)] lg:gap-16">
        <div className="max-w-2xl">
          <GoldAccent className="mb-7 flex" />
          <h1 className="font-mono text-4xl font-semibold leading-tight tracking-tight text-gray-100 sm:text-5xl lg:text-6xl">
            เริ่มล่าธง
            <span className="block text-[#d4a84b]">เรียนรู้ Cybersecurity</span>
            ผ่านภารกิจจริง
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-gray-400 sm:text-lg">
            FlagHunt คือพื้นที่ฝึก CTF สำหรับผู้เริ่มต้น เรียนรู้ทีละขั้น คิดแบบนักป้องกัน และลงมือแก้โจทย์ด้วยตัวเอง
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link aria-label="เริ่มภารกิจแรกด้วยการสมัครสมาชิก" className="inline-flex items-center gap-2 rounded-md bg-[#00ff88] px-5 py-3 font-medium text-[#07120d] transition-transform hover:scale-[1.02] focus-visible:scale-[1.02]" href="/register">
              เริ่มภารกิจแรก <ArrowRight aria-hidden="true" size={18} />
            </Link>
            <Link aria-label="เข้าสู่ระบบ FlagHunt" className="rounded-md px-2 py-3 text-sm text-gray-300 transition-colors hover:text-[#e8c56e]" href="/login">
              มีบัญชีอยู่แล้ว
            </Link>
          </div>
          <ul className="mt-10 grid gap-3 text-sm text-gray-300 sm:grid-cols-3">
            {beginnerBenefits.map((benefit) => (
              <li className="flex gap-2 leading-6" key={benefit}>
                <CheckCircle2 aria-hidden="true" className="mt-1 shrink-0 text-[#d4a84b]" size={15} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
        <CommandPanel className="w-full overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#30291b] px-5 py-4">
            <div className="flex items-center gap-2 font-mono text-sm text-[#e8c56e]">
              <TerminalSquare aria-hidden="true" size={17} /> mission-console
            </div>
            <span className="font-mono text-xs text-gray-500">BEGINNER / 01</span>
          </div>
          <div className="space-y-5 p-5 font-mono text-sm leading-7 sm:p-7">
            <p className="text-gray-400">$ flaghunt mission start</p>
            <div className="border-l border-[#d4a84b] pl-4 text-gray-200">
              <p>MISSION: อ่านร่องรอยในระบบ</p>
              <p className="mt-1 text-gray-500">เป้าหมาย: ค้นหา FLAG ที่ซ่อนอยู่</p>
            </div>
            <div className="rounded-md border border-[#30291b] bg-[#0a0a0a] p-4 text-[#00ff88]">
              <p>&gt; พร้อมเริ่มการฝึกหรือยัง?</p>
              <p className="mt-2 animate-pulse">▊</p>
            </div>
          </div>
        </CommandPanel>
      </div>
    </section>
  );
}
