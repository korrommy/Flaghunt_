import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const globalsPath = new URL("./globals.css", import.meta.url);
const landingPagePath = new URL("./page.tsx", import.meta.url);

describe("auth spotlight styles", () => {
  it("defines the shared gold spotlight used by auth pages", async () => {
    const stylesheet = await readFile(globalsPath, "utf8");

    expect(stylesheet).toContain(".amber-spotlight");
    expect(stylesheet).toContain("rgba(212, 168, 75");
  });

  it("keeps the gold spotlight out of the landing page", async () => {
    const landingPage = await readFile(landingPagePath, "utf8");

    expect(landingPage).not.toContain("amber-spotlight");
    expect(landingPage).not.toContain("gradient");
  });
});
