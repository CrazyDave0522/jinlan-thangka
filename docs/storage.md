# Knowledge-Base Images and Visitor Input

## Agreed Boundary

On 2026-10-16 the owner clarified that Supabase Storage is intended for artwork images belonging to the knowledge base. Visitor images are temporary input for the current conversation, including multi-image comparison, and are not to be saved by this application.

| Image category          | Application lifetime and location                            | Association                                                                |
| ----------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Curated artwork images  | Long-term assets in Supabase Storage                         | Existing archive artwork/image records and their rights/source information |
| Visitor-selected images | Current browser page memory and transient request processing | Page-local conversation turns; no Storage objects or curated rows          |

The earlier `chat-uploads` bucket and scheduled visitor-file cleanup recommendation is superseded. No visitor bucket, anonymous Storage policy, Storage secret, retention period, or cleanup job needs to be configured for `add-image-upload`.

## Visitor Image Lifecycle

Select files into page memory, preview locally, and keep the captured files needed by submitted turns, retry, and eligible follow-up context. Preserve the order and image labels used by comparison questions. The owner confirmed at most four images per message, supporting only JPEG (`.jpg`, `.jpeg`) and PNG; WebP is excluded. Bounded resizing/re-encoding for transmission is accepted with clear feedback and preserved orientation, aspect ratio, and useful comparison detail. Removing/replacing previews releases obsolete resources without revoking URLs still used by conversation turns.

Actual submission must transmit image contents as required by the processing request. A browser blob URL is a local preview reference, not a URL accessible to a remote model. The application can handle bytes in request memory without intentionally writing them to Storage, database records, browser persistent storage, server files, or shared caches. Do not log image contents.

Reloading or closing the page clears the page-local conversation lifetime; the application does not restore attachments or replay requests. This is an application data-flow rule, not a promise about physical memory erasure or an external model provider's retention. Provider handling must be reviewed when real AI integration is added.

The initial engineering settings in the [image design](../openspec/changes/archive/2026-10-16-add-image-upload/design.md) are:

| Boundary | Limit |
| --- | --- |
| Original image | 5,000,000 bytes (5 MB), 16 million pixels, 8,192 pixels per side |
| Prepared transmitted image | 500,000 bytes (0.5 MB), longest side 1,600 pixels |
| Complete serialized JSON request | 4,000,000 UTF-8 bytes including base64, historical images, text and metadata |
| Retained prepared image blobs | 32,000,000 bytes, counting shared blobs once |

These use decimal units. Sequential bounded preprocessing tries 1600/1280 dimension bounds; JPEG uses 0.85/0.75/0.65 quality attempts and PNG preserves PNG/transparency. Unfit images are rejected rather than silently degraded further. Prepared previews match transmitted copies; original file references are released after preparation. JPEG/PNG metadata and actual contents must agree; animated PNG is outside the static-image scope.

Actual bytes use canonical base64 in `POST /api/chat` JSON, extending the existing text-only contract; there are no separate persistent uploads or server image IDs. Eligible historical images are retransmitted from page-local memory. Preflight metadata UTF-8 bytes plus exact base64 expansion before allocating encoded image strings, verify actual serialized size, and independently bound/validate the body on the server. The single-attempt lock and 30-second deadline start before asynchronous encoding; they do not begin only after fetch. No arbitrary remote URLs or browser-local blob URLs stand in for bytes.

If accumulated historical images exceed the request budget, warn the visitor to refresh and reselect images, explicitly stating that refresh clears the complete conversation, images, and draft. The owner accepts this reset. Do not refresh automatically or discard state before the visitor chooses to refresh. Current-selection validation failures preserve the draft; transient final-turn retry reuses the captured complete set, while deterministic invalid-image/size errors explain corrective action.

These settings are implemented locally and manually accepted in the archived image change. Synthetic processing fixtures and real-page Chromium tests verify the behavior; see [verification](../openspec/changes/archive/2026-10-16-add-image-upload/verification.md) for results and limits. No Storage setup was performed. Model-specific quality/encoding acceptance remains later work.

## Knowledge-Base Storage Setup

Existing business tables are present but empty; the owner has no buckets or artwork images yet. No archive dataset or bucket is required to develop and verify visitor attachment handling using synthetic fixtures.

When retrieval/image-interpretation integration needs curated assets, define an artwork bucket, stable object paths, read permissions, and `thangka.images.storage_locator` mapping together with archive rights/source records. Keep temporary signed URLs out of permanent identifiers. Do not rerun `database/schema.sql` against the existing tables or insert placeholder artworks merely to initialize Storage.

This document does not prescribe a bucket name, public access policy, or upload limit for the future curated collection. Those settings depend on its access/rights and integration requirements; no remote resource has been created or modified.

## Verification Ownership

`add-image-upload` owns page-local visitor files, actual transient submission, retry/context, no-persistence behavior, and responsive multi-image presentation. `add-thangka-retrieval` and `add-image-interpretation` own curated-asset access and matching against archive records. The provider integration must define actual image-input transport/processing; this attachment increment retains the explicit AI-unavailable outcome.
