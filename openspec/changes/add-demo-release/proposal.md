# Change: End-to-end demo acceptance and deployment

## Status

Item 8 of 8; milestone A implementation was approved on 2026-10-17 when the owner confirmed continuation immediately after the explicit request to start A under this proposal. Work uses `feat/add-demo-release`, created from clean `main` at `c841ea4`. The owner confirmed real archive data remains unavailable and supplied the existing deployment URL, [jinlan-thangka.vercel.app](https://jinlan-thangka.vercel.app/). Public GET/invalid-POST checks pass. Subsequent [connected inspection](verification.md#connected-vercel-inspection) identifies the project, current Production `main@c841ea4`, saved configuration and sampled access; the authenticated CLI follow-up confirms root/default build settings and actual 60-second chat duration, while configured-disabled and no-service-credential Preview checks now pass; the subsequently owner-authorized automated P01–P04 batch and rollback passed. Original P05–P06 remain not run because their prerequisite was unmet; the independently authorized R01–R03 supplement now passes that missing-detail/reread/draft flow. The owner subsequently reported no issues after the desktop/mobile checklist, completing A with device/browser/URL/action provenance limits recorded. B inputs and whole-change completion remain deferred/open. See [active results](verification.md#active-results-and-usage).

Delivery has two proposed milestones: A, an empty-archive preview with engineering and deployed-flow acceptance; B, real-data/domain acceptance when curated material becomes available. Passing A does not pass B or complete the whole change.

After an initial five-name Production list with unprefixed Supabase names, the owner reported correcting the configuration and redeploying. The later list explicitly showed `NEXT_PUBLIC_SUPABASE_URL`, `DEEPSEEK_API_KEY` and `DEEPSEEK_MODEL` in Production and Preview; another masked entry omitted its name, and the generation entry was truncated. Connected inspection has since confirmed both canonical Supabase Config values, the model and saved scopes; text is enabled and vision is absent. The CLI follow-up confirms deployment environment names and the actual 60-second chat function; historical Production values are not returned, while the new Preview's false switches and actual unavailable behavior are verified; see the deployed results in verification.md. The [post-redeployment HTTP recheck](review.md#owner-reconfiguration-and-redeployment-recheck) passes public reachability and non-provider request rejection/boundaries; it does not establish database access or active AI. No replacement project or real data is needed.

## Why

The seven feature increments are already in local `main`, but integrated owner acceptance and deployed feature acceptance remain unverified. The existing public site is reachable; its exact revision and active capabilities have not been established. An empty archive permits release engineering and a working preview while leaving real retrieval, citation support and artwork-identification quality explicitly unevaluated.

## What Changes

- Define acceptance that distinguishes deterministic synthetic checks, actual empty-archive/model checks, deployed checks, owner/device review and deferred real-data results.
- Bind evidence to the tested deployment/configuration/archive state and refresh affected checks for the final candidate; adding later data must not require clearing it to repeat the historical empty-archive milestone.
- Reuse existing conversation, image/reread, source/copy and failure coverage; add tests only for demonstrated integrated gaps. Synthetic evidence stays isolated from the real archive and ordinary deployments.
- Prepare a release runbook and result record for the existing Vercel project, including environment scope, transport/duration compatibility, deployment identity and rollback.
- Check unconfigured interface/unavailable states, then initially configure Supabase and explicit disabled provider switches for the branch Preview and create a new deployment. Verify that configured-disabled preview before the active empty-archive batch. Missing settings are not empty retrieval results, and a disabled preview alone does not pass active conversation acceptance.
- Default the test deployments back to both model switches false after the run, preserving the existing production state; ongoing enabled scope is a separate explicit decision.
- Carry forward actual source support, numbered/ordinary-photo identification positives and similar-work negatives as milestone B, retaining their evidence and permission prerequisites.

## Impact

- Affected specs: `demo-release` (new capability).
- Affected code/systems: Existing browser tests/test-only upstreams where gaps are demonstrated, release documentation and reviewed Preview configuration of the existing Vercel project. Fixes preserve accepted capabilities; new behavior/architecture requires the normal proposal workflow.
- Shared constraints: follow [project context](../../project.md); no login, administration UI, Excel importer, live web search, or theme switcher is added by this proposal.

## Dependencies

All seven preceding changes are implemented and present in local `main`. Each retains its behavior tests and service access responsibilities. This change verifies integration and deployment without schema changes, reapplying installed SQL or importing data.

The owner confirms the archive remains empty; project records also show an empty production reference manifest and removed curated pictures. Milestone A needs no replacement records or curated bucket. Successful empty reads must remain distinct from access failures. The existing archive smoke script checks HTTP/column access, not exact emptiness, complete grants/RLS or domain accuracy.

Milestone B retains numbered-positive, ordinary-unnumbered-positive and visually-similar-different-work-negative cases, including actual curated-asset permissions/access for reference verification. Missing material is deferred/not run, not removed from full release acceptance. Real source/identity quality cannot pass on synthetic positives or an empty archive.

Requirement 7 is locally implemented and archived at the owner's request; the formal [answer-sources capability](../../specs/answer-sources/spec.md) covers source details, exact citation navigation and complete plain-text copying with a manual fallback. Its [verification record](../archive/2026-10-17-add-answer-sources/verification.md) carries forward hands-on owner review, native-device behavior and final integrated acceptance. Implementation-stage archival of requirements 6–7 does not establish a deployed release or approve this draft.

## Delivery and Review

The [design](design.md), [acceptance matrix](acceptance.md), [tasks](tasks.md) and [readiness review](review.md) define the proposed implementation and evidence boundaries. A requires applicable local, actual deployed and owner hands-on passes. B and whole-change completion remain open while real material is unavailable. Any later owner-requested scope change must explicitly record remaining obligations.

## Owner Inputs and Decisions

1. The owner supplied [the existing deployment URL](https://jinlan-thangka.vercel.app/). Inspect dashboard project identity, branch mapping, variable scopes and deployed commit before preparing a concrete deployment action; the public address alone does not establish those settings.
2. Milestone A implementation approval is recorded above and in [verification.md](verification.md). No repeated proposal approval is needed within that scope; new product requirements follow the normal workflow.
3. Before deployed provider activation, agree reviewer access, test window and funded allowance. The proposed smoke is at most six dispatched submissions/twelve provider calls across the batch, counting failures/timeouts and reread, stopping at the first failure/unmet prerequisite/cap without automatic retry or replacement cases. Test deployments end disabled by default unless ongoing scope is explicitly agreed. Existing local empty-archive stabilization authorization remains valid within its original scope; it does not establish deployed/public funded access.
4. Schedule desktop/mobile live review within the bounded P01–P06 batch; repeated control/source exercises can use isolated fixtures or a disabled Preview. Extra active questions still need available agreed scope. No device purchase or audience dataset is required. Real records/assets and domain judgments remain later inputs for B.
