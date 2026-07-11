# FlagHunt Full-Stack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved Black–gold command-center FlagHunt experience with real Supabase auth, secure flag progression, and a global leaderboard.

**Architecture:** Next.js App Router renders the landing, auth, and protected mission shell. Supabase SSR clients carry cookie-authenticated sessions; server components read safe public challenge data while a security-definer RPC performs the only privileged mutation—solving a flag, awarding XP, and granting badges atomically. Client components own forms, terminal simulation, motion, and toasts.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind CSS 3, Supabase Postgres/Auth/RLS, Zod, xterm.js, Framer Motion, Lucide React, Sonner, Vitest.

## Global Constraints

- Use Thai for user-facing copy and English for technical labels/comments; no `any`, `var`, inline styles, plaintext flags, or client-side service-role key.
- Use the approved palette: `#0a0a0a`, charcoal surfaces, restrained gold, and `#00ff88` only for primary/success/selected states.
- Keep every component under 150 lines with a props interface; add `aria-label` to all interactive controls.
- Validate every API request with Zod; API errors are Thai; all protected operations verify authenticated claims.
- AI Hint/Writeup remains unavailable in v1: do not add an API key or provider call.

---

### Task 1: Establish Supabase SSR configuration and shared typed primitives

**Files:**
- Create: `lib/supabase/proxy.ts`, `lib/supabase/admin.ts`, `.env.example` updates
- Modify: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `middleware.ts`, `lib/types.ts`, `lib/xp.ts`, `lib/validations/index.ts`, `package.json`
- Test: `lib/xp.test.ts`, `lib/validations/index.test.ts`

**Interfaces:**
- Produces `createBrowserClient()`, async `createServerClient()`, `createAdminClient()` (server-only), `updateSession(request)`, `getXPProgress(xp)`, `submitFlagSchema`, `authSchema`, and database/UI types.
- Consumes `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY`.

- [ ] Add Vitest scripts/dependencies and a test config that aliases `@/` to the repository root.
- [ ] Write failing unit tests for level thresholds (`0→1`, `100→2`, `400→3`) and invalid flag/auth payloads.
- [ ] Implement typed `Profile`, `Chapter`, `PublicChallenge`, `Progress`, `Badge`, `LeaderboardEntry`, API envelopes, and terminal-script types; implement the XP helpers and all Zod schemas.
- [ ] Implement browser and request-scoped server clients with the current `@supabase/ssr` cookie API; use the publishable key only.
- [ ] Implement the session-refresh helper using `auth.getClaims()` immediately after constructing the client, then redirect unauthenticated `/dashboard`, `/challenge`, `/leaderboard`, and `/profile` requests to `/login` with a safe `next` path.
- [ ] Create the admin client solely for route handlers; throw a clear server-side error when its secret environment variable is absent. Add only variable names and comments to `.env.example`.
- [ ] Run `npm run type-check` and the two unit-test files; expected result: zero TypeScript errors and passing tests.

### Task 2: Deploy a secure initial database and atomic progression RPC

**Files:**
- Modify: `supabase/migrations/0001_initial_schema.sql`, `supabase/seed.sql`
- Create: `supabase/migrations/0002_submit_flag_rpc.sql`
- Test: `supabase/tests/submit_flag_rpc.sql` (or documented SQL assertions executed through the Supabase SQL API)

**Interfaces:**
- Produces `public.submit_flag(challenge_id integer, submitted_flag_hash text)` returning `correct`, `already_solved`, `xp_earned`, `new_total_xp`, `new_level`, and a JSON array of newly-earned badges.
- Consumes authenticated `auth.uid()` and the existing `challenges.flag_hash`, `user_progress`, `profiles`, and `badges` tables.

- [ ] Review `0001_initial_schema.sql` against the connected empty FlagHunt project; preserve RLS and revoke direct base-table `challenges` selection while retaining the safe public view.
- [ ] Write SQL assertions for an unauthenticated RPC call, a wrong hash, a first correct answer, and a repeat correct answer.
- [ ] Implement `submit_flag` as `SECURITY DEFINER` with `set search_path = public, extensions`, an explicit non-null `auth.uid()` guard, no user-controlled SQL, `revoke execute ... from public`, and `grant execute ... to authenticated`.
- [ ] Inside the RPC: lock/create the user-progress row, increment attempts on every submission, compare only the server-held hash, set solved state once, update XP/level once, insert any now-eligible chapter/level badges with `on conflict do nothing`, and return no hash or flag.
- [ ] Apply `0001_initial_schema.sql`, `seed.sql`, then `0002_submit_flag_rpc.sql` to Supabase project `sckvoqumsekradwbaqmz`; verify tables, policies, view grants, and the RPC with the SQL assertions.
- [ ] Run Supabase security advisors and resolve any new RLS, view, or function-exposure finding before continuing.

### Task 3: Build authentication, application shell, and reusable command-center primitives

**Files:**
- Create: `components/layout/Sidebar.tsx`, `components/layout/TopBar.tsx`, `components/layout/ActivityFeed.tsx`, `components/ui/CommandPanel.tsx`, `components/ui/GoldAccent.tsx`, `app/(game)/layout.tsx`, `app/auth/signout/route.ts`
- Modify: `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`, `app/globals.css`, `app/layout.tsx`
- Test: `components/layout/Sidebar.test.tsx`, `app/auth/signout/route.test.ts`

**Interfaces:**
- Produces a protected app shell receiving authenticated profile summary, `CommandPanel` styling primitive, and sign-out route.
- Consumes `createServerClient()`, `createBrowserClient()`, `Profile`, and current route pathname.

- [ ] Write failing render tests for active navigation, mobile menu labels, and sign-out redirect behavior.
- [ ] Define global tokens for black/charcoal/gold/green, focus rings, reduced-motion behavior, and mono/sans typography; avoid gradients except the approved amber right-edge spotlight.
- [ ] Implement accessible Sidebar and TopBar with the approved navigation (`ภาพรวม`, `ภารกิจ`, `อันดับ`, `โปรไฟล์`) and selected-green state; collapse Sidebar to an accessible mobile drawer.
- [ ] Implement login/register client forms with Zod-aligned constraints, Supabase email/password calls, pending states, Thai errors, Sonner feedback, and redirect to the verified `next` route or dashboard.
- [ ] Implement server sign-out: verify claims, sign out, revalidate the root layout, and redirect to login.
- [ ] Run component/route tests, type-check, and manual keyboard navigation on desktop and mobile widths.

### Task 4: Implement dashboard, global leaderboard, and profile data flow

**Files:**
- Create: `components/game/XPBar.tsx`, `components/game/LearningPath.tsx`, `components/game/DailyQuest.tsx`, `components/game/Leaderboard.tsx`, `components/game/BadgeGrid.tsx`, `lib/queries/game.ts`
- Modify: `app/dashboard/page.tsx`, `app/leaderboard/page.tsx`, `app/profile/page.tsx`
- Test: `lib/queries/game.test.ts`, `components/game/XPBar.test.tsx`, `components/game/Leaderboard.test.tsx`

**Interfaces:**
- Produces `getDashboardData(userId)`, `getLeaderboard(limit)`, `getProfileData(userId)`, and view models free of `flag_hash`.
- Consumes safe challenge view, `profiles`, own `user_progress`, `badges`, `user_badges`, and `getXPProgress`.

- [ ] Write failing query-mapping tests covering empty progress, completed chapters, tied leaderboard XP order, and a locked badge.
- [ ] Implement server-only query functions that use the caller session for own progress and public profile reads; return typed fallback states without exposing missing-data errors to users.
- [ ] Build the Dashboard with current mission CTA, XP level card, connected chapter path, deterministic UTC daily challenge, and personal recent-solve activity.
- [ ] Build Global-only Leaderboard ordered by total XP then created date, with top-three gold/silver/bronze treatment and a persistent highlighted current-user row when outside the first page.
- [ ] Build Profile with read-only identity, XP, solved/hints statistics, and earned/locked badge grid; do not add country, friends, avatar upload, or fabricated learning-time values.
- [ ] Run tests and visually inspect 1280px desktop and 390px mobile states including empty/new-user views.

### Task 5: Implement the controlled terminal and challenge workspace

**Files:**
- Create: `components/game/TerminalEmulator.tsx`, `components/game/FlagInput.tsx`, `components/game/HintPanel.tsx`, `components/game/WriteupPanel.tsx`, `lib/terminal-scripts.ts`
- Modify: `app/challenge/[id]/page.tsx`
- Test: `lib/terminal-scripts.test.ts`, `components/game/FlagInput.test.tsx`

**Interfaces:**
- Produces `getTerminalScript(challengeId)`, a client-only `TerminalEmulator`, and `FlagInput` callback contract `onSubmitted(result: SubmitFlagResponse): Promise<void>`.
- Consumes `PublicChallenge`, current progress, `/api/submit-flag`, and static per-challenge safe command scripts.

- [ ] Write failing tests proving unknown commands return a Thai safe help message, known commands return scripted output, and a flag cannot be submitted blank.
- [ ] Implement terminal scripts as typed data keyed by seeded challenge IDs with only `help`, `clear`, `ls`, `cat`, and challenge-specific aliases; never pass entered text to a system shell, eval, API, or database query.
- [ ] Implement the xterm wrapper with dynamic client loading, FitAddon resize handling, cleanup on unmount, keyboard focus label, and a reduced-motion-compatible cursor.
- [ ] Implement the two-column challenge workspace: brief/reward/hint status on the left; terminal, flag form, and result state on the right; collapse to one column on small screens.
- [ ] Implement unavailable AI Hint/Writeup panels that disclose the feature state in Thai and never call an external endpoint.
- [ ] Run terminal and flag component tests; manually confirm output cannot execute arbitrary entered commands.

### Task 6: Complete secure API contracts and client feedback states

**Files:**
- Modify: `app/api/submit-flag/route.ts`, `app/api/hint/route.ts`, `app/api/writeup/route.ts`, `lib/validations/index.ts`
- Create: `app/api/submit-flag/route.test.ts`, `app/api/hint/route.test.ts`, `app/api/writeup/route.test.ts`

**Interfaces:**
- `POST /api/submit-flag` accepts `{ challenge_id: positive integer, flag: 1..200 characters }` and returns `SubmitFlagResponse`.
- `POST /api/hint` and `POST /api/writeup` accept validated challenge IDs and return `{ success: false, error: "ฟีเจอร์นี้กำลังพัฒนา" }` with HTTP 503.

- [ ] Write failing route tests for malformed JSON, invalid Zod input, unauthenticated calls, wrong flags, first correct solve, repeat solve, and unavailable AI endpoints.
- [ ] Implement submit-flag to authenticate with `getClaims`, SHA-256 normalize the submitted flag only in the route, call the authenticated `submit_flag` RPC, and return the typed safe result with Thai messages.
- [ ] Revalidate dashboard, challenge, leaderboard, and profile cache paths after a correct solve; return 400/401/409/500 responses with no internals or hashes.
- [ ] Implement hint/writeup validation and auth checks before their explicit 503 response, so the future AI contract cannot become an unauthenticated oracle.
- [ ] Run API tests with mocked Supabase clients and verify request/response bodies contain no `flag_hash` or plaintext answer.

### Task 7: Build the approved landing page and integrate the visual system

**Files:**
- Create: `components/landing/HeroConsole.tsx`, `components/landing/LearningPathPreview.tsx`, `components/landing/LandingNav.tsx`
- Modify: `app/page.tsx`, `app/globals.css`, `tailwind.config.ts`
- Test: `components/landing/HeroConsole.test.tsx`

**Interfaces:**
- Produces the approved first viewport with real code-native Thai copy and links to registration/login.
- Consumes the existing logo asset and shared command-panel primitives.

- [ ] Write a render test confirming the primary CTA points to registration and the navigation exposes accessible labels.
- [ ] Implement the quiet landing nav, two-column mission-console hero, primary CTA, three concise beginner-benefit statements, and linked learning-path continuation exactly following the approved concept.
- [ ] Use responsive typography and container rules so the hero console moves beneath the text on mobile without overflow; preserve restrained gold spotlight and green CTA semantics.
- [ ] Run the landing test, type-check, and check keyboard focus/contrast for navigation and CTA.

### Task 8: Verify end-to-end security, functionality, and design fidelity

**Files:**
- Create: `docs/qa/flaghunt-visual-fidelity.md`, `docs/qa/flaghunt-acceptance.md`
- Modify: no production files unless a discovered defect requires a focused fix

**Interfaces:**
- Validates the complete signup → login → dashboard → simulated terminal → correct flag → XP/badge → leaderboard/profile flow.

- [ ] Configure local `.env.local` from the connected project URL and publishable key plus a server-only service-role key; confirm the file remains ignored by Git.
- [ ] Run `npm run type-check`, `npm run build`, and the full Vitest suite; fix failures before manual QA.
- [ ] With a fresh test account, verify email/password registration, session refresh, game-route protection, safe public challenge reads, wrong-flag attempt increment, single XP award for a correct flag, locked/unlocked badge transition, global ranking, and sign-out.
- [ ] Capture desktop and 390px screenshots for Landing, Dashboard, Challenge, Leaderboard, Profile, Login, and Register; compare against the two approved generated concepts for palette, shell, spacing, typography, buttons, icons, and mobile collapse.
- [ ] Record at least five concept-to-render comparisons and any intentionally deferred scope (AI Mentor, friends, country, real-time global feed) in the fidelity ledger; remove temporary QA artefacts outside the QA docs.

## Plan self-review

- Coverage: Tasks 1–2 establish secure Supabase; 3 covers auth/shell; 4 covers dashboard/social/profile; 5–6 cover challenge/API; 7 covers Landing; 8 verifies the full flow.
- No-placeholder scan: no deferred implementation is left unspecified; accepted deferrals are AI Mentor, friends, country, and global realtime feed.
- Type consistency: client-facing challenges use `PublicChallenge`; only Task 2 accesses `flag_hash`; Task 6 is the only HTTP path for submission.
