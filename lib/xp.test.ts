import { describe, expect, it } from "vitest";

import { getLevel, getXPProgress } from "@/lib/xp";

describe("XP progression", () => {
  it.each([
    [0, 1],
    [100, 2],
    [400, 3],
  ])("assigns level %i at %i XP", (xp, expectedLevel) => {
    expect(getLevel(xp)).toBe(expectedLevel);
  });

  it("returns progress relative to the current level", () => {
    expect(getXPProgress(100)).toEqual({
      level: 2,
      current: 0,
      needed: 300,
      percent: 0,
    });
  });
});
