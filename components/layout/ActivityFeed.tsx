interface ActivityFeedProps {
  message?: string;
}

export function ActivityFeed({ message = "พร้อมเริ่มภารกิจแรกของคุณ" }: ActivityFeedProps) {
  return <footer className="border-t border-[#30291b] bg-[#0a0a0a] px-5 py-3 font-mono text-xs text-gray-500"><span className="mr-2 text-[#00ff88]">●</span>{message}</footer>;
}
