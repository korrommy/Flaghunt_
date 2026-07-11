import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Leaderboard } from "@/components/game/Leaderboard";

describe("Leaderboard", () => {
  it("keeps the current learner visible when they are outside the first page", () => {
    const markup = renderToStaticMarkup(<Leaderboard entries={[{ rank: 1, username: "top", display_name: "Top", total_xp: 900, level: 4 }]} currentUser={{ rank: 25, username: "me", display_name: "Me", total_xp: 10, level: 1 }} />);

    expect(markup).toContain("Me");
    expect(markup).toContain("25");
    expect(markup).toContain("ผู้เล่นของคุณ");
  });
});
