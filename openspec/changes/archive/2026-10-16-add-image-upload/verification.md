# Image Attachment Verification

## Outcome

Implemented locally on `feat/add-image-upload` after the owner's implementation approval on 2026-10-16. The product now selects, prepares, previews, removes and submits up to four JPG/JPEG or PNG images per message, alone or with text. Prepared image bytes participate in ordered page-local context and final-turn transient retry. The actual endpoint validates the files and still reports generation-unavailable without fabricating an assistant answer.

Visitor images remain in page-local memory and transient request buffers; no Storage bucket, image table rows, browser persistence, server image files, or cleanup schedule was introduced. Curated artwork Storage and real AI comparison remain future integration work. Empty archive tables and missing Storage credentials do not block this feature.

The owner completed manual acceptance and explicitly requested archival on 2026-10-16. Archived before deployment at that request; integrated deployment remains in `add-demo-release`. No commit/push, merge, remote Storage/database change, or deployment was performed during implementation or archival.

## Automated Verification

- `npm run check`: ESLint, TypeScript and 95 Vitest tests across 12 files pass.
- `npm run test:e2e`: 41 Chromium tests pass. The command includes a production build and starts the built Next.js application, plus the existing isolated presentation harness.
- `openspec validate --all --strict --no-interactive`: all eight active specification/change items pass.
- `git diff --check`: passes.

### Request and State Behavior

Tests cover original header/size/count/pixel/side validation, format and MIME disagreements, unsupported/corrupt/truncated/animated content, positive image metadata, canonical base64, and duplicate attachment identities. Server tests exercise Sharp decoding of actual synthetic files, image-only/four-image/follow-up payloads, unsupported request content types, no-store 400/413/415/422/503 responses, streamed body limits with absent/forged Content-Length, and the exact 4 MB body boundary plus one byte.

Client tests compare estimated versus actual serialized UTF-8 lengths, including Chinese text and base64 padding boundaries, and verify that blob URLs/local objects never replace bytes in the wire payload. Context retains eligible images and excludes failed history. Four maximum-sized 500,000-byte prepared files require about 2.67 MB base64 before JSON/text; a six-image guarantee is deliberately not made.

Image draft tests verify batch rejection without losing earlier state, remove-during-preparation without restoring images, release of late results, retained submitted URLs until unmount, exact 32 MB prepared-blob allowance and rejection beyond it, 15-second preparation timeout, and stale processing. Conversation tests cover an immediate preparation guard, locking before asynchronous encoding, same-snapshot retry, new text/image drafts during pending, encoding timeout before fetch, and corrective 413/422 outcomes without identical-byte retry.

### Actual Browser Processing

Real Chromium runs the production image Worker and sends prepared bytes to the real Next.js endpoint. Across all eight core viewports it selects four synthetic pictures, validates ordered prepared dimensions/content, submits image-only input, reuses earlier images in a text follow-up, and reloads to empty state without replay. Selecting through the visible image button opens the picker; selection alone makes no chat request, and local/session storage remain empty in that flow.

Synthetic image checks establish these observed properties:

- A 2400 × 1200 JPEG with EXIF orientation 6 produces a correctly oriented 800 × 1600 transmitted image.
- A transparent PNG retains an alpha channel with intermediate alpha after actual browser processing.
- A deterministic high-entropy 1200 × 1200 PNG below the 5 MB original cap is rejected when bounded PNG processing cannot fit 0.5 MB, preserving the text draft. The implementation does not reduce below its policy to force acceptance.
- Deterministic processing unit fixtures exercise JPEG quality order, 1600/1280 dimension attempts, the exact 500,000-byte prepared acceptance boundary, no upscaling, PNG format preservation, rejection after six failed JPEG attempts and bitmap disposal on failures. These mocked encoding tests validate policy, while browser fixtures validate actual encoder output.

Additional browser tests exercise pending next-image drafts, identical image retry without duplicate turns, historical-image request overflow with the explicit refresh/full-clear warning and no new request/turn, non-JSON gateway 413, defined invalid-image 422, and image-only load fallback retaining other images.

### Responsive and Visual Verification

The real multi-image flow is checked at 360 × 800, 390 × 844, 414 × 896, 1280 × 720, 1366 × 768, 1536 × 864, 1920 × 1080, and 2560 × 1440 CSS pixels. Image-preview resize checks include 375, 430, 639, 640, 641, 768 and 1024 pixel widths. Four-preview short-height checks cover 844 × 390, 390 × 640 and 1024 × 720. Earlier presentation regressions retain the broader intermediate width sweep and shared-token/footer checks.

The preview panel is internally scrollable at at most 40 shared spacing units; ordinary short-height layout reduces that cap to 20 units. Tests verify an available message region and reachable composer/footer with no page horizontal overflow. Prepared images keep their proportions; submitted grids preserve selection order and per-message labels. Shared UI defaults and global tokens are unchanged.

Visually inspected screenshots of four-image previews and submitted image-only/text follow-up content at mobile 390 × 844 and desktop 1366 × 768, plus pending/failure with a next-image draft. Image grids, right-aligned bubbles, status/retry controls, persistent composer and centered mobile footer remain readable. A bottom-follow screenshot may show only the lower part of older desktop images; those remain accessible through the independent message scroll region. Synthetic colored fixtures are test assets, not sample product conversations. Screenshots/traces remain under ignored `test-results/`.

The first new browser run exposed an assertion race: counting two status elements also counted a pending second turn before its request arrived. The assertion now waits for its settled unavailable text; the complete suite passes. A dedicated immediate-preparation guard closes the same-event selection/send race, verified by a component test.

## Limits and Follow-up Ownership

- No actual AI, artwork identification, image comparison quality, grounding or provider image retention is validated. Provider-specific input/tokens/encoding and real archive comparison belong to later generation/interpretation requirements.
- Tested in Chromium with synthetic files and viewport/touch emulation. Physical phones, native iOS/Android pickers/IMEs, Safari/Firefox, device safe areas and a measured 80% audience coverage are not certified. Unsupported Worker/OffscreenCanvas processing reports a recoverable selection error rather than saving files elsewhere.
- The 32 MB limit counts retained prepared Blob bytes, not total process/browser heap. Sequential pixel-limited Worker processing and termination/disposal bound work, but decoded images and temporary base64/JSON buffers consume additional memory. Browser garbage collection timing is not guaranteed.
- Dense PNGs can be rejected under the fixed processing floor; this is deliberate and visibly explained. Numerical settings are initial engineering choices validated by synthetic fixtures, not a guarantee of useful model comparison detail for every real artwork.
- Request-specific transient buffers are released by normal runtime lifetime. The app does not intentionally persist or log image contents; this does not claim immediate physical erasure or govern a future external provider's retention.
- `sharp` 0.35.5 is now an explicit production dependency, using the version already present through Next.js. The first sandboxed npm attempt could not resolve the registry; the authorized retry installed successfully. No broad dependency upgrade or forced audit fix was performed.

## Final Implementation Audit

Rechecked actual code against the approved proposal and all three capability deltas at the owner's request. Count/format/byte/pixel limits, bounded preprocessing, complete ordered history, lock-before-encoding, final-turn transient retry, draft preservation, abort/unmount cleanup, no visitor persistence, and responsive/token rules agree with the design.

Corrected three small audit findings: removing a selected image now clears the prior request-size notice; duplicate/truncated PNG dimension chunks are rejected before decoding instead of allowing ambiguous header dimensions; native decoder/capability errors use a Chinese fallback while explicit validation messages remain intact. Added regression coverage for each. The full unit/component suite now passes 95 tests. Browser/production build verification was repeated for these code changes; no product settings or scope changed. Physical-device and actual AI-quality limits above still apply.
