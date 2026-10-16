## 1. Proposal Refinement

- [x] 1.1 Review the selected draft against merged capabilities, current code, and project conventions.
- [x] 1.2 Record confirmed product choices: four JPEG/PNG images, bounded preprocessing, page-local input/transient transfer, no visitor Storage, and deliberate refresh/full-clear warning on historical image overflow.
- [x] 1.3 Specify numerical file/pixel/prepared/request/memory limits, processing policy, JSON/base64 contract, body stream validation, error mapping, and retry/context/resource ownership.
- [x] 1.4 Complete image-upload, chat-interface, and text-conversation deltas, engineering review, and concrete implementation/testing tasks.
- [x] 1.5 Run strict proposal validation and document review status.
- [x] 1.6 Record owner implementation approval on 2026-10-16 for the refined proposal.

No additional owner product choice is pending. Initial engineering settings are in [design.md](design.md), with consistency review in [review.md](review.md). Validate settings using synthetic fixtures during implementation and surface any material quality/behavior change before adopting it.

## 2. Implement After Approval

- [x] 2.1 Read relevant installed Next.js guides and existing UI/theme conventions; define attachment types, shared limits, immutable image context, and validated JSON/error contracts with text-only compatibility.
- [x] 2.2 Implement bounded original header/content checks, sequential orientation-aware preparation, JPEG/PNG attempts, atomic batch acceptance, cancellation/stale processing, and shared page-local file/preview lifetime with memory accounting.
- [x] 2.3 Enable accessible multi-file picker/previews/removal, four-image validation, processing feedback, and next-image draft editing while preserving current keyboard/IME behavior, shared components/tokens, and mainstream layouts.
- [x] 2.4 Extend transient request serialization, exact UTF-8 size check, stable complete-set snapshots, pre-encoding size preflight and lock-before-await, per-turn image labels/grids/fallback, draft preservation, and no-Storage/no-persistence behavior.
- [x] 2.5 Add sharp explicitly; enforce bounded streamed JSON body reading, image content/ID/shape/dimension validation, defined no-store responses, and no provider/database/Storage operations.
- [x] 2.6 Implement transient final-turn retry, nonretryable corrective image/size outcomes, gateway 413 handling, 30-second request lifecycle, cleanup/stale guards, and existing scroll/focus behavior without a new reset control.

## 3. Verify and Report

- [x] 3.1 Unit/component tests: all numerical boundaries and one-over cases, supported/corrupt/animated content, orientation/transparency, bounded preparation/rejection, selection atomicity/order/reselection, URL/bitmap/shared-blob lifetime, pending drafts, context, retry, timeout/stale results, and memory budgets, remove-during-preparation without rollback, encoding timeout/duplicate events, and exact estimated/actual byte equality.
- [x] 3.2 Route/contract tests: actual bytes/base64, shape/roles/IDs, missing/forged length and oversized streamed body, server image validation, text-only and image-only paths, 413/415/422/503 mapping, no-store, and absence of persistence or external-service calls.
- [x] 3.3 Production Next.js Chromium: real synthetic-image selection/preparation/POST/unavailable, multi-image follow-up and size warning, intercepted transient/corrective failures and success seam, draft/retry/reload, plus core viewport/resize/grid/scroll/footer/token regressions including four-preview composer height.
- [x] 3.4 Run npm run check, production build, browser suite, strict OpenSpec validation, and whitespace checks; fix failures before completion.
- [x] 3.5 Visually inspect image/preparation/pending/error states, record synthetic processing results and numerical parameters, tested viewports, mocked/model-quality limits and real-device gaps; update implementation documentation and report completion without claiming live AI comparison.

Implementation and local verification are complete; see [verification.md](verification.md). The owner completed manual acceptance and requested archival on 2026-10-16; this change is now archived. Git publication and deployment remain separate steps.
