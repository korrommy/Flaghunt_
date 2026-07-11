"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CommandPanel } from "@/components/ui/CommandPanel";
import { GoldAccent } from "@/components/ui/GoldAccent";
import { getSafeNextPath } from "@/lib/auth/safe-next";
import { createBrowserClient } from "@/lib/supabase/client";
import { authSchema } from "@/lib/validations";

export default function LoginPage() {
  const router = useRouter(); const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false); const [errorMessage, setErrorMessage] = useState("");
  async function handleSubmit(formData: FormData): Promise<void> {
    const parsed = authSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
    if (!parsed.success) { setErrorMessage("กรุณากรอกอีเมลและรหัสผ่านให้ถูกต้อง"); return; }
    setIsPending(true); setErrorMessage("");
    try { const { error } = await createBrowserClient().auth.signInWithPassword(parsed.data); if (error) { setErrorMessage("อีเมลหรือรหัสผ่านไม่ถูกต้อง"); return; } toast.success("เข้าสู่ระบบสำเร็จ"); router.replace(getSafeNextPath(searchParams.get("next"))); router.refresh(); }
    catch { setErrorMessage("เกิดข้อผิดพลาด กรุณาลองใหม่"); } finally { setIsPending(false); }
  }
  return <main className="amber-spotlight grid min-h-screen place-items-center px-4"><CommandPanel className="w-full max-w-md p-7"><GoldAccent /><h1 className="mt-5 font-mono text-2xl font-bold text-gray-100">เข้าสู่ระบบ</h1><p className="mt-2 text-sm text-gray-500">เข้าสู่ Command Center ของคุณ</p><form action={handleSubmit} className="mt-7 space-y-4"><label className="block text-sm text-gray-300">อีเมล<input aria-label="อีเมล" className="mt-1.5 w-full rounded-md border border-[#30291b] bg-[#0a0a0a] px-3 py-2.5 text-gray-100" name="email" type="email" autoComplete="email" /></label><label className="block text-sm text-gray-300">รหัสผ่าน<input aria-label="รหัสผ่าน" className="mt-1.5 w-full rounded-md border border-[#30291b] bg-[#0a0a0a] px-3 py-2.5 text-gray-100" name="password" type="password" autoComplete="current-password" /></label>{errorMessage ? <p role="alert" className="text-sm text-red-400">{errorMessage}</p> : null}<button aria-label="เข้าสู่ระบบ" className="w-full rounded-md bg-[#00ff88] px-4 py-2.5 font-medium text-black disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} type="submit">{isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</button></form><p className="mt-6 text-center text-sm text-gray-500">ยังไม่มีบัญชี? <Link className="text-[#d4a84b] hover:underline" href="/register">สมัครสมาชิก</Link></p></CommandPanel></main>;
}
