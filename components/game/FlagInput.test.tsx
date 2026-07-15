import { describe, expect, it } from "vitest";

import { isFlagReady } from "@/components/game/FlagInput";

describe("FlagInput", () => {
  it("does not allow a blank flag submission", () => {
    expect(isFlagReady("   ")).toBe(false);
  });
});
