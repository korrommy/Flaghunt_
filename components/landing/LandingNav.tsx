import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LandingNavProps {}

export function LandingNav({}: LandingNavProps) {
  return (
    <header className="border-b border-[#30291b] bg-[#0a0a0a]/95">
      <nav aria-label="การนำทางหลัก" className="container flex h-16 items-center justify-between px-5 sm:px-8">
        <Link aria-label="ไปยังหน้าหลัก" className="flex items-center gap-3 rounded-md font-mono text-lg font-semibold tracking-tight text-gray-100" href="/">
          <Image alt="" aria-hidden="true" className="h-8 w-8" height={32} priority src="/assets/brand/logo-mark.png" width={32} />
          <span>FlagHunt</span>
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <Link aria-label="เข้าสู่ระบบ" className="rounded-md px-3 py-2 text-gray-300 transition-colors hover:text-[#d4a84b]" href="/login">
            เข้าสู่ระบบ
          </Link>
          <Link aria-label="สร้างบัญชีเพื่อเริ่มภารกิจ" className="rounded-md border border-[#d4a84b] px-3 py-2 font-medium text-[#e8c56e] transition-colors hover:bg-[#d4a84b] hover:text-[#0a0a0a]" href="/register">
            สมัครสมาชิก
          </Link>
        </div>
      </nav>
    </header>
  );
}
