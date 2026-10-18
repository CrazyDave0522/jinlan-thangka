# Demo Release Verification

## Status and Authorization

On 2026-10-17, immediately after being asked to approve the existing detailed proposal and start A, the owner instructed continuation. This approves milestone A implementation on `feat/add-demo-release`; the proposal approval task is complete. It does not authorize new deployed provider charges, wider public funded access, a Production change or real-data preparation. No new product behavior was introduced.

Milestone A is accepted and tasks 1–3 are complete (17/22 overall). On 2026-10-18, authenticated inspection, disabled Preview/browser/transport checks, matched read-only archive inspection, authorized P01–P04 and independent supplemental R01–R03 all passed, including actual rollback/retirement after each batch. Original P05–P06 remain not run because K7 was already observed; the separate R batch supplies A08's missing-detail/targeted-reread/newer-draft evidence without relabeling them. Total paid execution: seven submissions/thirteen observed completions/42,322 tokens. The owner authorized assistant automation/additional funding, then reported on 2026-10-18 that their actual acceptance review found no issues in response to the desktop/mobile checklist. This closes task 3.6/A14 as owner-reported acceptance; device/browser/URL and per-action details were not supplied and are not invented. B and whole-change completion remain deferred/open. Production/shared settings, remote data and Storage were unchanged.

## Tested Artifact

Original local checks: 2026-10-17, Australia/Perth. Node v24.22.0; installed Next.js 16.4.1. Base: `c841ea4c52ccd66bda906615dd35d8762195f942`, plus the then-uncommitted release engineering files below, now committed through `37af0200b4670e486b9cfcda9ae48c1d6a99186c`. Application source is unchanged from that base. The deployed candidate identities and fresh checks are recorded separately below.

The SHA-256 fingerprint of these sorted paths plus a NUL separator and each file's bytes is `e8fb73964fb1f46e185ac9040095176518fbce240d33e872536985a4bbedcf9b`:

- `eslint.config.mjs`
- `scripts/inspect-archive-release.sql`
- `scripts/prepare-demo-smoke.mjs`
- `src/lib/retrieval/release-inspection.test.ts`
- `tests/browser/demo-release.spec.ts`
- `tests/browser/helpers/conversation.ts`
- `tests/browser/image-interpretation.spec.ts`

The ordinary empty production reference manifest's SHA-256 is `fba23674ce4c0aec0bfc32aa68b60d54ab754a6416e35f6b4637a0f16cd37511`. Record a final commit before deployment and refresh evidence affected by subsequent changes. Documentation changes alone do not relabel the tested application or trigger extra provider calls.

## Coverage Mapping and Current Outcomes

| Acceptance | Existing/new evidence | Outcome and remaining work |
| --- | --- | --- |
| A01 | `npm run check`; route/vision/retrieval/component suites, new release SQL tests | Passed: 35 files / 406 tests, lint and TypeScript |
| A02 | Existing six browser suites plus `demo-release.spec.ts`, actual isolated Next.js route | Passed: 107/107 Chromium tests |
| A03 | Separate ordinary production build after fixture suite | Passed; AI/vision/fixtures explicitly false, ordinary manifest |
| A04 | Existing tests plus configured Git and no-service-credential CLI Preview browser/HTTP checks | Passed: Chinese page, defined text/image unavailable outcomes, editable draft and reload without replay; no active generation acceptance inferred |
| A05 | Connected/CLI identity/configuration/build/function inspection and exact deployed/browser/access evidence | Passed: exact disabled and active Git Previews at 37af020, correct scope, fixtures absent, Node 24/60-second chat, protected reviewer audience/window and final retired/disabled state |
| A06 | Private inherited-Config match, fresh anon eight-table/RPC reads, separate privileged counts/grants/RLS/function inspection and remote config pull | Passed for the configured Git Preview's matched archive: all eight counts zero; expected read access; Data API exposes thangka with max_rows=1000 |
| A07 | `grounded-answers.spec.ts`, empty-name regressions, new composed empty lookup and exact deployed request/server-status/source proof | Passed: actual P01 qualified general answer and P02 required full-name completed-empty lookup; no invented records/sources |
| A08 | `image-interpretation.spec.ts`, continuity tests, ordered isolated journey, actual P03–P04 and independent R01–R03 | Passed for synthetic deployed samples: four associated observations, pixel-free summary, genuinely missing detail, targeted reread of image 1 with captured question, preserved newer draft and successful observation supersession. Original P05–P06 remain not run; R cases are separately identified |
| A09 | `answer-sources.spec.ts`, presentation/answer-action tests; isolated copy and actual hosted Chromium clipboard | Automated rich-fixture source/export and actual empty P02/P04 reply copy passed; broad owner usability acceptance is recorded under A14, without claiming per-source or native-browser measurements |
| A10 | Existing route/runtime/vision/text/image/source failures and browser correction/retry cases | Deterministic failure coverage passed; no paid fault injection needed |
| A11 | Existing image/count/byte suites plus exact configured-Preview malformed HTTP probes | Passed: 4,000,000 bytes gives application 400/invalid_request, one over gives 413/request_too_large; JSON/no-store, no gateway substitution. Maximum-size successful generation is not established |
| A12 | Isolated lifecycle coverage, disabled targets and actual P02/P04/R03 copy/reload | Passed: completed replies copy; newer image/text draft survives actual reread and non-submitting actions, reload clears page-local state. Browser/platform POSTs stay four in P batch and three in R batch |
| A13 | New ordered actual-route journey at all eight core viewports plus existing long-source/error/layout suites | Passed, with mobile/desktop screenshots inspected and intermediate/landscape/short-height checks |
| A14 | Automated focus/clipboard/touch checks and deployed Chromium desktop/mobile emulation | Accepted on owner report on 2026-10-18 after the desktop/mobile checklist: no issues reported. Exact device/browser/URL and individual action results are unrecorded; automated traces remain separately identified |
| A15 | Both batches' Config readback, exact alias restoration, deployment removal and metadata/access inspection | Passed: both branch switches false, pre-batch disabled alias restored, both enabled test deployments removed with direct page/API 404, Production/shared settings unchanged |
| B01–B06 | Retained real-data/source/identity/reference requirements | Deferred: no actual records/assets/domain judgments; synthetic cases do not pass B |

## Executed Local Checks

| Check | Result |
| --- | --- |
| Final `npm run check` | Passed without lint warnings: 35 files / 406 tests; 7.05-second Vitest run |
| Full isolated Chromium | Passed: 107/107 in 1.1 minutes; no real provider, Supabase or Storage |
| Ordinary production build | Passed after the fixture suite, with both model switches and browser fixtures false; final `.next` is ordinary output |
| Generated-output lint exclusions | Confirmed `test-results/`, `playwright-report/` and `evaluation-results/` ignored; release spec and product route still linted |
| Offline smoke inputs | Generated five 800×600 PNG drawings plus original hashes/bytes under ignored `evaluation-results/demo-release-inputs/`; first drawing/code inspected |
| Strict OpenSpec and documentation | Passed: all eight change/spec items; 124 local links and fifteen heading fragments across fourteen Markdown files; whitespace and `git diff --check` |

The new ordered test shares preparation/submission/layout helpers with image interpretation. Each viewport checks completed empty lookup, four associated observations, pixel-free summary, targeted clarification, counted reread of only image 1 beside an independent prepared draft, observation supersession, native Chromium clipboard, unchanged service counters during copy/reload, and page-local reset without replay. The isolated ledger is five application requests/nine synthetic model calls/no Storage reads per journey, with an archive lookup. These are synthetic runtime counts, not real-provider billing.

Core sizes: 360×800, 390×844, 414×896, 1280×720, 1366×768, 1536×864, 1920×1080 and 2560×1440. Populated reread/new-draft states also resize through 768×720, 844×390 and 360×640. Inspected `test-results/release-journey-390.png` and `test-results/release-journey-1366.png`: readable answer tail/draft, proportional preview, reachable send/copy and separated footer; no overlap or page overflow. These retained local artifacts are ignored by Git. Native mobile keyboards, memory, selection/screen-reader behavior and audience percentages are not established.

The first full browser run passed the existing 99 cases and failed all eight new cases because the test expected `[图片1]` where the accepted plain-text export uses `[图片 1]`. Only the test assertion was corrected; the subsequent full run passed all 107. An intermediate lint run encountered generated JavaScript inside active Playwright trace artifacts (92 warnings, no errors). Added explicit generated-directory ignores and verified application/test files remain linted; final check is clean. The earlier unused helper import warning was also removed. No product defect or product code change was required.

## Actual Supabase Read-Only Inspection

The local public configuration points to a hosted Supabase project with a publishable application key. Its normalized origin SHA-256 is `7ba7959ffd4bbb42f2a384b708a01ec79cb66e1dcdf15d6cee4554fa1db3dd6d`; no URL/key value is copied here. The smoke and administrative CLI target were derived independently from that same process-scoped public origin. Matching the real Preview's origin/category remains open; do not describe this as a Preview database test.

Executed `node --env-file=.env.local scripts/verify-archive.mjs`: all eight projected table reads and `search_archive_candidates` returned HTTP 200. The script loads settings privately and prints no credentials/records. These `limit=0` reads alone do not count rows or establish RLS completeness.

Executed [inspect-archive-release.sql](../../../scripts/inspect-archive-release.sql) separately through existing Supabase CLI authentication using `db query --linked --project-ref <derived-reference> --file ... --output json`. The inspection role was `postgres`, non-superuser with `BYPASSRLS`; no administrative credential entered application runtime. Results:

| Table | Privileged row count | RLS / forced | Effective anon access |
| --- | --- | --- | --- |
| artists | 0 | true / false | SELECT only |
| artworks | 0 | true / false | SELECT only |
| images | 0 | true / false | SELECT only |
| sources | 0 | true / false | SELECT only |
| artwork_artists | 0 | true / false | SELECT only |
| artist_sources | 0 | true / false | SELECT only |
| artwork_sources | 0 | true / false | SELECT only |
| image_sources | 0 | true / false | SELECT only |

All eight tables are owned by `postgres`; anon has schema USAGE, table SELECT and no effective INSERT/UPDATE/DELETE/TRUNCATE. Exactly eight `archive_retrieval_select` policies apply SELECT to anon with `USING (true)`, no write check. The single inspected search function has arguments `p_entity text, p_filters jsonb, p_limit integer`, result `TABLE(id uuid, rank integer, matches jsonb)`, stable volatility, security invoker, empty search path, anon EXECUTE and no PUBLIC EXECUTE.

Initial CLI help inside the sandbox could not write its telemetry cache; permitted CLI execution worked. The first query omitted `--linked` and failed without usable metadata; the corrected explicitly linked invocation returned the inspection above. These invocation problems are resolved, not evidence of a schema or application failure. The CLI performed only SELECT inspection; no schema migration/reset, row/policy/grant/object mutation or provider call occurred. At that inspection the optional integrations had been discovered but were not connected; the later Vercel connection report/retry is recorded below. Supabase inspection succeeded through the existing CLI, so a new Supabase connection is not required for that completed step.

The two new disposable-PGlite tests execute the actual inspection SQL and verify empty counts/grants/function metadata, then a populated table hidden by RLS from anon while privileged inspection still sees its row. They are independent of these live results. Actual complete deployed column/type/constraint drift comparison and dashboard exposure/row-limit inspection are not newly established by the release query; earlier accepted schema/type evidence retains its original date and scope.

## Deployment and Active Smoke

Prior safe public-alias checks are recorded in [review.md](review.md#owner-reconfiguration-and-redeployment-recheck): homepage 200, route GET 405, invalid type 415, invalid contract 400, malformed JSON at 4,000,000 bytes 400 and at 4,000,001 bytes 413; POST errors are JSON/no-store. These observations do not identify the owner-reported new deployment's revision/settings or the planned branch Preview. No fresh provider-bearing cloud question was submitted during implementation.

The [runbook](../../../docs/demo-release.md) contains the six fixed Chinese questions/actions, five synthetic inputs, session boundaries, P05 missing-detail eligibility, dispatch/usage accounting and final-state/rollback procedure. Original image bytes/hashes are generated; browser-prepared copies, exact Preview, reviewer audience/window, owner participation and funded allowance must be frozen before activation/dispatch. These are pending prerequisites, not failed model cases.

The initially proposed active scope was subsequently explicitly authorized and executed as recorded in [the active results](#active-results-and-usage). Four submissions/eight observed completions consumed that first batch; P05–P06 were not run. The independent R01–R03 supplement later adds three submissions/five observed completions and closes the missing-detail/reread coverage, as recorded below. Earlier disabled requests remain separate and terminate before provider access. Billing currency is unavailable; numeric usage is recorded without inferring zero expenditure.

## Remaining Work

1. Milestone A and tasks 1–3 are accepted/complete (17/22 overall). Keep the configured disabled 37af020 immutable Git Preview as the tested baseline; the branch alias is restored to the pre-batch docs-only 299acb3 Preview with identical application source. Generic latest may select another deployment. No further account login/configuration screenshot is needed.
2. A08's missing-detail/reread/newer-draft flow now passes in the separately frozen R01–R03 batch. P05–P06 remain historically not run. No further automated provider question is needed for this gap.
3. The owner's subsequent no-issues acceptance closes task 3.6/A14 at the owner-report level. No repeated hands-on session is required to reconfirm that signoff. Device/browser/URL/action metadata remain unrecorded evidence limits; any later requested paid recheck still needs a concrete target/window/input allocation within the existing authorization. Preview defaults remain false.
4. B remains deferred without actual records/assets/domain judgments; whole-change completion remains open after A acceptance. Retain historical empty-archive evidence without clearing future data. Documentation updates do not publish a deployment or merge/archive the change.

## Earlier Vercel Connection Retry

This subsection records the previous conversation's tool-loading limitation. It is superseded by the successful connected inspection below.

After the owner reported connecting Vercel on 2026-10-17, plugin discovery confirms it installed, enabled and user-enabled. Its runtime application is recognized and has the user's default low-risk action permission setting. The plugin's deployment, environment and CLI skills are available. This establishes installation/permission metadata, not a successful authenticated project API read.

The current conversation's callable-tool inventory still contains no Vercel account/project/deployment tools, so there is no authenticated MCP inspection result to report. A fallback temporary `npx vercel@latest whoami --format json --non-interactive` returned `loggedIn: false`; local CLI authentication is separate from the owner's plugin authorization. No login flow was started, no token was extracted and no project was linked or deployed. Do not ask the owner to reinstall the already enabled plugin or treat the CLI result as a failed plugin login.

Resume in a new conversation/session so the installed connection's tools can load, then continue task 3.1 from this record on the existing branch. Recheck available tools/authenticated project reads there before making any further connection request. The earlier local checks remain valid for their recorded artifact; no application/test/build rerun is needed for this connection-state note.

## Connected Vercel Inspection

Resumed on 2026-10-17, Australia/Perth, at the owner's request, on the unchanged dirty `feat/add-demo-release` worktree at `c841ea4c52ccd66bda906615dd35d8762195f942`. Authenticated Vercel MCP reads are now callable. This is a read-only inspection, not deployment or paid-smoke authorization. The local engineering artifact remains the one identified above.

### Project and Deployment Identity

| Field | Observed evidence |
| --- | --- |
| Existing project | `jinlan-thangka`, `prj_FnmBJHdIVIUQSobZy5EAYNV3lAkF` |
| Account | `team_p6vs7dieKCGN1MX85ZjTHP3h`; dashboard scope `crazydave0522s-projects`, Hobby |
| Framework / project Node setting | `nextjs` / `24.x` |
| Current public alias | [jinlan-thangka.vercel.app](https://jinlan-thangka.vercel.app/), resolved by the alias API to the deployment below |
| Deployment | `dpl_8JNNKR9vqpvs7X44Vy2PsRtLMSv8`; `READY`, `production`, source `redeploy`, type `LAMBDAS`, region `iad1` |
| Immutable URL | [jinlan-thangka-6uoh4od3z-crazydave0522s-projects.vercel.app](https://jinlan-thangka-6uoh4od3z-crazydave0522s-projects.vercel.app/) |
| Git metadata | `CrazyDave0522/jinlan-thangka`, `main`, `c841ea4c52ccd66bda906615dd35d8762195f942`, `Refine assistant greetings and copy feedback` |
| Deployment timing | Created 22:03:39.945; ready 22:04:43.358 on 2026-10-17, Australia/Perth; build interval about 62 seconds |
| Previous same-revision deployment | `dpl_8e44nzQ7a2fkD4ZvJD3VygYpZouQ`, `READY`, `production`; retained as an observed prior target, not an exercised rollback |
| Release-branch deployment | Explicit `feat/add-demo-release` deployment query returned zero results |

The deployment list and existing authenticated browser Deployments page independently show the current redeploy and the preceding Git deployments. The repository/branch above are deployment metadata; the successful project-detail response does not expose the configured Git link, root directory, production-branch rule or build/install/output overrides. Do not infer these settings from a successful build or assume this Production deployment is the proposed release Preview. The current uncommitted release-engineering additions are absent from its Git revision.

### Saved Environment Configuration

The complete returned project-variable list has five entries, `hiddenProductionEnvCount=0`. All five are shared between Preview and Production, with no `gitBranch` field or custom-environment IDs. A separate release-branch override query returned no entries; the custom-environment query returned none. These observations identify saved project settings, not a captured build/runtime environment for an immutable deployment.

| Name | API type / visibility | Saved scope / inspected status |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `encrypted` / `config` | Preview + Production; privately compared, same normalized origin as the inspected local archive |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `encrypted` / `config` | Preview + Production; publishable category, privately matched exactly to the local application key |
| `DEEPSEEK_API_KEY` | `sensitive` / Secret | Preview + Production; metadata presence only; not decrypted or provider-validated |
| `DEEPSEEK_MODEL` | `encrypted` / `config` | Preview + Production; inspected value `deepseek-flash` |
| `DEEPSEEK_ENABLED` | `encrypted` / `config` | Preview + Production; inspected value `true` |
| `DEEPSEEK_VISION_ENABLED` | No project entry | Missing, including release-branch overrides |
| `JINLAN_BROWSER_FIXTURES` | No project entry | Missing, including release-branch overrides |

Only the four Config entries were read individually for value checks. No provider secret was requested, no environment file was pulled or overwritten, and no key/URL value is included in this report. The saved origin's normalized SHA-256 is `7ba7959ffd4bbb42f2a384b708a01ec79cb66e1dcdf15d6cee4554fa1db3dd6d`, matching the earlier independent inspection. The public application key also matches exactly and is publishable, not an elevated key. This closes the saved-configuration comparison, not actual new-Preview access or current Data API exposure/row-limit inspection.

All five saved entries were created at 21:51:10.504; the provider-key metadata was last edited at 21:53:09.160, before the 22:03 redeploy. The successful deployment response omits its environment snapshot, so edit timing alone does not certify effective deployed switches. Source behavior treats absent vision as disabled and absent fixtures as ordinary mode; those are source-based expectations, not fresh successful runtime submissions. No valid text/image request was submitted: text is enabled in shared saved settings and the key is present. A branch push could inherit that enabled configuration. Do not change the shared entries to prepare a disabled test; use explicit overrides limited to the release branch and verify the resulting new deployment.

### Anonymous Access Inspection

Project metadata reports SSO protection enabled with `deploymentType=all_except_custom_domains`, password protection disabled and trusted-IP protection disabled. Six anonymous GET requests, with redirects unfollowed and no cookies/bypass token, produced:

| Target | `GET /` | `GET /api/chat` |
| --- | --- | --- |
| Current public alias `jinlan-thangka.vercel.app` | 200, HTML | 405 |
| Current immutable host `jinlan-thangka-6uoh4od3z-crazydave0522s-projects.vercel.app` | 302 to `vercel.com/sso-api` | Same 302 |
| Sample prior Preview `jinlan-thangka-r08mewenm-crazydave0522s-projects.vercel.app`, `dpl_9oyLAtFviDgNZu5iKRteipPnrRVN` | 302 to `vercel.com/sso-api` | Same 302 |

The four protection redirects have `Cache-Control: no-store, max-age=0`; the public GET responses have `public, max-age=0, must-revalidate`. The public API GET's cache header does not establish the POST contract. No chat POST, provider question, image, protection bypass or new share link was used. These are sampled URL/access observations, not proof that every historical deployment is controlled, successful reviewer sign-in or completion of A15. The first sandbox GET attempt failed DNS; the permitted network rerun produced the actual HTTP results above.

### Access Limits and Outcome

Explicit `teamId` calls for project detail, deployments and environment metadata returned 403 for `crazydave0522s-projects`. Reissuing reads using the connection's default scope and the same unique project ID succeeded; returned account/project IDs were checked against the intended target. The default team-list and Git-context calls returned empty team arrays, which do not negate the successful project reads. Do not report that Vercel is disconnected or request reinstalling it.

Build-event access still returned 403. The Git-backed deployment's file-tree endpoint returned 404/File tree not found. The offline `npx` fallback had no registry-cache entry; invoking the already cached Vercel CLI 64.5.0 for the exact project/team instead found no credentials and its automatic login attempt ended with `fetch failed`. No authentication was completed, token retrieved, local project linked or remote state changed. The existing Chrome Deployments page was readable through native accessibility; after navigating its existing project tab to Settings, the page body remained unavailable to accessibility and screenshots were blank. No setting was edited. These paths did not establish root/build settings, an immutable environment snapshot or effective function duration.

Task 3.1/A05 therefore remain partially inspected, not passed. The source declaration `maxDuration=60` is known; the installed Next.js duration guide confirms that platforms can use build metadata, and does not verify this deployment's applied limit. Tasks 3.2–3.4 still need the concrete commit, branch-only disabled settings and an identified ordinary Preview, with missing-setting/configured-disabled/transport checks on that target. Saved Supabase configuration now matches the inspected archive, but task 3.3/A06 remains open pending that target and current Data API settings. Active ledger remains P01–P06 not run, zero dispatched chat attempts in this resumed session. No paid usage or expenditure is inferred from these metadata/GET reads. Owner/device review, final disabled state and actual rollback/retirement remain open; B is deferred.

Validation for this documentation-only inspection update: strict OpenSpec passes all eight items; 68 local links and seventeen heading fragments across seven updated documents pass, as does `git diff --check`. Recomputed engineering fingerprint exactly matches `e8fb73964fb1f46e185ac9040095176518fbce240d33e872536985a4bbedcf9b`. Application/tests/build were unchanged and their recorded checks were reused; no new requirement was implemented and no application suite/build was rerun.

## Authenticated CLI Follow-up

On 2026-10-18, Australia/Perth, the owner completed the requested Vercel CLI login and instructed continuation. CLI 64.5.0 now successfully reads the exact existing project and deployment with explicit `team_p6vs7dieKCGN1MX85ZjTHP3h` scope. This resolves the CLI credential blocker; the previous connector/build-log 403 observations remain historical and do not describe CLI access after login. No credentials were extracted or copied.

| Inspection | Fresh observed result |
| --- | --- |
| Project identity | Same `prj_FnmBJHdIVIUQSobZy5EAYNV3lAkF`, `jinlan-thangka`, owner scope `crazydave0522s-projects` |
| Root | `rootDirectory=null`; deployment builder entrypoint `.` |
| Framework / Node | `nextjs` / `24.x`, including the captured deployment's project settings |
| Commands / output | `buildCommand`, `installCommand`, `devCommand`, `outputDirectory` are null: no project override; the deployment snapshot agrees |
| Linked Git | GitHub `CrazyDave0522/jinlan-thangka`, repository ID `1420203868`, Production branch `main`, no deploy hooks |
| Automatic Git deployment | `gitProviderOptions.createDeployments=enabled`; assume branch publication triggers Preview creation |
| Release branch before publication | `git ls-remote --heads origin feat/add-demo-release` returned no branch |
| Existing Production | Still `dpl_8JNNKR9vqpvs7X44Vy2PsRtLMSv8`, `main@c841ea4`; captured Git source agrees |
| Actual chat function | Build output path `api/chat` (and its same-function `.rsc` entry), runtime `nodejs24.x`, `timeout=60`, memory 2048 MB, region `iad1`; distinct from ordinary page functions' 300-second timeout |
| Build log | Git clone `main@c841ea4`, dependency installation, Next.js 16.4.1, `npm run build`, successful compile/static generation and `/vercel/output` completion |
| Captured environment names | Both deployment `env` and `build.env` include the five saved service-variable names; neither includes vision nor browser fixtures. The API returns names, not their historical values |

The fresh project environment metadata has the same five IDs/scopes/types/edit timestamps as the prior inspected Config values. No branch override has appeared. The public Supabase variables remain Config, provider key Secret and model/generation Config; no privileged application credential is introduced. Values and provider billing were not re-read or tested. Current saved values and captured environment names are distinguished; new disabled-Preview responses must verify that candidate's effective capability state.

Task 3.1's inspection is complete without a production change or provider request. It does not pass an absent release Preview or active generation. The next reviewed action is the existing project's ordinary Preview of `feat/add-demo-release`, using only two new Config overrides for that branch/Preview: `DEEPSEEK_ENABLED=false` and `DEEPSEEK_VISION_ENABLED=false`. Shared Preview/Production entries and Production aliases remain at their inspected state, inherited Supabase/model configuration is retained, fixtures stay absent and existing Vercel SSO protection is retained. The candidate includes the previously tested release engineering and this evidence; record its exact commit before publication.

Fresh `npm run check` passes lint, TypeScript and all 35 files / 406 tests (6.35-second Vitest run). The seven-path engineering fingerprint is unchanged at `e8fb73964fb1f46e185ac9040095176518fbce240d33e872536985a4bbedcf9b`; existing 107-case isolated Chromium and ordinary-build evidence are reused because no application/test/build source changed. Only `.env.example` is tracked; `.env.local` and evaluation inputs remain ignored. No extra live model evaluation was performed.

## Initial Preview Publication

The prepared local acceptance commit is `b281223c714c5d7d4127c58f36b2306e6a36736d`. An attempt to create the two false Preview overrides before publication returned HTTP 400: branch `feat/add-demo-release` was not found in the connected Git repository. No branch was pushed or deployment created by that failed attempt. The platform requires the remote branch to exist before branch-scoped variables can be created.

The corrected initial-publication procedure uses a temporary `vercel.json` with only `git.deploymentEnabled["feat/add-demo-release"]=false`. Publish that guarded commit first, verify no branch deployment, create/verify the two branch-only false Config overrides, then remove the guard and publish the ordinary candidate. The [official Git configuration](https://vercel.com/docs/project-configuration/git-configuration), checked 2026-10-18, documents branch-specific disabling with other branches defaulting to enabled. No shared/Production setting or broader Git deployment setting is changed. Record the guarded and final commits, actual variable metadata and resulting deployment below; a planned procedure alone is not a pass.

Guarded commit `b7b539e5cd433fdf82aa48c818be42ba1341c245` was published to `origin/feat/add-demo-release`; the subsequent explicit branch-deployment query returned zero results. With the remote branch present, the connected Vercel create operation succeeded for both entries, with no failed entries:

| Branch Config override | ID | Verified value / target |
| --- | --- | --- |
| `DEEPSEEK_ENABLED` | `MH9U6ZQZrRTwphKp` | `false`; only Preview, only `feat/add-demo-release` |
| `DEEPSEEK_VISION_ENABLED` | `9TkHczXNvIbi7TOb` | `false`; only Preview, only `feat/add-demo-release` |

Each new Config value was privately read back and verified exactly false. The complete returned variable metadata retains the original five shared entries with the same IDs, targets and edit timestamps. The project account, Production deployment `dpl_8JNNKR9vqpvs7X44Vy2PsRtLMSv8` and SSO protection remain unchanged. The ordinary candidate removes the temporary Git guard after these checks; its push can now trigger the intended disabled Preview. No provider request was dispatched.

## Disabled Preview Acceptance Results

All results in this section are dated 2026-10-18, Australia/Perth. Final ordinary source commit is `37af0200b4670e486b9cfcda9ae48c1d6a99186c`; the temporary Git guard is absent. The engineering fingerprint still matches the original tested artifact. The accepted source retains the ordinary empty reference manifest. New cloud builds are ordinary Next.js builds, not fixture deployments.

| Target | Exact identity and configuration |
| --- | --- |
| Configured Git Preview | `dpl_EKPXaUsrDKg1XcvZ5eAdKZ5UytJU`, [immutable URL](https://jinlan-thangka-pbe8gkx4a-crazydave0522s-projects.vercel.app/), READY, Git source feat/add-demo-release at 37af020; Node 24, chat timeout 60 seconds; build-to-ready 20.021 seconds |
| Configured branch alias | [release Preview](https://jinlan-thangka-git-feat-add-demo-a59493-crazydave0522s-projects.vercel.app/); alias API independently confirms it maps to the configured Git deployment above |
| Configured service state | Existing inherited Supabase Config and accepted model, both branch-only switches read back false, provider key inherited but not used, fixtures absent from deployment environment names |
| Auxiliary no-service-credential Preview | `dpl_HkSqRacogh6332bLUAPr99MvreaR`, [immutable URL](https://jinlan-thangka-mx1wqbwy1-crazydave0522s-projects.vercel.app/), READY, source is a CLI upload of git archive 37af020; Node 24, chat timeout 60 seconds; build-to-ready 20.529 seconds; no aliases |
| Auxiliary overrides | Supabase URL/publishable key and provider key explicitly empty in both build/runtime; model deepseek-flash, both switches false and fixtures false. These are deployment-only overrides; project and branch settings are unchanged. Empty service values exercise unconfigured behavior, not a successfully read empty archive |

CLI deployment preflight checked all 226 upload files from the isolated commit archive; no local environment, generated evaluation or .vercel files were uploaded. The auxiliary deployment has CLI provenance, not a new Git commit or separate Git checkout. The project's latest Preview selector may refer to this auxiliary target; use the explicit configured Git URL/branch alias for subsequent active preparation.

### Configured HTTP and Browser Checks

Authenticated homepage GET returned 200 with Chinese title, lang=zh-CN and the expected empty landing. Exact immutable /api/chat checks returned:

| Probe | Actual outcome |
| --- | --- |
| GET | 405 |
| POST text/plain, {} | 415 / unsupported_media_type |
| POST application/json, {} | 400 / invalid_request |
| Malformed application/json, exactly 4,000,000 bytes | 400 / invalid_request |
| Same malformed body, exactly 4,000,001 bytes | 413 / request_too_large |
| Valid text request | 503 / generation_unavailable |
| Valid synthetic selected-image request | 422 / image_understanding_unavailable |

Every POST response is application/json with Cache-Control: no-store. The byte-boundary responses are application outcomes, not gateway substitutes. End-to-end CLI/request elapsed times were 2.261–9.111 seconds, including authentication, process startup and transfer; these are not provider latency measurements.

Actual hosted Chromium at 1366×768 and 390×844 passed hydration, Chinese landing, composer, desktop text 503 and mobile Worker-prepared image 422, editable independent draft, reachable send control, no horizontal overflow/page errors, and deliberate reload clearing page-local state without another POST. Inspected both retained screenshots under ignored evaluation-results/demo-release-disabled/: readable unavailable notice, proportional selected image, reachable composer and separate footer. These are browser automation results, not owner/native-mobile acceptance.

The first ad hoc desktop browser check submitted a correctly rejected disabled text request, then incorrectly expected the send button to be enabled with an empty composer. The accepted behavior disables that empty button. The corrected check types an independent draft before testing the enabled control and passed on both widths; no product code changed. Configured-target accounting: seven HTTP route probes (one GET, four invalid POSTs, two valid disabled POSTs), plus three valid disabled browser POSTs including that initial desktop attempt. Active P01–P06 dispatches remain zero. Auxiliary browser accounting is two further valid disabled POSTs.

The auxiliary browser passed homepage/hydration with no service credentials, text 503 and image 422, JSON/no-store, independent draft editing and reload without replay or page errors. This establishes the missing-service and configured-disabled cases separately. It does not establish live model quality, active image generation, real citation support, native keyboard/clipboard behavior or successful maximum-size image generation.

### Fresh Matched Archive Inspection

The configured Git Preview inherits the independently matched Supabase origin/publishable key; there is no Supabase branch override. Fresh publishable/anon smoke returned HTTP 200 for all eight table projections and the search RPC. Separate CLI 2.121.0 execution of the actual read-only inspection SQL used postgres, non-superuser with BYPASSRLS: all eight counts are zero, all tables are owned by postgres with RLS enabled/not forced, anon has schema USAGE and SELECT only, and exactly eight intended SELECT policies have USING (true). The single expected search function remains STABLE SECURITY INVOKER with empty search_path, anon EXECUTE and no PUBLIC EXECUTE. No row, schema, policy, grant or Storage object was changed.

A remote config pull into a disposable local template confirms Data API enabled, schemas public/graphql_public/thangka, extra search path public/extensions and max_rows=1000. Its first attempt lacked an initialized local template and failed without writing remote settings; initializing only the disposable local template resolved it. The copied configuration was deleted after selecting these safe fields. The initial sandbox CLI-help attempt could not write telemetry; permitted CLI execution resolved it. The anon smoke emitted the known Node module-type warning but all checks passed; package configuration was not changed for that warning. Task 3.3/A06 is passed for the configured Git target's matched archive, not for the auxiliary intentionally unconfigured target.

### Access and Final State

The first vercel curl attempt generated an automation-bypass credential using its supported automatic access flow, then native curl rejected the forwarded --non-interactive option. Removing that unsupported forwarded flag resolved access. The new credential was identified by exact creation time/user/scope and revoked with regenerate=false after HTTP checks; the project then reports zero automation-bypass credentials. Its value was never printed or committed. Browser checks used a separately issued short-lived development OIDC token, attached only to the exact Preview origin with other origins blocked. Local project linking/token files were created in disposable directories, leaving the owner's .env.local untouched; credential-bearing temporary copies are removed after checks.

The configured branch alias remains mapped to its Git deployment. Original shared variable IDs/scopes/edit timestamps and Production deployment dpl_8JNNKR9vqpvs7X44Vy2PsRtLMSv8 remain unchanged. Both test deployments retain false generation/vision settings and existing SSO. After credential revocation, anonymous page/API GETs on both immutable test URLs and the configured branch alias all return 302 to vercel.com/sso-api; the Production public page/API remain 200/405. Both task-owned temporary directories were removed, including local OIDC/link files and the auxiliary source copy. No enabled test deployment was created in this batch. This initial disabled checkpoint does not replace post-active rollback/direct-URL retirement or the future owner/device and funded acceptance.

Final documentation checks pass: all eight OpenSpec items in strict mode, 129 local links and 21 heading fragments across thirteen documents, and git diff --check. The engineering fingerprint is unchanged. Post-deployment evidence updates are documentation only and are retained separately from the published 37af020 candidate; do not relabel its checks or trigger another build merely to publish its result record. The change now has 14/22 tasks complete. Active scope and owner/device participation have been requested but not yet received in this record; the proposed 60-minute/six-submission/twelve-call batch is not authorization by itself. Both model switches remain false while awaiting that input.

## Authorized Active Batch

On 2026-10-18 the owner explicitly approved the protected 37af020 Git Preview batch using the existing DeepSeek balance, adding that more could be used if needed. The owner chose assistant automation for both desktop and mobile; native-device acceptance is separately deferred. This execution retains the initial six-submission/twelve-call ceiling, a 60-minute window from switch activation, sequential review, and immediate stop at the first failure or unmet prerequisite. No extra attempt or replacement is included silently.

The fixed questions, sessions and rubric are those in [the runbook](../../../docs/demo-release.md#6-prepare-the-active-smoke-before-funding-approval). P01/P02 use independent fresh 1366×768 desktop pages; P03–P06 share a fresh 390×844 page. P05 is eligible only if the first image's small code is absent from all available observations/history. P06 preserves the independent fifth-image/text draft. The assistant is the reviewer; access remains existing same-project SSO plus origin-scoped short-lived OIDC. No public funded audience is authorized.

Before activation, the original five input hashes were verified and actual hosted Chromium Worker-prepared copies were frozen at 2026-10-17T23:14:28.986Z (2026-10-18 07:14:28.986 Australia/Perth), using the configured disabled Git Preview. Every prepared image is 800×600 PNG:

| Input | Prepared bytes | SHA-256 |
| --- | --- | --- |
| 01-square.png | 12,879 | a4a85966ecc8011891b1c0acde00057ed1c5a8b62e0e2a50605ffb4e57cb36e6 |
| 02-circle.png | 22,149 | da1b5a9568749dbe979c6cfacd73a9261e1e9a167958f8f8163c2ec23338e72e |
| 03-triangle.png | 20,303 | ea2c73f87274a5b7ca4d692bbbfa36a6a2f67687aaeac410614df115daa1d14a |
| 04-diamond.png | 19,780 | aea566a7639ed07bdb15229b4a58d71b53c4a510b1c56f3eeb07f9dae2b4e748 |
| 05-draft-only.png | 21,918 | ef0be573923e1d0a356f77fa5adfb0af6984e5fdebed555ea3284df8b18d9955 |

The frozen copies, exact rubric/questions and safe local ledger are under ignored evaluation-results/demo-release-active/. No provider request was sent during preparation. Before-state: branch-only generation/vision Config values false and Production dpl_8JNNKR9vqpvs7X44Vy2PsRtLMSv8. The recorded rollback baseline was disabled 37af020/dpl_EKPXaUsrDKg1XcvZ5eAdKZ5UytJU; a fresh alias snapshot was not taken before activation. Final inventory subsequently found the intervening pre-window docs-only 299acb3 Preview, as resolved below. Planned rollback: restore both branch Config values false, restore that disabled branch-alias target, and remove only this batch's enabled deployment by exact ID so its immutable page/API cannot remain funded. Verify final metadata and access without additional provider questions. Existing disabled deployments are retained.

Both branch-only Config values were changed to true and independently read back. The window starts 2026-10-17T23:15:03.600Z and ends no later than 2026-10-18T00:15:03.600Z (07:15:03.600–08:15:03.600 Australia/Perth). Exact active target is dpl_EWkwFH1i8pUXztaBevx9eyzL34Yp, https://jinlan-thangka-2hbuk7rvj-crazydave0522s-projects.vercel.app/, requested from the existing Git connection with exact sha 37af020 and branch feat/add-demo-release. An initial create API request rejected the literal target=preview before creating any deployment; omitting that API-only field selects the ordinary non-Production Preview. This configuration correction is not a provider-bearing dispatch or paid retry. Readiness/configuration inspection precedes the first submission. Final inventory also discovered a separate docs-only 299acb3 Git deployment created before this window; it was not the paid target, as distinguished below.

### Active Results and Usage

The active Git Preview reached READY in 42.983 seconds from build start. Raw Git metadata independently confirms exact 37af020; CLI confirms Preview target and api/chat runtime nodejs24.x with 60-second timeout. Captured service environment names are the expected Supabase pair, provider key, model and both switches; browser fixtures are absent. Only the two branch-specific Config values changed. One attempted metadata command was blocked by automatic approval review because raw environment fields could disclose values. It never executed; the corrected whitelist emitted names only. No secret was printed or committed.

Every dispatched case returned HTTP 200, application/json and Cache-Control: no-store. The operator reviewed each response before continuing; no retry, repair, replacement or extra paid question occurred.

| Case | Dispatch (Australia/Perth, 2026-10-18) | Browser elapsed | Observed stages | Prompt / completion / total tokens | Result |
| --- | --- | --- | --- | --- | --- |
| P01 | 07:16:55.241 | 4,697 ms | planner 723 ms; answer 2,902 ms | 1,622 / 318 / 1,940 | Passed: general appreciation advice, general blocks only, no references; trusted no_retrieval notice agrees with text |
| P02 | 07:17:19.380 | 4,476 ms | planner 944 ms; answer 1,559 ms | 1,730 / 146 / 1,876 | Passed: full supplied name, completed-empty lookup; no guessed author/date/source and no claim that the work cannot exist |
| P03 | 07:17:48.674 | 6,932 ms | analysis 3,228 ms; image_answer 1,898 ms | 8,151 / 1,188 / 9,339 | Passed: red square, blue circle, green triangle, yellow diamond; four correctly associated observations, qualified identity limits, no archive identity/reference images/comparisons |
| P04 | 07:18:14.511 | 3,799 ms | planner 781 ms; answer 2,285 ms | 7,850 / 473 / 8,323 | Passed: request inputs=[], exact prior observations, no historical image data; visual blocks cite prior IDs and explicitly preserve no-reread/uncertainty |
| P05 | Not dispatched | — | — | — | Not run: K7 is explicitly present in P03's facts/readings and P03/P04 history, so the missing-detail prerequisite is unmet |
| P06 | Not dispatched | — | — | — | Not run: no eligible P05 targeted reread. No claim of live observation replacement/newer-draft preservation during reread |

P02 query evidence is more than model-authored prose: the captured fresh request contains 作品《空库验收合成作品17》; exact deployed src/lib/answers/named-retrieval.ts extracts and forces artwork/name/exact/空库验收合成作品17/limit=5. The deployed orchestrator awaits all required retrievals, rejects errors, and generates the no_matches notice only after completed empty results. The successful response contains that server-generated notice. All three relevant local source files were byte-compared with git show 37af020 and their hashes retained in the ignored P02 query-proof record. This request/source/server-status chain establishes the required literal lookup; no provider text is treated as a raw database trace or independent query log.

P03's four request byte lengths/hashes and descriptor dimensions match the pre-activation frozen copies exactly; observation image IDs match selected inputs in order. K7 was correctly read on the first image, with its meaning left unknown. P04 independently exercises its planned history-only summary before reaching the ineligible P05; only P05 and its dependent P06 stop. No case was substituted to force missing information.

All eight successful ai_completion entries report deepseek-flash, with no truncation; runtime-log pagination is complete for the scoped window. Four distinct request IDs each have two observed stages. Total: four dispatched submissions, conservative bound eight provider calls, eight observed completions, 19,353 prompt tokens + 2,125 completion tokens = 21,478 total tokens. Browser counters and the complete 89-row platform request query independently agree on exactly four /api/chat POSTs, all 200; remaining records are page/static GETs. There is no unresolved activity within the reserved eight-call bound. Actual provider-console currency expenditure was unavailable and remains unknown; token totals are not a billing claim or a refund of allowance.

### Non-Submitting Active Browser Checks

Hosted Chromium copied the actual P02 empty answer and P04 prior-observation answer through the browser clipboard. Exports contain their relevant uncertainty/notices and picture associations, with no invented citations. A separately prepared fifth purple-cross image and its fixed text stayed as an unsent mobile draft during copy/resize; it was never sent. Deliberate reload cleared replies, images and drafts on both pages without another POST (four before/after), and no page error was observed.

Actual desktop 1366×768 and mobile 390×844 views passed, as did non-submitting 768×720, 844×390 and 360×640 resize checks with no horizontal overflow. Inspected retained mobile/desktop screenshots: readable reply/draft, proportional purple-cross preview, reachable send control and separate footer. This is Chromium emulation/clipboard evidence, not native mobile keyboard, selection, accessibility or owner acceptance. Earlier complete isolated eight-viewport evidence remains applicable; no product source changed.

### Actual Rollback and Final State

Both branch-only Config values were restored to false and independently read back by 2026-10-17T23:18:47.932Z (07:18:47.932 Australia/Perth). The branch alias was initially restored to reviewed disabled dpl_EKPXaUsrDKg1XcvZ5eAdKZ5UytJU, then finally restored to the intervening pre-batch docs-only deployment after final inventory resolved that publication (below). After non-submitting checks, the exact enabled dpl_EWkwFH1i8pUXztaBevx9eyzL34Yp was removed successfully; its absence and retained Production state were confirmed by 07:20:10, well before the 08:15 deadline. The deployment API now returns not found; both its immutable page and API GET return 404/DEPLOYMENT_NOT_FOUND anonymously and with same-project OIDC. Changing an alias alone was not used as retirement evidence.

The disabled Git and auxiliary immutable page/API URLs and restored branch alias still return anonymous 302 to vercel.com/sso-api. Production dpl_8JNNKR9vqpvs7X44Vy2PsRtLMSv8 is unchanged; its public page/API remain 200/405. The five original shared environment IDs/scopes/edit timestamps match the before-state exactly, including the pre-existing shared generation value; only the two release-branch overrides were edited. Existing SSO remains all_except_custom_domains, automation-bypass count remains zero. This is a temporary Preview rollback, not a Production rollback or change to Production auto-assignment.

Final inventory also contains dpl_5X8upbCQVZAR4UUcHh18SDQVXaFV, https://jinlan-thangka-5umx2w3ua-crazydave0522s-projects.vercel.app/, from docs-only 299acb3. Its creation/build/ready times precede this activation while both branch overrides were false; local origin tracking now records 299acb3 pushed. This supersedes the earlier disabled-checkpoint statement that the result commit was local only. It has unchanged application/engineering source, was not used for paid cases, and retains anonymous page/API SSO redirects. Git publication/ready metadata shows this intervening docs Preview had the branch alias before the active rebuild. After discovering that intervening publication, the final alias was restored to dpl_5X8upbCQVZAR4UUcHh18SDQVXaFV/299acb3 rather than leaving the initially planned 37af020 restoration. Alias API independently confirms that exact final mapping, and final anonymous page/API GETs still redirect to SSO. The disabled 37af020 immutable target remains retained as the exact tested application baseline. All 37af020-to-299acb3 changes are Markdown documentation; application/engineering source is identical. No additional deployment was created to publish this result record.

No remote database/schema/policy/Storage write occurred. The task-owned browser process was closed, its remaining command process stopped, and the disposable OIDC/link directory is removed after final access checks. Raw synthetic requests/outputs/prepared copies, safe usage/access evidence and screenshots remain ignored locally; credential files do not. A08/P05–P06 and A14 remain open, B deferred; this batch does not establish domain accuracy or whole-release completion.

### Final Local Verification

After this batch, npm run check passes lint, TypeScript and 35 files/406 tests (6.25-second Vitest run). Strict OpenSpec validation passes all eight items; all 106 local links and 28 heading fragments across the nine changed Markdown files resolve; git diff --check passes. The seven-file engineering fingerprint remains e8fb73964fb1f46e185ac9040095176518fbce240d33e872536985a4bbedcf9b. Product/test/build source is unchanged, so the prior 107-case isolated browser suite and ordinary build remain applicable without another fixture build or cloud deployment. Only the nine result/status documents changed. Tasks are 16/22 complete; the result update is kept separate from the deployed source, with A08/A14 and B/whole completion explicitly open.

## Independent Reread Supplement

On the owner's subsequent request for the next step, the assistant proceeds under the owner's existing explicit additional-funding and automatic-operation authorization. This is a separately bounded R01–R03 batch, not a retry or replacement of P05–P06. The frozen plan/rubric is [runbook section 9](../../../docs/demo-release.md#9-independent-reread-supplement): three submissions/six-call conservative ceiling, fresh mobile session, 60 minutes maximum from activation, stop on first failure/unmet next-case prerequisite, no edited observations/history and no automatic retry. Combined authorized execution is capped at seven submissions/fourteen calls for these two recorded batches. Owner/native review remains deferred; no public funded audience is added.

Before activation, fresh alias API confirms the branch alias maps to dpl_5X8upbCQVZAR4UUcHh18SDQVXaFV (docs-only 299acb3). Both release-branch Config switches read back false. Safe project metadata confirms unchanged Production dpl_8JNNKR9vqpvs7X44Vy2PsRtLMSv8, shared variable IDs/scopes/edit timestamps, existing SSO and zero automation-bypass credentials. Only Markdown differs from exact tested application source 37af020. Rollback will restore that exact sampled alias target, both false branch switches and remove the new enabled deployment by exact ID; no data/Storage writes or additional paid verification questions are planned. A task-owned disposable directory obtains official short-lived OIDC; the owner's .env.local is untouched.

The newly self-drawn first image is visibly a red square with small M4P8 at bottom right; the other four permitted original drawings are copied unchanged. Original first-image SHA-256 is 9359b8ac7c6b339bfb19d06dd2cdaaebbbc4c209a449d633515c356240c90cfb (14,449 bytes; 800×600 PNG). R01 naturally asks only central color/shape; if its full unmodified observation/history nevertheless records M4P8, R02–R03 will not run. No provider request occurs while preparing/freezing inputs.

Hosted Chromium Worker-prepared copies were frozen at 2026-10-17T23:28:43.280Z (07:28:43.280 Australia/Perth). All five remain 800×600 PNG. New first image: 13,742 bytes, SHA-256 3fb280f0d9a151867e9c1702c028e3a2c803de318c24f74708b7fe9735bbc062. Images 02–05 match their prior prepared bytes/hashes exactly (22,149 / 20,303 / 19,780 / 21,918 bytes). The complete immutable input/question manifest and browser evidence are retained under ignored evaluation-results/demo-release-reread/; originals are in the separate reread-inputs directory. Prepared bytes are bound to the exact active target before dispatch.

Both branch-only switches were enabled and independently read back true; activation is 2026-10-17T23:29:24.587Z, hard end 2026-10-18T00:29:24.587Z (07:29:24.587–08:29:24.587 Australia/Perth). Exact target is dpl_8dbPuGUFuYHJGWURWL6XyqQVnpr8, https://jinlan-thangka-6lv3mgh8w-crazydave0522s-projects.vercel.app/, created from the existing Git connection pinned to 37af020/feat/add-demo-release. The current documentation-only local HEAD a825610 is not the paid source. Build/readiness/configuration inspection precedes the first dispatch; all runtime credentials stay server-side and fixtures stay absent.

### Supplemental Results and Usage

The exact Git Preview reached READY in 40.973 seconds from build start. CLI confirms Preview, nodejs24.x, 60-second timeout and 2,048 MB; raw source metadata matches 37af020 and the six expected service environment names, with fixtures absent. All cases returned HTTP 200, application/json and no-store. Each was reviewed before the next; no retry or replacement occurred.

| Case | Dispatch (Australia/Perth, 2026-10-18) | Browser elapsed | Observed stages | Prompt / completion / total tokens | Result |
| --- | --- | --- | --- | --- | --- |
| R01 | 07:31:03.729 | 6,463 ms | analysis 2,569 ms; image_answer 1,839 ms | 7,968 / 837 / 8,805 | Passed: four correct central colors/shapes and associated observations; exact frozen input bytes/hashes. Full unmodified answer/facts/readings/history omit M4P8 and any bottom-right reading, so R02 is eligible |
| R02 | 07:31:23.532 | 2,042 ms | planner 1,199 ms | 3,704 / 35 / 3,739 | Passed: inputs=[], all four original observations unchanged, no historical pixels; genuine clarification requests only image 1, tied to the exact question/source IDs; no guessed code |
| R03 | 07:32:00.055 | 3,846 ms | analysis 1,525 ms; image_answer 999 ms | 7,998 / 302 / 8,300 | Passed: one counted reread carries only original image 1 bytes and captured R02 question/source IDs; newer draft excluded/preserved; M4P8 correctly read, one successful new observation supersedes image 1's previous observation |

R03's request retains all four original descriptors and observations, selects only image 1 with exactly the R01 bytes, repeats R02's captured question and intent IDs, and contains neither the fifth picture nor the independent newer draft text. The completed reply contains exactly one new observation with a new ID, correct image hash, current turn/assistant origin and supersedes equal to R01's image-1 observation ID. Other three image observations are unchanged in the captured context. Before/after UI inspection confirms the newer purple-cross image and fixed text remain unsent, historical selection is empty and POST count increases only from two to three. No archive record/source/reference-image claim is invented.

Complete untruncated runtime logs show five deepseek-flash completions across three distinct request IDs: two analysis/image_answer pairs and one planner-only successful clarification. The complete 75-row platform request query independently confirms exactly three /api/chat POSTs, all 200, with no pagination/excluded intervals. Supplemental usage: 19,670 prompt + 1,174 completion = 20,844 tokens. Reserved ceiling is six calls; five are observed and the successful R02 clarification returns before an answer stage, leaving no unresolved activity inside that dispatch ledger. Across both batches: seven submissions, thirteen observed completions, 39,023 prompt + 3,299 completion = 42,322 tokens, within the recorded combined fourteen-call ceiling. Provider-console currency expenditure remains unavailable/unknown; usage is not a fabricated billing amount.

Actual R03 clipboard export includes M4P8, the correct image association, current-observation wording and uncertainty/no-retrieval notices. Copy and resizing preserve the newer draft; deliberate reload clears replies, historical images and draft without replay (three POSTs before/after) or page errors. Non-submitting 390×844, 768×720, 844×390 and 360×640 checks have no horizontal overflow; the inspected 390×844 screenshot shows readable reply notices, copied status, proportional unsent purple-cross preview and reachable controls/footer. This is hosted Chromium evidence, not native keyboard/selection/owner acceptance. Together with P03–P04 and unchanged isolated coverage, R01–R03 closes A08's automated/deployed synthetic-flow gap.

### Supplemental Rollback and Handoff

Both branch-specific Config switches were restored and independently read back false by 2026-10-17T23:32:31.648Z (07:32:31.648 Australia/Perth). The alias was restored to its freshly sampled pre-batch dpl_5X8upbCQVZAR4UUcHh18SDQVXaFV/299acb3 target; alias API confirms that exact mapping. After non-submitting checks, the exact enabled dpl_8dbPuGUFuYHJGWURWL6XyqQVnpr8 was removed. Final metadata/access checks and temporary-credential cleanup are recorded after completion below. No Production rollback, shared-setting edit, database/schema/policy write or Storage operation was performed.

The next A action belongs to the owner: separately arranged desktop/mobile hands-on review of Chinese input/keyboard, picture selection, copy, reading position/orientation and deliberate reload. Assistant automation and extra funding are already authorized; no renewed funding approval is needed within that scope. Participation timing and actual native results remain unavailable, so task 3.6/A14 and A stay open. B and whole-change completion remain deferred/open, without asking for replacement archive data now.

Final supplemental metadata at 2026-10-17T23:34:17.970Z (07:34:17.970 Australia/Perth) confirms the enabled deployment no longer exists, unchanged Production ID/SSO, zero automation-bypass credentials and exact original shared variable IDs/scopes/edit timestamps. Its immutable page/API return 404/DEPLOYMENT_NOT_FOUND both anonymously and with same-project OIDC; the earlier enabled P-batch URL also remains 404. All three retained disabled immutable targets and the restored branch alias return anonymous SSO redirects; Production page/API remain 200/405. These are GET/metadata checks, with no extra provider dispatch. Closure completes well before 08:29. The browser/command process is closed and its task-owned OIDC/link directory removed; owner .env.local remains untouched. Safe synthetic evidence stays ignored locally.

Final supplemental local checks pass: npm run check (lint, TypeScript, 35 files/406 tests; 5.83-second Vitest run), all eight strict OpenSpec items, 107 local links/29 heading fragments across nine changed Markdown documents and git diff --check. The engineering fingerprint remains e8fb73964fb1f46e185ac9040095176518fbce240d33e872536985a4bbedcf9b; no application/test/build source changed, so the prior full 107-case isolated suite and ordinary build remain applicable. Result/status/runbook changes are documentation only and do not deploy the local result commit. Tasks remain 16/22; A14 is the sole remaining A gate, with the concrete owner-device handoff in runbook section 10.

## Owner Acceptance and Milestone A Closure

Reported on 2026-10-18, Australia/Perth. After being presented with the desktop/mobile hands-on checklist as A's sole remaining gate, the owner stated that their actual acceptance review revealed no issues. In that context this is recorded as the owner's A-stage signoff, completing task 3.6/A14 and milestone A. No repeated hands-on session or new funding approval is required solely to reconfirm that report.

This is owner-reported acceptance, distinct from the captured automated results. Exact desktop/phone devices, browser/OS versions, tested URL/commit, test timestamps, action-by-action outcomes and any manual provider usage were not supplied. They remain unrecorded. The record does not invent passes for named native-browser/keyboard combinations, assign this report to an exact deployment, or infer another coordinated paid batch. The P/R automated evidence remains bound to exact 37af020, seven submissions/thirteen observed completions/42,322 tokens; its counts do not include unspecified owner activity. This evidence limitation does not reopen the owner's reported A-stage signoff.

The closure follow-up uses connected read-only metadata only. Both feat/add-demo-release Preview overrides independently read back false; branch alias still maps to disabled dpl_5X8upbCQVZAR4UUcHh18SDQVXaFV/299acb3; existing SSO remains enabled with all_except_custom_domains. No deployment, environment mutation, provider submission, database write or Storage operation was performed to record acceptance. Production retains its last independently verified identity/state from the supplemental closure; no new native target mapping is inferred.

Tasks 1–3 are now complete (17/22 overall). B01–B06/tasks 4.1–4.3 remain deferred until reviewed real records/sources, permitted images/grants and independent domain judgments exist. Tasks 5.1–5.2 remain open for both-milestone/final-candidate reconciliation and final integrated acceptance. This closes A only: no merge, Production release or normal OpenSpec archival is implied, and historical empty-archive evidence must not be recreated by clearing later data. The next project step is B when its existing deferred inputs become available.

Closure documentation validation passes all eight strict OpenSpec items, 113 local links and 32 heading fragments across ten changed Markdown files, plus git diff --check. The engineering fingerprint is unchanged; application/test/build files are untouched, so the last 406-test npm run check, full 107-case isolated browser suite and ordinary build retain their recorded scope without another service/test run. This update records the owner's acceptance and synchronizes project status only.

## Main Integration

On 2026-10-18 the owner explicitly requested merging the current branch. This authorizes integration of completed milestone A while B and whole-change tasks remain open; normal archival is not requested. Fresh origin/main is c841ea4c52ccd66bda906615dd35d8762195f942, an ancestor of accepted feat/add-demo-release at 8a127cb. The working tree was clean, no open PR was returned by the connected repository query, GitHub's public branch metadata reports main unprotected, and normal Git push dry-run succeeds. Local main was fast-forwarded to 8a127cb without conflicts at 2026-10-18T05:07:20Z (13:07:20 Australia/Perth); this additional documentation record is committed separately on main.

Merge validation passes npm run check (lint, TypeScript, 35 files/406 tests; 6.47-second Vitest run), all eight strict OpenSpec items and diff whitespace checks. The engineering fingerprint still equals e8fb73964fb1f46e185ac9040095176518fbce240d33e872536985a4bbedcf9b. Compared with the former main, changes are release documentation/specs, read-only/offline helper scripts, tests and generated-artifact lint exclusions. Application/runtime/UI, dependencies, database schema/migrations and ordinary reference manifest are unchanged. The prior complete 107-case isolated browser suite and ordinary build retain their scope; a new full browser run or paid submission is not needed merely for this conflict-free integration.

Fresh Vercel metadata identifies the same project/account, main Production branch, automatic Git deployments enabled, prior Production dpl_8JNNKR9vqpvs7X44Vy2PsRtLMSv8 and existing SSO/zero automation bypass. Existing shared variable IDs/scopes/edit timestamps are captured privately as metadata only. The owner was informed that pushing main triggers that existing automatic Production build. Normal Git publication and its resulting deployment are verified after this local integration record; no completed remote build is asserted by this paragraph. No environment change, database/Storage write or active provider question is part of the merge.

A remains accepted; tasks remain 17/22. Keep this change under openspec/changes/add-demo-release so B can resume with real material and final candidate/whole-change checks. Source integration does not complete tasks 4.1–4.3 or 5.1–5.2 and does not archive the change.


## Archive Readiness and B-Stage Preparation

On 2026-10-18 the owner requested archival of eligible changes and continuation of unfinished work, then explicitly reconfirmed that real material is not ready and requested B-stage preparation. Only the two completed database changes are archived. This release remains active at 17/22 tasks: tasks 4.1–4.3 and 5.1–5.2 stay open.

Fresh read-only archival preflight at 2026-10-18T08:42:15Z confirms PostgreSQL 17.11, eight empty business tables, 129 business columns, a 12-column operational ledger with zero rows, no thumbnail and no unexpected tables/functions. Existing business read access remains separate from five restricted invoker helpers and the ledger. Production dpl_EPLokWWR2NJXXw1VXJButzbsTH52 is READY/PROMOTED at main@3a32a19 with jinlan-thangka.vercel.app assigned. Its runtime is the verified 16fb474 implementation; the later closure is documentation only. No data/Storage/configuration write or paid dispatch is part of this archival continuation.

| Change since historical A | Applicable evidence | Retained limit |
| --- | --- | --- |
| Thumbnail removal and new row-review metadata/source/array constraints | [Thumbnail rollout](../archive/2026-10-18-remove-unused-image-thumbnail/verification.md) and [data-quality rollout](../archive/2026-10-18-update-archive-data-quality/verification.md): final 432-test check, 45 affected real-route Chromium cases, ordinary build, eight PostgreSQL checks, actual-backup restore, canonical types and live read/denial checks | Does not establish real source support or artwork identity |
| Current protected disabled candidate and public deployment | Data-quality verification records eight viewport shells, disabled 503/422 behavior, public 200/405 and unchanged shared settings | No new active-provider semantic sample; historical P/R results remain bound to 37af020 |
| Remaining UI/control behavior | Components/request UI unchanged by these database increments; prior full 107-case suite remains historical, with affected source/image/composed cases rerun as above | No claim that 107 cases were rerun on the new runtime or that emulation proves native-device coverage |
| This archival/preparation change | Markdown/specification moves, normative promotion and link/status repairs only; compare the final diff with 3a32a19 | No runtime/configuration changes; normal archival still does not complete this release |

The [real-data handoff](../../../docs/demo-real-data-handoff.md) now identifies actual records, source scopes, AI-processing rights, visitor/reference examples and independent judgments needed for B01–B06. It provides the import/review/grant order, case-freeze and funded-scope gates, execution/closure steps and a result-record template. No placeholder records, synthetic positives or guessed judgments are substituted for absent material.

Next dependent action: review the owner's actual local material/permission locations when available, then freeze the concrete cases and evaluation scope. Administrative preparation is ready; actual retrieval/source/identity/access judgments and final-candidate/owner acceptance remain unavailable. Do not request another A signoff, clear curated data or transfer the old P/R allowance to an unspecified B batch.
