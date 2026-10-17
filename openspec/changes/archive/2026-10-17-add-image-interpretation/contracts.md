# Image Conversation Contracts

## Authority and Common Validation

This document fixes task 1.3's wire/model/state contracts. It extends the [accepted text contracts](../2026-10-16-add-grounded-answers/design.md); [identification](identification.md), [reference access](reference-access.md) and [acceptance](acceptance.md) define the other normative details. No runtime code is implemented by these examples.

All objects use exact keys; union variants permit only their listed keys. Every shown field is required; nullable fields use null, lists use arrays, and absent optional fields are allowed only where explicitly stated. Reject unknown keys, nonfinite/unsafe numbers, malformed Unicode, duplicate identities and inappropriate cross-references. Human text is outer-trimmed, nonblank, contains no control characters except line breaks/tab, and preserves internal wording. Text limits count Unicode code points after trimming. URLs are prohibited in generated prose/readings; stored archive/source values remain original data under accepted field/reference validation. All output prose/questions use Simplified Chinese; original archive wording and inscription quotations may retain their original language.

`Id` is an opaque, already-trimmed, well-formed string of 1–64 code points without control/format characters. Do not normalize or coerce identity strings. `Uuid` is a lowercase canonical UUID. `Sha256` is 64 lowercase hexadecimal characters. `GroupId` is G1–G4; `EvidenceKey` is the current catalogue's E plus positive integer; `ReferenceKey` is R1–R4; `TaskId` is V1–V4. Model-scoped short keys carry no database authority. Display indices are unique integers 1–1,000,000 assigned monotonically on first submission of a new attachment; removal leaves gaps. They are labels, not record identity.

## Request Version 2

```typescript
type ImageDescriptor = {
  id: Id;
  ownerMessageId: Id;
  displayIndex: number;
  mimeType: "image/jpeg" | "image/png";
  width: number;
  height: number;
  sha256: Sha256;
};
type ContextMessage = {
  id: Id;
  role: "user" | "assistant";
  text: string;
  imageIds: Id[];
};
type SelectedInput = { imageId: Id; data: string };
type Intent =
  | { kind: "question" }
  | { kind: "reread"; sourceTurnId: Id; sourceAssistantId: Uuid; imageIds: Id[] };
type ImageRequest = {
  version: 2;
  turnId: Id;
  messages: ContextMessage[];
  images: ImageDescriptor[];
  inputs: SelectedInput[];
  observations: Observation[];
  sameWorkSets: Id[][];
  intent: Intent;
};
```

- `messages`: 1–32, unique IDs, last entry a user whose ID equals turnId. Assistant imageIds is empty and text nonblank. User imageIds is 0–4 distinct descriptor IDs, in display order. A user has nonblank text or imageIds. The client includes completed answer/clarification pairs plus the current question; the server may structurally accept consecutive textual user messages, but does not treat them as trusted completed history.
- `images`: 0–20 distinct IDs and display indices, exactly the union of message imageIds. ownerMessageId identifies the first user message referencing that attachment. Later user messages may reference the same ID; no cloned descriptor/blob is needed. Historical descriptor owners must have a following assistant entry before the current question. Descriptor dimensions are integers 1–1600 with longest side at most 1600.
- `inputs`: 0–4 unique IDs, exactly the current user's imageIds, in display order. Every new descriptor owned by the current user is included. Historical inputs reuse their original descriptor/owner identity. No source URL, blob URL or data URL is accepted here: data is canonical base64 only. Decode at most 500,000 bytes, validate actual static JPEG/PNG contents/dimensions and compute SHA-256 equal to the descriptor before paid work.
- `observations`: 0–20, at most one per image, only for historical descriptor IDs. Origin user/assistant IDs must be an adjacent prior pair in messages whose user imageIds includes that image. Match imageSha256 to the descriptor. These checks bind context structure, not truth: caller-provided historical observations and old associations remain untrusted. Only current input bytes can establish a new current visual observation.
- `sameWorkSets`: 0–2 disjoint sets of 2–4 known image IDs, at most four IDs overall. They are explicit visitor grouping hints retained from selection, not proof of physical identity. Default is separate pictures. A planner may group several IDs only within one of these sets; otherwise it uses singleton groups or asks a clarification. The composer offers “标为同一件作品” for a visitor-selected subset of 2–4 active pictures and removable grouping chips. Removing a member updates stored grouping hints and dissolves a singleton; reselecting that picture cannot restore removed membership or an uncommitted grouping choice. Overlapping sets are not allowed. New-picture labels count only new attachments, matching the preview even when historical pictures are selected first. A normal request sends its active grouping hints only; a summary-only request sends []. Reread inherits the captured hints intersected with its target set, omitting sets smaller than two.
- Combined message text and all observation item text is at most 16,000 code points; current text is at most 2,000. Count a shared observation once, but do not subtract its separately supplied text merely because similar wording occurs in canonical history. Enforce complete 4,000,000 UTF-8 request bytes independently. No truncation.

A minimal text request `{turnId,messages:[{id,role,text}]}` remains accepted only with the explicit header `X-Chat-Protocol: 2`, using the same new ID/text bounds and normalization to empty image arrays/question intent. An explicit version-2 body needs no header; a supplied header must be 2. Unversioned requests without this opt-in, legacy inline-image requests and unknown/mismatched versions fail invalid_request before provider access. This prevents stale tabs paying for a response their old parser cannot consume. All successful responses use version 2; updated clients reject legacy plain/structured successes rather than bypass validation.

### Captured Reread Intent

The client saves the original request snapshot with its completed clarification. One explicit click creates a fresh user ID, appends the original clarification and one new user message to that captured context, and copies the source question text exactly. sourceTurnId/sourceAssistantId must identify the final source pair immediately before the new user message; sourceAssistantId is an assistant UUID and the new current text must equal the source user text. intent.imageIds equals the current user imageIds/inputs and the clarification's stored targets. Descriptor owners/labels remain original.

The server validates the source pair, exact question equality and known targets; it cannot authenticate a browser's historical narrative. The client validates targets against its received clarification and immutable snapshot. Later unrelated turns and editable next drafts do not enter the reread request. The action acquires the usual single-attempt lock before encoding, creates exactly one new user intent/POST, and never mutates the settled clarification. A pending action or missing retained target disables activation. All calls count toward any separately authorized batch allowance.

## Observations

```typescript
type Region = "whole" | "top_left" | "top_center" | "top_right"
  | "middle_left" | "center" | "middle_right"
  | "bottom_left" | "bottom_center" | "bottom_right";
type Fact = { text: string; region: Region };
type Reading = {
  text: string;
  region: Region;
  kind: "collection" | "accession" | "inscription" | "other";
  certainty: "clear" | "tentative" | "unreadable";
};
type Interpretation = { text: string; certainty: "tentative" | "clear" };
type ObservationBody = {
  imageId: Id;
  facts: Fact[];
  readings: Reading[];
  interpretations: Interpretation[];
  limitations: { text: string; affectsIdentity: boolean }[];
};
type Observation = ObservationBody & {
  id: Uuid;
  imageSha256: Sha256;
  originTurnId: Id;
  originAssistantId: Uuid;
  pass: "analysis" | "verification";
  supersedes: Uuid | null;
};
```

facts: 1–6, each text at most 80; readings: 0–3, text at most 64; interpretations: 0–3, text at most 80; limitations: 0–3 exact `{text,affectsIdentity}` objects, text at most 80 and a required boolean. All item text, including limitation text, together is at most 300 code points per image. Every unresolved label/work, identifier, source or record identity contradiction uses affectsIdentity=true and blocks either identity route for its group. Visibility/crop limits and attribution uncertainty alone use false. Free-text limitation entries or a missing flag are invalid, not an implicit false. An unreadable reading has text `未能辨认`, not a guessed transcription. Reject duplicate identical items. `clear` and affectsIdentity are model-reported judgments, not independently measured certainty.

Readings with different regions may repeat the same identifier value. Identity gates compare distinct values after trim/NFC/ASCII lowercase without rewriting observation text or provenance. A missing record collection/accession value is incomplete identifier evidence, not a contradiction: it prevents identifier confirmation but permits independently qualified reference confirmation. Distinct clear visitor values of one kind or a clear reading disagreeing with a nonblank record value remain conflicts.

First-stage model output contains ObservationBody only. The private planner input explicitly supplies selectedImageIds from actual request inputs, separate from the images descriptor registry and priorObservations. An empty list permits no new observations or selected representatives; new historical visual detail requires needs_image. The server assigns UUIDs, actual byte hashes and origin IDs after validation; it never accepts model-supplied provenance. Every selected input has exactly one current observation. Current bodies remain unpublished until the complete attempt succeeds. A verification correction may update only an image actually present in that second call; the server retains its provisional UUID, sets pass=verification and uses the final corrected body. The correction must explain the changed reading in limitations; it cannot quietly copy catalogue values or erase a material disagreement. Carry unresolved affectsIdentity=true entries forward; clear one only when the supplied pixels resolve that specific conflict, with an explicit explanation. Both identity gates recheck final current observations, including other selected pictures in the group, after updates. If verification was already issued for this target, any different_work assessment, nonempty contradiction or mismatch proof still blocks confirmation, even when the corrected readings now satisfy the identifier gate. Client response validation rejects the same contradictory identified result. A conflict against a different candidate does not automatically disqualify the target. `supersedes` points to the selected historical observation version, or null for first observation. Never refer to a superseded historical version in a new answer when a current version exists.

The client atomically commits the complete assistant message and current observation map. Failure, cancellation, late completion or invalid canonical text commits neither. Previously displayed messages and their observation snapshots remain immutable. Summary-only turns emit no new observations and cannot promote tentative content to certainty.

## Planning Output and Query Authority

```typescript
type Group = {
  id: GroupId;
  imageIds: Id[];
  representativeImageId: Id | null;
  task: "interpret" | "identify" | "compare";
  search: "not_requested" | "no_clue" | "planned";
};
type BoundQuery = { query: NormalizedArchiveQuery; groupIds: GroupId[] };
type Plan =
  | { action: "answer"; observations: ObservationBody[]; groups: Group[]; queries: BoundQuery[] }
  | { action: "clarify"; question: string }
  | { action: "needs_image"; imageIds: Id[] };
```

A Chinese clarification is 1–200 code points without identity/archive assertions. needs_image has 1–4 distinct known descriptor IDs, with at least one not in inputs; targets may include current inputs needed again for comparison. With no available target or a need for a better crop, use clarify. No archive/reference reads occur for either variant. needs_image becomes the fixed question `需要重新读取相关图片才能继续判断，请点击“重看图片并回答”。` and a server-owned reread action.

Answer groups are 0–4, numbered consecutively in array order. Each has 1–4 distinct known IDs in display order, no overlap, at most four IDs overall. Every current input occurs in exactly one group; summary-only groups may reference historical IDs. Multiple-image groups require sameWorkSets support. Representative is the first selected input in that group, or null if none is selected. This deterministic choice avoids a model choosing unseen bytes. If any identify group lacks selected visitor bytes, the server converts the plan to a reread clarification for the union of the affected group IDs (at most four), before queries/reference reads; it does not mint an identity from a summary.

Query wrappers have 0–4 known group IDs, all real current groups; empty groupIds is allowed for an accompanying text query. NormalizeQuery enforces the accepted schema; additionally require limit at most 5 and values at most 64 code points, no URL values. A planned group must bind at least one query; not_requested/no_clue groups bind none. Identify groups use artwork queries, not artist-neighbor expansion as an identity shortcut. Query group provenance survives graph merging. Raw query arrays already fit the applicable two/four cap before normalization. Identical normalized queries deduplicate only when wrappers bind disjoint nonempty group-ID sets, unioning those IDs in order. Repeated queries with overlapping or empty provenance, or unknown groups, are invalid; text-only duplicate queries retain the accepted rejection behavior. Deduplication is structural normalization, not another model call.

Groups empty: at most two normalized queries. Groups nonempty: at most four queries total, including any accompanying text query. Four independent identify groups with usable clues each receive one query; unavailable clues are explicit no_clue, not fabricated searches. Ordinary image-free/general text questions use groups=[] and the accepted two-query limit. Five roots per query, existing per-query I/O limits and one shared answer catalogue budget remain enforced.

For an already strictly valid answer plan, the server also enforces literal current-question names written as `作品《…》`/`唐卡《…》`/`画作《…》` or a quoted name after `画师`/`艺术家`/`作品` (including explicit name labels). Required lookups preserve the complete 1–64-point name and use only an exact name filter. A matching full-name query loses additional inferred filters; an omitted lookup is added with empty group provenance. Never infer a pixel-to-title association from this syntax. Existing query/group provenance is preserved, and the resulting complete plan is validated again under the same raw two/four limit and duplicate rules before reads. Do not evict another group's query to fit, repair malformed output, silently trim names or add a provider call. Bare book titles, unmarked names, contextual names and genuine clarification/reread decisions remain planner judgments, not a general-purpose server name parser.

## Answer and Verification Model Output

The server creates candidate/group evidence states and any reference tasks before the second call. Default answering contains no pictures and no verification tasks. Targeted verification contains only task-scoped selected visitor inputs and downloaded authorized reference inputs; no client reference URL is accepted.

```typescript
type GeneratedBlock = {
  kind: "visual" | "archive" | "general";
  text: string;
  evidenceKeys: EvidenceKey[];
  observationIds: Uuid[];
};
type FeatureProof = {
  evidenceKey: EvidenceKey;
  quote: string;
  kind: "composition" | "local_detail" | "inscription" | "condition";
  finding: "match" | "mismatch";
  visitorRegion: Region;
  referenceRegion: Region;
};
type Comparison = {
  taskId: TaskId;
  assessment: "same_work" | "different_work" | "uncertain";
  proofs: FeatureProof[];
  contradictions: string[];
};
type GeneratedAnswer = {
  blocks: GeneratedBlock[];
  comparisons: Comparison[];
  observationUpdates: ObservationBody[];
};
```

Every array is required. Default text answering requires comparisons=[] and observationUpdates=[]. Verification returns exactly one comparison per issued task, in task order, and no other task IDs. Each proof quote is an exact 4–60-code-point substring of the referenced record value, not a model bibliography. Proofs: 0–3 per task, no duplicate `(evidenceKey,quote,kind,visitorRegion,referenceRegion)`; contradictions: 0–3 nonduplicate strings at most 80. Valid but insufficient proofs produce candidate/insufficient states under the evidence matrix, not a schema failure. observationUpdates is 0–4 unique actually reread visitor images and uses the same 300-code-point body bounds.

Blocks: 1–8, at most 2,000 total text code points. Visual blocks have 1–4 distinct known observation IDs and no E keys, with all observations either current or historical, never a mixed-origin block. Archive blocks have 1–8 distinct current E keys and observationIds=[]. General blocks have both arrays empty. Reuse across blocks is allowed; within-block duplicates are invalid. Models must not independently assert an artwork match in prose; the server-owned identity panel is authoritative. This prompt/renderer boundary does not mechanically prove every prose claim; semantic quality cases remain mandatory.

Block text must not contain renderer-owned `[图片1]` (including spaces), `[E1]` or `[R1]` markers. Reject those outputs before publication rather than stripping text or publishing duplicate links. The model supplies observation/evidence arrays; the renderer owns their labels.

Likewise, reject exact server-owned notice sentences repeated inside model block text; the canonical renderer appends them once from server-derived notices. The private analysis payload supplies the current question and intent explicitly, and the private answer payload supplies `answerTask` with that same question/intent, selected image IDs and disjoint current/prior observation ID sets. These are focus/availability cues, not permission to mix current and historical observations in one block or treat cached text as current pixels. Reread answers address the captured original question; summary reuse of already observed details does not require another confirmation. Explicit temperature=0 is used with non-thinking JSON output; it does not replace schema or semantic validation.

Verification receives at most four tasks V1–V4, each `{id,groupId,artworkId,referenceKey,visitorImageId}`. They are assigned by the reference-selection rules and all point to a selected group representative. Task/candidate membership is fixed before the call. No more than four comparison pairs are issued even when an archive image is reused across groups. A task can neither choose another record nor authorize another fetch.

## Public Response and Identity Types

```typescript
type Reason = "no_clue" | "record_unverified" | "source_support_missing" | "identifier_unclear"
  | "identifier_mismatch" | "identity_conflict" | "candidate_limit"
  | "references_missing" | "reference_not_authorized" | "reference_limit"
  | "visual_uncertain" | "insufficient_features";
type Identity =
  | { status: "not_requested" }
  | { status: "no_match" }
  | { status: "candidates" | "insufficient_evidence"; reasons: Reason[] }
  | { status: "identified"; method: "identifier" | "reference";
      artworkId: Uuid; supportingImageIds: Id[];
      evidenceKeys: EvidenceKey[]; referenceKeys: ReferenceKey[] };
type GroupResult = {
  id: GroupId;
  imageIds: Id[];
  searchStatus: "not_searched" | "no_matches" | "matched";
  candidates: Array<{ artworkId: Uuid; label: string }>;
  candidateLimitReached: boolean;
  identity: Identity;
};
type ReferenceEvidence = {
  key: ReferenceKey; imageId: Uuid; artworkId: Uuid; contentSha256: Sha256;
};
type PublicComparison = Comparison & {
  groupId: GroupId; artworkId: Uuid; referenceKey: ReferenceKey; visitorImageId: Id;
};
type RereadAction = { sourceTurnId: Id; sourceAssistantId: Uuid; imageIds: Id[] };
type AssistantBase = {
  id: Uuid; role: "assistant"; text: string; notices: NoticeCode[];
  blocks: GeneratedBlock[]; references: AnswerReference[];
  observations: Observation[]; groups: GroupResult[];
  referenceImages: ReferenceEvidence[]; comparisons: PublicComparison[];
};
type AssistantMessage = AssistantBase & (
  | { kind: "answer"; reread: null }
  | { kind: "clarification"; question: string; reread: RereadAction | null }
);
type ChatSuccess = { version: 2; turnId: Id; message: AssistantMessage };
type ChatFailure = { error: { code: ChatErrorCode } };
```

Group results are server-owned, in planned order, and preserve each planned imageIds array. Candidates are at most five actual artwork roots from that group's bound artwork queries, deduplicated in query/candidate order; labels are actual titles (1–200 code points) and never model names. A union above five marks candidateLimitReached and blocks definitive identity. Artist neighbors can support ordinary facts but cannot silently enter this identity candidate pool. Any bound candidate cap remains true after merging.

Reasons are 1–12 distinct enum values in the shown order. candidates requires a nonempty candidate list; insufficient_evidence is used for no usable search clue or unusable evidence; no_match requires a completed bound artwork query with zero roots, never an unperformed/failed query. interpret/compare groups use not_requested unless the question explicitly requires a new archive identity. Identified supports only supportingImageIds actually used in its gate; other pictures in the visitor's group are not thereby certified as the same work. Identifier identity uses exactly its two field keys, no reference keys. Reference identity uses the 1–3 distinct E keys from the successful task's 2–3 qualifying feature proofs and its one reference key; supportingImageIds is its representative only.

AnswerReference is the accepted strict owner/field/value/status/source type. The public reference array is exactly the union of E keys used by blocks, comparisons and identified results, at most 64 total, in catalogue order; unknown/unused/missing references are rejected. ReferenceImages is exactly the reference keys used by public comparisons, with no duplicates, and comparisons must bind its image to that candidate's artwork. Omit object paths, grants, signed URLs, raw image data, model IDs, usage and provider bodies. At most four public comparisons and reference rows. The client validates every cross-reference and canonical text against its immutable request plus the returned current observations/provenance.

A clarification has empty blocks/references/observations/groups/referenceImages/comparisons and notices=[]. Its optional reread action is authored from needs_image or the server's missing-current-input guard; sourceTurnId equals request.turnId, sourceAssistantId equals the new assistant ID, and targets resolve to the captured request manifest. A general clarification has reread=null. No partial observations are published on clarification.

## Canonical Text and Notices

Use exact prefixes `图片观察与解读：`, `此前图片观察：`, `数据库依据：`, `通用知识补充：`. Visual current/prior classification follows the referenced observation origin. Each block is prefix + outer-trimmed text + markers, with no extra spaces or separators. Visual markers are `[图片{displayIndex}]` in display order; archive markers are `[E{n}]` in ascending numeric order; general blocks have none. Preserve internal text. Join blocks with two LF characters.

Then append server-owned identity lines per group:

- identified: `档案对应：图片 {indices} → {actual title}（编号核对）。` or `档案对应：图片 {indices} → {actual title}（图像与档案特征核对）。`, followed immediately by ascending E markers and then its R marker for reference identity. indices lists only supportingImageIds as decimal display indices joined with literal comma and no spaces.
- candidates: `待核对候选：图片 {indices} → {candidate labels joined with 、}。尚未确认具体对应。`
- no_match: `档案检索：图片 {indices}未找到匹配作品记录。`
- insufficient_evidence: `档案对应：图片 {indices}的依据不足，暂无法确认。`
- not_requested: no identity line.

Nonidentified group lines use all group display indices in order with the same comma rule. Append accepted `记录索引：[E…] {label} / {Chinese field label}` lines using the existing FIELD_LABELS mapping, then `对照图索引：[R…] {candidate label} / 档案参考图` lines, in numeric key order. Blocks, identity lines and index lines are all joined with two LF characters. Append each applicable notice with one LF, in the order below, then outer-trim the whole result. Clarification is exactly its trimmed question, plus one LF + `重新查看：` + adjacent target `[图片N]` markers in display order when reread is nonnull. No archive/index/notice lines occur in a clarification.

| NoticeCode, fixed order | Chinese text and applicability |
| --- | --- |
| no_retrieval | 本次未检索数据库。 — zero queries |
| no_matches | 数据库未找到匹配记录，以下内容不代表数据库结论。 — queries completed with zero roots overall |
| record_only | 部分依据仅为数据库记录，尚无对应字段的外部来源确认。 — any used fact lacks matching field-scoped support |
| candidate_limit | 检索候选已达上限，结果不代表完整档案。 — any query/group pool is capped |
| uncertain_records | 引用记录存在待核验或归属不确定的信息，请结合来源核实。 — accepted field/attribution rules |
| image_interpretation | 图片观察可能有误，细节与作品对应关系请结合档案依据核实。 — current observations are used |
| prior_observations | 沿用此前图片观察，本次未重新读取这些图片。 — a block uses historical observations |
| reference_compared | 本次已对所选图片与获准的档案参考图进行定向核对。 — comparisons is nonempty |
| reference_limited | 参考图不足、权限限制或核对范围有限，部分对应关系仍待确认。 — any references_missing/reference_not_authorized/reference_limit reason |

No duplicate notices; no_retrieval/no_matches are exclusive. New v2 messages do not use the misleading legacy image_history_omitted notice. Retain the existing 3,500-code-point canonical and 128,000-byte reply caps; excess reference/label expansion is evidence_too_large, not silent truncation. Archived message text is unchanged; new canonical text is checked exactly before commit.

### Interaction Copy

These fixed strings complement the canonical notices and existing corrective text; they are interface labels/help, not additional context messages.

| Use | Simplified Chinese copy |
| --- | --- |
| Historical selection / remove | 用于本次提问 / 取消选择 |
| Group / remove grouping | 标为同一件作品 / 取消分组 |
| Grouping help | 分组仅用于整理图片，不代表已确认作品对应。 |
| Reread / cost hint | 重看图片并回答 / 重看会发起新的 AI 请求，可能产生费用。 |
| Active count | 每次最多可同时查看 4 张图片，请减少新图片或取消已选历史图片。 |
| Page retention | 图片上下文已达到本次对话上限，请刷新页面后重新选择图片。刷新会清空当前全部对话、图片和草稿。 |
| Processing disclosure | 所选图片将发送至 DeepSeek 处理。本应用仅在当前页面和请求过程中临时使用图片，刷新会清空对话、图片和草稿。 |
| Disabled/unavailable vision | 图片理解服务暂不可用，请稍后重新提问。 |
| Invalid image context | 图片上下文无效，请刷新页面后重新选择图片。刷新会清空当前全部对话、图片和草稿。 |
| Unavailable archive reference | 档案参考图暂不可用，当前无法完成核对。 |

reference_failed uses the existing transient failure/retry presentation with the fresh-AI-request hint. Identity reason labels explain the applicable enum in plain Chinese under the server-owned panel; they do not alter canonical history or claim inspected assets. All identifiers remain structured data, not visitor-facing UUID instructions.

## Failure and Retry Contract

Retain all accepted codes/statuses. Add:

| Code | HTTP | Meaning | Identical manual retry |
| --- | --- | --- | --- |
| invalid_image_context | 422 | bad image/observation ownership, missing or unknown reference/hash association | no |
| image_context_too_large | 422 | more than four active inputs or twenty request descriptors | no |
| reference_unavailable | 503 | required reference configuration/access/content is unusable after an attempted read, including 401/403/404, digest/format/size errors | no |
| reference_failed | 502 | transient reference network/429/5xx failure | eligible final turn only |

Missing/stale/denied manifest grants are pre-read evidence limitations, not attempted-read failures. A required malformed nonempty operator configuration yields reference_unavailable only when that branch is needed; it does not block a sufficient independent identifier route. Empty grant configuration is valid. A stage/shared deadline maps to generation_timeout; parent cancellation publishes no assistant output. Invalid model schemas remain invalid_model_output. Unknown request versions/fields remain invalid_request. Byte/pixel corruption uses existing invalid_image/request_too_large. All outcomes are no-store; raw diagnostics never leave the server. Manual retries repeat visitor snapshots but retrieve archive/permission state afresh.

For validation precedence, malformed JSON/object variants, unknown keys/enums or invalid message identities use invalid_request. Observation item/count/text bounds or origin/descriptor/hash association failures use invalid_image_context; the same observation-body violation in model output uses invalid_model_output. An actual selected-byte digest/MIME/dimension mismatch uses invalid_image, distinct from a historical observation's mismatched hash association. More than four inputs/twenty descriptors uses image_context_too_large; message/combined-text/provider-analysis-envelope overflow uses context_too_large. Streamed request bytes above 4,000,000 use request_too_large; expanded answer evidence/canonical overflow uses evidence_too_large. Client preflight preserves the draft before any HTTP request.
