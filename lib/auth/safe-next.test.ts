import { describe, expect, it } from "vitest";

import {
  getLoginRedirectPath,
  getRegisterRedirectPath,
  getSafeNextPath,
} from "@/lib/auth/safe-next";

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

  it("preserves only a safe destination when switching to registration", () => {
    expect(getRegisterRedirectPath("/challenge/7?step=2")).toBe(
      "/register?next=%2Fchallenge%2F7%3Fstep%3D2",
    );
    expect(getRegisterRedirectPath("https://evil.example")).toBe(
      "/register?next=%2Fdashboard",
    );
  });
});
