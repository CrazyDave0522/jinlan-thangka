## Context

The owner confirmed multi-image comparison input, at most four JPG/JPEG or PNG images per message, page-local visitor files, bounded preprocessing, and an explicit warning to refresh and clear the conversation when historical image context exceeds its budget. Supabase Storage is for curated knowledge-base images only. This design records the approved implementation. Implemented and locally verified on 2026-10-16; see [verification.md](verification.md). No remote resources were changed.

## Goals / Non-Goals

- Goals: local multi-image selection and preview, bounded processing and transient transmission, ordered image context, final-turn retry, draft preservation, no visitor persistence, and deterministic tests across mainstream layouts.
- Non-goals: live AI/comparison, visitor Storage, scheduled cleanup, login, persisted conversations, archive asset provisioning, drag/drop/paste/camera-specific workflows, reorder tools, enlargement modals, or a new-conversation control.

## Decisions

### Concrete limits

Use decimal byte units consistently in UI, client, server, and tests. These are initial engineering parameters, not measured model-quality guarantees.

| Boundary | Initial setting |
| --- | --- |
| Files per user turn | 4 maximum |
| Original file | Nonempty, at most 5,000,000 bytes (5 MB) each |
| Original image | JPEG or static PNG; at most 16,000,000 pixels and 8,192 pixels on either side |
| Prepared image | At most 500,000 bytes (0.5 MB); longest side at most 1,600 pixels; JPEG or PNG |
| Complete request | At most 4,000,000 UTF-8 bytes, including base64 data, history, text, metadata, and JSON syntax |
| Retained prepared image blobs | At most 32,000,000 bytes across turns, failures, active attempt, and next draft; count shared blobs once |
| Original files in preparation | One batch at a time, at most four files / 20,000,000 bytes; release after processing |
| Preparation | Sequential images; at most 15 seconds per file; stale work must be ignored and resources released |
| Active POST attempt | 30-second attempt deadline, starting before asynchronous encoding and covering encoding/fetch/response parsing; abort or ignore stale work on timeout/unmount |

The browser validates original byte size and reads bounded JPEG/PNG dimensions before allocating a full bitmap. Reject corrupt/truncated data, unsupported formats, MIME/content mismatches, and animated PNG, using visible reasons. A missing browser MIME declaration is acceptable when the extension and validated signature identify a supported format; a nonempty conflicting MIME is rejected. Normalize uppercase extensions. Do not trust filenames alone. The server independently validates the prepared bytes it actually receives; it cannot verify an original that was never transmitted.

The 32 MB blob budget is not a promise that total browser memory is 32 MB: decoded bitmaps and canvas buffers are larger. Sequential preparation, pixel limits, prompt bitmap/canvas disposal, and unique shared Blob references bound predictable allocations. For memory-budget exhaustion, preserve current state and show a refresh/full-clear warning rather than evicting old pictures.

### Selection and preprocessing

The picker supports multiple files and appends in picker-provided order; there is no new reorder UI. A new batch that exceeds four slots or has an invalid/unpreparable file is rejected as a whole, preserving the existing draft. Removal followed by another selection is the replacement workflow. Allow selecting the same file again, including after removal; each selection gets a new attachment identity, with no surprise content deduplication. Revoke discarded batch URLs. Canceling the picker changes nothing. Explicit edits made during preparation are never rolled back: removing any image invalidates the in-flight batch, discards its uncommitted results, and keeps the visitor's latest remaining selection/text. The visitor can then select again; failed preparation must not restore a removed image.

Preparation occurs after selection, before send, in a dedicated module Worker using createImageBitmap and OffscreenCanvas. Abort, removal, timeout and unmount terminate the Worker so native processing cannot outlive the attempt and revive discarded state. Disable send while its current draft images are preparing. Keep text editable and allow removal; selection of another batch is disabled during preparation. Use draft/attachment generation IDs so removed/replaced/unmounted work cannot reappear. Show `图片将适度缩放或压缩后发送，仅在当前页面保留。` while attachments are present and accessible `正在处理图片…` feedback during preparation.

Preserve aspect ratio and apply JPEG orientation once when decoding; strip old orientation metadata in the prepared copy. Never upscale. For JPEG, first try longest side min(original, 1600) with OffscreenCanvas JPEG quality 0.85, 0.75, then 0.65, stopping at the first result within 500,000 bytes. If necessary repeat at min(original, 1280), without enlarging or retrying identical dimensions. For PNG, preserve PNG/transparency and try these same two dimension bounds without conversion to JPEG. Do not introduce WebP. Do not reduce farther than these bounded attempts or claim that numeric quality settings prove model fidelity.

If no prepared copy fits, reject the new selection batch with a clear message asking the visitor to choose a smaller image. Do not silently apply more destructive processing. Synthetic images verify byte/dimension/orientation behavior during implementation; actual Thangka comparison quality is later model acceptance. A necessary change to these bounds that materially reduces detail must be surfaced for review.

Display the prepared copy in both draft and submitted message so the visible image corresponds to the bytes that are sent. Keep prepared blobs and their object URLs in a page-local registry indexed by attachment ID; turns/context hold references, avoiding repeated encoded copies. Discard original File references after preparation. Keep previews still owned by a turn or draft; revoke a URL only when no owner remains, and release all on unmount. No browser persistent storage, server files, Supabase objects, database rows, image-content logs, or shared image caches.

### Wire contract and server validation

Retain `POST /api/chat` with `application/json`. Keep the existing text-only shape unchanged. Extend user entries with optional `images`, omitted when absent:

```typescript
{
  turnId: string,
  messages: Array<
    | { id: string; role: "user"; text: string; images?: Array<{
        id: string; mimeType: "image/jpeg" | "image/png";
        width: number; height: number; data: string;
      }> }
    | { id: string; role: "assistant"; text: string }
  >
}
```

`data` is canonical base64 of prepared image bytes without a data-URL prefix, URL, or Storage locator. Empty user text is valid only with at least one valid image; assistant text stays nonblank and assistants cannot carry input images. Per-user image arrays contain 1–4 entries. Preserve order and stable image IDs; attachment IDs are nonblank and unique across the request, as are existing message IDs within their namespace. Final message remains the user identified by `turnId`; consecutive users remain valid. Text is trimmed on local submission, with internal newlines preserved.

Base64 is selected to extend the existing JSON boundary with a small implementation surface and an exactly measurable body. Its expansion is included in the request cap: a maximum prepared file uses 666,668 base64 characters, so four such pictures require about 2.67 MB before other fields, not 20 MB of original data. Do not promise that six maximum-sized pictures fit with history; actual serialized byte length decides.

Before encoding image bytes, build the complete eligible snapshot with empty `data` strings and compute its JSON UTF-8 byte size plus `4 * ceil(blob.size / 3)` for every image. Canonical base64 needs no JSON escaping, so this is an exact preflight and rejects oversized history without allocating a giant encoded body. After serialization, verify actual UTF-8 size again and refuse oversized requests before fetch. Release temporary encoding strings/buffers after settlement; a retry reconstructs the same logical payload from the captured prepared blobs rather than reprocessing originals. Do not retain per-turn base64 copies of all historical images.

On the server, check declared length if available but also read/count the body stream up to 4,000,000 bytes before parsing, stopping on excess; an absent or forged Content-Length cannot bypass the cap. Enforce the same cap for plain text requests. Require JSON content type. Validate schema/roles/IDs, strict base64, decoded byte size, supported MIME/signature, no animation, actual dimensions, and complete decodability. Metadata dimensions must be positive integers matching actual bytes and the longest side must be <=1600; decoded files must be nonempty. Request `images` arrays cannot be empty, contain null/unknown entries, or appear on assistant messages. Reject image metadata/content disagreements rather than normalize them silently. Decode sequentially with bounded pixel allocation. Use `sharp` as an explicit production dependency for prepared-image validation rather than importing Next.js's transitive dependency. No provider call is made in this increment.

### Response and error behavior

All application-owned outcomes return `Cache-Control: no-store` and `{ error: { code } }`. The successful future text-only response seam remains unchanged.

| HTTP | Code | Client behavior |
| --- | --- | --- |
| 503 | `generation_unavailable` | Settled unavailable; existing honest copy, no retry |
| 400 | `invalid_request` | Final-turn failure under existing retry policy; no claim AI is unavailable |
| 415 | `unsupported_media_type` | Reject unsupported request Content-Type as a contract failure |
| 422 | `invalid_image` | Failed final turn; show that the image cannot be processed and advise checking/reselecting it; do not offer an identical-byte retry |
| 413 | `request_too_large` | Show explicit request-limit/refresh warning; no identical-byte retry |
| Network, timeout, other/malformed response | N/A | Existing retryable final-turn failure and stale-attempt guards |

A generic gateway 413, even with non-JSON body, is a size outcome rather than a misleading AI-unavailable or generic retry message. A malformed 422 without the defined error code follows existing generic failure classification. Store failure reason separately from the public pending/failed/unavailable/completed turn status. Older failures retain an accurate non-retry instruction; a subsequent turn excludes failed history as before.

Local selection/preparation/count/memory/full-payload validation failures occur before a turn is appended or its draft cleared. Preserve the complete valid draft. Preparation reports its file and reason. Current-only payload overflow asks for fewer/smaller attachments or less text. If the complete image request overflows with eligible historical images present, show `图片上下文已达到本次对话上限，请刷新页面后重新选择图片。刷新会清空当前全部对话、图片和草稿。` A text-only oversized request uses a text/context size warning rather than blaming pictures. Apply the same distinction to server/gateway 413 outcomes: original attempt metadata tells the client whether historical images, only current images, or no images were sent. For 422 `invalid_image`, show `图片无法处理，请检查图片后重新选择并发送。`; retain the failed turn and newer draft without offering an identical retry or restoring old files into that draft. A new corrected submission is a new turn. Older corrective failures may use the existing brief `发送失败。` without an outdated corrective action. Do not clear or refresh automatically.

### Context, draft and request lifecycle

Include eligible completed user/assistant turns and unavailable users, including their complete ordered prepared images, plus the current turn once. Exclude failed/pending earlier turns, notices and drafts. No semantic automatic selection of images: all eligible images are retransmitted even on a text-only follow-up, with their associated message IDs. Each turn's labels 图片 1, 图片 2 are scoped to that turn, with unique internal attachment IDs and accessible message association.

Only after preparation and synchronous complete-payload preflight succeed, acquire the immediate attempt lock before the first asynchronous encoding operation. Capture immutable text/image references, append one pending user turn, clear the submitted draft, reveal the turn, start the 30-second deadline, then encode and fetch. Encoding failure/timeout settles that accepted turn as a transient failure; it must not unlock or append a duplicate turn through competing Enter/click events. Final-turn retry uses the same lock-before-await rule. A second actual-size check failure is a corrective size failure without retry, not a silently transmitted oversized body. Keep the next text and image draft editable during pending; its preparation uses the same sequential preparation queue. Sending remains locked while a request is active or the draft is preparing. Async completion never changes a newer draft.

Transient final-turn retry reuses the original logical snapshot, user/attachment identities and prepared bytes in order without appending a new bubble. It does not process or transmit a subset, and does not consume a newer draft. Preserve prior single-attempt identity, timeout/unmount cleanup, 503-specific classification, scroll-follow only when near bottom, and no focus theft. Deterministic invalid-image or size failures instead explain the corrective action. The old failure loses retry once a new turn is sent.

### Presentation and lifetime

Reuse shared shadcn variants, semantic colors, Geist, Lucide, and theme/Tailwind scales. Enable the picker with accessible names and individual remove controls, wrap ordered preview/submitted grids preserving aspect ratio, cap the composer preview panel at 40 shared spacing units with internal vertical scrolling so four previews cannot crowd out the message region or primary controls, and remove the obsolete upload-disabled notice. Retain permanent evidence helper and disabled source/copy actions. Show per-image load fallback including its label even for image-only turns. No example conversation is preloaded.

Images remain only in current-page memory. Refresh resets messages, files, drafts and requests, with no restore/replay. Accepted history overflow uses deliberate refresh and full reset; no reset button is introduced. Preview/resource disposal is application cleanup, not a promise of immediate physical-memory erasure. Provider retention/input details belong to later AI integration.

## Verification Plan

- Boundary tests at each exact count/byte/pixel/side limit and one above; uppercase/missing/conflicting MIME, JPEG orientation, transparent/static versus animated PNG, corrupt/truncated data and decompression limits.
- Synthetic browser processing fixtures exercise size/quality/dimension attempts and rejection floor; do not claim real artwork/model quality from these tests.
- Batch atomicity, cancellation, append/remove/reselect, failed/stale processing, bitmap/object URL/reference lifecycle, originals release, aggregate memory accounting without double-counting shared blobs, and next-image draft preservation.
- Request tests inspect actual decoded image contents/order, complete historical snapshot and UTF-8/base64 overhead, text-only compatibility, image-only turns, IDs/shape validation, missing/forged Content-Length, bounded streamed body and gateway 413 handling, defined 422, no persistence/provider/Storage access, and all no-store responses.
- Include races during asynchronous serialization/retry, remove-during-preparation without rollback, metadata empty/noninteger dimensions, exact preflight versus actual UTF-8 bytes, and server/gateway size-copy distinctions. Verify the scrollable four-preview composer at mobile/reduced heights.
- Component/browser failure tests distinguish local pre-submit failures from appended transport failures, transient same-snapshot retry from nonretryable corrections, editable pending draft, timeout, unmount/reload, stale responses, and exact refresh/full-loss warning.
- Real production Next.js Chromium flow and the existing compact eight-viewport/resize matrix cover picker, prepared previews, grids, real unavailable POST, mocked errors/success, independent scrolling, composer, mobile-centered footer and tokens. Disclose native phone keyboard/picker and synthetic event limits.
- Run `npm run check`, production build, browser tests, strict OpenSpec validation and whitespace checks during implementation; fix failures before completion. No credentials or real artwork data are required.

## Follow-up Ownership

The concrete settings above are the initial implementation design and have been verified with synthetic fixtures and real-page Chromium checks. Actual AI input encoding, provider-specific resolutions/tokens/retention, archive matching and real comparison quality remain later work. No product question remains open for this proposal; implementation and verification details are recorded separately.

## References

- [Vercel Functions limits](https://vercel.com/docs/functions/limitations): documented 4.5 MB payload ceiling; 4,000,000 application bytes intentionally leave headroom.
- [Sharp constructor](https://sharp.pixelplumbing.com/api-constructor/): explicit image decoding/pixel limits. Use the installed dependency's actual API when implementing.
