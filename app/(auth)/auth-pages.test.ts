import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const authPagePaths = ["login", "register"] as const;

describe("auth page prerender boundaries", () => {
  it.each(authPagePaths)("wraps the %s form in Suspense from a server page", (route) => {
    const source = readFileSync(path.join(process.cwd(), "app", "(auth)", route, "page.tsx"), "utf8");

    expect(source).not.toContain('"use client"');
    expect(source).toContain('import { Suspense } from "react"');
    expect(source).toContain("<Suspense>");
  });
});
