# image-upload Specification

## Purpose
Define ordered multi-image selection, bounded preparation and validation, transient request submission, retry/context reuse, and page-local visitor image lifetime without persistence. Curated artwork storage and actual AI interpretation are separate capabilities.

## Requirements

### Requirement: Image message submission

The system SHALL accept an ordered set of user-selected image attachments, optionally with text, using page-local files and transient request processing without application persistence. Selection or submission SHALL NOT imply that AI image interpretation is available.

#### Scenario: Submit an image with a question

- **WHEN** a user selects an image, adds a question, and successfully submits the message
- **THEN** the conversation displays the image with its accompanying question
- **AND** the request transmits the actual required image contents without saving them in Supabase Storage.

#### Scenario: Submit several images for a later comparison

- **WHEN** a user submits two or three valid images and a question about their differences
- **THEN** one user turn contains the complete ordered set and the question with consistent image labels
- **AND** disabled vision returns image_understanding_unavailable without a provider call; enabled processing follows the image-interpretation capability while preserving visible attachments and the question.

#### Scenario: Submit images without text

- **WHEN** a user submits a valid selected image set with empty or whitespace-only text
- **THEN** the image-only turn is accepted without inventing question text.

#### Scenario: Keep valid image submission available during text-only generation

- **WHEN** the user submits prepared images within the existing count/size/context limits
- **THEN** client preflight does not block the turn merely because visual AI is disabled or unavailable
- **AND** server capability feedback remains distinct from corrupt-image or oversized-input errors, with no identical retry offered.

### Requirement: Local image selection

The system SHALL preview selected images locally, allow removal and replacement, preserve order, and avoid requests on selection alone. Invalid selection or picker cancellation SHALL preserve existing valid draft state.

#### Scenario: Remove a selected image

- **WHEN** a user removes a preview before sending
- **THEN** only that selected image is removed and remaining images/text are preserved
- **AND** obsolete preview resources are released without a remote delete operation.

#### Scenario: Remove an image during batch preparation

- **WHEN** a visitor removes an image while a new batch is preparing
- **THEN** uncommitted batch work is invalidated and its late results cannot reappear
- **AND** latest text and remaining selection edits survive; rollback does not restore removed images.

### Requirement: Complete attachment submission and recovery

The system SHALL treat a multi-image message as one turn and retain the captured image set needed for final-turn-only retry in page-local memory. It SHALL NOT silently submit a partial image set or drop any selected active attachment to fit a request limit. Eligible history SHALL retain references and bounded prior observations, while historical bytes SHALL be transmitted only after explicit selection under the image-interpretation capability.

#### Scenario: Fail to prepare or transmit a required attachment

- **WHEN** image preparation, validation, or request transmission fails
- **THEN** the system does not present a reduced set as successfully submitted
- **AND** recoverable final-turn retry uses the original image identities/order and text without duplicating the turn or changing a newer draft.

#### Scenario: Retain a corrected draft after server image rejection

- **WHEN** an accepted image request receives 422 with `invalid_image`
- **THEN** the turn remains failed without an identical-byte retry, and `图片无法处理，请检查图片后重新选择并发送。` explains corrective action
- **AND** newer draft contents remain untouched; a corrected submission creates a new turn without silently restoring the failed files.

#### Scenario: Reuse eligible images during a follow-up

- **WHEN** a visitor sends a follow-up referencing images from an eligible prior turn
- **THEN** its request preserves eligible prior image references/observations and includes only the explicitly selected historical bytes, along with the current turn once
- **AND** the system does not rely on a remote server fetching local preview URLs or on a persistent visitor-file store.

#### Scenario: Exceed the complete request budget

- **WHEN** required new and explicitly selected historical image contents plus other request data exceed the approved transport budget
- **THEN** the system exposes a clear limit outcome before transmission rather than silently omitting images or history
- **AND** when the retained page-image count/memory requires deliberate refresh, it shows `图片上下文已达到本次对话上限，请刷新页面后重新选择图片。刷新会清空当前全部对话、图片和草稿。`
- **AND** it retains current state until the visitor deliberately refreshes; it does not automatically refresh.

### Requirement: Ephemeral visitor images and separate curated assets

The system SHALL retain visitor images only in current-page memory and transient request processing, without intentional image persistence or image-content logging by the application. Supabase Storage SHALL serve curated knowledge-base artwork images separately; visitor submission SHALL NOT create curated records, require a visitor bucket, or install a retention/cleanup job.

#### Scenario: Submit images with an empty archive

- **WHEN** a visitor submits images while the archive has no records or Storage buckets
- **THEN** local selection, request submission, and attachment display work independently of archive data
- **AND** no artwork/image rows or Storage objects are created.

#### Scenario: Clear image state on reload

- **WHEN** the visitor reloads or closes the page
- **THEN** application-held image/draft/message state is not restored or replayed
- **AND** obsolete preview URLs and file references are released when the page state is disposed.

### Requirement: Bounded image input

The system SHALL enforce the original, prepared, complete-request, and retained-image limits below, independently on the client and server where applicable.

#### Scenario: Enforce the complete bounded image input contract

- **WHEN** the client prepares or the server validates selected and retained pictures
- **THEN** Validation SHALL preserve valid drafts and SHALL NOT silently discard or degrade selected image content. At most twenty distinct prepared attachment identities SHALL be retained across the page, counting drafts, failed previews and shared snapshots once per identity. Distinct active visitor inputs SHALL be at most four including new and explicitly selected historical pictures; unselected history SHALL remain available locally.

#### Scenario: Apply the configured numerical limits

- **WHEN** images are selected, prepared, retained or serialized for submission
- **THEN** originals are nonempty and at most 5,000,000 bytes, 16,000,000 pixels and 8,192 pixels per side; prepared images are at most 500,000 bytes and 1,600 pixels on their longest side
- **AND** complete JSON is at most 4,000,000 UTF-8 bytes including selected base64, historical references/observations and text, and retained prepared blobs are at most 32,000,000 bytes with shared blobs counted once.

#### Scenario: Reject an oversized original image

- **WHEN** a selected original file exceeds the approved per-image limit
- **THEN** the system identifies the oversized file and explains the limit before sending it
- **AND** existing valid images and text remain available.

#### Scenario: Check the complete payload

- **WHEN** preparing a request containing new attachments and explicitly selected historical images
- **THEN** the system checks the complete serialized request against the approved request budget, including text, metadata, and encoding overhead
- **AND** the server independently enforces applicable request and image validation.

### Requirement: Supported image count and formats

The system SHALL allow at most four new images per user message and at most four distinct active visitor images per attempt including selected history and accept JPEG (`.jpg`, `.jpeg`, `image/jpeg`) and PNG (`.png`, `image/png`) only. It SHALL validate image contents rather than relying only on filename or declared MIME type. WebP and other input or internal transmission formats SHALL NOT be used in this requirement.

#### Scenario: Select an unsupported image format

- **WHEN** a visitor selects a WebP or other unsupported file
- **THEN** the system explains that only JPG/JPEG and PNG are supported
- **AND** existing valid draft state is preserved.

#### Scenario: Exceed the image count

- **WHEN** a new selection would cause a message to exceed four images
- **THEN** the system explains the four-image limit rather than silently discarding files
- **AND** the previously valid draft remains available.

#### Scenario: Select history during asynchronous preparation

- **WHEN** new images are being prepared while the visitor selects historical images for the same draft
- **THEN** the client rechecks the combined active count before committing the prepared batch
- **AND** an overflowing batch is rejected atomically and its previews are released, preserving selected history and text; two new plus two historical pictures remain valid.

### Requirement: Bounded image preprocessing

The system MAY resize and re-encode images for transient transmission within approved limits. It SHALL follow the bounded 1600/1280 dimension and JPEG 0.85/0.75/0.65 or transparency-preserving PNG policy in the design, without upscaling. When processing is applied it SHALL make that behavior clear, preserve aspect ratio and orientation, and retain useful comparison detail. It SHALL NOT silently degrade pictures indefinitely to fit a full request.

#### Scenario: Prepare an image for transmission

- **WHEN** an accepted image requires preprocessing under the approved policy
- **THEN** the system indicates the image processing behavior and prepares a supported JPEG/PNG copy
- **AND** it preserves the image's orientation and aspect ratio and follows the approved quality and size bounds.

#### Scenario: Exhaust bounded preparation attempts

- **WHEN** all allowed preparation attempts fail to fit an image within 500,000 bytes
- **THEN** the new selection batch is rejected with a visible reason while the previous valid draft remains intact
- **AND** the system does not reduce detail below the defined floor or send an incomplete set.

### Requirement: Transient validated image payload

The system SHALL submit canonical base64 selected inputs and hashed descriptors through the strict version-2 [contract](../../changes/archive/2026-10-17-add-image-interpretation/contracts.md). Explicitly opted-in minimal text JSON SHALL remain accepted; unversioned stale requests SHALL fail before paid work. It SHALL independently bound streamed bytes, validate actual MIME/dimensions/hash and reject unsupported/animated/corrupt images without persisting visitor files.

#### Scenario: Validate received contents independently

- **WHEN** the server receives an image-bearing request
- **THEN** it enforces body/image byte and pixel limits, checks strict base64, supported MIME/signature, complete decoding, actual dimensions and per-turn count/ID rules
- **AND** selected inputs are forwarded only with valid enabled generation/vision; historical references/observations do not imply byte retransmission, no visitor Storage upload/persistence occurs, and curated reference reads follow their separate rights-gated contract.

#### Scenario: Bypass a declared body size

- **WHEN** Content-Length is absent or does not accurately describe an oversized body
- **THEN** actual stream byte counting still rejects a body above 4,000,000 bytes without unbounded parsing.

#### Scenario: Account for encoded and retained image memory

- **WHEN** preparing, retaining, or serializing images shared by turns and immutable context snapshots
- **THEN** prepared bytes are retained by shared attachment identity, temporary encodings are released after use, and original files/bitmaps are released after preparation
- **AND** exceeding the retained prepared-blob budget rejects the new batch with an explicit refresh/full-clear warning instead of evicting existing images.

#### Scenario: Reject oversized context before encoding images

- **WHEN** metadata/observation JSON byte size plus exact base64 expansion of selected blobs exceeds 4,000,000 bytes
- **THEN** no full image encoding, user turn append, or fetch starts and the current draft remains available
- **AND** an allowed body is checked again after actual serialization before sending.

#### Scenario: Lock during asynchronous encoding

- **WHEN** repeated click/Enter events or retry activation occur while image encoding is pending
- **THEN** one accepted turn/attempt remains active, protected by a lock acquired before asynchronous work
- **AND** the 65-second client deadline also covers encoding and cannot allow late work to mutate a newer attempt.
