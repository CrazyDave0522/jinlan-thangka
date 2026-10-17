# Demo Release Acceptance Matrix

## Evidence Rules

This is the approved A-stage acceptance plan, not executed results. The owner approved starting A on 2026-10-17; deployed funded scope and B inputs remain separate. Record results in [verification.md](verification.md), including revision, environment, date, evidence type and `passed`, `failed`, `not run` or `deferred` with a reason.

- Deterministic fixtures establish behavior, not actual model semantics, records or object permissions.
- Actual empty-archive checks establish sampled runtime behavior; distinguish empty retrieval from no retrieval and access failures.
- Deployed checks identify project/deployment and actual switches. Disabled previews cannot pass active generation.
- Hands-on checks identify browser/device and actual versus emulated hardware. Automation does not prove native keyboard/clipboard behavior.
- Real-data checks require reviewed records/sources, permitted assets and independent expected judgments. They stay deferred while unavailable.
- Bind results to commit, deployment ID, switches, archive inspection date/state and reference-manifest version. Before final completion, review changes to that candidate and rerun affected checks; retain unaffected evidence only with a recorded rationale. Preserve A's historical empty-archive outcome without clearing future curated data; isolated empty-archive regressions and the final live archive checks serve their respective environments.

Current inspection: tasks 3.1–3.4 now pass, including the ordinary configured-disabled Git Preview at 37af020, auxiliary no-service-credential Preview, actual 60-second chat function, request boundaries, hydrated desktop/mobile unavailable/reload checks and fresh matched archive/Data API inspection. Two branch-only false overrides preserve shared Production settings; test page/API URLs remain behind Vercel SSO. See [disabled Preview results](verification.md#disabled-preview-acceptance-results). The owner authorized automation and additional funding. P01–P04 passed; original P05–P06 remain not run because K7 was already observed. Independent R01–R03 now passes the genuine missing-detail/targeted-reread/newer-draft flow. Both batches rolled back and retired their enabled deployments: seven submissions/thirteen completions/42,322 tokens. The owner subsequently reported no issues after the desktop/mobile checklist, completing A at the owner-report level. Device/browser/URL and per-action metadata are unrecorded limits; B and whole-change completion remain open. See [owner acceptance](verification.md#owner-acceptance-and-milestone-a-closure).

## A. Empty-Archive Preview

| ID | Action/environment | Observable pass | Coverage and remaining work |
| --- | --- | --- | --- |
| A01 | Local lint, TypeScript, Vitest | Full `npm run check` passes independently of real services | Existing unit/component/route suites; baseline and post-implementation checks |
| A02 | Integrated isolated Chromium | Actual Next.js lifecycle and upstream isolation pass | Existing six browser suites; map gaps before adding tests |
| A03 | Ordinary build after fixtures | Production build passes with AI/vision/fixtures false, ordinary manifest | Separate from fixture build |
| A04 | Unconfigured page, then configured-disabled Preview | Chinese empty landing and defined unavailable outcomes without provider calls or invented answers; missing settings are not empty retrieval results | Check missing-settings behavior separately; repeat after initial scoped setup/new deployment. A04 alone proves neither archive access nor active generation |
| A05 | Inspect project/revision/settings/access | Correct repo/root/branch, Preview scopes, server-only key setting, fixtures off, effective duration and reviewed audience | Current-project and exact disabled-Preview identity/settings/duration/access evidence is in verification.md; funded audience/window remains in task 3.5; record no credentials |
| A06 | Same-project archive/access inspection | Preview configuration matches the probed Supabase project; scoped anon table/RPC reads agree with fresh read-only owner/admin counts for all eight tables and inspected grants/RLS/policies | `scripts/verify-archive.mjs` checks HTTP/columns only; anon empty results or a different local project cannot establish actual emptiness; unavailable count/permission inspection leaves A06 open |
| A07 | Active text/general and supplied-name lookup | Honest general content; completed empty lookup; no invented source/evidence | `grounded-answers.spec.ts`; deployed P01–P02 |
| A08 | Active four pictures, follow-up, missing detail, reread | Stable association, selected pixels only, qualified history, correct captured reread and preserved newer draft | `image-interpretation.spec.ts`; deployed P03–P06 |
| A09 | Synthetic rich source/copy; actual empty reply copy | Exact associations, complete export, manual fallback, no extra service calls; live emptiness has no fabricated sources | `answer-sources.spec.ts`; rich fixture review explicitly identified |
| A10 | Isolated failure/correction/retry | Timeouts, unavailable/busy/invalid/reference/gateway errors stay distinct; no partial success; snapshots/drafts preserved | Existing route/text/image/source cases; no paid fault injection |
| A11 | Image/count/bytes and deployed request boundary | Four-active/twenty-retained limits and atomic rejection; malformed ASCII JSON at 4,000,000 bytes returns 400/invalid_request, at 4,000,001 returns 413/request_too_large; both application outcomes are JSON/no-store without provider calls | Existing image/route cases plus actual non-paid probes using application/json; distinguish gateway responses |
| A12 | Reload and transient state | Messages/images/draft clear; no replay/persistent visitor data; route outcomes are no-store | Existing lifecycle coverage plus deployed reload spot check |
| A13 | Ordered integrated journey at every supported core viewport | Text → four pictures → summary → missing-detail clarification → reread beside newer draft → copy → reload preserves associations, requests, focus and draft until deliberate clear; no page overflow | Actual Next.js route with isolated upstreams at all eight core sizes plus affected resize states; reuse assertions but verify this ordered integration |
| A14 | Owner desktop/mobile hands-on | Selected text/image/copy/reload flows usable; keyboard, selection, orientation and reading position reviewed | Owner reported no issues on 2026-10-18 after the desktop/mobile checklist; accepted for A. Exact native hardware/browser/action provenance is unrecorded. Extra active rechecks still consume authorized allowance |
| A15 | Rollback/final capability state | Test deployments end with both model switches false by default; prior production mapping/settings preserved and enabled direct test URLs retired/controlled; any ongoing enabled scope is explicitly agreed | Actual deployment evidence; no data/policy reset or unbudgeted provider questions |

A requires applicable local/deployed passes, the bounded active-provider smoke and owner review. Missing deployment allowance, project access or manual results stay open. Failures may be exercised through deterministic upstreams rather than real provider fault injection. Explicitly review unavailable native coverage as a limitation, never infer it from emulation.

### Responsive Baseline

Core CSS viewports: 360×800, 390×844, 414×896, 1280×720, 1366×768, 1536×864, 1920×1080 and 2560×1440. Include continuous resizing, an intermediate/tablet width and ordinary landscape/reduced height for affected states. Reuse existing feature assertions. Inspect representative mobile/desktop images and failing layouts. See [testing guidance](../../../docs/testing.md#responsive-browser-acceptance).

Record real keyboard/selection results separately. No new 320-pixel/niche-device or analytics requirement; viewport passes do not prove percentage audience coverage.

### Proposed Deployed Active Smoke

Agree deployed audience/window/funded allowance before activation. Maximum six dispatched submissions/twelve provider calls across the whole batch, not per viewport; failed/timed-out/cancelled attempts and reread consume their slots. Clarification can use fewer calls. Respect existing local authorization within its original scope. Freeze exact questions, permitted synthetic visitor images, prepared copies and expected rubric. P01 and P02 start independent fresh conversations; P03–P06 share one page, with no selected historical pictures for P04–P05. No real-work identity expectation, reference download, automatic retry, hidden repair or replacement submission.

Allocate the live owner/device review before this batch, for example desktop P01–P02 and mobile P03–P06; all active manual questions still count. Perform repeatable control/source checks in isolated fixtures or a disabled Preview. A later hands-on checklist item does not authorize another six live attempts. If owner participation is missing, record that limitation/open item rather than silently issuing more questions.

| ID | Fixed intent | Required semantic and operational review |
| --- | --- | --- |
| P01 | General text question about appreciating Thangka | Relevant qualified explanation with no empty-archive facts/sources invented |
| P02 | Lookup of a complete synthetic artwork name | Correct literal lookup and completed-empty status; no invented work/artist/date/source; skipped retrieval is not no match |
| P03 | Four synthetic pictures with distinct known visible marks | Four associated bounded observations; tentative/unreadable detail stays qualified; no archive identity/reference read |
| P04 | Summary-only follow-up to P03 | No historical pixels retransmitted or fresh inspection claimed; uncertainty preserved |
| P05 | Ask a fixed detail from a specific unselected historical picture, after confirming the detail is absent from available observations/history | Correct picture-targeted clarification and explicit reread; no invented detail. If the fixed detail was already captured, this prerequisite is unmet: P05–P06 remain not run rather than forcing a clarification |
| P06 | Activate successful P05's reread beside a newer text/image draft | Counted new attempt uses captured question/pixels, excludes newer draft content, preserves that draft and atomically revises successful observations |

Fix expected categories, lookup/selection behavior and acceptable uncertainty before running. Review each case before dispatching the next. Stop at the first failed case, unmet prerequisite or reached cap; retain the failure and mark dependent cases not run. A new run needs reviewed inputs and available authorized scope; do not silently replace cases or repeat a request to obtain a pass. Review relevance, association and fabricated archive/source claims. False identity, unsupported certainty, invalid output and timeout fail their cases regardless of schema validity or other passes. Count any extra active-provider verification against the same limits. Record dispatches, observed stages/usage, unknown activity, latency, failures and available measured expenditure. Small smoke samples do not establish statistical reliability or domain accuracy.

Distinguish dispatched attempts, observed `ai_completion` stages and unknown provider activity. Existing completion logs omit some failed/aborted/invalid-output stages, so missing logs cannot establish zero calls/tokens/cost. Retain a conservative upper bound of two calls per dispatched attempt unless reliable provider evidence resolves the count; unknown activity never restores submission/call allowance. Record available numeric usage and provider-console expenditure separately from unknown/pending totals. Missing billing data is a disclosed measurement limitation, not fabricated zero expenditure; failed behavior remains failed even if billing is unavailable.

## B. Deferred Real-Data Acceptance

| ID | Required inputs/action | Pass criterion |
| --- | --- | --- |
| B01 | Actual artist/artwork lookup with reviewed fields/sources | Correct UUID/context; absent/conflicting facts remain distinguishable |
| B02 | Compare actual answer/source/export to supporting material | Every archive claim/identity feature is supported by its E key, field scope and locator; no invented bibliography |
| B03 | Numbered known-work positive | Correct actual UUID through sufficient source-supported collection/accession evidence |
| B04 | Ordinary unnumbered known-work positive, changed crop/view | Correct actual UUID through distinctive evidence, permitted comparison and covered plausible alternatives |
| B05 | Similar different-work negative; ambiguous/unmatched examples | No false definite identity; uncertainty reflects actual coverage |
| B06 | Actual reference row/content/permission and object access | Reviewed binding matches real bytes; scoped anon access works; metadata alone is insufficient |

Retain the [archived image protocol/rubric](../archive/2026-10-17-add-image-interpretation/acceptance.md). The owner supplies/approves records/material, rights, judgments and funded scope when data work resumes. No data preparation is required now; fixture positives cannot complete B.

## Completion

Record A separately, keeping this change open with B deferred. Whole completion requires both, final integrated owner acceptance and agreed verified Vercel deployment. Any later owner-requested implementation-stage archival or scope change must state the outstanding obligations explicitly.

The final candidate must identify changes since A/B and carry fresh affected local/deployed/data/permission evidence. Retaining A does not require emptying the archive after B's curated data arrives; test empty-archive regressions in isolation and the final live candidate against its then-current data. Record why any unchanged evidence is reused and identify additional authorized scope before paid reruns.
