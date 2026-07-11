# 🚩 FlagHunt (ล่าธง)

แพลตฟอร์มเว็บแอปสอน **Cybersecurity** แบบ Gamified (CTF-lite, Guided) ภาษาไทย สำหรับนักเรียนมือใหม่ — ส่งแข่ง **NSC 2026** หมวด 22 ระดับนักเรียน

> LEARN CYBERSECURITY. PLAY. HACK. LEVEL UP.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v3 + shadcn/ui
- **Database/Auth:** Supabase (PostgreSQL + RLS)
- **AI:** Anthropic Claude API
- **Terminal:** xterm.js
- **Validation:** Zod · **Animation:** Framer Motion · **Icons:** Lucide · **Toast:** Sonner

## โครงสร้างโปรเจ็ค

```
app/
  layout.tsx · globals.css · page.tsx        # Landing
  (auth)/login · (auth)/register             # Auth pages
  dashboard/                                 # Island Map
  challenge/[id]/                            # Challenge + Terminal
  leaderboard/ · profile/                    # Leaderboard / Profile
  api/submit-flag · api/hint · api/writeup   # API routes (Zod validated)
components/ui · game · terminal · layout     # UI / game components
lib/                                         # utils, xp, constants, types, validations, supabase
hooks/                                       # custom React hooks
supabase/migrations · seed.sql               # schema + seed
middleware.ts                                # route protection
```

## เริ่มต้นใช้งาน

```bash
npm install
cp .env.example .env.local   # ใส่ค่า Supabase + Anthropic keys
npm run dev
```

เปิด http://localhost:3000

## แผนการพัฒนา

1. Supabase schema + seed data
2. โครงสร้าง Next.js + Tailwind ✅ (วางโครงแล้ว)
3. Auth pages + middleware
4. Dashboard + Learning Path Map
5. Challenge Page + Terminal + FlagInput
6. API routes (submit-flag, hint, writeup)
7. Leaderboard + Profile + Badge Collection
8. Daily/Weekly Quest System
9. Polish: animations, loading states, responsive
10. Deploy (Vercel + Supabase Cloud)

## หมายเหตุด้านความปลอดภัย

- Flag เก็บเป็น **SHA-256 hash** เท่านั้น — ไม่มี plaintext, ไม่ expose `flag_hash`
- **RLS** เปิดทุกตาราง user · **Zod** validate ทุก API · Rate limit AI 10 req/min/user
