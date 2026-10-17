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
- [ ] 3.2 Prepare concrete commit/settings/access review, resolve missing decisions, then perform authorized initial branch Preview setup: existing Supabase URL/publishable key, accepted model and both provider switches false. Vercel rejects overrides for a missing remote branch, so publish first with a temporary `git.deploymentEnabled` guard for only this branch, create/verify both branch-only false overrides, then remove the guard and publish the ordinary candidate. Distinguish current public URL/new Preview and shared settings; preserve production mapping/settings and keep fixtures off.
- [ ] 3.3 Match the Preview's actual Supabase project/configuration to the smoke environment; pair anon table/RPC reads with fresh read-only owner/admin counts for all eight tables and grants/RLS/policy inspection, keeping privileged inspection outside the app and unavailable evidence open. Make no schema/data/Storage writes.
- [ ] 3.4 Check unconfigured unavailable states, then create/identify a new ordinary disabled branch Preview using configured variables and verify effective settings/duration. Malformed application/json bodies at 4,000,000/4,000,001 bytes must yield application 400/invalid_request and 413/request_too_large respectively, JSON/no-store and no provider calls; record gateway outcomes separately.
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
