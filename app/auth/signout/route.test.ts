import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getClaims: vi.fn(), signOut: vi.fn(), revalidatePath: vi.fn(),
  redirect: vi.fn((path: string): never => { throw new Error(`REDIRECT:${path}`); }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(async () => ({ auth: { getClaims: mocks.getClaims, signOut: mocks.signOut } })),
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { POST } from "@/app/auth/signout/route";

describe("POST /auth/signout", () => {
  it("signs out a verified session and redirects to login", async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: { sub: "user-1" } }, error: null });
    mocks.signOut.mockResolvedValue({ error: null });

    await expect(POST()).rejects.toThrow("REDIRECT:/login");

    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});
