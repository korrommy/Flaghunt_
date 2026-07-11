import { describe, expect, it } from "vitest";

import { authSchema, submitFlagSchema } from "@/lib/validations";

describe("submitFlagSchema", () => {
  it("rejects invalid flag submissions", () => {
    expect(
      submitFlagSchema.safeParse({ challenge_id: 0, flag: "" }).success,
    ).toBe(false);
  });
});

describe("authSchema", () => {
  it("rejects an invalid authentication payload", () => {
    expect(
      authSchema.safeParse({ email: "not-an-email", password: "short" }).success,
    ).toBe(false);
  });
});
