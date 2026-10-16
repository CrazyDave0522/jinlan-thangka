# text-conversation Specification

## Purpose
Provide reliable text submission and ordered page-local conversation context, with explicit request states, safe retry, ephemeral lifetime, and accessible scrolling before live AI integration.

## Requirements

### Requirement: Text submission gestures

The system SHALL submit a draft containing nonempty text or at least one prepared image by send button within the defined input/context budgets, preserve internal newlines, and reject drafts containing neither usable text nor a prepared image. Desktop Enter SHALL send and Shift+Enter SHALL insert a newline; mobile/touch Enter SHALL insert a newline. Input-method composition confirmation SHALL NOT submit a message.

#### Scenario: Submit valid text

- **WHEN** a visitor submits a nonempty draft within the context limits with surrounding whitespace
- **THEN** one user message appears with outer whitespace trimmed and internal newlines preserved
- **AND** only that submitted draft is cleared and one request starts.

#### Scenario: Reject blank text

- **WHEN** the draft is empty or contains only whitespace and has no prepared images
- **THEN** send is disabled and keyboard/programmatic submission creates no message or request.

#### Scenario: Compose Chinese text

- **WHEN** Enter confirms an IME candidate or occurs during composition
- **THEN** no message or request is submitted and the composed draft remains available.

#### Scenario: Insert a newline

- **WHEN** a desktop visitor uses Shift+Enter or a mobile/touch visitor uses Enter
- **THEN** the draft gains a newline without submitting.

#### Scenario: Preserve an oversized text draft before dispatch

- **WHEN** known message/text/serialized context limits are exceeded before submission
- **THEN** no user turn or request is created and the complete composer text/images remain available
- **AND** existing-history overflow explains deliberate full-clear refresh without silently truncating context.

### Requirement: Ordered current-page context

The system SHALL snapshot completed user/assistant answer or clarification pairs and the current user message exactly once per request, preserving eligible prepared image bytes/order and stable retry identity. Failed/unavailable turns, UI statuses and next drafts SHALL remain outside new context. Canonical assistant text SHALL preserve validated evidence/general-knowledge labels without treating client history as trusted facts.

#### Scenario: Submit a follow-up

- **WHEN** a visitor submits a follow-up after completed exchanges, clarification or failed/unavailable turns
- **THEN** the request contains only completed pairs' eligible text and prepared image contents in order followed by the current turn once
- **AND** it excludes UI notices, earlier failed turns, retry metadata, and unsent draft text.

#### Scenario: Retry a failed final turn

- **WHEN** a visitor retries the final user turn after a transient failure while no request is active
- **THEN** the request reuses its original user-message/attachment identities, prepared bytes, and logical context snapshot without appending another user message
- **AND** the retried question remains in its request exactly once; excluding failed history does not remove the question being retried.

#### Scenario: Continue after unavailable turns

- **WHEN** user questions have settled as unavailable without assistant replies
- **THEN** those turns remain visible but the next request excludes them and includes only completed pairs plus the new question
- **AND** structural request validation can still accept consecutive user entries without treating them as verified history.

### Requirement: Single active request

The system SHALL allow only one active POST request per page, expose pending status, prevent duplicate submissions, and keep next text/image draft editing available, with sequential preparation and sending disabled until preparation completes. Request completion SHALL NOT overwrite a newer draft or apply an obsolete response to another turn.

#### Scenario: Submit repeatedly while pending

- **WHEN** a visitor rapidly clicks send or repeats the send shortcut while a request is active
- **THEN** only one user message and one active request are created, with status `正在处理…`
- **AND** send/retry remain disabled while the visitor can edit the next draft.

#### Scenario: Prevent duplicates before the fetch starts

- **WHEN** a submitted image turn is asynchronously encoding and competing send/retry events occur
- **THEN** the attempt lock prevents a second turn or request before fetch, not only while the network is pending
- **AND** the deadline covers encoding, fetch and response parsing and stale work cannot change a newer draft.

#### Scenario: Preserve a newer draft

- **WHEN** the visitor types a new text/image draft before the active request settles
- **THEN** success, unavailable, failure, or timeout updates only the submitted turn and retains the newer draft.

### Requirement: Honest response availability

The real endpoint SHALL generate validated whole text replies only when server configuration enables it. Missing/off configuration SHALL return generation_unavailable without a provider call. Current valid image turns SHALL retain submission/display but return image_understanding_unavailable until interpretation is integrated. Unavailable statuses SHALL NOT become assistant answers or reusable unanswered context. Product canned replies SHALL remain prohibited.

#### Scenario: Submit before AI integration

- **WHEN** a valid in-budget text-only request reaches the real endpoint with missing/disabled server generation configuration
- **THEN** it returns HTTP 503 with generation_unavailable without a provider call or stored conversation
- **AND** the page shows a nonretryable Chinese service-unavailable status, appends no assistant answer and permits another submission.

#### Scenario: Submit a valid current image turn

- **WHEN** a visitor sends valid prepared images with or without text while visual interpretation is unavailable
- **THEN** the complete image turn is submitted/displayed and the endpoint returns HTTP 422 with image_understanding_unavailable without a provider call
- **AND** the page explains the image capability limit without pretending images were interpreted.

#### Scenario: Test a successful response boundary

- **WHEN** a test supplies a valid matching structured assistant response through the transport boundary
- **THEN** the answer appears once after its user message and can participate in later context
- **AND** this mocked success path does not enable product canned responses.

### Requirement: Request validation and failure recovery

The system SHALL validate request/structured response shapes, enforce defined budgets/deadlines and retain failed turns. Only defined transient final-turn failures SHALL offer identical manual retry. Corrective failures SHALL preserve newer composer state and allow guarded explicit editing of the final question when the composer is empty/idle. New requests SHALL exclude failed/unavailable context and retire historical retry/edit actions.

#### Scenario: Reject an invalid request

- **WHEN** the endpoint receives invalid JSON, unsupported message roles, duplicate/blank message IDs, an empty message list, a final entry that is not a user message matching `turnId`, or a user entry with neither nonblank text nor images, or blank assistant text
- **THEN** it returns HTTP 400 with `error.code` equal to `invalid_request`, without persisting, executing, or forwarding the supplied content.

#### Scenario: Show a retryable failure

- **WHEN** a request has a client transport/protocol failure or a defined transient outcome: busy, provider_busy, provider_failed, generation_timeout or evidence_changed
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

- **WHEN** the server returns 422 with `invalid_image`, or any HTTP 413 size response
- **THEN** the client records an accurate corrective failure, preserves the newer draft, and offers no retry of identical image bytes
- **AND** size rejection uses the refresh/full-clear warning when historical images are involved, a reduce-current-images/text warning for current-only input, and a text/context warning when no images are involved.

#### Scenario: Reject an oversized request before submission

- **WHEN** complete eligible text/image context exceeds 4,000,000 serialized UTF-8 bytes
- **THEN** no request or new user turn is created and the draft remains intact
- **AND** image-history overflow shows the approved refresh/full-clear warning instead of dropping earlier images.

#### Scenario: Edit a corrective failure without replacing the next draft

- **WHEN** the final user question has failed and the composer has no text, selected images, active request or image preparation
- **THEN** explicit edit copies the failed question text into the composer, removes that failed turn and sends nothing
- **AND** it does not restore old images; if a newer draft/images exist, editing cannot overwrite them.

### Requirement: Ephemeral conversation lifetime

The system SHALL retain conversation, draft, image files/previews, and request state only in the current page lifetime, without browser or server persistence. Reload SHALL start an empty conversation and SHALL NOT replay prior requests.

#### Scenario: Reload an active conversation

- **WHEN** a visitor reloads after submitting messages or while a request is pending
- **THEN** the page returns to empty welcome guidance with an empty draft and no restored messages or replayed request.

#### Scenario: Preserve image resources on refresh and unmount cleanup

- **WHEN** an image-bearing page is refreshed, closed, or unmounted
- **THEN** image references/previews are released with the disposed page state and no image/message request is replayed
- **AND** no visitor images are restored from browser/server persistence.

### Requirement: Conversation scrolling and status accessibility

The system SHALL reveal a turn on explicit submission/retry and follow completion only when the visitor remains near the bottom. It SHALL preserve older-message reading and focus, announce statuses accessibly, and retain the shared visual system and mainstream responsive composer layout.

#### Scenario: Read older content during completion

- **WHEN** the visitor scrolls away from the bottom before a request settles
- **THEN** completion does not jump their reading position or move keyboard focus
- **AND** the input remains available at the bottom of the viewport.

#### Scenario: Follow an active turn

- **WHEN** a visitor submits or retries a message, or a request completes while they remain near the bottom
- **THEN** the relevant turn/status is visible within the message scroll region without covering the composer or footer
- **AND** pending, unavailable, and failure feedback is accessible without presenting status text as an AI answer.
