# Text Conversation Verification

## Outcome

Implemented locally on `feat/add-text-conversation` after the owner's explicit approval on 2026-10-16. Text submission, page-local context, pending/unavailable/failure states, final-turn-only retry, draft preservation, request timeout, and scroll behavior are implemented. The owner completed manual acceptance and explicitly requested archival on 2026-10-16. The change is now archived before deployment at that request; integrated deployment remains in `add-demo-release`. No commit, push, merge, or deployment was performed during implementation or archival.

The real `POST /api/chat` endpoint validates the text-only contract and returns HTTP 503 with `generation_unavailable` for valid input, or HTTP 400 with `invalid_request` for malformed input. Both responses use `Cache-Control: no-store`. The handler does not log, store, query, or forward conversation contents. It has no synthetic success branch. The existing Supabase session-refresh proxy remains separate; browser tests blank its configuration to avoid external services.

The product opens empty, sends trimmed questions with internal newlines preserved, and shows an explicit unavailable status without inventing an assistant answer. Only page-local memory is used. Later questions include eligible completed/unavailable history; earlier failed turns are excluded. Retrying the failed final turn reuses the original identity and immutable context without duplicating its bubble or changing a newer draft.

## Automated Checks

- `npm run check`: ESLint, TypeScript, and all 51 Vitest tests across seven files pass.
- `npm run test:e2e`: all 25 Chromium tests pass. This command also runs the production build and starts the built Next.js application.
- `openspec validate --all --strict --no-interactive`: all eight active changes/specification items pass.
- `git diff --check`: passes.

Unit/component tests cover whitespace, desktop/touch keyboard policy, IME composition/confirmation and legacy composing-key protection, immediate duplicate locking, editable pending drafts, unavailable status, mocked success/context, failure classification, immutable retry snapshots, retired failures, timeout/abort, stale responses, and unmount/remount reset. Contract tests reject invalid message roles, blank content/IDs, duplicate IDs, empty arrays, mismatched final turns, and malformed/mismatched responses. Node-environment route tests exercise invalid JSON/payloads, unavailable-only behavior, no-store headers, and the absence of an external fetch.

The real production page is checked at 360 × 800, 390 × 844, 414 × 896, 1280 × 720, 1366 × 768, 1536 × 864, 1920 × 1080, and 2560 × 1440 CSS pixels. At each size, browser tests send actual requests, check HTTP 503/no-store and sequential context, verify no fabricated answer, check composer/footer visibility and horizontal overflow, and reload to empty state without replay.

Additional real-page tests intercept only the request boundary to exercise delayed pending state, editable drafts, failure/retry, matched success and later assistant context, retired historical failures, emulated composition events, and long-answer scrolling. A touch-enabled mobile context verifies Enter inserts a newline and tapping send submits. A reload-during-pending test checks abandoned messages/drafts and absence of replay. Long-answer completion follows the bottom while preserving scroll position and input focus when reading older content.

The original presentation regressions remain: empty welcome alignment, keyboard focus, branding/title/language, disabled upload/source/copy controls, long-content scrolling, image failure, mobile footer centering, and spacing/typography token reuse. Isolated component resize checks cover widths 375, 384, 393, 412, 430, 638, 639, 640, 641, 768, 1024, 1440, and 1707 pixels, plus 844 × 390 landscape. The first browser run exposed two overly broad test selectors matching Next.js's own route announcer; scoping them to the conversation region resolved the test ambiguity, and the complete suite passed again.

## Visual Review

Inspected Chromium screenshots of the real unavailable state at 1366 × 768 and 390 × 844, and pending/failure-with-retry states at 390 × 844. User bubbles remain right aligned, status feedback stays outside assistant cards, retry uses the shared Button variant, the composer stays at the bottom, and the mobile footer remains centered. New UI uses existing semantic colors and shared spacing/type utilities; no global tokens or shared component defaults were changed. Screenshots/traces remain under ignored `test-results/`.

## Limits and Follow-up Ownership

- Success responses and long answers are test fixtures supplied through intercepted requests or mocked fetch. These checks do not establish live AI behavior, grounding, citation accuracy, or provider performance.
- Chromium viewport/touch emulation and synthetic composition events do not establish physical phone keyboard, native Chinese IME, or Safari/Firefox behavior. Real-device keyboard/safe-area testing remains manual acceptance; no measured 80% audience coverage is claimed.
- `add-grounded-answers` owns live generation and any richer response/streaming contract or provider context limits. `add-thangka-retrieval` owns database retrieval; `add-image-upload` owns image selection/transfer and image context decisions. `add-answer-sources` owns source/copy actions.
- No new credentials, production dependencies, database migration, browser storage, or persisted history were introduced.
