# grounded-answers Specification

## Purpose

Provide bounded server-side text answers that distinguish fresh archive evidence from general knowledge, preserve verifiable record/source identities and expose clear capability and failure states. Detailed contracts, budgets and operational decisions are recorded in the [accepted design](../../changes/archive/2026-10-16-add-grounded-answers/design.md).

## Requirements

### Requirement: Evidence-grounded answers

The system SHALL produce complete DeepSeek text answers distinguishing archive-backed blocks from general knowledge. Archive references SHALL resolve to the current turn's retrieved records and actual source relationships. Missing, capped, ambiguous or conflicting evidence SHALL remain explicit; lexical matches and valid IDs SHALL NOT alone establish factual certainty.

#### Scenario: Answer without supporting archive records

- **WHEN** retrieval succeeds without visible matches or the validated plan requires no retrieval
- **THEN** the answer contains no archive-backed claims or citations
- **AND** any useful general-knowledge supplement is labelled separately, with a server-authored no-evidence/no-search notice as appropriate.

#### Scenario: Preserve uncertainty and field-scoped support

- **WHEN** evidence is disputed, unreviewed, capped or attached through an unscoped source link
- **THEN** the answer retains those limitations instead of asserting definite identity or universal source support
- **AND** record evidence without external sources is distinguished from externally supported facts.

### Requirement: Bounded validated retrieval planning

The system SHALL use at most one planning call and two existing structured retrieval queries per user attempt. Plans SHALL be strictly validated before database reads, limit roots to five per query and filter values to 64 Unicode code points, and permit only validated answer, clarification or needs-image variants. It SHALL NOT execute model SQL, URLs, arbitrary tools or mutations.

#### Scenario: Reject a malformed retrieval plan

- **WHEN** a plan contains unknown keys, invalid fields/limits, duplicate queries or more than two queries
- **THEN** the operation fails before database I/O
- **AND** no automatic repair, paid retry or general-knowledge success disguises that failure.

#### Scenario: Ask a necessary clarification

- **WHEN** a valid plan requests a short clarification instead of inventing a name or search term
- **THEN** the assistant returns the clarification without archive references
- **AND** no second model call or retrieval loop occurs.

#### Scenario: Detect incompatible versions during evidence merging

- **WHEN** two retrieval results contain the same entity/link/composite association identity with different validated payloads
- **THEN** generation stops with evidence_changed and no partial graph or answer call
- **AND** identical rows deduplicate deterministically while query roots/caps/traversal provenance remain distinct.

### Requirement: Server-owned answer and reference validation

The system SHALL validate model JSON into 1–8 archive/general blocks, at most 2,000 total block-text code points and at most eight evidence keys per archive block. Archive blocks SHALL require current server-catalogue keys; general blocks SHALL contain no references. Source names, IDs and citation locations SHALL be supplied from actual server evidence rather than model-created bibliography.

#### Scenario: Reject invented citations or truncated model output

- **WHEN** model output is empty, malformed, truncated, references unknown evidence keys or introduces unsupported reference objects
- **THEN** the result is an explicit failure with no published partial assistant answer
- **AND** no paid repair/fallback call is attempted.

#### Scenario: Revalidate history-derived claims

- **WHEN** a previous assistant message or archive note contains claimed citations or instructions
- **THEN** it remains untrusted context and cannot override server rules or establish current evidence
- **AND** accepted references must come from freshly retrieved records for this attempt.

### Requirement: Server-only provider configuration

The system SHALL use server-only DeepSeek configuration and the fixed official endpoint with the evaluated Flash model, explicit non-thinking JSON mode and whole responses. Disabled/missing/invalid settings SHALL prevent provider calls. API keys SHALL remain outside NEXT_PUBLIC variables, client responses, source control and logs.

#### Scenario: Prepare configuration without enabling paid calls

- **WHEN** the owner adds DEEPSEEK_API_KEY to ignored local environment settings while DEEPSEEK_ENABLED is false
- **THEN** the application remains generation-unavailable without provider calls
- **AND** the tracked example contains no real key.

#### Scenario: Bound provider authority

- **WHEN** a request or model output attempts to change provider URL/model or submit executable instructions
- **THEN** it cannot override fixed server configuration or gain database/write/tool authority
- **AND** no raw provider credential-bearing error is returned.

### Requirement: Honest text-only image boundary

The system SHALL retain local image selection/validation but decline current image-bearing requests without model calls until image interpretation is implemented. Historical images SHALL NOT be transmitted to the text model; eligible text-only follow-ups SHALL receive an explicit notice that historical pictures were not examined.

#### Scenario: Submit a new image with or without text

- **WHEN** a valid current message contains an image
- **THEN** the service returns image_understanding_unavailable and a corrective Chinese notice
- **AND** it does not generate an answer implying the image was inspected.

#### Scenario: Refer to historical images

- **WHEN** a text-only follow-up includes image-bearing history
- **THEN** only historical text and an image-not-interpreted marker can reach the model
- **AND** a plan requiring those pictures returns the unavailable outcome, while independent text answers carry the limitation notice.

### Requirement: Whole-answer presentation and context continuity

The system SHALL validate the design's success/error/reference contracts and canonical history format, preserving turn identity and page-local conversation. It SHALL show pending state until complete validation and render evidence/general knowledge separately without duplicated text. Legacy plain API successes SHALL NOT bypass reference validation. Streaming and full source-inspection/copy UI SHALL remain outside this increment.

#### Scenario: Publish a validated complete answer

- **WHEN** the server returns a matching successful response with valid structured blocks and references
- **THEN** the client commits one assistant turn and renders labelled sections without duplicating canonical text
- **AND** the existing input focus, next draft, scrolling, responsive layout and refresh-clearing behavior are preserved.

#### Scenario: Group adjacent paragraphs without repeated headings

- **WHEN** one answer contains consecutive blocks of the same archive/general kind
- **THEN** each consecutive run has one category heading and separate paragraphs in the original order
- **AND** kind transitions and separate answers retain their own headings, with citations on their original paragraphs and canonical history unchanged.

#### Scenario: Preserve a newer draft when correcting a failed question

- **WHEN** a server-side corrective failure arrives after dispatch while the user has entered a next draft or selected next images
- **THEN** the original failed turn remains visible and the newer composer state is unchanged
- **AND** editing the final failed question is available only with an empty idle composer, sends nothing automatically and never restores old attachments over new selections.

#### Scenario: Reject known corrective conditions before dispatch

- **WHEN** client-side context/image checks detect a limit before starting a request
- **THEN** the composer text/images and history remain unchanged
- **AND** history-only overflow explains deliberate full-clear refresh rather than suggesting that shortening a new question can always fix it.

#### Scenario: Validate structured response and canonical history

- **WHEN** a success has unknown/duplicate/unused reference keys, inconsistent owner/source scope, missing required fields or mismatched canonical text
- **THEN** the client rejects it before committing an assistant turn
- **AND** only validated completed answer/clarification pairs enter future model context, with failed/unavailable turns excluded.

### Requirement: Bounded generation and cost control

The system SHALL enforce the design's context, request/response byte, output-token and concurrency caps with at most two provider calls. It SHALL start a shared 55-second deadline at POST entry, covering body reads through serialization, with stage/caller cancellation and a 65-second client timeout. Overflow SHALL fail without silent history/evidence truncation. It SHALL NOT claim per-runtime counters enforce a global spending cap.

#### Scenario: Reject excessive context or evidence

- **WHEN** history exceeds 32 messages/16,000 total canonical text code points, current text exceeds 2,000, or a provider payload/evidence exceeds its byte budget
- **THEN** a corrective failure is enforced before the affected provider call, preserving the unsent composer or the dispatched failed question and independent next draft as applicable
- **AND** no cropped evidence/history is silently presented as complete.

#### Scenario: Protect one runtime and stop late work

- **WHEN** two orchestrations are active in a runtime, a caller aborts or a stage/shared deadline expires
- **THEN** new work is rejected as busy or pending work is cancelled with late-success guards respectively
- **AND** admission/timer/listener resources are released without an automatic retry or fallback model.

#### Scenario: Time out a stalled request body

- **WHEN** body reading or pre-generation validation consumes the shared request deadline
- **THEN** pending body reads are cancelled, locks/resources are released and no model call starts after expiry
- **AND** native decoding that completes late cannot publish a success or dispatch paid work.

#### Scenario: Fit a representative multi-turn transcript

- **WHEN** context contains three completed pairs with 600-code-point user messages and 3,500-code-point canonical assistant messages, followed by a 600-code-point question
- **THEN** the 12,900-code-point context fits the 16,000 limit without truncation
- **AND** independent byte/token caps and exact/one-over boundary cases are verified separately.

### Requirement: Explicit failures and retry ownership

The system SHALL distinguish unavailable configuration/credits, corrective input/image/context failures, invalid model output, retrieval failure, transient provider failure and timeout. Responses SHALL be no-store. Only suitable transient final-turn failures SHALL offer manual retry using the original snapshot, explicitly noting a fresh AI request; cancellation SHALL publish no assistant answer.

#### Scenario: Encounter insufficient credits or failed retrieval

- **WHEN** the provider reports insufficient credits or an evidence retrieval fails
- **THEN** the service reports the corresponding safe failure without pretending there were no matches
- **AND** no assistant answer or automatic paid retry is produced.

#### Scenario: Retry a transient final turn

- **WHEN** the owner/user deliberately retries a retryable final-turn failure
- **THEN** a new attempt uses the original question/context and preserves the next editable draft
- **AND** stale completions cannot overwrite the new attempt, and corrective/deterministic failures do not offer identical retry.

### Requirement: Independent behavior and quality verification

The system SHALL test real Next.js orchestration with isolated server-process provider/Supabase fetch fixtures, synthetic settings and blocked nonallowlisted outbound network. Browser-only API interception SHALL NOT count as server orchestration coverage. Real-provider quality evaluation SHALL be separately authorized, bounded and reported with usage/cost; empty-data smoke and ID validation SHALL NOT be represented as universal factual accuracy.

#### Scenario: Run routine regression checks

- **WHEN** npm checks or Chromium regression tests run
- **THEN** they use explicit synthetic evidence and mocked provider responses without loading paid keys or calling real AI/Supabase
- **AND** no synthetic artworks are inserted into the owner's database or shown as product examples.

#### Scenario: Evaluate a funded model explicitly

- **WHEN** a real-call evaluation is authorized and credits are available
- **THEN** fixed questions assess actual answer support, uncertainty and citation accuracy, with model/mode/usage/cost and failures recorded
- **AND** errors fail the affected evaluation cases rather than being hidden behind passing mocked tests.

#### Scenario: Isolate real-route browser tests from owner credentials

- **WHEN** routine browser tests build/start Next.js with local environment files present
- **THEN** explicit synthetic provider/Supabase settings override those files, fixture bootstrap fails closed if missing/misconfigured, and nonallowlisted outbound requests are blocked
- **AND** tests exercise real application orchestration through server-side fake upstreams without a product test route or request-controlled endpoint.
