interface GoldAccentProps {
  className?: string;
}

export function GoldAccent({ className = "" }: GoldAccentProps) {
  return <span aria-hidden="true" className={`h-px w-12 bg-[#d4a84b] ${className}`} />;
}
