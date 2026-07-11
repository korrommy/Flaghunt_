"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CommandPanel } from "@/components/ui/CommandPanel";
import { GoldAccent } from "@/components/ui/GoldAccent";
import { createBrowserClient } from "@/lib/supabase/client";
import { authSchema } from "@/lib/validations";

const getNextPath = (next: string | null): string => next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

export default function RegisterPage() {
  const router = useRouter(); const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false); const [errorMessage, setErrorMessage] = useState("");
  async function handleSubmit(formData: FormData): Promise<void> {
    const parsed = authSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
    if (!parsed.success) { setErrorMessage("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และใช้อีเมลที่ถูกต้อง"); return; }
    setIsPending(true); setErrorMessage("");
    try { const { data, error } = await createBrowserClient().auth.signUp(parsed.data); if (error) { setErrorMessage("ไม่สามารถสมัครสมาชิกได้ กรุณาตรวจสอบข้อมูลอีกครั้ง"); return; } if (!data.session) { toast.success("สมัครสมาชิกสำเร็จ กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ"); router.replace("/login"); return; } toast.success("สมัครสมาชิกสำเร็จ"); router.replace(getNextPath(searchParams.get("next"))); router.refresh(); }
    catch { setErrorMessage("เกิดข้อผิดพลาด กรุณาลองใหม่"); } finally { setIsPending(false); }
  }
  return <main className="amber-spotlight grid min-h-screen place-items-center px-4"><CommandPanel className="w-full max-w-md p-7"><GoldAccent /><h1 className="mt-5 font-mono text-2xl font-bold text-gray-100">สมัครสมาชิก</h1><p className="mt-2 text-sm text-gray-500">สร้างบัญชีเพื่อเริ่มภารกิจ Cybersecurity</p><form action={handleSubmit} className="mt-7 space-y-4"><label className="block text-sm text-gray-300">อีเมล<input aria-label="อีเมล" className="mt-1.5 w-full rounded-md border border-[#30291b] bg-[#0a0a0a] px-3 py-2.5 text-gray-100" name="email" type="email" autoComplete="email" /></label><label className="block text-sm text-gray-300">รหัสผ่าน<input aria-label="รหัสผ่าน" className="mt-1.5 w-full rounded-md border border-[#30291b] bg-[#0a0a0a] px-3 py-2.5 text-gray-100" name="password" type="password" autoComplete="new-password" /></label>{errorMessage ? <p role="alert" className="text-sm text-red-400">{errorMessage}</p> : null}<button aria-label="สมัครสมาชิก" className="w-full rounded-md bg-[#00ff88] px-4 py-2.5 font-medium text-black disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} type="submit">{isPending ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}</button></form><p className="mt-6 text-center text-sm text-gray-500">มีบัญชีแล้ว? <Link className="text-[#d4a84b] hover:underline" href="/login">เข้าสู่ระบบ</Link></p></CommandPanel></main>;
}
