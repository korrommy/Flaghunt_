import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { HeroConsole } from "@/components/landing/HeroConsole";
import { LandingNav } from "@/components/landing/LandingNav";

describe("landing mission entry", () => {
  it("links the primary mission CTA to registration", () => {
    const markup = renderToStaticMarkup(<HeroConsole />);

    expect(markup).toContain('href="/register"');
    expect(markup).toContain("เริ่มภารกิจแรก");
  });

  it("labels navigation links for assistive technology", () => {
    const markup = renderToStaticMarkup(<LandingNav />);

    expect(markup).toContain('aria-label="ไปยังหน้าหลัก"');
    expect(markup).toContain('aria-label="เข้าสู่ระบบ"');
  });
});
