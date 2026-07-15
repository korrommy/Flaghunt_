import React from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpenCheck, Network, ShieldCheck } from "lucide-react";

import { CommandPanel } from "@/components/ui/CommandPanel";
import { GoldAccent } from "@/components/ui/GoldAccent";

interface LearningPathPreviewProps {}

const pathItems = [
  { icon: BookOpenCheck, title: "พื้นฐาน CTF", detail: "รู้จัก flag, terminal และการคิดอย่างเป็นระบบ" },
  { icon: ShieldCheck, title: "Web Security", detail: "สำรวจช่องโหว่เว็บในสภาพแวดล้อมจำลอง" },
  { icon: Network, title: "Network", detail: "อ่านข้อมูลเครือข่ายและตามหาร่องรอย" },
];

export function LearningPathPreview({}: LearningPathPreviewProps) {
  return (
    <section className="bg-[#0d0d0d] py-16 sm:py-20">
      <div className="container px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <GoldAccent className="mb-5 flex" />
            <h2 className="font-mono text-3xl font-semibold text-gray-100 sm:text-4xl">เส้นทางที่เริ่มได้วันนี้</h2>
            <p className="mt-4 max-w-xl leading-7 text-gray-400">เลือกภารกิจแรก แล้วพัฒนาทักษะจากจุดเริ่มต้นสู่โจทย์ที่ท้าทายขึ้น</p>
          </div>
          <Link aria-label="ดูเส้นทางการเรียนรู้ทั้งหมดหลังสมัครสมาชิก" className="inline-flex items-center gap-2 self-start rounded-md px-2 py-2 text-sm text-[#e8c56e] hover:text-[#f3d88e] sm:self-auto" href="/register">
            ดูเส้นทางทั้งหมด <ArrowUpRight aria-hidden="true" size={17} />
          </Link>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {pathItems.map(({ icon: Icon, title, detail }, index) => (
            <CommandPanel className="p-6" key={title}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-[#d4a84b]">0{index + 1}</span>
                <Icon aria-hidden="true" className="text-[#00ff88]" size={19} />
              </div>
              <h3 className="mt-8 font-mono text-lg text-gray-100">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-400">{detail}</p>
            </CommandPanel>
          ))}
        </div>
      </div>
    </section>
  );
}
