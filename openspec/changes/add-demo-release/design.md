# Demo Release Design

## Context

Requirements 1–7 are implemented, archived and included in local `main`. On 2026-10-17 the owner requested continued work with an empty archive and a new branch, then approved starting milestone A after the explicit proposal approval request. The owner supplied [the existing Vercel deployment URL](https://jinlan-thangka.vercel.app/) and reported corrected configuration/redeployment; public GET/invalid-POST checks pass as recorded in [review.md](review.md). Subsequent [connected inspection](verification.md#connected-vercel-inspection) identifies the existing project, current Production revision and saved shared settings. The 2026-10-18 authenticated CLI follow-up confirms root/default build settings, the linked Production branch, captured environment names and actual 60-second chat function. Historical variable values are not returned and no release-branch Preview exists yet. Deployed funding and B inputs remain separate decisions.

The app already implements version-2 text/image requests, page-local pictures, selective history/reread, structured retrieval, two-call model orchestration and answer-local source/copy actions. Production reference grants remain empty. Browser fixtures and the guarded reference alias are test infrastructure, not a product demo mode.

## Goals and Non-Goals

Goals are a reviewable empty-archive preview, reproducible engineering acceptance, concrete deployment/rollback evidence and retained real-data obligations. Reuse current UI, contracts, tooling and viewport baseline.

No data importer, schema migration, visitor persistence, login UI, application permission system, live search, theme switcher, analytics, vector search, model change or global quota service is added. Real archive preparation stays deferred. Tests do not establish domain accuracy or measured audience coverage.

## Decisions

### 1. Separate milestone outcomes

| Milestone | Required evidence | Completion meaning |
| --- | --- | --- |
| A: Empty-archive preview | Local checks/build, isolated integrated browser checks, actual deployed configuration and authorized empty-archive flows, owner hands-on review | Engineering and empty-archive operation accepted for the recorded preview/revision |
| B: Real-data acceptance | Actual reviewed records/sources, permitted reference assets, positive/negative identity cases and independent judgments | Retrieval, citation support and identity results accepted for the agreed samples |

Track A as a milestone rather than archiving the whole change. B stays deferred/not run until its inputs exist. Whole completion requires both and the agreed Vercel target verification. Small samples do not establish general recognition accuracy.

Within A, separate configuration-only deployment from active model acceptance. Disabled switches permit interface/unavailable checks, not successful generation. A successful empty query differs from no query, invalid output and unavailable retrieval; preserve those distinctions in presentation, export and results.

### 2. Audit existing tests before adding coverage

Map [acceptance.md](acceptance.md) to the existing suites. First rerun them and identify concrete integration gaps. A new `tests/browser/demo-release.spec.ts` is justified only for an uncovered composed journey, not repeated assertions for each existing control.

The release core journey must run through the real Next.js route at all eight core viewports: text question, four-picture turn, summary follow-up without historical pixels, missing-detail clarification, explicit reread beside a newer draft, answer copying and deliberate reload. Record its ordered requests and state transitions. Reuse existing assertions/helpers or extend the current suites where possible; separate feature cases do not by themselves prove this ordered integration. Rich source navigation and failure paths can retain their existing dedicated suites. This matrix uses isolated upstreams; the paid deployed smoke is one bounded batch, not six submissions per viewport.

Deterministic integration uses the actual Next.js route with isolated server-process upstreams. Client intercepts and the Vite harness retain narrower claims. Reuse network isolation and existing traffic counters to check no real services, extra source/copy traffic or unselected historical pixels. Never enable fixtures on Vercel, seed remote records or create visitor objects.

Run `npm run check`, then `npm run test:e2e`, then a separate ordinary `npm run build` with generation, vision and `JINLAN_BROWSER_FIXTURES` explicitly false. Fixture/ordinary builds share `.next` and must run sequentially; ordinary output is last. Read installed Next.js guides before framework changes.

### 3. Verify the existing project's Preview configuration

Inspect project/repo/root, production branch, current successful deployment, Preview overrides, Node/build settings, effective function duration and access. Record identifiers and setting names/status without values. Check whether branch publication triggers deployment before preparing that concrete release action.

The owner reported correcting the earlier unprefixed Supabase names and completing a redeployment. Connected inspection has since confirmed saved Supabase Config values matching the inspected local archive, the accepted model and shared Preview/Production scopes. Text is enabled, vision is absent and no release-branch deployment or override exists. The authenticated CLI follow-up confirms root/default build settings, the linked Production branch, captured environment names and actual 60-second chat function; historical variable values are not returned and the new Preview still needs verification. The setting table below retains the intended states and exact names read by the code. In the accepted local implementation, `src/proxy.ts` keeps the page available without Supabase settings. With missing provider settings, valid text returns 503/generation_unavailable; valid selected-image input with vision unset returns 422/image_understanding_unavailable before provider access. These are source-based expectations, not fresh remote POST results. Missing settings do not establish a successfully queried empty archive.

The proposed target is a Preview of `feat/add-demo-release`, preserving production mapping. Treat the supplied public URL as the current deployment reference, not an authorized mutation target or proof of the new branch's Preview identity. Inspect branch-specific versus shared Preview settings and disclose any change affecting other deployments before mutation. Do not assume an existing project has a successful first deployment. Vercel documents first deployments as production even without `--prod`; inspect state before relying on Preview semantics. See [Vercel environments](https://vercel.com/docs/deployments/environments), checked 2026-10-17.

| Setting | Configuration-only preview | Active empty-archive preview |
| --- | --- | --- |
| Node/build | Node 24.x; Next.js server build | Same, verified on deployed revision |
| Public Supabase URL/key | Intended existing project; publishable or legacy anon in correct Preview build scope | Same empty archive/scoped reader |
| `DEEPSEEK_MODEL` | `deepseek-flash` | Same accepted model/mode |
| `DEEPSEEK_API_KEY` | May remain absent; no provider calls | Configured server-side by owner/authorized account access |
| `DEEPSEEK_ENABLED` / `DEEPSEEK_VISION_ENABLED` | Both `false` | Both `true` only in agreed enabled scope/window |
| `JINLAN_BROWSER_FIXTURES` | Unset or `false` | Unset or `false` |
| Reference grants | Ordinary empty production manifest | Same; no reference download expected |

This table describes planned configured states, not the current reported setup. After the detailed proposal and concrete target action are approved, first set the intended branch Preview Supabase URL/publishable key, explicit false model/vision switches and accepted model name. Leave the provider key absent or disabled during setup. Create a new Preview deployment, verify configuration/archive access, then consider the separately scoped active batch. Use existing local values privately; do not enable paid generation to diagnose missing database configuration, because planning can spend before a later retrieval failure. The [AI setup guide](../../../docs/ai-setup.md#vercel-configuration-starting-point) lists these settings.

Public settings are embedded at build time and require a new build/deployment after changes, as documented in the installed Next.js environment-variable guide. Do not pull remote variables over the owner's `.env.local`. Leave local switches unchanged; use process-scoped settings for checks. Inspect names/scopes and results without publishing keys or visitor payloads.

For A06, identify the actual Preview project's nonsecret Supabase origin/reference and application key category, and confirm that any local smoke uses that same project/configuration. A passing `.env.local` check alone does not prove the Preview's connection. Pair scoped anon table/RPC reads with fresh read-only owner/admin counts for all eight business tables and inspected grants/RLS/policies in that same project; follow the existing [retrieval verification order](../../../docs/retrieval-setup.md#verification-order). Record inspection role, date and counts/metadata without keys or business contents. An anon empty result can be caused by RLS and is not authoritative proof of empty business tables. Administrative inspection stays separate from the application's publishable/anon reader; no elevated key enters runtime configuration. If count/permission inspection is unavailable, keep A06 open rather than replacing it with HTTP success.

### 4. Verify actual transport and deadline compatibility

The application caps serialized incoming requests at 4,000,000 bytes, with `maxDuration = 60`, a shared 55-second server deadline and a 65-second client attempt including encoding. Four active prepared pictures are each bounded to 500,000 bytes. Original files may reach 5,000,000 bytes because browser preprocessing occurs before transport.

Vercel currently documents a 4.5 MB function request/response limit. The application request cap is below that published limit, but deployed browser transport, Worker/Sharp execution and effective duration still need verification. See [Vercel function limits](https://vercel.com/docs/functions/limitations), checked 2026-10-17. The source duration declaration does not certify the actual project setting.

Probe exact and one-over application request sizes with `Content-Type: application/json` and ASCII bodies consisting of `{` followed by spaces. At exactly 4,000,000 UTF-8 bytes the expected application outcome is HTTP 400 / `invalid_request`; at 4,000,001 it is HTTP 413 / `request_too_large`. Both must return JSON and `Cache-Control: no-store` without provider access. This checks byte admission/parsing, not successful maximum-size image generation. If a gateway handles either probe instead, record its response and the compatibility failure separately; do not treat a generic 413 as a pass for the exact-cap case. Preserve existing deterministic coverage for non-JSON gateway 413 correction. Use four permitted synthetic pictures for active deployment acceptance. Record byte counts, elapsed times and safe status/usage metadata, not base64 or secrets.

### 5. Bound the active deployed smoke

The six-submission set in [acceptance.md](acceptance.md) needs no real records or curated bucket. Use permitted synthetic visitor pictures with known visible features and no real-work identity expectation. Freeze questions, processed inputs, session boundaries and expected uncertainty before running. P01 and P02 use independent fresh conversations; P03–P06 share one page. Before P05, verify its fixed target detail is actually absent from the observations/history available to the model and its picture is unselected. If this precondition is unavailable, stop with P05–P06 not run; do not fail an appropriate summary answer or spend extra calls to force clarification.

At most twelve provider calls are possible; clarification may end after one. Count every dispatched attempt, including failed/timed-out requests and reread, toward the submission allowance; cancellation does not refund it. Stop at the first failed case, unavailable prerequisite or reached cap and mark dependent cases not run. No automatic repair/retry, substitution or unreviewed rerun. Preserve failure evidence and review the remaining authorized scope before a new run. Record dispatches, observed completions/tokens, unknown activity, elapsed time, failures and available measured expenditure as detailed below. Call limits are not an enforced currency ceiling. Agree deployed audience/window/funding before activation, while preserving existing local stabilization authorization within its original scope.

Schedule A14's active hands-on actions inside P01–P06 before activation, for example P01–P02 on desktop and P03–P06 on mobile with the owner operating those cases. Additional control/source/selection exercises use the isolated fixture environment or disabled Preview. Copying/scrolling/reloading completed live replies adds no model submission. If the owner cannot participate within the batch, record the missing hands-on result and arrange any additional active allowance before dispatch; the later checklist position of A14 does not grant free extra questions. Six successful smoke submissions leave no submission slots for a second active desktop/mobile walkthrough.

Record a dispatch ledger separately from observed provider completions. The existing `ai_completion` log in `src/lib/answers/provider.ts` is emitted only after successful envelope/content parsing; failed, aborted or malformed stages may have spent tokens without such an event. Missing events therefore mean unknown call/usage totals, not zero. Conservatively reserve up to two provider calls for each dispatched attempt until reliable provider/account evidence resolves it, and do not reclaim allowance from missing logs or cancellation. Report observed stage completions and available numeric usage, unknown portions and the bounded upper estimate separately. Provider-console expenditure can be reported as unavailable or pending reconciliation with its time window; do not invent a measured amount or describe the configured token/call cap as expenditure. This proposal adds no telemetry or provider-account API.

The existing per-runtime admission limit is not a global serverless quota. Prefer existing platform Preview access controls after checking reviewer access; add no product login. See [Vercel deployment protection](https://vercel.com/docs/deployment-protection), checked 2026-10-17. Verify actual deployment URLs and direct `/api/chat` access rather than assuming a setting covers every URL. Wider/public funded access remains an owner decision.

### 6. Make deployment and rollback reviewable

After proposal approval, prepare `docs/demo-release.md` with target identity, environment matrix, procedure, hands-on checks and rollback. Record results in this change's `verification.md`: revision, deployment URL/ID, date, capability class, browser/device, evidence type, outcome and limitations. Use `passed`, `failed`, `not run` or `deferred`. Historical local passes are not fresh deployment results.

Bind every result to its commit, deployment ID, capability configuration, archive state/inspection date and reference-manifest version. A is a historical empty-archive milestone; B may later need a different archive and reference configuration. Before final acceptance, compare the final candidate with both evidence sets, identify affected checks and rerun those on the candidate. Application changes require the normal check/browser/ordinary-build workflow; deployment/configuration changes require their affected runtime/access checks, and grant/data changes require current support/access/domain checks. Reuse unaffected evidence with an explicit rationale. Do not require clearing newly curated data to recreate A: retain deterministic empty-archive regressions in isolation and verify the final live candidate against its actual populated archive. Neither old A passes nor a stable public alias automatically accept a later artifact. Any additional paid rerun follows the available explicitly agreed scope.

Before mutation, present the concrete commit, existing project, Preview target, setting names and access mode. Existing user authorization for that action is sufficient; ask only for missing decisions. Branch creation is already authorized; detailed proposal review precedes implementation under `openspec/AGENTS.md`.

The default end-of-test state is both model switches false on test deployments, with the pre-existing production mapping/settings preserved. Ongoing enabled access needs an explicitly agreed scope; proposal approval alone does not select it. Rollback restores the recorded prior working deployment/mapping where one exists; otherwise retain/redeploy a disabled baseline. A prior deployment may itself be enabled, so record and preserve its independently authorized state rather than assuming it is disabled. Restore reviewed settings and retire/control enabled test deployments that remain callable; verify direct URLs as well as the newest deployment. An environment change/new deployment alone does not establish that older enabled URLs stopped accepting funded requests. Account for any provider-bearing verification attempt in the same allowance; use configuration/access inspection for retirement checks without unbudgeted questions. Do not delete records, rerun initialization or broadly revoke policies. Retain safe failure evidence.

## Risks and Trade-offs

- Broad existing coverage favors reuse; add only demonstrated integration gaps.
- Valid model JSON can still invent archive facts; human semantic review remains required.
- Synthetic source panels cannot prove real citation support; retain B's checks.
- Emulation misses native keyboard/selection behavior; record hands-on results and reviewed limits.
- Project identity and deployed funding are pending; local proposal/baseline work proceeds independently.

## Migration Plan

No database or visitor-Storage migration. Preserve schema/search/read access and empty business tables. Any access drift requires inspection and a targeted reviewed correction, not blind reapplication of `database/migrations/`.

## Open Inputs

Dashboard inspection access for the supplied Vercel URL; enabled Preview audience/window/allowance; owner hands-on observations. A-stage proposal approval is recorded in [verification.md](verification.md). Actual records/assets/domain judgments remain B inputs.
