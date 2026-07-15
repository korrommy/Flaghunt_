import { describe, expect, it } from "vitest";
import { shouldRefreshAfterSubmission } from "@/components/game/ChallengeFlagSubmission";

describe("shouldRefreshAfterSubmission", () => {
  it("refreshes the server-rendered challenge after a correct submission", () => {
    expect(shouldRefreshAfterSubmission({ correct: true, xp_earned: 100, total_xp: 100, level: 2, badge: null, message: "สำเร็จ" })).toBe(true);
  });

  it("does not refresh after a wrong flag", () => {
    expect(shouldRefreshAfterSubmission({ correct: false, xp_earned: 0, total_xp: 0, level: 1, badge: null, message: "ไม่ถูกต้อง" })).toBe(false);
  });
});
