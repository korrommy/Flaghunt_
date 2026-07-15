import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { XPBar } from "@/components/game/XPBar";

describe("XPBar", () => {
  it("exposes the current XP progress to assistive technology", () => {
    const markup = renderToStaticMarkup(<XPBar totalXP={100} />);

    expect(markup).toContain('aria-label="ความคืบหน้าเลเวล 2"');
    expect(markup).toContain('value="0"');
    expect(markup).toContain("0 / 300 XP");
  });
});
