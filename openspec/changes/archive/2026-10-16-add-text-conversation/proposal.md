# Change: Text messages and conversation context

## Status

Refined proposal, item 2 of 8, on branch `feat/add-text-conversation` based on the merged `main`. On 2026-10-16 the owner confirmed that live AI remains in its later requirement, synthetic replies are test-only, and conversation/draft state is cleared on reload. The owner also confirmed the submission gestures, single-active-request/editable-draft behavior, and final-turn-only retry policy. The owner approved implementation on 2026-10-16. Implementation and local verification are complete; see [verification.md](verification.md). The owner completed manual acceptance and explicitly requested archival on 2026-10-16. This change is archived before deployment at that request; integrated deployment remains in `add-demo-release`.

## Why

The existing home page renders conversation components but cannot submit a question. Users need reliable text submission and current-page context without mistaking a fabricated response for actual AI output.

## What Changes

- Enable text submission by button and the confirmed desktop Enter shortcut; Shift+Enter inserts a newline and Chinese input-method confirmation never submits. On touch/mobile use the send button, retaining Enter for a newline.
- Replace welcome guidance with the first submitted user message, preserve submission order, and allow only one active request at a time. Draft editing remains available while pending.
- Send a snapshot of current-page text context to a Next.js POST endpoint. Implement validation and an explicit generation-unavailable response, without an AI provider or database query.
- Show a pending status followed by an unavailable or failure status outside assistant answer cards. Support a future successful answer through the response boundary, exercised with test-only mocks.
- Provide retry only when the final user turn is failed and no request is active, without duplicating its user message, and prevent duplicate submissions or stale responses.
- Keep all state in the current page lifetime; do not use browser storage, a database, history navigation, or preloaded messages.
- Preserve shared components, theme scales, the compact responsive matrix, the independent message scroll region, and persistent bottom composer.

## Confirmed Decisions

- Follow the original roadmap: no live DeepSeek, archive retrieval, or synthetic product answers in this change.
- Messages, pending/error state, and draft are in-memory only; reload starts with empty welcome guidance.
- Desktop Enter sends and Shift+Enter inserts a newline. Mobile/touch Enter inserts a newline and the button sends. IME confirmation never submits.
- Only one request may be active. While pending, sending is disabled but editing the next draft remains available; completion must not clear or overwrite that draft.
- Preserve failed messages and retry only when the final user turn is failed and no request is active, without duplicate user bubbles or draft loss. Once a newer question is submitted, the older failed turn remains visible but loses retry and is excluded from future context.

## Confirmed Interaction Details

- Desktop: Enter sends valid text; Shift+Enter inserts a newline. Mobile/touch: Enter inserts a newline and the send button submits. During IME composition, confirmation Enter never submits, regardless of device.
- Trim outer whitespace for a submitted message, preserve internal newlines, and do not send blank/whitespace-only drafts.
- On accepted local submission, add one user message, clear only that submitted draft, and begin one request. A newer draft typed while waiting must survive all completion/error paths.
- While pending, disable send and retry; keep the input editable and upload disabled. Use the accessible status `正在处理…`.
- The real endpoint returns HTTP 503 with `error.code` equal to `generation_unavailable` for valid requests until AI integration exists; invalid requests return HTTP 400 with `invalid_request`, and both outcomes use `Cache-Control: no-store`. Show `AI 回复暂未接入，暂时无法回复。` as a status associated with the user turn, not an assistant answer. This is a settled state: the user may send another message; retry is not offered for a known unconfigured capability.
- For network errors, timeouts, invalid responses, or unexpected HTTP outcomes, retain the user message and show `发送失败，请重试。`. Offer `重试` only when this is the final user turn and no request is active; an older failure is never retryable merely because it is the most recent failure. A retry uses its original context and message identity; it does not append another user message or clear the current draft.
- A visitor may send a new message after failure. The previous failure remains visible as `发送失败。`, is excluded from future context, and no longer offers retry or tells the visitor to retry; do not reorder old turns through historical retries.
- Context contains eligible earlier completed/unavailable text and the current question once. Exclude earlier failed turns, but always include the question being retried. Consecutive user messages are valid because unavailable turns have no assistant answer.
- Sending a message explicitly scrolls to its pending status. Later completion scrolls only if the visitor remained near the bottom; reading older messages must not be interrupted or keyboard focus stolen.
- Keep the permanent evidence helper. Replace the old disabled-send notice with `图片上传功能暂未开放。`; show response availability beside the affected turn.

## Scope Boundaries

No AI calls, generated factual claims, database/Storage access, image selection/upload, source inspection, clipboard behavior, streaming output, stop-generation control, login, persistence, new-conversation/history UI, or live web search. Do not select a model or introduce an AI SDK. User messages sent in this increment reach the application endpoint but are neither stored nor delivered to an AI provider.

## Dependencies and Spec Changes

- The [chat-interface specification](../../../specs/chat-interface/spec.md) is implemented, archived, and merged into `main`.
- Add `text-conversation` requirements for submission, context, request lifecycle, retry, scrolling, and ephemeral state.
- Rename and modify the existing composer requirement using a `chat-interface` delta. The original send-disabled/Enter-never-submits scenarios must not remain the current specification after this change is archived.
- `add-grounded-answers` later implements real generation at the response boundary. `add-image-upload` enables attachment selection/upload. `add-answer-sources` enables its controls.

## Impact

- Expected code: client conversation orchestration, composer/message-status presentation, shared request/context types, a text POST Route Handler, and tests.
- Preserve the Server Component entry page and static shell where practical; isolate interactive state behind a Client Component boundary.
- No database migration, secrets, external-service setup, or new production dependency is required by this proposal.

## Acceptance and Verification

Use Vitest and React Testing Library for composition gestures, whitespace handling, context snapshots, pending locks, duplicate prevention, unavailable/error outcomes, retry identity, draft preservation, malformed requests/responses, and late-response handling. Use mocked success responses only in tests to verify future context and answer rendering.

Use real Next.js Chromium browser tests for the actual POST/unavailable lifecycle, keyboard behavior, reload reset, repeated submission, error/retry through intercepted requests, and scrolling at the compact eight-viewport matrix. Extend current tests without treating the isolated Vite harness as proof of a Next.js request lifecycle. Routine tests use no paid APIs or real Supabase data.

Run `npm run check`, `npm run build`, `npm run test:e2e`, strict OpenSpec validation, and visual verification before reporting implementation complete. Record real-device keyboard/touch limitations honestly.

## Deferred Work

Live response generation and grounding, model-specific context limits, streaming transport, image context, persisted conversations, and full citation contracts remain in their owning requirements. This proposal supplies a small text-only transport seam rather than a speculative general AI platform.
