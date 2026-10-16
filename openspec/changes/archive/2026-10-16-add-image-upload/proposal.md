# Change: In-memory image attachments and submission

## Status

Selected for refinement on 2026-10-16, item 3 of 8, on `feat/add-image-upload` based on merged `main` at `2d0283b`. The owner approved correcting the storage direction: visitor images remain in current-page memory and are transmitted for request processing without application persistence. This replaces the earlier visitor-bucket/periodic-cleanup recommendation. The owner asked to integrate the engineering details into this proposal. The owner approved implementation on 2026-10-16. Implementation and local verification are complete; see [verification.md](verification.md). The owner completed manual acceptance and explicitly requested archival on 2026-10-16. Archived before deployment at that request; integrated deployment remains in `add-demo-release`. No commit/push or merge was performed during archival.

## Why

Visitors need to select and compare several images in a conversation. Those images are temporary input, while Supabase Storage holds the curated artwork images associated with the knowledge base. Saving visitor input in Storage is unnecessary for the agreed page-local conversation lifetime.

## Confirmed Direction

- Support multiple images per user message, optionally with text, particularly two/three-image comparisons.
- Enforce an explicit per-image original-file size limit and a complete serialized-request size limit. Use the concrete initial limits in the design: 5 MB per original, 0.5 MB per prepared image, and 4 MB per complete request (decimal units).
- Keep visitor image files and previews in page-local memory for submission, retry, and later references during the same conversation. Refreshing or closing the page clears application-held state and does not replay requests.
- Do not write visitor files to Supabase Storage, business tables, browser persistent storage, server files, or shared caches. Server processing may hold bytes transiently for a request, without intentionally persisting or logging them.
- Use Supabase Storage for knowledge-base artwork images linked to curated records. Existing archive tables are empty and no buckets/images exist; this does not block this requirement's synthetic-file development or acceptance.
- No `chat-uploads` bucket, visitor retention period, cleanup job, new Storage policy, or Storage credential is needed for this requirement.
- Actual AI comparison, artwork identification, and provider image-input integration remain in later requirements. Do not fabricate answers in this increment.

## What Changes

- Enable the existing image control with multi-file selection, local previews, removal/replacement, consistent image labels, and preserved selection order.
- Accept images alone or with trimmed optional text while retaining text-only behavior and IME/keyboard gestures.
- Snapshot one complete ordered image set with its user turn. Preserve newer drafts while a request is pending and retain files required for eligible retry/context.
- Transmit actual image contents when the application request requires them; browser-local preview URLs are not remotely readable image inputs. Never send only metadata or blob URLs and claim that an image was submitted.
- Extend request validation/context to support image-only turns and eligible earlier images without Storage object references. Use the bounded JSON/base64 transport specified in the design.
- Preserve single-active-request locking, stable turn/attempt identities, final-turn-only retry, bounded requests, late-response guards, independent scrolling, and the existing unavailable outcome.
- Add meaningful unit/component, route, and real Next.js browser coverage with synthetic image files. Preserve shared UI components, theme scales, mainstream responsive layout, and centered mobile footer.

See [design.md](design.md) for numerical settings and the exact contract, and [review.md](review.md) for the resolved consistency audit.

## Concrete Initial Settings

- At most four JPG/JPEG or PNG images per turn. Original: at most 5,000,000 bytes, 16 million pixels, 8,192 pixels on either side.
- Prepared: at most 500,000 bytes and longest side 1,600 pixels. Sequential orientation-aware processing uses bounded 1600/1280 dimension attempts; JPEG quality 0.85/0.75/0.65, PNG retains PNG/transparency. If the bounds cannot be met, reject with a reason instead of silently degrading further.
- Send actual prepared bytes as base64 in the existing JSON POST request. Budget the full UTF-8 body, including historical images and text, at 4,000,000 bytes; independently enforce this before parsing on the server.
- Bound retained prepared blobs at 32,000,000 bytes, release originals after preparation, and process only one original at a time. The design distinguishes compressed byte budgets from decoded memory.
- Local validation/preparation errors preserve the draft without appending a turn. Pending requests keep the next text/image draft editable. Same-snapshot retry is available for transient final-turn failures; deterministic image/size failures explain corrective action rather than retry identical bytes.
- For image history overflow, show `图片上下文已达到本次对话上限，请刷新页面后重新选择图片。刷新会清空当前全部对话、图片和草稿。` Preserve current state until deliberate refresh.
- Keep valid requests generation-unavailable; implement no visitor persistence, real AI, Storage operation or fabricated answer.

## Interaction and Failure Behavior

Selection appends in picker order, with at most four slots. Reject an invalid/over-count/unpreparable new batch atomically, preserving the existing draft. Support replacement by remove-and-reselect and allow reselecting the same file. Apply processing feedback, stable turn-scoped image labels, and complete-set validation before submission. Prepared previews represent the transmitted copy.

Retain immediate request locking, keyboard/IME behavior, immutable eligible context, draft preservation, timeout/unmount/stale-result guards, final-turn-only transient retry, independent scroll/focus behavior and no replay on reload. Keep valid text-only JSON compatibility. The request budget includes only eligible history/current images; retained image memory also counts failed turn previews and the next draft. Preflight size before base64 allocation and acquire the attempt lock before asynchronous serialization. Removal during preparation preserves the latest edits without restoring discarded files. Bound the preview panel with shared spacing units and internal scrolling so four images do not displace the composer controls.

## Scope Boundaries and Dependencies

No visitor Storage integration, scheduled deletion, persisted chat history, login, curated artwork writes, live AI, generated comparisons, source/copy actions, or archive import UI. Knowledge-base bucket setup belongs to retrieval/image interpretation integration and is not a prerequisite for enabling visitor image submission.

Baseline: [chat-interface](../../../specs/chat-interface/spec.md) and [text-conversation](../../../specs/text-conversation/spec.md). The accompanying `image-upload`, `chat-interface`, and `text-conversation` deltas: enable the image control, remove the obsolete upload-disabled notice, allow image-only turns, and extend context/validation while retaining existing text scenarios. Keep the change ID for roadmap continuity.

## Impact and Review Status

Expected code: composer/controller, multi-image message presentation, page-local file lifecycle, attachment-aware validation/context/transport, and tests. No Supabase setup or database migration is required for visitor images. See [the image storage boundary](../../../../docs/storage.md).

Engineering settings, wire contract, response mapping, affected deltas and implementation/test tasks are integrated. `sharp` is an explicit production dependency for server-side prepared-image validation. Synthetic fixtures and real-page tests validate the initial settings; actual model comparison quality is later acceptance. No additional owner product decision is pending.
