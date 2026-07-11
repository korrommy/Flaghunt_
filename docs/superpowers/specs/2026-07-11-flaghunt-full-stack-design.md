# FlagHunt Full-Stack Design

## Product outcome

Build FlagHunt as a Thai-first CTF-lite learning app for beginners. Users can create an account, choose a learning mission, complete safe simulated-terminal challenges, submit flags, earn XP and badges, and compare themselves on a global leaderboard.

## Accepted visual system

- **Direction:** Black–gold command center, derived from the accepted Landing and authenticated-app concepts.
- **Palette:** `#0a0a0a` foundation, charcoal panels, restrained amber-gold highlights, `#00ff88` reserved for primary actions, XP, selected navigation, and success.
- **Shell:** Authenticated pages use a narrow sidebar, compact top status bar, and spacious dark-glass mission panels. Auth pages use a focused single-panel form. Landing uses a quiet navigation, strong mission-console hero, and linked learning-path preview.
- **Pages:** Landing; login and registration; dashboard; challenge workspace; global leaderboard; profile. All UI copy is Thai with English technical terms where useful.

## Product behavior

- Supabase email/password authentication creates profiles through the existing database trigger. Middleware protects game routes and redirects unauthenticated users to login.
- Challenges and chapters are read through the safe `challenges_public` view; `flag_hash` is server-only. The challenge screen uses xterm.js as a controlled simulator with a per-challenge command allowlist, never a real shell.
- Flag submissions validate with Zod, authenticate the caller, atomically update progress and profile XP, calculate the level from the project formula, and grant eligible badges. Re-submissions never award XP twice.
- AI Mentor is deliberately deferred. Hint and writeup controls show a Thai “coming soon” state and do not call an external provider or require an API key.
- Leaderboard v1 is **Global only**, ordered by total XP. Profile shows personal XP, solved count, hints, learning time placeholder omitted, and earned/locked badges.
- Daily quest is deterministic from the current UTC date and available challenges; its completion state is derived from `user_progress`. Activity feed shows the signed-in user’s latest solved challenges rather than pretending to be global real-time activity.

## Data and interfaces

- The connected Supabase project (`Flaghunt`, `sckvoqumsekradwbaqmz`, ap-southeast-1) is active and currently empty. Apply the repository's initial schema migration and seed data before connecting the application; do not commit `.env.local`.
- Retain the existing schema, RLS, `challenges_public` view, and seeded content. Add only the server-side database function/RPC needed to perform the flag solve, XP update, and badge grant transactionally.
- Add strict TypeScript domain types for database rows, public challenge data, terminal script data, API responses, and UI view models. No `any`.
- API routes: `POST /api/submit-flag` is live; `POST /api/hint` and `POST /api/writeup` validate/authenticate and return a typed unavailable response until AI is enabled.

## Quality and security

- All route inputs use Zod and return Thai user-facing errors. Service-role credentials stay server-only. No plaintext flags, client-side hashes, or executable terminal commands.
- Components stay under 150 lines, use Tailwind only, include prop interfaces and accessible labels, and respect reduced motion.
- Verify type checking, production build, authorization behavior, API validation, flag idempotency, UI states, desktop/mobile layouts, and visual fidelity against the two accepted generated concepts.
