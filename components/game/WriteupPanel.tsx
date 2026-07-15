interface WriteupPanelProps { isSolved: boolean; }

export function WriteupPanel({ isSolved }: WriteupPanelProps) {
  return <section className="rounded-lg border border-purple-500/30 bg-[#111111] p-4"><h2 className="font-mono text-sm text-purple-400">AI WRITEUP</h2><p className="mt-3 text-sm text-gray-300">{isSolved ? "สรุปบทเรียนหลังผ่านโจทย์กำลังพัฒนา" : "ผ่านโจทย์ก่อนเพื่อปลดล็อกสรุปบทเรียน"}</p><p className="mt-2 text-xs text-gray-500">ฟีเจอร์นี้ยังไม่เชื่อมต่อบริการภายนอก</p></section>;
}
