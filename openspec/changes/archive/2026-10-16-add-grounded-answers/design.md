## Context and Status

Approved implementation design for requirement 5 on `feat/add-grounded-answers`, based on main at `f9d60cf`. The owner approved implementation on 2026-10-16; the endpoint now implements this contract and remains config-off by default. No provider calls, payments or real-key changes were performed while refining this design.

The owner reports placing the DeepSeek key in local configuration (not inspected). The owner subsequently confirmed recharge and authorized a bounded local 20-question/40-call batch; see [live-evaluation.md](live-evaluation.md) for measured usage, failures and the successful separately authorized final recheck. The owner wants short-term demo use with low spending and evaluated quality, and accepted whole-response display. Retain official DeepSeek, initially `deepseek-flash` in explicit non-thinking mode. CNY 10–20 is the proposed total test envelope, not an enforced project-wide cap or authorization to make paid calls. Alternative-provider support and automatic model upgrades are excluded.

Existing text/image conversation, current-page lifetime and strict request/image validation remain the foundation. The implemented retrieval service and real database schema/read setup/types have already passed verification. The archive is empty; routine tests use isolated synthetic evidence and mocked provider responses, never artificial data inserted into the owner's database.

## Configuration and Secret Placement

Put `DEEPSEEK_API_KEY` in the ignored root `.env.local`, alongside the existing public Supabase settings, and restart the local dev server after changing it. Vercel uses the same name in project environment settings; redeploy to apply it. Never use NEXT_PUBLIC, client props, source files, committed env files, logs, URLs or chat to transmit the key. Do not read/print a user-entered key during verification.

`.env.example` documents an empty key, `DEEPSEEK_MODEL=deepseek-flash` and `DEEPSEEK_ENABLED=false`. The runtime consumes these server-only settings; missing/off settings disable paid generation. Validate settings in server-only code. Missing/invalid key or an off switch gives `generation_unavailable` without a provider call. Initially allow only the evaluated model; a model upgrade requires a deliberate configuration/design change.

Use a small server-only native-fetch adapter for the fixed official endpoint `https://api.deepseek.com/chat/completions`, without an AI SDK dependency. Fixed server endpoint/model settings cannot be overridden in a request. Both calls use `stream:false`, `thinking:{type:"disabled"}` and JSON-object output, with explicit JSON instructions and shape examples. JSON mode does not guarantee schema compliance; empty JSON content and length-truncated output are invalid outcomes. No chain-of-thought is exposed or stored.

## Request Scope and Images

Continue validating content type, streamed request bytes, message identity and image bytes before orchestration. Keep the existing 4,000,000-byte request and image limits. Add text context bounds: at most 32 messages, at most 2,000 Unicode code points in the current user text, and 16,000 across all message texts (including canonical assistant text). Reject overflow before a provider call with `context_too_large`; preserve the draft/history and advise a shorter question or deliberate refresh. Do not silently remove history and answer as if it were complete.

This increment answers text only. If the current message contains images (with or without text), return `image_understanding_unavailable` without calling the provider; keep local attachment selection/preview/removal working. Display “图片解读暂未接入，请先发送纯文字问题。” This follows the agreed item-6 boundary without pretending to inspect an image.

For prior messages containing images, send their text only, include an explicit image-not-interpreted marker and no base64/URL/image bytes. A text-only follow-up may proceed with a server-authored notice “本次回答仅依据文字与数据库记录，未读取历史图片。” A planner-declared dependence on unseen images returns the same unavailable outcome; tests cover “compare the pictures above” rather than claiming visual knowledge. This is not a guarantee that a model perfectly detects every implied image reference; prompt/tests plus the visible notice establish the supported boundary.

History is user-controlled, including previous assistant text. It can guide pronoun resolution, not establish trusted citations or archive facts. Current turn references must come from fresh retrieval. No login, persistence, visitor Storage or new image analysis is added.

## Two-Call Orchestration

1. Create the shared deadline/caller-abort scope at POST entry, then validate request/settings/admission in the precedence defined below before any paid work.
2. Make one planning call, maximum 1,024 output tokens, with text context and fixed instructions. Strict output:

```typescript
type RetrievalPlan =
  | { action: "answer"; queries: ArchiveQuery[] }
  | { action: "clarify"; question: string }
  | { action: "needs_image" };
```

Known keys/variants only; clarification question is nonblank Simplified Chinese text of at most 200 code points, with no evidence/identity assertion. `answer` accepts zero to two queries. Reuse `normalizeQuery` before any database read; enforce candidate limit at most five and filter values at most 64 Unicode code points per query (a narrower orchestration limit than retrieval's 200). Ask for clarification when a usable search term cannot fit rather than inventing an abbreviation; validate complete JSON and reject token truncation. Reject duplicates and all SQL/URL/custom-column additions. UUID lookups must use canonical input validation. General conversation can use zero queries, but then it cannot produce archive claims/references. A clearly archive-specific query that has no usable search terms must ask for clarification, not invent a name or claim a search occurred.

3. Execute up to two approved structured retrieval calls concurrently with the shared abort scope; each retains its own existing 5-second retrieval deadline and budgets. Deduplicate graph entities by table/UUID, associations by their real composite key and links by owner kind/link UUID. Preserve root query provenance, finite traversal, caps, uncertainty and conflict states. Any retrieval error stops the operation; do not downgrade it to empty results or silently continue on only one successful query. `no_matches` is an ordinary successful evidence state.
When two results contain the same table/UUID (or association composite identity/link-table UUID), compare their complete validated row payloads structurally, ignoring object-key order but preserving array order, values, nulls and timestamps. Equal rows deduplicate; any difference returns `evidence_changed` and no answer call or partial graph. Never let last-writer order resolve contradictory versions. Preserve an ordered per-query result entry (normalized query, roots, candidateLimitReached, traversal), including no-match entries. Do not claim separate successful HTTP reads are a globally consistent snapshot.
4. Build a bounded server evidence catalogue. Assign keys deterministically: fixed table order artists, artworks, images, artwork_artists; ascending UUID/composite tuple within each table; existing runtime column-descriptor order within a row. Catalogue owner labels derive from real names/titles (or an explicit record-ID label), never model text. Each claimable record field has a server-issued short key (E1, E2, …), entity/table identity, record UUID, field/value and recorded uncertainty. Source relationships retain real owner/link/source IDs, supported field, locator and notes. Attach field-specific source support only when scope matches; an empty supported field is unscoped, not universal support. Same-title records/sources remain separate.
5. Make one answer call, maximum 1,536 output tokens, with the context, question, retrieval status and catalogue. Strict output:

```typescript
type GeneratedAnswer = {
  blocks: Array<{
    kind: "archive" | "general";
    text: string;
    evidenceKeys: string[];
  }>;
};
```

Allow 1–8 blocks, at most 2,000 total block-text code points, at most 8 distinct keys per archive block. Reject unknown keys, empty text, unexpected URLs/reference objects and other variants. Archive blocks require known keys from this request; general blocks require an empty key array. Empty/no-retrieval contexts permit general blocks only. An archive record without external supporting sources can still be cited as a record, explicitly distinguished from external confirmation. Source/citation titles and locations come only from the server catalogue, never model-created bibliography.
6. Validate before any assistant output is published. Invalid/empty/truncated JSON or unknown evidence keys gives `invalid_model_output`, not partial success. No paid repair call, automatic retry, automatic fallback model or extra retrieval loop is allowed. Match identifier provenance mechanically; evaluate semantic support with fixed quality cases, since valid IDs alone do not prove the text is supported.

The answer payload includes a server-owned retrievalStatus: not_searched, no_matches or matched. Empty supplied evidence after no search does not establish an empty database. Live evaluation tightened schema examples and natural Chinese presentation; strict required-field validation and the two-call limit remain intact.

Prompts treat archive notes, conversation text and model plans as data, with immutable server instructions. No tool execution, provider-suggested SQL, external-source fetching or write authority is available. A malformed plan must stop before retrieval.

## Public Success and Reference Contract

Retain the outer `{turnId,message}` response and server-generated noncolliding assistant UUID. Define the application wire contract before implementing the parser:

```typescript
type EvidenceOwner =
  | { table: "artists" | "artworks" | "images"; id: string }
  | { table: "artwork_artists"; artworkId: string; artistId: string; role: string };
type SourceCitation = {
  linkTable: "artist_sources" | "artwork_sources" | "image_sources";
  linkId: string; sourceId: string; title: string;
  supportedField: string; locator: string;
};
type AnswerReference = {
  key: string; owner: EvidenceOwner; label: string; field: string;
  value: string | number | boolean | string[] | null;
  reviewStatus: "pending" | "verified" | "disputed" | null;
  attributionStatus: "not_recorded" | "confirmed" | "attributed" | "workshop"
    | "circle_or_school" | "unknown" | "disputed" | null;
  sources: SourceCitation[];
};
type NoticeCode = "no_retrieval" | "no_matches" | "record_only"
  | "candidate_limit" | "uncertain_records" | "image_history_omitted";
type AnswerBlock = { kind: "archive" | "general"; text: string; evidenceKeys: string[] };
type AssistantMessage = {
  id: string; role: "assistant"; text: string; notices: NoticeCode[];
} & (
  | { kind: "answer"; blocks: AnswerBlock[]; references: AnswerReference[] }
  | { kind: "clarification"; question: string; blocks: []; references: [] }
);
type ChatSuccess = { turnId: string; message: AssistantMessage };
type ChatFailure = { error: { code: ChatErrorCode } };
```

All shown properties are required. Arrays use `[]`, not null; nullable values explicitly retain null. `ChatErrorCode` is the finite code set in Outcomes and Retry, plus the existing request codes. Do not add provider messages, model IDs, usage costs or a model-controlled retryable boolean to this public envelope. Archive IDs/foreign keys and the server-generated assistant ID are canonical UUIDs; evidence keys use `E` plus a positive integer. Request turn/message IDs retain the existing nonblank unique-string contract, and turnId is echoed exactly (it need not be a UUID). Association role/attribution values are checked against the existing distinct table enums. An association never gains a fictional standalone UUID.

For `kind:answer`, require 1–8 blocks and 1–2,000 total block-text code points. General blocks have zero keys; archive blocks have 1–8 unique keys. References are exactly the distinct keys used by archive blocks, at most 64, in catalogue order. Reject duplicate/unknown/missing/unused references and nonfinite numeric values. Each `owner/field/value/status` must equal its catalogue fact, with field allowlisted for that table. SourceCitation entries are complete for that fact's supported/unscoped links, deduplicated by link-table/link UUID in deterministic order; same-title/different-ID sources stay separate. Matching scoped links must belong to the fact's actual owner and field. Unscoped links keep an empty supportedField and are labelled unscoped rather than proof for every field. Association facts have no direct source-link table; do not borrow an artwork source as support for an artist-specific association. No model-generated URLs/source objects are accepted; compact client references omit raw source notes and URLs deliberately, while the generation catalogue retains the selected scope/notes subject to its whole payload cap.

For `kind:clarification`, the required `question` is the validated 1–200-code-point question, blocks/references are empty, and `text` is the canonical question-plus-notices representation defined below. The answer variant has no question property. Notices may contain only applicable server-derived image-history limitations. Clarification is a completed assistant turn with no second provider call. It never presents an archive fact or fabricated source.

Notices are a duplicate-free enum array in the above fixed order. `no_retrieval` means zero queries; `no_matches` means at least one query and zero returned roots across all queries; they are mutually exclusive. `record_only` applies when a used fact has no matching field-scoped source relationship, even if unscoped links are present; those links are not external confirmation of the field. Field matching uses the exact stored column name, without inferring mappings for arbitrary human labels in supportedField. `candidate_limit` applies when any root result was capped. `uncertain_records` applies to used facts with nonverified review state where applicable or nonconfirmed attribution where applicable; fields absent from that owner schema use null without inventing a review status. `image_history_omitted` applies whenever any history image was excluded. These flags do not purport to detect every contradiction in free-text source notes; prompt instructions and quality evaluation cover semantic conflicts. UI text is a fixed Chinese mapping, not notice prose supplied by the model.

Build `message.text` deterministically for follow-up context: walk blocks in original order, prefix each with `数据库依据：` or `通用知识补充：`, append archive key markers `[E1]`, join sections with two newlines, then append a single `记录索引：` line per used key (`[E1] label / Chinese field label`). Use a shared fixed Simplified Chinese field/association-role label mapping for all catalogue columns shown in the UI/index; raw field keys remain in structured data only. Finally append the fixed notice lines in enum order. Clarification uses its question as text, plus any fixed applicable notice on a new line. Trim outer whitespace only; preserve internal text. The canonical result must be at most 3,500 code points. If record labels/reference expansion/canonical text cannot fit the reply/catalogue budgets, fail `evidence_too_large`; if model block text/shape violates its bounds, fail `invalid_model_output`. Do not crop text, references or labels silently to fit. The display groups consecutive blocks of the same kind into one labelled section, with one heading and separate paragraphs in original order. A kind transition starts another labelled section; distinct answers are independent. Citation markers remain on their original paragraphs. This grouping is presentation only: canonical history still follows each original block. The display renders references and notices for answers, or question and notices for clarification; it never renders canonical text a second time.

The client parser validates the complete envelope, counts, allowed enum/ID shapes, key relationships and canonical text equality before committing a turn. It can validate wire consistency, not independently prove catalogue membership or semantics; the server owns those checks. The product route emits only this new success shape; migrate old synthetic success intercepts. Supplied plain assistant text remains supported only by the isolated presentation harness and sanitized request history, not as a legacy successful API response silently missing evidence. Requests continue sending id/role/text/images only; never accept client citations or system/developer roles as verified evidence.

Render archive/general blocks using existing components/tokens, Chinese labels and plain text, with compact record/source summaries. Existing full source inspection and copy controls remain disabled for item 7. No model HTML execution. Safe logs may contain stage/model/usage/latency/error code, never keys, full prompts, user text/images or provider response bodies.

## Corrective Failures and Draft Ownership

Run known text-count, attachment validity/count/size and complete serialized-context checks in the client before calling `run`, clearing the composer or transferring attachments. Keep independent authoritative server validation for direct callers/races. A client limit rejection leaves text, selected images and history unchanged, with specific guidance. Visual capability alone is not a client submission rejection: valid image turns still append/transmit/display the full set, then receive the server's explicit nonretryable image-capability outcome. This preserves the accepted item-3 submission behavior. If existing history alone exceeds the context limit, shortening the new question cannot fix it: say explicitly that deliberate refresh clears all conversation/images/drafts, and never refresh automatically.

After dispatch, preserve the original question/attachment snapshot on the visible failed turn and preserve the independent next composer draft. A corrective server failure does not automatically restore old text or attachments over a newer draft. For the final failed turn only, provide “编辑问题” when no request/preparation is active and both next-draft text and selected images are empty. Clicking it copies the original text into the composer, removes that failed turn from history and focuses input; it sends nothing and leaves previous completed turns intact. Do not automatically restore its old attachments; release their local blobs/URLs if no longer referenced. Tell the user to reselect images when relevant. Original next drafts/preparations suppress this action with guidance to send or clear that draft first. Server failure UI cannot overwrite a new draft.

Editing makes the corrected submission a new user/message ID with a fresh request over prior accepted history. Identical “重试” is separate, available only for final transient failures and preserving the immutable original request. All failed turns (including unavailable provider/config outcomes) are excluded from subsequent model context; their user messages remain visible until edited or refreshed. Only completed answer/clarification pairs enter new requests. This deliberately replaces the old inclusion of generation-unavailable users now that real AI is being introduced. With the provider off, visible unavailable feedback still works without injecting those unanswered turns into later paid context.

## Budgets, Deadlines and Spending

| Boundary | Proposed initial value |
| --- | --- |
| Provider calls per user attempt | At most 2: planning plus answer; clarification uses 1 |
| Retrieval calls | At most 2, up to 5 root candidates each |
| Planner serialized request | 64,000 UTF-8 bytes including instructions/context |
| Answer serialized request | 128,000 UTF-8 bytes including instructions/context/evidence |
| Raw provider response before JSON parsing | 256,000 bytes per call |
| Provider output tokens | Planning 1,024; answer 1,536 |
| Shared request deadline | 55 seconds from POST entry, including body reads, validation, planning, retrieval and serialization |
| Individual provider stage | Planning 18 seconds; answer 28 seconds, within shared remaining time |
| Client request timeout | 65 seconds, replacing current 30 seconds |
| Server reply bytes | 128,000 UTF-8 bytes |

Enforce encoded request caps before each provider call, including JSON escaping and instructions. If a selected evidence graph cannot fit, return `evidence_too_large` without silently cutting notes or sources to claim completeness. Context oversize and evidence oversize are corrective failures. Token output caps are provider parameters; byte caps are enforced locally. No claim is made that byte counts are exact input-token counts or that these caps imply the illustrative CNY estimate for every turn.

Create the 55-second application deadline at POST entry before awaiting body reads. Race each stream read with deadline/caller abort, cancel the body reader on expiry, and always release locks. Apply stage timeouts as min(stage cap, shared remaining time), including when synchronous processing used part of the budget. Release request admission slots on every settled path. Native image decoding may finish after cancellation; guard before/after it and never dispatch a provider call after expiry. Do not claim instantaneous cancellation of native CPU work.

Use one cancellation/deadline lineage for all later work, guard late provider/SDK responses and cancel pending reads/calls on refresh, timeout or failure. Aborting transport does not guarantee the provider stops billing. Verify deployed function duration permits the planned server deadline before deployed live evaluation; proposed route duration 60 seconds is subject to actual Vercel project limits. Do not silently raise paid hosting or add infrastructure. The 65-second client attempt includes existing image request encoding and fetch/response handling; cancellation guards cover encoding too. Ten seconds is an engineering margin, not a network/upload guarantee: slow uploads may still time out cleanly. On such failure preserve the immutable failed attempt and next draft. No new public diagnostic page is needed.

Budget checks must include a deterministic transcript with three completed user/assistant pairs (600 code points per user and 3,500 canonical assistant code points) plus a new 600-code-point question: 12,900 code points fits the 16,000 cap. Include reference/notice/index expansion in those assistant counts. Test exact/one-over 32-message, 2,000-current and 16,000-total boundaries, plus escaped JSON/CJK/emoji byte caps. The 1,024-token planner and narrower 64-code-point terms are selected to accommodate small structured plans; test long two-query/three-filter plan fixtures, and measure real truncation before any claim of practical reliability. Tokenization is provider-specific and no fixed character count guarantees a token count. The 3,500 canonical reply cap and provider token cap are independent upper bounds, not a promise the model can fill both.

Default `DEEPSEEK_ENABLED=false` provides a server-side off switch; funded live evaluation explicitly enables it. Apply per-runtime admission limits of two concurrent orchestrations, then reject with `busy`; no queue or automatic retry. This protects one runtime, not a project-wide rate/cost cap across Vercel instances. The initial short demo relies on the deliberately small prepaid balance plus usage review and turning paid access off afterward. No guaranteed global CNY cap is claimed. Before public unattended access, choose either actual platform access protection or shared rate/quota enforcement as additional approved work; an in-memory map alone is insufficient. No user login feature is introduced by this design.

Inspect actual provider token usage and account expenditure after the initial authorized smoke batch. Routine Vitest/Chromium tests must never enable the real provider or load a paid key. No secret/account credit test occurs merely because the key is present.

## Outcomes and Retry

All application responses remain no-store. Proposed mapping:

| Outcome | HTTP / code | Behavior |
| --- | --- | --- |
| Settings off/missing/invalid | 503 / generation_unavailable | Explain temporary unavailability; no provider call |
| Invalid request/image | Existing 400/413/415/422 codes | Preserve current corrective behavior |
| Text context/evidence too large | 422 / context_too_large or evidence_too_large | Preserve draft; shorten question/context; no identical retry |
| Current or required image interpretation | 422 / image_understanding_unavailable | Explicit image-capability notice; no invented analysis |
| Runtime concurrency exhausted | 429 / busy | Optional manual final-turn retry |
| Provider reports insufficient credits | 503 / provider_unavailable | Safe Chinese service-unavailable notice; no automatic/identical retry offered |
| Provider authentication/config failure | 503 / provider_unavailable | Safe notice; server-side diagnosis, no key/error payload leakage |
| Provider rate/network/transient 5xx | 429 or 502 / provider_busy or provider_failed | Manual final-turn retry only |
| Retrieval stage failure | 502 / retrieval_failed | Explicit failure, not empty database/general-knowledge success; no identical retry |
| Same-identity payload differs across retrievals | 409 / evidence_changed | No answer/partial graph; manual final-turn retry starts fresh retrieval |
| Invalid planning/answer JSON or references | 502 / invalid_model_output | No partial answer or paid repair; no identical retry offered |
| Shared/stage deadline | 504 / generation_timeout | Manual final-turn retry, retaining snapshot and stale-result protection |

Define a finite error-code union including `invalid_request`, `request_too_large`, `unsupported_media_type`, `invalid_image` and every code in the table. Server/client share the same classification. Manual identical retry is allowed exactly for `busy`, `provider_busy`, `provider_failed`, `generation_timeout` and `evidence_changed`, plus client network/malformed-transport failures with no validated server outcome. `retrieval_failed`, `invalid_model_output`, all size/image/context failures, `generation_unavailable` and `provider_unavailable` are nonretryable through the identical-retry button. Unknown server codes/malformed success remain a client protocol failure, never a trusted answer; any manual retry still obeys the one-active/final-turn guard. Check late local exceptions do not reclassify a known deterministic server failure as generic retryable failure.

Error precedence: enforce media type/declared/streamed bytes, JSON/request structure and image validity first inside the POST-entry deadline; for structurally valid requests, context/current-image capability checks precede provider availability/admission. Thus a valid image turn gets the explicit image notice even when paid generation is off. No-image generation then checks config/admission before paid work. `generation_unavailable` becomes a visible nonretryable failed turn, not a trusted assistant response or reusable unanswered history entry.

The adapter maps documented provider statuses/codes without exposing raw payloads. Caller abort publishes no assistant turn. Manual retry starts a new paid attempt and is labelled “重试会重新请求 AI”; it preserves the original user/context snapshot and pending next draft. Idempotency across tabs/serverless instances is not guaranteed. Deterministic failures must not be retained as trusted assistant content or repeatedly submitted through a generic retry control.

## Verification and Acceptance

- Pure tests: strict plan/output schemas, all budgets/boundaries, context/canonical text/reference mapping, citation scope, duplicate identities, null/uncertainty/candidate caps, no evidence and clarification.
- Mocked server/provider tests: max two calls/two retrievals, invalid planning before database I/O, no credentials or image bytes in client/provider history, JSON empty/truncated/unknown references, prompt injection, all documented failures, usage metadata, deadlines/cancellation/late results and runtime admission cleanup.
- Route/component tests: request validation, compatible success parsing, visible evidence/general-knowledge/notices, safe text rendering, image-unavailable/corrective failures, retry classification and existing draft/history semantics.
- Chromium real Next.js lifecycle with server-process fetch fixtures as specified below: full-answer display, pending/input/focus/scroll behavior, retry/no retry, refresh cancellation, no-match/clarification/citations and all mainstream responsive viewports. Tests cannot call the paid API.
- Run npm run check, production build, Chromium, strict OpenSpec and whitespace checks. Add a separate bounded, manually invoked real-provider smoke/evaluation command only after implementation approval and funded-call authorization. Use 20–30 fixed questions; report model/mode, token usage/cost, failures and human assessment separately from deterministic tests.
- Include questions with known synthetic evidence in the explicit evaluation harness, never seed the owner's database or present fixture answers in the product. Real empty-database live smoke validates no-evidence behavior, not live factual retrieval accuracy. Relevant factual/citation errors fail the tested case; do not promise universal model accuracy from a small sample.

## Browser Test Server Isolation

Use test-owned Node startup/preload files under `tests/browser/server/`, loaded only by the Playwright webServer commands via Node `--import` for the Next.js runtime. Do not put a test-mode provider URL, fixture flag or route into production application code. The production adapter retains its fixed official endpoint; only the test process replaces its fetch boundary before Next.js startup. The preload forwards local harness/loopback requests as needed, intercepts the fixed DeepSeek and synthetic Supabase host, and rejects every other outbound destination rather than falling back to the network. Assert all fixture requests remain in this allowlist.

Explicitly override all known provider settings and Supabase URL/key in child process environments, rather than inheriting `.env.local`: use a synthetic public Supabase URL/key and an exact non-real fixture provider key. Reject startup of the fixture process if its key/URL do not equal the expected synthetic constants. Never forward provider credentials from the request, local env or intercepted payload. Next.js loads env files after process startup; explicit process environment values must be set before build/start so they win. Do not print the environment. Validate local preload startup before launch; a missing/failed preload must prevent the enabled fixture app from serving tests.

Build once using synthetic public settings and paid generation off. Run the unchanged-flow Next.js instance on port 3100 with generation disabled, the existing isolated component harness on 3101, and a fixture-only real Next.js instance on 3102 with the fake key and generation enabled inside the network-blocked preload process. All use the same production build; private generation settings are evaluated server-side at runtime, while synthetic public Supabase settings match the build-time values. Ensure no parallel build reuses/mutates the artifact. The test bootstrap lives outside product routes and is never imported by the normal app.

The runtime preload returns deterministic DeepSeek completion envelopes (including finish_reason/usage) and synthetic PostgREST/RPC responses, keyed by explicit fixture question identifiers in normal text/turn IDs. Tests remain parallel-safe without a global current-scenario switch or product request test fields. Fixture helpers only emulate external transport; real `/api/chat` validation, planning, retrieval service, catalogue validation and response serialization run normally. Browser-intercepted `/api/chat` tests remain useful for isolated client behavior, but count separately from these real-route fixture tests. No `page.route` claim is made for server-originated provider fetch.

Verify accidental inherited real-looking provider settings are overridden without echoing them, off-mode makes zero provider calls, malformed/missing fixture configuration fails closed, nonallowlisted network attempts fail, current-image rejection makes zero paid-model calls, and success/clarification/no-evidence/retry/error/cancellation traverse the real Next.js route against fake upstreams. A deliberately funded live evaluation remains a separate manual command and never shares this routine test bootstrap.

## Existing Capability Deltas

This change also modifies the existing text-conversation requirements for eligible history, availability, preflight gestures and failure/edit behavior, and the image-upload submission/payload scenarios for explicit image-capability feedback and the 65-second client deadline. Full MODIFIED requirement blocks are included under the change's text-conversation and image-upload deltas and were applied to the formal specifications during archive on 2026-10-16. No archived retrieval contract is modified. Existing image selection, prepared-byte submission, display, limits and page-local lifetime remain intact.

## Approval and Remaining Deployment Checks

No additional table definitions, artwork dataset or API key in chat is required. Provider integration now exists locally and remains disabled without explicit settings. Before paid live evaluation, confirm available credits, the chosen test allowance, deployment execution duration and access scope for enabling paid calls. These are explicitly reported operational prerequisites, not a reason to expand into authentication, persistent conversation, image interpretation, Storage or multi-provider work.

## Confirmed Presentation and Cost Research

The owner accepted whole-response display: keep a pending indicator while the server obtains and validates the complete answer, then show it together. This is a display decision, not a claim that citation-ID validation proves factual correctness. Existing cancellation/failure feedback must still work while waiting.

Official sources reviewed on 2026-10-16:

- [DeepSeek pricing](https://api-docs.deepseek.com/zh-cn/quick_start/pricing/): `deepseek-flash` maps to DeepSeek-V4.1-Flash. CNY per million tokens: uncached input 1 off-peak / 2 peak, output 4 off-peak / 8 peak. Rates can change. The readable official search-index copy was used when direct page opens timed out. No currently applicable universal free-credit entitlement was confirmed; account-specific gifted balance cannot be inferred from general docs.
- [DeepSeek thinking mode](https://api-docs.deepseek.com/zh-cn/guides/thinking_mode/): thinking is enabled by default and can be disabled. Evaluate explicit non-thinking Flash first for bounded lexical planning and evidence-based demo replies; do not accidentally incur default reasoning output without budgeting it. Quality on Thangka evidence is not established by documentation.
- [Zhipu official GLM-4.7-Flash announcement](https://www.zhipuai.cn/zh/news/148): offers free API calls on BigModel. Treat current account eligibility/limits as console checks, not an unlimited-capacity promise. This is an alternative model/provider, not free official DeepSeek access.
- [OpenRouter pricing](https://openrouter.ai/pricing/): free-model API access lists 50 requests/day for the free plan. Account/endpoint limits and free model availability must be rechecked before integration. One user turn with multiple model calls consumes multiple requests; model selection should be fixed for repeatable quality evaluation.
- [Groq rate limits](https://console.groq.com/docs/rate-limits): documents a free plan with model-specific caps. It is another available testing alternative, not the already selected DeepSeek provider.

Accepted planning direction (not paid-call authorization): retain official DeepSeek to avoid implementing and validating a second provider solely for a short demo; use deterministic mocked provider responses for routine automated tests, then a small explicitly authorized real-call evaluation set. Trial Flash in explicit non-thinking mode against 20–30 fixed questions, including no evidence, ambiguous/conflicting evidence and fabricated-reference rejection. Escalate selected failures to a higher capability/mode only after measuring results, not through an automatic paid fallback. No guarantee of model factual quality follows from choosing Flash or Pro.

Illustrative text-only cost calculation: assume the sum across planning and answer calls for one user turn is 10,000 uncached input tokens and 1,500 total output tokens, without additional reasoning or retries. At the cited peak Flash prices, cost is `(10,000 * 2 + 1,500 * 8) / 1,000,000 = CNY 0.032` per turn: CNY 3.20 / 9.60 / 16.00 for 100 / 300 / 500 such turns; off-peak is half. This is a scenario, not measured usage or a maximum. Longer history/evidence, reasoning, failures/retries and later image handling can increase it. A proposed CNY 10–20 total short-demo budget needs owner agreement; minimum recharge and payment options are account/platform dependent.

Do not add monthly subscriptions, persistent cost storage, automatic top-ups or multiple provider adapters from this research alone. Before live testing, settle caps for calls/tokens/context, public endpoint access/concurrency and how actual provider usage is inspected. A per-process counter on serverless instances is not a reliable project-wide spending cap.

Additional official API references checked during contract refinement: [Chat Completions](https://api-docs.deepseek.com/api/create-chat-completion/), [JSON output and empty-content handling](https://api-docs.deepseek.com/guides/json_mode/), and [provider status codes](https://api-docs.deepseek.com/quick_start/error_codes/). Map provider 401/402 to safe unavailable outcomes and 429/500/503 to the transient policy above.
