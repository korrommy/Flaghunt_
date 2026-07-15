import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getClaims: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createServerClient: vi.fn(async () => ({ auth: { getClaims: mocks.getClaims } })) }));
import { POST } from "@/app/api/hint/route";

const request = (body: string): Request => new Request("http://localhost/api/hint", { method: "POST", headers: { "content-type": "application/json" }, body });

describe("POST /api/hint", () => {
  it("validates input before the unavailable response", async () => {
    const response = await POST(request("{"));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ success: false, error: "ข้อมูลไม่ถูกต้อง" });
  });
  it("requires verified claims before the unavailable response", async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: null }, error: null });
    const response = await POST(request(JSON.stringify({ challenge_id: 1 })));
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ success: false, error: "กรุณาเข้าสู่ระบบ" });
  });
  it("returns the explicit unavailable response to authenticated users", async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: { sub: "user-1" } }, error: null });
    const response = await POST(request(JSON.stringify({ challenge_id: 1 })));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ success: false, error: "ฟีเจอร์นี้กำลังพัฒนา" });
  });
});
