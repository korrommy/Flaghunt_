import { describe, expect, it } from "vitest";

import { getLoginRedirectPath, getSafeNextPath } from "@/lib/auth/safe-next";

describe("getSafeNextPath", () => {
  it("preserves an internal destination", () => {
    expect(getSafeNextPath("/dashboard")).toBe("/dashboard");
  });

  it("falls back for an external URL", () => {
    expect(getSafeNextPath("https://evil.example")).toBe("/dashboard");
  });

  it("falls back for a backslash-based protocol-relative URL", () => {
    expect(getSafeNextPath("/\\\\evil.example")).toBe("/dashboard");
  });

  it("preserves the safe destination when returning to login", () => {
    expect(getLoginRedirectPath("/dashboard")).toBe("/login?next=%2Fdashboard");
  });
});
