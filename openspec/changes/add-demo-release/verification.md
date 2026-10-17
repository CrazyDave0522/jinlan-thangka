# Demo Release Verification

## Status and Authorization

On 2026-10-17, immediately after being asked to approve the existing detailed proposal and start A, the owner instructed continuation. This approves milestone A implementation on `feat/add-demo-release`; the proposal approval task is complete. It does not authorize new deployed provider charges, wider public funded access, a Production change or real-data preparation. No new product behavior was introduced.

Local engineering is complete. Connected Vercel and the owner-authorized CLI login identify the existing project, current Production revision, root/build/Git settings, saved environment configuration, captured deployment environment names, effective function duration and sampled access. Task 3.1 is complete. A remains open for an actual disabled branch Preview, deployed active evaluation, owner/native-device review and actual rollback/retirement. B stays deferred; the whole change is not complete or ready for normal archival. The historical sessions below performed no assistant commit, push, deployment or environment mutation; subsequent actions must be recorded separately. No remote database write, real Storage request or paid provider call was performed.

## Tested Artifact

Date: 2026-10-17, Australia/Perth. Node v24.22.0; installed Next.js 16.4.1. Base: `c841ea4c52ccd66bda906615dd35d8762195f942`, plus the uncommitted release engineering files below. Application source is unchanged from that base. Tests do not identify the current Vercel revision.

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
| A04 | Existing `text-conversation.spec.ts`, route/config/vision tests | Local unavailable behavior passed; actual missing-settings/configured-disabled Preview not run |
| A05 | Connected Vercel reads/anonymous GETs plus authenticated CLI project/API/build-log/function inspection | Current-project inspection passed, including root/default build settings, linked Production branch and actual 60-second chat function; new release-Preview configuration/access and reviewed active audience remain open |
| A06 | Actual local-config anon eight-table/RPC smoke plus separate privileged read-only count/grant/RLS/function inspection; private comparison to saved Vercel Config values | Saved shared Preview/Production Supabase origin and publishable key match the inspected local configuration; actual new Preview and fresh Data API settings inspection remain open |
| A07 | `grounded-answers.spec.ts`, empty-name regressions, new composed empty lookup | Isolated behavior passed; actual deployed P01–P02 not run |
| A08 | `image-interpretation.spec.ts`, continuity unit/component tests and new ordered journey | Isolated behavior passed; deployed P03–P06 not run |
| A09 | `answer-sources.spec.ts`, presentation/answer-action tests; native copy in new journey | Isolated source/export behavior passed; owner review and actual empty reply copy not run |
| A10 | Existing route/runtime/vision/text/image/source failures and browser correction/retry cases | Deterministic failure coverage passed; no paid fault injection needed |
| A11 | Existing image count/preparation/route byte tests; prior public malformed-body recheck | Isolated limits and current public alias probes passed; exact new Preview identity/transport evidence remains open |
| A12 | Existing reload tests plus composed native copy/reload and no-replay counters | Isolated behavior passed; deployed reload check not run |
| A13 | New ordered actual-route journey at all eight core viewports plus existing long-source/error/layout suites | Passed, with mobile/desktop screenshots inspected and intermediate/landscape/short-height checks |
| A14 | Existing automated focus/clipboard/touch checks | Automated coverage passed; owner/native-device participation not run and must fit the active batch |
| A15 | Prepared release/rollback runbook | Procedure prepared; actual disabled-final-state/rollback/direct-URL retirement not run |
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

Current deployed active ledger: P01–P06 not run, zero application/provider dispatches by this session. No observed cloud-model usage is available; no numerical billing claim is inferred. Proposed future maximum six submissions/twelve calls still requires its concrete scope decision. If unavailable/failed, stop and retain the result without retries/substitution; missing completion logs never refund allowance.

## Remaining Work

1. Task 3.1 is complete through the newly authenticated CLI, as recorded in the follow-up below; no further owner login/configuration screenshot is needed for that inspection.
2. Prepare the exact commit/Preview/configuration/access action, preserving Production. Before publishing `feat/add-demo-release`, give only that branch explicit Preview overrides `DEEPSEEK_ENABLED=false` and `DEEPSEEK_VISION_ENABLED=false`: shared Preview currently enables text and Git deployment creation is enabled. Keep fixtures absent/false and the accepted model. Then create the authorized ordinary disabled Preview, verify its actual settings and match its Supabase origin/category to the independently inspected archive; inspect current Data API settings before closing A06.
3. Freeze browser-prepared smoke inputs, exact target/window/audience and owner participation; agree funded limits, execute/review the one bounded batch, and verify actual copy/reload/native-device results within it.
4. Exercise rollback/final disabled state and retirement/control of enabled test direct URLs. Keep A and whole acceptance open until evidence exists; B stays deferred without new data requests.

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
