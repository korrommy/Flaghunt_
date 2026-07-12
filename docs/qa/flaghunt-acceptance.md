# FlagHunt acceptance QA

Date: 2026-07-12 (Asia/Bangkok)
Scope: Task 8 end-to-end, security, and build verification. Local static
checks were re-run after the auth `searchParams` Suspense fix; remote and
browser acceptance remains unverified.

## Evidence executed

| Check | Result | Evidence |
| --- | --- | --- |
| TypeScript | PASS | `npm run type-check` exited 0 (`tsc --noEmit`) after the auth Suspense fix. |
| Production build | PASS | `npm run build` exited 0 using Next.js 14.2.5 after the auth Suspense fix. |
| Unit suite | PASS | `npm test`: 19 files and 53 tests passed. |
| Auth redirect helpers | PASS | `lib/auth/safe-next.test.ts`: 5 tests passed. |
| Submit-flag HTTP behaviour | PASS | `app/api/submit-flag/route.test.ts`: 6 tests passed. |
| Hint/writeup unavailable endpoints | PASS | 3 tests each for `app/api/hint` and `app/api/writeup`. |
| Controlled terminal | PASS | `lib/terminal-scripts.test.ts`: 4 tests and `TerminalEmulator.test.ts`: 1 test passed. |
| Shell/navigation components | PASS | Sidebar (4 tests), leaderboard, XP bar, flag input, and landing console component tests passed. |
| Final progression regression tests | PASS (local) | `npm test -- lib/queries/game.test.ts supabase/migrations/progression.test.ts`: 2 files and 9 tests passed. |

## Acceptance matrix

| Requirement | Status | Verifiable evidence / blocker |
| --- | --- | --- |
| `.env.local` configured from connected project | BLOCKED | No `.env.local` was present. It is ignored by Git through `.env*.local`; no credentials were created or inspected. |
| Email/password registration | BLOCKED | Requires a connected Supabase Auth project and a fresh disposable account. Source uses `auth.signUp` with Zod validation; unit build cannot prove the remote trigger. |
| Login and session refresh | BLOCKED | Requires the publishable key plus a real browser session. Auth redirect helper tests passed. |
| Protected game routes | PARTIALLY VERIFIED | `/dashboard`, `/challenge/[id]`, `/leaderboard`, `/profile`, and `/chapter/[id]` now reside under `app/(game)`, so they render through the verified claims/profile guard and shell. Live redirect remains blocked by missing configuration. |
| Chapter detail and progression | PARTIALLY VERIFIED | `/chapter/[id]` is implemented; locked chapter/challenge routes redirect to the dashboard and the daily selector only considers unlocked chapters. Local view-model regression tests passed. |
| Public safe challenge reads | PARTIALLY VERIFIED | Migrations grant only named safe columns and `challenges_public`; the SQL assertion script checks that `flag_hash` is denied. The assertions have not been run against a deployed project. |
| Wrong flag increments attempts | PARTIALLY VERIFIED | The SQL assertion script specifies that three wrong submissions produce three attempts; the script has not been run against a deployed RPC. |
| Server chapter progression | PARTIALLY VERIFIED | The canonical RPC migration and corrective migration reject a submission when the immediately preceding chapter has unsolved challenges; source regression tests pass. Applying/running the SQL remotely is blocked. |
| Correct flag awards XP once | PARTIALLY VERIFIED | The SQL assertion script specifies initial correct XP and zero repeat XP; route tests pass. The SQL assertion has not been run remotely. |
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
- The SQL regression script contains assertions for unauthenticated rejection, wrong submissions, idempotent XP, attempt counting, RPC role grants, and denied `flag_hash` selection. It has not been executed against a Supabase project in this QA run.
- The source scan found no plaintext flag values. `FlagHunt{...}` occurs only as documentation/example or UI placeholder text.

This is source-level evidence, not a claim about the deployed database. `supabase status` could not run in the sandbox because the installed CLI attempted to write `C:\\Users\\User\\.supabase\\telemetry.json`, outside the permitted workspace. No remote Supabase credentials or advisor connection were available.

## Local runtime and browser blockers

No usable browser automation environment or configured Supabase credentials are available for this QA run. Therefore no browser snapshots, console checks, responsive inspection, navigation, registration, login, or authenticated-flow result is claimed.

## Release disposition

The local static quality gate is green. End-to-end release acceptance remains **blocked** until a maintainer supplies non-committed Supabase configuration, applies migrations and seed data to the intended project, executes the SQL assertions there, and reruns the live/browser matrix with a disposable test account.
