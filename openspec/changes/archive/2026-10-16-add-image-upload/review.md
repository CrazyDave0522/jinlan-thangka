# Image Attachment Proposal Review

## Outcome

Reviewed on 2026-10-16 against the active proposal, design, image-upload delta, tasks, project context, roadmap, storage boundary, and existing chat-interface/text-conversation specs. The confirmed direction and engineering design are now integrated for implementation review. Strict schema validation does not establish runtime behavior.

Confirmed alignment: multiple images for comparison, optional text/image-only submission, page-local lifetime, actual transient byte transfer, no visitor persistence/bucket/cleanup, empty archive independence, honest AI-unavailable state, shared visual/responsive conventions, and meaningful browser/route tests.

Corrected omission: project context still claimed that no application upload restriction had been requested. The owner explicitly requires a per-image size cap. Proposal, design, spec, and storage notes now consistently state that the cap is mandatory; its initial engineering value is now 5,000,000 original bytes, with separate prepared-image/request budgets. The complete request needs an independent cap; it includes eligible previous images and serialization overhead.

## Product Choices Confirmed After Review

The owner accepted the recommendations with the following format restriction:

1. **Count and formats:** at most four images per message; JPEG (`.jpg` and `.jpeg`) and PNG only. JPG/JPEG are two extensions for the same image format. WebP is excluded, including as an internal transmission format.
2. **Preprocessing:** bounded resizing/re-encoding is acceptable with clear feedback, preserved orientation/aspect ratio, and useful comparison detail. Exact settings remain engineering work.
3. **Accumulated context limit:** warn the visitor to refresh and select images again, explicitly stating that refresh clears the entire conversation, images, and draft. The owner accepts that reset. Preserve current state until deliberate refresh; do not silently omit history or add an unrequested reset control.

These choices no longer require another owner confirmation. Numerical file/decode/request/memory budgets, wire format, and preparation/failure rules are now specified in the design.

## Engineering Details Integrated

The concrete numerical limits, sequential JPEG/PNG preprocessing and rejection floor, orientation/transparency handling, atomic batches/reselection, shared preview/blob ownership and memory bounds, JSON/base64 contract and overhead accounting, streamed server validation, corrective/transient response mapping, pending-image drafts, retry/timeouts and scroll behavior are now specified in [design.md](design.md).

The original 5 MB limit is now retained as an explicit original-file allowance, distinct from the 0.5 MB prepared image and 4 MB complete request limits. These are engineering defaults to verify during implementation, not a claim of measured model/image quality. Four maximum-sized prepared files require about 2.67 MB of base64 before other JSON fields. More historical images are accepted only while the actual complete body fits; no fixed count of historical turns is promised.

## OpenSpec Deliverables

All three affected capability deltas are present. Existing scenario names are retained for modified requirements, while blank-text validation, image context, error semantics and upload controls are updated. The implementation checklist includes boundary tests, synthetic preparation fixtures, server decoding, actual real-page image bytes and no-persistence coverage. The owner subsequently approved implementation on 2026-10-16.

No product question remains open. During implementation, validate browser processing and server limits with deterministic fixtures; any material change to fidelity or agreed behavior needs review. Future model-specific transport, input quality, tokens, retention and real archive comparison remain in their owning requirements.

## Validation Scope

The review originally covered proposal documentation. The approved feature has since been implemented and locally verified; see [verification.md](verification.md). Strict OpenSpec/whitespace validation still establish document structure rather than runtime behavior; the implementation record lists actual component/route/browser checks. No bucket, private project data or credentials are needed from the owner for visitor input.

## Final Cross-Document Audit

A subsequent consistency check corrected these implementation-relevant gaps without changing confirmed product choices:

- The proposal previously conflated failed-history request inclusion with retained memory: only eligible history is transmitted, while retained failed previews still count toward memory.
- Size preflight now precedes base64 allocation; the immediate attempt lock and 30-second deadline include asynchronous encoding and retry, closing a duplicate-submission window before fetch.
- Batch rollback cannot restore images explicitly removed during preparation; invalidated late work is discarded while newer edits survive.
- Server/gateway 413 instructions distinguish historical images, current-only input, and text-only input. A 422 correction preserves the newer draft without automatically restoring old files or offering an identical retry.
- A four-image composer preview has bounded height and internal scrolling, with explicit narrow/reduced-height acceptance and tests.
- Prior-image context is mandatory for every eligible image turn, not ambiguously optional; positive dimensions, nonempty prepared files and malformed image arrays are explicitly validated.

The concrete limits remain unchanged and all affected modified requirement/scenario names were compared to the current baseline. No further owner decision is required by these corrections. The implementation checks are now recorded in [verification.md](verification.md); synthetic results do not establish real model comparison fidelity.

The final code audit and its three small corrective fixes are recorded in [verification.md](verification.md#final-implementation-audit). No blocking implementation/specification deviation remains from that review.
