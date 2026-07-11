import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getClaims: vi.fn(),
  rpc: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(async () => ({
    auth: { getClaims: mocks.getClaims },
    rpc: mocks.rpc,
  })),
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { POST } from "@/app/api/submit-flag/route";

const request = (body: string): Request => new Request("http://localhost/api/submit-flag", {
  method: "POST", headers: { "content-type": "application/json" }, body,
});

describe("POST /api/submit-flag", () => {
  beforeEach(() => {
    mocks.getClaims.mockReset();
    mocks.rpc.mockReset();
    mocks.revalidatePath.mockReset();
  });

  it("rejects malformed JSON without calling Supabase", async () => {
    const response = await POST(request("{"));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ success: false, error: "ข้อมูลไม่ถูกต้อง" });
    expect(mocks.getClaims).not.toHaveBeenCalled();
  });

  it("rejects invalid input before authenticating", async () => {
    const response = await POST(request(JSON.stringify({ challenge_id: 0, flag: "" })));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ success: false, error: "ข้อมูลไม่ถูกต้อง" });
    expect(mocks.getClaims).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated submission", async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: null }, error: null });
    const response = await POST(request(JSON.stringify({ challenge_id: 1, flag: "try" })));
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ success: false, error: "กรุณาเข้าสู่ระบบ" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("returns a safe wrong-flag result", async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: { sub: "user-1" } }, error: null });
    mocks.rpc.mockResolvedValue({ data: [{ correct: false, already_solved: false, xp_earned: 0, new_total_xp: 10, new_level: 1, newly_earned_badges: [] }], error: null });
    const response = await POST(request(JSON.stringify({ challenge_id: 1, flag: "wrong" })));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ success: true, data: { correct: false, xp_earned: 0, total_xp: 10, level: 1, badge: null, message: "FLAG ไม่ถูกต้อง ลองใหม่อีกครั้ง 🔴" } });
    expect(JSON.stringify(body)).not.toContain("flag_hash");
    expect(mocks.rpc).toHaveBeenCalledWith("submit_flag", expect.objectContaining({ p_challenge_id: 1, p_submitted_flag_hash: expect.stringMatching(/^[a-f0-9]{64}$/) }));
  });

  it("returns the first correct solve and invalidates game views", async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: { sub: "user-1" } }, error: null });
    mocks.rpc.mockResolvedValue({ data: [{ correct: true, already_solved: false, xp_earned: 100, new_total_xp: 110, new_level: 2, newly_earned_badges: [{ id: 1, chapter_id: 1, name: "First", description: "First solve", icon: "*", required_level: 1 }] }], error: null });
    const response = await POST(request(JSON.stringify({ challenge_id: 1, flag: "correct answer" })));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, data: { correct: true, xp_earned: 100, total_xp: 110, level: 2, badge: { id: 1, chapter_id: 1, name: "First", description: "First solve", icon: "*", required_level: 1 }, message: "ยินดีด้วย! คุณแก้โจทย์สำเร็จ 🎉" } });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/challenge/1");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/leaderboard");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/profile");
  });

  it("does not award a repeated correct solve", async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: { sub: "user-1" } }, error: null });
    mocks.rpc.mockResolvedValue({ data: [{ correct: true, already_solved: true, xp_earned: 0, new_total_xp: 110, new_level: 2, newly_earned_badges: [] }], error: null });
    const response = await POST(request(JSON.stringify({ challenge_id: 1, flag: "repeat" })));
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ success: false, error: "คุณแก้โจทย์นี้ไปแล้ว" });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
