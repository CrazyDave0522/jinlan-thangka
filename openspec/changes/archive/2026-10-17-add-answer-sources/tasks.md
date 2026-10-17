## 1. Proposal Refinement

- [x] 1.1 Review accepted capabilities, text/image contracts, source rendering, reference artwork and test matrix.
- [x] 1.2 Define source navigation/details, missing/unscoped evidence, picture provenance, copy output/failures and acceptance scenarios.
- [x] 1.3 Add technical design and concrete tasks, including the chat-interface delta replacing disabled placeholders.
- [x] 1.4 Validate with `openspec validate add-answer-sources --strict` and review cross-capability consistency; complete the owner-requested omission review and rerun spec/link/diff checks as recorded in review.md.
- [x] 1.5 Obtain approval before implementation; record approval separately from the request to start this requirement. Implementation proceeded after the owner's readiness/proceeding request following four review rounds; see proposal.md.

## 2. Implementation After Approval

- [x] 2.1 Add shared presentation/export helpers without changing wire validators/canonical text. Freeze inputs and test narrow context projection, unrelated-history/transport exclusion, exact literal field/source/quote retention, null/blank/zero/false/enums, observation/comparison qualifications, group caps and per-answer evidence revisions.
- [x] 2.2 Add the shadcn base-nova Collapsible component as needed; implement initially collapsed shared source details with record identities/statuses, field/value and exact source-link/locator data. Cover record-only/unscoped and disputed/empty states.
- [x] 2.3 Integrate keyboard-operable E/R markers, exact-target focus/scroll and return navigation in blocks, identity evidence and comparison proofs. Show observation qualifications and exact group/picture/candidate/R/proof/contradiction bindings, including shared R and proof-only E keys. Preserve source distinctions without curated pixels/network requests.
- [x] 2.4 Enable copying with a shared actual-write lease, explicit timely/waiting/late states and dismissible read-only fallback. Test cross-answer contention, throws/rejection/nonsettlement, lease release, neutral retry readiness, dismissal/reopening, no async autofocus, explicit retry/manual selection and unmount; do not release on UI timeout, queue writes or remove focused fallback on success.
- [x] 2.5 Replace disabled-action fixtures/tests and update README/testing guidance. Scope composer/fallback textbox and live-status selectors to their named owners; keep initial product content empty and test evidence synthetic.
- [x] 2.6 Integrate reading intent with bottom-follow; preserve disclosure state and avoid focus/selection theft on background updates while respecting deliberate visitor focus/selection changes. Resume follow only through explicit visitor intent.

## 3. Verification and Acceptance

- [x] 3.1 Extend real Next.js flows for text/image navigation/copying, no-match/clarification, shared/proof-only/repeated keys and changed archive values under shared identities. Hold a response during old-source reading, then verify the next POST retains canonical history/observations/descriptors. Use per-test/request-correlated preload counters or an exclusive server phase for no-extra-traffic assertions; do not use shared global deltas under parallel workers.
- [x] 3.2 Verify long/expanded sources and manual fallback at all eight core viewports, keyboard focus/return, intermediate widths, reduced height and mobile landscape. Inspect desktop/mobile screenshots and theme/component consistency.
- [x] 3.3 Validate the upper-bound fixture with existing message validators before exercising 64 E entries/four R inputs/four comparisons within canonical/reply caps; verify complete reachable/exported content. Include zero/false, absent versus explicit statuses and same-label candidate identities.
- [x] 3.4 Run `npm run check`, the full isolated browser suite, an ordinary production build with AI/vision/fixture switches off, strict spec validation and `git diff --check`; fix failures and record results/limits.
- [x] 3.5 Report completed scope for owner acceptance. Keep data/domain/deployment checks explicit; do not archive, merge, publish or mark unfinished tasks complete merely because local checks pass.

## Delivery Status

Implementation and local verification are complete; see [verification.md](verification.md). Task 3.5 records delivery for owner review, not completed hands-on acceptance. Archived on 2026-10-17 following the owner's conditional archival request and the [readiness assessment](archival.md). Hands-on owner acceptance, real-data/domain evaluation, deployment, merge and publication remain pending or deferred as recorded there.
