## MODIFIED Requirements

### Requirement: Image message submission

The system SHALL accept an ordered set of user-selected image attachments, optionally with text, using page-local files and transient request processing without application persistence. Selection or submission SHALL NOT imply that AI image interpretation is available.

#### Scenario: Submit an image with a question

- **WHEN** a user selects an image, adds a question, and successfully submits the message
- **THEN** the conversation displays the image with its accompanying question
- **AND** the request transmits the actual required image contents without saving them in Supabase Storage.

#### Scenario: Submit several images for a later comparison

- **WHEN** a user submits two or three valid images and a question about their differences
- **THEN** one user turn contains the complete ordered set and the question with consistent image labels
- **AND** the server returns image_understanding_unavailable without a provider call until interpretation is integrated, preserving visible attachments and the question.

#### Scenario: Submit images without text

- **WHEN** a user submits a valid selected image set with empty or whitespace-only text
- **THEN** the image-only turn is accepted without inventing question text.

#### Scenario: Keep valid image submission available during text-only generation

- **WHEN** the user submits prepared images within the existing count/size/context limits
- **THEN** client preflight does not block the turn merely because visual AI is not implemented
- **AND** server capability feedback remains distinct from corrupt-image or oversized-input errors, with no identical retry offered.


### Requirement: Transient validated image payload

The system SHALL submit canonical base64 prepared bytes with stable IDs, validated MIME/dimensions and turn association through the existing JSON `POST /api/chat` contract defined in the design. It SHALL preserve text-only JSON compatibility, independently bound streamed request bytes before parsing, validate prepared image contents and reject unsupported/animated/corrupt images, without writing visitor files anywhere persistent.

#### Scenario: Validate received contents independently

- **WHEN** the server receives an image-bearing request
- **THEN** it enforces body/image byte and pixel limits, checks strict base64, supported MIME/signature, complete decoding, actual dimensions and per-turn count/ID rules
- **AND** a valid current image turn returns image_understanding_unavailable with no provider or Storage call; eligible historical images may accompany a text-only follow-up but are never forwarded to the text model.

#### Scenario: Bypass a declared body size

- **WHEN** Content-Length is absent or does not accurately describe an oversized body
- **THEN** actual stream byte counting still rejects a body above 4,000,000 bytes without unbounded parsing.

#### Scenario: Account for encoded and retained image memory

- **WHEN** preparing, retaining, or serializing images shared by turns and immutable context snapshots
- **THEN** prepared bytes are retained by shared attachment identity, temporary encodings are released after use, and original files/bitmaps are released after preparation
- **AND** exceeding the retained prepared-blob budget rejects the new batch with an explicit refresh/full-clear warning instead of evicting existing images.

#### Scenario: Reject oversized context before encoding images

- **WHEN** metadata JSON byte size plus exact base64 expansion of eligible blobs exceeds 4,000,000 bytes
- **THEN** no full image encoding, user turn append, or fetch starts and the current draft remains available
- **AND** an allowed body is checked again after actual serialization before sending.

#### Scenario: Lock during asynchronous encoding

- **WHEN** repeated click/Enter events or retry activation occur while image encoding is pending
- **THEN** one accepted turn/attempt remains active, protected by a lock acquired before asynchronous work
- **AND** the 65-second client deadline also covers encoding and cannot allow late work to mutate a newer attempt.
