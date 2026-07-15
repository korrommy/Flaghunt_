# Task 6 report

## Delivered

- Implemented `POST /api/submit-flag` with strict Zod validation, verified Supabase `getClaims` authentication, route-only SHA-256 submission hashing, authenticated `submit_flag` RPC execution, and schema validation of the RPC result.
- Kept all responses free of plaintext answers, hashes, and provider internals. The route returns Thai 400, 401, 409, and 500 messages and revalidates dashboard, challenge, leaderboard, and profile pages only after a first correct solve.
- Implemented validated, authenticated `/api/hint` and `/api/writeup` stubs. Both return the agreed 503 Thai unavailable response only after validation and verified claims.
- Added a client submission boundary that refreshes the challenge page after a correct result, showing the updated solved state without a manual browser reload.

## Tests

- Added route coverage for malformed JSON, invalid input, unauthenticated calls, wrong flags, first correct solves, repeat solves, and both unavailable AI endpoints.
- Added submission-refresh behavior tests.
- `npm test`: 15 files / 44 tests passing.
- `npx tsc --noEmit --incremental false`: passing.
- `npm run build` started Next.js compilation in this environment, but the runner returned after its banner without a final completion line; type-check and the full test suite remain green.

## Security notes

- The route does not query `challenges.flag_hash`; it sends only the submitted flag's SHA-256 digest to the existing server-side RPC.
- Authentication is based on verified claims rather than mutable user metadata.

## P1 follow-up: earned-badge RPC contract (2026-07-11)

- Root cause: `submit_flag` intentionally emits an earned badge with only `id`, `name`, `description`, and `icon`, while the API route incorrectly validated it as the full database `Badge` record. A correct solve that earned a badge was therefore rejected as a 500 response.
- Added the safe `EarnedBadge` API type and use it for `SubmitFlagResult.badge` and the route's RPC row validation. The SQL response remains unchanged and does not expose unrelated badge fields.
- Updated the correct-solve regression to use and assert the real four-field badge payload.
- Verification: focused `app/api/submit-flag/route.test.ts` passes (6 tests); full `npm test` passes (15 files / 44 tests); `npm run type-check` passes.
