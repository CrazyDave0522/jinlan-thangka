# Empty-Archive Demo Release Runbook

## Scope and Evidence

Milestone A of [add-demo-release](../openspec/changes/add-demo-release/proposal.md) is approved for implementation. Real records, source support, artwork-identification accuracy and curated reference access stay deferred to B. Record actual outcomes in [verification.md](../openspec/changes/add-demo-release/verification.md), using the [acceptance matrix](../openspec/changes/add-demo-release/acceptance.md). This runbook does not itself activate a deployment or authorize paid calls.

The existing public reference is [jinlan-thangka.vercel.app](https://jinlan-thangka.vercel.app/). The intended acceptance target is a Preview of `feat/add-demo-release` in that existing project. Preserve the current Production mapping/settings. A public alias or the owner's redeployment report does not identify its commit, project, effective settings or the proposed Preview.

## 1. Establish the Candidate

Before publication or deployment, inspect and record:

| Field | Required evidence |
| --- | --- |
| Project | Existing team/project identity, linked repository and root directory |
| Artifact | Exact reviewed commit, clean/dirty state, branch, build/deployment ID and immutable URL |
| Environment | Preview, including branch-specific overrides versus shared Preview/Production settings |
| Build/runtime | Node 24.x, Next.js server deployment, build/install settings, ordinary reference manifest |
| Duration | Effective `/api/chat` function duration supports its declared 60 seconds; shared server deadline is 55 seconds, client deadline 65 seconds |
| Audience | Authorized reviewers, test window and verified access to both page and direct API/immutable URLs |
| Previous state | Existing Production deployment/mapping/settings and any already enabled direct URLs |

Inspect whether pushing the branch automatically deploys with inherited enabled switches before publishing. Prepare the concrete commit, target, changed setting names/scopes and access mode for review. Existing authorization applies within its scope; ask only for missing decisions. Do not pull environment values over the owner's `.env.local`, publish keys, or modify Production as a side effect.

Connected Vercel inspection identifies project `prj_FnmBJHdIVIUQSobZy5EAYNV3lAkF`, current Production `main@c841ea4`, saved shared configuration and sampled anonymous access. The owner completed CLI login on 2026-10-18; [the follow-up](../openspec/changes/add-demo-release/verification.md#authenticated-cli-follow-up) confirms root/default build settings, the Git-linked `main` Production branch, enabled Git deployments, captured environment names and the actual Node 24 / 60-second chat function. The earlier connector 403 does not block these authenticated CLI reads. Historical Production environment values are not returned by the deployment endpoint. The configured Git Preview at 37af020 and auxiliary no-service-credential Preview now pass actual disabled/browser/transport checks; see [deployed results](../openspec/changes/add-demo-release/verification.md#disabled-preview-acceptance-results). Use the explicit reviewed disabled Git Preview, because generic latest may select a different deployment. The owner subsequently authorized automated P01–P04 on an exact 37af020 temporary enabled Git Preview; those cases and rollback passed, while P05–P06 were not run because K7 was already observed. Independent R01–R03 subsequently passed the missing-detail/reread/newer-draft flow under the additional allowance. Both temporary enabled deployments are removed, both branch overrides are false, and A remains open only for separately deferred native-device review. See [active results](../openspec/changes/add-demo-release/verification.md#active-results-and-usage). Existing Supabase CLI authentication provides separate read-only administrative inspection; an additional Supabase integration is optional. Use supported authentication rather than extracting credentials or substituting application keys for management authentication.

## 2. Verify Local Engineering

Run these sequentially because fixture and ordinary builds share `.next`:

```sh
npm run check
env NODE_OPTIONS= npm run test:e2e
env DEEPSEEK_ENABLED=false DEEPSEEK_VISION_ENABLED=false JINLAN_BROWSER_FIXTURES=false NODE_OPTIONS= npm run build
```

The browser runner overrides inherited credentials/switches and uses isolated upstreams. Its fixture build is never a deployable demo mode. `demo-release.spec.ts` exercises one ordered text → four pictures → summary → targeted clarification → reread beside a newer text/image draft → native Chromium copy → reload journey at all eight core viewports. Existing suites retain rich source, maximum-evidence, error, retry, byte/count and scrolling coverage. Reuse the [testing baseline](testing.md#responsive-browser-acceptance); inspect representative mobile/desktop screenshots and affected tablet/landscape/short-height states. Browser emulation does not establish native mobile keyboard/selection or measured audience coverage.

The read-only inspection SQL has isolated PostgreSQL tests, including a real row hidden from `anon` by RLS. These prove inspection behavior on fixtures, not current remote permissions.

## 3. Configure a Disabled Preview

Use the exact [AI setting table](ai-setup.md#vercel-configuration-starting-point). Both `DEEPSEEK_ENABLED` and `DEEPSEEK_VISION_ENABLED` are initially `false`; `JINLAN_BROWSER_FIXTURES` is absent or `false`. Set `DEEPSEEK_MODEL=deepseek-flash`. Public Supabase names are `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as Config; the server-only provider key is Secret and can remain absent during disabled checks.

The inspected saved shared Preview/Production configuration currently has text enabled and no vision entry. Vercel rejects branch overrides until the remote branch exists. For initial publication, use a temporary `vercel.json` with `git.deploymentEnabled` mapping only `feat/add-demo-release` to `false`, publish that guarded commit, then create and privately verify both branch-only false Preview switches. Remove the temporary guard and publish the ordinary candidate only after verification. Unspecified branches retain default deployment behavior; see [Vercel Git configuration](https://vercel.com/docs/project-configuration/git-configuration), checked 2026-10-18. This avoids changing shared/Production settings. The saved Supabase origin/publishable key match the inspected local archive; verify the actual new deployment separately. Sampled immutable/Preview page and API URLs redirect to Vercel SSO; verify reviewer access on the new target before active evaluation.

Match the Supabase project to the intended existing archive and verify the application's key category is publishable or legacy anon. No elevated key belongs in runtime configuration. Inspect only safe identity/name/scope/type/status metadata in reports; enter values privately. Creating a correctly named Config entry resolves the earlier public-prefix/type setup issue without introducing code aliases.

Create and identify a new ordinary Preview after setting changes. Existing deployments retain their prior variables; branch-specific Preview variables override shared Preview values. These rules are documented in [Vercel environment variables](https://vercel.com/docs/environment-variables), checked 2026-10-17. Production and Preview are separate [environments](https://vercel.com/docs/deployments/environments). Verify the actual deployment's switches before valid non-paid submissions; a newly enabled key or an old direct URL may still allow charges.

## 4. Verify the Same Archive Read-Only

First identify the actual Preview's nonsecret Supabase project reference/origin and key category. Match any local smoke environment to that configuration; a local result alone cannot establish Preview access.

```sh
node --env-file=.env.local scripts/verify-archive.mjs
```

The script checks projected columns on eight tables with `limit=0`, plus one nonmatching search RPC. It prints statuses/safe codes only. It does not count rows, establish exact emptiness, compare full deployed types, or prove RLS completeness. Run only against the intended configuration and record its date/project match.

In a separately authorized SQL Editor or CLI management context, execute [inspect-archive-release.sql](../scripts/inspect-archive-release.sql). It contains only SELECT inspection, returns counts for all eight tables, inspection-role/bypass status, effective anon schema/table privileges, RLS flags/policies and exact search-function metadata. It is not a migration or an application RPC. With an already authenticated CLI supporting these flags, use the independently verified project reference:

```sh
supabase db query --linked --project-ref "$SUPABASE_PROJECT_REF" --file scripts/inspect-archive-release.sql --output json
```

Review that the inspection role can establish authoritative counts: superuser/bypass-RLS, or verified table ownership with applicable forced-RLS behavior. A restricted inspector's zero counts do not prove emptiness. Expect all eight counts zero for historical A, anon schema usage/SELECT only, enabled RLS with intended all-record SELECT policies, and the single expected `STABLE SECURITY INVOKER` function with exact anon EXECUTE and no PUBLIC EXECUTE. Inspect existing policy/grant differences rather than resetting them. The SQL inspects metadata privileges, not Data API exposure/row-limit settings; verify `thangka` exposure and a row limit of at least 201 separately. Follow [retrieval verification](retrieval-setup.md#verification-order) for full schema/type comparison or drift.

Pair current authorized counts/permissions with actual anon reads in the same project. Missing account/role evidence leaves A06 open. Do not reinitialize the schema, blindly reapply migrations, import synthetic records, create visitor Storage, or clear future curated data to reproduce historical A.

## 5. Non-Paid Deployment Checks

Verify homepage language/title, hydrated empty state, reachable composer, no horizontal overflow and deliberate reload. With the exact target confirmed disabled, submit one valid text and one valid selected-image request: expect 503/generation_unavailable and 422/image_understanding_unavailable respectively, with no provider access. Missing Supabase/provider settings are unavailable configuration, not empty retrieval.

Invalid-request probes can run independently of provider enablement; never use valid chat questions as non-paid probes on an uninspected deployment:

| Probe | Expected application outcome |
| --- | --- |
| `GET /api/chat` | 405; not a POST cache-contract check |
| `POST`, `text/plain`, `{}` | 415/unsupported_media_type |
| `POST`, `application/json`, `{}` | 400/invalid_request |
| `POST`, `application/json`, ASCII `{` then spaces, exactly 4,000,000 UTF-8 bytes | 400/invalid_request |
| Same malformed body, 4,000,001 bytes | 413/request_too_large |

All four POST outcomes must be JSON with `Cache-Control: no-store`. Distinguish gateway errors from application errors; gateway 413 at the accepted byte cap fails compatibility. Vercel's published function request/response limit is 4.5 MB; inspect actual outcomes and effective duration rather than inferring compatibility from source declarations. See [function limits](https://vercel.com/docs/functions/limitations), checked 2026-10-17. Successful malformed probes do not test maximum-size valid image generation.

## 6. Prepare the Active Smoke Before Funding Approval

Generate private local synthetic visitor inputs without any service call:

```sh
node scripts/prepare-demo-smoke.mjs
```

The five drawings and original byte/hash manifest are under ignored `evaluation-results/demo-release-inputs/`. They contain a red square, blue circle, green triangle, yellow diamond and a separate purple-cross draft. The first drawing has a small bottom-right `K7` code. These are test drawings, not real artworks, archive records or product examples. Before paid dispatch, freeze the actual browser-prepared copies/hashes/dimensions as well; regeneration or source hashes alone do not certify those copies. Preview the drawings locally, never upload them to the archive or Storage.

Use exactly these questions/actions with no fixture markers:

| Case | Session and fixed action | Expected review |
| --- | --- | --- |
| P01 | Fresh desktop conversation: `欣赏唐卡时，可以从哪些方面观察？请区分一般知识和数据库提供的信息。` | Relevant qualified general explanation; no fabricated archive evidence |
| P02 | Independent fresh desktop conversation: `数据库里有没有作品《空库验收合成作品17》？如果没有找到，请明确说明，不要猜作者和年代。` | Literal full-name completed-empty lookup, no invented records/sources; skipped lookup fails |
| P03 | New mobile page; attach files 01–04 in order: `这是四张人工绘制的测试图，不是真实唐卡。请按图片编号分别描述可见的颜色和形状，无法确认的细节请说明，不要认定为档案中的作品。` | Four associated observations; honest visible content/uncertainty and no archive identity/reference download |
| P04 | Same page, no selected historical pictures: `仅根据刚才已经保存的观察，按图片编号总结这四张图；不要声称重新查看了图片。` | No historical pixels sent, prior uncertainty retained |
| P05 | Same page, image 1 unselected: `第一张图右下角的小字代码是什么？如果之前没有观察到，请先提示我重新查看那张图。` | Run only if the code is absent from all available observations/history; targeted explicit reread, no guessed code |
| P06 | Select file 05 as a new unsent draft and type `这是独立的新草稿，请保留这张紫色叉号图。`; activate P05's reread button | One counted new attempt uses P05's question and image 1 pixels, excludes/preserves the newer text/image draft, atomically replaces successful observations; code may remain honestly unreadable |

Before activation, bind this plan and prepared inputs to an exact Preview/deployment, agree reviewer audience, start/end window, available funding and owner participation. Proposed maximum: six dispatched submissions/twelve provider calls for the entire batch. This is a call limit, not a currency guarantee. Allocate owner desktop P01–P02 and mobile P03–P06 inside those six submissions, or record missing hands-on participation. The assistant may operate an agreed batch, but cannot label that owner/native-device acceptance.

Use verified existing platform access controls as appropriate to the agreed audience, checking direct page/API URLs; do not add a product login. Available access methods depend on actual project configuration/plan. See [deployment protection](https://vercel.com/docs/deployment-protection), checked 2026-10-17. Do not enable/publicize ongoing funded access as a side effect of a short test.

## 7. Execute Once and Record Every Dispatch

Review each result before the next submission. Stop at the first failure, timeout, unmet prerequisite or reached allowance. If P03/P04 already captured `K7`, P05–P06 are not run; do not force clarification or replace cases. Count failed/cancelled/timed-out dispatches and reread; no automatic retry, repair or replacement is authorized. Later hands-on review does not add free submissions.

Keep a safe ledger with case, dispatch time, deployment/session, status/error, elapsed time, pass/fail/not-run reason, observed stage/call/token totals, unknown activity and provider-console expenditure window. Reserve up to two provider calls per dispatch until reliable evidence resolves actual usage. `ai_completion` exists only after successful parsing; missing logs do not mean zero activity/cost or restore allowance. Available measured expenditure can remain pending/unknown; never fabricate zero billing from absent logs. Keep raw synthetic outputs/prepared copies in ignored local evaluation artifacts, with no credentials/base64 in the shared report.

Review semantics: picture association, relevance, visual uncertainty, honest retrieval status and no invented archive/source claims. Valid JSON alone is insufficient. For P02 require reliable trace/query evidence of the exact lookup; text claiming “no matches” without completed retrieval does not pass. If existing safe metadata cannot establish this, leave that criterion open rather than adding production debug output.

Copy/reload/scroll on completed replies needs no extra model question. Exercise rich source navigation and repeated controls in isolated fixtures or disabled Preview. Record native keyboard/selection/orientation/browser details separately from automation. These small synthetic live samples do not measure real Thangka accuracy or statistical reliability.

## 8. Close or Roll Back the Test Window

Record the before-state and rollback action before activation. At test end/failure, set both test-deployment model switches false and create/identify the disabled replacement, unless an ongoing enabled scope has been explicitly agreed. Preserve existing Production mapping/settings. If a reviewed alias was changed, restore its recorded working target, or use the agreed disabled baseline when no prior target exists.

Older deployments retain their previous configuration. List enabled test deployments/direct URLs and retire or control their page/API access using reviewed platform actions; merely changing variables or moving an alias is insufficient. Verify the latest and older direct URLs through configuration/access inspection without unbudgeted provider questions. Account-side rollback/retirement is an actual A15 check, not a documentation pass. Do not reset policies, delete records or overwrite local settings.

Record A's remaining items explicitly, retaining B and whole-change completion as deferred/open. Bind evidence to the final commit/deployment/configuration/archive/grant state; rerun affected checks after changes and state why unchanged evidence can be reused. A successful historical empty-archive run never requires clearing newly curated data for later B.

## 9. Independent Reread Supplement

The owner authorized additional funding if needed and assistant operation; native-device review remains separately deferred. After the first batch, P05–P06 remain not run because K7 was already recorded. The independent R01–R03 batch below addresses that gap without relabeling or replacing those P cases. It uses the same protected project and exact 37af020 application source, a fresh 390×844 browser page, a new window of at most 60 minutes from activation, at most three dispatched submissions/six provider calls, sequential review and no retries/replacements. Combined with the first batch, the conservative ceiling is seven submissions/fourteen calls; this is an explicitly recorded use of the owner's additional allowance, not an extension hidden inside the original six-submission batch.

Freeze and inspect evaluation-results/demo-release-reread-inputs/: a new self-drawn first red square with bottom-right M4P8, plus copies of the prior blue circle, green triangle, yellow diamond and unsent purple-cross draft. Freeze actual hosted Worker-prepared bytes/dimensions before activation. These are synthetic visitor inputs, not archive assets. No observations/history may be removed or edited to satisfy eligibility.

| Case | Fixed action | Required review |
| --- | --- | --- |
| R01 | Attach drawings 01–04 in order: `这是四张人工绘制的测试图。请按图片编号，只说明每张图中央图形的主要颜色和形状。` | Four correct associated observations, relevant qualified answer, no archive identity/source invention |
| R02 | Same page, no selected historical pictures: `第一张图右下角的小字代码是什么？如果之前没有观察到，请先提示我重新查看那张图。` | Run only if M4P8 is absent from every model-visible observation/history item. Target image 1 explicitly; no pixels sent or invented code; genuine reread clarification |
| R03 | Hold image 05 and text `这是独立的新草稿，请保留这张紫色叉号图。` as a newer unsent draft; activate R02's reread button | Exactly one new counted request captures R02's question and image 1 only, excludes and preserves the newer draft, returns a successful observation superseding image 1's previous observation, and retains other image associations |

Stop at the first failed response, timeout, unmet next-case prerequisite or cap. R03 permits an honestly unreadable code; guessing or fabricated archive identity fails. Do not force omission in R01 or alter captured context; a naturally scoped question is not permission to trim its observations. Use the same per-dispatch usage/unknown-activity accounting and non-submitting copy/resize/reload checks. Before activation snapshot the actual branch alias; on closure restore that exact disabled target, set/read back both branch switches false, remove this batch's enabled deployment by exact ID and verify direct page/API retirement. Preserve Production/shared settings/data/Storage and remove temporary OIDC/link files. Record results separately in verification.md.

## 10. Remaining Owner Device Review

Automated local/deployed A checks, including the independent R supplement, have passed. Task 3.6/A14 is separately deferred to the owner and remains A's only open gate. Arrange a time when the owner can operate their normal desktop browser and native phone browser; no new funding approval is required within the existing additional allowance, but bind any live actions to that participation window and exact protected Preview first. Keep Preview defaults false between sessions.

For that future review, a proposed compact allocation is one desktop text submission and one mobile permitted-image submission (maximum two submissions/four provider calls); freeze the actual questions/image before activation. This allocation is a future participation plan, not a dispatched batch. On desktop, check Chinese input/selection, a readable reply and copying into another text field. On the phone, check native picture selection/preview, Chinese keyboard and reachable send control, response scrolling, portrait/landscape reading position, copying and deliberate reload clearing the conversation/images/draft without replay. These control actions add no questions. Record browser/OS, actual device versus emulation, pass/fail and any reproduced issue; stop at first failure. Restore/retire the temporary enabled target as in section 8. Close A only after the actual owner results; keep B and whole-change completion deferred until their separate inputs exist.
