## 1. Proposal Refinement

- [x] 1.1 Create `feat/add-demo-release` from clean `main`; review accepted capabilities, archived limits, existing coverage and the owner-confirmed empty archive.
- [x] 1.2 Define milestone A for empty-archive preview acceptance and B for deferred real-data/domain acceptance, retaining whole-change completion gates.
- [x] 1.3 Add design, acceptance/failure matrix, concrete tasks and owner inputs; synchronize project/roadmap context.
- [x] 1.4 Complete self-review and strict OpenSpec/link/diff checks; record fresh baseline results and limits.
- [x] 1.5 Obtain review/approval of this detailed proposal before implementing the following sections. The owner confirmed continuation immediately after the explicit A-stage proposal approval request on 2026-10-17; deployed paid-call scope remains separate.

## 2. Milestone A: Engineering After Approval

- [x] 2.1 Map A01–A15 to existing assertions and manual/deployed checks; identify composed-flow gaps without duplicating feature suites. See the verification coverage table.
- [x] 2.2 Verify A13's ordered real-route text/image/follow-up/reread/draft/copy/reload journey at all eight core viewports, reusing existing helpers/assertions and adding only missing integration/failure coverage; preserve fixture/network isolation. Eight new composed cases pass.
- [x] 2.3 Resolve reproduced integration defects within accepted specs; use a separate proposal for new product behavior or architecture. No product defect reproduced; corrected a new export-label assertion and excluded generated browser/evaluation artifacts from lint.
- [x] 2.4 Prepare `docs/demo-release.md` with existing-project setup, environment classes, same-project archive/count inspection, budgeted owner review, dispatch/usage evidence, disabled/active smoke, limits and rollback. Offline synthetic input preparation and tested read-only inspection SQL are included.
- [x] 2.5 Run `npm run check`, full isolated Chromium suite and separate ordinary production build; inspect relevant responsive evidence and record results in `verification.md`. Passed 406 Vitest tests, 107 Chromium cases and ordinary build; representative screenshots inspected.

## 3. Milestone A: Existing Vercel Project

- [x] 3.1 Inspect project identity, repo/root/branches, current deployments, Preview scopes, runtime/duration and access for the supplied URL without exposing values. Connected metadata and the newly authenticated CLI identify the existing project, root directory, default build/install/output settings, Git-linked `main` Production branch and enabled Git deployments. The current Production is `main@c841ea4`; `/api/chat` is Node 24 / 60 seconds. Both saved Supabase entries match the inspected archive, model is correct, text is enabled, vision/fixtures are absent and no release-branch Preview/overrides exist at inspection. Captured deployment environment names agree; values are not returned. See `verification.md`; actual new-Preview verification remains in 3.2–3.4.
- [x] 3.2 Prepare concrete commit/settings/access review and perform the authorized initial branch Preview setup. Published guarded `b7b539e`, created/read back both release-branch-only false Config overrides, removed the temporary guard and published ordinary `37af020`. Git Preview `dpl_EKPXaUsrDKg1XcvZ5eAdKZ5UytJU` is READY with existing Supabase/model, fixtures absent, chat timeout 60 seconds and effective text/image unavailable outcomes. Production settings/mapping and existing SSO are retained.
- [x] 3.3 Match the ordinary Preview's inherited Supabase Config to the smoke environment. Fresh anon reads/RPC pass; separately authenticated postgres/BYPASSRLS inspection confirms eight empty tables, SELECT-only anon grants, expected RLS/policies and invoker search function. Temporary local config pull confirms Data API enabled, thangka exposed and max_rows=1000. No schema/data/Storage writes.
- [x] 3.4 Verify both no-service-credential and configured-disabled states, ordinary build/settings/duration and actual transport. Configured Git Preview passes HTML/hydrated desktop/mobile, text 503, image 422, malformed 4,000,000/4,000,001-byte bodies 400/invalid_request and 413/request_too_large, JSON/no-store. Auxiliary CLI Preview from the same commit archive uses deployment-only empty service credentials and false switches; its browser checks pass page/text/image/reload. Keep this target distinct from the configured Git Preview. See verification.md for initial test-assumption correction, request counts and limitations.
- [ ] 3.5 Agree deployed audience/window/funded allowance and owner/device participation; freeze P01–P06 inputs/rubric/session boundaries/P05 eligibility, count all dispatched attempts within six submissions/twelve calls and stop on failure/unmet prerequisite/cap. Record dispatches, observed completion/usage, unknown activity with conservative bounds, latency and available expenditure without retries or replacements.
- [ ] 3.6 Complete live owner desktop/mobile actions inside the 3.5 batch, with remaining source/control checks in identified fixtures/disabled Preview and non-submitting live copy/reload checks. Record participation/native-device limits and obtain available agreed allowance before any extra active question; this checklist item adds no free submissions.
- [ ] 3.7 Exercise/document rollback; default test deployments to both model switches false unless ongoing scope is explicitly agreed, preserve prior production state, retire/control enabled test URLs and verify final state without unbudgeted provider calls before closing A.

## 4. Milestone B: Deferred Until Real Material Exists

- [ ] 4.1 Resume when the owner supplies/approves actual records/sources, permitted assets/grants, expected domain judgments and funded evaluation scope.
- [ ] 4.2 Verify B01–B02 actual retrieval, claim-to-source support and source/export accuracy.
- [ ] 4.3 Run B03–B06 numbered/ordinary-photo positives, similar/ambiguous negatives and actual reference access under the archived protocol; record failures and limits.

## 5. Whole-Change Completion

- [ ] 5.1 Identify the final commit/deployment/configuration/archive/grant state; compare it with A/B evidence and rerun affected checks, recording why unaffected evidence remains reusable. Keep A's empty-state evidence historical without clearing later curated data; unavailable real-data checks remain deferred. Confirm both milestones and the final candidate before completion, with paid reruns inside agreed scope.
- [ ] 5.2 Obtain final integrated owner acceptance, synchronize release records and validate all specs/changes before normal archival; record publication/merge/deployment facts separately.
