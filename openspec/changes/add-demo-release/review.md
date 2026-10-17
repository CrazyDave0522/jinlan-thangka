# Proposal Readiness Review

## Status and Authorization

Prepared on 2026-10-17 on `feat/add-demo-release`, created from clean `main` at `c841ea4`. The owner confirmed the archive remains empty, requested continued work/new branch and confirmed an existing Vercel project. The owner subsequently supplied [https://jinlan-thangka.vercel.app/](https://jinlan-thangka.vercel.app/); public GET observations are recorded below. Dashboard project identity and settings remain uninspected.

This records proposal refinement and baseline verification. The later owner instruction to start A, implementation and fresh checks are recorded in [verification.md](verification.md); the earlier readiness observations below retain their historical scope. Neither proposal readiness nor A-stage implementation approval establishes deployment, provider activation, funded calls, data preparation or whole-release acceptance.

## Findings and Resolutions

| Finding | Resolution |
| --- | --- |
| Draft required real positives while data preparation was deferred | A permits empty-archive engineering/Preview acceptance; B retains real support/identity/access gates and whole completion stays open |
| Disabled deployment could be called a functional AI demo | Separate configuration-only outcomes; A still requires authorized actual deployed cases |
| Existing coverage is extensive | Map/reuse suites; add only demonstrated integration gaps |
| Empty archive cannot populate real source panels | Identified isolated source fixtures; live empty replies invent no sources; support quality remains B |
| Migration files are installed artifacts | No initialization/reapplication/seeding/visitor Storage setup; inspect drift before targeted correction |
| Local caps/declaration do not prove platform behavior | Inspect actual environment/duration and deployed transport; ordinary build follows fixtures |
| Local paid authorization could be mistaken for public funding | Preserve original scope; agree deployed audience/window/allowance before activation |
| Existing project state is partially observed | Public URL and homepage/route GETs are confirmed; inspect dashboard identity, revision and settings before preparing deployment |

## Baseline Verification

These application baselines were executed during initial proposal refinement against unchanged application revision `c841ea4`. The documentation review below does not rerun or relabel them as fresh deployed or implementation results.

| Check | Result |
| --- | --- |
| `npm run check` | Passed: lint, TypeScript and 34 Vitest files / 404 tests |
| Full isolated Chromium suite | Passed: 99/99 cases in 56.4 seconds with isolated synthetic upstreams |
| Separate ordinary production build | Passed after the fixture suite with generation/vision/fixtures false; final local build is ordinary output |
| Strict OpenSpec | Refined change passed; all eight active change/spec items passed |
| Local links and diff | File targets were checked during refinement; current file/fragment links, proposal structure and diff are rechecked in the documentation review rounds below |

Two initial browser startup attempts failed before cases ran because Turbopack's nested worker could not bind a local port. The successful run used explicit empty parent `NODE_OPTIONS` and permitted local-port execution (`env NODE_OPTIONS= npm run test:e2e`). Both the ordinary build before that run and the final ordinary build passed under the same permitted execution with AI/vision/fixtures explicitly false. No product or test code was changed to obtain these results, and the observed startup issue is not reported as a product assertion failure.

These are existing-capability baselines, not implementation of new release requirements. Deployed settings, actual Supabase/Storage, paid provider behavior, native-device acceptance and real-data/domain quality are not established by them.

## Public Deployment Observations

On 2026-10-17 the owner supplied `https://jinlan-thangka.vercel.app/`. Two unauthenticated GET requests were made to that exact origin. They submitted no chat question, visitor image or provider request and changed no deployment setting.

| Request | Observed result | Evidence boundary |
| --- | --- | --- |
| `GET /` | HTTP 200; HTML title is the configured Chinese Thangka conversation-demo title; visible welcome guidance includes text/image conversation and four-picture/5 MB input limits; `server: Vercel` | Public HTML reachability/content only; not hydrated UI, actual submission, owner review or exact deployed revision |
| `GET /api/chat` | HTTP 405 with empty body; `x-matched-path: /api/chat` | Route exists and rejects GET; does not verify POST contract, provider switches, POST no-store behavior, archive access or function duration |

The public address is not proof of dashboard project ID, branch-to-environment mapping, exact commit, Preview settings or API activation. Those remain pending account-side inspection. Public reachability alone does not pass A04–A08 or mark task 3.1 complete. No actual-provider or remote archive evaluation was run.

The web reader could not fetch this origin, no CUA browser was available, and the initial sandbox HTTP attempt failed DNS resolution. The observed responses above came from permitted direct Node GET requests. No browser layout/hydration pass is inferred from them.

## Documentation Review Round 1

Requested by the owner on 2026-10-17. Scope: proposal, design, acceptance, tasks and spec delta, cross-checked against accepted image-history behavior, actual request validation, browser test coverage and shared project/roadmap/AI setup context. No application, database or deployment setting is changed by this review.

| Finding | Correction |
| --- | --- |
| Exact-cap malformed requests lacked an explicit expected response, allowing a 413 to be misreported as a pass at the accepted byte cap | All release documents now specify application/json, exact UTF-8 bytes, 4,000,000 → 400/invalid_request and 4,000,001 → 413/request_too_large, with JSON/no-store and no provider calls; gateway outcomes stay separate |
| P05 assumed a fixed detail would be missing from a nondeterministic earlier observation | Run P05 only when its target detail is absent from actual available observations/history; otherwise stop with P05–P06 not run. Freeze separate P01/P02 conversations and the shared P03–P06 page |
| Six/twelve batch limits did not explicitly account for failures/cancellation, dependent cases or post-run verification | Count every dispatched attempt and reread, stop at failure/unmet prerequisite/cap, retain failures and prohibit replacement cases or unbudgeted active verification |
| Per-feature viewport passes could be mistaken for an ordered integrated release journey | Require the ordered real-route text/image/summary/clarification/reread/draft/copy/reload journey at each core viewport, reusing helpers; paid smoke remains one batch rather than one batch per viewport |
| Supplied current URL, new Preview scope and end-of-test state were not concrete enough | Treat current public URL as a reference; inspect branch/shared setting scope before changes. Default test deployments to both model switches false, preserve existing production state and require explicit scope for ongoing enabled use |
| Shared context still described feature branches, earlier counts, future image/source work and blanket paid reapproval | Synchronize current main/feature status and 404/99 baseline references; preserve archive history and existing local stabilization authorization while keeping new deployed funding separate |

Validation passed: the refined change and all eight active change/spec items pass strict OpenSpec validation. Across twelve related Markdown files, all 95 local file links, seven Markdown heading fragments and whitespace checks pass, as does `git diff --check`. Bounded evaluation and recoverable deployment are separate requirements, keeping each normative statement focused and within strict validation limits. Application tests/build are not repeated for these documentation-only corrections; the original application baseline above remains unchanged. Detailed implementation approval, account-side deployment inspection and the future deployed access/allowance are still open inputs, not unresolved document defects.

## Documentation Review Round 2

Requested by the owner on 2026-10-17. This pass follows the actual execution order, archive reader/inspection boundaries, provider logging behavior and future milestone handoff. All corrections remain documentation-only; they do not execute database reads, paid calls or deployment changes.

| Finding | Correction |
| --- | --- |
| Owner active review appeared after a six-submission smoke that could already exhaust the entire allowance | Schedule owner/device actions inside P01–P06 before activation; use fixtures/disabled Preview for repeated controls and keep missing participation open. Extra active questions require available agreed scope |
| The adapter logs `ai_completion` only after successful provider envelope/content parsing, so failed paid activity may have no event | Separate dispatch ledger, observed completions and unknown usage/billing; missing events do not mean zero cost or restore allowance. Reserve up to two calls per dispatched attempt until reliable evidence resolves counts |
| An anon empty result can reflect RLS, and a local smoke may target a different project from Preview | Match actual Preview configuration to the probed project; pair anon reads with fresh read-only owner/admin counts for eight tables and grants/RLS inspection. Privileged inspection stays outside app credentials; missing evidence leaves A06 open |
| A and future B can concern different code/configuration/archive/grant states, with no explicit final evidence freshness rule | Bind results to their artifacts/states, review final changes and rerun affected checks; justify unchanged evidence reuse. Retain historical A without clearing future curated data and use isolated empty-state regressions plus final live-data checks |

Validation passed: the refined change and all eight active change/spec items pass strict OpenSpec validation; twelve related Markdown files have 96 valid local file links and eight valid heading fragments, with whitespace and `git diff --check` passing. Eight requirements/twenty-one scenarios cover the refined proposal. The 404/99 application baseline remains historical and is not rerun for documentation changes.

## Owner Configuration Clarification

On 2026-10-17, after the two documentation review rounds, the owner clarified that no environment variables have been configured in Vercel. Record this as owner-reported current state, not an independently inspected dashboard/effective-environment result. Public GET reachability and the earlier application baseline remain unchanged evidence.

The accepted local source deliberately leaves the page accessible without Supabase settings (`src/proxy.ts`). Missing generation configuration yields 503/generation_unavailable for a valid text request; valid selected images with vision unset yield 422/image_understanding_unavailable before provider access. These are expected candidate behaviors, not newly executed remote POST checks. Neither missing configuration nor those outcomes prove a successful empty archive query.

The documents now distinguish initial unconfigured checks, scoped Supabase setup with both provider switches false and a new deployment, and the later agreed active empty-archive batch. The existing Supabase schema/search/read setup remains in place; no data import, schema reinitialization or curated bucket is required to connect Vercel. Runtime settings have not been changed. See the [staged setting table](../../../docs/ai-setup.md#vercel-configuration-starting-point).

Validation passed: strict validation of the change and all eight active change/spec items, 99 local file links and ten heading fragments across twelve Markdown files, whitespace and `git diff --check`. The missing-configuration scenario brings the proposal to eight requirements/twenty-two scenarios; application tests/build are not rerun for this documentation clarification.

## Owner-Reported Production Variable Names

On 2026-10-17 the owner subsequently supplied five names marked Production: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL` and `DEEPSEEK_ENABLED`. This supersedes the earlier report that no variables had been added. Values and a new deployment were not provided or independently verified.

The accepted application reads only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `src/lib/supabase/config.ts` and `src/proxy.ts`; the two unprefixed Supabase names therefore require correction with the same intended values. No application alias or credential change is introduced. The three DeepSeek names match; the model value must remain `deepseek-flash`. `DEEPSEEK_VISION_ENABLED` was not shown. During initial non-paid configuration checks, both generation/vision switches should be explicit false. A local IDE selection does not establish a Vercel value.

The supplied scope is Production, which is distinct from the planned branch Preview. Inspect/configure the intended Preview scope separately and create the corresponding new deployment after correction. Existing Production settings are owner changes, not changes performed or approved by the assistant. No provider call, dashboard mutation or secret inspection was performed for this comparison.

Validation passed: the change and all eight active change/spec items pass strict OpenSpec validation, and `git diff --check` passes. This is a factual documentation update; no application behavior or test baseline changed.

## Public Prefix Entry Report

The owner reports that Vercel rejects entry of the public prefix. The exact error and selected Type have been requested as text without variable values; neither the actual cause nor the account/UI state is independently confirmed. The earlier instructions omitted the Vercel type distinction.

The setup guide now specifies Config for the canonical public Supabase names and Secret for `DEEPSEEK_API_KEY`, exact underscore spelling, and creation of new Config entries rather than renaming/converting a saved Secret. This follows the current official Vercel Config/Secret documentation. The Supabase field remains limited to the existing publishable/anon reader, with no elevated key or application alias introduced. No remote variable type, value or access setting was changed by the assistant.

Validation passed: strict validation of the change and all eight active change/spec items, plus `git diff --check`. This correction changes setup documentation only.

## Owner Reconfiguration and Redeployment Recheck

On 2026-10-17 the owner reported correcting the variables and completing a redeployment. The later supplied list explicitly shows `NEXT_PUBLIC_SUPABASE_URL`, `DEEPSEEK_API_KEY` and `DEEPSEEK_MODEL` in Production and Preview. A masked entry omits its name, and the `DEEPSEEK_ENABLED` entry is truncated; no effective values or vision setting are independently confirmed. These owner reports supersede the earlier uncorrected-name snapshot, without establishing the exact commit, deployment ID or branch Preview. No secret value was read, copied or included in this record.

At 22:07 Australia/Perth (14:07 UTC), six bounded requests were sent to `https://jinlan-thangka.vercel.app/` after the redeployment report. No valid chat question or image was submitted, no provider API was directly called, and no setting/data/deployment was changed by the assistant. All POST bodies were invalid before provider configuration/access in the accepted source.

| Request | Observed result |
| --- | --- |
| `GET /` | 200, HTML, configured Chinese conversation-demo title, Vercel prerender cache |
| `GET /api/chat` | 405, empty body, route matched, Vercel cache MISS |
| `POST /api/chat`, `text/plain`, `{}` | 415/unsupported_media_type |
| `POST /api/chat`, `application/json`, `{}` | 400/invalid_request |
| `POST /api/chat`, `application/json`, ASCII `{` plus spaces, exactly 4,000,000 UTF-8 bytes | 400/invalid_request |
| Same malformed body, exactly 4,000,001 bytes | 413/request_too_large |

All four POST responses were application JSON with `Cache-Control: no-store`, route matching and Vercel cache MISS; none was a gateway error. Request/response times ranged from 1.26 to 6.08 seconds, including transfer and possible cold starts; these are not model-latency measurements. The first sandbox attempt failed DNS resolution for all six requests; the permitted network rerun produced the observations above.

This establishes current alias reachability and the sampled request-rejection/size behavior. It does not inspect billing/provider logs, prove actual database access/emptiness, identify the deployed revision/settings, or validate hydrated UI, real AI, source support, native devices or the proposed branch Preview. It supplies partial diagnostic evidence for A11 without closing that row or any deployment task. Earlier application baselines remain historical; no application code or tests changed.

Validation passed: all eight active change/spec items pass strict OpenSpec; 102 local links and thirteen heading fragments across twelve Markdown files pass, as do whitespace checks and `git diff --check`. Application tests/build are not rerun for this factual documentation-only update.

## Remaining Owner Inputs

1. Dashboard inspection access for the supplied URL to verify the reported corrected configuration/redeployment and prepare the intended scoped Preview after concrete-action approval; no project URL needs to be supplied again and no key values are requested in chat.
2. Detailed A-stage implementation approval has since been received; implementation/local evidence is in [verification.md](verification.md). No repeated proposal approval is needed within that scope.
3. Deployed enabled-preview audience/window/funded allowance when concrete; proposed maximum six submissions/twelve provider calls.
4. Owner/device participation scheduled inside the active batch, with remaining controls/source review on fixtures or disabled Preview. Extra active questions need available agreed scope. Real records/assets/domain review stay deferred B inputs.

## Conclusion

Documentation review round 2 is complete: four execution/evidence gaps were corrected, and no further blocking documentation issue was found in that pass. Later owner reports include corrected configuration/redeployment and explicit approval to start A. The six-request public non-provider HTTP recheck passed; subsequent local implementation, 406/107 checks and actual read-only archive inspection are recorded in [verification.md](verification.md). Exact Vercel Preview/configuration inspection, deployed funded scope, hands-on and rollback results remain open. These outcomes do not close milestone A, deferred B or whole-release acceptance.
