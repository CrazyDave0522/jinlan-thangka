## MODIFIED Requirements

### Requirement: Text submission gestures

The system SHALL submit a draft containing nonempty text or at least one prepared image by send button, preserve internal newlines, and reject drafts containing neither usable text nor a prepared image. Desktop Enter SHALL send and Shift+Enter SHALL insert a newline; mobile/touch Enter SHALL insert a newline. Input-method composition confirmation SHALL NOT submit a message.

#### Scenario: Submit valid text

- **WHEN** a visitor submits a nonempty draft with surrounding whitespace
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

### Requirement: Ordered current-page context

The system SHALL snapshot ordered eligible text/image history and the current user message exactly once per request. It SHALL include completed user/assistant content and settled unavailable user turns with their complete ordered prepared image bytes, exclude earlier failed turns, statuses and drafts, and retain stable turn identity for retry.

#### Scenario: Submit a follow-up

- **WHEN** a visitor submits a follow-up after completed exchanges or unavailable turns
- **THEN** the request contains their eligible text and prepared image contents in order followed by the current turn once
- **AND** it excludes UI notices, earlier failed turns, retry metadata, and unsent draft text.

#### Scenario: Retry a failed final turn

- **WHEN** a visitor retries the final user turn after a transient failure while no request is active
- **THEN** the request reuses its original user-message/attachment identities, prepared bytes, and logical context snapshot without appending another user message
- **AND** the retried question remains in its request exactly once; excluding failed history does not remove the question being retried.

#### Scenario: Continue after unavailable turns

- **WHEN** several valid user questions have settled as generation-unavailable without assistant replies
- **THEN** the next request retains these eligible user messages in order
- **AND** request validation accepts consecutive user entries rather than requiring alternating roles.

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

The real endpoint SHALL return a distinct generation-unavailable outcome for valid text-only or image-bearing requests until live AI is integrated. The UI SHALL represent it as a settled system status, not an assistant answer. Synthetic successful replies SHALL exist only in tests and development-only verification.

#### Scenario: Submit before AI integration

- **WHEN** a valid text-only or image-bearing request reaches the real application endpoint
- **THEN** the endpoint returns HTTP 503 with `error.code` equal to `generation_unavailable`, without a provider call, stored conversation, or persisted visitor image
- **AND** the page shows `AI 回复暂未接入，暂时无法回复。` beside the turn, appends no assistant answer, and permits another valid submission.

#### Scenario: Test a successful response boundary

- **WHEN** a test supplies a valid matching assistant response through the transport boundary
- **THEN** the answer appears once after its user message and can participate in later context
- **AND** this mocked success path does not enable product canned responses.

### Requirement: Request validation and failure recovery

The system SHALL validate request/response shapes, reject unsupported roles and malformed submissions or user entries with neither text nor images, bound pending requests, and retain failed user messages. Only a transiently failed final user turn with no active request SHALL offer retry; a new later turn SHALL retire historical retry and exclude the failed turn from future context.

#### Scenario: Reject an invalid request

- **WHEN** the endpoint receives invalid JSON, unsupported message roles, duplicate/blank message IDs, an empty message list, a final entry that is not a user message matching `turnId`, or a user entry with neither nonblank text nor images, or blank assistant text
- **THEN** it returns HTTP 400 with `error.code` equal to `invalid_request`, without persisting, executing, or forwarding the supplied content.

#### Scenario: Show a retryable failure

- **WHEN** a request fails through network error, timeout, an unexpected HTTP outcome outside defined corrective errors, or a malformed/mismatched response
- **THEN** the page retains its user message, shows `发送失败，请重试。`, and offers retry only while it is the final user turn and no request is active
- **AND** retry preserves the current draft and never duplicates that user message.

#### Scenario: Continue after a failure

- **WHEN** a visitor submits a new question after an earlier failed turn
- **THEN** the earlier failure remains visible as `发送失败。` without a retry action or retry instruction, and is excluded from the new request context.

#### Scenario: Distinguish unavailable from a generic failure

- **WHEN** a request receives HTTP 503 with an unexpected body, HTTP 400, or another non-success result outside the defined generation-unavailable combination
- **THEN** the client uses the failure state rather than claiming that AI integration is the cause.

#### Scenario: Return uncached request outcomes

- **WHEN** the endpoint returns a generation-unavailable, invalid-request, invalid-image, unsupported-media-type, or request-too-large result
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
