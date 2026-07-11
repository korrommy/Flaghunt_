interface HintPanelProps { hintsUsed: number; maxHints: number; }

export function HintPanel({ hintsUsed, maxHints }: HintPanelProps) {
  return <section className="rounded-lg border border-amber-500/30 bg-[#111111] p-4"><h2 className="font-mono text-sm text-amber-400">AI HINT</h2><p className="mt-2 text-sm text-gray-400">ใช้ Hint แล้ว {hintsUsed} / {maxHints} ครั้ง</p><p className="mt-3 text-sm text-gray-300">AI Mentor กำลังพัฒนา ระหว่างนี้ใช้คำสั่ง <code className="font-mono text-[#00ff88]">help</code> ใน Terminal เพื่อดูแนวทางของโจทย์</p></section>;
}
