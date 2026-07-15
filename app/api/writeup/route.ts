import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { writeupSchema } from "@/lib/validations";

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }
  if (!writeupSchema.safeParse(body).success) return NextResponse.json({ success: false, error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error || typeof data?.claims?.sub !== "string" || data.claims.sub.length === 0) return NextResponse.json({ success: false, error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    return NextResponse.json({ success: false, error: "ฟีเจอร์นี้กำลังพัฒนา" }, { status: 503 });
  } catch {
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 });
  }
}
