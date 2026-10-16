## Context

`ChatInterface` currently provides a supplied-message presentation surface and an uncontrolled textarea. The product opens empty and all actions are disabled. The owner confirmed no product mock answers, no persistence, the desktop/mobile submission gestures, a single active request with editable drafts, and final-turn-only retry without duplication. These product choices are settled; this document records the implementation approach. A real request boundary with an honest unavailable result allows text interaction and error handling to be implemented before AI integration.

## Goals / Non-Goals

- Goals: text submission, deterministic ordering/context, a bounded request lifecycle, non-destructive retry, readable status feedback, and browser verification of the actual page.
- Non-goals: live AI, database retrieval, attachments, persistence, streaming, source/copy actions, and replacing the established UI system.

## Decisions

### Client state and presentation

Keep the Next.js page as a Server Component and add a client conversation controller. Reuse the existing shell/message components without making synthetic fixture messages part of production state. Pass controlled draft, submission callbacks, and per-turn status presentation into the appropriate client surface. Keep static branding/footer reusable, and retain the existing token and responsive conventions.

Use local React state/reducer plus small request/context utilities; a global state library is unnecessary. Each user turn has a stable identity, submitted text, its context snapshot, and one of `pending`, `unavailable`, `failed`, or `completed`. A completed turn can have one assistant answer. Track a distinct active-attempt identity so stale completions cannot attach to a newer request. The state may contain several settled turns but only one active request.

### Submission gestures and validation

The send button is the primary method on all devices. The confirmed keyboard policy uses Enter-to-send on desktop, Shift+Enter for a newline, and Enter-for-newline on mobile/touch. Do not identify a device solely by viewport width: use interaction capability where a keyboard shortcut differs, and exercise both paths with browser emulation and component tests. Always guard IME composition and composition-confirmation Enter, including the legacy composing-key indicator where necessary.

Normalize only the submitted copy by trimming outer whitespace, preserving internal newlines. Reject an empty result on the client and server. Do not invent a product text-length restriction in this proposal; provider-specific limits belong to later integration. Validate the text-only payload shape, roles, IDs, and final user entry. Treat malformed request bodies as invalid, never as prompts to evaluate code or construct SQL.

### Transport seam

Endpoint: `POST /api/chat`, using the installed Next.js Route Handler convention. Request shape: `{ turnId: string, messages: Array<{ id: string, role: "user" | "assistant", text: string }> }`. IDs and text must be nonblank strings, message IDs must be unique, the array must be nonempty, and its final entry must be a user message whose ID equals `turnId`. The final submitted text is normalized as described above. Consecutive user entries are valid: unavailable turns have no assistant answer, so do not require strict role alternation. Treat all fields as untrusted and reject unsupported roles and invalid shapes; do not silently discard malformed entries. The endpoint does not log, persist, query, or forward conversation contents to a provider.

For a valid request in this increment, return HTTP 503 with `{ error: { code: "generation_unavailable" } }`. This is intentionally mapped to the separate settled `unavailable` UI state, not a generic retryable failure. Invalid payloads return HTTP 400 with `{ error: { code: "invalid_request" } }`. Both error outcomes use `Cache-Control: no-store`, and request-specific context must not enter shared caches.

The minimal future successful response is HTTP 200 with `{ turnId: string, message: { id: string, role: "assistant", text: string } }`. The turn ID must match the active request; the answer ID must be nonblank and not collide with existing message IDs, and answer text must be nonblank. This text-only seam assumes no citations, models, or SDKs. The real endpoint has no success/mock-answer branch. Tests intercept this boundary or mock the transport to exercise a successful response and its subsequent context. Reject malformed or mismatched success payloads instead of silently rendering them. Only the combination HTTP 503 plus `error.code === "generation_unavailable"` maps to the settled unavailable state; other non-success responses, including 400, unexpected 503 bodies, and invalid JSON, map to failure. Keep response-state classification consistent with the same explicit contract in route, client, and tests.

Use an AbortController and an initial 30-second request timeout to bound pending state. This is a transport setting, not a model spending or product message-length limit. Clean up on unmount; an aborted/timed-out attempt must not later append an answer or clear another draft. No artificial reply delays or user-visible test mode are needed.

### Context construction

Build an immutable snapshot on submission: include settled `completed` user/assistant text pairs, user text from settled `unavailable` turns, and the current user message exactly once, in display order. Exclude failed/pending earlier turns, status notices, errors, retry metadata, draft text, and synthetic prompts. With no live model, the normal product context contains user messages only; tests may supply completed assistant responses through mocks.

Retry is available only when the final user turn is failed and no request is active. Reuse that turn's user-message identity and original snapshot, which includes its question exactly once; the exclusion of failed history applies to earlier turns, never to the current retried question. Creating a new later turn retires the older retry action, changes its notice to `发送失败。` so it no longer asks for an unavailable retry, and keeps that failed turn out of subsequent context. Do not append duplicate user bubbles, retry historical turns after later messages, or silently overwrite message history.

### Draft and response lifecycle

On a valid submission, snapshot the draft/context, append one pending turn, and clear that submitted draft. Acquire an immediate submission lock to cover rapid clicks and keyboard events before a React rerender. Keep the field editable while waiting, but reject a second submission while the lock is held. Show `正在处理…` while pending. Release the lock on every settled path.

For `generation_unavailable`, settle the turn with `AI 回复暂未接入，暂时无法回复。` as the unavailable status and allow further submission. For a network/timeout/unexpected HTTP or malformed-response failure, retain the user turn and show `发送失败，请重试。` with an accessible retry action only while it remains the final user turn and no request is active. A retry never alters the draft currently being edited. Do not clear or restore over a newer draft when any request settles.

Transient notices are system status/error content associated with their user turn, not assistant messages, database evidence, or fabricated answers. Upload remains disabled and its helper describes only upload unavailability. Preserve disabled source/copy behavior for any assistant content rendered through tests or later integration.

### Scrolling and accessibility

On explicit submission/retry, reveal the active turn/status inside the existing independently scrolling message region. On response completion, follow the bottom only if the visitor is still near the bottom (initial implementation threshold: 12 shared spacing units, equivalent to 48 CSS pixels with the current theme); otherwise preserve their reading position. Avoid focus changes on asynchronous updates.

Use polite status announcements for pending/unavailable feedback and an appropriate accessible error announcement for failure. Avoid announcing the whole conversation repeatedly. Keep named controls, visible focus, mobile-centered footer, and the bottom composer usable at the core viewport sizes. Do not add niche-device adaptations.

### Ephemeral lifetime

Store messages, snapshots, active status, and draft only in page-local memory. Do not write localStorage, sessionStorage, cookies, a backend history table, or a module-global user store. Reload creates an empty controller; closing/remounting it releases the pending attempt and does not replay a request. Do not add a history UI or persistence toggle.

## Testing Plan

- Pure/unit tests: whitespace normalization, valid/invalid payloads, ordered context, excluded failed/status/draft content, retry identity, and response validation.
- Component tests: button/keyboard/Shift+Enter/mobile behavior, composition-confirmation Enter, immediate duplicate lock, editable pending draft, unavailable status without assistant output, mocked successful responses, failures/retry, and stale or timed-out completions. Use deferred promises and fake timers instead of real network delays.
- Route tests: valid input returns only `generation_unavailable`, invalid JSON/roles/empty content return `invalid_request`, responses are no-store, and no provider/data service is invoked.
- Real Next.js Chromium tests: the real 503/unavailable path, two sequential requests with verified context, reload reset, intercepted pending/success/failure/retry paths, submitted/newer draft preservation, IME events where emulatable, and independently scrolling content across the mainstream matrix. Never report these as validation of real AI or physical mobile keyboards.
- Run the existing checks and production build. Extend, rather than discard, presentation/token/footer regressions. Update the previous Enter/new-message expectations only where superseded by this proposal.

## Risks / Trade-offs

- No AI means this is an interaction increment, not a useful automated answer yet: explicitly show unavailable status rather than a canned answer.
- A successful test response can be mistaken for production behavior: keep it in intercepted requests/unit fixtures and leave the real endpoint unavailable-only.
- Retry/context ordering can become ambiguous: only a failed final user turn is retryable when no request is active, and its original request snapshot is immutable.
- IME and mobile keyboard behavior differ: implement composition guards, test emulatable cases, and disclose unverified real-device cases.
- Context grows for the current page lifetime: provider-specific budgets and truncation rules are deliberately deferred; do not silently drop conversation entries here.

## Migration Plan

No database migration or new credentials. Add the client/route boundary after approval; update the active chat-interface delta instead of modifying its archived change. Later grounded-answer work replaces the unavailable handler and deliberately updates the response contract if richer output or streaming is needed. Retain the existing public route and brand UI.
