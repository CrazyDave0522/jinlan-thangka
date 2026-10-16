## MODIFIED Requirements

### Requirement: Message presentation

The system SHALL display supplied user text and up to four ordered JPEG/PNG image attachments on the right, and assistant content with the `雪域金澜` identity on the left. Supplied database evidence and general-knowledge supplements SHALL appear in distinguishable sections. Prepared attachment previews SHALL represent the transmitted images with stable turn-scoped labels and proportional grids. Presentation SHALL NOT generate factual claims or require external-service queries.

#### Scenario: Display a supplied exchange

- **WHEN** a user message contains an image and text followed by an assistant answer with evidence and general-knowledge content
- **THEN** the page displays the image and question together in the user bubble and the answer in an outlined assistant card
- **AND** the answer labels its supplied sections `数据库依据` and `通用知识补充`.

#### Scenario: Omit absent optional content

- **WHEN** a supplied message has no image or an answer has no content for an optional section or source area
- **THEN** the page omits that absent content without rendering broken image elements, empty headings, invented sources, or an empty source control.

#### Scenario: Display multiple image-only attachments

- **WHEN** a user turn has several images without text
- **THEN** its ordered labelled images remain visible in one user turn, wrapping within mainstream mobile/desktop content bounds
- **AND** no empty question text or invented assistant answer is displayed.

### Requirement: Conversation composer

The system SHALL provide an editable `消息内容` field with the established visual system, placeholder and evidence helper. Submission SHALL follow text-conversation and image-upload. The composer SHALL support a JPG/JPEG/PNG multi-file picker, up to four ordered previews, individual removal and contextual processing/lifetime guidance. It SHALL remain visible while messages scroll independently.

#### Scenario: Edit a local draft

- **WHEN** a visitor edits and submits valid text through a supported gesture
- **THEN** text submission follows the current text-conversation lifecycle instead of the earlier disabled-send behavior
- **AND** the input retains the placeholder `聊聊唐卡，或上传一张图片…` and helper `回答会区分数据库依据与通用知识。`.

#### Scenario: Inspect unavailable actions

- **WHEN** image selection is available in the conversation composer
- **THEN** the `上传图片` control opens the supported picker unless current draft preparation temporarily locks selection
- **AND** obsolete sending/upload-disabled notices are absent, contextual image processing/lifetime guidance appears with attachments, and source/copy actions remain unavailable.

#### Scenario: Disable sending when appropriate

- **WHEN** the draft has neither usable text nor a prepared image, image preparation is active, or one request is pending
- **THEN** send is disabled while text remains editable and next-image draft editing is allowed during an active POST
- **AND** the corresponding validation or pending state creates no duplicate message.

#### Scenario: Prepare and edit image drafts

- **WHEN** the visitor selects valid images or edits a next-image draft while a POST is pending
- **THEN** preparation feedback and accessible labelled remove controls preserve current draft text and image order
- **AND** pending request completion cannot replace the newer draft, and draft preparation cannot reintroduce removed images.

#### Scenario: Keep a four-image composer usable

- **WHEN** four previews are displayed at a mainstream mobile or reduced-height viewport
- **THEN** the preview panel is limited to 40 shared spacing units with internal vertical scrolling
- **AND** the message region, editable text, send/image controls and centered mobile footer remain reachable without page overflow.

### Requirement: Attachment image fallback

The system SHALL preserve any accompanying message text when a supplied image fails to load, and SHALL display a readable Chinese fallback including the affected image label, even for image-only turns. Image presentation SHALL be verified using synthetic test assets without introducing artwork or image placeholders on the empty home page.

#### Scenario: Image fails to load

- **WHEN** a supplied message image cannot be loaded
- **THEN** the message displays a readable unavailable-image fallback and retains any accompanying question and other valid images.
