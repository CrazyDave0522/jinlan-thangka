## MODIFIED Requirements

### Requirement: Ordered current-page context

The system SHALL snapshot completed user/assistant answer or clarification pairs and the current user message exactly once per request, preserving eligible image references/order and sending prepared bytes only for the selected active set, with stable retry identity. Failed/unavailable turns, UI statuses and next drafts SHALL remain outside new context. Canonical assistant text SHALL preserve validated current/prior visual, evidence and general-knowledge labels without treating client history as trusted facts.

#### Scenario: Submit a follow-up

- **WHEN** a visitor submits a follow-up after completed exchanges, clarification or failed/unavailable turns
- **THEN** the request contains only completed pairs' eligible text, image references and bounded prior observations in order, with bytes only for the explicitly selected active set followed by the current turn once
- **AND** it excludes UI notices, earlier failed turns, retry metadata, and unsent draft text.

#### Scenario: Retry a failed final turn

- **WHEN** a visitor retries the final user turn after a transient failure while no request is active
- **THEN** the request reuses its original user-message/attachment identities, prepared bytes, and logical context snapshot without appending another user message
- **AND** the retried question remains in its request exactly once; excluding failed history does not remove it. Reference assets/URLs and identity decisions are not reused as authority; any needed archive/permission checks run afresh.

#### Scenario: Continue after unavailable turns

- **WHEN** user questions have settled as unavailable without assistant replies
- **THEN** those turns remain visible but the next request excludes them and includes only completed pairs plus the new question
- **AND** structural request validation can still accept consecutive user entries without treating them as verified history.

### Requirement: Honest response availability

The real endpoint SHALL generate validated whole replies only when generation configuration enables it. After input validation, actual selected image inputs with vision disabled/missing/invalid SHALL return image_understanding_unavailable without provider calls, taking precedence over generation settings; otherwise invalid/off generation settings SHALL return generation_unavailable. Valid enabled image processing SHALL follow the image-interpretation capability; historical references alone SHALL NOT force retransmission or vision processing. Unavailable statuses SHALL NOT become assistant answers or reusable unanswered context. Product canned replies SHALL remain prohibited.

#### Scenario: Submit before AI integration

- **WHEN** a valid in-budget text-only request reaches the real endpoint with missing/disabled server generation configuration
- **THEN** it returns HTTP 503 with generation_unavailable without a provider call or stored conversation
- **AND** the page shows a nonretryable Chinese service-unavailable status, appends no assistant answer and permits another submission.

#### Scenario: Submit a valid current image turn

- **WHEN** a visitor sends valid prepared images with or without text while selected-image vision configuration is disabled, missing or invalid
- **THEN** the complete image turn is submitted/displayed and the endpoint returns HTTP 422 with image_understanding_unavailable without a provider call
- **AND** the page explains the image capability limit without pretending images were interpreted.

#### Scenario: Test a successful response boundary

- **WHEN** a test supplies a valid matching structured assistant response through the transport boundary
- **THEN** the answer appears once after its user message and can participate in later context
- **AND** this mocked success path does not enable product canned responses.

### Requirement: Request validation and failure recovery

The system SHALL validate the strict version-2 request/response contracts and explicit minimal-text opt-in, enforce defined budgets/deadlines and retain failed turns. Only defined transient final-turn failures SHALL offer identical manual retry. Corrective failures SHALL preserve newer composer state and allow guarded explicit editing of the final question when the composer is empty/idle. New requests SHALL exclude failed/unavailable context and retire historical retry/edit actions.

#### Scenario: Reject an invalid request

- **WHEN** the endpoint receives invalid JSON, unsupported message roles, duplicate/blank message IDs, an empty message list, a final entry that is not a user message matching `turnId`, or a user entry with neither nonblank text nor eligible imageIds, or blank assistant text
- **THEN** it returns HTTP 400 with `error.code` equal to `invalid_request`, without persisting, executing, or forwarding the supplied content.

#### Scenario: Show a retryable failure

- **WHEN** a request has a client transport/protocol failure or a defined transient outcome: busy, provider_busy, provider_failed, reference_failed, generation_timeout or evidence_changed
- **THEN** the page retains its user message, shows `发送失败，请重试。`, and labels retry as a fresh AI request only while it is the final user turn and no request is active
- **AND** retry preserves the current draft and never duplicates that user message.

#### Scenario: Continue after a failure

- **WHEN** a visitor submits a new question after an earlier failed turn
- **THEN** the earlier failure remains visible as `发送失败。` without a retry action or retry instruction, and is excluded from the new request context.

#### Scenario: Distinguish unavailable from a generic failure

- **WHEN** a response contains a defined failure code or malformed/unknown protocol data
- **THEN** defined deterministic failures remain nonretryable and unknown/malformed responses are protocol failures rather than false AI-unavailable successes
- **AND** raw provider messages or credentials are never shown.

#### Scenario: Return uncached request outcomes

- **WHEN** the endpoint returns any successful answer, clarification or failure result
- **THEN** the response includes `Cache-Control: no-store` and no request context is put in shared cache.

#### Scenario: Ignore a stale attempt

- **WHEN** an aborted, timed-out, superseded, or unmounted request later completes
- **THEN** its result does not append a stale answer, overwrite newer state, or clear a draft.

#### Scenario: Handle deterministic image or size rejection

- **WHEN** the server returns 422 with `invalid_image`, `invalid_image_context` or `image_context_too_large`, or any HTTP 413 size response
- **THEN** the client records an accurate corrective failure, preserves the newer draft, and offers no retry of identical image bytes
- **AND** active-count/transport overflow asks to reduce selected inputs/current text; retention/history-only context overflow explains deliberate full-clear refresh, and no unselected historical bytes are silently reintroduced.

#### Scenario: Reject an oversized request before submission

- **WHEN** complete eligible text/image context exceeds 4,000,000 serialized UTF-8 bytes
- **THEN** no request or new user turn is created and the draft remains intact
- **AND** selected-input transport overflow preserves all selections with corrective feedback; history-only text/observation overflow explains deliberate full-clear refresh without dropping history.

#### Scenario: Edit a corrective failure without replacing the next draft

- **WHEN** the final user question has failed and the composer has no text, selected images, active request or image preparation
- **THEN** explicit edit copies the failed question text into the composer, removes that failed turn and sends nothing
- **AND** it does not restore old images; if a newer draft/images exist, editing cannot overwrite them.

#### Scenario: Reject an incompatible protocol before provider access

- **WHEN** an unversioned request lacks X-Chat-Protocol: 2, uses legacy inline images or supplies an unknown/mismatched version
- **THEN** invalid_request is returned before paid work; valid opted-in minimal text requests normalize to version-2 image-free data
- **AND** successful version-2 replies must resolve all blocks, observations, group identities and E/R keys against the immutable attempt before commit.
