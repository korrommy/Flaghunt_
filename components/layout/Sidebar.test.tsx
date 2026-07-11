import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/leaderboard",
}));

import { Sidebar } from "@/components/layout/Sidebar";

describe("Sidebar", () => {
  it("marks the current navigation item as selected", () => {
    const markup = renderToStaticMarkup(<Sidebar />);

    expect(markup).toContain('href="/leaderboard"');
    expect(markup).toContain("text-[#00ff88]");
  });

  it("exposes an accessible mobile-menu control", () => {
    const markup = renderToStaticMarkup(<Sidebar />);

    expect(markup).toContain('aria-label="เปิดเมนูนำทาง"');
  });
});
