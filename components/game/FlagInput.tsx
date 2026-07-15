"use client";

import { FormEvent, useState } from "react";
import type { SubmitFlagResult } from "@/lib/types";

export type SubmitFlagResponse = SubmitFlagResult;

interface FlagInputProps {
  challengeId: number;
  disabled?: boolean;
  onSubmitted: (result: SubmitFlagResponse) => Promise<void>;
}

interface SubmitFailure { success: false; error: string; }
interface SubmitSuccess { success: true; data: SubmitFlagResponse; }
type SubmitResponse = SubmitFailure | SubmitSuccess;

export const isFlagReady = (flag: string): boolean => flag.trim().length > 0;

const isSubmitResponse = (value: unknown): value is SubmitResponse => {
  if (!value || typeof value !== "object" || !("success" in value)) return false;
  return typeof value.success === "boolean";
};

export function FlagInput({ challengeId, disabled = false, onSubmitted }: FlagInputProps) {
  const [flag, setFlag] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!isFlagReady(flag)) { setMessage("กรุณากรอก FLAG ก่อนส่ง"); return; }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submit-flag", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ challenge_id: challengeId, flag: flag.trim() }) });
      const payload: unknown = await response.json();
      if (!response.ok || !isSubmitResponse(payload) || !payload.success) { setMessage(isSubmitResponse(payload) && !payload.success ? payload.error : "เกิดข้อผิดพลาด กรุณาลองใหม่"); return; }
      setMessage(payload.data.message);
      await onSubmitted(payload.data);
    } catch { setMessage("เกิดข้อผิดพลาด กรุณาลองใหม่"); } finally { setIsSubmitting(false); }
  };

  return <form className="space-y-3" onSubmit={submit} noValidate><label className="block font-mono text-xs text-gray-300" htmlFor={`flag-${challengeId}`}>SUBMIT FLAG</label><div className="flex flex-col gap-2 sm:flex-row"><input aria-label="กรอก FLAG" className="min-w-0 flex-1 rounded-md border border-[#30291b] bg-[#0a0a0a] px-3 py-2 font-mono text-sm text-gray-100 placeholder:text-gray-600" disabled={disabled || isSubmitting} id={`flag-${challengeId}`} maxLength={200} onChange={(event) => setFlag(event.target.value)} placeholder="FlagHunt{...}" value={flag} /><button aria-label="ส่ง FLAG" className="rounded-md bg-[#00ff88] px-4 py-2 font-mono text-sm font-semibold text-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-50" disabled={disabled || isSubmitting} type="submit">{isSubmitting ? "กำลังตรวจสอบ..." : "ส่ง FLAG"}</button></div>{message && <p aria-live="polite" className="text-sm text-gray-300">{message}</p>}</form>;
}
