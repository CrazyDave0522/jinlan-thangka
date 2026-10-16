## 1. Review Before Implementation

- [x] 1.1 Check consistency of the proposal, design, and both capability deltas against the confirmed product decisions: no product mocks, reload clears state, agreed submission gestures, single active request with editable drafts, and final-turn-only retry.
- [x] 1.2 Record implementation approval and run strict proposal validation; the confirmed product choices do not need to be requested again.

## 2. Implement After Approval

- [x] 2.1 Re-read relevant installed Next.js guides and shared UI/token conventions; define the small text-only request, response, turn-state, and context utilities.
- [x] 2.2 Add page-local client orchestration with stable turn/attempt IDs, immutable context snapshots, no storage, and one active request.
- [x] 2.3 Implement controlled draft editing, send-button behavior, confirmed keyboard gestures, IME guards, whitespace rejection, and immediate duplicate-submission locking.
- [x] 2.4 Add the validated no-store POST Route Handler with explicit unavailable and invalid-request outcomes only; add no live provider, database query, or canned answer.
- [x] 2.5 Implement pending/unavailable/error status presentation, response validation, bounded timeout/unmount cleanup, and retry only for a failed final user turn with no active request, without duplicate messages or draft loss.
- [x] 2.6 Preserve independent message scrolling and bottom composer; implement submission reveal and completion follow behavior without disturbing older-message reading or focus.
- [x] 2.7 Update the upload-only temporary notice and preserve disabled attachment/source/copy controls; keep the product initially empty and use shared visual scales.

## 3. Verify and Report

- [x] 3.1 Add deterministic unit and component coverage for context/payload validation, gestures/IME, whitespace, consecutive eligible user entries, current-question inclusion on retry, exclusion of earlier failed turns, concurrent events, all request outcomes, final-turn-only retry and retired-failure copy, newer drafts, timeout, and stale completion.
- [x] 3.2 Add route tests for valid unavailable-only behavior, invalid payloads/roles/IDs and mismatched final turns, exact error shapes/status classification, no-store headers for both outcomes, and absence of external-service calls.
- [x] 3.3 Extend real-page Chromium coverage for the actual POST lifecycle, sequential context, reload reset, intercepted success/failure/pending/retry, scrolling, and the compact mainstream viewport matrix; retain token/footer regressions.
- [x] 3.4 Run `npm run check`, production build, `npm run test:e2e`, strict OpenSpec validation, and whitespace checks; fix failures and report anything that cannot run.
- [x] 3.5 Visually inspect the new states and record tested viewports, browser coverage, synthetic-success limits, real-device limitations, and later integration ownership before marking implementation complete.

Implementation approved on 2026-10-16. All checklist items were completed and locally verified; see [verification.md](verification.md) for results and limits. The owner completed manual acceptance and requested archival on 2026-10-16; the change is now archived.
