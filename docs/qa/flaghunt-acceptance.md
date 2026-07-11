# FlagHunt acceptance QA

Date: 2026-07-11 (Asia/Bangkok)  
Scope: Task 8 end-to-end, security, and build verification.

## Evidence executed

| Check | Result | Evidence |
| --- | --- | --- |
| TypeScript | PASS | `npm run type-check` exited 0 (`tsc --noEmit`). |
| Production build | PASS | `npm run build` exited 0 using Next.js 14.2.5. |
| Unit suite | PASS | `npm test`: 17 files and 48 tests passed. |
| Auth redirect helpers | PASS | `lib/auth/safe-next.test.ts`: 5 tests passed. |
| Submit-flag HTTP behaviour | PASS | `app/api/submit-flag/route.test.ts`: 6 tests passed. |
| Hint/writeup unavailable endpoints | PASS | 3 tests each for `app/api/hint` and `app/api/writeup`. |
| Controlled terminal | PASS | `lib/terminal-scripts.test.ts`: 4 tests and `TerminalEmulator.test.ts`: 1 test passed. |
| Shell/navigation components | PASS | Sidebar (4 tests), leaderboard, XP bar, flag input, and landing console component tests passed. |

## Acceptance matrix

| Requirement | Status | Verifiable evidence / blocker |
| --- | --- | --- |
| `.env.local` configured from connected project | BLOCKED | No `.env.local` was present. It is ignored by Git through `.env*.local`; no credentials were created or inspected. |
| Email/password registration | BLOCKED | Requires a connected Supabase Auth project and a fresh disposable account. Source uses `auth.signUp` with Zod validation; unit build cannot prove the remote trigger. |
| Login and session refresh | BLOCKED | Requires the publishable key plus a real browser session. Auth redirect helper tests passed. |
| Protected game routes | PARTIALLY VERIFIED | Game layout redirects when no claims/profile and middleware delegates session refresh; live redirect could not be exercised without configuration. |
| Public safe challenge reads | PARTIALLY VERIFIED | Migration grants only named safe columns and `challenges_public`; SQL test asserts `flag_hash` is denied. Deployment-state confirmation is blocked. |
| Wrong flag increments attempts | PARTIALLY VERIFIED | RPC SQL test explicitly asserts three submissions produce three attempts; live RPC run is blocked. |
| Correct flag awards XP once | PARTIALLY VERIFIED | RPC SQL test asserts initial correct result earns XP and repeat result earns zero; route tests pass. |
| Locked/unlocked badge transition | BLOCKED | The RPC implements conditional award and profile renders `BadgeGrid`, but a seeded remote database and account are required for observation. |
| Global ranking | PARTIALLY VERIFIED | Query/component unit tests pass; live ordering requires seeded remote data. Friends/country are intentionally out of scope. |
| Sign-out | PASS (unit) | `app/auth/signout/route.test.ts` passed. Browser cookie/session confirmation remains blocked. |
| Landing/login/register visual desktop and 390px evidence | BLOCKED | Browser automation executable is unavailable and local server did not return HTTP headers within 15 seconds. No screenshots were fabricated. |

## Security and database review

Static migration review found the following intended controls:

- All user-facing tables enable RLS.
- `flag_hash` is absent from `challenges_public`; browser roles receive only named safe challenge columns.
- `challenges_public` is configured as `security_invoker`.
- `submit_flag(integer, text)` is the narrowly scoped `security definer` operation, with a fixed search path, execution revoked from `anon`, and execution granted to `authenticated` only.
- The SQL regression script checks unauthenticated rejection, wrong submissions, idempotent XP, attempt counting, RPC role grants, and denied `flag_hash` selection.
- The source scan found no plaintext flag values. `FlagHunt{...}` occurs only as documentation/example or UI placeholder text.

This is source-level evidence, not a claim about the deployed database. `supabase status` could not run in the sandbox because the installed CLI attempted to write `C:\\Users\\User\\.supabase\\telemetry.json`, outside the permitted workspace. No remote Supabase credentials or advisor connection were available.

## Local runtime and browser blockers

`npm run dev` started and announced `http://localhost:3000`, but `curl.exe -I --max-time 15 http://localhost:3000/` timed out with zero response bytes. `agent-browser` was not installed/available on PATH; `npx --no-install agent-browser --help` emitted no usable executable output. Therefore no browser snapshots, console checks, responsive inspection, navigation, or authenticated flow were claimed.

## Release disposition

The static quality gate is green. End-to-end release acceptance remains **blocked** until a maintainer supplies non-committed Supabase configuration, applies migrations and seed data to the intended project, and reruns the live/browser matrix with a disposable test account.
