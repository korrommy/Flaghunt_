"use client";

import { useRouter } from "next/navigation";
import { FlagInput } from "@/components/game/FlagInput";
import type { SubmitFlagResult } from "@/lib/types";

interface ChallengeFlagSubmissionProps {
  challengeId: number;
  disabled: boolean;
}

export const shouldRefreshAfterSubmission = (result: SubmitFlagResult): boolean => result.correct;

export function ChallengeFlagSubmission({ challengeId, disabled }: ChallengeFlagSubmissionProps) {
  const router = useRouter();
  const onSubmitted = async (result: SubmitFlagResult): Promise<void> => {
    if (shouldRefreshAfterSubmission(result)) router.refresh();
  };

  return <FlagInput challengeId={challengeId} disabled={disabled} onSubmitted={onSubmitted} />;
}
