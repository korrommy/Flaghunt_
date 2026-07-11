import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import type { EarnedBadge, SubmitFlagResult } from "@/lib/types";
import { submitFlagSchema } from "@/lib/validations";

interface SubmitFlagRpcRow {
  correct: boolean;
  already_solved: boolean;
  xp_earned: number;
  new_total_xp: number;
  new_level: number;
  newly_earned_badges: EarnedBadge[] | null;
}

const rpcRowSchema = z.object({
  correct: z.boolean(),
  already_solved: z.boolean(),
  xp_earned: z.number().int().nonnegative(),
  new_total_xp: z.number().int().nonnegative(),
  new_level: z.number().int().positive(),
  newly_earned_badges: z.array(z.object({
    id: z.number().int().positive(),
    name: z.string(),
    description: z.string(),
    icon: z.string(),
  })).nullable(),
});

const invalidRequest = (): NextResponse => NextResponse.json({ success: false, error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
const unauthenticated = (): NextResponse => NextResponse.json({ success: false, error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

const hashSubmittedFlag = (flag: string): string => createHash("sha256").update(flag.trim()).digest("hex");

const toResult = (row: SubmitFlagRpcRow): SubmitFlagResult => ({
  correct: row.correct,
  xp_earned: row.xp_earned,
  total_xp: row.new_total_xp,
  level: row.new_level,
  badge: row.newly_earned_badges?.[0] ?? null,
  message: row.correct ? "ยินดีด้วย! คุณแก้โจทย์สำเร็จ 🎉" : "FLAG ไม่ถูกต้อง ลองใหม่อีกครั้ง 🔴",
});

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidRequest();
  }

  const parsed = submitFlagSchema.safeParse(body);
  if (!parsed.success) return invalidRequest();

  try {
    const supabase = await createServerClient();
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;
    if (claimsError || typeof userId !== "string" || userId.length === 0) return unauthenticated();

    const { data, error } = await supabase.rpc("submit_flag", {
      p_challenge_id: parsed.data.challenge_id,
      p_submitted_flag_hash: hashSubmittedFlag(parsed.data.flag),
    });
    if (error) return NextResponse.json({ success: false, error: "ไม่สามารถตรวจสอบ FLAG ได้" }, { status: 500 });

    const rowResult = z.array(rpcRowSchema).length(1).safeParse(data);
    if (!rowResult.success) return NextResponse.json({ success: false, error: "ไม่สามารถตรวจสอบ FLAG ได้" }, { status: 500 });
    const row = rowResult.data[0];
    if (row.already_solved) return NextResponse.json({ success: false, error: "คุณแก้โจทย์นี้ไปแล้ว" }, { status: 409 });

    const result = toResult(row);
    if (result.correct) {
      revalidatePath("/dashboard");
      revalidatePath(`/challenge/${parsed.data.challenge_id}`);
      revalidatePath("/leaderboard");
      revalidatePath("/profile");
    }
    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 });
  }
}
