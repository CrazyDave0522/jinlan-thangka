## Context

Before this change, `chat-message.tsx` rendered text evidence and disabled source/copy placeholders. `image-answer.tsx` duplicated evidence summaries and separately rendered picture/group/identity/reference-image sections. Evidence markers were inert text. The reference artwork places a source disclosure and copy action below answer content.

The public `SourceCitation` supplies `linkTable`, `linkId`, `sourceId`, `title`, `supportedField` and `locator`. It does not supply optional author/year/publisher/URL fields from the source table. `AnswerReference` supplies owner, label, field/value and review/attribution status. Image replies add observations, groups, comparisons and reference-image identities; displayed turns retain their captured `ImageRequest`. `canonical`/`canonicalImage` are bounded context strings, not complete presentation exports.

Preserve the accepted [grounded-answer design](../2026-10-16-add-grounded-answers/design.md), [image contracts](../2026-10-17-add-image-interpretation/contracts.md) and [identity policy](../2026-10-17-add-image-interpretation/identification.md). This increment needs no additional server/database authority.

## Goals and Boundaries

- Make claims inspectable against their actual delivered record/field/source associations.
- Share source rendering between text/image answers while preserving uncertainty and identity semantics.
- Copy a complete single answer with accessible feedback and manual recovery.
- Preserve the empty landing page, page-local conversation, selected-image behavior and existing request/context budgets.

This increment does not expand response/source fields, add external links or source-document browsing, render curated pixels, re-fetch evidence, alter generation/prompts/canonical strings, persist history or resume deferred data preparation. A delivered source association remains metadata, not proof that its document semantically confirms every claim.

## Decisions

### 1. Inline disclosure and faithful field details

Place one initially closed disclosure in each assistant card, below answer/picture-group content and above copying. Use the shared Button and shadcn `base-nova` Collapsible, adding the latter through the configured CLI during implementation. Preserve shared defaults, semantic colors, theme spacing/type/radius utilities and Lucide icons.

A summary such as `查看来源 · 3 条档案依据 · 1 项参考图核对` counts E entries separately from R entries, omitting zero categories. Do not call the sum a count of confirmed sources. Hide the disclosure if both collections are empty. A supplied legacy `sourceLabel` is display text and cannot create a validated source entry.

Replace duplicated always-visible `依据摘要` lists with one shared disclosure. Show the following for each delivered E entry:

| Data                    | Presentation                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Key and label           | `[E1]` plus delivered record label                                                                                                    |
| Owner identity          | Chinese record type plus UUID; association owners show artwork UUID, artist UUID and role                                             |
| Field/value             | Existing Chinese field/value mappings; null/empty/whitespace-only display text is explicitly unspecified without changing source data |
| Review/attribution      | Delivered non-null statuses; absent status means the status was not supplied, rather than an inferred pending/disputed/verified state |
| Source association      | Delivered title, source UUID, relationship UUID, supported-field scope and locator                                                    |
| Missing title/locator   | `未记录标题` / `未记录引用位置`, rather than invented publication/page details                                                        |
| No source links         | `仅数据库记录，暂无字段来源。`                                                                                                        |
| Unspecified field scope | `未限定支持字段`, without implying field confirmation                                                                                 |

Preserve all source-link entries in their deterministic delivered order. Deduplicating by title/source UUID could discard distinct pages, scopes or conflicts, so keep each actual association. Do not hide pending/disputed rows or imply all associated documents independently confirm the answer. Render React text rather than HTML/Markdown or automatic links. Record UUIDs identify evidence; this change adds no record-detail route.

Describe these entries as the evidence used for this answer, for example `本条回答使用的依据`, rather than promising a live database view. If later retrieval returns changed data under the same record/source/link identities, the earlier answer's entries/export stay unchanged and the new answer uses its own fresh result. Do not deduplicate/cache source objects across answers by UUID alone. Opening a disclosure never refreshes evidence; later normal chat requests still perform their accepted fresh retrieval.

Explicitly test null, whitespace, empty arrays, zero, false and distinct unknown/not-recorded enums. Do not use truthiness to replace meaningful zero/false values. Presentation-only blank handling must not change field values, proof substrings or canonical message text.

### 2. Answer-scoped navigation and focus

Give each target and marker occurrence an answer-local identity, reference kind/key and occurrence suffix. React `useId` may provide the instance prefix; raw E/R keys and mutable message indices are insufficient. Repeated E1 markers in one answer have distinct origin identities, and keys in different answers never share targets.

Use keyboard-operable controls named, for example, `查看依据 E1：作品说明` or `查看参考图依据 R1`. Activation records the exact origin, opens that disclosure and, after content mounts, focuses a `tabIndex=-1` target and scrolls it into the existing conversation scroller. Use scoped refs and explicit pending navigation, not arbitrary delays/global selectors. Do not require animated scrolling or move the composer/outer page out of reach.

Provide `返回引用` for the last initiating marker. Direct disclosure opening creates no fictitious origin. Returning restores the exact occurrence's focus/visibility. Collapsing with focus inside returns focus to the disclosure control and clears pending navigation. None of these actions changes URL/history, submits a form, starts a request or changes conversation state.

Coordinate reading intent with the existing `ChatConversation` bottom-follow logic. Navigating old evidence or selecting fallback text suspends automatic follow, even if its target is near the bottom. A new response, changed draft/selection or recreated-but-equivalent `imageContext` object must not reset disclosure state, steal focus/selection or scroll away from the reading target. Programmatic scrolling must not re-enable follow through the ordinary near-bottom handler. Explicit visitor scrolling back to the latest messages or a new submission may resume normal follow. Add real-route coverage with a held pending response and old-source navigation; isolated message-component layout tests cannot verify this controller interaction.

Preservation applies to incidental updates, not deliberate input. If the visitor intentionally focuses the composer, selects a different picture or tabs to another control, respect that new target rather than restoring old-answer focus. Observation/source rerenders and clipboard timer/completion callbacks must never implement a general focus trap. Test background rerenders separately from intentional keyboard/pointer focus changes.

### 3. Distinct visitor-picture and archive-reference semantics

Keep observation links to original visitor pictures with existing stable display indices. Keep current/prior observations and general/archive sections distinct. General blocks acquire no archive marker. Reuse shared E navigation for archive blocks and validated identity field keys.

Show R entries in a separate subsection of the disclosure: key, delivered artwork label and actual artwork/image UUIDs, described as archive comparison inputs. Keep identified/candidate/insufficient state, identity method, actual supporting picture labels and supplied reasons in the answer's group presentation. Reference inputs alone prove neither identity nor authenticity. Do not load curated pixels, reveal object locators, synthesize access URLs or describe hashes as bibliography. Existing server permission/evidence gates retain authority.

R metadata alone is not the comparison explanation. Under each reference input, show every delivered comparison bound to it: actual group/original visitor picture, candidate label and artwork UUID, Chinese assessment, each proof's exact quote, kind, finding and visitor/reference regions, and all contradictions. Proof E markers use the same exact-target navigation. One R input can be shared by several comparisons, which must remain separate. E references used only by proofs still appear and are reachable. Empty proof/contradiction lists must not acquire invented support; model comparison assessment remains distinct from the server-owned identity state.

Add compact picture observation details for all returned current observations and only prior observations referenced by answer blocks. Retain their facts/readings/interpretations/limitations, Chinese region/kind/certainty labels, current/prior and analysis/verification origin, and whether a limitation affects identity. Keep material group identity limitations visible outside collapsed archive sources; observation details are picture observations, not bibliographic sources. Do not expose unrelated captured historical observations. In the group summary/details distinguish same-label candidates by artwork UUID and state the actual per-group candidate cap even for `not_requested` identity; do not rely only on global notices or identity reasons.

Each historical answer uses its stored message and captured image context, never the newest global observation pool. Later rereads must not rewrite its source details, uncertainty, export or original picture labels.

### 4. Pure single-answer plain-text export

Add a pure formatter receiving the displayed assistant message and its captured image context. Share field/status/reason formatting with the renderer. Do not scrape DOM, copy controls/status text, or change canonical generation/history contracts. Structured replies cannot use only compact `message.text`, which omits full source details and some displayed limitations.

The export preserves semantic order and includes:

1. Ordered paragraphs or clarification question with Chinese section labels, E markers and original picture numbers; current/prior observations remain distinct.
2. Relevant current/prior observation details and uncertainty, followed by image group search coverage, distinct candidate identities, per-group candidate caps, exact identity/candidate/insufficient/no-match state, method, supporting picture labels and limitation reasons.
3. Every E entry's owner/field/value, applicable statuses and actual title/source/link/scope/locator details, even when sources are closed.
4. Separate R comparison-input labels/identities and each actual comparison's group/picture/candidate binding, assessment, exact proof quotes/kinds/findings/regions and contradictions, without image bytes/access URLs.
5. Applicable server notices. Reread clarifications retain target picture labels; source-free answers have no fabricated source heading.

For unstructured supplied assistant messages, copy text and any supplied labelled evidence/general supplements; `sourceLabel` remains unvalidated display text. Exclude other turns, drafts, action labels, feedback and disclosure state. An empty assistant message has no enabled copy action. Use stable paragraph breaks with no silent truncation or new model-context limit.

Do not serialize image transport into the export: no attachment blobs/base64, request inputs, browser-generated object URLs, curated object locators or synthesized access URLs. This excludes transport data, not literal strings appearing in accepted archive fields, source titles/locators, observations or exact proof quotes. Preserve those delivered strings as inert plain text even when they contain URL-like syntax; do not silently redact them or turn them into active links. Current orchestration already excludes image storage/thumbnail locators from answer evidence. No new field projection or content filter is introduced.

Project image context narrowly: descriptor IDs/display labels resolve original picture references, and only block-referenced prior observations are read alongside the returned current observations. Never serialize the captured request's `messages`, `inputs` or unrelated observation registry, which also contains other user/assistant turns. Freeze synthetic message/context data in formatter/component tests and include distinct sentinels for unrelated turns and transport fields. A later real-route submission must retain the original canonical assistant text and original observation/descriptor values; copying must not write the presentation export back into `message.text` or alter a request snapshot. This check complements the no-extra-request assertion, which alone cannot detect mutations affecting future context.

### 5. Awaited clipboard feedback and manual fallback

Invoke `navigator.clipboard.writeText(exportText)` synchronously within explicit activation after obtaining an immediate page-wide write lease. The clipboard is shared across answers: per-message locks alone do not arbitrate overlapping writes. Keep at most one actual automatic write unresolved across the conversation, and retain ownership independently of its message's mounted state. Never read clipboard contents or request clipboard-read permission.

Announce pending status, then `已复制` only after fulfillment before the five-second waiting transition; keep the action's accessible name `复制回答`. Missing API, synchronous exceptions, insecure-context unavailability or rejected writes show `暂时无法自动复制，请手动选择下方内容复制。` and the complete export in the existing read-only Textarea, labelled `本条回答的复制文本` within its answer. A `选择全部` action explicitly focuses/selects that field for the visitor's native copy gesture. It needs no text entry or hidden editable element. Retry is explicit. An open fallback remains available after timely success rather than being removed while it may have focus/selection.

If another answer is activated while a write is unresolved, expose its own selectable export with `另一条回答正在复制，可先选择下方内容。` without issuing or queueing another write. Do not asynchronously dequeue a later write after its click: that would no longer run directly in its user gesture. Other source, draft and conversation actions remain usable.

After 5,000 milliseconds without settlement, show the pending answer's selectable text with `浏览器尚未完成复制，可先选择下方内容；待当前操作结束后再重试。` Distinguish waiting from failed/completed/cancelled. Keep the write lease until the underlying promise actually settles; a UI timeout or unmounted message must not free it early. Late settlement releases the lease and changes obsolete waiting/busy text to neutral `等待已结束，可再次点击复制。`, not stale success. It must not reopen a dismissed fallback or claim that another answer's blocked copy ran. Test this with controlled promises/fake timers. No automatic retry, hidden `execCommand`, persistence or service requests are introduced.

Provide `收起复制文本` to dismiss the fallback. Closing returns focus to the owning copy control, which must stay focusable even when another automatic write is blocked. Dismissal does not cancel browser work, release its lease or clear message/draft content. Explicit reactivation can reopen selectable text while busy without creating a second write. Timer/promise callbacks may update live feedback or reveal the fallback, but must not autofocus/select it. Do not infer that a native manual copy succeeded merely from selection or a key gesture.

| Write state/event                                              | Feedback and effect                                                                                             |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Explicit activation, no unresolved write                       | Acquire shared lease and invoke write synchronously; announce pending                                           |
| Fulfillment before waiting transition                          | Announce success for that mounted answer/attempt; release lease; leave open fallback until explicitly dismissed |
| Unavailable API, synchronous throw or rejection before waiting | Explain failure and offer selectable text without autofocus; release any acquired lease                         |
| Another activation while a write is unresolved                 | Offer its own selectable text with busy feedback; no extra write/queue                                          |
| Five-second waiting transition                                 | Explain unresolved state, offer text and retain actual-write lease                                              |
| Settlement after waiting                                       | Release lease and show neutral retry readiness; no late success, automatic retry, refocus or forced reopening   |
| Message unmount                                                | Stop message-local feedback/timers, retain shared lease until underlying settlement                             |

Order the deadline transition deterministically: fulfillment handled before entering waiting is timely; after waiting is entered, later fulfillment follows the late-settlement rule. Native write completion time is not inferred from an app timer.

The [W3C Clipboard API working draft](https://www.w3.org/TR/2026/WD-clipboard-apis-20260624/#dom-clipboard-writetext), checked on 2026-10-17, specifies asynchronous promise-based writing and no abort argument for `writeText`. The five-second threshold is an application feedback decision, not a browser deadline or cancellation mechanism. The app cannot retract an already issued write or guarantee ordering relative to manual copies or other applications; feedback must not promise otherwise. Its write lease prevents overlapping automatic writes issued by this page.

Use mounted/attempt guards for message-local status and clean up UI timers. The shared lease lives outside any individual message and releases on actual settlement even if that message was removed. New automatic copying requires a new explicit activation after release. The manual text remains selectable during waiting; native selection does not claim that pending browser work has been cancelled.

### 6. Component ownership

Expected boundaries, with filenames finalized during implementation:

- Pure helpers under `src/lib/answers` share semantic labels, missing-value handling and plain-text export.
- A shared answer-source component/context under `src/components/chat` owns disclosure, target refs and E/R markers.
- A copy-action component owns message-local feedback/manual fallback, while a page-owned coordinator arbitrates actual browser writes independently of message lifetime.
- `chat-message.tsx` integrates one set of controls per answer; `StructuredAnswer` and `ImageAnswer` retain block order and use shared markers/details. Existing visitor links/controller snapshots stay in place.
- `chat-interface.tsx`/`chat-conversation.tsx` provide the shared write coordinator and explicit source-reading versus bottom-follow coordination. This is a limited UI integration, not a change to request/snapshot semantics.

Only interactive components need client state/browser APIs. The local Next.js `use-client` guide was reviewed. Keep server-only provider/catalogue/database modules outside the client graph. No additional UI library is needed.

## Verification

The pre-change baseline passed `npm run check` (32 files / 356 tests) and all eight strict OpenSpec items. Those results establish existing health, not implementation of this proposal. Use synthetic evidence exclusively.

| Area                  | Required evidence                                                                                                                                                                                                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source fidelity       | Record/field/status projection; repeated titles/source IDs with different link/locator identities; null/blank/zero/false/enums; record-only/unscoped support                                                                                                                                                |
| Navigation            | Expand/collapse, repeated markers/keys across answers, exact target and return focus, direct disclosure opening                                                                                                                                                                                             |
| Image provenance      | Current/prior observation qualifications; group search/caps and same-label candidate UUIDs; R/comparison bindings, exact proof quotes/regions/contradictions, proof-only E entries, shared R inputs and captured old-answer context                                                                         |
| Copy formatting       | Text/image/clarification/unstructured exports; collapsed/expanded equivalence; uncertainty/notices; exclusion of other turns/draft/UI text                                                                                                                                                                  |
| Clipboard recovery    | Timely versus post-waiting settlement, synchronous exception/rejection/missing API, cross-answer contention, nonsettlement/lease release, dismissal/reopening, no async autofocus, manual selection and unmount/stale feedback                                                                              |
| Actual lifecycle      | Real Next.js text/image route with server-process fake upstreams; repeated keys/no-match/clarification; held response arriving during old-source/fallback reading; preservation under incidental rerenders and respect for intentional focus changes; unchanged upstream counters after source/copy actions |
| Accepted upper bounds | A reply accepted by current validators containing 64 E entries, four R inputs/four comparisons within canonical/reply caps; complete reachable associations and untruncated export/fallback                                                                                                                 |
| Responsive UI         | All eight core viewports in docs/testing.md plus relevant intermediate widths, 844 × 390 landscape and reduced-height checks; expanded sources, fallback, focus and screenshots                                                                                                                             |
| Regression/build      | npm run check, full isolated Chromium suite, ordinary production build with AI/vision/browser fixtures off, strict OpenSpec validation and diff checks                                                                                                                                                      |

Use test-owned clipboard doubles for deterministic success/failure assertions. Additionally verify a native Chromium clipboard write/read at a trusted loopback context when supported; test reads do not grant the product clipboard-read behavior. If unavailable, report the native-check limitation rather than treating a stub as equivalent.

Update existing test helpers that assume a single textbox or select the first `textarea`: composer queries must identify `消息内容` or scope to `消息输入`, while fallback queries identify the selected answer's labelled read-only field. Scope live statuses to their owning answer/turn so copying one answer cannot make unrelated request assertions ambiguous. Source/copy tests must assert both the real composer layout and the fallback layout. To verify unchanged upstream traffic, add test-owned counters/logging to the isolated server preload, outside product routes and response schemas; browser-only request interception cannot observe server-side archive/provider reads.

The current Playwright configuration uses two workers with `fullyParallel: true` and shared fixture servers. Therefore process-wide before/after counter deltas are not sufficient evidence for one test. Correlate preload telemetry with test/request identities, entirely in test-owned infrastructure, or give this check an exclusive server phase. A serial describe block alone does not establish isolation from other concurrently running files. Do not add production telemetry/routes or weaken the assertion by ignoring unexplained traffic. Run the follow-up canonical-context and changed-evidence cases through the actual route with isolated synthetic upstream revisions; earlier source entries must remain tied to their original response.

Inspect representative mobile/desktop screenshots of expanded sources, focused targets and fallback. Long values must wrap; focus, scrolling, composer and footer must remain usable with shared tokens/default components. Read-only fallback adds no text-entry requirement. Native mobile text-selection/keyboard behavior and measured audience coverage are not established by Chromium emulation or this viewport matrix.

## Risks and Mitigations

- Collapsing formerly visible summaries changes discoverability and tests. Keep counts beside the answer and make actual markers entry points; replace obsolete assertions instead of retaining duplicate lists.
- Shared formatting could strengthen image claims. Preserve accepted status/reason types and captured context, with candidate/conflict/prior-summary regression cases.
- Mount timing could focus a wrong/missing entry. Use scoped refs, pending navigation and multi-answer focus tests.
- Existing near-bottom follow could override deliberate evidence reading when a response arrives. Track reading intent separately from programmatic scrolling and test the actual conversation controller.
- Browser clipboard permission/context varies. Await actual outcomes and expose complete selectable text without disrupting conversation state.
- A UI timeout cannot cancel browser writing. Retain the shared lease until actual settlement, show accurate waiting feedback and never queue a write outside its activation gesture.
- Source metadata is not a full publication or semantic proof. Show delivered scope/status/identity faithfully and carry real-data/domain/deployment limits forward.

## Approval and Delivery

Owner approval is required before implementation under `openspec/AGENTS.md`. Approval and local implementation status are recorded in [proposal.md](proposal.md); executed checks and remaining owner acceptance are recorded in [verification.md](verification.md). Implementation verification and acceptance preserve the data/domain/deployment limitations. The implementation proposal did not authorize database changes, paid evaluation, archival, merge or publication. The owner separately requested archival if ready; its implementation-stage scope is recorded in [archival.md](archival.md). Database changes, paid evaluation, merge and publication are not authorized by that archival request.
