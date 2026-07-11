import { HeroConsole } from "@/components/landing/HeroConsole";
import { LandingNav } from "@/components/landing/LandingNav";
import { LearningPathPreview } from "@/components/landing/LearningPathPreview";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <LandingNav />
      <HeroConsole />
      <LearningPathPreview />
    </main>
  );
}
